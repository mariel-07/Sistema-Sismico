import { apiClient } from "./client";

export interface AuditLog {
  id: string;
  user_id: string | null;
  actor_email: string;
  role: string;
  action: string;
  module: string;
  resource: string;
  result: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export async function listAuditLogs(): Promise<AuditLog[]> {
  const response = await apiClient.get<AuditLog[]>("/audit-logs");
  return response.data;
}
