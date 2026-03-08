import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.scss";

function Navbar() {
  const linkClassName = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.active}` : styles.link;

  return (
    <header className={styles.nav}>
      <div className={styles.inner}>
        <span className={styles.brand}>React Setup</span>

        <nav className={styles.links} aria-label="Main navigation">
          <NavLink to="/" end className={linkClassName}>
            Home
          </NavLink>
          <NavLink to="/admin/add-product" className={linkClassName}>
            Add Product
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
