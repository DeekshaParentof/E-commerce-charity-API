import axios from "axios";

export const AUTH_STORAGE_KEY = "auth";
export const AUTH_LOGOUT_EVENT = "auth:logout";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
});

export function getStoredAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getStoredAuth()?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// An expired/invalid token on any request logs the user out everywhere.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && getStoredAuth()?.token) {
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Something went wrong") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK") return "Can't reach the server. Is the API running?";
  return error?.message || fallback;
}

export default api;
