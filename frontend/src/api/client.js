import axios from "axios";

// In production (same-origin Vercel deploy) this should be the relative "/api" so
// requests go through the project's own rewrite to the "server" service - no CORS,
// no separate URL to manage. In local dev it points at the standalone Express server.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5010/api";

export const apiClient = axios.create({ baseURL: BASE_URL });

const TOKEN_KEY = "fwr_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export const extractErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  return error?.response?.data?.message || error?.message || fallback;
};
