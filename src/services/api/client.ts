import axios from "axios";

// URL base de la API. Conexión por defecto a Render si no se define variable de entorno.
const rawApiUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "https://sistema-sismico-vg5i.onrender.com/api/v1";

const API_BASE_URL = rawApiUrl.endsWith("/api/v1")
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/+$/, "")}/api/v1`;

const TOKEN_KEY = "sepms_access_token";
const USER_KEY = "sepms_auth_user";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { Accept: "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);

      const isLoginRequest = error.config?.url?.includes("/auth/login");
      if (!isLoginRequest && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const detail = error.response.data?.detail;
      if (typeof detail === "string") return detail;
      return `La API respondió con HTTP ${error.response.status}.`;
    }
    if (error.code === "ECONNABORTED") {
      return "La solicitud tardó demasiado.";
    }
    return "No se pudo conectar con el servidor (FastAPI en Render). Verifica tu conexión o el estado del servicio.";
  }
  return "Ocurrió un error inesperado.";
}
