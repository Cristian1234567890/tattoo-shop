const express = require("express");
const cors = require("cors");
const {} = require("./utils");
const { signIn, signUp, signOut } = require("./auth");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = 80;

app.use(cors());

app.post("/login", async (req, res) => {
  const loginData = await signIn(req.body);
  res.json(loginData);
});

app.post("/register", async (req, res) => {
  const registerData = await signUp(req.body);
  res.json(registerData);
});

app.post("/logout", async (req, res) => {
  const logout = await signOut();
  res.json(logout);
});

app.listen(PORT, () => {
  console.log(`Server está ejecutando en el puerto ${PORT}`);
});
