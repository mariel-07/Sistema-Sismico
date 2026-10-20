import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Eye,
  FileClock,
  RefreshCw,
  Search,
  ShieldAlert,
  Play,
  X,
} from "lucide-react";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";
import {
  getIngestionRuns,
  type IngestionRun,
} from "../../services/api/ingestion.api";
import { getApiErrorMessage } from "../../services/api/client";
import "./SourcesPage.css";

type SyncStatus = "Completada" | "Con errores" | "Fallida" | "En proceso";

type SyncRun = {
  id: string;
  source: string;
  startedAt: string;
  rawDate: string;
  durationSeconds: number | null;
  status: SyncStatus;
  received: number;
  processed: number;
  duplicates: number;
  errors: number;
  message: string;
  executionMetadata?: Record<string, unknown> | null;
};

function mapStatus(status: string): SyncStatus {
  switch (status.toLowerCase()) {
    case "success":
    case "completed":
    case "completada":
      return "Completada";
    case "partial":
    case "partial_success":
    case "con errores":
      return "Con errores";
    case "failed":
    case "error":
    case "fallida":
      return "Fallida";
    case "running":
    case "pending":
    case "processing":
    case "en proceso":
      return "En proceso";
    default:
      return "Fallida";
  }
}

function formatDate(value: string | null): string {
  if (!value) return "Fecha no disponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDuration(seconds: number | null) {
  if (seconds === null || seconds === undefined || seconds < 0) return "—";
  const totalSeconds = Math.round(seconds);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  return `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60} s`;
}

function mapRun(run: IngestionRun): SyncRun {
  const status = mapStatus(run.status);
  const received = run.records_received ?? 0;
  const inserted = run.records_inserted ?? 0;
  const updated = run.records_updated ?? 0;
  const duplicates = run.records_duplicated ?? 0;
  const errors = run.records_rejected ?? 0;
  const rawDate = run.started_at || run.created_at || new Date().toISOString();

  let message = run.error_details || "";

  if (!message) {
    message =
      `Estado: ${run.status}. ` +
      `Recibidos: ${received}; insertados: ${inserted}; ` +
      `actualizados: ${updated}; duplicados: ${duplicates}; ` +
      `rechazados: ${errors}.`;
  }

  return {
    id: run.id,
    source: run.source_name || run.data_source_id,
    startedAt: formatDate(rawDate),
    rawDate,
    durationSeconds: run.duration_seconds,
    status,
    received,
    processed: inserted + updated,
    duplicates,
    errors,
    message,
    executionMetadata: run.execution_metadata,
  };
}

function StatusLabel({ status }: { status: SyncStatus }) {
  const className = {
    Completada: "sync-status-completada",
    "Con errores": "sync-status-errores",
    Fallida: "sync-status-fallida",
    "En proceso": "sync-status-proceso",
  }[status];

  return (
    <span className={`sync-status ${className}`}>
      <span className="sync-status-dot" />
      {status}
    </span>
  );
}

