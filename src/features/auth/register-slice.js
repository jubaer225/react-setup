import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const initialState = {
  user: null,
  loading: false,
  error: null,
  verificationToken: null,
  registerStatus: "idle",
  loginStatus: "idle",
  verifyStatus: "idle",
  registerError: null,
  loginError: null,
  verifyError: null,
  verifyRequestToken: null,
  lastVerifiedToken: null,
  verifyMessage: null,
};

const registerUser = createAsyncThunk(
  "register/registerUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        userData,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to register user",
      );
    }
  },
);

const forgotPassword = createAsyncThunk(
  "register/forgotPassowrd",
  async (email, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/forgot-password`,
        { email },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to request password reset",
      );
    }
  },
);

const verifyEmail = createAsyncThunk(
  "register/verifyEmail",
  async (token, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/verify-email/${encodeURIComponent(token)}`,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to verify email",
      );
    }
  },
  {
    condition: (token, { getState }) => {
      const state = getState();
      const registerState = state.register;

      if (!token) {
        return false;
      }

      if (
        registerState.verifyStatus === "loading" &&
        registerState.verifyRequestToken === token
      ) {
        return false;
      }

      if (
        registerState.verifyStatus === "succeeded" &&
        registerState.lastVerifiedToken === token
      ) {
        return false;
      }

      return true;
    },
  },
);

const loginUser = createAsyncThunk(
  "register/loginUser",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, userData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to login user",
      );
    }
  },
);

const resetPassword = createAsyncThunk(
  "register/resetPassword",
  async ({ token, password, confirmpassword }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`,
        { password, confirmpassword },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reset password",
      );
    }
  },
);

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerStatus = "loading";
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        state.registerStatus = "succeeded";
        state.registerError = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.registerStatus = "failed";
        state.registerError = action.payload || action.error.message;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.loginStatus = "loading";
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.verificationToken = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        state.error = null;
        state.loginStatus = "succeeded";
        state.loginError = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.loginStatus = "failed";
        state.loginError = action.payload || action.error.message;
      })
      .addCase(verifyEmail.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.verifyStatus = "loading";
        state.verifyError = null;
        state.verifyMessage = null;
        state.verifyRequestToken = action.meta.arg;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.verifyStatus = "succeeded";
        state.verifyError = null;
        state.verifyMessage =
          action.payload?.message ||
          "Your email has been verified successfully.";
        state.lastVerifiedToken = action.meta.arg;
        state.verifyRequestToken = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
        state.verifyStatus = "failed";
        state.verifyError = action.payload || action.error.message;
        state.verifyRequestToken = null;
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.verifyMessage =
          action.payload?.message || "Password reset link sent to your email.";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.verifyMessage =
          action.payload?.message || "Password has been reset successfully.";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export { registerUser, loginUser, forgotPassword, resetPassword, verifyEmail };
export default registerSlice.reducer;
