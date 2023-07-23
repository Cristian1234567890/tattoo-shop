const express = require("express");
const cors = require("cors");
const {} = require("./utils");
const {
  signIn,
  signUp,
  signOut,
  enroll2FA,
  verify2FA,
  updateUser,
  updateUserImg,
} = require("./auth");
const { subscription, createProduct } = require("./paypal");
const {
  insertUserSubscription,
  getUserSubscription,
} = require("./user-subscription");
const galeria = require("./gallery")

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
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

app.post("/updateuser", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const data = await updateUser(req.body, token, refresh);
  res.json(data);
});

app.post("/updateuserimg", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const data = await updateUserImg(req.body, token, refresh);
  res.json(data);
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

app.post("/createproduct", async (req, res) => {
  const product = await createProduct(req, res);
  res.json(product);
});

app.post("/subscribe", async (req, res) => {
  const subscribe = await subscription(req.body);
  res.json(subscribe);
});

// user_subscription table
app.get("/usersubscription/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const data = await getUserSubscription(token, refresh, id);
  res.json(data);
});
app.post("/usersubscription", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const data = await insertUserSubscription(token, refresh, req.body);
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server está ejecutando en el puerto ${PORT}`);
});

/* Lista de galeria  */
app.get("/galeria/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const data = await galeria.getListFromClient(token, refresh, id);
  res.json(data);
});

/* Upload a galeria  */
app.get("/galeria/cargar/:id", async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization.split(" ")[1];
  const refresh = req.headers.refresh_token;
  const img = req.body
  const data = await galeria.postImage(token, refresh, id, img);
  res.json(data);
});
