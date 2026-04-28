import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const initialState = {
  reviews: [],
  loading: false,
  error: null,
};

export const createReview = createAsyncThunk(
  "review/createReview",
  async ({ productId, orderId, rating, comment }, thunkAPI) => {
    try {
      const response = await api.post(`/reviews/${productId}`, {
        orderId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data || { message: "Failed to submit review" },
      );
    }
  },
);

export const submitReview = createReview;

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to submit review";
      });
  },
});

export default reviewSlice.reducer;
