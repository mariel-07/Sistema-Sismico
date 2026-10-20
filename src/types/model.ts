export interface ModelRegistryItem {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  status: "En producción" | "En evaluación" | "Archivado";
  purpose: string;
  accuracyMetric?: string;
  accuracyValue?: number;
  lastTrainedAt?: string;
  description: string;
}

