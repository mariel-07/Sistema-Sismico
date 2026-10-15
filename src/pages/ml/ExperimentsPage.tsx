
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Cpu,
  Eye,
  FlaskConical,
  Plus,
  Search,
  ShieldAlert,
  XCircle,
    AlertTriangle,
} from "lucide-react";
import './ml.css';
type ExperimentStatus = "Completado" | "Pendiente" | "En ejecución" | "Fallido";

type Experiment = {
  id: string;
  name: string;
  dataset: string;
  algorithm: string;
  target: string;
  features: number;
  status: ExperimentStatus;
  createdAt: string;
  durationSeconds: number;
  mae: number | null;
  rmse: number | null;
  r2: number | null;
  description: string;
};

const initialExperiments: Experiment[] = [
  {
    id: "EXP-001",
    name: "Regresión de magnitud — demo",
    dataset: "DS-002",
    algorithm: "Random Forest",
    target: "magnitude",
    features: 4,
    status: "Completado",
    createdAt: "15/10/2026 08:20",
    durationSeconds: 18,
    mae: 0.32,
    rmse: 0.46,
    r2: 0.81,
    description:
      "Registro ficticio para demostrar cómo se presenta un experimento de regresión.",
  },
  {
    id: "EXP-002",
    name: "Análisis de profundidad — demo",
    dataset: "DS-004",
    algorithm: "MLP Regressor",
    target: "depth_km",
    features: 3,
    status: "Pendiente",
    createdAt: "15/10/2026 09:10",
    durationSeconds: 0,
    mae: null,
    rmse: null,
    r2: null,
    description:
      "Experimento de ejemplo aún no ejecutado en un motor de entrenamiento real.",
  },
  {
    id: "EXP-003",
    name: "Comparación de variables — demo",
    dataset: "DS-001",
    algorithm: "Random Forest",
    target: "magnitude",
    features: 5,
    status: "Completado",
    createdAt: "14/10/2026 16:45",
    durationSeconds: 24,
    mae: 0.41,
    rmse: 0.59,
    r2: 0.73,
    description:
      "Resultados ilustrativos que no proceden de un entrenamiento real.",
  },
];

const algorithms = [
  "Random Forest",
  "Regresión lineal",
  "MLP Regressor",
];

const datasetOptions = [
  { id: "DS-001", name: "Catálogo sísmico de demostración" },
  { id: "DS-002", name: "Dataset de magnitud y profundidad" },
  { id: "DS-003", name: "Histórico regional de prueba" },
  { id: "DS-004", name: "Variables geográficas de prueba" },
];

function StatusBadge({ status }: { status: ExperimentStatus }) {
  const className: Record<ExperimentStatus, string> = {
    Completado: "experiment-status-completed",
    Pendiente: "experiment-status-pending",
    "En ejecución": "experiment-status-running",
    Fallido: "experiment-status-failed",
  };

  return (
    <span className={`experiment-status ${className[status]}`}>
      <span />
      {status}
    </span>
  );
}

function MetricValue({ value }: { value: number | null }) {
  return (
    <strong>
      {value === null ? "—" : value.toFixed(3)}
    </strong>
  );
}

