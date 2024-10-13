const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Connection = require("tedious").Connection;
const Request = require("tedious").Request;
const TYPES = require("tedious").TYPES;
const path = require("path");

const app = express();
const port = 5501;

app.use(cors());
app.use(bodyParser.json());
const config = {
  server: "BEARERLB",
  authentication: {
    type: "default",
    options: {
      userName: "luisconexion",
      password: "administrador",
    },
  },
  options: {
    port: 1433,
    database: "project",
    trustServerCertificate: true,
  },
};

app.use(express.static(path.join(__dirname, "public")));

app.get("/t", (req, res) => {
  return res.send("testing");
});

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const connection = new Connection(config);
  connection.connect((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error al conectarse a la base de datos." });
    }

    const request = new Request(
      `SELECT * FROM usuarios WHERE email = @Email AND password = @Password`,
      (err, rowCount) => {
        connection.close();
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error en la consulta." });
        }
        if (rowCount === 0) {
          return res.status(401).json({ message: "Credenciales inválidas." });
        }

        return res.json({ message: "Inicio de sesión exitoso.", email });
      }
    );

    request.addParameter("Email", TYPES.VarChar, email);
    request.addParameter("Password", TYPES.VarChar, password);

    connection.execSql(request);
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
