import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReview } from "../features/review/review-slice";
import styles from "../styles/ReviewModal.module.scss";

function ReviewModal({
  isOpen,
  productId,
  productName,
  orderId,
  onClose,
  onSuccess,
}) {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.review);

  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const hasRating = rating > 0;
  const hasMessage = message.trim().length > 0;
  const canSubmit = Boolean(productId) && hasRating && hasMessage && !loading;

  const headingLabel = useMemo(() => {
    if (!productName) return "Write a Review";
    return `Write a Review for ${productName}`;
  }, [productName]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasRating) {
      setSubmitError("Please select a star rating.");
      return;
    }

    if (!hasMessage) {
      setSubmitError("Please enter your review message.");
      return;
    }

    setSubmitError("");

    try {
      await dispatch(
        createReview({
          productId,
          orderId,
          rating,
          comment: message.trim(),
        }),
      ).unwrap();

      onSuccess?.(productId);
      onClose();
      setRating(0);
      setMessage("");
      setSubmitError("");
    } catch (error) {
      setSubmitError(
        error?.message || "Failed to submit review. Please try again.",
      );
    }
  };

  return (
    <div className={styles.overlay} onClick={() => !loading && onClose()}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <h3 id="review-modal-title" className={styles.title}>
            {headingLabel}
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
            aria-label="Close review modal"
          >
            x
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.ratingWrap}>
            <p className={styles.label}>Rating</p>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${rating >= star ? styles.active : ""}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  title={`${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <label className={styles.messageLabel} htmlFor="review-message">
            Your review
          </label>
          <textarea
            id="review-message"
            className={styles.textarea}
            placeholder="Share details about the product quality, fit, and value..."
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={5}
            maxLength={1000}
          />

          {submitError && (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          )}

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={!canSubmit}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;
