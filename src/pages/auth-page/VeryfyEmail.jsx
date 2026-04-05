import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmail } from "../../features/auth/register-slice";
import { useNavigate } from "react-router-dom";

function VeryfyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    verifyStatus,
    verifyError,
    verifyMessage,
    verifyRequestToken,
    lastVerifiedToken,
  } = useSelector((state) => state.register);

  useEffect(() => {
    if (!token) {
      return;
    }

    if (verifyStatus === "loading" && verifyRequestToken === token) {
      return;
    }

    if (verifyStatus === "succeeded" && lastVerifiedToken === token) {
      return;
    }

    dispatch(verifyEmail(token));
  }, [token, dispatch, verifyStatus, verifyRequestToken, lastVerifiedToken]);

  useEffect(() => {
    if (verifyStatus === "succeeded") {
      navigate("/login");
    }
  }, [verifyStatus, navigate]);

  return (
    <div>
      {!token && <p>Missing verification token.</p>}

      {token && verifyStatus === "loading" && <p>Verifying your email...</p>}

      {token && verifyStatus === "succeeded" && (
        <p>{verifyMessage || "Your email has been verified successfully."}</p>
      )}

      {token && verifyStatus === "failed" && (
        <p>
          {verifyError || "Verification failed. Please request a new link."}
        </p>
      )}

      {token && verifyStatus === "idle" && <p>Preparing verification...</p>}
    </div>
  );
}

export default VeryfyEmail;
