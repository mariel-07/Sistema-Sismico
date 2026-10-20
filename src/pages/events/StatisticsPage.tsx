
import { useEffect, useMemo, useState } from "react";
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

import { getEvents } from "../../services/api/events.api";
import { getApiErrorMessage } from "../../services/api/client";
import type { SeismicEvent } from "../../types/event";

export default function StatisticsPage() {
  const [minimumMagnitude, setMinimumMagnitude] = useState("0");
  const [allEvents, setAllEvents] = useState<SeismicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setApiError("");

      try {
        const data = await getEvents({
          limit: 1000,
          offset: 0,
        });

        if (!cancelled) {
          setAllEvents(data);
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  const events = useMemo(
    () =>
      allEvents.filter(
        (event) => event.magnitude >= Number(minimumMagnitude),
      ),
    [allEvents, minimumMagnitude],
  );

  const stats = useMemo(() => {
    if (events.length === 0) {
      return {
        average: null as number | null,
        averageDepth: null as number | null,
        max: null as number | null,
        count: 0,
      };
    }

    return {
      count: events.length,
      average:
        events.reduce((sum, event) => sum + event.magnitude, 0) /
        events.length,
      averageDepth:
        events.reduce((sum, event) => sum + event.depth_km, 0) /
        events.length,
      max: Math.max(...events.map((event) => event.magnitude)),
    };
  }, [events]);

  const distribution = useMemo(() => {
    const ranges = [
      { label: "0.0–1.9", min: 0, max: 2 },
      { label: "2.0–2.9", min: 2, max: 3 },
      { label: "3.0–3.9", min: 3, max: 4 },
      { label: "4.0–4.9", min: 4, max: 5 },
      { label: "5.0+", min: 5, max: Infinity },
    ];

    return ranges.map((range) => ({
      range: range.label,
      total: events.filter(
        (event) =>
          event.magnitude >= range.min &&
          event.magnitude < range.max,
      ).length,
    }));
  }, [events]);

  const depthDistribution = useMemo(
    () =>
      events.slice(0, 50).map((event, index) => ({
        event: String(index + 1),
        magnitude: event.magnitude,
        depth: event.depth_km,
        id: event.external_id || event.id,
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
            Distribuciones y estadísticas descriptivas de los eventos
            recibidos desde el catálogo sísmico.
          </p>
        </div>

        <label className="statistics-filter">
          <span>Magnitud mínima</span>
          <select
            value={minimumMagnitude}
            onChange={(event) =>
              setMinimumMagnitude(event.target.value)
            }
          >
            <option value="0">Todas</option>
            <option value="2">2.0+</option>
            <option value="3">3.0+</option>
            <option value="4">4.0+</option>
            <option value="5">5.0+</option>
          </select>
        </label>
      </div>

      <div className="demo-notice" role="status">
        <ShieldAlert size={19} />
        <div>
          <strong>
            {loading
              ? "Cargando estadísticas"
              : apiError
                ? "Error al consultar el catálogo"
                : "Estadísticas de datos reales"}
          </strong>
          <p>
            {loading
              ? "Consultando los eventos del backend."
              : apiError
                ? apiError
                : `Se recibieron ${allEvents.length} eventos para el análisis. La consulta actual está limitada a los 1.000 registros más recientes.`}
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Eventos analizados</span>
            <div className="metric-icon metric-blue">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">
            {loading ? "…" : stats.count}
          </div>
          <div className="metric-bottom">
            <span className="metric-description">
              Registros después del filtro
            </span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Magnitud media</span>
            <div className="metric-icon metric-violet">
              <Waves size={20} />
            </div>
          </div>
          <div className="metric-value">
            {stats.average === null
              ? "—"
              : stats.average.toFixed(2)}
          </div>
          <div className="metric-bottom">
            <span className="metric-description">
              Media de los registros filtrados
            </span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Magnitud máxima</span>
            <div className="metric-icon metric-orange">
              <BarChart3 size={20} />
            </div>
          </div>
          <div className="metric-value">
            {stats.max === null ? "—" : stats.max.toFixed(1)}
          </div>
          <div className="metric-bottom">
            <span className="metric-description">
              Máxima en la muestra filtrada
            </span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Profundidad media</span>
            <div className="metric-icon metric-teal">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">
            {stats.averageDepth === null
              ? "—"
              : `${stats.averageDepth.toFixed(1)} km`}
          </div>
          <div className="metric-bottom">
            <span className="metric-description">
              Media de profundidad
            </span>
          </div>
        </article>
      </section>

      <section className="statistics-grid">
        <article className="panel statistics-panel">
          <div className="panel-heading">
            <div>
              <h2>Distribución de magnitudes</h2>
              <p>Frecuencia por intervalo en los eventos cargados.</p>
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
                  name="Cantidad de eventos"
                  radius={[5, 5, 0, 0]}
                >
                  {distribution.map((entry, index) => (
                    <Cell
                      key={entry.range}
                      fill={
                        [
                          "#0d9488",
                          "#4382db",
                          "#9875cb",
                          "#d98b3e",
                          "#e16a4c",
                        ][index]
                      }
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
              <h2>Profundidad por evento</h2>
              <p>
                Hasta 50 eventos de la muestra, ordenados por fecha
                descendente.
              </p>
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
                  labelFormatter={(label) => {
                    const event = depthDistribution.find(
                      (item) => item.event === String(label),
                    );
                    return event ? `Evento ${event.id}` : `Evento ${label}`;
                  }}
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

      {!loading && !apiError && events.length === 0 && (
        <section className="panel statistics-notes">
          No hay eventos que cumplan el filtro de magnitud seleccionado.
        </section>
      )}

      <section className="panel statistics-notes">
        <h2>Interpretación de la muestra</h2>
        <p>
          Las métricas describen los eventos cargados y el filtro
          seleccionado. La distribución y las medias no constituyen una
          predicción de terremotos ni una evaluación oficial del riesgo.
          Para analizar todo el catálogo, será necesario incorporar
          agregaciones y paginación en el backend.
        </p>
      </section>
    </div>
  );
}
