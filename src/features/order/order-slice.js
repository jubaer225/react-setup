import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

export const checkout = createAsyncThunk(
  "order/checkout",
  async ({ shippingAddress }, thunkAPI) => {
    try {
      const response = await api.post("/shop/checkout", { shippingAddress });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/shop/orders");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchOrder = fetchOrders;

export const fetchOrderById = createAsyncThunk(
  "order/fetchOrderById",
  async (orderId, thunkAPI) => {
    try {
      const response = await api.get(`/shop/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const orderCancellation = createAsyncThunk(
  "order/orderCancellation",
  async (orderId, thunkAPI) => {
    try {
      const response = await api.delete(`/shop/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const orderStatuses = createAsyncThunk(
  "order/orderStatuses",
  async (orderId, thunkAPI) => {
    try {
      const response = await api.patch(`/shop/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Checkout failed";
      })
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload)
          ? action.payload
          : Array.isArray(action.payload?.orders)
            ? action.payload.orders
            : Array.isArray(action.payload?.data)
              ? action.payload.data
              : Array.isArray(action.payload?.data?.orders)
                ? action.payload.data.orders
                : [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch orders";
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = [action.payload];
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch order";
      })
      .addCase(orderStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(orderStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = [action.payload];
      })
      .addCase(orderStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update order status";
      })
      .addCase(orderCancellation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(orderCancellation.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order,
        );
      })
      .addCase(orderCancellation.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to cancel the order";
      });
  },
});

export default orderSlice.reducer;