export default function ExperimentsPage() {
  const [experiments, setExperiments] =
    useState<Experiment[]>(initialExperiments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Experiment | null>(null);
  const [notice, setNotice] = useState(
    "Los experimentos y las métricas iniciales son demostrativos; todavía no hay un motor de entrenamiento conectado."
  );

  const [form, setForm] = useState({
    name: "",
    dataset: "DS-002",
    algorithm: "Random Forest",
    target: "magnitude",
    features: ["latitude", "longitude", "depth_km"],
    description: "",
  });

  const [runningId, setRunningId] = useState<string | null>(null);

  const filteredExperiments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return experiments.filter((experiment) => {
      const matchesSearch =
        experiment.name.toLowerCase().includes(query) ||
        experiment.id.toLowerCase().includes(query) ||
        experiment.algorithm.toLowerCase().includes(query) ||
        experiment.dataset.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "Todos" || experiment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [experiments, search, statusFilter]);

  const completedCount = experiments.filter(
    (experiment) => experiment.status === "Completado"
  ).length;

  const pendingCount = experiments.filter(
    (experiment) => experiment.status === "Pendiente"
  ).length;

  const algorithmCount = new Set(
    experiments.map((experiment) => experiment.algorithm)
  ).size;

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newExperiment: Experiment = {
      id: `EXP-${String(Date.now()).slice(-6)}`,
      name: form.name.trim(),
      dataset: form.dataset,
      algorithm: form.algorithm,
      target: form.target,
      features: form.features.length,
      status: "Pendiente",
      createdAt: new Date().toLocaleString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      durationSeconds: 0,
      mae: null,
      rmse: null,
      r2: null,
      description:
        form.description.trim() ||
        "Experimento registrado localmente para pruebas de interfaz.",
    };

    setExperiments((current) => [newExperiment, ...current]);
    setForm({
      name: "",
      dataset: "DS-002",
      algorithm: "Random Forest",
      target: "magnitude",
      features: ["latitude", "longitude", "depth_km"],
      description: "",
    });
    setShowForm(false);
    setNotice(
      "Experimento creado localmente. Para entrenar un modelo real se necesita conectar el backend."
    );
  }

  function simulateExecution(experiment: Experiment) {
    if (runningId !== null) return;

    setRunningId(experiment.id);
    setExperiments((current) =>
      current.map((item) =>
        item.id === experiment.id
          ? { ...item, status: "En ejecución" }
          : item
      )
    );
    setNotice(
      `Ejecutando una simulación visual para ${experiment.id}; no se está entrenando ningún modelo real.`
    );

    window.setTimeout(() => {
      // Valores fijos de demostración: no son métricas obtenidas por entrenamiento.
      const result: Experiment = {
        ...experiment,
        status: "Completado",
        durationSeconds: 2,
        mae: 0.35,
        rmse: 0.49,
        r2: 0.78,
        description:
          "Métricas ficticias asignadas por la simulación de la interfaz. No corresponden a un modelo entrenado.",
      };

      setExperiments((current) =>
        current.map((item) =>
          item.id === experiment.id ? result : item
        )
      );
      setSelected((current) =>
        current?.id === experiment.id ? result : current
      );
      setRunningId(null);
      setNotice(
        `Simulación visual finalizada para ${experiment.id}. Las métricas mostradas no son resultados científicos.`
      );
    }, 1200);
  }

  function toggleFeature(feature: string) {
    setForm((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  return (
    <section className="module-page experiments-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTELIGENCIA ARTIFICIAL / LABORATORIO</span>
          <h1>Experimentos de Machine Learning</h1>
          <p>
            Organiza datasets, algoritmos, variables objetivo y evaluaciones
            experimentales.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? <XCircle size={18} /> : <Plus size={18} />}
          {showForm ? "Cancelar" : "Nuevo experimento"}
        </button>
      </header>

      <div className="demo-notice experiment-demo-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Laboratorio en modo demostración</strong>
          <p>{notice}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Experimentos registrados</span>
            <span className="metric-icon metric-blue">
              <FlaskConical size={20} />
            </span>
          </div>
          <strong className="metric-value">{experiments.length}</strong>
          <span className="metric-description">Experimentos locales</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Completados</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <strong className="metric-value">{completedCount}</strong>
          <span className="metric-description">Incluye resultados ficticios</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Pendientes</span>
            <span className="metric-icon metric-orange">
              <Clock3 size={20} />
            </span>
          </div>
          <strong className="metric-value">{pendingCount}</strong>
          <span className="metric-description">Esperan ejecución</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Algoritmos utilizados</span>
            <span className="metric-icon metric-violet">
              <Cpu size={20} />
            </span>
          </div>
          <strong className="metric-value">{algorithmCount}</strong>
          <span className="metric-description">Algoritmos seleccionados</span>
        </article>
      </div>

      {showForm && (
        <section className="panel experiment-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Configurar experimento</h2>
              <p>
                Define los parámetros que se enviarán al futuro servicio de
                entrenamiento.
              </p>
            </div>
          </div>

          <form className="experiment-form" onSubmit={handleCreate}>
            <label>
              Nombre del experimento
              <input
                required
                minLength={3}
                maxLength={100}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Ej. Evaluación del modelo regional"
              />
            </label>

            <label>
              Dataset
              <select
                value={form.dataset}
                onChange={(event) =>
                  setForm({ ...form, dataset: event.target.value })
                }
              >
                {datasetOptions.map((dataset) => (
                  <option key={dataset.id} value={dataset.id}>
                    {dataset.id} — {dataset.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Algoritmo
              <select
                value={form.algorithm}
                onChange={(event) =>
                  setForm({ ...form, algorithm: event.target.value })
                }
              >
                {algorithms.map((algorithm) => (
                  <option key={algorithm} value={algorithm}>
                    {algorithm}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Variable objetivo
              <select
                value={form.target}
                onChange={(event) =>
                  setForm({ ...form, target: event.target.value })
                }
              >
                <option value="magnitude">Magnitud (magnitude)</option>
                <option value="depth_km">Profundidad (depth_km)</option>
              </select>
            </label>

            <fieldset className="experiment-features">
              <legend>Variables de entrada</legend>
              {[
                ["latitude", "Latitud"],
                ["longitude", "Longitud"],
                ["depth_km", "Profundidad (km)"],
                ["magnitude", "Magnitud"],
              ].map(([value, label]) => (
                <label key={value} className="experiment-feature-option">
                  <input
                    type="checkbox"
                    checked={form.features.includes(value)}
                    disabled={form.target === value}
                    onChange={() => toggleFeature(value)}
                  />
                  <span>{label}</span>
                </label>
              ))}
              <small>
                La variable objetivo no puede seleccionarse también como
                entrada.
              </small>
            </fieldset>

            <label className="experiment-description-field">
              Descripción (opcional)
              <textarea
                rows={3}
                maxLength={500}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Describe el objetivo y las limitaciones del experimento."
              />
            </label>

            <div className="experiment-form-note">
              <AlertTriangle size={17} />
              <span>
                El registro no entrena un modelo. La preparación de datos,
                separación de conjuntos y validación se implementarán en el
                backend.
              </span>
            </div>

            <div className="experiment-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="primary-button"
                disabled={form.features.length === 0}
              >
                <Plus size={17} />
                Registrar experimento
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel experiment-list-panel">
        <div className="panel-heading experiment-list-heading">
          <div>
            <h2>Historial de experimentos</h2>
            <p>Consulta configuraciones, estados y métricas disponibles.</p>
          </div>
          <span className="source-total">
            {filteredExperiments.length} resultado(s)
          </span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar experimento, ID o algoritmo..."
              aria-label="Buscar experimentos"
            />
          </label>

          <select
            className="source-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar experimentos por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Completado">Completados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="En ejecución">En ejecución</option>
            <option value="Fallido">Fallidos</option>
          </select>
        </div>

        <div className="source-table-wrapper">
          <table className="source-table experiment-table">
            <thead>
              <tr>
                <th>Experimento</th>
                <th>Algoritmo</th>
                <th>Dataset</th>
                <th>Objetivo</th>
                <th>Estado</th>
                <th>MAE*</th>
                <th>RMSE*</th>
                <th>R²*</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredExperiments.map((experiment) => (
                <tr key={experiment.id}>
                  <td>
                    <div className="experiment-identity">
                      <strong>{experiment.name}</strong>
                      <span>{experiment.id}</span>
                    </div>
                  </td>
                  <td>{experiment.algorithm}</td>
                  <td>{experiment.dataset}</td>
                  <td>
                    <code>{experiment.target}</code>
                  </td>
                  <td>
                    <StatusBadge status={experiment.status} />
                  </td>
                  <td>
                    <MetricValue value={experiment.mae} />
                  </td>
                  <td>
                    <MetricValue value={experiment.rmse} />
                  </td>
                  <td>
                    <MetricValue value={experiment.r2} />
                  </td>
                  <td>
                    <div className="source-actions">
                      <button
                        className="source-action-button"
                        onClick={() => setSelected(experiment)}
                        title="Ver detalles"
                        aria-label={`Ver ${experiment.name}`}
                      >
                        <Eye size={16} />
                      </button>
                      {experiment.status === "Pendiente" && (
                        <button
                          className="source-action-button"
                          disabled={runningId !== null}
                          onClick={() => simulateExecution(experiment)}
                          title="Simular ejecución"
                          aria-label={`Simular ${experiment.name}`}
                        >
                          <Activity
                            size={16}
                            className={
                              runningId === experiment.id ? "spin" : ""
                            }
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredExperiments.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="source-empty-state">
                      <FlaskConical size={28} />
                      <strong>No se encontraron experimentos</strong>
                      <span>Cambia los filtros o crea un experimento.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="source-table-footer">
          <span>* Métricas iniciales ficticias, no resultados de entrenamiento.</span>
          <span>SEPMS · Laboratorio ML</span>
        </footer>
      </section>

      {selected && (
        <div
          className="sync-detail-backdrop"
          onClick={() => setSelected(null)}
        >
          <section
            className="sync-detail-modal experiment-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="experiment-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sync-detail-header">
              <div>
                <span className="eyebrow">DETALLE DEL EXPERIMENTO</span>
                <h2 id="experiment-detail-title">{selected.name}</h2>
                <p>{selected.id} · {selected.algorithm}</p>
              </div>
              <button
                className="source-action-button"
                onClick={() => setSelected(null)}
                aria-label="Cerrar detalles"
              >
                <XCircle size={18} />
              </button>
            </header>

            <div className="experiment-detail-status">
              <StatusBadge status={selected.status} />
              <span>{selected.createdAt}</span>
            </div>

            <div className="sync-detail-grid">
              <div>
                <span>Dataset</span>
                <strong>{selected.dataset}</strong>
              </div>
              <div>
                <span>Algoritmo</span>
                <strong>{selected.algorithm}</strong>
              </div>
              <div>
                <span>Variable objetivo</span>
                <strong>{selected.target}</strong>
              </div>
              <div>
                <span>N.º de variables</span>
                <strong>{selected.features}</strong>
              </div>
              <div>
                <span>Duración ilustrativa</span>
                <strong>
                  {selected.durationSeconds > 0
                    ? `${selected.durationSeconds} s`
                    : "—"}
                </strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{selected.status}</strong>
              </div>
            </div>

            <h3 className="experiment-detail-subtitle">Métricas registradas</h3>
            <div className="experiment-metric-grid">
              <div>
                <span>MAE</span>
                <MetricValue value={selected.mae} />
                <small>Error absoluto medio</small>
              </div>
              <div>
                <span>RMSE</span>
                <MetricValue value={selected.rmse} />
                <small>Raíz del error cuadrático medio</small>
              </div>
              <div>
                <span>R²</span>
                <MetricValue value={selected.r2} />
                <small>Coeficiente de determinación</small>
              </div>
            </div>

            <p className="experiment-detail-description">
              {selected.description}
            </p>

            <div className="experiment-warning">
              <ShieldAlert size={19} />
              <p>
                Estas métricas no acreditan capacidad predictiva sísmica.
                Para evaluar un modelo real se necesitan datos verificados,
                separación temporal adecuada, comparación con una línea base
                y validación independiente.
              </p>
            </div>

            <div className="sync-detail-footer">
              <button
                className="primary-button"
                onClick={() => setSelected(null)}
              >
                Cerrar detalle
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
