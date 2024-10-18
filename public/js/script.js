document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("auth-modal");
  const userInfoContainer = document.getElementById("user-info");
  const userNameSpan = document.getElementById("user-name");
  const openAuthModalButton = document.getElementById("open-auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuthButton = document.getElementById("toggle-auth");
  let isLoggedIn = false;

  // Verificar que openAuthModalButton existe antes de agregar el listener
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
          authModal.style.display = "none";
          openAuthModalButton.textContent = data.email;
          userInfoContainer.style.display = "block";
          userNameSpan.textContent = data.email;
          isLoggedIn = true;
        })
        .catch((error) => alert(error.message));
    });
  }

  // Registro (Implementación opcional)
  const registerButton = document.getElementById("register-button");
if (registerButton) {
  registerButton.addEventListener("click", () => {
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();

    // Validar que los campos no estén vacíos
    if (!email || !password || !confirmPassword) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Realizar la petición al servidor
    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, confirmPassword }), // Incluye confirmPassword si es necesario
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Cambia a JSON porque tu respuesta es en este formato
        } else {
          return response.json().then((err) => {
            throw new Error(err.message); // Lanza el error con el mensaje del servidor
          });
        }
      })
      .then((data) => {
        alert(data.message); // Muestra el mensaje de la respuesta
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error en el registro: " + error.message);
      });
  });
}

  // Cerrar sesión
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton && openAuthModalButton && userInfoContainer) {
    logoutButton.addEventListener("click", () => {
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();  // Siempre esperamos JSON como respuesta
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((data) => {
          console.log(data.message);  // Puedes ver el mensaje en la consola
          userInfoContainer.style.display = "none";
          openAuthModalButton.textContent = "👤";
          isLoggedIn = false;
        })
        .catch((error) => {
          console.error("Error al cerrar sesión:", error);
          alert("Error al cerrar sesión");
        });
    });
  }

  // Búsqueda de libros
  function searchBooks() {
    const searchInput = document.getElementById("search").value.toLowerCase();
    const books = document.querySelectorAll(".book");

    books.forEach((book) => {
      const title = book.getAttribute("data-title").toLowerCase();
      if (title.includes(searchInput)) {
        book.style.display = "";
      } else {
        book.style.display = "none";
      }
    });
  }

  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.addEventListener("click", searchBooks);
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
          document.getElementById("book-summary").innerHTML = data;
          document.getElementById("book-modal").style.display = "block";
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("No se pudo cargar el contenido del libro.");
        });
    }
  };
});
