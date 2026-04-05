import { useState } from "react";
import { useDispatch } from "react-redux";
import { forgotPassword } from "../../features/auth/register-slice";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(forgotPassword(email))
      .then(() => {
        navigate("/reset-password-confirmation", { replace: true });
      })
      .catch((error) => {
        console.error("Failed to request password reset:", error);
        alert("Failed to request password reset. Please try again.");
      });
  };

  return (
    <div className="some-class">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your Email"
            required
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPassword;
