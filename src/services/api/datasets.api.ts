import { apiClient } from "./client";

export interface DatasetQuality {
  total_records: number;
  missing_optional_values: number;
  invalid_coordinate_records: number;
  negative_depth_records: number;
  duplicate_source_hash_groups: number;
}

export async function getDatasetQuality(): Promise<DatasetQuality> {
  const response = await apiClient.get<DatasetQuality>("/datasets/quality");
  return response.data;
}
