import { apiClient } from "./api/client";
import { detectClientLocation, saveUserLoginLocation } from "../utils/geolocation";

export type UserRole =
  | "Administrador"
  | "Analista ML"
  | "Operador de alertas"
  | "Auditor"
  | "Solo lectura";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const TOKEN_KEY = "sepms_access_token";
const USER_KEY = "sepms_auth_user";

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    let clientLoc = null;
    try {
      clientLoc = await detectClientLocation();
    } catch {
      // Ignorar fallo de geolocalización
    }

    const payload: Record<string, unknown> = {
      email,
      password,
    };

    if (clientLoc) {
      payload.city = clientLoc.city;
      payload.region = clientLoc.region;
      payload.latitude = clientLoc.latitude;
      payload.longitude = clientLoc.longitude;
    }

    const response = await apiClient.post<LoginResponse>("/auth/login", payload);

    sessionStorage.setItem(TOKEN_KEY, response.data.access_token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

    if (clientLoc) {
      saveUserLoginLocation({
        email: response.data.user.email,
        role: response.data.user.role,
        city: clientLoc.city,
        region: clientLoc.region,
        department: clientLoc.department,
        latitude: clientLoc.latitude,
        longitude: clientLoc.longitude,
        ip: clientLoc.ip || "127.0.0.1",
        timestamp: new Date().toISOString(),
      });
    }

    return response.data.user;
  },

  async me(): Promise<AuthUser> {
    const response = await apiClient.get<AuthUser>("/auth/me");
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  getStoredUser(): AuthUser | null {
    const value = sessionStorage.getItem(USER_KEY);
    if (!value) return null;

    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      sessionStorage.removeItem(USER_KEY);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
