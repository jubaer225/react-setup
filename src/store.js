import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/product/product-slice";
import registerReducer from "./features/auth/register-slice";

const store = configureStore({
  reducer: {
    product: productReducer,
    register: registerReducer,
  },
});

export default store;
