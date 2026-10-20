import { apiClient } from "./client";

export interface DataSource {
  id: string;
  name: string;
  organization: string | null;
  source_type: string;
  base_url: string | null;
  description: string | null;
  license_info: string | null;
  is_active: boolean;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_latency_ms: number | null;
  created_at: string | null;
  updated_at: string | null;
  total_runs: number;
  last_sync_status: string | null;
  last_sync: string | null;
}

export interface DataSourceCreate {
  name: string;
  organization?: string | null;
  source_type?: string;
  base_url?: string | null;
  description?: string | null;
  license_info?: string | null;
  is_active?: boolean;
}

export async function getSources(): Promise<DataSource[]> {
  const response = await apiClient.get<DataSource[]>("/sources/");
  return response.data;
}

export async function createSource(
  source: DataSourceCreate,
): Promise<DataSource> {
  const response = await apiClient.post<DataSource>("/sources/", source);
  return response.data;
}

export async function updateSourceStatus(
  sourceId: string,
  isActive: boolean,
): Promise<{ id: string; name: string; is_active: boolean }> {
  const response = await apiClient.patch<{
    id: string;
    name: string;
    is_active: boolean;
  }>(`/sources/${sourceId}`, { is_active: isActive });

  return response.data;
}



