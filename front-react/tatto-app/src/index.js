import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

// css imports
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "./css/style.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import HeaderMain from "./components/HeaderMain";
//page components
import MainPage from "./main";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgetpassword",
    element: <ForgetPasswordPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HeaderMain />
    <RouterProvider router={router} />
  </React.StrictMode>
);
