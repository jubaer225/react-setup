import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/shop-page/Home";
import AddProduct from "./pages/admin-page/AddProduct";
import NotFoundPage from "./pages/shop-page/NotFoundPage";
import AppLayout from "./components/AppLayout";

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
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default router;
