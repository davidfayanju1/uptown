// lib/axios.ts
"use client";
import axios from "axios";
import useUserStore from "../stores/auth-store";

const API_BASE_URL = "https://uptown-api-00m6.onrender.com";

const REFRESH_URL = "/v1/auth/refresh";

// The store is the source of truth; localStorage is only a legacy fallback for
// flows that wrote the token directly (e.g. OTP verification).
const getAccessToken = () =>
  useUserStore.getState().accessToken || localStorage.getItem("token");

const getRefreshToken = () =>
  useUserStore.getState().refreshToken || localStorage.getItem("refresh_token");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store session ID
let sessionId = null;

let isLoggingOut = false;

const logoutUser = () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  // Clear all auth data (store clears localStorage.token for us)
  useUserStore.getState().clearUserData();
  localStorage.removeItem("refresh_token");
  delete api.defaults.headers.common["Authorization"];

  // Reset flag after a delay
  setTimeout(() => {
    isLoggingOut = false;
  }, 1000);
};

// Get session ID from localStorage on initialization
if (typeof window !== "undefined") {
  sessionId = localStorage.getItem("x-session-id");
}

// Request interceptor to add auth token and session ID
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach session ID to request headers if available
    if (sessionId) {
      config.headers["x-session-id"] = sessionId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to capture session ID and handle auth errors
api.interceptors.response.use(
  (response) => {
    // Capture session ID from response headers
    const responseSessionId = response.headers["x-session-id"];
    if (responseSessionId) {
      sessionId = responseSessionId;
      // Store in localStorage for persistence across page reloads
      if (typeof window !== "undefined") {
        localStorage.setItem("x-session-id", responseSessionId);
      }
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isRefreshCall = originalRequest?.url?.includes(REFRESH_URL);

    // Handle token expiration (401). Never try to refresh the refresh call
    // itself — that recurses until the stack blows.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshCall
    ) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await api.post(REFRESH_URL, {
            refresh_token: refreshToken,
          });
          const tokens = response.data?.data?.tokens || {};
          const newToken = tokens.access_token;

          if (!newToken) throw new Error("No access token in refresh response");

          // Keep the store and localStorage in sync
          useUserStore
            .getState()
            .setTokens(newToken, tokens.refresh_token || refreshToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

          // Capture session ID from refresh response as well
          const refreshSessionId = response.headers["x-session-id"];
          if (refreshSessionId) {
            sessionId = refreshSessionId;
            localStorage.setItem("x-session-id", refreshSessionId);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          if (sessionId) {
            originalRequest.headers["x-session-id"] = sessionId;
          }
          return api(originalRequest);
        } catch (refreshError) {
          console.log("Token refresh failed, logging out user");
          logoutUser();
          return Promise.reject(refreshError);
        }
      }

      // No refresh token to work with — the session is genuinely over.
      logoutUser();
    }

    return Promise.reject(error);
  },
);

// Helper function to get current session ID
export const getSessionId = () => sessionId;

// Helper function to clear session ID (e.g., on logout)
export const clearSessionId = () => {
  sessionId = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("x-session-id");
  }
};

// Helper function to set session ID manually if needed
export const setSessionId = (id) => {
  sessionId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem("x-session-id", id);
  }
};

export default api;
