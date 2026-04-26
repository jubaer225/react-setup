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
import ResendEmailConfirmation from "./pages/auth-page/ResendEmailConfirmation";
import Products from "./pages/shop-page/Products";
import Product from "./pages/shop-page/Product";
import Checkout from "./pages/shop-page/Checkout";
import OrderSuccess from "./pages/shop-page/OrderSuccess";

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
      {
        path: "resend-verification-email",
        element: <ResendEmailConfirmation />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "products/:id",
        element: <Product />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "order-success",
        element: <OrderSuccess />,
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
