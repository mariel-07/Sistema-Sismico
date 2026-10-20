import { apiClient } from "./client";

export type AlertPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type AlertStatus = "Pendiente" | "Revisada" | "Atendida";

export interface AlertRecord {
  id: string;
  title: string;
  message: string;
  source: string;
  priority: AlertPriority;
  status: AlertStatus;
  created_at: string;
  event_code: string;
  is_read: boolean;
}

export type AlertInput = Omit<AlertRecord, "id" | "created_at">;
export type AlertUpdate = Partial<AlertInput>;

export async function getAlerts(): Promise<AlertRecord[]> {
  const { data } = await apiClient.get<AlertRecord[]>("/alerts");
  return data;
}

export async function createAlert(input: AlertInput): Promise<AlertRecord> {
  const { data } = await apiClient.post<AlertRecord>("/alerts", input);
  return data;
}

export async function updateAlert(id: string, updates: AlertUpdate): Promise<AlertRecord> {
  const { data } = await apiClient.patch<AlertRecord>(`/alerts/${id}`, updates);
  return data;
}
