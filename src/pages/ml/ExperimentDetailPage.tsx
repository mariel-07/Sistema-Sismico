import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Database,
  FlaskConical,
  GitBranch,
  Layers3,
  Target,
} from "lucide-react";

import "./ml.css";
type ExperimentStatus = "En revisión" | "Completado" | "En ejecución";

interface ExperimentDetail {
  id: string;
  name: string;
  description: string;
  status: ExperimentStatus;
  algorithm: string;
  dataset: string;
  target: string;
  features: string[];
  createdAt: string;
  owner: string;
  version: string;
  metrics: {
    name: string;
    value: string;
    description: string;
  }[];
  history: {
    date: string;
    title: string;
    description: string;
    status: string;
  }[];
}

const demoExperiments: ExperimentDetail[] = [
  {
    id: "1",
    name: "Clasificación de eventos sísmicos",
    description:
      "Experimento de demostración para evaluar un clasificador con registros históricos etiquetados.",
    status: "En revisión",
    algorithm: "Random Forest",
    dataset: "Eventos históricos de prueba",
    target: "event_category",
    features: ["signal_duration", "amplitude", "frequency", "station_count"],
    createdAt: "2026-10-10",
    owner: "Equipo de análisis",
    version: "v0.3.0",
    metrics: [
      {
        name: "F1 de prueba",
        value: "0.84",
        description: "Valor de demostración",
      },
      {
        name: "Precisión",
        value: "0.82",
        description: "Valor de demostración",
      },
      {
        name: "Recall",
        value: "0.86",
        description: "Valor de demostración",
      },
    ],
    history: [
      {
        date: "2026-10-10",
        title: "Experimento registrado",
        description: "Se creó la configuración inicial de demostración.",
        status: "Registrado",
      },
      {
        date: "2026-10-11",
        title: "Evaluación de prueba",
        description: "Se añadieron métricas ficticias para mostrar la interfaz.",
        status: "Completado",
      },
      {
        date: "2026-10-12",
        title: "Revisión pendiente",
        description: "Se requiere comprobar los datos, la metodología y la reproducibilidad.",
        status: "En revisión",
      },
    ],
  },
  {
    id: "2",
    name: "Análisis de señales",
    description:
      "Experimento de referencia para organizar y evaluar registros de señales de ejemplo.",
    status: "Completado",
    algorithm: "Regresión logística",
    dataset: "Señales de demostración",
    target: "signal_category",
    features: ["duration", "amplitude", "frequency"],
    createdAt: "2026-10-08",
    owner: "Equipo de análisis",
    version: "v0.2.1",
    metrics: [
      {
        name: "Exactitud",
        value: "0.79",
        description: "Valor de demostración",
      },
      {
        name: "Precisión",
        value: "0.77",
        description: "Valor de demostración",
      },
      {
        name: "Recall",
        value: "0.80",
        description: "Valor de demostración",
      },
    ],
    history: [
      {
        date: "2026-10-08",
        title: "Experimento registrado",
        description: "Se creó el registro de ejemplo.",
        status: "Registrado",
      },
      {
        date: "2026-10-09",
        title: "Evaluación de prueba",
        description: "Se cargaron métricas de demostración.",
        status: "Completado",
      },
    ],
  },
  {
    id: "3",
    name: "Control de calidad de registros",
    description:
      "Experimento de demostración para explorar registros atípicos en conjuntos de datos.",
    status: "En ejecución",
    algorithm: "Isolation Forest",
    dataset: "Dataset de demostración",
    target: "outlier_flag",
    features: ["amplitude", "duration", "frequency", "missing_ratio"],
    createdAt: "2026-10-05",
    owner: "Administrador",
    version: "v0.1.0",
    metrics: [
      {
        name: "Registros revisados",
        value: "1,200",
        description: "Cantidad ficticia de ejemplo",
      },
      {
        name: "Variables",
        value: "4",
        description: "Configuración de demostración",
      },
      {
        name: "Estado de ejecución",
        value: "Simulado",
        description: "No se está ejecutando un modelo real",
      },
    ],
    history: [
      {
        date: "2026-10-05",
        title: "Experimento registrado",
        description: "Se guardó una configuración de ejemplo.",
        status: "Registrado",
      },
      {
        date: "2026-10-06",
        title: "Revisión de configuración",
        description: "Se revisó la lista de variables de entrada.",
        status: "Completado",
      },
    ],
  },
];

const statusClasses: Record<ExperimentStatus, string> = {
  "En revisión": "experiment-detail-status--review",
  Completado: "experiment-detail-status--completed",
  "En ejecución": "experiment-detail-status--running",
};

