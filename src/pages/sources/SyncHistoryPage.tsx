
import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Eye,
  FileClock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

type SyncStatus = "Completada" | "Con errores" | "Fallida" | "En proceso";

type SyncRun = {
  id: string;
  source: string;
  startedAt: string;
  durationSeconds: number;
  status: SyncStatus;
  received: number;
  processed: number;
  duplicates: number;
  errors: number;
  latencyMs: number;
  message: string;
};

const initialRuns: SyncRun[] = [
  {
    id: "SYNC-0008",
    source: "Fuente sísmica principal",
    startedAt: "15/10/2026 08:30:00",
    durationSeconds: 12,
    status: "Completada",
    received: 24,
    processed: 22,
    duplicates: 2,
    errors: 0,
    latencyMs: 340,
    message: "Ejecución de demostración completada sin errores.",
  },
  {
    id: "SYNC-0007",
    source: "Catálogo de referencia",
    startedAt: "15/10/2026 08:15:00",
    durationSeconds: 18,
    status: "Con errores",
    received: 31,
    processed: 26,
    duplicates: 3,
    errors: 2,
    latencyMs: 820,
    message: "Dos registros de demostración no superaron la validación.",
  },
  {
    id: "SYNC-0006",
    source: "Fuente sísmica principal",
    startedAt: "15/10/2026 08:00:00",
    durationSeconds: 9,
    status: "Completada",
    received: 16,
    processed: 16,
    duplicates: 0,
    errors: 0,
    latencyMs: 290,
    message: "Ejecución de demostración completada sin duplicados.",
  },
  {
    id: "SYNC-0005",
    source: "Fuente secundaria",
    startedAt: "15/10/2026 07:45:00",
    durationSeconds: 0,
    status: "Fallida",
    received: 0,
    processed: 0,
    duplicates: 0,
    errors: 1,
    latencyMs: 0,
    message: "Endpoint no configurado en este ejemplo.",
  },
  {
    id: "SYNC-0004",
    source: "Catálogo de referencia",
    startedAt: "15/10/2026 07:30:00",
    durationSeconds: 15,
    status: "Completada",
    received: 19,
    processed: 18,
    duplicates: 1,
    errors: 0,
    latencyMs: 510,
    message: "Un registro duplicado fue omitido en la simulación.",
  },
  {
    id: "SYNC-0003",
    source: "Fuente sísmica principal",
    startedAt: "15/10/2026 07:15:00",
    durationSeconds: 11,
    status: "Completada",
    received: 12,
    processed: 12,
    duplicates: 0,
    errors: 0,
    latencyMs: 310,
    message: "Ejecución de demostración completada sin errores.",
  },
];

