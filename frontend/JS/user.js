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
        const nombre = document.getElementById("name");
        const address = document.getElementById("address");
        const profile = document.getElementById("profile-img");
        const profile_link = document.getElementById("profile-link");
        // setting the data from session
        const {
          user: { user_metadata },
        } = JSON.parse(sessionStorage.getItem("user"));
        nombre.textContent = `${user_metadata.nombre} ${user_metadata.apellido}`;

        address.textContent = `${
          user_metadata.provincia ? user_metadata.provincia : "Panamá"
        }, ${user_metadata.ciudad ? user_metadata.ciudad : "Panamá"}`;
        profile.setAttribute("src", user_metadata.profile);

        profile_link.setAttribute(
          "href",
          user_metadata.tipo === "Cliente"
            ? " /frontend/Pages/User Screen/profile.html"
            : "/frontend/Pages/User Screen/tattoo.html"
        );
      },
    },
    methods: {
      async logout() {
        try {
          const { session } = JSON.parse(sessionStorage.getItem("user"));
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
    },
  };
  App.init();
})();
