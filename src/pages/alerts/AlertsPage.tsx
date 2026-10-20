
import { useEffect, useMemo, useState } from "react";
import { getAlerts, updateAlert as updateAlertApi, type AlertRecord as ApiAlertRecord } from "../../services/api/alerts.api";
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  Clock3,
  Eye,
  Filter,
  Info,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import './alerts.css';
type Priority = "Crítica" | "Alta" | "Media" | "Baja";
type AlertStatus = "Pendiente" | "Revisada" | "Atendida";

interface AlertRecord {
  id: string;
  title: string;
  message: string;
  source: string;
  priority: Priority;
  status: AlertStatus;
  createdAt: string;
  eventCode: string;
  isRead: boolean;
}

const priorityClass: Record<Priority, string> = {
  Crítica: "alert-priority-critical",
  Alta: "alert-priority-high",
  Media: "alert-priority-medium",
  Baja: "alert-priority-low",
};

const statusClass: Record<AlertStatus, string> = {
  Pendiente: "alert-status-pending",
  Revisada: "alert-status-reviewed",
  Atendida: "alert-status-resolved",
};

function formatAlertDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  useEffect(() => {
    let active = true;
    getAlerts().then((items) => {
      if (active) setAlerts(items.map((item: ApiAlertRecord) => ({
        id: item.id, title: item.title, message: item.message, source: item.source,
        priority: item.priority as Priority, status: item.status,
        createdAt: item.created_at, eventCode: item.event_code, isRead: item.is_read,
      })));
    }).catch(() => {
      if (active) setLoadError("No se pudieron cargar las alertas. Comprueba que el backend esté disponible.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(
    null,
  );

  const pendingCount = alerts.filter(
    (alert) => alert.status === "Pendiente",
  ).length;

  const unreadCount = alerts.filter((alert) => !alert.isRead).length;

  const highPriorityCount = alerts.filter(
    (alert) =>
      alert.priority === "Crítica" || alert.priority === "Alta",
  ).length;

  const filteredAlerts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return alerts
      .filter((alert) => {
        const searchable = [
          alert.id,
          alert.title,
          alert.message,
          alert.source,
          alert.eventCode,
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!term || searchable.includes(term)) &&
          (priorityFilter === "Todas" ||
            alert.priority === priorityFilter) &&
          (statusFilter === "Todos" || alert.status === statusFilter) &&
          (!unreadOnly || !alert.isRead)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime(),
      );
  }, [alerts, search, priorityFilter, statusFilter, unreadOnly]);

  const updateAlert = async (id: string, updates: Partial<AlertRecord>) => {
    setActionError("");
    const current = alerts.find((alert) => alert.id === id);
    if (!current) return;
    const apiUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) apiUpdates.title = updates.title;
    if (updates.message !== undefined) apiUpdates.message = updates.message;
    if (updates.source !== undefined) apiUpdates.source = updates.source;
    if (updates.priority !== undefined) apiUpdates.priority = updates.priority;
    if (updates.status !== undefined) apiUpdates.status = updates.status;
    if (updates.eventCode !== undefined) apiUpdates.event_code = updates.eventCode;
    if (updates.isRead !== undefined) apiUpdates.is_read = updates.isRead;

    try {
      const saved = await updateAlertApi(id, apiUpdates);
      const normalized: AlertRecord = {
        id: saved.id, title: saved.title, message: saved.message, source: saved.source,
        priority: saved.priority as Priority, status: saved.status,
        createdAt: saved.created_at, eventCode: saved.event_code, isRead: saved.is_read,
      };
      setAlerts((items) => items.map((alert) => alert.id === id ? normalized : alert));
      setSelectedAlert((alert) => alert?.id === id ? normalized : alert);
    } catch {
      setActionError("No se pudo guardar el cambio. Int?ntalo de nuevo.");
    }
  };

  const markAllAsRead = async () => {
    setActionError("");
    const unread = alerts.filter((alert) => !alert.isRead);
    for (const alert of unread) {
      try {
        const saved = await updateAlertApi(alert.id, { is_read: true });
        const normalized: AlertRecord = {
          id: saved.id, title: saved.title, message: saved.message, source: saved.source,
          priority: saved.priority as Priority, status: saved.status,
          createdAt: saved.created_at, eventCode: saved.event_code, isRead: saved.is_read,
        };
        setAlerts((items) => items.map((item) => item.id === alert.id ? normalized : item));
        setSelectedAlert((item) => item?.id === alert.id ? normalized : item);
      } catch {
        setActionError("No se pudieron marcar todas como le?das. Revisa la conexi?n e int?ntalo otra vez.");
        break;
      }
    }
  };

  const resetDemo = () => {
    setSearch("");
    setPriorityFilter("Todas");
    setStatusFilter("Todos");
    setUnreadOnly(false);
    setSelectedAlert(null);
    setActionError("");
  };

  return (
    <main className="module-page alerts-center-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CENTRO DE NOTIFICACIONES</span>
          <h1>Alertas y notificaciones</h1>
          <p>
            Revisa las notificaciones del sistema y realiza el seguimiento de
            cada alerta.
          </p>
        </div>

        <div className="alerts-heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck size={16} />
            Marcar todas como leídas
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={resetDemo}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div className="alerts-demo-banner">
        <Info size={19} />
        <div>
          <strong>Notificaciones registradas</strong>
          <span>
            Estos ejemplos no son avisos oficiales ni indican que vaya a ocurrir
            un sismo. Las alertas reales deberán proceder de fuentes verificadas
            y de servicios conectados.
          </span>
        </div>
      </div>

      {loading && <p role="status">Cargando alertas?</p>}
      {loadError && <p role="alert">{loadError}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      <section className="metrics-grid alerts-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Alertas registradas</span>
            <span className="metric-icon metric-blue">
              <Bell size={20} />
            </span>
          </div>
          <div className="metric-value">{alerts.length}</div>
          <p className="metric-description">Registros de demostración</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Pendientes</span>
            <span className="metric-icon metric-orange">
              <Clock3 size={20} />
            </span>
          </div>
          <div className="metric-value">{pendingCount}</div>
          <p className="metric-description">Requieren revisión</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Prioridad alta o crítica</span>
            <span className="metric-icon metric-violet">
              <ShieldAlert size={20} />
            </span>
          </div>
          <div className="metric-value">{highPriorityCount}</div>
          <p className="metric-description">Clasificación ficticia</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Sin leer</span>
            <span className="metric-icon metric-teal">
              <Eye size={20} />
            </span>
          </div>
          <div className="metric-value">{unreadCount}</div>
          <p className="metric-description">Notificaciones sin leer</p>
        </article>
      </section>

      <section className="panel alerts-center-panel">
        <div className="panel-heading alerts-center-heading">
          <div>
            <h2>Bandeja de alertas</h2>
            <p>
              {filteredAlerts.length} resultados de {alerts.length} registros
            </p>
          </div>
          <Activity size={22} />
        </div>

        <div className="alerts-center-filters">
          <label className="alerts-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar alerta, fuente o código..."
              aria-label="Buscar alertas"
            />
          </label>

          <label className="alerts-filter">
            <Filter size={15} />
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              aria-label="Filtrar por prioridad"
            >
              <option value="Todas">Todas las prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>

          <select
            className="alerts-filter-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Revisada">Revisada</option>
            <option value="Atendida">Atendida</option>
          </select>

          <label className="alerts-unread-toggle">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(event) => setUnreadOnly(event.target.checked)}
            />
            Solo sin leer
          </label>
        </div>

        <div className="alerts-list">
          {!loading && !loadError && filteredAlerts.map((alert) => (
            <article
              key={alert.id}
              className={`alert-item ${!alert.isRead ? "alert-item-unread" : ""}`}
            >
              <div
                className={`alert-item-icon ${priorityClass[alert.priority]}`}
              >
                {alert.priority === "Crítica" || alert.priority === "Alta" ? (
                  <AlertTriangle size={20} />
                ) : alert.priority === "Media" ? (
                  <Bell size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>

              <div className="alert-item-content">
                <div className="alert-item-title-row">
                  <h3>{alert.title}</h3>
                  {!alert.isRead && (
                    <span className="alert-unread-dot" title="Sin leer" />
                  )}
                </div>

                <p>{alert.message}</p>

                <div className="alert-item-meta">
                  <span>{alert.id}</span>
                  <span>{alert.source}</span>
                  <span>
                    <Clock3 size={13} />
                    {formatAlertDate(alert.createdAt)}
                  </span>
                </div>

                <div className="alert-item-badges">
                  <span
                    className={`alert-priority-badge ${priorityClass[alert.priority]}`}
                  >
                    {alert.priority}
                  </span>
                  <span className={`alert-status-badge ${statusClass[alert.status]}`}>
                    {alert.status}
                  </span>
                </div>
              </div>

              <div className="alert-item-actions">
                <button
                  type="button"
                  className="alerts-detail-button"
                  onClick={() => {
                    setSelectedAlert(alert);
                    if (!alert.isRead) {
                      updateAlert(alert.id, { isRead: true });
                    }
                  }}
                >
                  <Eye size={15} />
                  Detalle
                </button>

                {alert.status !== "Atendida" && (
                  <button
                    type="button"
                    className="alerts-resolve-button"
                    onClick={() =>
                      updateAlert(alert.id, {
                        status: "Atendida",
                        isRead: true,
                      })
                    }
                  >
                    <Check size={15} />
                    Atender
                  </button>
                )}
              </div>
            </article>
          ))}

          {!loading && !loadError && filteredAlerts.length === 0 && (
            <div className="alerts-empty">
              <Bell size={30} />
              <strong>No hay alertas que coincidan</strong>
              <span>Prueba cambiando los filtros de búsqueda.</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setPriorityFilter("Todas");
                  setStatusFilter("Todos");
                  setUnreadOnly(false);
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {selectedAlert && (
        <div
          className="alerts-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAlert(null);
            }
          }}
        >
          <section
            className="alerts-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alerts-detail-title"
          >
            <div className="alerts-modal-header">
              <div>
                <span className="eyebrow">DETALLE DE NOTIFICACIÓN</span>
                <h2 id="alerts-detail-title">{selectedAlert.title}</h2>
              </div>
              <button
                type="button"
                className="alerts-close-button"
                onClick={() => setSelectedAlert(null)}
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </div>

            <div className="alerts-modal-badges">
              <span className={`alert-priority-badge ${priorityClass[selectedAlert.priority]}`}>
                Prioridad: {selectedAlert.priority}
              </span>
              <span className={`alert-status-badge ${statusClass[selectedAlert.status]}`}>
                {selectedAlert.status}
              </span>
            </div>

            <div className="alerts-modal-fields">
              <div>
                <span>Código de alerta</span>
                <strong>{selectedAlert.id}</strong>
              </div>
              <div>
                <span>Código relacionado</span>
                <strong>{selectedAlert.eventCode}</strong>
              </div>
              <div>
                <span>Fuente</span>
                <strong>{selectedAlert.source}</strong>
              </div>
              <div>
                <span>Fecha de registro</span>
                <strong>{formatAlertDate(selectedAlert.createdAt)}</strong>
              </div>
            </div>

            <div className="alerts-modal-message">
              <span>Descripción</span>
              <p>{selectedAlert.message}</p>
            </div>

            <p className="alerts-modal-disclaimer">
              La prioridad mostrada es una clasificación de demostración. No
              debe utilizarse como aviso público ni como predicción de un sismo.
            </p>

            {selectedAlert.status !== "Atendida" && (
              <button
                type="button"
                className="primary-button alerts-modal-action"
                onClick={() =>
                  updateAlert(selectedAlert.id, {
                    status: "Atendida",
                    isRead: true,
                  })
                }
              >
                <Check size={16} />
                Marcar como atendida
              </button>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
