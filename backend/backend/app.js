const express = require("express");
const {} = require("./utils");
const { signIn } = require("./auth");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const PORT = 80;

app.post("/login", async (req, res) => {
  const loginData = await signIn(req.body);
  if (loginData.success == false) {
    res.status(500).json({ message: "Error al iniciar sessión" });
  } else {
    res.json(loginData);
  }
});

app.use(function (req, res, next) {
  req.setTimeout(120000);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, OPTIONS, POST, PATCH, DELETE"
  );
  return next();
});

app.listen(PORT, () => {
  console.log(`Server está ejecutando en el puerto ${PORT}`);
});
