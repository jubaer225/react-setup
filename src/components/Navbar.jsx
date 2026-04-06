import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  selectIsAuthenticated,
} from "../features/auth/register-slice";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const user = useSelector((state) => state.register.user);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const linkClassName = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.brand}>React Setup</span>

        <nav className={styles.links} aria-label="Main navigation">
          {user && (user.role === "superadmin" || user.role === "admin") && (
            <>
              <NavLink to="/admin/add-product" className={linkClassName}>
                Add Product
              </NavLink>
            </>
          )}
          <NavLink to="/" end className={linkClassName}>
            Home
          </NavLink>

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className={linkClassName}>
                Login
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <NavLink
              to="/login"
              className={linkClassName}
              onClick={handleLogout}
            >
              Logout
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
