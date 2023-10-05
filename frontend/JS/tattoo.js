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
        //seccion de tatuador
        const work_type = document.getElementById("work-type");
        const facebook = document.getElementById("facebook");
        const twitter = document.getElementById("twitter");
        const instagram = document.getElementById("instagram");
        const link = document.getElementById("link");

        // setting the data from session
        const {
          user: { user_metadata },
        } = JSON.parse(sessionStorage.getItem("user"));
        nombre.value = user_metadata.nombre;
        apellido.value = user_metadata.apellido;
        edad.value = user_metadata.edad;

        telefono.value = user_metadata.telefono ? user_metadata.telefono : "";
        provincia.value = user_metadata.provincia
          ? user_metadata.provincia
          : "";
        ciudad.value = user_metadata.ciudad ? user_metadata.ciudad : "";
        direccion.value = user_metadata.direccion
          ? user_metadata.direccion
          : "";
        profile.setAttribute("src", user_metadata.profile);
        work_type.value = user_metadata.work_type
          ? user_metadata.work_type
          : "";
        facebook.value = user_metadata.facebook ? user_metadata.facebook : "";
        twitter.value = user_metadata.twitter ? user_metadata.twitter : "";
        instagram.value = user_metadata.instagram
          ? user_metadata.instagram
          : "";
        link.value = user_metadata.link ? user_metadata.link : "";
      },
      handleSubmit(event) {
        event.preventDefault();
        const {
          user: { email },
        } = JSON.parse(sessionStorage.getItem("user"));
        let dataUpdate = {
          email,
          nombre: document.getElementById("name").value,
          apellido: document.getElementById("last-name").value,
          edad: document.getElementById("date").value,
          telefono: document.getElementById("phone").value,
          provincia: document.getElementById("province").value,
          ciudad: document.getElementById("city").value,
          direccion: document.getElementById("direction").value,
          work_type: document.getElementById("work-type").value,
          facebook: document.getElementById("facebook").value,
          twitter: document.getElementById("twitter").value,
          instagram: document.getElementById("instagram").value,
          link: document.getElementById("link").value,
        };

        App.methods.updateData(dataUpdate);
      },
    },
    methods: {
      async updateData(dataUpdate) {
        const session = JSON.parse(sessionStorage.getItem("user"));
        const { data } = await axios.post(
          "http://localhost:8080/updateuser",
          dataUpdate,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              refresh_token: session.refresh_token,
            },
          }
        );
        if (data.success) {
          App.methods.showMessageSuccess("Perfil actualizado correctamente!");
          App.methods.updateImg();
        } else App.methods.showMessageError("Error al actualizar el perfil");
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
      async updateImg() {
        const { access_token, refresh_token } = JSON.parse(
          sessionStorage.getItem("user")
        );

        const base64Data = await App.methods.getBase64FromSrc();

        await axios.post(
          "http://localhost:8080/updateuserimg",
          { imageData: base64Data },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              refresh_token: refresh_token,
            },
          }
        );
      },
      getBase64FromSrc() {
        const imageElement = document.getElementById("selected-image");
        const imageSrc = imageElement.src;

        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
              const base64Data = reader.result.split(",")[1];
              resolve(base64Data);
            };
            reader.readAsDataURL(xhr.response); // Directly pass xhr.response to readAsDataURL
          };
          xhr.open("GET", imageSrc);
          xhr.responseType = "blob";
          xhr.send();
        });
      },
    },
  };
  App.init();
})();
