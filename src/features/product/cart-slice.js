import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  items: [],
  loading: false,
  error: null,
  isOpen: false,
};

const getItemProductId = (item) => {
  if (!item?.product) return "";
  if (typeof item.product === "string") return item.product;
  return item.product._id || item.product.id || "";
};

const moveProductToTop = (items, productId) => {
  if (!productId || !Array.isArray(items)) return items;

  const targetIndex = items.findIndex(
    (item) => getItemProductId(item) === productId,
  );

  if (targetIndex <= 0) return items;

  const targetItem = items[targetIndex];
  const rest = items.filter((_, index) => index !== targetIndex);
  return [targetItem, ...rest];
};

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity }, thunkAPi) => {
    try {
      const response = await api.post("/shop/add-to-cart", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      return thunkAPi.rejectWithValue(
        error.response?.data?.message || "Failed to add to cart",
      );
    }
  },
);

export const removeFromCartBackend = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, prevItems }, thunkAPi) => {
    try {
      const response = await api.delete(`/shop/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      return thunkAPi.rejectWithValue({
        message: error.response?.data?.message || "Failed to remove from cart",
        prevItems,
      });
    }
  },
);

export const updateCartQuantityBackend = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity, prevItems }, thunkAPi) => {
    try {
      const response = await api.put("/shop/cart/update", {
        productId,
        quantity,
      });
      return response.data;
    } catch (error) {
      return thunkAPi.rejectWithValue({
        message:
          error.response?.data?.message || "Failed to update cart quantity",
        prevItems,
      });
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isOpen = true;
    },
    closeCart: (state) => {
      state.isOpen = false;
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(
        (item) => item.product?._id !== productId,
      );
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(
        (cartItem) => cartItem.product?._id === productId,
      );

      if (!item) return;

      item.quantity = Math.max(1, quantity);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        const cart = action.payload?.data;
        const addedProductId = action.meta?.arg?.productId;

        if (!cart) return;

        const nextItems = Array.isArray(cart.items) ? cart.items : [];
        state.items = moveProductToTop(nextItems, addedProductId);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeFromCartBackend.pending, (state) => {
        state.error = null;
      })
      .addCase(removeFromCartBackend.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(removeFromCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        if (action.payload?.prevItems) {
          state.items = action.payload.prevItems;
        }
      })
      .addCase(updateCartQuantityBackend.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartQuantityBackend.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartQuantityBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        if (action.payload?.prevItems) {
          state.items = action.payload.prevItems;
        }
      });
  },
});

export const { openCart, closeCart, removeFromCart, updateQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;
