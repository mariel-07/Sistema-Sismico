import { useEffect, useState, useMemo } from "react";
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
import YearFilter, { DEFAULT_YEAR } from "../components/common/YearFilter";

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
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
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

  // Filter catalog events by Year
  const yearFilteredEvents = useMemo(() => {
    if (!selectedYear || selectedYear === "Todos") return catalogEvents;
    return catalogEvents.filter((event) => {
      const match = event.origin_time_utc?.match(/\b(19\d\d|20\d\d)\b/);
      if (match) return match[1] === selectedYear;
      const parsed = new Date(event.origin_time_utc);
      return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear().toString() === selectedYear;
    });
  }, [catalogEvents, selectedYear]);

  const displayEvents = yearFilteredEvents.length > 0 ? yearFilteredEvents : (selectedYear === "Todos" ? catalogEvents : []);

  const averageMagnitude = displayEvents.length
    ? displayEvents.reduce((sum, event) => sum + event.magnitude, 0) /
      displayEvents.length
    : null;

  const activityData = useMemo(() => {
    if (selectedYear === "Todos" || selectedYear === "2026") {
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

      for (const event of displayEvents) {
        const date = event.origin_time_utc.slice(0, 10);
        const day = days.find((item) => item.date === date);
        if (day) day.events += 1;
      }
      return days;
    }

    // Historical months distribution for selected historical year
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
    const monthData = months.map((m) => ({ day: m, events: 0 }));

    for (const event of displayEvents) {
      const monthIdx = new Date(event.origin_time_utc).getUTCMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        monthData[monthIdx].events += 1;
      }
    }
    return monthData;
  }, [displayEvents, selectedYear]);

  return (
    <div className="dashboard">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            CENTRO DE OPERACIONES
          </div>
          <h1>Panel de control y monitoreo en tiempo real</h1>
          <p>
            Vista general del monitoreo sísmico nacional, estado de la red e indicadores analíticos.
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

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={displayEvents.length}
        label="Filtrar datos del panel por año:"
      />

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
                : `Monitoreo del catálogo sísmico — Año ${selectedYear}`}
          </strong>
          <p>
            {eventsLoading
              ? "Esperando la respuesta del backend."
              : eventsError
                ? eventsError
                : `Se muestran ${displayEvents.length} eventos para el año ${selectedYear}. ${recentEvents.length} eventos recientes en cola.`}
          </p>
        </div>
      </div>

      <section className="metrics-grid" aria-label="Indicadores generales">
        <MetricCard
          title={`Eventos (${selectedYear})`}
          value={
            eventsLoading
              ? "…"
              : displayEvents.length.toLocaleString("es-PE")
          }
          description={`Registros filtrados para el año ${selectedYear}`}
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
          description="Promedio de magnitudes en el período"
          icon={Waves}
          tone="metric-violet"
        />
        <MetricCard
          title="Fuentes activas"
          value="4"
          description="IGP, USGS, EMSC y Red Sísmica Nacional"
          icon={Database}
          tone="metric-teal"
        />
        <MetricCard
          title="Alertas operativas"
          value="Activas"
          description="Monitoreo de umbrales en tiempo real"
          icon={Radio}
          tone="metric-orange"
        />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Distribución temporal sísmica</h2>
              <p>
                {selectedYear === "Todos" || selectedYear === "2026"
                  ? "Eventos por día en el período observado"
                  : `Distribución mensual en el año ${selectedYear}`}
              </p>
            </div>
            <span className="panel-period">Año {selectedYear}</span>
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
              La serie se calcula a partir de los eventos del catálogo sísmico filtrados para {selectedYear}.
            </span>
          </div>
        </article>

        <article className="panel sources-panel">
          <div className="panel-heading">
            <div>
              <h2>Fuentes de datos</h2>
              <p>Estado de conectores sísmicos</p>
            </div>
            <Database size={20} className="panel-heading-icon" />
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-igp">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>IGP</strong>
              <span>Red Sísmica Nacional del Perú</span>
            </div>
            <span className="source-state state-demo">Operativo</span>
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-usgs">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>USGS</strong>
              <span>Feed Internacional FDSN</span>
            </div>
            <span className="source-state state-demo">Operativo</span>
          </div>

          <div className="source-row">
            <div className="source-logo source-logo-global">
              <Globe size={19} />
            </div>
            <div className="source-info">
              <strong>Catálogo Histórico</strong>
              <span>Base PostgreSQL SEPMS</span>
            </div>
            <span className="source-state state-demo">21,000+ Sismos</span>
          </div>

          <div className="sources-footer">
            <span className="status-dot" />
            Infraestructura de datos activa
          </div>
        </article>
      </section>

      <section className="panel events-panel">
        <div className="panel-heading">
          <div>
            <h2>Eventos recientes ({selectedYear})</h2>
            <p>Lista de eventos devueltos por el catálogo sísmico</p>
          </div>
          <span className="panel-period">
            {eventsLoading ? "Cargando…" : `${displayEvents.length} eventos`}
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
                <th>Fecha y Hora UTC</th>
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
              ) : displayEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    No hay eventos registrados en el catálogo para el año {selectedYear}. Puedes seleccionar otro año en el filtro superior.
                  </td>
                </tr>
              ) : (
                displayEvents.slice(0, 8).map((event) => {
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
                        {event.origin_time_utc.slice(0, 10)} {event.origin_time_utc.slice(11, 19)} UTC
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
