import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";

function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <CartDrawer />
    </>
  );
}

export default AppLayout;
