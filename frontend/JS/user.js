(() => {
  const App = {
    htmlElements: {
      menuToggle: document.querySelector(".menu-toggle"),
      menu: document.querySelector(".menu"),
      logoutBtn: document.getElementById("logout"),
    },
    init() {
      App.htmlElements.menuToggle.addEventListener("click", function () {
        App.htmlElements.menu.classList.toggle("open");
      });
      document.addEventListener("click", function (event) {
        if (
          !App.htmlElements.menu.contains(event.target) &&
          !App.htmlElements.menuToggle.contains(event.target)
        ) {
          App.htmlElements.menu.classList.remove("open");
        }
      });
      App.htmlElements.logoutBtn.addEventListener(
        "click",
        App.handler.handleLogout
      );
      document.addEventListener("DOMContentLoaded", App.handler.handleSetData);
    },
    handler: {
      handleLogout() {
        App.methods.logout();
      },
      handleSetData(event) {
        event.preventDefault();
        const profile_link = document.getElementById("profile-link");
        const menu_profile = document.getElementById("menu-profile-pic");
        const name_tag = document.getElementById("name_tag");
        // setting the data from session
        const {
          user: { user_metadata },
        } = JSON.parse(sessionStorage.getItem("user"));

        profile_link.setAttribute(
          "href",
          user_metadata.tipo === "Cliente"
            ? " /frontend/Pages/User Screen/profile.html"
            : "/frontend/Pages/User Screen/tattoo.html"
        );
        menu_profile.setAttribute("src", user_metadata.profile);
        name_tag.textContent = `${user_metadata.nombre} ${user_metadata.apellido}`;
        App.methods.renderCards();
      },
    },
    methods: {
      async logout() {
        try {
          const session = JSON.parse(sessionStorage.getItem("user"));
          const { data } = await axios.post(
            "http://localhost:80/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
                refresh_token: session.refresh_token,
              },
            }
          );
          console.log(data);
          sessionStorage.setItem("user", JSON.stringify({}));
        } catch (error) {
          console.log(error);
        }
      },
      renderCards() {
        const session = JSON.parse(sessionStorage.getItem("user"));
        axios
          .get(`http://localhost:80/gettatto`, {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              refresh_token: session.refresh_token,
            },
          })
          .then(({ data }) => {
            if (data.success) {
              const container = document.getElementById("card-container");
              const cards = data.data;
              const tempDiv = document.createElement("div");
              tempDiv.classList.add("wrapper");
              for (let i = 0; i < cards.length; i++) {
                const card_data = cards[i].data;
                // Create a temporary div element to hold the HTML content
                console.log(card_data);
                tempDiv.innerHTML += `
          <div class="profile-card js-profile-card">
            <div class="profile-card__img">
              <img src="${card_data.profile}" alt="profile card" id="profile-img"">
                  </div>
              
                  <div class=" profile-card__cnt js-profile-cnt">
              <div class="profile-card__name" id="name">${card_data.nombre} ${card_data.apellido}</div>
              <div class="profile-card__txt">Tatuador ubicado en: <strong id="address">${card_data.provincia}, ${card_data.ciudad}</strong>
              </div>

              <div class="profile-card-inf">
                <div class="profile-card-inf__item">
                  <div class="profile-card-inf__title">1598</div>
                  <div class="profile-card-inf__txt">Seguidores</div>
                </div>

                <div class="profile-card-inf__item">
                  <div class="profile-card-inf__title">65</div>
                  <div class="profile-card-inf__txt">Siguiendo</div>
                </div>

                <div class="profile-card-inf__item">
                  <div class="profile-card-inf__title">${card_data.work_type}</div>
                  <div class="profile-card-inf__txt">Tipo de Trabajo</div>
                </div>

                <div class="profile-card-inf__item">
                  <div class="profile-card-inf__title">85</div>
                  <div class="profile-card-inf__txt">Trabajos</div>
                </div>
              </div>

              <div class="profile-card-social">
                <a href="#" class="profile-card-social__item facebook" target="_blank">
                  <span class="icon-font">
                    <svg class="icon">
                      <use xlink:href="#icon-facebook"></use>
                    </svg>
                  </span>
                </a>

                <a href="#" class="profile-card-social__item twitter" target="_blank">
                  <span class="icon-font">
                    <svg class="icon">
                      <use xlink:href="#icon-twitter"></use>
                    </svg>
                  </span>
                </a>

                <a href="#" class="profile-card-social__item instagram" target="_blank">
                  <span class="icon-font">
                    <svg class="icon">
                      <use xlink:href="#icon-instagram"></use>
                    </svg>
                  </span>
                </a>

                <a href="#" class="profile-card-social__item link" target="_blank">
                  <span class="icon-font">
                    <svg class="icon">
                      <use xlink:href="#icon-link"></use>
                    </svg>
                  </span>
                </a>
              </div>

              <div class="profile-card-ctr">
                <button class="profile-card__button button--blue js-message-btn">Mensaje</button>
                <button class="profile-card__button button--orange">Seguir</button>
              </div>
            </div>

            <div class="profile-card-message js-message">
              <form class="profile-card-form">
                <div class="profile-card-form__container">
                  <textarea placeholder="¿Qué quisieras hacerte?"></textarea>
                </div>
                <hr>
                <div class="dragdrop">
                  <div class="draggable" draggable="true">Ingresa un ejemplo de tatuaje ⤵️</div>
                  <div class="droppable">Suelta aquí</div>
                </div>
                <div class="upload">
                  <!-- <button>Subir foto</button> -->
                  <input type="file" accept="image/*" id="file-input">
                  <div id="image-container">
                    <img id="selected-image" src="" alt="Imagen seleccionada">
                  </div>
                </div>
                <hr>
                <div class="profile-card-form__bottom">
                  <button class="profile-card__button button--blue js-message-close">
                    Enviar
                  </button>
                  <button class="profile-card__button button--gray js-message-close">
                    Cancelar
                  </button>
                </div>
              </form>
              <div class="profile-card__overlay js-message-close"></div>
            </div>
          </div>
              `;

                // Append the profile card to the container
                container.appendChild(tempDiv);

                // Get the specific elements within the profile card for this iteration
                const card = tempDiv.querySelector(".js-profile-card");
                const btn = tempDiv.querySelector(".js-message-btn");
                const closeBtn = tempDiv.querySelectorAll(".js-message-close");
                const draggableElement = tempDiv.querySelector(".draggable");
                const droppableElement = tempDiv.querySelector(".droppable");
                const fileInput = tempDiv.querySelector("#file-input");
                const selectedImage = tempDiv.querySelector("#selected-image");
                const imageContainer =
                  tempDiv.querySelector("#image-container");

                // Add event listeners to each button in the profile card for this iteration
                btn.addEventListener("click", function (e) {
                  e.preventDefault();
                  card.classList.add("active");
                });

                closeBtn.forEach(function (element, index) {
                  element.addEventListener("click", function (e) {
                    e.preventDefault();
                    card.classList.remove("active");
                  });
                });

                draggableElement.addEventListener("dragstart", (event) => {
                  event.dataTransfer.setData("text/plain", event.target.id);
                });

                droppableElement.addEventListener("dragover", (event) => {
                  event.preventDefault();
                });

                droppableElement.addEventListener("drop", (event) => {
                  event.preventDefault();
                  const data = event.dataTransfer.getData("text");
                  const element = document.getElementById(data);
                  droppableElement.appendChild(element);
                });

                fileInput.addEventListener("change", function (event) {
                  var file = event.target.files[0];
                  if (file && file.type.startsWith("image/")) {
                    var reader = new FileReader();
                    reader.onload = function () {
                      selectedImage.src = reader.result;
                      imageContainer.style.display = "block";
                    };
                    reader.readAsDataURL(file);
                  }
                });
              }
            }
          });
      },
    },
  };
  App.init();
})();
