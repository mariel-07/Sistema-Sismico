export type AlertPriority = "Crítica" | "Alta" | "Media" | "Baja";
export type AlertStatus = "Pendiente" | "Revisada" | "Atendida";

export interface Alert {
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

