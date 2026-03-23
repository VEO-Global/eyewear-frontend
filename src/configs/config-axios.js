import axios from "axios";

function normalizeApiBaseUrl(rawBaseUrl) {
  const fallbackBaseUrl = "http://localhost:8080/api";

  if (!rawBaseUrl || typeof rawBaseUrl !== "string") {
    return fallbackBaseUrl;
  }

  const normalizedBaseUrl = rawBaseUrl.trim().replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    return fallbackBaseUrl;
  }

  return normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // network error
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(error);
    }

    // token expired
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
