import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchOrderById,
  orderCancellation,
} from "../features/order/order-slice";
import { buildProductImageUrl } from "../utils/imageUtils";
import styles from "./OrderDetails.module.scss";

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

const getOrderId = (order) =>
  order?._id || order?.id || order?.orderNumber || "N/A";

const getOrderDate = (order) =>
  order?.createdAt || order?.created_on || order?.date || null;

const getTotalPrice = (order) =>
  Number(order?.totalPrice ?? order?.total ?? order?.amount ?? 0);

const getOrderItems = (order) =>
  Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.items)
      ? order.items
      : [];

const resolveOrderPayload = (value) => {
  if (!value || typeof value !== "object") return null;

  if (value._id || value.id || value.orderNumber) return value;
  if (
    value.order &&
    (value.order._id || value.order.id || value.order.orderNumber)
  ) {
    return value.order;
  }
  if (
    value.data &&
    (value.data._id || value.data.id || value.data.orderNumber)
  ) {
    return value.data;
  }
  if (
    value.data?.order &&
    (value.data.order._id ||
      value.data.order.id ||
      value.data.order.orderNumber)
  ) {
    return value.data.order;
  }

  return null;
};

const getItemName = (item) =>
  item?.name || item?.title || item?.product?.title || "Product";

const getItemQty = (item) => Number(item?.quantity || 0);

const getItemPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);

const getItemImage = (item) => {
  const product = item?.product || {};
  const firstItemImage = Array.isArray(item?.images) ? item.images[0] : null;
  const firstProductImage = Array.isArray(product?.images)
    ? product.images[0]
    : null;

  const candidates = [
    firstItemImage,
    item?.image,
    { publicId: item?.publicId, url: item?.url },
    firstProductImage,
    product?.image,
    { publicId: product?.publicId, url: product?.url },
    product?.thumbnail,
  ];

  for (const candidate of candidates) {
    const imageUrl = buildProductImageUrl(candidate, {
      width: 180,
      height: 180,
      crop: "fill",
      quality: "auto",
      format: "webp",
    });

    if (imageUrl) return imageUrl;
  }

  return "";
};

const getShipping = (order) => order?.shippingAddress || order?.shipping || {};

