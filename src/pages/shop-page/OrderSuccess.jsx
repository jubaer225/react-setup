import { Link, useLocation } from "react-router-dom";
import styles from "./OrderSuccess.module.scss";

function OrderSuccess() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const orderId =
    searchParams.get("orderId") ||
    searchParams.get("order_id") ||
    searchParams.get("order");
  const sessionId =
    searchParams.get("session_id") || searchParams.get("sessionId");

  return (
    <section className={styles.page}>
      <article className={styles.card}>
        <div className={styles.badgeWrap}>
          <span className={styles.badge}>Payment Confirmed</span>
        </div>

        <div className={styles.icon} aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img">
            <path d="M20.285 6.708a1 1 0 0 1 .007 1.414l-9.25 9.344a1 1 0 0 1-1.42-.001L3.71 11.55a1 1 0 1 1 1.414-1.415l5.205 5.205 8.543-8.626a1 1 0 0 1 1.413-.006z" />
          </svg>
        </div>

        <h1 className={styles.title}>Your order is complete</h1>

        <p className={styles.subtitle}>
          Thank you for shopping with us. We have received your payment and
          started preparing your order.
        </p>

        {(orderId || sessionId) && (
          <div className={styles.metaGrid}>
            {orderId && (
              <p className={styles.metaItem}>
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </p>
            )}
            {sessionId && (
              <p className={styles.metaItem}>
                <span>Session</span>
                <strong>{sessionId}</strong>
              </p>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Link className={styles.primaryBtn} to="/products">
            Continue Shopping
          </Link>
          <Link className={styles.secondaryBtn} to="/">
            Back To Home
          </Link>
        </div>
      </article>
    </section>
  );
}

export default OrderSuccess;
