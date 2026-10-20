import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Activity,
  MapPin,
  AlertTriangle,
} from "lucide-react";

import { getEvents } from "../../services/api/events.api";
import { getApiErrorMessage } from "../../services/api/client";
import type { SeismicEvent } from "../../types/event";
import "./reports.css";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";

type ReportType = "events" | "magnitudes" | "locations" | "alerts" | "system";
type ReportFormat = "pdf" | "excel";

interface ReportRecord {
  id: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  depth: number;
  magnitude: number;
  location: string;
  status: string;
}

const reportOptions = [
  {
    id: "events" as ReportType,
    title: "Reporte de eventos sísmicos",
    description: "Listado detallado de eventos registrados en el sistema.",
    icon: Activity,
  },
  {
    id: "magnitudes" as ReportType,
    title: "Reporte de magnitudes",
    description: "Análisis de magnitudes, distribución y eventos destacados.",
    icon: BarChart3,
  },
  {
    id: "locations" as ReportType,
    title: "Reporte geográfico",
    description: "Distribución de eventos según ubicación geográfica.",
    icon: MapPin,
  },
  {
    id: "alerts" as ReportType,
    title: "Reporte de alertas",
    description: "Resumen de eventos por magnitud y criticidad.",
    icon: AlertTriangle,
  },
  {
    id: "system" as ReportType,
    title: "Reporte del sistema",
    description: "Resumen de los eventos disponibles en la API.",
    icon: FileBarChart,
  },
];

function mapEvent(event: SeismicEvent): ReportRecord {
  const dateValue = new Date(event.origin_time_utc);
  const date = Number.isNaN(dateValue.getTime())
    ? { date: "Fecha desconocida", time: "--:--:--" }
    : {
        date: dateValue.toISOString().slice(0, 10),
        time: dateValue.toISOString().slice(11, 19),
      };

  const location =
    [event.district, event.province, event.department]
      .filter(Boolean)
      .join(", ") ||
    event.reference_location ||
    "Ubicación no disponible";

  const status =
    event.magnitude >= 7
      ? "Crítico"
      : event.magnitude >= 6
        ? "Fuerte"
        : event.magnitude >= 4
          ? "Moderado"
          : "Normal";

  return {
    id: event.id,
    date: date.date,
    time: date.time,
    latitude: event.latitude,
    longitude: event.longitude,
    depth: event.depth_km,
    magnitude: event.magnitude,
    location,
    status,
  };
}