function formatDuration(seconds: number) {
  if (seconds === 0) return "—";
  return seconds < 60 ? `${seconds} s` : `${Math.floor(seconds / 60)} min ${seconds % 60} s`;
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
  const [runs, setRuns] = useState<SyncRun[]>(initialRuns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selectedRun, setSelectedRun] = useState<SyncRun | null>(null);
  const [notice, setNotice] = useState(
    "Los registros mostrados son ejemplos locales; todavía no proceden de una integración real."
  );
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const filteredRuns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return runs.filter((run) => {
      const matchesSearch =
        run.id.toLowerCase().includes(query) ||
        run.source.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "Todos" || run.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [runs, search, statusFilter]);

  const completed = runs.filter((run) => run.status === "Completada").length;
  const withErrors = runs.filter((run) => run.status === "Con errores").length;
  const failed = runs.filter((run) => run.status === "Fallida").length;
  const processedTotal = runs.reduce((sum, run) => sum + run.processed, 0);
  const duplicatesTotal = runs.reduce((sum, run) => sum + run.duplicates, 0);

  function simulateRetry(run: SyncRun) {
    if (retryingId) return;

    setRetryingId(run.id);
    setNotice(
      `Reintento simulado para ${run.id}. No se ha llamado a ningún proveedor externo.`
    );

    window.setTimeout(() => {
      const newRun: SyncRun = {
        ...run,
        id: `SYNC-${String(Date.now()).slice(-6)}`,
        startedAt: new Date().toLocaleString("es-PE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
        durationSeconds: 2,
        status: "Completada",
        message:
          "Ejecución local de demostración. No se descargaron ni procesaron datos externos.",
      };

      setRuns((current) => [newRun, ...current]);
      setRetryingId(null);
      setNotice(
        `Se agregó un registro de demostración para ${run.source}. La integración real sigue pendiente.`
      );
    }, 700);
  }

  return (
    <section className="module-page sync-history-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">FUENTES DE DATOS / MONITOREO</span>
          <h1>Historial de sincronizaciones</h1>
          <p>
            Revisa las ejecuciones de ingesta, los registros procesados y los
            problemas detectados.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={() =>
            setNotice(
              "Vista actualizada con los registros locales. Para consultar el servidor se requiere conectar la API."
            )
          }
        >
          <RefreshCw size={17} />
          Actualizar vista
        </button>
      </header>

      <div className="demo-notice sync-demo-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Datos de demostración</strong>
          <p>{notice}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Ejecuciones registradas</span>
            <span className="metric-icon metric-blue">
              <FileClock size={20} />
            </span>
          </div>
          <strong className="metric-value">{runs.length}</strong>
          <span className="metric-description">Historial local de ejemplo</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Completadas</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <strong className="metric-value">{completed}</strong>
          <span className="metric-description">Sin errores registrados</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Con incidencias</span>
            <span className="metric-icon metric-orange">
              <AlertTriangle size={20} />
            </span>
          </div>
          <strong className="metric-value">{withErrors + failed}</strong>
          <span className="metric-description">
            {withErrors} con errores · {failed} fallidas
          </span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Registros procesados</span>
            <span className="metric-icon metric-violet">
              <Database size={20} />
            </span>
          </div>
          <strong className="metric-value">
            {processedTotal.toLocaleString("es-PE")}
          </strong>
          <span className="metric-description">
            {duplicatesTotal} duplicados de ejemplo detectados
          </span>
        </article>
      </div>

      <section className="panel sync-history-panel">
        <div className="panel-heading sync-history-heading">
          <div>
            <h2>Registro de ejecuciones</h2>
            <p>
              Cada fila representa una ejecución de sincronización de ejemplo.
            </p>
          </div>
          <span className="source-total">
            {filteredRuns.length} registro(s)
          </span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por identificador o fuente..."
              aria-label="Buscar ejecuciones"
            />
          </label>

          <label className="sync-filter-control">
            <Filter size={16} />
            <select
              className="source-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar por estado de ejecución"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Completada">Completadas</option>
              <option value="Con errores">Con errores</option>
              <option value="Fallida">Fallidas</option>
              <option value="En proceso">En proceso</option>
            </select>
          </label>
        </div>

        <div className="source-table-wrapper">
          <table className="source-table sync-history-table">
            <thead>
              <tr>
                <th>ID / Fuente</th>
                <th>Fecha de inicio</th>
                <th>Estado</th>
                <th>Duración</th>
                <th>Recibidos</th>
                <th>Procesados</th>
                <th>Duplicados</th>
                <th>Errores</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => (
                <tr key={run.id}>
                  <td>
                    <div className="sync-run-identity">
                      <strong>{run.id}</strong>
                      <span>{run.source}</span>
                    </div>
                  </td>
                  <td className="sync-date-cell">{run.startedAt}</td>
                  <td>
                    <StatusLabel status={run.status} />
                  </td>
                  <td>{formatDuration(run.durationSeconds)}</td>
                  <td>{run.received}</td>
                  <td className="sync-processed-cell">{run.processed}</td>
                  <td>
                    <span
                      className={
                        run.duplicates > 0
                          ? "sync-count-warning"
                          : "sync-count-normal"
                      }
                    >
                      {run.duplicates}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        run.errors > 0
                          ? "sync-count-error"
                          : "sync-count-normal"
                      }
                    >
                      {run.errors}
                    </span>
                  </td>
                  <td>
                    <div className="source-actions">
                      <button
                        className="source-action-button"
                        onClick={() => setSelectedRun(run)}
                        title="Ver detalles"
                        aria-label={`Ver detalles de ${run.id}`}
                      >
                        <Eye size={16} />
                      </button>
                      {(run.status === "Fallida" ||
                        run.status === "Con errores") && (
                        <button
                          className="source-action-button"
                          onClick={() => simulateRetry(run)}
                          disabled={retryingId !== null}
                          title="Simular reintento"
                          aria-label={`Simular reintento de ${run.id}`}
                        >
                          <RefreshCw
                            size={16}
                            className={
                              retryingId === run.id ? "spin" : ""
                            }
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRuns.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="source-empty-state">
                      <FileClock size={28} />
                      <strong>No hay ejecuciones coincidentes</strong>
                      <span>
                        Prueba otra búsqueda o selecciona otro estado.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="source-table-footer">
          <span>
            <Clock3 size={15} />
            Latencia y duración: valores ilustrativos
          </span>
          <span>SEPMS · Historial de ingestas</span>
        </footer>
      </section>

      {selectedRun && (
        <div
          className="sync-detail-backdrop"
          onClick={() => setSelectedRun(null)}
        >
          <section
            className="sync-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sync-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sync-detail-header">
              <div>
                <span className="eyebrow">DETALLE DE EJECUCIÓN</span>
                <h2 id="sync-detail-title">{selectedRun.id}</h2>
                <p>{selectedRun.source}</p>
              </div>
              <button
                className="source-action-button"
                onClick={() => setSelectedRun(null)}
                aria-label="Cerrar detalles"
              >
                <XCircle size={18} />
              </button>
            </header>

            <div className="sync-detail-status">
              <StatusLabel status={selectedRun.status} />
              <span>{selectedRun.startedAt}</span>
            </div>

            <div className="sync-detail-grid">
              <div>
                <span>Recibidos</span>
                <strong>{selectedRun.received}</strong>
              </div>
              <div>
                <span>Procesados</span>
                <strong>{selectedRun.processed}</strong>
              </div>
              <div>
                <span>Duplicados</span>
                <strong>{selectedRun.duplicates}</strong>
              </div>
              <div>
                <span>Errores</span>
                <strong>{selectedRun.errors}</strong>
              </div>
              <div>
                <span>Duración</span>
                <strong>{formatDuration(selectedRun.durationSeconds)}</strong>
              </div>
              <div>
                <span>Latencia ilustrativa</span>
                <strong>
                  {selectedRun.latencyMs > 0
                    ? `${selectedRun.latencyMs} ms`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="sync-detail-message">
              {selectedRun.status === "Fallida" ||
              selectedRun.status === "Con errores" ? (
                <AlertTriangle size={19} />
              ) : (
                <CheckCircle2 size={19} />
              )}
              <p>{selectedRun.message}</p>
            </div>

            <div className="sync-detail-footer">
              <button
                className="primary-button"
                onClick={() => setSelectedRun(null)}
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
