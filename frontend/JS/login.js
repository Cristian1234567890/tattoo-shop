(() => {
  const App = {
    htmlElements: {
      btnSubmit: document.getElementById("btn-submit"),
      btnValidar: document.getElementById("btn-validar"),
    },
    init() {
      App.htmlElements.btnSubmit.addEventListener(
        "click",
        App.handlers.handleClickLogin
      );
      App.htmlElements.btnValidar.addEventListener(
        "click",
        App.handlers.handleValidate2FA
      );
    },
    handlers: {
      handleClickLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        App.methods.login(email, password).then((rsp) => {
          if (rsp.success) {
            App.methods.saveSession(rsp.data);
            const mensajeEmergente =
              document.getElementById("mensajeEmergente");
            mensajeEmergente.style.display = "block";
          }
        });
      },
      handleValidate2FA() {
        const code = document.getElementById("code").value;
        App.methods.validate2FA(code);
      },
    },
    methods: {
      async login(email, password) {
        try {
          const { data } = await axios.post("http://localhost:80/login", {
            email: email,
            password: password,
          });
          return data;
        } catch (error) {
          console.log(error);
          App.methods.showMessageError(
            "Error al iniciar sesión con credenciales"
          );
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
      async validate2FA(code) {
        try {
          const { session, user } = JSON.parse(sessionStorage.getItem("user"));
          const { data } = await axios.post(
            "http://localhost:80/verify2fa",
            {
              factorId: user.factors[0].id,
              code,
            },
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                refresh: session.refresh_token,
              },
            }
          );
          if (data.success) {
            App.methods.saveSession(data.data);
            App.methods.showMessageSuccess("Sesión establecida correctamente!");
          } else {
            console.log(data.error);
            App.methods.ocultarMensaje();
          }
        } catch (error) {
          console.log(error);
          App.methods.showMessageError("Error al verificar 2FA");
        }
      },
      showMessageSuccess(message) {
        Swal.fire({
          title: message,
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/frontend/Pages/User Screen/user.html";
          }
        });
      },
      showMessageError(message) {
        Swal.fire({
          title: message,
          icon: "error",
          confirmButtonText: "Ok",
        });
      },
    },
  };
  App.init();
})();