function escapeCsv(value: string | number): string {
  const text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [reportType, setReportType] = useState<ReportType>("events");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [minMagnitude, setMinMagnitude] = useState("");
  const [maxMagnitude, setMaxMagnitude] = useState("");
  const [events, setEvents] = useState<ReportRecord[]>([]);
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setLoading(true);
      setApiError("");

      try {
        // El endpoint permite hasta 1000 registros por petición.
        // Se pagina para incluir también conjuntos mayores.
        const pageSize = 1000;
        let offset = 0;
        let allEvents: SeismicEvent[] = [];

        while (true) {
          const page = await getEvents({ limit: pageSize, offset });
          allEvents = allEvents.concat(page);

          if (page.length < pageSize) break;
          offset += pageSize;
        }

        if (!cancelled) setEvents(allEvents.map(mapEvent));
      } catch (error) {
        if (!cancelled) setApiError(getApiErrorMessage(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !term ||
        event.location.toLowerCase().includes(term) ||
        event.date.includes(term) ||
        event.time.includes(term);

      const matchesMin =
        minMagnitude === "" || event.magnitude >= Number(minMagnitude);
      const matchesMax =
        maxMagnitude === "" || event.magnitude <= Number(maxMagnitude);
      const matchesStart = !startDate || event.date >= startDate;
      const matchesEnd = !endDate || event.date <= endDate;

      return (
        matchesSearch &&
        matchesMin &&
        matchesMax &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [events, search, minMagnitude, maxMagnitude, startDate, endDate]);

  const statistics = useMemo(() => {
    const total = filteredEvents.length;
    const average = total
      ? filteredEvents.reduce((sum, event) => sum + event.magnitude, 0) / total
      : 0;
    const maximum = total
      ? Math.max(...filteredEvents.map((event) => event.magnitude))
      : 0;
    const minimumDepth = total
      ? Math.min(...filteredEvents.map((event) => event.depth))
      : 0;

    return { total, average, maximum, minimumDepth };
  }, [filteredEvents]);

  const handleGenerate = () => {
    if (startDate && endDate && startDate > endDate) {
      setApiError("La fecha inicial no puede ser posterior a la fecha final.");
      setGenerated(false);
      return;
    }

    if (
      minMagnitude !== "" &&
      maxMagnitude !== "" &&
      Number(minMagnitude) > Number(maxMagnitude)
    ) {
      setApiError("La magnitud mínima no puede superar la magnitud máxima.");
      setGenerated(false);
      return;
    }

    setApiError("");
    setGenerated(true);
  };

  const handleDownload = () => {
    if (format === "pdf") {
      window.print();
      return;
    }

    const headers = [
      "ID",
      "Fecha UTC",
      "Hora UTC",
      "Latitud",
      "Longitud",
      "Profundidad km",
      "Magnitud",
      "Ubicación",
      "Estado estimado por magnitud",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.date,
      event.time,
      event.latitude,
      event.longitude,
      event.depth,
      event.magnitude,
      event.location,
      event.status,
    ]);

    const csv = [
      headers.map(escapeCsv).join(";"),
      ...rows.map((row) => row.map(escapeCsv).join(";")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `reporte-sismico-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (year === "Todos") {
      setStartDate("");
      setEndDate("");
    } else {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
    setGenerated(false);
  };

  const handleClear = () => {
    setSelectedYear(DEFAULT_YEAR);
    setStartDate("");
    setEndDate("");
    setSearch("");
    setMinMagnitude("");
    setMaxMagnitude("");
    setGenerated(false);
    setApiError("");
  };

  const selectedReport = reportOptions.find((report) => report.id === reportType);

  return (
    <div className="reports-page">
      <header className="reports-header">
        <div>
          <div className="reports-eyebrow">SEPMS / REPORTES</div>
          <h1>Generación de reportes</h1>
          <p>
            Consulta y analiza los eventos sísmicos registrados en el sistema.
          </p>
        </div>

        <div className="reports-header-actions">
          <button
            type="button"
            className="reports-secondary-button"
            onClick={handleClear}
          >
            <RefreshCw size={17} />
            Limpiar
          </button>
        </div>
      </header>

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={handleYearChange}
        itemCount={filteredEvents.length}
        label="Filtrar datos de reportes por año:"
      />

      <section className="report-type-section">
        <div className="section-title">
          <FileBarChart size={20} />
          <div>
            <h2>Tipo de reporte</h2>
            <span>Selecciona la información que deseas consultar.</span>
          </div>
        </div>

        <div className="report-options">
          {reportOptions.map((option) => {
            const Icon = option.icon;
            const active = reportType === option.id;

            return (
              <button
                key={option.id}
                type="button"
                className={`report-option ${active ? "active" : ""}`}
                onClick={() => {
                  setReportType(option.id);
                  setGenerated(false);
                }}
              >
                <span className="report-option-icon">
                  <Icon size={21} />
                </span>
                <span className="report-option-content">
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="report-filter-card">
        <div className="section-title">
          <Filter size={20} />
          <div>
            <h2>Parámetros del reporte</h2>
            <span>Define los criterios para filtrar la información.</span>
          </div>
        </div>

        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="startDate">Fecha inicial</label>
            <div className="input-icon">
              <CalendarDays size={17} />
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="endDate">Fecha final</label>
            <div className="input-icon">
              <CalendarDays size={17} />
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="minMagnitude">Magnitud mínima</label>
            <input
              id="minMagnitude"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="Ej. 5.0"
              value={minMagnitude}
              onChange={(event) => setMinMagnitude(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxMagnitude">Magnitud máxima</label>
            <input
              id="maxMagnitude"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="Ej. 8.0"
              value={maxMagnitude}
              onChange={(event) => setMaxMagnitude(event.target.value)}
            />
          </div>

          <div className="form-group form-group-wide">
            <label htmlFor="search">Ubicación o fecha</label>
            <div className="input-icon">
              <Search size={17} />
              <input
                id="search"
                type="text"
                placeholder="Buscar por ubicación o fecha..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="format-section">
          <div>
            <label className="format-label">Formato de salida</label>
            <div className="format-options">
              <button
                type="button"
                className={`format-button ${format === "pdf" ? "active" : ""}`}
                onClick={() => setFormat("pdf")}
              >
                <FileText size={18} />
                PDF / imprimir
              </button>
              <button
                type="button"
                className={`format-button ${format === "excel" ? "active" : ""}`}
                onClick={() => setFormat("excel")}
              >
                <FileSpreadsheet size={18} />
                CSV para Excel
              </button>
            </div>
          </div>

          <button
            type="button"
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading || Boolean(apiError)}
          >
            {loading ? (
              <>
                <RefreshCw size={18} className="spin" />
                Cargando eventos...
              </>
            ) : (
              <>
                <FileBarChart size={18} />
                Generar reporte
              </>
            )}
          </button>
        </div>
      </section>

      {apiError && (
        <div role="alert" className="report-error">
          {apiError}
          <button type="button" onClick={() => setApiError("")}>
            Cerrar
          </button>
        </div>
      )}

      <section className="report-summary">
        <div className="summary-card">
          <span className="summary-icon"><Activity size={20} /></span>
          <div>
            <small>Eventos encontrados</small>
            <strong>{statistics.total}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon"><TrendingUp size={20} /></span>
          <div>
            <small>Magnitud promedio</small>
            <strong>{statistics.average.toFixed(2)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon"><BarChart3 size={20} /></span>
          <div>
            <small>Mayor magnitud</small>
            <strong>{statistics.maximum.toFixed(1)}</strong>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon"><MapPin size={20} /></span>
          <div>
            <small>Menor profundidad</small>
            <strong>{statistics.minimumDepth} km</strong>
          </div>
        </div>
      </section>

      <section className="report-preview">
        <div className="preview-header">
          <div>
            <div className="preview-label">VISTA PREVIA</div>
            <h2>{selectedReport?.title}</h2>
            <p>{selectedReport?.description}</p>
          </div>

          {generated && (
            <button
              type="button"
              className="download-button"
              onClick={handleDownload}
              disabled={filteredEvents.length === 0}
            >
              <Download size={17} />
              {format === "pdf" ? "Imprimir / guardar PDF" : "Descargar CSV"}
            </button>
          )}
        </div>

        {loading ? (
          <div className="preview-empty">
            <RefreshCw size={32} className="spin" />
            <h3>Cargando eventos reales</h3>
            <p>Consultando los registros disponibles en FastAPI.</p>
          </div>
        ) : generated ? (
          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Fecha UTC</th>
                  <th>Hora UTC</th>
                  <th>Latitud</th>
                  <th>Longitud</th>
                  <th>Profundidad</th>
                  <th>Magnitud</th>
                  <th>Ubicación</th>
                  <th>Estado estimado</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.date}</td>
                    <td>{event.time}</td>
                    <td>{event.latitude}</td>
                    <td>{event.longitude}</td>
                    <td>{event.depth} km</td>
                    <td><strong>{event.magnitude.toFixed(1)}</strong></td>
                    <td>{event.location}</td>
                    <td>
                      <span
                        className={`event-status ${event.status.toLowerCase().replace("í", "i")}`}
                      >
                        {event.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredEvents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-results">
                      No se encontraron eventos con los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="preview-empty">
            <FileBarChart size={42} />
            <h3>Reporte listo para generar</h3>
            <p>
              {loading
                ? "Cargando datos del servidor..."
                : `Se han cargado ${events.length} eventos. Ajusta los filtros y presiona `}
              {!loading && <strong>“Generar reporte”</strong>}
              {!loading && " para visualizar los resultados."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}