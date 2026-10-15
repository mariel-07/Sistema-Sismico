import { useMemo, useState } from "react";
import {
  Archive,
  BrainCircuit,
  CheckCircle2,
  Eye,
  FlaskConical,
  Search,
  X,
} from "lucide-react";

type ModelStatus = "Experimental" | "Validación" | "Archivado";

interface MLModel {
  id: number;
  name: string;
  version: string;
  algorithm: string;
  target: string;
  dataset: string;
  owner: string;
  status: ModelStatus;
  metricName: string;
  metricValue: string;
  createdAt: string;
  description: string;
}

const initialModels: MLModel[] = [
  {
    id: 1,
    name: "Clasificador de eventos sísmicos",
    version: "v0.3.0",
    algorithm: "Random Forest",
    target: "Clasificación de eventos",
    dataset: "Eventos históricos de prueba",
    owner: "Equipo de análisis",
    status: "Experimental",
    metricName: "F1 de prueba",
    metricValue: "0.84",
    createdAt: "2026-10-10",
    description:
      "Prototipo experimental para clasificar registros históricos etiquetados. Requiere validación adicional antes de cualquier uso operativo.",
  },
  {
    id: 2,
    name: "Análisis de señales",
    version: "v0.2.1",
    algorithm: "Regresión logística",
    target: "Categoría de señal",
    dataset: "Señales de demostración",
    owner: "Equipo de análisis",
    status: "Validación",
    metricName: "Exactitud de prueba",
    metricValue: "0.79",
    createdAt: "2026-10-08",
    description:
      "Modelo de evaluación para datos de ejemplo. Su estado de validación no representa una aprobación científica u operativa.",
  },
  {
    id: 3,
    name: "Control de calidad de registros",
    version: "v0.1.0",
    algorithm: "Isolation Forest",
    target: "Anomalías en registros",
    dataset: "Dataset de demostración",
    owner: "Administrador",
    status: "Experimental",
    metricName: "Registros evaluados",
    metricValue: "1,200",
    createdAt: "2026-10-05",
    description:
      "Prototipo para explorar registros atípicos y apoyar los procesos de revisión de calidad de datos.",
  },
  {
    id: 4,
    name: "Modelo base de señales",
    version: "v0.1.0",
    algorithm: "Modelo de referencia",
    target: "Variable de prueba",
    dataset: "Datos sintéticos",
    owner: "Administrador",
    status: "Archivado",
    metricName: "Métrica de referencia",
    metricValue: "0.65",
    createdAt: "2026-09-28",
    description:
      "Modelo de referencia conservado para comparar futuras pruebas. No está habilitado para uso operativo.",
  },
];

const statusClass: Record<ModelStatus, string> = {
  Experimental: "ml-model-status--experimental",
  Validación: "ml-model-status--validation",
  Archivado: "ml-model-status--archived",
};

