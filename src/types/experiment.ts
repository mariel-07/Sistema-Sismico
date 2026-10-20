export interface Experiment {
  id: string;
  name: string;
  description: string;
  modelType: string;
  datasetName: string;
  recordsCount: number;
  metrics: {
    meanMagnitude?: number;
    maxMagnitude?: number;
    meanDepthKm?: number;
    sampleCount?: number;
  };
  createdAt: string;
  status: "Completado" | "En ejecución" | "Borrador";
}

