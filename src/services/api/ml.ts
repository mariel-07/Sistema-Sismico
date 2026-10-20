import { apiClient } from "./client";

export type MlAnalysis = {
  status: string;
  purpose: string;
  is_earthquake_prediction: boolean;
  model: string;
  filters: {
    min_magnitude: number;
  };
  sample_count: number;
  metrics: {
    mean_magnitude: number | null;
    min_magnitude: number | null;
    max_magnitude: number | null;
    mean_depth_km: number | null;
    min_depth_km: number | null;
    max_depth_km: number | null;
    mean_latitude: number | null;
    mean_longitude: number | null;
  };
  limitations: string[];
};

export async function getMlAnalysis(
  minMagnitude = 0,
): Promise<MlAnalysis> {
  const response = await apiClient.get<MlAnalysis>("/ml/analysis", {
    params: { min_magnitude: minMagnitude },
  });

  return response.data;
}
