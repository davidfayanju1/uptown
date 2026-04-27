// lib/axios.ts
"use client";
import axios from "axios";

const API_BASE_URL = "https://uptown-api-00m6.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Store session ID
let sessionId = null;

// Get session ID from localStorage on initialization
if (typeof window !== "undefined") {
  sessionId = localStorage.getItem("x-session-id");
}

// Request interceptor to add auth token and session ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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

    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Try to refresh token
          const response = await api.post("/auth/refresh-token");
          const newToken = response.data.token;

          // Update store with new token
          localStorage.setItem("token", newToken);

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
        }
      } catch (refreshError) {
        console.log("Token refresh failed, logging out user");
        return Promise.reject(refreshError);
      }
    }

    // Handle other auth errors
    if (error.response?.status === 403 || error.response?.status === 401) {
      console.log("Auth error detected, logging out user");
      localStorage.removeItem("token");
      // Don't remove session ID as it might still be valid
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
