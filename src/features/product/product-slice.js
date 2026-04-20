import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  products: [],
  loading: false,
  singleProduct: null,
  error: null,
  cursor: null,
  hasMore: true,
  similarProducts: {
    items: [],
    loading: false,
    error: null,
  },
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

export const featchProductById = createAsyncThunk(
  "product/featchProductById",
  async (id, thunkAPI) => {
    try {
      const response = await api.get(`/shop/products/${id}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to featch product details",
      );
    }
  },
);

export const fetchSimilarProducts = createAsyncThunk(
  "product/fetchSimilarProducts",
  async (category, thunkAPI) => {
    if (!category) {
      return [];
    }

    try {
      const response = await api.get("/shop/products", {
        params: {
          category,
          limit: 10,
        },
      });

      const payload = response.data;

      if (Array.isArray(payload)) {
        return payload;
      }

      if (Array.isArray(payload?.data)) {
        return payload.data;
      }

      if (Array.isArray(payload?.items)) {
        return payload.items;
      }

      return [];
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch similar products",
      );
    }
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
      })
      .addCase(featchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(featchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.singleProduct = action.payload.data;
        state.error = null;
      })
      .addCase(featchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(fetchSimilarProducts.pending, (state) => {
        state.similarProducts.loading = true;
        state.similarProducts.error = null;
      })
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.similarProducts.loading = false;
        state.similarProducts.items = action.payload;
        state.similarProducts.error = null;
      })
      .addCase(fetchSimilarProducts.rejected, (state, action) => {
        state.similarProducts.loading = false;
        state.similarProducts.error = action.payload || action.error.message;
        state.similarProducts.items = [];
      });
  },
});

export default productSlice.reducer;
