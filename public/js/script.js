document.addEventListener("DOMContentLoaded", () => {
  const authModal = document.getElementById("auth-modal");
  const userInfoContainer = document.getElementById("user-info");
  const userNameSpan = document.getElementById("user-name");
  const openAuthModalButton = document.getElementById("open-auth-modal");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleAuthButton = document.getElementById("toggle-auth");

  let isLoggedIn = false;

  if (openAuthModalButton) {
    openAuthModalButton.addEventListener("click", () => {
      if (!isLoggedIn) {
        authModal.style.display = "block";
      } else {
        userInfoContainer.style.display =
          userInfoContainer.style.display === "none" ? "block" : "none";
      }
    });
  }

  const closeAuthButton = document.querySelector(".close-auth");
  if (closeAuthButton) {
    closeAuthButton.addEventListener("click", () => {
      authModal.style.display = "none";
    });
  }

  window.onclick = (event) => {
    if (authModal && event.target === authModal) {
      authModal.style.display = "none";
    }
  };
  if (toggleAuthButton) {
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
  document.getElementById("login-button").addEventListener("click", () => {
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

  // Registro (Implementación opcional)
  const registerButton = document.getElementById("register-button");
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      const email = document.getElementById("register-email").value;
      const password = document.getElementById("register-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      fetch("http://127.0.0.1:5501/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((data) => alert(data))
        .catch((error) => console.error("Error:", error));
    });
  }

  // Cerrar sesión
  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      fetch("http://127.0.0.1:5501/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.text();
          } else {
            return response.json().then((err) => {
              throw new Error(err.message);
            });
          }
        })
        .then((message) => {
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

  const searchButton = document.getElementById("search-button");
  if (searchButton) {
    searchButton.addEventListener("click", searchBooks);
  }
});