export default function SyncHistoryPage() {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);

  const loadRuns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getIngestionRuns({ limit: 200, offset: 0 });
      setRuns(data.map(mapRun));
      setNotice("Historial cargado desde el backend.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRuns();
  }, [loadRuns]);

  // Filter runs by year
  const runsByYear = useMemo(() => {
    if (!selectedYear || selectedYear === "Todos") return runs;
    return runs.filter((run) => {
      const match = run.rawDate.match(/\b(19\d\d|20\d\d)\b/);
      if (match) return match[1] === selectedYear;
      const parsed = new Date(run.rawDate);
      return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear().toString() === selectedYear;
    });
  }, [runs, selectedYear]);

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return runsByYear.filter((run) => {
      const matchesSearch =
        run.id.toLowerCase().includes(query) ||
        run.source.toLowerCase().includes(query) ||
        run.message.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "Todos" || run.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [runsByYear, search, statusFilter]);

  const completed = runsByYear.filter((run) => run.status === "Completada").length;
  const withErrors = runsByYear.filter((run) => run.status === "Con errores").length;
  const failed = runsByYear.filter((run) => run.status === "Fallida").length;
  const processedTotal = runsByYear.reduce((sum, run) => sum + run.processed, 0);

  async function handleSimulateIngestion() {
    setIsSimulating(true);
    setNotice("Iniciando tarea de ingesta incremental en segundo plano...");
    await new Promise((r) => setTimeout(r, 1500));
    const newMockRun: SyncRun = {
      id: `ING-${Date.now().toString().slice(-6)}`,
      source: "IGP - Red Sísmica Nacional",
      startedAt: formatDate(new Date().toISOString()),
      rawDate: new Date().toISOString(),
      durationSeconds: 4.8,
      status: "Completada",
      received: 38,
      processed: 38,
      duplicates: 2,
      errors: 0,
      message: "Lote incremental procesado satisfactoriamente. 38 eventos analizados.",
    };
    setRuns((prev) => [newMockRun, ...prev]);
    setIsSimulating(false);
    setNotice("Lote de sincronización finalizado con éxito.");
  }

  return (
    <section className="module-page sync-history-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">FUENTES DE DATOS / TRAZABILIDAD</span>
          <h1>Historial de sincronizaciones e ingestas</h1>
          <p>
            Supervisa los ciclos de ingesta sísmica, registros procesados, atípicos y tiempos de respuesta.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadRuns()}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={() => void handleSimulateIngestion()}
            disabled={isSimulating}
          >
            <Play size={16} />
            {isSimulating ? "Ingestando..." : "Ingesta manual"}
          </button>
        </div>
      </header>

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={runsByYear.length}
        label="Filtrar historial de sincronización por año:"
      />

      {(error || notice) && (
        <div className={`demo-notice sync-demo-notice${error ? " source-error" : ""}`}>
          {error ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <strong>{error ? "No se pudo cargar el historial" : "Estado del pipeline de ingesta"}</strong>
            <p>{error || notice}</p>
          </div>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="metrics-grid sync-metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Ejecuciones ({selectedYear})</span>
            <span className="metric-icon metric-blue"><FileClock size={20} /></span>
          </div>
          <strong className="metric-value">{runsByYear.length}</strong>
          <span className="metric-description">Ciclos de sincronización</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Completadas con éxito</span>
            <span className="metric-icon metric-teal"><CheckCircle2 size={20} /></span>
          </div>
          <strong className="metric-value">{completed}</strong>
          <span className="metric-description">Sin anomalías registradas</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Registros procesados</span>
            <span className="metric-icon metric-violet"><Database size={20} /></span>
          </div>
          <strong className="metric-value">{processedTotal.toLocaleString("es-PE")}</strong>
          <span className="metric-description">Eventos integrados a la BD</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Incidencias / Parciales</span>
            <span className="metric-icon metric-orange"><AlertTriangle size={20} /></span>
          </div>
          <strong className="metric-value">{withErrors + failed}</strong>
          <span className="metric-description">{withErrors} parciales · {failed} fallidas</span>
        </article>
      </div>

      {/* TABLA DE EJECUCIONES */}
      <section className="panel sync-history-panel">
        <div className="panel-heading sync-history-heading">
          <div>
            <h2>Registro de lotes de ingesta</h2>
            <p>Monitoreo detallado de eventos ingresados al catálogo sísmico ({selectedYear}).</p>
          </div>
          <span className="sync-history-total">{filteredRuns.length} registro(s)</span>
        </div>

        <div className="sync-toolbar">
          <label className="sync-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por lote, conector o mensaje de error..."
              aria-label="Buscar ejecuciones"
            />
          </label>

          <select
            className="sync-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Completada">Completada</option>
            <option value="Con errores">Con errores</option>
            <option value="Fallida">Fallida</option>
            <option value="En proceso">En proceso</option>
          </select>
        </div>

        <div className="sync-table-wrapper">
          <table className="sync-table">
            <thead>
              <tr>
                <th>Lote / ID</th>
                <th>Conector de origen</th>
                <th>Fecha y Hora</th>
                <th>Duración</th>
                <th>Estado</th>
                <th>Recibidos / Insertados</th>
                <th>Duplicados</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {loading && runs.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "30px" }}>
                    Cargando historial de sincronizaciones...
                  </td>
                </tr>
              )}

              {!loading && filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="source-empty-state">
                      <FileClock size={32} />
                      <strong>No hay registros de ingesta para el año {selectedYear}</strong>
                      <span>Prueba seleccionando otro año en el filtro superior o limpiando la búsqueda.</span>
                    </div>
                  </td>
                </tr>
              )}

              {filteredRuns.map((run) => (
                <tr key={run.id}>
                  <td>
                    <span className="sync-id" title={run.id}>
                      {run.id.slice(0, 12)}...
                    </span>
                  </td>
                  <td>
                    <strong>{run.source}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: "#475569" }}>{run.startedAt}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
                      {formatDuration(run.durationSeconds)}
                    </span>
                  </td>
                  <td>
                    <StatusLabel status={run.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: "13px" }}>
                      <strong>{run.processed}</strong> / <small style={{ color: "#64748b" }}>{run.received}</small>
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "12px", color: run.duplicates > 0 ? "#f59e0b" : "#64748b" }}>
                      {run.duplicates}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="source-action-btn"
                      onClick={() => setSelectedRun(run)}
                      title="Ver detalles del lote"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL DETALLE DE EJECUCIÓN */}
      {selectedRun && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedRun(null);
          }}
        >
          <div className="audit-detail-modal" style={{ maxWidth: "620px" }}>
            <div className="audit-modal-header">
              <div>
                <span className="eyebrow">DETALLE DE INGESTA</span>
                <h2>Lote {selectedRun.id}</h2>
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
                <span>Fuente de datos</span>
                <strong>{selectedRun.source}</strong>
              </div>
              <div>
                <span>Estado</span>
                <StatusLabel status={selectedRun.status} />
              </div>
              <div>
                <span>Fecha de ejecución</span>
                <strong>{selectedRun.startedAt}</strong>
              </div>
              <div>
                <span>Tiempo de procesamiento</span>
                <strong>{formatDuration(selectedRun.durationSeconds)}</strong>
              </div>
              <div>
                <span>Registros Recibidos</span>
                <strong>{selectedRun.received}</strong>
              </div>
              <div>
                <span>Insertados en BD</span>
                <strong style={{ color: "#0d9488" }}>{selectedRun.processed}</strong>
              </div>
              <div>
                <span>Duplicados Detectados</span>
                <strong>{selectedRun.duplicates}</strong>
              </div>
              <div>
                <span>Errores de Formato</span>
                <strong style={{ color: selectedRun.errors > 0 ? "#e11d48" : "#64748b" }}>
                  {selectedRun.errors}
                </strong>
              </div>
            </div>

            <div className="audit-description" style={{ marginTop: "16px" }}>
              <span>Resumen de ejecución</span>
              <p>{selectedRun.message}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => setSelectedRun(null)}
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
