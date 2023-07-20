(() => {
  const App = {
    htmlElements: {
      userForm: document.getElementById("createUserForm"),
      btnContinuar: document.getElementById("btn-continuar"),
      btnNoContinuar: document.getElementById("btn-no-continuar"),
      btnSalir: document.getElementById("btn-salir"),
    },
    init() {
      App.htmlElements.userForm.addEventListener(
        "submit",
        App.handlers.handleSubmit
      );
      App.htmlElements.btnNoContinuar.addEventListener(
        "click",
        App.handlers.handleNoContinuar
      );
      App.htmlElements.btnContinuar.addEventListener(
        "click",
        App.handlers.handleContinuar
      );
      App.htmlElements.btnSalir.addEventListener(
        "click",
        App.handlers.handleSalir
      );
    },
    handlers: {
      handleSubmit(event) {
        event.preventDefault(); // Evita que el formulario se envíe y la página se refresque

        const selectedOption = document.getElementById("options").value;

        // Mostrar mensaje solo si la opción seleccionada es "opcion2"
        if (selectedOption === "Tatuador") {
          const mensajeEmergente = document.getElementById("mensajeEmergente");
          mensajeEmergente.style.display = "block";
        } else {
          const email = document.getElementsByName("email")[0].value;
          const password = document.getElementsByName("password")[0].value;
          const nombre = document.getElementsByName("nombre")[0].value;
          const apellido = document.getElementsByName("apellido")[0].value;
          const edad = document.getElementsByName("edad")[0].value;
          const tipo = document.getElementsByName("tipo")[0].value;
          App.methods
            .register(email, password, nombre, apellido, edad, tipo)
            .then((rsp) => {
              if (rsp.success) {
                App.methods.saveSession(rsp.data);
                App.methods.enroll2FA();
              }
            });
        }
      },
      handleNoContinuar(event) {
        event.preventDefault();
        App.methods.ocultarMensaje();
      },
      handleSalir(event) {
        event.preventDefault();
        App.methods.ocultarQR();
      },
      handleContinuar(event) {
        event.preventDefault();
        App.methods.ocultarMensaje();
        const email = document.getElementsByName("email")[0].value;
        const password = document.getElementsByName("password")[0].value;
        const nombre = document.getElementsByName("nombre")[0].value;
        const apellido = document.getElementsByName("apellido")[0].value;
        const edad = document.getElementsByName("edad")[0].value;
        const tipo = document.getElementsByName("tipo")[0].value;
        App.methods
          .register(email, password, nombre, apellido, edad, tipo)
          .then((rsp) => {
            if (rsp.success) {
              App.methods.saveSession(rsp.data);
              App.methods.enroll2FA();
            }
          });
      },
    },
    methods: {
      async register(email, password, nombre, apellido, edad, tipo) {
        try {
          const { data } = await axios.post("http://localhost:80/register", {
            email,
            password,
            nombre,
            apellido,
            edad,
            tipo,
          });
          return data;
        } catch (error) {
          console.log(error);
        }
      },
      saveSession(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
      },
      ocultarMensaje() {
        const mensajeEmergente = document.getElementById("mensajeEmergente");
        if (mensajeEmergente) {
          mensajeEmergente.style.display = "none";
        }
      },
      ocultarQR() {
        const ventanaQR = document.getElementById("ventanaQR");
        if (ventanaQR) {
          ventanaQR.style.display = "none";
        }
        window.location.href = "/frontend/Pages/User Screen/user.html";
      },
      async enroll2FA() {
        try {
          const { session } = JSON.parse(sessionStorage.getItem("user"));
          const { data } = await axios.post(
            "http://localhost:80/enroll",
            {},
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                refresh: session.refresh_token,
              },
            }
          );
          if (data.success) {
            const img = document.getElementById("qr");
            img.src = data.data.totp.qr_code;
            const ventanaQR = document.getElementById("ventanaQR");
            ventanaQR.style.display = "block";
          } else console.log(data.error);
        } catch (error) {
          console.log(error);
        }
      },
    },
  };
  App.init();
})();
