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

export const publicApi = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

function getRequestPath(config) {
  const rawUrl = config?.url;

  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  try {
    const parsedUrl = rawUrl.startsWith("http") ? new URL(rawUrl) : new URL(rawUrl, api.defaults.baseURL);
    return parsedUrl.pathname || "";
  } catch {
    return rawUrl;
  }
}

function isPublicRequest(config) {
  const requestPath = getRequestPath(config);
  return requestPath.includes("/public/");
}

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
    const hasToken = Boolean(localStorage.getItem("token"));

    // network error
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(error);
    }

    // token expired
    if (error.response.status === 401 && hasToken && !isPublicRequest(error.config)) {
      localStorage.removeItem("token");
      window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  }
);

export default api;