const getCustomerName = (order) => {
  const shipping = getShipping(order);
  const firstName = String(shipping?.firstName || "").trim();
  const lastName = String(shipping?.lastName || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || shipping?.name || order?.user?.name || "Not provided";
};

const getEmail = (order) => {
  const shipping = getShipping(order);
  return (
    shipping?.email || order?.email || order?.user?.email || "Not provided"
  );
};

const getPhone = (order) => {
  const shipping = getShipping(order);
  return shipping?.phone || order?.phone || "Not provided";
};

const getAddress = (order) => {
  const shipping = getShipping(order);
  const parts = [
    shipping?.addressLine1,
    shipping?.addressLine2,
    shipping?.city,
    shipping?.state,
    shipping?.postalCode,
    shipping?.country,
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "Not provided";
};

const isCanceled = (order) => {
  const status = String(
    order?.orderStatus || order?.status || "",
  ).toLowerCase();
  return Boolean(
    order?.canceledAt ||
    order?.cancelledAt ||
    status === "canceled" ||
    status === "cancelled",
  );
};

function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);

  const order = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    const normalized = list
      .map((entry) => resolveOrderPayload(entry))
      .filter(Boolean);

    if (!normalized.length) return null;
    if (!id) return normalized[0];

    return (
      normalized.find(
        (entry) => String(entry._id || entry.id) === String(id),
      ) || normalized[0]
    );
  }, [orders, id]);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchOrderById(id));
  }, [dispatch, id]);

  const orderItems = useMemo(() => getOrderItems(order), [order]);
  const orderDate = getOrderDate(order);
  const orderId = getOrderId(order);
  const totalPrice = getTotalPrice(order);
  const paymentMethod = order?.paymentMethod || "Not specified";
  const paymentStatus =
    typeof order?.isPaid === "boolean"
      ? order.isPaid
        ? "Paid"
        : "Not Paid"
      : order?.paymentStatus
        ? String(order.paymentStatus).toLowerCase() === "paid"
          ? "Paid"
          : "Not Paid"
        : null;
  const canceled = isCanceled(order);

  const handleCancelOrder = async () => {
    if (!id || canceled) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );
    if (!confirmed) return;

    try {
      await dispatch(orderCancellation(id)).unwrap();
      await dispatch(fetchOrderById(id));
    } catch {
      // Order slice exposes cancellation errors in state.order.error.
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.headerCard}>
          <div>
            <p className={styles.eyebrow}>Orders</p>
            <h1 className={styles.title}>Order Details</h1>
          </div>

          {!loading && order && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleCancelOrder}
              disabled={loading || canceled}
              aria-disabled={loading || canceled}
            >
              {canceled
                ? "Order Canceled"
                : loading
                  ? "Canceling..."
                  : "Cancel Order"}
            </button>
          )}
        </header>

        {loading && (
          <div className={styles.skeletonWrap}>
            <article className={styles.skeletonCard}>
              <div className={styles.skeletonLineWide} />
              <div className={styles.skeletonLine} />
            </article>
            <article className={styles.skeletonCard}>
              <div className={styles.skeletonLineWide} />
              <div className={styles.skeletonLine} />
            </article>
          </div>
        )}

        {!loading && error && (
          <article className={styles.stateCard}>
            <h2>Unable to load order</h2>
            <p>{error}</p>
          </article>
        )}

        {!loading && !error && !order && (
          <article className={styles.stateCard}>
            <h2>Order not found</h2>
            <p>We could not find an order with this ID.</p>
          </article>
        )}

        {!loading && !error && order && (
          <>
            <section className={styles.summaryCard}>
              <div className={styles.summaryItem}>
                <span>Order ID</span>
                <strong>{orderId}</strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Order Date</span>
                <strong>
                  {orderDate
                    ? dateFormatter.format(new Date(orderDate))
                    : "N/A"}
                </strong>
              </div>
              <div className={styles.summaryItem}>
                <span>Total Price</span>
                <strong>{priceFormatter.format(totalPrice)}</strong>
              </div>
            </section>

            <section className={styles.infoGrid}>
              <article className={styles.infoCard}>
                <h2>Shipping Information</h2>
                <ul className={styles.infoList}>
                  <li>
                    <span>Name</span>
                    <strong>{getCustomerName(order)}</strong>
                  </li>
                  <li>
                    <span>Email</span>
                    <strong>{getEmail(order)}</strong>
                  </li>
                  <li>
                    <span>Address</span>
                    <strong>{getAddress(order)}</strong>
                  </li>
                  <li>
                    <span>Phone</span>
                    <strong>{getPhone(order)}</strong>
                  </li>
                </ul>
              </article>

              <article className={styles.infoCard}>
                <h2>Payment Information</h2>
                <ul className={styles.infoList}>
                  <li>
                    <span>Method</span>
                    <strong>{paymentMethod}</strong>
                  </li>
                  {paymentStatus && (
                    <li>
                      <span>Status</span>
                      <strong>{paymentStatus}</strong>
                    </li>
                  )}
                </ul>
              </article>
            </section>

            <section className={styles.itemsCard}>
              <h2>Items</h2>

              <ul className={styles.itemsList}>
                {orderItems.map((item, index) => {
                  const image = getItemImage(item);
                  const name = getItemName(item);
                  const quantity = getItemQty(item);
                  const price = getItemPrice(item);

                  return (
                    <li key={`${name}-${index}`} className={styles.itemRow}>
                      <div className={styles.itemImageWrap}>
                        {image ? (
                          <img src={image} alt={name} loading="lazy" />
                        ) : (
                          <span className={styles.imageFallback}>No Image</span>
                        )}
                      </div>

                      <div className={styles.itemMain}>
                        <p className={styles.itemName}>{name}</p>
                        <p className={styles.itemMeta}>Qty: {quantity}</p>
                      </div>

                      <p className={styles.itemPrice}>
                        {priceFormatter.format(price)}
                      </p>
                      <p className={styles.itemSubtotal}>
                        {priceFormatter.format(price * quantity)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}
      </div>
    </section>
  );
}

export default OrderDetails;
