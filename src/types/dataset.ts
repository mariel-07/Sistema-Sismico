export type DatasetStatus = "Listo" | "Revisar" | "Pendiente";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  source: string;
  records: number;
  missing: number;
  duplicates: number;
  invalid: number;
  updatedAt: string;
  status: DatasetStatus;
  fields: string[];
}

