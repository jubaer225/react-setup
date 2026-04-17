import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  products: [],
  loading: false,
  error: null,
  cursor: null,
  hasMore: true,
};

export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (productData, thunkAPI) => {
    try {
      const response = await api.post("/admin/add-product", productData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to create product",
      );
    }
  },
);

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async ({ cursor = null, filters = {} }, thunkAPI) => {
    try {
      const response = await api.get("/shop/products", {
        params: {
          limit: 20,
          cursor,
          ...filters,
        },
      });

      return {
        ...response.data,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
  {
    condition: ({ cursor = null } = {}, { getState }) => {
      const { loading, hasMore } = getState().product;

      if (loading) {
        return false;
      }

      if (cursor && !hasMore) {
        return false;
      }

      return true;
    },
  },
);

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload);
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        const { data, nextCursor, hasMore } = action.payload;

        if (!action.meta.arg.cursor) {
          state.products = data;
        } else {
          state.products = [...state.products, ...data];
        }

        state.cursor = nextCursor;
        state.hasMore = hasMore;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export default productSlice.reducer;
