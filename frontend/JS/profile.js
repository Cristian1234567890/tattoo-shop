(() => {
  const App = {
    htmlElements: {
      filtInput: document.getElementById("file-input"),
      submit: document.getElementById("submit"),
    },
    init() {
      App.htmlElements.filtInput.addEventListener(
        "change",
        App.handlers.handleSetImg
      );
      App.htmlElements.submit.addEventListener(
        "click",
        App.handlers.handleSubmit
      );
      document.addEventListener("DOMContentLoaded", App.handlers.handleSetData);
    },
    handlers: {
      handleSetImg(event) {
        var file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
          var reader = new FileReader();
          reader.onload = function () {
            var image = document.getElementById("selected-image");
            image.src = reader.result;
            document.getElementById("image-container").style.display = "block";
          };
          reader.readAsDataURL(file);
        }
      },
      handleSetData(event) {
        event.preventDefault();
        const nombre = document.getElementById("name");
        const apellido = document.getElementById("last-name");
        const edad = document.getElementById("date");
        const telefono = document.getElementById("phone");
        const provincia = document.getElementById("province");
        const ciudad = document.getElementById("city");
        const direccion = document.getElementById("direction");
        const profile = document.getElementById("profile-img");
        // setting the data from session
        const {
          user: { user_metadata },
        } = JSON.parse(sessionStorage.getItem("user"));
        nombre.value = user_metadata.nombre;
        apellido.value = user_metadata.apellido;
        edad.value = user_metadata.edad;

        telefono.value = user_metadata.telefono;
        provincia.value = user_metadata.provincia;
        ciudad.value = user_metadata.ciudad;
        direccion.value = user_metadata.direccion;
        profile.setAttribute("src", user_metadata.profile);
      },
      handleSubmit(event) {
        event.preventDefault();
        const dataUpdate = {
          nombre: document.getElementById("name").value,
          apellido: document.getElementById("last-name").value,
          edad: document.getElementById("date").value,
          telefono: document.getElementById("phone").value,
          provincia: document.getElementById("province").value,
          ciudad: document.getElementById("city").value,
          direccion: document.getElementById("direction").value,
        };
        App.methods.updateData(dataUpdate);
      },
    },
    methods: {
      async updateData(dataUpdate) {
        const session = JSON.parse(sessionStorage.getItem("user"));
        const { data } = await axios.post(
          "http://localhost:80/updateuser",
          dataUpdate,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              refresh_token: session.refresh_token,
            },
          }
        );
        if (data.success)
          App.methods.showMessageSuccess("Perfil actualizado correctamente!");
        else App.methods.showMessageError("Error al actualizar el perfil");
      },
      showMessageSuccess(message) {
        Swal.fire({
          title: message,
          icon: "success",
          confirmButtonText: "Ok",
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