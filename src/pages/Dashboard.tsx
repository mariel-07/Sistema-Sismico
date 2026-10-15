
import {
  Activity,
  ArrowDownRight,
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

const activityData = [
  { day: "09 Oct", events: 12 },
  { day: "10 Oct", events: 18 },
  { day: "11 Oct", events: 14 },
  { day: "12 Oct", events: 23 },
  { day: "13 Oct", events: 17 },
  { day: "14 Oct", events: 29 },
  { day: "15 Oct", events: 21 },
];

const demoEvents = [
  {
    id: "DEMO-001",
    magnitude: 4.2,
    location: "Costa central del Perú",
    depth: 38,
    time: "09:24",
    status: "Verificado",
  },
  {
    id: "DEMO-002",
    magnitude: 3.6,
    location: "Región sur del Perú",
    depth: 52,
    time: "08:47",
    status: "En revisión",
  },
  {
    id: "DEMO-003",
    magnitude: 2.8,
    location: "Región norte del Perú",
    depth: 24,
    time: "08:15",
    status: "Verificado",
  },
  {
    id: "DEMO-004",
    magnitude: 3.9,
    location: "Frente a la costa peruana",
    depth: 41,
    time: "07:52",
    status: "Verificado",
  },
];

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
          <span>Datos de demostración</span>
        </div>
      </div>

      <div className="demo-notice">
        <div className="demo-notice-icon">
          <ShieldAlert size={19} />
        </div>
        <div>
          <strong>Entorno de demostración</strong>
          <p>
            Los indicadores y eventos mostrados son ficticios. No representan
            actividad sísmica en tiempo real ni constituyen avisos oficiales.
          </p>
        </div>
      </div>

      <section className="metrics-grid" aria-label="Indicadores generales">
        <MetricCard
          title="Eventos registrados"
          value="1,284"
          description="Catálogo de demostración"
          icon={Activity}
          tone="metric-blue"
        />
        <MetricCard
          title="Magnitud media"
          value="3.42"
          description="Muestra ilustrativa"
          icon={Waves}
          tone="metric-violet"
        />
        <MetricCard
          title="Fuentes configuradas"
          value="04"
          description="Conectores de ejemplo"
          icon={Database}
          tone="metric-teal"
        />
        <MetricCard
          title="Alertas operativas"
          value="03"
          description="Registros ficticios"
          icon={Radio}
          tone="metric-orange"
        />
      </section>

      <section className="dashboard-main-grid">
        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <h2>Actividad sísmica</h2>
              <p>Eventos ilustrativos por día</p>
            </div>
            <span className="panel-period">Últimos 7 días</span>
          </div>

          <div className="chart-legend">
            <span className="legend-dot" />
            Eventos registrados (demo)
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
                  name="Eventos de ejemplo"
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
            <span>Serie simulada; pendiente de conectar con el catálogo real.</span>
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
            <p>Ejemplos de registros del catálogo sísmico</p>
          </div>
          <span className="panel-period">4 registros de ejemplo</span>
        </div>

        <div className="table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Magnitud</th>
                <th>Ubicación</th>
                <th>Profundidad</th>
                <th>Hora demo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {demoEvents.map((event) => (
                <tr key={event.id}>
                  <td className="event-id">{event.id}</td>
                  <td>
                    <span className="magnitude-value">
                      {event.magnitude.toFixed(1)}
                    </span>
                  </td>
                  <td>{event.location}</td>
                  <td>{event.depth} km</td>
                  <td>{event.time}</td>
                  <td>
                    <span
                      className={`event-status ${
                        event.status === "Verificado"
                          ? "event-status-verified"
                          : "event-status-review"
                      }`}
                    >
                      {event.status === "Verificado" ? (
                        <ArrowUpRight size={13} />
                      ) : (
                        <Clock3 size={13} />
                      )}
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-disclaimer">
          <ShieldAlert size={15} />
          Todos los identificadores y registros de esta tabla son ficticios.
        </div>
      </section>
    </div>
  );
}
