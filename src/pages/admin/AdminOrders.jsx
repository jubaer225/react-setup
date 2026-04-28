import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, AdminOrderDetails } from "../../features/order/order-slice";
import styles from "./styles/AdminOrders.module.scss";
import { useNavigate } from "react-router-dom";

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

// status is read-only in the list; updates occur on the single-order page

const getOrderId = (order) => order?._id || order?.id || order?.orderId || "";

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "pending").toLowerCase();

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

const formatStatusLabel = (value) =>
  String(value || "").replace(/^./, (character) => character.toUpperCase());

function AdminOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allOrders, loading, error, nextCursor, hasMore } = useSelector(
    (state) => state.order,
  );

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const isFirstSearchEffectRef = useRef(true);
  const latestQueryRef = useRef({
    loading: false,
    hasMore: true,
    nextCursor: null,
    search: "",
  });

  const orders = useMemo(
    () => (Array.isArray(allOrders) ? allOrders : []),
    [allOrders],
  );

  const handleOrderClick = async (orderId) => {
    await dispatch(AdminOrderDetails(orderId));
    navigate(`/admin/orders/${orderId}`);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    dispatch(fetchAllOrders({ cursor: null, search: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (isFirstSearchEffectRef.current) {
      isFirstSearchEffectRef.current = false;
      return;
    }

    dispatch(fetchAllOrders({ cursor: null, search: debouncedSearch }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    latestQueryRef.current = {
      loading,
      hasMore,
      nextCursor,
      search: debouncedSearch,
    };
  }, [loading, hasMore, nextCursor, debouncedSearch]);

  useEffect(() => {
    const node = sentinelRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (!entry?.isIntersecting) {
        return;
      }

      const {
        loading: isLoading,
        hasMore: canLoadMore,
        nextCursor: cursor,
        search,
      } = latestQueryRef.current;

      if (isLoading || !canLoadMore || !cursor || isFetchingMoreRef.current) {
        return;
      }

      isFetchingMoreRef.current = true;
      dispatch(fetchAllOrders({ cursor, search }))
        .catch(() => undefined)
        .finally(() => {
          isFetchingMoreRef.current = false;
        });
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [dispatch]);

  // No inline status editing here.

  const handleRetry = () => {
    dispatch(fetchAllOrders({ cursor: null, search: debouncedSearch }));
  };

  const isInitialLoading = loading && orders.length === 0;
  const isLoadingMore = loading && orders.length > 0;

  return (
    <section className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Admin dashboard</p>
            <h1 className={styles.title}>Orders</h1>
            <p className={styles.subtitle}>
              Search, review, and update every order from a single control
              panel.
            </p>
          </div>

          <div className={styles.searchPanel}>
            <label className={styles.searchLabel} htmlFor="admin-orders-search">
              Search orders
            </label>
            <input
              id="admin-orders-search"
              className={styles.searchInput}
              type="search"
              placeholder="Search by order number, user, email, or status"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <p className={styles.searchHint}>
              Results update after 1 second of inactivity.
            </p>
          </div>
        </header>

        {error && (
          <div className={styles.errorBanner} role="alert">
            <div>
              <strong>Failed to load orders.</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className={styles.retryButton}
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        )}

        <div className={styles.tableShell}>
          <table className={styles.table}>
            <tbody>
              {isInitialLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className={styles.skeletonRow}>
                    <td colSpan={5}>
                      <div className={styles.skeletonCard} />
                    </td>
                  </tr>
                ))}

              {!isInitialLoading &&
                orders.map((order) => {
                  const orderId = getOrderId(order);
                  const user = getOrderUser(order);
                  const createdAt = getCreatedAt(order);
                  const totalPrice = getTotalPrice(order);
                  const currentStatus = getOrderStatus(order);

                  return (
                    <tr
                      key={orderId || `${user.email}-${createdAt}`}
                      className={styles.row}
                      onClick={()=> handleOrderClick(orderId)}
                    >
                      <td>
                        <div className={styles.orderNumber}>
                          {order?.orderNumber || orderId}
                        </div>
                        <div className={styles.orderMeta}>
                          {orderId || "No order id"}
                        </div>
                      </td>
                      <td>
                        <div className={styles.userCell}>
                          <span className={styles.userName}>{user.name}</span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className={styles.price}>
                          {priceFormatter.format(totalPrice)}
                        </span>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <span
                            className={`${styles.statusText} ${
                              styles[getOrderStatus(order)] || ""
                            }`}
                          >
                            {formatStatusLabel(currentStatus)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.dateCell}>
                          {createdAt
                            ? dateFormatter.format(new Date(createdAt))
                            : "Unavailable"}
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!isInitialLoading && !error && orders.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className={styles.emptyState}>
                      <h2>No orders found</h2>
                      <p>
                        Try a different search or clear the filter to see all
                        orders.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {isLoadingMore && (
          <div className={styles.loadingMore}>
            <span className={styles.spinner} />
            <span>Loading more orders</span>
          </div>
        )}

        <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      </div>
    </section>
  );
}

export default AdminOrders;
