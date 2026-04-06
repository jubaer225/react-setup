import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const isPublicAuthRoute = (url = "") => {
  return [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/verify-email",
    "/auth/resend-verification-email",
    "/auth/reset-password",
    "/auth/refreshtoken",
  ].some((path) => url.includes(path));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token && !isPublicAuthRoute(config.url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error, token = null) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(token);
  });

  pendingRequests = [];
};

const shouldSkipRefresh = (url = "") => {
  return [
    "/auth/login",
    "/auth/signup",
    "/auth/refreshtoken",
    "/auth/logout",
  ].some((path) => url.includes(path));
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refreshtoken`,
        {},
        { withCredentials: true },
      );

      const newAccessToken =
        refreshResponse.data?.accessToken || refreshResponse.data?.token;

      if (!newAccessToken) {
        throw new Error("Refresh response did not include an access token.");
      }

      localStorage.setItem("accessToken", newAccessToken);
      resolvePendingRequests(null, newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem("accessToken");
      resolvePendingRequests(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
