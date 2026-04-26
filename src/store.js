import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/product/product-slice";
import registerReducer from "./features/auth/register-slice";
import cartReducer from "./features/product/cart-slice";
import orderReducer from "./features/order/order-slice";

const store = configureStore({
  reducer: {
    product: productReducer,
    register: registerReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});

export default store;
