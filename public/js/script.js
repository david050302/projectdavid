document.addEventListener("DOMContentLoaded", async () => {
  const authModal = document.getElementById("auth-modal");
  const userInfoContainer = document.getElementById("user-info");
  const userNameSpan = document.getElementById("user-name");
  const openAuthModalButton = document.getElementById("open-auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuthButton = document.getElementById("toggle-auth");
  const bookModal = document.getElementById("book-modal");
  const bookSummary = document.getElementById("book-summary");
  const closeModalButton = document.querySelector(".close");
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  let isLoggedIn = false;

  const user = JSON.parse(localStorage.getItem("user"));

  console.log("cargo la pagina");

  // Verificar si el usuario está autenticado al cargar la página

  // Abrir modal de autenticación o mostrar menú de usuario
  if (openAuthModalButton && userInfoContainer) {
    openAuthModalButton.addEventListener("click", () => {
      if (!isLoggedIn) {
        authModal.style.display = "block";
      } else {
        userInfoContainer.style.display =
          userInfoContainer.style.display === "none" ? "block" : "none";
      }
    });
  }

  // Cerrar modal de autenticación
  const closeAuthButton = document.querySelector(".close-auth");
  if (closeAuthButton && authModal) {
    closeAuthButton.addEventListener("click", () => {
      authModal.style.display = "none";
    });
  }

  window.onclick = (event) => {
    if (authModal && event.target === authModal) {
      authModal.style.display = "none";
    }
    if (bookModal && event.target === bookModal) {
      bookModal.style.display = "none";
    }
  };

  // Alternar entre iniciar sesión y registro
  if (toggleAuthButton && loginForm && registerForm) {
    toggleAuthButton.addEventListener("click", () => {
      if (loginForm.style.display === "none") {
        loginForm.style.display = "flex";
        registerForm.style.display = "none";
        toggleAuthButton.textContent = "Registro";
      } else {
        loginForm.style.display = "none";
        registerForm.style.display = "flex";
        toggleAuthButton.textContent = "Iniciar Sesión";
      }
    });
  }

  // Inicio de sesión
  const loginButton = document.getElementById("login-button");
  if (loginButton && openAuthModalButton && userInfoContainer && userNameSpan) {
    loginButton.addEventListener("click", () => {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((data) => {
          console.log(data);
          //localstorage
          localStorage.setItem("user", JSON.stringify(data));
          //localStorage.setItem("user_id", data.id_user);
          authModal.style.display = "none";
          openAuthModalButton.textContent = data.email;
          userInfoContainer.style.display = "block";
          userNameSpan.textContent = data.email;
          isLoggedIn = true;
        })
        .catch((error) => alert(error.message));
    });
  }

  // Registro de usuario
  const registerButton = document.getElementById("register-button");
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      const email = document.getElementById("register-email").value.trim();
      const password = document
        .getElementById("register-password")
        .value.trim();
      const confirmPassword = document
        .getElementById("confirm-password")
        .value.trim();

      if (!email || !password || !confirmPassword) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, confirmPassword }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((data) => {
          alert(data.message);
          //TODO: ocultar modal
          //TODO: redirigir al modal de inici de sesion
          //TODO: loguearte de frente
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error en el registro: " + error.message);
        });
    });
  }

  // Cerrar sesión
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
      location.reload();
    });
  }

  // Cargar contenido del libro
  window.loadContent = function (bookId) {
    if (bookId) {
      fetch("/pages/" + bookId + ".html")
        .then((response) => {
          if (!response.ok) {
            throw new Error("No se pudo cargar el contenido.");
          }
          return response.text();
        })
        .then((data) => {
          bookSummary.innerHTML = data;
          bookModal.style.display = "block";

          const user = JSON.parse(localStorage.getItem("user"));
          // Cargar comentarios del libro
          fetch(`/comments/${bookId}`)
            .then((response) => response.json())
            .then((data) => {
              commentsList.innerHTML = "";
              data.comments.forEach((comment) => {
                const userEmail =
                  comment.user_id == user.id_user
                    ? user.email
                    : "Usuario desconocido";
                const commentText = comment.comment || "Comentario vacío";
                const commentItem = document.createElement("div");
                commentItem.classList.add("comment-item");
                commentItem.textContent = `${userEmail}: ${commentText}`;
                console.log(`Añadiendo comentario: ${commentItem.textContent}`);
                commentsList.appendChild(commentItem);
              });

              document.getElementById("book-id").value = bookId;
              //console.log("Comentarios procesados:", comments);
            })
            .catch((error) => {
              console.error("Error al cargar comentarios:", error);
              alert("No se pudieron cargar los comentarios.");
            });
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("No se pudo cargar el contenido del libro.");
        });
    }
  };

  // Cerrar modal de libro
  if (closeModalButton) {
    closeModalButton.addEventListener("click", () => {
      bookModal.style.display = "none";
    });
  }

  // Enviar un nuevo comentario
  if (commentForm) {
    commentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const commentInput = document.getElementById("commentInput");
      const commentText = commentInput.value.trim();
      const bookId = document.getElementById("book-id").value;

      if (!isLoggedIn) {
        alert("Debes iniciar sesión para comentar.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));

      if (commentText) {
        fetch("/add-comment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            book_id: bookId,
            comment: commentText,
            user_id: user.id_user,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            const commentItem = document.createElement("div");
            commentItem.classList.add("comment-item");
            commentItem.textContent = `${user.email}: ${data.comment}`;
            commentsList.appendChild(commentItem);
            commentInput.value = "";
          })
          .catch((error) => {
            console.error("Error al enviar el comentario:", error);
            alert("No se pudo enviar el comentario.");
          });
      }
    });
  }

  if (user) {
    fetch("/check-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        //localstorage
        localStorage.setItem("user", JSON.stringify(data));
        //localStorage.setItem("user_id", data.id_user);
        authModal.style.display = "none";
        openAuthModalButton.textContent = data.email;
        userInfoContainer.style.display = "block";
        userNameSpan.textContent = data.email;
        isLoggedIn = true;
      })
      .catch((err) => console.error("Error al verificar sesión:", err));
  }
});
