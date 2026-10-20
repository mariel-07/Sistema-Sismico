import { apiClient } from "./client";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role:
    | "Administrador"
    | "Analista ML"
    | "Operador de alertas"
    | "Auditor"
    | "Solo lectura";
  is_active: boolean;
  created_at: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: ApiUser["role"];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: ApiUser["role"];
  is_active?: boolean;
}

export async function listUsers(): Promise<ApiUser[]> {
  const response = await apiClient.get<ApiUser[]>("/users");
  return response.data;
}

export async function createUser(data: CreateUserInput): Promise<ApiUser> {
  const response = await apiClient.post<ApiUser>("/users", data);
  return response.data;
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput,
): Promise<ApiUser> {
  const response = await apiClient.patch<ApiUser>(`/users/${userId}`, data);
  return response.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
