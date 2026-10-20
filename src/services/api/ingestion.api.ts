import { apiClient } from "./client";

export interface IngestionRun {
  id: string;
  data_source_id: string;
  source_name: string | null;
  status: string;
  records_received: number;
  records_inserted: number;
  records_updated: number;
  records_duplicated: number;
  records_rejected: number;
  error_details: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string | null;
  duration_seconds: number | null;
  execution_metadata?: Record<string, unknown> | null;
}

export interface IngestionRunsParams {
  limit?: number;
  offset?: number;
  status?: string;
}

export async function getIngestionRuns(
  params: IngestionRunsParams = {},
): Promise<IngestionRun[]> {
  const response = await apiClient.get<IngestionRun[]>("/ingestion-runs/", {
    params,
  });
  return response.data;
}

export async function getIngestionRun(
  runId: string,
): Promise<IngestionRun> {
  const response = await apiClient.get<IngestionRun>(
    `/ingestion-runs/${runId}`,
  );
  return response.data;
}
