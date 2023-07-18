import "../css/register.css";
import { useState } from "react";
import { instance } from "../utils/axios";

const RegisterPage = () => {
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    edad: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(registerData);
    instance
      .post("register", registerData)
      .then((rsp) => console.log(rsp))
      .catch((error) => console.log(error));
  };
  return (
    <div className="register">
      <div className="container">
        <div className="session">
          <h1>Registarse</h1>
          <form action="">
            <div className="log">
              <p>Nombre</p>
              <input
                type="text"
                name=""
                id="name"
                value={registerData.nombre}
                onChange={(e) =>
                  setRegisterData({ ...registerData, nombre: e.target.value })
                }
              />
              <p>Apellido</p>
              <input
                type="text"
                name=""
                id="name"
                value={registerData.apellido}
                onChange={(e) =>
                  setRegisterData({ ...registerData, apellido: e.target.value })
                }
              />
              <p>Edad</p>
              <input
                type="date"
                name=""
                id=""
                value={registerData.edad}
                onChange={(e) =>
                  setRegisterData({ ...registerData, edad: e.target.value })
                }
              />
              <p>Correo Electrónico</p>
              <input
                type="email"
                name=""
                id=""
                required
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
              <p>Contraseña</p>
              <input
                type="password"
                name=""
                id=""
                required
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
              <p>Confirmar Contraseña</p>
              <input type="password" name="" id="" required />
            </div>
            <button
              type="submit"
              className="submit"
              onClick={(e) => handleSubmit(e)}
            >
              Registrar
            </button>
          </form>
        </div>
        <div className="pages">
          <p>¿Ya estás registrado?</p>
          <a href="/login">Iniciar Sesión</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
