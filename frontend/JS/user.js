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
    },
    handler: {
      handleLogout() {
        App.methods.logout();
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
