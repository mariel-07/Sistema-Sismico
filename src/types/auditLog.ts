export type AuditResult = "Correcto" | "Rechazado" | "Error";

export interface AuditLogItem {
  id: string;
  user_id: string | null;
  actor_email: string;
  role: string;
  action: string;
  module: string;
  resource: string;
  result: AuditResult | string;
  description: string;
  ip_address: string;
  created_at: string;
}

