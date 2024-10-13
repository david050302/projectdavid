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

    return res.json({ message: "Inicio de sesión exitoso.", email });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
