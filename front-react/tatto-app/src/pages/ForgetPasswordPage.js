import "../css/forgetpassword.css";

const ForgetPasswordPage = () => {
  return (
    <div className="forgetpassword">
      <div className="container">
        <div className="session">
          <h1>Olvide mi contraseña</h1>
          <form action="">
            <p>Correo Electrónico</p>
            <input type="email" name="" id="" required />
            <div>
              <button type="submit" className="submit">
                Enviar
              </button>
            </div>
          </form>
        </div>
        <div className="pages">
          <p>¿Estás registrado?</p>
          <a href="/register">Registrarse</a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
