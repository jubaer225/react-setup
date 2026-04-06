import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/apiClient";

const AUTH_USER_STORAGE_KEY = "authUser";
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

const getStoredUser = () => {
  const rawUser = localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    return null;
  }
};

const persistAuthState = ({ user, accessToken }) => {
  if (user) {
    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  }

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
};

const initialState = {
  user: getStoredUser(),
  loading: false,
  error: null,
  verificationToken: null,
  accessToken: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || null,
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
      const hasImage = userData?.image instanceof File;

      if (hasImage) {
        const formData = new FormData();
        formData.append("name", userData.name || "");
        formData.append("email", userData.email || "");
        formData.append("password", userData.password || "");

        if (userData.phone) {
          formData.append("phone", userData.phone);
        }

        formData.append("image", userData.image);

        const response = await api.post("/auth/signup", formData, {
          withCredentials: false,
        });
        return response.data;
      }

      const response = await api.post("/auth/signup", userData, {
        withCredentials: false,
      });
      return response.data;
    } catch (error) {
      const backendError =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.[0]?.msg;

      const networkError =
        error.code === "ERR_NETWORK"
          ? "Cannot reach server. Check API URL, backend status, and CORS."
          : null;

      return thunkAPI.rejectWithValue(
        backendError ||
          networkError ||
          error.message ||
          "Failed to register user",
      );
    }
  },
);

const forgotPassword = createAsyncThunk(
  "register/forgotPassowrd",
  async (email, thunkAPI) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
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
      const response = await api.post(
        `/auth/verify-email/${encodeURIComponent(token)}`,
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
      const response = await api.post("/auth/login", userData);
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
      const response = await api.post(
        `/auth/reset-password/${encodeURIComponent(token)}`,
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

const resendVerificationEmail = createAsyncThunk(
  "register/resendVerificationEmail",
  async (email, thunkAPI) => {
    try {
      const response = await api.post("/auth/resend-verification-email", {
        email,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to resend verification email",
      );
    }
  },
);

const refreshToken = createAsyncThunk(
  "register/refreshToken",
  async (_, thunkAPI) => {
    try {
      const response = await api.post("/auth/refreshtoken");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to refresh token",
      );
    }
  },
);

const logoutUser = createAsyncThunk(
  "register/logoutUser",
  async (_, thunkAPI) => {
    try {
      const response = await api.post("/auth/logout");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to logout user",
      );
    }
  },
);

const clearAuthState = (state) => {
  state.user = null;
  state.accessToken = null;
  state.loginStatus = "idle";
  state.loginError = null;
  state.error = null;
  persistAuthState({ user: null, accessToken: null });
};

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    logoutLocal: (state) => {
      clearAuthState(state);
    },
  },
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
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        persistAuthState({
          user: action.payload.user,
          accessToken: action.payload.accessToken,
        });
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
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        clearAuthState(state);
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        clearAuthState(state);
        state.error = action.payload || action.error.message;
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
      })
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.verifyMessage =
          action.payload?.message || "Verification email has been resent.";
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        const refreshedUser = action.payload.user || state.user;
        state.accessToken = action.payload.accessToken;
        state.user = refreshedUser;
        persistAuthState({
          user: refreshedUser,
          accessToken: action.payload.accessToken,
        });
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
      });
  },
});

const { logoutLocal } = registerSlice.actions;

const selectIsAuthenticated = (state) =>
  Boolean(state.register.accessToken || state.register.user);

export {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  logoutLocal,
  forgotPassword,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  selectIsAuthenticated,
};
export default registerSlice.reducer;
