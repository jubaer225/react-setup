import { useEffect, useState } from "react";
import styles from "./Register.module.scss";
import { registerUser } from "../../features/auth/register-slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setError("");
    setImageFile(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email || !formData.password) {
      setError("Name, email, and password are required.");
      return;
    }

    const userPayload = {
      name,
      email,
      password: formData.password,
      phone: formData.phone.trim() || undefined,
      image: imageFile || undefined,
    };

    try {
      await dispatch(registerUser(userPayload)).unwrap();

      setSuccessMessage("Registration successful! You can now log in.");
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });
      setImageFile(null);
      setImagePreview("");

      navigate("/resend-verification-email", {
        state: { message: "Registration successful! Please log in." },
        replace: true,
      });
    } catch (err) {
      setError(
        typeof err === "string"
          ? err
          : err?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="name">
              Name <span className={styles.required}>*</span>
            </label>
            <input
              id="name"
              className={styles.input}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              className={styles.input}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              className={styles.input}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="image">
              Profile Image
            </label>
            <input
              id="image"
              className={styles.fileInput}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>

          {imagePreview && (
            <div className={styles.previewWrap}>
              <p className={styles.previewLabel}>Image Preview</p>
              <img
                src={imagePreview}
                alt="Selected profile preview"
                className={styles.previewImage}
              />
            </div>
          )}

          <button className={styles.submitButton} type="submit">
            Register
          </button>
        </form>

        {error && <p className={styles.error}>{error}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}
      </div>
    </section>
  );
}

export default Register;
