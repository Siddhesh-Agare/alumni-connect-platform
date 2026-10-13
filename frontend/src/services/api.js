import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor: attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: if the token is invalid/expired, log the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Turns the backend's { errors: [{ field, message }] } into { field: message } for inline form errors
export const getFieldErrors = (err) => {
  const list = err.response?.data?.errors;
  return Array.isArray(list) ? Object.fromEntries(list.map((e) => [e.field.split(".")[0], e.message])) : {};
};

export const getError = (err) => err.response?.data?.message || err.message || "Something went wrong";

export default api;
