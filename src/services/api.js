import axios from "axios";

const UNAUTHORIZED_EVENT = "app:unauthorized";
const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

export function normalizeApiBaseUrl(rawBaseUrl) {
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

export function buildApiUrl(path) {
  const baseUrl = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
  const normalizedPath = String(path || "").trim();

  if (!normalizedPath) {
    return baseUrl;
  }

  return normalizedPath.startsWith("/")
    ? `${baseUrl}${normalizedPath}`
    : `${baseUrl}/${normalizedPath}`;
}

export function buildAuthenticatedSseUrl(path) {
  const token = getAccessToken();
  const url = new URL(buildApiUrl(path));

  if (token) {
    // Native EventSource cannot attach Authorization headers, so we pass the token
    // as query params for backends that support SSE auth via URL.
    url.searchParams.set("access_token", token);
    url.searchParams.set("token", token);
  }

  return url.toString();
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
