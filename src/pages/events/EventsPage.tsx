
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";
import './events.css';
import { getEvents } from "../../services/api/events.api";
import { getApiErrorMessage } from "../../services/api/client";
import type { SeismicEvent as ApiSeismicEvent } from "../../types/event";


type EventStatus = "Verificado" | "En revisión" | "Descartado";

interface SeismicEvent {
  id: string;
  sourceId: string;
  date: string;
  time: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  location: string;
  provider: string;
  status: EventStatus;
}

function mapApiEvent(event: ApiSeismicEvent): SeismicEvent {
  const origin = new Date(event.origin_time_utc);
  const review = (event.review_status ?? "").toLowerCase();

  let status: EventStatus = "En revisión";
  if (["verified", "approved", "verified_by_authority"].includes(review)) {
    status = "Verificado";
  } else if (["rejected", "discarded"].includes(review)) {
    status = "Descartado";
  }

  const location =
    event.reference_location ||
    [event.district, event.province, event.department]
      .filter(Boolean)
      .join(", ") ||
    `Lat. ${event.latitude.toFixed(3)}, Lon. ${event.longitude.toFixed(3)}`;

  return {
    id: event.id,
    sourceId: event.external_id ??
      (event.source_record_id != null ? String(event.source_record_id) : event.id),
    date: Number.isNaN(origin.getTime())
      ? event.origin_time_utc.slice(0, 10)
      : origin.toISOString().slice(0, 10),
    time: Number.isNaN(origin.getTime())
      ? "--:--:--"
      : origin.toISOString().slice(11, 19),
    magnitude: event.magnitude,
    depth: event.depth_km,
    latitude: event.latitude,
    longitude: event.longitude,
    location,
    provider: event.data_source_id
      ? `Fuente ${event.data_source_id.slice(0, 8)}`
      : "Fuente no identificada",
    status,
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}

function exportCsv(events: SeismicEvent[]) {
  const headers = [
    "ID",
    "Fecha",
    "Hora",
    "Magnitud",
    "Profundidad_km",
    "Latitud",
    "Longitud",
    "Ubicacion",
    "Fuente",
    "Estado",
  ];

  const rows = events.map((event) => [
    event.id,
    event.date,
    event.time,
    event.magnitude,
    event.depth,
    event.latitude,
    event.longitude,
    event.location,
    event.provider,
    event.status,
  ]);

  const escapeCsv = (value: string | number) =>
    `"${String(value).replace(/"/g, '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sepms-catalogo-sismico.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Todos");
  const [minMagnitude, setMinMagnitude] = useState("0");
  const [maxMagnitude, setMaxMagnitude] = useState("10");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<SeismicEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [events, setEvents] = useState<SeismicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setApiError("");
      try {
        const data = await getEvents({ limit: 1000, offset: 0 });
        if (!cancelled) setEvents(data.map(mapApiEvent));
      } catch (error) {
        if (!cancelled) setApiError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEvents();
    return () => { cancelled = true; };
  }, []);

  const pageSize = 6;

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !term ||
        [
          event.id,
          event.sourceId,
          event.location,
          event.provider,
          event.status,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus = status === "Todos" || event.status === status;
      const matchesMin = event.magnitude >= Number(minMagnitude);
      const matchesMax = event.magnitude <= Number(maxMagnitude);

      return matchesSearch && matchesStatus && matchesMin && matchesMax;
    });
  }, [events, search, status, minMagnitude, maxMagnitude]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const averageMagnitude = filteredEvents.length
    ? filteredEvents.reduce((sum, event) => sum + event.magnitude, 0) /
      filteredEvents.length
    : 0;

  const averageDepth = filteredEvents.length
    ? filteredEvents.reduce((sum, event) => sum + event.depth, 0) /
      filteredEvents.length
    : 0;

  function clearFilters() {
    setSearch("");
    setStatus("Todos");
    setMinMagnitude("0");
    setMaxMagnitude("10");
    setPage(1);
  }

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <Activity size={15} />
            MONITOREO SÍSMICO
          </div>
          <h1>Catálogo de eventos</h1>
          <p>
            Consulta, filtra y revisa los registros del catálogo sísmico.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => exportCsv(filteredEvents)}
        >
          <Download size={17} />
          Exportar CSV
        </button>
      </div>

      <div className="demo-notice" role="status">
        <div className="demo-notice-icon">
          <ShieldAlert size={19} />
        </div>
        <div>
          <strong>
            {loading ? "Consultando catálogo" : apiError ? "Error de conexión" : "Catálogo conectado"}
          </strong>
          <p>
            {loading
              ? "Esperando respuesta del backend."
              : apiError
                ? apiError
                : `Se recibieron ${events.length} registros de la API. Los estados corresponden a los datos almacenados.`}
          </p>
        </div>
      </div>

      <section className="metrics-grid events-summary">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Registros encontrados</span>
            <div className="metric-icon metric-blue">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">{filteredEvents.length}</div>
          <div className="metric-bottom">
            <span className="metric-description">Según filtros actuales</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Magnitud media</span>
            <div className="metric-icon metric-violet">
              <Activity size={20} />
            </div>
          </div>
          <div className="metric-value">{averageMagnitude.toFixed(2)}</div>
          <div className="metric-bottom">
            <span className="metric-description">Muestra filtrada</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Profundidad media</span>
            <div className="metric-icon metric-teal">
              <MapPin size={20} />
            </div>
          </div>
          <div className="metric-value">{averageDepth.toFixed(1)} km</div>
          <div className="metric-bottom">
            <span className="metric-description">Muestra filtrada</span>
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">En revisión</span>
            <div className="metric-icon metric-orange">
              <SlidersHorizontal size={20} />
            </div>
          </div>
          <div className="metric-value">
            {filteredEvents.filter((event) => event.status === "En revisión").length}
          </div>
          <div className="metric-bottom">
            <span className="metric-description">Estado demostrativo</span>
          </div>
        </article>
      </section>

      <section className="panel events-panel">
        <div className="panel-heading">
          <div>
            <h2>Registros sísmicos</h2>
            <p>Busca por identificador, ubicación, fuente o estado.</p>
          </div>

          <button
            className="secondary-button"
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter size={16} />
            Filtros
          </button>
        </div>

        <div className="events-toolbar">
          <label className="events-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar eventos..."
            />
            {search && (
              <button
                aria-label="Limpiar búsqueda"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
              >
                <X size={15} />
              </button>
            )}
          </label>

          <span className="results-count">
            {filteredEvents.length} resultados
          </span>
        </div>

        {showFilters && (
          <div className="event-filters">
            <label>
              Estado de revisión
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setPage(1);
                }}
              >
                <option>Todos</option>
                <option>Verificado</option>
                <option>En revisión</option>
                <option>Descartado</option>
              </select>
            </label>

            <label>
              Magnitud mínima
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={minMagnitude}
                onChange={(event) => {
                  setMinMagnitude(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <label>
              Magnitud máxima
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={maxMagnitude}
                onChange={(event) => {
                  setMaxMagnitude(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <button className="text-button" onClick={clearFilters}>
              Limpiar filtros
            </button>
          </div>
        )}

        <div className="table-wrapper">
          <table className="events-table catalog-table">
            <thead>
              <tr>
                <th>Identificador</th>
                <th>Fecha y hora (UTC)</th>
                <th>Magnitud</th>
                <th>Profundidad</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={7}>Cargando eventos sísmicos...</td></tr>
              ) : apiError ? (
                <tr><td colSpan={7}>{apiError}</td></tr>
              ) : pageEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span className="event-id">{event.id}</span>
                    <span className="catalog-source-id">{event.sourceId}</span>
                  </td>
                  <td>
                    <div className="catalog-date">
                      <CalendarDays size={14} />
                      {formatDate(event.date)}
                    </div>
                    <span className="catalog-source-id">{event.time}</span>
                  </td>
                  <td>
                    <span className="magnitude-value">
                      {event.magnitude.toFixed(1)}
                    </span>
                  </td>
                  <td>{event.depth} km</td>
                  <td className="catalog-location">{event.location}</td>
                  <td>
                    <span
                      className={`event-status ${
                        event.status === "Verificado"
                          ? "event-status-verified"
                          : event.status === "En revisión"
                            ? "event-status-review"
                            : "event-status-discarded"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="details-button"
                      onClick={() => setSelected(event)}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && !apiError && pageEvents.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Search size={25} />
                      <strong>No se encontraron registros</strong>
                      <span>Prueba con otros términos o filtros.</span>
                      <button className="text-button" onClick={clearFilters}>
                        Restablecer búsqueda
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <div>
            <button
              className="pagination-button"
              aria-label="Página anterior"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="pagination-button"
              aria-label="Página siguiente"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="detail-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-detail-title"
          >
            <div className="detail-modal-header">
              <div>
                <span className="eyebrow">FICHA DEL REGISTRO</span>
                <h2 id="event-detail-title">{selected.id}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Cerrar detalle"
              >
                <X size={19} />
              </button>
            </div>

            <div className="demo-notice">
              <ShieldAlert size={18} />
              <p>Detalle del registro recibido del catálogo.</p>
            </div>

            <div className="detail-grid">
              <div>
                <span>Magnitud</span>
                <strong>{selected.magnitude.toFixed(1)}</strong>
              </div>
              <div>
                <span>Profundidad</span>
                <strong>{selected.depth} km</strong>
              </div>
              <div>
                <span>Latitud</span>
                <strong>{selected.latitude.toFixed(4)}</strong>
              </div>
              <div>
                <span>Longitud</span>
                <strong>{selected.longitude.toFixed(4)}</strong>
              </div>
              <div>
                <span>Fecha UTC</span>
                <strong>{selected.date}</strong>
              </div>
              <div>
                <span>Hora UTC</span>
                <strong>{selected.time}</strong>
              </div>
              <div>
                <span>Fuente</span>
                <strong>{selected.provider}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{selected.status}</strong>
              </div>
              <div className="detail-grid-full">
                <span>Ubicación descriptiva</span>
                <strong>{selected.location}</strong>
              </div>
              <div className="detail-grid-full">
                <span>Identificador externo de ejemplo</span>
                <strong>{selected.sourceId}</strong>
              </div>
            </div>

            <button
              className="primary-button detail-close-button"
              onClick={() => setSelected(null)}
            >
              Cerrar ficha
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
