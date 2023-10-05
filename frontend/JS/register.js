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
              } else {
                App.methods.showMessageError(rsp.error.message);
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
              // guarda session en sessionStorage
              App.methods.saveSession(rsp.data);
              // registra metodo de auth multi factor
              App.methods.enroll2FA();
            } else {
              App.methods.showMessageError(rsp.error.message);
            }
          });
      },
    },
    methods: {
      async register(email, password, nombre, apellido, edad, tipo) {
        try {
          const { data } = await axios.post("http://localhost:8080/register", {
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
          App.methods.showMessageError("Error al registrar usuario");
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
        //Hacer que el codigo se le envie al usuario por correo para que pueda atenticarse
        const ventanaQR = document.getElementById("ventanaQR");
        if (ventanaQR) {
          ventanaQR.style.display = "none";
        }
        const selectedOption = document.getElementById("options").value;

        // Mostrar mensaje solo si la opción seleccionada es "opcion2"
        if (selectedOption === "Tatuador") {
          // pago con paypal
          App.methods.createPaypalSubscription().then((created) => {
            if (created) {
              App.methods.renderPaypalButtons();
            }
          });
        } else {
          window.location.href = "../Pages/User Screen/user.html";
        }
      },
      async enroll2FA() {
        try {
          const { session } = JSON.parse(sessionStorage.getItem("user"));
          const { data } = await axios.post(
            "http://localhost:8080/enroll",
            {},
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                refresh_token: session.refresh_token,
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
          App.methods.showMessageError("Error al registrar 2FA");
        }
      },
      async createPaypalSubscription() {
        try {
          const { session, user } = JSON.parse(sessionStorage.getItem("user"));

          const { data: product_data } = await axios.post(
            "http://localhost:8080/createproduct"
          );
          const { data: subscription_data } = await axios.post(
            "http://localhost:8080/subscribe",
            {
              id: product_data.id,
              name: product_data.name,
              description: product_data.description,
            }
          );
          const { data } = await axios.post(
            "http://localhost:8080/usersubscription",
            {
              id: user.id,
              product_id: subscription_data.product_id,
              subscription_id: subscription_data.id,
            },
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                refresh_token: session.refresh_token,
              },
            }
          );
          if (data.success) return true;

          console.log(data.error);
          return false;
        } catch (error) {
          console.log(error);
          App.methods.showMessageError("Error al crear plan de subscripción");
          return false;
        }
      },
      renderPaypalButtons() {
        const { session, user } = JSON.parse(sessionStorage.getItem("user"));

        axios
          .get(`http://localhost:8080/usersubscription/${user.id}`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              refresh_token: session.refresh_token,
            },
          })
          .then(({ data: { data: usersubscription } }) => {
            console.log(usersubscription);
            const paypal_button_container = document.getElementById(
              "paypal-button-container"
            );
            paypal_button_container.style.display = "block";
            paypal
              .Buttons({
                createSubscription: function (data, actions) {
                  return actions.subscription.create({
                    plan_id: usersubscription[0].subscription_id, // Creates the subscription
                  });
                },
                onApprove: function (data, actions) {
                  paypal_button_container.style.display = "none";
                  App.methods.showMessageSuccess(
                    "Te haz subscrito correctamente al plan con ID: " +
                      data.subscriptionID
                  );
                },
                onError(err) {
                  // For example, redirect to a specific error page
                  console.log(err);
                },
              })
              .render("#paypal-button-container"); // Renders the PayPal button
          })
          .catch((error) => {
            console.log(error);
            App.methods.showMessageError(
              "Error al consultar datos de la subscripcion"
            );
          });
      },
      showMessageSuccess(message) {
        Swal.fire({
          title: message,
          icon: "success",
          confirmButtonText: "Ok",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "../Pages/login.html";
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
