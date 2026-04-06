import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { resendVerificationEmail } from "../../features/auth/register-slice";

function ResendEmailConfirmation() {
  const email = useSelector((state) => state.register.email);
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(resendVerificationEmail(email));
  };
  return (
    <div>
      <h1>check your email for confirmation verification instructions</h1>
      <p>
        didn't receive the email?{" "}
        <button onClick={handleClick}>Resend verification Email</button>
      </p>
    </div>
  );
}

export default ResendEmailConfirmation;
