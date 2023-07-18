import "../css/login.css";
import { useState } from "react";
import { instance } from "../utils/axios";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(loginData);
    instance
      .post("login", loginData)
      .then((rsp) => console.log(rsp))
      .catch((error) => console.log(error));
  };
  return (
    <div className="log">
      <div className="container">
        <div className="session">
          <h1>Bienvenido</h1>
          <form action="">
            <p>Correo Electrónico</p>
            <input
              type="email"
              name=""
              id="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
            <p>Contraseña</p>
            <input
              type="password"
              name=""
              id="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
            <br />
            <button
              type="submit"
              className="submit"
              onClick={(e) => handleSubmit(e)}
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
        <div className="pages">
          <p>
            ¿No tienes cuenta? <a href="/register">Registrarse</a>
          </p>
          <a href="/forgetpassword">¿Olvidaste tú contraseña?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
