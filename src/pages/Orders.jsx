import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders } from "../features/order/order-slice";
import { buildProductImageUrl } from "../utils/imageUtils";
import { useNavigate } from "react-router-dom";
import styles from "./Orders.module.scss";

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
  order?._id || order?.id || order?.orderId || "Unknown";

const getCreatedAt = (order) =>
  order?.createdAt || order?.created_on || order?.date || null;

const getTotalPrice = (order) =>
  Number(order?.totalPrice ?? order?.total ?? order?.amount ?? 0);

const getOrderItems = (order) =>
  Array.isArray(order?.orderItems)
    ? order.orderItems
    : Array.isArray(order?.items)
      ? order.items
      : [];

const getItemImage = (item) => {
  const product = item?.product || {};
  const firstProductImage = Array.isArray(product?.images)
    ? product.images[0]
    : null;
  const firstItemImage = Array.isArray(item?.images) ? item.images[0] : null;

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
      width: 160,
      height: 160,
      crop: "fill",
      quality: "auto",
      format: "webp",
    });

    if (imageUrl) return imageUrl;
  }

  return "";
};

const getItemName = (item) =>
  item?.name || item?.title || item?.product?.title || "Product";

const getItemPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);

const isOrderPaid = (order) =>
  Boolean(order?.isPaid || order?.paidAt || order?.paymentStatus === "paid");

const isOrderDelivered = (order) =>
  Boolean(
    order?.isDelivered ||
    order?.deliveredAt ||
    order?.deliveryStatus === "delivered",
  );

function Orders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    orders: rawOrders,
    loading,
    error,
  } = useSelector((state) => state.order);

  const handleSingleOrderClick = (orderId) => {
    if (orderId && orderId !== "Unknown") {
      navigate(`/orders/${orderId}`);
    }
  };

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const orders = useMemo(
    () => (Array.isArray(rawOrders) ? rawOrders : []),
    [rawOrders],
  );

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Account</p>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>
            Track your purchases, payment progress, and delivery updates in one
            place.
          </p>
        </header>

        {loading && (
          <div className={styles.skeletonList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard}>
                <div className={styles.skeletonLineWide} />
                <div className={styles.skeletonLine} />
                <div className={styles.skeletonGrid}>
                  <div className={styles.skeletonChip} />
                  <div className={styles.skeletonChip} />
                  <div className={styles.skeletonChip} />
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && error && (
          <article className={styles.stateCard}>
            <h2>Could not load your orders</h2>
            <p>{error}</p>
          </article>
        )}

        {!loading && !error && orders.length === 0 && (
          <article className={styles.stateCard}>
            <h2>No orders found</h2>
            <p>
              Your order history will appear here after your first purchase.
            </p>
          </article>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className={styles.orderList}>
            {orders.map((order, orderIndex) => {
              const orderId = getOrderId(order);
              const orderItems = getOrderItems(order);
              const createdAt = getCreatedAt(order);
              const totalPrice = getTotalPrice(order);
              const paid = isOrderPaid(order);
              const delivered = isOrderDelivered(order);

              return (
                <article
                  key={orderId === "Unknown" ? `order-${orderIndex}` : orderId}
                  className={styles.orderCard}
                  onClick={() => handleSingleOrderClick(orderId)}
                >
                  <div className={styles.orderTop}>
                    <p className={styles.orderId}>Order #{orderId}</p>
                    <p className={styles.orderDate}>
                      {createdAt
                        ? dateFormatter.format(new Date(createdAt))
                        : "Date unavailable"}
                    </p>
                  </div>

                  <div className={styles.metaRow}>
                    <p className={styles.totalPrice}>
                      {priceFormatter.format(totalPrice)}
                    </p>
                    <span
                      className={`${styles.badge} ${paid ? styles.badgeSuccess : styles.badgeWarning}`}
                    >
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                    <span
                      className={`${styles.badge} ${delivered ? styles.badgeSuccess : styles.badgeDanger}`}
                    >
                      {delivered ? "Delivered" : "Pending"}
                    </span>
                    <button type="button" className={styles.detailsBtn}>
                      View Details
                    </button>
                  </div>

                  <ul className={styles.itemList}>
                    {orderItems.map((item, itemIndex) => {
                      const image = getItemImage(item);
                      const itemName = getItemName(item);
                      const quantity = Number(item?.quantity || 0);
                      const itemPrice = getItemPrice(item);

                      return (
                        <li
                          key={`${itemName}-${itemIndex}`}
                          className={styles.itemCard}
                        >
                          <div className={styles.itemVisual}>
                            {image ? (
                              <img src={image} alt={itemName} loading="lazy" />
                            ) : (
                              <span className={styles.imageFallback}>
                                No Image
                              </span>
                            )}
                          </div>
                          <div className={styles.itemContent}>
                            <p className={styles.itemName}>{itemName}</p>
                            <p className={styles.itemMeta}>Qty: {quantity}</p>
                          </div>
                          <p className={styles.itemPrice}>
                            {priceFormatter.format(itemPrice * quantity)}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Orders;
