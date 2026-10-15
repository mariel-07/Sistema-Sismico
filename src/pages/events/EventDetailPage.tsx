
import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  ChartNoAxesCombined,
  ShieldAlert,
  Waves,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import './events.css';
const SAMPLE_EVENTS = [
  { id: "DEMO-001", magnitude: 4.2, depth: 38 },
  { id: "DEMO-002", magnitude: 3.6, depth: 52 },
  { id: "DEMO-003", magnitude: 2.8, depth: 24 },
  { id: "DEMO-004", magnitude: 3.9, depth: 41 },
  { id: "DEMO-005", magnitude: 2.4, depth: 18 },
  { id: "DEMO-006", magnitude: 4.8, depth: 67 },
  { id: "DEMO-007", magnitude: 3.1, depth: 33 },
  { id: "DEMO-008", magnitude: 2.9, depth: 45 },
  { id: "DEMO-009", magnitude: 3.7, depth: 29 },
  { id: "DEMO-010", magnitude: 2.6, depth: 21 },
];

export default function StatisticsPage() {
  const [minimumMagnitude, setMinimumMagnitude] = useState("0");

  const events = useMemo(
    () =>
      SAMPLE_EVENTS.filter(
        (event) => event.magnitude >= Number(minimumMagnitude),
      ),
    [minimumMagnitude],
  );

  const stats = useMemo(() => {
    if (!events.length) {
      return { average: 0, averageDepth: 0, max: 0, count: 0 };
    }

    return {
      count: events.length,
      average:
        events.reduce((sum, event) => sum + event.magnitude, 0) /
        events.length,
      averageDepth:
        events.reduce((sum, event) => sum + event.depth, 0) / events.length,
      max: Math.max(...events.map((event) => event.magnitude)),
    };
  }, [events]);

  const distribution = useMemo(() => {
    const ranges = [
      { label: "2.0–2.9", min: 2, max: 3 },
      { label: "3.0–3.9", min: 3, max: 4 },
      { label: "4.0–4.9", min: 4, max: 5 },
      { label: "5.0+", min: 5, max: Infinity },
    ];

    return ranges.map((range) => ({
      range: range.label,
      total: events.filter(
        (event) => event.magnitude >= range.min && event.magnitude < range.max,
      ).length,
    }));
  }, [events]);

  const depthDistribution = useMemo(
    () =>
      events.map((event) => ({
        event: event.id.replace("DEMO-", ""),
        magnitude: event.magnitude,
        depth: event.depth,
      })),
    [events],
  );

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <ChartNoAxesCombined size={15} />
            MONITOREO SÍSMICO
          </div>
          <h1>Análisis estadístico</h1>
          <p>
            Explora distribuciones de magnitud y estadísticas descriptivas.
          </p>
        </div>

        <label className="statistics-filter">
          <span>Magnitud mínima</span>
          <select
            value={minimumMagnitude}
            onChange={(event) => setMinimumMagnitude(event.target.value)}
          >
            <option value="0">Todas</option>
            <option value="2">2.0+</option>
            <option value="3">3.0+</option>
            <option value="4">4.0+</option>
            <option value="5">5.0+</option>
          </select>
        </label>
      </div>

      <div className="demo-notice">
        <ShieldAlert size={19} />
        <div>
          <strong>Resultados ilustrativos</strong>
          <p>
            Las métricas se calculan sobre registros ficticios. No son un
            diagnóstico de riesgo sísmico ni una predicción de terremotos.
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Muestra analizada</span>
            <div className="metric-icon metric-blue">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.count}</div>
          <div className="metric-bottom">
            <span className="metric-description">Registros filtrados</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Magnitud media</span>
            <div className="metric-icon metric-violet">
              <Waves size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.average.toFixed(2)}</div>
          <div className="metric-bottom">
            <span className="metric-description">Media aritmética</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Magnitud máxima</span>
            <div className="metric-icon metric-orange">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.max.toFixed(1)}</div>
          <div className="metric-bottom">
            <span className="metric-description">En la muestra filtrada</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Profundidad media</span>
            <div className="metric-icon metric-teal">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">{stats.averageDepth.toFixed(1)} km</div>
          <div className="metric-bottom">
            <span className="metric-description">Media aritmética</span>
          </div>
        </article>
      </section>

      <section className="statistics-grid">
        <article className="panel statistics-panel">
          <div className="panel-heading">
            <div>
              <h2>Distribución de magnitudes</h2>
              <p>Frecuencia por intervalo en la muestra seleccionada.</p>
            </div>
          </div>

          <div className="statistics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution}
                margin={{ top: 20, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e8edf4"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="range"
                  tick={{ fill: "#77849a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#77849a", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    border: "1px solid #e8edf4",
                    borderRadius: 9,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Cantidad de registros"
                  radius={[5, 5, 0, 0]}
                >
                  {distribution.map((entry, index) => (
                    <Cell
                      key={entry.range}
                      fill={["#0d9488", "#4382db", "#9875cb", "#d98b3e"][index]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel statistics-panel">
          <div className="panel-heading">
            <div>
              <h2>Magnitud y profundidad</h2>
              <p>Comparación de registros individuales.</p>
            </div>
          </div>

          <div className="statistics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={depthDistribution}
                margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  stroke="#e8edf4"
                  strokeDasharray="4 4"
                  vertical={false}
                />
                <XAxis
                  dataKey="event"
                  tick={{ fill: "#77849a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#77849a", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  unit=" km"
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === "depth" ? `${value} km` : value,
                    name === "depth" ? "Profundidad" : "Magnitud",
                  ]}
                  contentStyle={{
                    border: "1px solid #e8edf4",
                    borderRadius: 9,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="depth"
                  name="Profundidad"
                  fill="#4382db"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="panel statistics-notes">
        <h2>Interpretación de la muestra</h2>
        <p>
          La media resume los valores de magnitud de los registros incluidos.
          La distribución permite comparar frecuencias entre intervalos. Estas
          estadísticas dependen de la selección, cobertura y calidad de los
          datos y no establecen por sí solas probabilidades futuras de
          terremotos.
        </p>
      </section>
    </div>
  );
}
