import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Database,
  Globe,
  Radio,
  ShieldAlert,
  Waves,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getEvents,
  getRecentEvents,
} from "../services/api/events.api";
import { getApiErrorMessage } from "../services/api/client";
import type { SeismicEvent } from "../types/event";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
  trend?: string;
  tone: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-label">{title}</span>
        <div className={`metric-icon ${tone}`}>
          <Icon size={21} />
        </div>
      </div>

      <div className="metric-value">{value}</div>

      <div className="metric-bottom">
        <span className="metric-description">{description}</span>
        {trend && (
          <span className="metric-trend">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
      </div>
    </article>
  );
}

export default function Dashboard() {
  const [recentEvents, setRecentEvents] = useState<SeismicEvent[]>([]);
  const [catalogEvents, setCatalogEvents] = useState<SeismicEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      setEventsLoading(true);
      setEventsError("");

      try {
        const [recent, catalog] = await Promise.all([
          getRecentEvents(10),
          getEvents({ limit: 1000, offset: 0 }),
        ]);

        if (!cancelled) {
          setRecentEvents(recent);
          setCatalogEvents(catalog);
        }
      } catch (error) {
        if (!cancelled) {
          setEventsError(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setEventsLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const averageMagnitude = catalogEvents.length
    ? catalogEvents.reduce((sum, event) => sum + event.magnitude, 0) /
      catalogEvents.length
    : null;

  const activityData = (() => {
    const now = new Date();

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(now);
      date.setUTCDate(now.getUTCDate() - (6 - index));
      const dateKey = date.toISOString().slice(0, 10);

      return {
        date: dateKey,
        day: date.toLocaleDateString("es-PE", {
          day: "2-digit",
          month: "short",
          timeZone: "UTC",
        }),
        events: 0,
      };
    });

    for (const event of catalogEvents) {
      const date = event.origin_time_utc.slice(0, 10);
      const day = days.find((item) => item.date === date);

      if (day) {
        day.events += 1;
      }
    }

    return days;
  })();

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            CENTRO DE OPERACIONES
          </div>
          <h1>Panel de control</h1>
          <p>
            Vista general del monitoreo sísmico y del estado de la plataforma.
          </p>
        </div>

        <div className="dashboard-date">
          <Clock3 size={16} />
          <span>
            {eventsLoading
              ? "Consultando backend…"
              : eventsError
                ? "API no disponible"
                : "Datos recibidos de la API"}
          </span>
        </div>
      </div>

      <div className="demo-notice" role="status">
        <div className="demo-notice-icon">
          <ShieldAlert size={19} />
        </div>
        <div>
          <strong>
            {eventsLoading
              ? "Consultando el catálogo sísmico"
              : eventsError
                ? "No se pudieron cargar los datos"
                : "Monitoreo del catálogo sísmico"}
          </strong>
          <p>
            {eventsLoading
              ? "Esperando la respuesta del backend."
              : eventsError
                ? eventsError
                : `La API devolvió ${catalogEvents.length} registros para los indicadores y ${recentEvents.length} eventos recientes. Esto no representa una alerta oficial ni una predicción sísmica.`}
          </p>
        </div>
      </div>

      <section className="metrics-grid" aria-label="Indicadores generales">
        <MetricCard
          title="Eventos registrados"
          value={
            eventsLoading
              ? "…"
              : catalogEvents.length.toLocaleString("es-PE")
          }
          description="Eventos recibidos en la muestra consultada"
          icon={Activity}
          tone="metric-blue"
        />
        <MetricCard
          title="Magnitud media"
          value={
            eventsLoading
              ? "…"
              : averageMagnitude === null
                ? "—"
                : averageMagnitude.toFixed(2)
          }
          description="Media de los eventos consultados"
          icon={Waves}
          tone="metric-violet"
        />
        <MetricCard
          title="Fuentes configuradas"
          value="—"
          description="Pendiente de consultar las fuentes registradas"
          icon={Database}
          tone="metric-teal"
        />
        <MetricCard
          title="Alertas operativas"
          value="—"
          description="Pendiente de conectar el módulo de alertas"
          icon={Radio}
          tone="metric-orange"
        />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Actividad sísmica</h2>
              <p>Eventos por día en los registros consultados</p>
            </div>
            <span className="panel-period">Últimos 7 días</span>
          </div>

          <div className="chart-legend">
            <span className="legend-dot" />
            Eventos registrados
          </div>

          <div className="activity-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activityData}
                margin={{ top: 12, right: 12, left: -18, bottom: 2 }}
              >
                <CartesianGrid
                  stroke="#E8EDF4"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#77849A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: "#77849A", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E8EDF4",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="events"
                  name="Eventos registrados"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0D9488", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-footnote">
            <Activity size={15} />
            <span>
              La serie se calcula a partir de los eventos recibidos de la API.
            </span>
          </div>
        </article>

        <article className="panel sources-panel">
          <div className="panel-heading">
            <div>
              <h2>Fuentes de datos</h2>
              <p>Estado ilustrativo de conectores</p>
            </div>
            <Database size={20} className="panel-heading-icon" />
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-igp">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>IGP</strong>
              <span>Fuente nacional</span>
            </div>
            <span className="source-state state-pending">Por conectar</span>
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-usgs">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>USGS</strong>
              <span>Fuente internacional</span>
            </div>
            <span className="source-state state-pending">Por conectar</span>
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-global">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>Catálogo interno</strong>
              <span>Datos locales</span>
            </div>
            <span className="source-state state-demo">Demostración</span>
          </div>

          <div className="sources-footer">
            <span className="status-dot status-dot-gray" />
            Ninguna conexión externa verificada
          </div>
        </article>
      </section>

      <section className="panel events-panel">
        <div className="panel-heading">
          <div>
            <h2>Eventos recientes</h2>
            <p>Eventos recientes devueltos por la API</p>
          </div>
          <span className="panel-period">
            {eventsLoading ? "Cargando…" : `${recentEvents.length} eventos`}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Magnitud</th>
                <th>Ubicación</th>
                <th>Profundidad</th>
                <th>Hora UTC</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {eventsLoading ? (
                <tr>
                  <td colSpan={6}>Cargando eventos desde el backend...</td>
                </tr>
              ) : eventsError ? (
                <tr>
                  <td colSpan={6}>{eventsError}</td>
                </tr>
              ) : recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={6}>La API no devolvió eventos recientes.</td>
                </tr>
              ) : (
                recentEvents.map((event) => {
                  const review = (
                    event.review_status ??
                    event.event_status ??
                    ""
                  ).toLowerCase();

                  const verified = [
                    "verified",
                    "verified_by_authority",
                    "approved",
                    "verificado",
                  ].includes(review);

                  const location =
                    event.reference_location ||
                    [
                      event.district,
                      event.province,
                      event.department,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                    `${event.latitude.toFixed(3)}, ${event.longitude.toFixed(3)}`;

                  return (
                    <tr key={event.id}>
                      <td className="event-id">
                        {event.external_id || event.id}
                      </td>
                      <td>
                        <span className="magnitude-value">
                          {event.magnitude.toFixed(1)}
                        </span>
                      </td>
                      <td>{location}</td>
                      <td>{event.depth_km.toFixed(1)} km</td>
                      <td>
                        {new Date(event.origin_time_utc)
                          .toISOString()
                          .slice(11, 19)}{" "}
                        UTC
                      </td>
                      <td>
                        <span
                          className={`event-status ${
                            verified
                              ? "event-status-verified"
                              : "event-status-review"
                          }`}
                        >
                          {verified ? (
                            <ArrowUpRight size={13} />
                          ) : (
                            <Clock3 size={13} />
                          )}
                          {verified ? "Verificado" : "En revisión"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
