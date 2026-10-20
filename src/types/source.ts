export interface DataSource {
  id: string;
  name: string;
  organization?: string;
  source_type: string;
  base_url?: string;
  description?: string;
  license_info?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_runs?: number;
  last_sync_status?: string;
  last_sync?: string;
}

