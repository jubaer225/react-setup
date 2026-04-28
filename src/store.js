import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/product/product-slice";
import registerReducer from "./features/auth/register-slice";
import cartReducer from "./features/product/cart-slice";
import orderReducer from "./features/order/order-slice";
import reviewReducer from "./features/review/review-slice";

const store = configureStore({
  reducer: {
    product: productReducer,
    register: registerReducer,
    cart: cartReducer,
    order: orderReducer,
    review: reviewReducer,
  },
});

export default store;
