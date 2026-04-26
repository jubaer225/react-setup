import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkout } from "../../features/order/order-slice";
import styles from "./Checkout.module.scss";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  notes: "",
};

function Checkout() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const loading = useSelector((state) => state.order.loading);
  const orderError = useSelector((state) => state.order.error);

  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = Number(item.product?.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + price * quantity;
      }, 0),
    [items],
  );

  const shippingFee = subtotal > 150 ? 0 : subtotal > 0 ? 12 : 0;
  const tax = subtotal * 0.075;
  const total = subtotal + shippingFee + tax;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];

    const hasEmptyRequired = requiredFields.some(
      (field) => !String(formData[field]).trim(),
    );

    if (hasEmptyRequired) {
      return "Please fill in all required shipping fields.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please provide a valid email address.";
    }

    if (!/^\+?[0-9\s()-]{7,20}$/.test(formData.phone.trim())) {
      return "Please provide a valid phone number.";
    }

    if (items.length === 0) {
      return "Your cart is empty. Add products before placing an order.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");

    const validationError = validateForm();
    setFormError(validationError);
    if (validationError) return;

    const shippingAddress = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      postalCode: formData.postalCode.trim(),
      country: formData.country.trim(),
      notes: formData.notes.trim(),
    };

    try {
      const response = await dispatch(checkout({ shippingAddress })).unwrap();
      const checkoutUrl = response?.url;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      const orderId = response?.data?._id || response?.order?._id;
      setFormError("");
      setSuccessMessage(
        orderId
          ? `Order placed successfully. Your order ID is ${orderId}.`
          : "Order placed successfully. You will receive a confirmation soon.",
      );
      setFormData(initialForm);
    } catch {
      // The order slice already stores and exposes backend error text.
    }
  };

  return (
    <section className={styles.checkoutPage}>
      <div className={styles.grid}>
        <article className={styles.formCard}>
          <header className={styles.cardHeader}>
            <p className={styles.eyebrow}>Secure Checkout</p>
            <h1 className={styles.title}>Shipping Address</h1>
            <p className={styles.subtitle}>
              Fill in your delivery details so we can process your order
              quickly.
            </p>
          </header>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.rowTwo}>
              <label className={styles.field}>
                <span>First Name *</span>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </label>

              <label className={styles.field}>
                <span>Last Name *</span>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                />
              </label>
            </div>

            <div className={styles.rowTwo}>
              <label className={styles.field}>
                <span>Email *</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@email.com"
                />
              </label>

              <label className={styles.field}>
                <span>Phone *</span>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555 000 111"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Address Line 1 *</span>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="Street address"
              />
            </label>

            <label className={styles.field}>
              <span>Address Line 2</span>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apartment, suite, etc."
              />
            </label>

            <div className={styles.rowThree}>
              <label className={styles.field}>
                <span>City *</span>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </label>

              <label className={styles.field}>
                <span>State *</span>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </label>

              <label className={styles.field}>
                <span>Postal Code *</span>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </label>
            </div>

            <label className={styles.field}>
              <span>Country *</span>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
              />
            </label>

            <label className={styles.field}>
              <span>Delivery Notes</span>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Optional instructions for courier"
              />
            </label>

            {(formError || orderError) && (
              <p className={styles.errorMsg}>{formError || orderError}</p>
            )}

            {successMessage && (
              <p className={styles.successMsg}>{successMessage}</p>
            )}

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place Order"}
            </button>
          </form>
        </article>

        <aside className={styles.summaryCard}>
          <header className={styles.summaryHeader}>
            <h2>Order Summary</h2>
            <span>{items.length} item(s)</span>
          </header>

          <ul className={styles.itemList}>
            {items.length === 0 && (
              <li className={styles.empty}>No items in your cart yet.</li>
            )}

            {items.map((item, index) => {
              const product = item.product || {};
              const quantity = Number(item.quantity) || 0;
              const price = Number(product.price) || 0;

              return (
                <li
                  key={product._id || product.id || `${product.title}-${index}`}
                  className={styles.item}
                >
                  <div>
                    <p className={styles.itemName}>
                      {product.title || "Untitled product"}
                    </p>
                    <p className={styles.itemMeta}>Qty: {quantity}</p>
                  </div>
                  <p className={styles.itemTotal}>
                    ${(price * quantity).toFixed(2)}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className={styles.priceRows}>
            <div className={styles.priceRow}>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className={styles.priceRow}>
              <span>Shipping</span>
              <strong>
                {shippingFee === 0 ? "Free" : `$${shippingFee.toFixed(2)}`}
              </strong>
            </div>
            <div className={styles.priceRow}>
              <span>Tax (7.5%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>
          </div>

          <div className={styles.grandTotal}>
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Checkout;