export default function ExperimentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const experiment = demoExperiments.find((item) => item.id === id);

  if (!experiment) {
    return (
      <main className="module-page">
        <div className="experiment-detail-not-found">
          <FlaskConical size={42} />
          <h1>Experimento no encontrado</h1>
          <p>
            No existe un experimento de demostración con el identificador
            solicitado.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/ml/experiments")}
          >
            Volver a experimentos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="module-page experiment-detail-page">
      <button
        type="button"
        className="experiment-detail-back"
        onClick={() => navigate("/ml/experiments")}
      >
        <ArrowLeft size={17} />
        Volver a experimentos
      </button>

      <header className="page-heading experiment-detail-heading">
        <div>
          <span className="eyebrow">INTELIGENCIA ARTIFICIAL / EXPERIMENTOS</span>
          <h1>{experiment.name}</h1>
          <p>{experiment.description}</p>
          <div className="experiment-detail-meta">
            <span>
              <GitBranch size={15} />
              {experiment.version}
            </span>
            <span>
              <CalendarDays size={15} />
              {experiment.createdAt}
            </span>
            <span>
              <span
                className={`experiment-detail-status ${statusClasses[experiment.status]}`}
              >
                {experiment.status}
              </span>
            </span>
          </div>
        </div>
        <div className="experiment-detail-icon">
          <BrainCircuit size={30} />
        </div>
      </header>

      <div className="demo-notice">
        <FlaskConical size={18} />
        <p>
          <strong>Datos de demostración:</strong> las métricas y el historial
          son ejemplos de interfaz, no resultados de un entrenamiento real ni
          pronósticos sísmicos validados.
        </p>
      </div>

      <section className="experiment-detail-metric-grid">
        {experiment.metrics.map((metric) => (
          <article className="metric-card" key={metric.name}>
            <div className="metric-top">
              <span className="metric-label">{metric.name}</span>
              <span className="metric-icon metric-violet">
                <Target size={19} />
              </span>
            </div>
            <div className="metric-value">{metric.value}</div>
            <p className="metric-description">{metric.description}</p>
          </article>
        ))}
      </section>

      <div className="experiment-detail-content-grid">
        <section className="panel experiment-detail-panel">
          <div className="panel-heading">
            <div>
              <h2>Configuración</h2>
              <p>Parámetros principales del experimento</p>
            </div>
            <Layers3 size={21} />
          </div>

          <div className="experiment-detail-info-list">
            <div>
              <span>Algoritmo</span>
              <strong>{experiment.algorithm}</strong>
            </div>
            <div>
              <span>Dataset</span>
              <strong>{experiment.dataset}</strong>
            </div>
            <div>
              <span>Variable objetivo</span>
              <code>{experiment.target}</code>
            </div>
            <div>
              <span>Responsable</span>
              <strong>{experiment.owner}</strong>
            </div>
            <div>
              <span>Versión</span>
              <strong>{experiment.version}</strong>
            </div>
          </div>
        </section>

        <section className="panel experiment-detail-panel">
          <div className="panel-heading">
            <div>
              <h2>Variables de entrada</h2>
              <p>
                {experiment.features.length} variables configuradas en el
                ejemplo
              </p>
            </div>
            <Database size={21} />
          </div>

          <div className="experiment-detail-features">
            {experiment.features.map((feature) => (
              <span key={feature} className="experiment-detail-feature">
                <CheckCircle2 size={15} />
                {feature}
              </span>
            ))}
          </div>

          <div className="experiment-detail-tip">
            La variable objetivo se mantiene separada de las variables de
            entrada para evitar incluirla accidentalmente entre las
            características del modelo.
          </div>
        </section>
      </div>

      <section className="panel experiment-detail-history">
        <div className="panel-heading">
          <div>
            <h2>Historial del experimento</h2>
            <p>Registro demostrativo de las actividades</p>
          </div>
          <CalendarDays size={21} />
        </div>

        <div className="experiment-detail-timeline">
          {experiment.history.map((entry, index) => (
            <article
              className="experiment-detail-timeline-item"
              key={`${entry.date}-${entry.title}`}
            >
              <div className="experiment-detail-timeline-marker">
                {index === experiment.history.length - 1 ? (
                  <FlaskConical size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
              </div>
              <div className="experiment-detail-timeline-body">
                <div className="experiment-detail-timeline-title">
                  <h3>{entry.title}</h3>
                  <span>{entry.date}</span>
                </div>
                <p>{entry.description}</p>
                <span className="experiment-detail-history-status">
                  {entry.status}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="experiment-detail-footer">
        <Link to="/ml/experiments" className="secondary-button">
          <ArrowLeft size={16} />
          Regresar al catálogo
        </Link>
      </div>
    </main>
  );
}
