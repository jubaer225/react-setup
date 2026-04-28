import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  AdminOrderDetails as fetchAdminOrderDetails,
  updateOrderStatus,
  orderCancellation,
} from "../../features/order/order-slice";
import styles from "./styles/AdminOrderDetails.module.scss";

// Status flow: pending → processing → shipped → delivered
const STATUS_FLOW = {
  pending: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const CANCELLABLE_STATUSES = ["pending", "processing"];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const formatStatusLabel = (value) =>
  String(value || "").replace(/^./, (character) => character.toUpperCase());

const getOrderId = (order) => order?._id || order?.id || order?.orderId || "";

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "pending").toLowerCase();

const resolveOrderPayload = (value) => {
  if (!value || typeof value !== "object") return null;

  if (value._id || value.id || value.orderId) return value;
  if (
    value.order &&
    (value.order._id || value.order.id || value.order.orderId)
  ) {
    return value.order;
  }
  if (value.data && (value.data._id || value.data.id || value.data.orderId)) {
    return value.data;
  }
  if (
    value.data?.order &&
    (value.data.order._id || value.data.order.id || value.data.order.orderId)
  ) {
    return value.data.order;
  }

  return null;
};

const getOrderUser = (order) => {
  const user = order?.user;

  if (user && typeof user === "object") {
    return {
      name: user?.name || user?.fullName || user?.username || "Unknown user",
      email: user?.email || user?.username || "No email available",
    };
  }

  return {
    name: order?.customerName || order?.name || "Unknown user",
    email: order?.customerEmail || order?.email || "No email available",
  };
};

const getCreatedAt = (order) => order?.createdAt || order?.created_on || null;

const getTotalPrice = (order) =>
  Number(order?.totalPrice ?? order?.total ?? order?.amount ?? 0);

const getShippingAddress = (order) => {
  const addr = order?.shippingAddress || order?.address || {};
  return {
    fullName: addr?.fullName || addr?.name || "Not provided",
    street: addr?.street || addr?.addressLine1 || "Not provided",
    city: addr?.city || "Not provided",
    state: addr?.state || "Not provided",
    postalCode: addr?.postalCode || addr?.zipCode || "Not provided",
    country: addr?.country || "Not provided",
    phone: addr?.phone || addr?.phoneNumber || "Not provided",
  };
};

const getPaymentMethod = (order) =>
  order?.paymentMethod || order?.payment?.method || "Not provided";

const getPaymentStatus = (order) =>
  order?.paymentStatus || order?.payment?.status || "not_paid";

function AdminOrderDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { orders, loading, error } = useSelector((state) => state.order);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const order = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const normalized = list.map(resolveOrderPayload).filter(Boolean);

    if (!normalized.length) return null;
    if (!id) return normalized[0];

    return (
      normalized.find(
        (entry) =>
          String(entry._id || entry.id || entry.orderId) === String(id),
      ) || normalized[0]
    );
  }, [orders, id]);

  const orderId = getOrderId(order);
  const currentStatus = getOrderStatus(order);
  const allowedTransitions = STATUS_FLOW[currentStatus] || [];
  const canCancel = CANCELLABLE_STATUSES.includes(currentStatus);

  useEffect(() => {
    if (id) {
      dispatch(fetchAdminOrderDetails(id));
    }
  }, [id, dispatch]);

  const handleStatusChange = async (newStatus) => {
    if (!order || !newStatus || newStatus === currentStatus) return;

    const confirmed = window.confirm(
      `Change order status from ${formatStatusLabel(currentStatus)} to ${formatStatusLabel(newStatus)}?`,
    );

    if (!confirmed) return;

    setUpdatingStatus(true);
    try {
      await dispatch(
        updateOrderStatus({
          id,
          orderStatus: newStatus,
        }),
      ).unwrap();
      // Refetch order after successful update
      await dispatch(fetchAdminOrderDetails(id));
    } catch (err) {
      console.error("Failed to update order status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !canCancel) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel this order? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setCancelling(true);
    try {
      await dispatch(orderCancellation(getOrderId(order))).unwrap();
      // Refetch order after cancellation
      await dispatch(fetchAdminOrderDetails(id));
    } catch (err) {
      console.error("Failed to cancel order:", err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading && !order) {
    return (
      <section className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.hero}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/admin/orders")}
            >
              ← Back to Orders
            </button>
            <div>
              <p className={styles.eyebrow}>Order Details</p>
              <h1 className={styles.title}>Loading...</h1>
            </div>
          </header>

          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        </div>
      </section>
    );
  }

  if (error && !order) {
    return (
      <section className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.hero}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/admin/orders")}
            >
              ← Back to Orders
            </button>
          </header>

          <div className={styles.errorBanner} role="alert">
            <div>
              <strong>Failed to load order.</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className={styles.retryButton}
              onClick={() => dispatch(fetchAdminOrderDetails(id))}
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className={styles.page}>
        <div className={styles.shell}>
          <header className={styles.hero}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/admin/orders")}
            >
              ← Back to Orders
            </button>
          </header>

          <div className={styles.emptyState}>
            <h2>Order Not Found</h2>
            <p>
              The order you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const user = getOrderUser(order);
  const createdAt = getCreatedAt(order);
  const totalPrice = getTotalPrice(order);
  const shipping = getShippingAddress(order);
  const paymentMethod = getPaymentMethod(order);
  const paymentStatus = getPaymentStatus(order);
  const items = Array.isArray(order?.items) ? order.items : [];

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/admin/orders")}
          >
            ← Back to Orders
          </button>
          <div>
            <p className={styles.eyebrow}>Admin Dashboard</p>
            <h1 className={styles.title}>
              Order #{order?.orderNumber || orderId}
            </h1>
          </div>
        </header>

        <div className={styles.summaryGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Order Summary</h3>
            <div className={styles.summaryContent}>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Order Number</span>
                <span className={styles.value}>
                  {order?.orderNumber || orderId}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Created Date</span>
                <span className={styles.value}>
                  {createdAt
                    ? dateFormatter.format(new Date(createdAt))
                    : "N/A"}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Total Price</span>
                <span className={styles.valueBold}>
                  {priceFormatter.format(totalPrice)}
                </span>
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span className={styles.label}>Customer Name</span>
                <span className={styles.value}>{user.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.label}>Customer Email</span>
                <span className={styles.value}>{user.email}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Order Status</h3>
            <div className={styles.statusContent}>
              <div className={styles.currentStatusBadge}>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`badge_${currentStatus}`]
                  }`}
                >
                  {formatStatusLabel(currentStatus)}
                </span>
              </div>

              <div className={styles.statusControlWrapper}>
                <label htmlFor="status-select" className={styles.statusLabel}>
                  Update Status
                </label>
                <select
                  id="status-select"
                  className={styles.statusSelect}
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus || allowedTransitions.length === 0}
                >
                  <option value={currentStatus} disabled>
                    Current: {formatStatusLabel(currentStatus)}
                  </option>
                  {allowedTransitions.map((status) => (
                    <option key={status} value={status}>
                      → {formatStatusLabel(status)}
                    </option>
                  ))}
                </select>
                {allowedTransitions.length === 0 && (
                  <p className={styles.statusHelp}>
                    No further transitions available for this status.
                  </p>
                )}
                {updatingStatus && (
                  <p className={styles.statusHelp}>Updating...</p>
                )}
              </div>

              <div className={styles.statusActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCancelOrder}
                  disabled={!canCancel || cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
                {!canCancel && (
                  <p className={styles.cancelHelp}>
                    Orders can only be cancelled if they're pending or
                    processing.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Shipping Information</h3>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{shipping.fullName}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Address</span>
                <span className={styles.value}>{shipping.street}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>City, State</span>
                <span className={styles.value}>
                  {shipping.city}, {shipping.state}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Postal Code</span>
                <span className={styles.value}>{shipping.postalCode}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Country</span>
                <span className={styles.value}>{shipping.country}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Phone Number</span>
                <span className={styles.value}>{shipping.phone}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Payment Information</h3>
            <div className={styles.detailsContent}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Payment Method</span>
                <span className={styles.value}>
                  {formatStatusLabel(paymentMethod)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Payment Status</span>
                <span className={styles.valueBold}>
                  <span
                    className={`${styles.paymentStatusBadge} ${
                      paymentStatus === "paid"
                        ? styles.badgePaid
                        : styles.badgeNotPaid
                    }`}
                  >
                    {formatStatusLabel(paymentStatus)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Order Items</h3>
          {items.length === 0 ? (
            <div className={styles.emptyItems}>
              <p>No items in this order</p>
            </div>
          ) : (
            <div className={styles.itemsList}>
              {items.map((item, index) => {
                const itemPrice = Number(
                  item?.price ?? item?.product?.price ?? 0,
                );
                const itemQuantity = Number(item?.quantity ?? 1);
                const itemSubtotal = itemPrice * itemQuantity;

                return (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemImage}>
                      {item?.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item?.product?.title || "Product"}
                        />
                      ) : (
                        <div className={styles.imagePlaceholder}>No Image</div>
                      )}
                    </div>

                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemName}>
                        {item?.product?.title || "Unknown Product"}
                      </h4>
                      <div className={styles.itemMeta}>
                        <div className={styles.metaRow}>
                          <span className={styles.metaLabel}>Quantity</span>
                          <span className={styles.metaValue}>
                            {itemQuantity}
                          </span>
                        </div>
                        <div className={styles.metaRow}>
                          <span className={styles.metaLabel}>Price</span>
                          <span className={styles.metaValue}>
                            {priceFormatter.format(itemPrice)}
                          </span>
                        </div>
                        <div className={styles.metaRow}>
                          <span className={styles.metaLabel}>Subtotal</span>
                          <span
                            className={`${styles.metaValue} ${styles.bold}`}
                          >
                            {priceFormatter.format(itemSubtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className={styles.itemsTotal}>
                <div className={styles.totalRow}>
                  <span className={styles.totalLabel}>Order Total</span>
                  <span className={styles.totalValue}>
                    {priceFormatter.format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminOrderDetails;
