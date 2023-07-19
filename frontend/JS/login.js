(() => {
  const App = {
    htmlElements: {
      btnSubmit: document.getElementById("btn-submit"),
    },
    init() {
      App.htmlElements.btnSubmit.addEventListener(
        "click",
        App.handlers.handleClickLogin
      );
    },
    handlers: {
      handleClickLogin(event) {
        event.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        App.methods.login(email, password).then((rsp) => {
          alert(JSON.stringify(rsp.success));
          if (rsp.success) App.methods.saveSession(rsp.data);
        });
        /* ejemplo del objeto data:

          si es success es TRUE
          {
    "success": true,
    "data": {
        "user": {
            "id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
            "aud": "authenticated",
            "role": "authenticated",
            "email": "luis.lopez16@utp.ac.pa",
            "email_confirmed_at": "2023-07-18T03:51:54.853883Z",
            "phone": "",
            "confirmed_at": "2023-07-18T03:51:54.853883Z",
            "last_sign_in_at": "2023-07-19T00:27:36.391957528Z",
            "app_metadata": {
                "provider": "email",
                "providers": [
                    "email"
                ]
            },
            "user_metadata": {
                "apellido": "Lopez",
                "edad": "1998-05-08",
                "nombre": "Luis"
            },
            "identities": [
                {
                    "id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
                    "user_id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
                    "identity_data": {
                        "email": "luis.lopez16@utp.ac.pa",
                        "sub": "82fba357-8aa8-4907-8cb3-1ea763bc9c94"
                    },
                    "provider": "email",
                    "last_sign_in_at": "2023-07-18T03:51:54.852595Z",
                    "created_at": "2023-07-18T03:51:54.852641Z",
                    "updated_at": "2023-07-18T03:51:54.852641Z"
                }
            ],
            "created_at": "2023-07-18T03:51:54.84974Z",
            "updated_at": "2023-07-19T00:27:36.394594Z"
        },
        "session": {
            "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6InZoL2VNUXJ6TkQzWktXalgiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjg5NzMwMDU2LCJpYXQiOjE2ODk3MjY0NTYsImlzcyI6Imh0dHBzOi8vaHR0cHM6Ly91bnNmdHZ1ZHd4d2J6d2Vrb2tnci5zdXBhYmFzZS5jby9hdXRoL3YxIiwic3ViIjoiODJmYmEzNTctOGFhOC00OTA3LThjYjMtMWVhNzYzYmM5Yzk0IiwiZW1haWwiOiJsdWlzLmxvcGV6MTZAdXRwLmFjLnBhIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJhcGVsbGlkbyI6IkxvcGV6IiwiZWRhZCI6IjE5OTgtMDUtMDgiLCJub21icmUiOiJMdWlzIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE2ODk3MjY0NTZ9XSwic2Vzc2lvbl9pZCI6IjRkYzhlNWRkLTZlNzQtNDMzZS05OTZmLTgzYzk1NzRjOTM2YiJ9.gsyyXBRngRMZLtxR_AWUw0gKOhZ9vG7rvTs_oBuUT9M",
            "token_type": "bearer",
            "expires_in": 3600,
            "refresh_token": "82piwdkI48k18oW-5waouw",
            "user": {
                "id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
                "aud": "authenticated",
                "role": "authenticated",
                "email": "luis.lopez16@utp.ac.pa",
                "email_confirmed_at": "2023-07-18T03:51:54.853883Z",
                "phone": "",
                "confirmed_at": "2023-07-18T03:51:54.853883Z",
                "last_sign_in_at": "2023-07-19T00:27:36.391957528Z",
                "app_metadata": {
                    "provider": "email",
                    "providers": [
                        "email"
                    ]
                },
                "user_metadata": {
                    "apellido": "Lopez",
                    "edad": "1998-05-08",
                    "nombre": "Luis"
                },
                "identities": [
                    {
                        "id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
                        "user_id": "82fba357-8aa8-4907-8cb3-1ea763bc9c94",
                        "identity_data": {
                            "email": "luis.lopez16@utp.ac.pa",
                            "sub": "82fba357-8aa8-4907-8cb3-1ea763bc9c94"
                        },
                        "provider": "email",
                        "last_sign_in_at": "2023-07-18T03:51:54.852595Z",
                        "created_at": "2023-07-18T03:51:54.852641Z",
                        "updated_at": "2023-07-18T03:51:54.852641Z"
                    }
                ],
                "created_at": "2023-07-18T03:51:54.84974Z",
                "updated_at": "2023-07-19T00:27:36.394594Z"
            },
            "expires_at": 1689730055
        }
    }
}

si success es FALSE
{
    "success": false,
    "error": {
        "name": "AuthApiError",
        "message": "Invalid login credentials",
        "status": 400
    }
}
          */
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
          return console.log(error);
        }
      },
      saveSession(user) {
        sessionStorage.setItem("user", JSON.stringify(user));
      },
    },
  };
  App.init();
})();
