import { useEffect, useState } from "react";
import { Activity, AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { getMlAnalysis, type MlAnalysis } from "../../services/api/ml";
import { getApiErrorMessage } from "../../services/api/client";
import "./ml.css";

function metric(value: number | null, digits = 2): string {
  return value === null ? "—" : value.toFixed(digits);
}

export default function ExperimentsPage() {
  const [analysis, setAnalysis] = useState<MlAnalysis | null>(null);
  const [minMagnitude, setMinMagnitude] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAnalysis(minimum: number) {
    setLoading(true);
    setError("");
    try {
      const result = await getMlAnalysis(minimum);
      setAnalysis(result);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAnalysis(0);
  }, []);

  function submitFilter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(minMagnitude);
    if (!Number.isFinite(value) || value < 0 || value > 10) {
      setError("Introduce una magnitud entre 0 y 10.");
      return;
    }
    void loadAnalysis(value);
  }

  const metrics = analysis?.metrics;

  return (
    <section className="module-page experiments-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTELIGENCIA ARTIFICIAL / LABORATORIO</span>
          <h1>Análisis experimental de eventos</h1>
          <p>
            Estadísticas calculadas desde los registros sísmicos reales de la base de datos.
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => void loadAnalysis(Number(minMagnitude))}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      <div className="demo-notice experiment-demo-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Análisis histórico, no predicción sísmica</strong>
          <p>
            Esta vista consulta la API. Aún no se ha entrenado ni validado un modelo predictivo;
            los resultados describen eventos observados y no anticipan terremotos futuros.
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Consultar datos históricos</h2>
            <p>Filtra los eventos por su magnitud mínima.</p>
          </div>
        </div>
        <form className="experiment-form" onSubmit={submitFilter}>
          <label>
            Magnitud mínima (0–10)
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={minMagnitude}
              onChange={(event) => setMinMagnitude(event.target.value)}
            />
          </label>
          <div className="experiment-form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              <Activity size={17} />
              {loading ? "Consultando…" : "Ejecutar análisis"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <div className="demo-notice experiment-demo-notice" role="alert">
          <AlertTriangle size={20} />
          <div>
            <strong>No se pudo obtener el análisis</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading && <p role="status">Consultando la base de datos…</p>}

      {analysis && !error && (
        <>
          <div className="metrics-grid">
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-label">Eventos analizados</span>
                <span className="metric-icon metric-blue"><Activity size={20} /></span>
              </div>
              <strong className="metric-value">{analysis.sample_count.toLocaleString("es-PE")}</strong>
              <span className="metric-description">Registros que cumplen el filtro</span>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-label">Magnitud media</span>
                <span className="metric-icon metric-teal"><Activity size={20} /></span>
              </div>
              <strong className="metric-value">{metric(metrics?.mean_magnitude ?? null)}</strong>
              <span className="metric-description">Promedio de magnitudes observadas</span>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-label">Magnitud máxima</span>
                <span className="metric-icon metric-orange"><Activity size={20} /></span>
              </div>
              <strong className="metric-value">{metric(metrics?.max_magnitude ?? null)}</strong>
              <span className="metric-description">Mayor magnitud registrada</span>
            </article>
            <article className="metric-card">
              <div className="metric-top">
                <span className="metric-label">Profundidad media</span>
                <span className="metric-icon metric-violet"><Activity size={20} /></span>
              </div>
              <strong className="metric-value">{metric(metrics?.mean_depth_km ?? null)} km</strong>
              <span className="metric-description">Promedio de profundidad</span>
            </article>
          </div>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Resumen estadístico</h2>
                <p>Modelo de referencia: {analysis.model}</p>
              </div>
              <span className="source-total">{analysis.status === "ok" ? "Consulta correcta" : "Sin datos"}</span>
            </div>
            <div className="sync-detail-grid">
              <div><span>Magnitud mínima</span><strong>{metric(metrics?.min_magnitude ?? null)}</strong></div>
              <div><span>Magnitud máxima</span><strong>{metric(metrics?.max_magnitude ?? null)}</strong></div>
              <div><span>Profundidad mínima</span><strong>{metric(metrics?.min_depth_km ?? null)} km</strong></div>
              <div><span>Profundidad máxima</span><strong>{metric(metrics?.max_depth_km ?? null)} km</strong></div>
              <div><span>Latitud media</span><strong>{metric(metrics?.mean_latitude ?? null, 4)}</strong></div>
              <div><span>Longitud media</span><strong>{metric(metrics?.mean_longitude ?? null, 4)}</strong></div>
            </div>
            <div className="experiment-warning">
              <ShieldAlert size={19} />
              <p>
                Estas estadísticas son descriptivas. No son métricas MAE, RMSE o R²,
                y no demuestran capacidad predictiva ni deben utilizarse como alerta de riesgo.
              </p>
            </div>
            <h3>Limitaciones</h3>
            <ul>
              {analysis.limitations.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
        </>
      )}
    </section>
  );
}
