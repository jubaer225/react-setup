import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  orders: [],
  allOrders: [],
  loading: false,
  error: null,
  nextCursor: null,
  hasMore: true,
  search: "",
};

const normalizeOrderList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.orders)) return payload.orders;
  if (Array.isArray(payload?.data?.orders)) return payload.data.orders;
  return [];
};

const getOrderKey = (order) => order?._id || order?.id || order?.orderId;

const extractUpdatedOrder = (payload) =>
  payload?.data?.order || payload?.data || payload;

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
      const response = await api.patch(`/shop/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchAllOrders = createAsyncThunk(
  "order/fetchAllOrders",
  async ({ cursor = null, search = "" } = {}, thunkAPI) => {
    try {
      const response = await api.get("/admin/orders", {
        params: { cursor, search },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const AdminOrderDetails = createAsyncThunk(
  "order/AdminOrderDetails",
  async (orderId, thunkAPI) => {
    try {
      const response = await api.get(`/shop/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const allOrders = fetchAllOrders;

export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async ({ id, orderStatus }, thunkAPI) => {
    try {
      const response = await api.patch(`/admin/orders/${id}/status`, {
        orderStatus,
      });
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
        state.error = action.payload?.message || "Failed to cancel the order";
      })
      .addCase(fetchAllOrders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.search = action.meta.arg?.search ?? "";

        if (!action.meta.arg?.cursor) {
          state.allOrders = [];
          state.nextCursor = null;
          state.hasMore = true;
        }
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;

        const requestSearch = action.meta.arg?.search ?? "";
        if (requestSearch !== state.search) {
          return;
        }

        const data = normalizeOrderList(action.payload);
        const nextCursor = action.payload?.nextCursor ?? null;
        const hasMore = Boolean(action.payload?.hasMore);

        if (!action.meta.arg?.cursor) {
          state.allOrders = data;
        } else {
          state.allOrders = [...state.allOrders, ...data];
        }

        state.nextCursor = nextCursor;
        state.hasMore = hasMore;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch all orders";
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = extractUpdatedOrder(action.payload);
        const updatedKey = getOrderKey(updatedOrder);

        if (!updatedKey) {
          return;
        }

        state.allOrders = state.allOrders.map((order) =>
          getOrderKey(order) === updatedKey
            ? { ...order, ...updatedOrder }
            : order,
        );
        state.orders = state.orders.map((order) =>
          getOrderKey(order) === updatedKey
            ? { ...order, ...updatedOrder }
            : order,
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to update order status";
      })
      .addCase(AdminOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(AdminOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = [action.payload];
      })
      .addCase(AdminOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch order details";
      });
  },
});

export default orderSlice.reducer;
