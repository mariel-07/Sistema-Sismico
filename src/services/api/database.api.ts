import { apiClient } from "./client";

export interface DatabaseHealth {
  status: string;
  database: string;
  connection: boolean;
}

export interface SystemStatus {
  status: string;
  service: string;
  database: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const response = await apiClient.get<DatabaseHealth>("/database/health");
  return response.data;
}

export async function checkSystemStatus(): Promise<SystemStatus> {
  const response = await apiClient.get<SystemStatus>("/status");
  return response.data;
}

