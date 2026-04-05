import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../features/auth/register-slice";
import styles from "./Login.module.scss";

function Login() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await dispatch(loginUser(formData)).unwrap();
      navigate("/", {
        replace: true,
      });
    } catch (err) {
      setError("Invalid email or password", err);
    }
  };

  return (
    <section className={styles.login}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <h2>Login</h2>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your Email"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your Password"
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Login
          </button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
        <p>
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <p>
          Forgot your password?{" "}
          <Link to="/forgot-password">Click Here to Reset</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;