export default function ModelsPage() {
  const [models, setModels] = useState<MLModel[]>(initialModels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedModel, setSelectedModel] = useState<MLModel | null>(null);

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch = [
        model.name,
        model.algorithm,
        model.version,
        model.dataset,
        model.owner,
        model.target,
      ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "Todos" || model.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [models, search, statusFilter]);

  const experimentalCount = models.filter(
    (model) => model.status === "Experimental",
  ).length;

  const validationCount = models.filter(
    (model) => model.status === "Validación",
  ).length;

  const archivedCount = models.filter(
    (model) => model.status === "Archivado",
  ).length;

  function toggleArchive(model: MLModel) {
    const nextStatus: ModelStatus =
      model.status === "Archivado" ? "Experimental" : "Archivado";

    const confirmed = window.confirm(
      nextStatus === "Archivado"
        ? `¿Deseas archivar "${model.name}"?`
        : `¿Deseas devolver "${model.name}" al estado experimental?`,
    );

    if (!confirmed) return;

    setModels((current) =>
      current.map((item) =>
        item.id === model.id ? { ...item, status: nextStatus } : item,
      ),
    );

    setSelectedModel(null);
  }

  return (
    <main className="module-page ml-models-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTELIGENCIA ARTIFICIAL</span>
          <h1>Registro de modelos</h1>
          <p>
            Administra versiones y consulta los resultados de las pruebas
            experimentales.
          </p>
        </div>

        <div className="ml-models-heading-icon">
          <BrainCircuit size={28} />
        </div>
      </header>

      <div className="demo-notice">
        <FlaskConical size={18} />
        <p>
          <strong>Entorno de demostración:</strong> los modelos y las métricas
          mostrados son ficticios. Esta pantalla no realiza predicciones
          sísmicas ni sustituye la evaluación científica.
        </p>
      </div>

      <section className="metrics-grid ml-models-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Modelos registrados</span>
            <span className="metric-icon metric-blue">
              <BrainCircuit size={20} />
            </span>
          </div>
          <div className="metric-value">{models.length}</div>
          <p className="metric-description">Versiones en el catálogo local</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Experimentales</span>
            <span className="metric-icon metric-violet">
              <FlaskConical size={20} />
            </span>
          </div>
          <div className="metric-value">{experimentalCount}</div>
          <p className="metric-description">Pendientes de evaluación</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">En validación</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <div className="metric-value">{validationCount}</div>
          <p className="metric-description">En revisión experimental</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Archivados</span>
            <span className="metric-icon metric-orange">
              <Archive size={20} />
            </span>
          </div>
          <div className="metric-value">{archivedCount}</div>
          <p className="metric-description">Conservados como referencia</p>
        </article>
      </section>

      <section className="panel ml-models-panel">
        <div className="panel-heading ml-models-panel-heading">
          <div>
            <h2>Catálogo de modelos</h2>
            <p>Busca modelos por nombre, algoritmo, versión o dataset.</p>
          </div>
          <span className="ml-models-count">
            {filteredModels.length} resultado(s)
          </span>
        </div>

        <div className="ml-models-toolbar">
          <label className="ml-models-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Buscar modelos..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            className="ml-models-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar modelos por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Experimental">Experimental</option>
            <option value="Validación">Validación</option>
            <option value="Archivado">Archivado</option>
          </select>
        </div>

        {filteredModels.length === 0 ? (
          <div className="ml-models-empty">
            <BrainCircuit size={32} />
            <h3>No se encontraron modelos</h3>
            <p>Prueba otra búsqueda o cambia el filtro de estado.</p>
          </div>
        ) : (
          <div className="ml-models-table-wrap">
            <table className="ml-models-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Algoritmo</th>
                  <th>Versión</th>
                  <th>Métrica de prueba</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id}>
                    <td>
                      <div className="ml-model-name">
                        <span className="ml-model-avatar">
                          <BrainCircuit size={19} />
                        </span>
                        <div>
                          <strong>{model.name}</strong>
                          <span>{model.dataset}</span>
                        </div>
                      </div>
                    </td>
                    <td>{model.algorithm}</td>
                    <td>
                      <code className="ml-model-version">{model.version}</code>
                    </td>
                    <td>
                      <div className="ml-model-metric">
                        <strong>{model.metricValue}</strong>
                        <span>{model.metricName}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ml-model-status ${statusClass[model.status]}`}
                      >
                        {model.status}
                      </span>
                    </td>
                    <td>
                      <div className="ml-model-actions">
                        <button
                          type="button"
                          className="ml-model-action"
                          title="Ver detalles"
                          aria-label={`Ver detalles de ${model.name}`}
                          onClick={() => setSelectedModel(model)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          className="ml-model-action"
                          title={
                            model.status === "Archivado"
                              ? "Restaurar como experimental"
                              : "Archivar modelo"
                          }
                          aria-label={`Cambiar estado de ${model.name}`}
                          onClick={() => toggleArchive(model)}
                        >
                          <Archive size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedModel && (
        <div
          className="ml-model-modal-backdrop"
          onClick={() => setSelectedModel(null)}
        >
          <section
            className="ml-model-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ml-model-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ml-model-modal-header">
              <div>
                <span className="eyebrow">DETALLE DEL MODELO</span>
                <h2 id="ml-model-modal-title">{selectedModel.name}</h2>
              </div>
              <button
                type="button"
                className="ml-model-action"
                aria-label="Cerrar detalles"
                onClick={() => setSelectedModel(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ml-model-detail-grid">
              <div>
                <span>Versión</span>
                <strong>{selectedModel.version}</strong>
              </div>
              <div>
                <span>Algoritmo</span>
                <strong>{selectedModel.algorithm}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{selectedModel.status}</strong>
              </div>
              <div>
                <span>Fecha de registro</span>
                <strong>{selectedModel.createdAt}</strong>
              </div>
              <div>
                <span>Variable objetivo</span>
                <strong>{selectedModel.target}</strong>
              </div>
              <div>
                <span>Responsable</span>
                <strong>{selectedModel.owner}</strong>
              </div>
              <div className="ml-model-detail-full">
                <span>Dataset utilizado</span>
                <strong>{selectedModel.dataset}</strong>
              </div>
              <div className="ml-model-detail-full">
                <span>Métrica registrada (demostración)</span>
                <strong>
                  {selectedModel.metricName}: {selectedModel.metricValue}
                </strong>
              </div>
              <div className="ml-model-detail-full">
                <span>Descripción</span>
                <p>{selectedModel.description}</p>
              </div>
            </div>

            <div className="ml-model-modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedModel(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => toggleArchive(selectedModel)}
              >
                {selectedModel.status === "Archivado"
                  ? "Restaurar modelo"
                  : "Archivar modelo"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
