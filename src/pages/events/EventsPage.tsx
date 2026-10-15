
import { useMemo, useState } from "react";
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

const DEMO_EVENTS: SeismicEvent[] = [
  {
    id: "DEMO-001",
    sourceId: "SAMPLE-1001",
    date: "2026-10-15",
    time: "09:24:00",
    magnitude: 4.2,
    depth: 38,
    latitude: -12.1,
    longitude: -77.3,
    location: "Costa central del Perú",
    provider: "Catálogo demo",
    status: "Verificado",
  },
  {
    id: "DEMO-002",
    sourceId: "SAMPLE-1002",
    date: "2026-10-15",
    time: "08:47:00",
    magnitude: 3.6,
    depth: 52,
    latitude: -16.4,
    longitude: -73.2,
    location: "Región sur del Perú",
    provider: "Catálogo demo",
    status: "En revisión",
  },
  {
    id: "DEMO-003",
    sourceId: "SAMPLE-1003",
    date: "2026-10-14",
    time: "21:15:00",
    magnitude: 2.8,
    depth: 24,
    latitude: -5.8,
    longitude: -80.1,
    location: "Región norte del Perú",
    provider: "Catálogo demo",
    status: "Verificado",
  },
  {
    id: "DEMO-004",
    sourceId: "SAMPLE-1004",
    date: "2026-10-14",
    time: "18:52:00",
    magnitude: 3.9,
    depth: 41,
    latitude: -14.2,
    longitude: -76.0,
    location: "Frente a la costa peruana",
    provider: "Catálogo demo",
    status: "Verificado",
  },
  {
    id: "DEMO-005",
    sourceId: "SAMPLE-1005",
    date: "2026-10-14",
    time: "15:32:00",
    magnitude: 2.4,
    depth: 18,
    latitude: -9.2,
    longitude: -78.6,
    location: "Costa norte-centro",
    provider: "Catálogo demo",
    status: "Descartado",
  },
  {
    id: "DEMO-006",
    sourceId: "SAMPLE-1006",
    date: "2026-10-13",
    time: "11:08:00",
    magnitude: 4.8,
    depth: 67,
    latitude: -17.1,
    longitude: -71.5,
    location: "Región sur, zona costera",
    provider: "Catálogo demo",
    status: "En revisión",
  },
  {
    id: "DEMO-007",
    sourceId: "SAMPLE-1007",
    date: "2026-10-12",
    time: "06:41:00",
    magnitude: 3.1,
    depth: 33,
    latitude: -8.4,
    longitude: -74.9,
    location: "Región oriental",
    provider: "Catálogo demo",
    status: "Verificado",
  },
  {
    id: "DEMO-008",
    sourceId: "SAMPLE-1008",
    date: "2026-10-11",
    time: "19:20:00",
    magnitude: 2.9,
    depth: 45,
    latitude: -11.7,
    longitude: -75.3,
    location: "Sierra central",
    provider: "Catálogo demo",
    status: "Verificado",
  },
  {
    id: "DEMO-009",
    sourceId: "SAMPLE-1009",
    date: "2026-10-10",
    time: "13:14:00",
    magnitude: 3.7,
    depth: 29,
    latitude: -13.5,
    longitude: -74.2,
    location: "Región andina sur",
    provider: "Catálogo demo",
    status: "En revisión",
  },
  {
    id: "DEMO-010",
    sourceId: "SAMPLE-1010",
    date: "2026-10-09",
    time: "02:36:00",
    magnitude: 2.6,
    depth: 21,
    latitude: -6.8,
    longitude: -79.4,
    location: "Costa norte",
    provider: "Catálogo demo",
    status: "Descartado",
  },
];

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
  link.download = "sepms-eventos-demostracion.csv";
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

  const pageSize = 6;

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return DEMO_EVENTS.filter((event) => {
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
  }, [search, status, minMagnitude, maxMagnitude]);

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

      <div className="demo-notice">
        <div className="demo-notice-icon">
          <ShieldAlert size={19} />
        </div>
        <div>
          <strong>Datos de demostración</strong>
          <p>
            Estos registros son ficticios. Los estados de revisión son
            ilustrativos y no implican validación por una autoridad sísmica.
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
              {pageEvents.map((event) => (
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

              {pageEvents.length === 0 && (
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
              <p>Detalle ficticio para desarrollo y pruebas.</p>
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
