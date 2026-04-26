import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import CartDrawer from "./CartDrawer";

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedPath = location.pathname.replace(/\/{2,}/g, "/");

    if (normalizedPath !== location.pathname) {
      navigate(`${normalizedPath}${location.search}${location.hash}`, {
        replace: true,
      });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

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
