import "../css/changepassword.css";

const ChangePasswordPage = () => {
  return (
    <div className="changepassword">
      <div className="container">
        <div className="session">
          <h1>Olvide mi contraseña</h1>
          <form action="">
            <p>Nueva Contraseña</p>
            <input type="password" name="" id="" required />
            <p>Confirmar Contraseña</p>
            <input type="password" name="" id="" required />
            <div>
              <button type="submit" className="submit">
                Listo
              </button>
            </div>
          </form>
        </div>
        <div className="pages"></div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
