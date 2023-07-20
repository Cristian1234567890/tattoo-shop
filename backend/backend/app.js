const express = require("express");
const cors = require("cors");
const {} = require("./utils");
const { signIn, signUp, signOut, enroll2FA, verify2FA } = require("./auth");

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

app.post("/enroll", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const enroll = await enroll2FA(token, refresh);
  res.json(enroll);
});

app.post("/verify2fa", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const verify = await verify2FA(req.body, token, refresh);
  res.json(verify);
});

app.listen(PORT, () => {
  console.log(`Server está ejecutando en el puerto ${PORT}`);
});
