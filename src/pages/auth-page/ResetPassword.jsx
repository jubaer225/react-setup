import { useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../../features/auth/register-slice";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!token) {
      setError("Reset token is missing or invalid.");
      return;
    }

    try {
      await dispatch(
        resetPassword({
          token,
          password: formData.password,
          confirmpassword: formData.confirmPassword,
        }),
      ).unwrap();

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err || "Failed to reset password. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your new password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Reset Password
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default ResetPassword;
