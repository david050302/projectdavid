const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const app = express();
const port = 5501;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const connection = mysql.createConnection({
  host: "autorack.proxy.rlwy.net", // Host
  port: 10021, // Puerto
  user: "root", // Usuario
  password: "fBYJeGsLeMJHHtENZKkJJqtWTnHVLAhj", // Contraseña
  database: "railway", // Base de datos
  // Opciones adicionales
  ssl: {
    rejectUnauthorized: false, // Asegúrate de esto dependiendo de tu entorno
  },
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error("Error al conectarse a la base de datos: ", err);
    return;
  }
  console.log("Conexión a la base de datos MySQL establecida.");
});

app.get("/t", (req, res) => {
  return res.send("testing");
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});
app.post("/register", (req, res) => {
  const { email, password, confirmPassword } = req.body;

  // Verificar si las contraseñas coinciden
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Las contraseñas no coinciden." });
  }

  // Consulta para verificar si el email ya está registrado
  const checkUserQuery = `SELECT * FROM usuarios WHERE email = ?`;

  connection.execute(checkUserQuery, [email], (err, results) => {
    if (err) {
      console.error("Error en la consulta: ", err);
      return res.status(500).json({ message: "Error en la consulta." });
    }

    // Si el usuario ya existe
    if (results.length > 0) {
      return res.status(209).json({ message: "El correo ya está registrado." });
    }

    // Consulta para insertar el nuevo usuario
    const insertUserQuery = `INSERT INTO usuarios (email, password) VALUES (?, ?)`;

    connection.execute(insertUserQuery, [email, password], (err, result) => {
      if (err) {
        console.error("Error al registrar el usuario: ", err);
        return res
          .status(500)
          .json({ message: "Error al registrar el usuario." });
      }

      return res.json({ message: "Registro exitoso.", email });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Consulta para verificar credenciales
  const query = `SELECT * FROM usuarios WHERE email = ? AND password = ?`;

  connection.execute(query, [email, password], (err, results) => {
    if (err) {
      console.error("Error en la consulta: ", err);
      return res.status(500).json({ message: "Error en la consulta." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    return res.json({
      message: "Inicio de sesión exitoso.",
      email,
      id_user: results[0]["id"],
    });
  });
});

app.post("/check-session", (req, res) => {
  const { email, id_user } = req.body;

  const query = `SELECT * FROM usuarios WHERE email = ? AND id = ?`;

  connection.execute(query, [email, id_user], (err, results) => {
    if (err) {
      console.error("Error en la consulta: ", err);
      return res.status(500).json({ message: "Error en la consulta." });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas." });
    }

    return res.json({
      message: "Inicio de sesión exitoso.",
      email,
      id_user: results[0]["id"],
    });
  });
});

app.post("/logout", (req, res) => {
  // Destruir la sesión del usuario o limpiar las cookies si las usas
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.clearCookie("connect.sid"); // O el nombre de la cookie de sesión si usas sesiones
    return res.json({ message: "sesión cerrada correctamente" });
  });
});

app.post("/add-comment", (req, res) => {
  const { book_id, user_id, comment } = req.body;

  const query = `INSERT INTO comments (book_id, user_id, comment) VALUES (?, ?, ?)`;

  connection.execute(query, [book_id, user_id, comment], (err, result) => {
    if (err) {
      console.error("Error al agregar el comentario:", err);
      return res
        .status(500)
        .json({ message: "Error al agregar el comentario." });
    }
    return res
      .status(200)
      .json({ message: "Comentario agregado exitosamente.", comment: comment });
  });
});

app.get("/comments/:book_id", (req, res) => {
  const { book_id } = req.params; // Obtener el ID del libro desde los parámetros de la URL
  // Consulta SQL para obtener los comentarios del libro
  //TODO: agregar inner join
  const getCommentsQuery = `SELECT * FROM comments WHERE book_id = ? ORDER BY created_at DESC`;

  connection.execute(getCommentsQuery, [book_id], (err, results) => {
    if (err) {
      console.error("Error al obtener los comentarios:", err);
      return res
        .status(500)
        .json({ message: "Error al obtener los comentarios." });
    }

    // Si no hay comentarios, devolvemos un array vacío
    return res.status(200).json({ comments: results });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
