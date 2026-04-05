import { useSelector } from "react-redux";

function EmailConfirmation() {
  const { verifyMessage } = useSelector((state) => state.register);
  return (
    <div>
      <p>{verifyMessage}</p>
    </div>
  );
}

export default EmailConfirmation;
