import { useState, useMemo } from "react";
import {
  Activity,
  ShieldAlert,
  Play,
  Plus,
  CheckCircle2,
  TrendingDown,
  BarChart2,
  FileDown,
  X,
  Eye,
} from "lucide-react";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";
import "./ml.css";

interface ExperimentRun {
  id: string;
  name: string;
  year: string;
  model: string;
  minMagnitude: number;
  learningRate: number;
  epochs: number;
  batchSize: number;
  valLoss: number;
  rmse: number;
  status: "Completado" | "Convergido" | "En progreso" | "Fallo";
  duration: string;
  createdAt: string;
}

export default function ExperimentsPage() {
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);

  // New Experiment Modal & Training Simulation
  const [showModal, setShowModal] = useState(false);
  const [trainingActive, setTrainingActive] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedRun, setSelectedRun] = useState<ExperimentRun | null>(null);

  const [form, setForm] = useState({
    name: "CatBoost Regresión de Severidad",
    model: "CatBoost Regressor v2",
    minMagnitude: "4.0",
    learningRate: "0.03",
    epochs: "40",
    batchSize: "64",
  });

  const [experiments, setExperiments] = useState<ExperimentRun[]>([
    {
      id: "EXP-2026-001",
      name: "Catálogo Sísmico 2026 Baseline",
      year: "2026",
      model: "Gutenberg-Richter b-estimator",
      minMagnitude: 3.5,
      learningRate: 0.01,
      epochs: 30,
      batchSize: 32,
      valLoss: 0.142,
      rmse: 0.18,
      status: "Convergido",
      duration: "18s",
      createdAt: "19/10/2026, 14:20",
    },
    {
      id: "EXP-2026-002",
      name: "CatBoost Atenuación Hipocentral",
      year: "2026",
      model: "CatBoost Regressor v2",
      minMagnitude: 4.0,
      learningRate: 0.03,
      epochs: 50,
      batchSize: 64,
      valLoss: 0.088,
      rmse: 0.22,
      status: "Completado",
      duration: "45s",
      createdAt: "19/10/2026, 11:05",
    },
    {
      id: "EXP-2025-009",
      name: "LSTM Deep Sequence Forecaster",
      year: "2025",
      model: "LSTM Sequence PyTorch",
      minMagnitude: 3.0,
      learningRate: 0.005,
      epochs: 80,
      batchSize: 128,
      valLoss: 0.165,
      rmse: 0.31,
      status: "Completado",
      duration: "2m 14s",
      createdAt: "14/11/2025, 16:30",
    },
    {
      id: "EXP-2019-044",
      name: "Entrenamiento Masivo Catálogo 2019",
      year: "2019",
      model: "CatBoost Regressor v1",
      minMagnitude: 4.0,
      learningRate: 0.02,
      epochs: 100,
      batchSize: 64,
      valLoss: 0.076,
      rmse: 0.19,
      status: "Convergido",
      duration: "3m 40s",
      createdAt: "28/12/2019, 09:15",
    },
    {
      id: "EXP-2018-032",
      name: "DBSCAN Enjambres y Réplicas 2018",
      year: "2018",
      model: "Isolation Forest / DBSCAN",
      minMagnitude: 3.5,
      learningRate: 0.01,
      epochs: 25,
      batchSize: 32,
      valLoss: 0.112,
      rmse: 0.24,
      status: "Completado",
      duration: "32s",
      createdAt: "18/08/2018, 17:40",
    },
  ]);

  // Filter experiments by year
  const filteredExperiments = useMemo(() => {
    if (!selectedYear || selectedYear === "Todos") return experiments;
    return experiments.filter((e) => e.year === selectedYear);
  }, [experiments, selectedYear]);

  async function handleLaunchExperiment(e: React.FormEvent) {
    e.preventDefault();
    setTrainingActive(true);
    setTrainingProgress(5);

    for (let i = 10; i <= 100; i += 20) {
      await new Promise((r) => setTimeout(r, 250));
      setTrainingProgress(i);
    }

    const newExp: ExperimentRun = {
      id: `EXP-${selectedYear}-${Math.floor(Math.random() * 800 + 100)}`,
      name: form.name.trim(),
      year: selectedYear === "Todos" ? "2026" : selectedYear,
      model: form.model,
      minMagnitude: parseFloat(form.minMagnitude) || 4.0,
      learningRate: parseFloat(form.learningRate) || 0.03,
      epochs: parseInt(form.epochs, 10) || 50,
      batchSize: parseInt(form.batchSize, 10) || 64,
      valLoss: parseFloat((0.06 + Math.random() * 0.05).toFixed(3)),
      rmse: parseFloat((0.15 + Math.random() * 0.1).toFixed(2)),
      status: "Convergido",
      duration: `${Math.floor(Math.random() * 40 + 20)}s`,
      createdAt: new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }),
    };

    setExperiments((prev) => [newExp, ...prev]);
    setTrainingActive(false);
    setShowModal(false);
  }

  function exportExperimentsCsv() {
    const csvContent = [
      "id,name,year,model,minMagnitude,learningRate,epochs,valLoss,rmse,status,duration",
      ...filteredExperiments.map(
        (e) => `${e.id},"${e.name}",${e.year},"${e.model}",${e.minMagnitude},${e.learningRate},${e.epochs},${e.valLoss},${e.rmse},${e.status},${e.duration}`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `experimentos-ml-${selectedYear}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="module-page experiments-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">PREDICCIÓN Y ANALÍTICA ML / LABORATORIO</span>
          <h1>Laboratorio y tracking de experimentos de Machine Learning</h1>
          <p>
            Registro de ejecuciones de entrenamiento, ajuste de hiperparámetros y convergencia de funciones de pérdida.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={exportExperimentsCsv}
            disabled={filteredExperiments.length === 0}
          >
            <FileDown size={16} />
            Exportar CSV
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            Nuevo experimento
          </button>
        </div>
      </header>

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={filteredExperiments.length}
        label="Filtrar experimentos por año:"
      />

      <div className="demo-notice experiment-demo-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Laboratorio de validación cruzada y calibración</strong>
          <p>
            Los experimentos entrenan sobre particiones históricas (Train/Val/Test). Las funciones de pérdida (MSE, Huber Loss) y métricas RMSE son calculadas en validación independiente.
          </p>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Experimentos ({selectedYear})</span>
            <span className="metric-icon metric-blue"><Activity size={20} /></span>
          </div>
          <strong className="metric-value">{filteredExperiments.length}</strong>
          <span className="metric-description">Corridas registradas</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Mejor Loss de Validación</span>
            <span className="metric-icon metric-teal"><TrendingDown size={20} /></span>
          </div>
          <strong className="metric-value" style={{ color: "#0d9488" }}>
            {filteredExperiments.length > 0
              ? Math.min(...filteredExperiments.map((e) => e.valLoss)).toFixed(3)
              : "0.088"}
          </strong>
          <span className="metric-description">Error cuadrático mínimo</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">RMSE Promedio</span>
            <span className="metric-icon metric-violet"><BarChart2 size={20} /></span>
          </div>
          <strong className="metric-value">
            {filteredExperiments.length > 0
              ? (
                  filteredExperiments.reduce((sum, e) => sum + e.rmse, 0) /
                  filteredExperiments.length
                ).toFixed(2)
              : "0.20"} <small style={{ fontSize: "14px" }}>Mw</small>
          </strong>
          <span className="metric-description">Desviación sobre magnitud real</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Tasa de Convergencia</span>
            <span className="metric-icon metric-teal"><CheckCircle2 size={20} /></span>
          </div>
          <strong className="metric-value">100%</strong>
          <span className="metric-description">Criterio de parada temprana óptimo</span>
        </article>
      </div>

      {/* TABLA DE EXPERIMENTOS */}
      <section className="panel" style={{ padding: "20px" }}>
        <div className="panel-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2>Historial de corridas de entrenamiento ({selectedYear})</h2>
            <p>Comparación de hiperparámetros, épocas y desempeño en partición de test.</p>
          </div>
          <span className="source-total">{filteredExperiments.length} corrida(s)</span>
        </div>

        <div className="source-table-wrapper">
          <table className="source-table">
            <thead>
              <tr>
                <th>ID / Experimento</th>
                <th>Modelo</th>
                <th>Hiperparámetros</th>
                <th>Val Loss</th>
                <th>RMSE</th>
                <th>Estado</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperiments.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "#64748b" }}>
                    No hay experimentos registrados para el año {selectedYear}. Selecciona otro año o haz clic en "Nuevo experimento".
                  </td>
                </tr>
              )}

              {filteredExperiments.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <div>
                      <strong style={{ color: "#f8fafc", fontSize: "13px" }}>{exp.id}</strong>
                      <span style={{ display: "block", fontSize: "11.5px", color: "#94a3b8" }}>
                        {exp.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="source-type-tag" style={{ background: "rgba(20, 184, 166, 0.1)", color: "#2dd4bf", borderColor: "rgba(45, 212, 191, 0.25)" }}>
                      {exp.model}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      <span>LR: {exp.learningRate} · Épocas: {exp.epochs}</span>
                      <span style={{ display: "block" }}>Batch: {exp.batchSize} · M ≥ {exp.minMagnitude}</span>
                    </div>
                  </td>
                  <td>
                    <strong style={{ color: "#34d399", fontSize: "13px" }}>{exp.valLoss.toFixed(3)}</strong>
                  </td>
                  <td>
                    <strong style={{ color: "#5eead4", fontSize: "13px" }}>{exp.rmse.toFixed(2)} Mw</strong>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "10.5px",
                        fontWeight: "700",
                        background: exp.status === "Convergido" ? "rgba(16, 185, 129, 0.15)" : "rgba(56, 189, 248, 0.15)",
                        color: exp.status === "Convergido" ? "#34d399" : "#38bdf8",
                      }}
                    >
                      {exp.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>{exp.duration}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="source-action-btn"
                      onClick={() => setSelectedRun(exp)}
                      title="Ver detalle del experimento"
                    >
                      <Eye size={13} />
                      Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL NUEVO EXPERIMENTO */}
      {showModal && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !trainingActive) setShowModal(false);
          }}
        >
          <div className="audit-detail-modal" style={{ maxWidth: "580px" }}>
            <div className="audit-modal-header">
              <div>
                <span className="eyebrow">LABORATORIO DE ENTRENAMIENTO</span>
                <h2>Lanzar nuevo experimento de Machine Learning</h2>
              </div>
              {!trainingActive && (
                <button
                  type="button"
                  className="audit-close-button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <form onSubmit={handleLaunchExperiment} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                  Nombre del experimento:
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                    Algoritmo / Arquitectura:
                  </label>
                  <select
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  >
                    <option value="CatBoost Regressor v2">CatBoost Regressor</option>
                    <option value="Gutenberg-Richter b-estimator">Gutenberg-Richter b-estimator</option>
                    <option value="LSTM Sequence PyTorch">LSTM Deep Sequence</option>
                    <option value="Isolation Forest / DBSCAN">Isolation Forest Swarms</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                    Dataset por año (Entrenamiento):
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`Año seleccionado: ${selectedYear}`}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#64748b" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                    Learning Rate:
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    value={form.learningRate}
                    onChange={(e) => setForm({ ...form, learningRate: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                    Épocas (Epochs):
                  </label>
                  <input
                    type="number"
                    value={form.epochs}
                    onChange={(e) => setForm({ ...form, epochs: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
                    Batch Size:
                  </label>
                  <input
                    type="number"
                    value={form.batchSize}
                    onChange={(e) => setForm({ ...form, batchSize: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>

              {trainingActive && (
                <div style={{ marginTop: "12px", padding: "14px", background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "600", color: "#0f766e", marginBottom: "6px" }}>
                    <span>Entrenando modelo en GPU/CPU...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div style={{ background: "#ccfbf1", height: "8px", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ background: "#0d9488", width: `${trainingProgress}%`, height: "100%", transition: "width 0.2s" }} />
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowModal(false)}
                  disabled={trainingActive}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={trainingActive}
                >
                  <Play size={15} />
                  {trainingActive ? "Optimizando gradientes..." : "Iniciar entrenamiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE CORRIDA */}
      {selectedRun && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRun(null);
          }}
        >
          <div className="audit-detail-modal" style={{ maxWidth: "560px" }}>
            <div className="audit-modal-header">
              <div>
                <span className="eyebrow">INFORME DE ENTRENAMIENTO</span>
                <h2>{selectedRun.id}</h2>
              </div>
              <button
                type="button"
                className="audit-close-button"
                onClick={() => setSelectedRun(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="audit-detail-grid">
              <div>
                <span>Nombre</span>
                <strong>{selectedRun.name}</strong>
              </div>
              <div>
                <span>Modelo</span>
                <strong>{selectedRun.model}</strong>
              </div>
              <div>
                <span>Dataset Año</span>
                <strong>{selectedRun.year}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong style={{ color: "#0d9488" }}>{selectedRun.status}</strong>
              </div>
              <div>
                <span>Validation Loss</span>
                <strong>{selectedRun.valLoss.toFixed(4)}</strong>
              </div>
              <div>
                <span>RMSE</span>
                <strong>{selectedRun.rmse.toFixed(3)} Mw</strong>
              </div>
              <div>
                <span>Learning Rate</span>
                <strong>{selectedRun.learningRate}</strong>
              </div>
              <div>
                <span>Épocas / Batch</span>
                <strong>{selectedRun.epochs} / {selectedRun.batchSize}</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedRun(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
