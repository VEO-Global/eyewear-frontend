import axios from "axios";

const UNAUTHORIZED_EVENT = "app:unauthorized";
const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

function normalizeApiBaseUrl(rawBaseUrl) {
  if (!rawBaseUrl || typeof rawBaseUrl !== "string") {
    return DEFAULT_API_BASE_URL;
  }

  const normalizedBaseUrl = rawBaseUrl.trim().replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  return normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;
}

export function getAccessToken() {
  return localStorage.getItem("token");
}

export function clearAccessToken() {
  localStorage.removeItem("token");
}

export function setAccessToken(token) {
  if (!token) {
    clearAccessToken();
    return;
  }

  localStorage.setItem("token", token);
}

function createClient({ withAuth = true } = {}) {
  const client = axios.create({
    baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (withAuth) {
    client.interceptors.request.use((config) => {
      const token = getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401 && withAuth && getAccessToken()) {
        clearAccessToken();
        window.dispatchEvent(
          new CustomEvent(UNAUTHORIZED_EVENT, {
            detail: {
              reason: "unauthorized",
            },
          })
        );
      }

      return Promise.reject(error);
    }
  );

  return client;
}

export const api = createClient({ withAuth: true });
export const publicApi = createClient({ withAuth: false });
export { UNAUTHORIZED_EVENT };

export default api;
