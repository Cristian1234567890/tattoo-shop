import logo from "../img/Tattoo Machine Rotary.png";

const HeaderMain = () => {
  return (
    <nav className="menu">
      <div className="start">
        <a id="logo" href="#">
          <img src={logo} alt="" />
          <h1 id="title">Tootienda</h1>
        </a>
      </div>
      <div className="center">
        <a id="presentacion" href="">
          Beneficios
        </a>
        <a id="presentacion" href="">
          Precios
        </a>
        <a id="presentacion" href="">
          Sobre Nosotros
        </a>
      </div>
      <div className="end">
        <a href="/login">
          <button id="log-in">Iniciar Sesión</button>
        </a>
        <a href="/register">
          <button id="log-out">Registrarse</button>
        </a>
      </div>
    </nav>
  );
};

export default HeaderMain;
