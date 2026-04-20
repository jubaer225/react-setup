import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  closeCart,
  removeFromCart,
  updateQuantity,
  removeFromCartBackend,
  updateCartQuantityBackend,
} from "../features/product/cart-slice";
import { buildImageUrl } from "../utils/cloudnary";
import styles from "./CartDrawer.module.scss";

function CartDrawer() {
  const dispatch = useDispatch();
  const location = useLocation();
  const lastPathRef = useRef(location.pathname);

  const items = useSelector((state) => state.cart.items);
  const loading = useSelector((state) => state.cart.loading);
  const isOpen = useSelector((state) => state.cart.isOpen);

  useEffect(() => {
    const routeChanged = lastPathRef.current !== location.pathname;

    if (routeChanged && isOpen) {
      dispatch(closeCart());
    }

    lastPathRef.current = location.pathname;
  }, [location.pathname, isOpen, dispatch]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.product?.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }, 0),
    [items],
  );

  const handleDecrease = (productId, quantity) => {
    if (quantity <= 1) return;
    dispatch(updateQuantity({ productId, quantity: quantity - 1 }));
    dispatch(
      updateCartQuantityBackend({
        productId,
        quantity: quantity - 1,
        prevItems: items,
      }),
    );
  };

  const handleIncrease = (productId, quantity) => {
    dispatch(updateQuantity({ productId, quantity: quantity + 1 }));
    dispatch(
      updateCartQuantityBackend({
        productId,
        quantity: quantity + 1,
        prevItems: items,
      }),
    );
  };

  const handleRemoveClick = (productId) => {
    dispatch(removeFromCart(productId));
    dispatch(removeFromCartBackend({ productId, prevItems: items }));
  };

  const drawerRootClass = `${styles.drawerRoot} ${isOpen ? styles.open : ""}`;
  const overlayClass = `${styles.overlay} ${isOpen ? styles.overlayOpen : ""}`;
  const panelClass = `${styles.panel} ${isOpen ? styles.panelOpen : ""}`;

  return (
    <div className={drawerRootClass} aria-hidden={!isOpen}>
      <div className={overlayClass} onClick={() => dispatch(closeCart())} />

      <aside className={panelClass} role="dialog" aria-label="Your Cart">
        <div className={styles.content}>
          <header className={styles.header}>
            <h2 className={styles.title}>Your Cart</h2>
            <button
              type="button"
              onClick={() => dispatch(closeCart())}
              className={styles.iconButton}
              aria-label="Close cart"
            >
              ✕
            </button>
          </header>

          <div className={styles.body}>
            {loading && (
              <ul className={styles.skeletonList}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <li key={index} className={styles.skeletonItem}>
                    <span className={styles.skeletonTitle} />
                    <span className={styles.skeletonPrice} />
                  </li>
                ))}
              </ul>
            )}

            {!loading && items.length === 0 && (
              <p className={styles.empty}>Your cart is empty</p>
            )}

            {!loading && items.length > 0 && (
              <ul className={styles.items}>
                {items.map((item, index) => {
                  const product = item.product || {};
                  const productId = product._id;
                  const firstImage = Array.isArray(product.images)
                    ? product.images[0]
                    : null;
                  const imageUrl =
                    firstImage?.url ||
                    (firstImage?.publicId || firstImage?.public_id
                      ? buildImageUrl(
                          firstImage.publicId || firstImage.public_id,
                          { width: 100 },
                        )
                      : "");
                  const quantity = Number(item.quantity) || 1;

                  return (
                    <li
                      key={productId || `${product.title || "item"}-${index}`}
                      className={styles.item}
                    >
                      <div className={styles.itemRow}>
                        <div className={styles.thumb}>
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.title || "Cart product"}
                              loading="lazy"
                            />
                          ) : (
                            <div className={styles.noImage}>No image</div>
                          )}
                        </div>

                        <div className={styles.details}>
                          <div className={styles.topRow}>
                            <h3 className={styles.productTitle}>
                              {product.title || "Untitled product"}
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleRemoveClick(productId)}
                              className={styles.iconButton}
                              aria-label="Remove item"
                            >
                              ✕
                            </button>
                          </div>

                          <p className={styles.price}>
                            ${Number(product.price || 0).toFixed(2)}
                          </p>

                          <div className={styles.qtyControl}>
                            <button
                              type="button"
                              onClick={() =>
                                handleDecrease(productId, quantity)
                              }
                              className={styles.qtyBtn}
                              disabled={quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className={styles.qtyValue}>{quantity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleIncrease(productId, quantity)
                              }
                              className={styles.qtyBtn}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalValue}>${total.toFixed(2)}</span>
            </div>

            <button type="button" className={styles.actionBtn}>
              Checkout
            </button>

            <button
              type="button"
              onClick={() => dispatch(closeCart())}
              className={styles.secondaryBtn}
            >
              View Cart
            </button>
          </footer>
        </div>
      </aside>
    </div>
  );
}

export default CartDrawer;
