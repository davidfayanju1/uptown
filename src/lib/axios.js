// lib/axios.ts
"use client";
import axios from "axios";

const API_BASE_URL = "https://uptown-api.onrender.com";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
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

          localStorage.setItem(newToken, "token");
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
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
    }

    return Promise.reject(error);
  }
);

export default api;
