import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/shop-page/Home";
import AddProduct from "./pages/admin-page/AddProduct";
import NotFoundPage from "./pages/shop-page/NotFoundPage";
import Register from "./pages/auth-page/Register";
import AppLayout from "./components/AppLayout";
import Login from "./pages/auth-page/Login";
import VeryfyEmail from "./pages/auth-page/VeryfyEmail";
import ForgotPassword from "./pages/auth-page/ForgotPassword";
import EmailConfirmation from "./pages/auth-page/EmailConfirmation";
import ResetPassword from "./pages/auth-page/ResetPassword";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "admin/add-product",
        element: <AddProduct />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "verify-email",
        element: <VeryfyEmail />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password-confirmation",
        element: <EmailConfirmation />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
