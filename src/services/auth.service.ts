import { apiClient } from "./api/client";

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
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    sessionStorage.setItem(TOKEN_KEY, response.data.access_token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

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
