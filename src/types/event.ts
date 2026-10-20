export interface SeismicEvent {
  id: string;
  external_id: string | null;
  data_source_id: string | null;
  ingestion_run_id: string | null;
  origin_time_utc: string;
  latitude: number;
  longitude: number;
  depth_km: number;
  magnitude: number;
  magnitude_type: string | null;
  reference_location: string | null;
  department: string | null;
  province: string | null;
  district: string | null;
  event_status: string;
  review_status: string;
  source_hash: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  source_record_id: number | null;
}

export interface EventsQuery {
  limit?: number;
  offset?: number;
  min_magnitude?: number;
  max_magnitude?: number;
  start?: string;
  end?: string;
}

export interface MapEventsQuery {
  min_magnitude?: number;
  limit?: number;
}

export interface EventStatistics {
  total_events: number;
  maximum_magnitude: number | null;
  average_magnitude: number | null;
  average_depth_km: number | null;
}