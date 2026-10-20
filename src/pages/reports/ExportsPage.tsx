import { useMemo, useState } from "react";
import {
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  FileDown,
  Search,
  RefreshCw,
  CalendarDays,
  Filter,
  CheckCircle2,
  Clock3,
  XCircle,
  RotateCcw,
} from "lucide-react";

import "./reports.css";

type ExportFormat = "PDF" | "Excel" | "CSV";
type ExportStatus = "Completado" | "Procesando" | "Error";

interface ExportRecord {
  id: number;
  report: string;
  type: string;
  format: ExportFormat;
  date: string;
  time: string;
  user: string;
  records: number;
  status: ExportStatus;
}

const initialExports: ExportRecord[] = [
  {
    id: 1,
    report: "Reporte de eventos sísmicos",
    type: "Eventos sísmicos",
    format: "PDF",
    date: "2026-10-17",
    time: "09:15:32",
    user: "Administrador",
    records: 125,
    status: "Completado",
  },
  {
    id: 2,
    report: "Análisis de magnitudes",
    type: "Magnitudes",
    format: "Excel",
    date: "2026-10-17",
    time: "08:52:14",
    user: "Analista",
    records: 86,
    status: "Completado",
  },
  {
    id: 3,
    report: "Distribución geográfica",
    type: "Geográfico",
    format: "PDF",
    date: "2026-10-16",
    time: "17:42:08",
    user: "Analista",
    records: 214,
    status: "Completado",
  },
  {
    id: 4,
    report: "Reporte de alertas",
    type: "Alertas",
    format: "Excel",
    date: "2026-10-16",
    time: "15:30:44",
    user: "Administrador",
    records: 32,
    status: "Completado",
  },
  {
    id: 5,
    report: "Eventos sísmicos históricos",
    type: "Eventos sísmicos",
    format: "CSV",
    date: "2026-10-15",
    time: "11:20:19",
    user: "Analista",
    records: 486,
    status: "Completado",
  },
  {
    id: 6,
    report: "Reporte de sistema",
    type: "Sistema",
    format: "PDF",
    date: "2026-10-15",
    time: "09:08:51",
    user: "Administrador",
    records: 1,
    status: "Procesando",
  },
  {
    id: 7,
    report: "Resumen de magnitudes",
    type: "Magnitudes",
    format: "Excel",
    date: "2026-10-14",
    time: "16:24:33",
    user: "Analista",
    records: 157,
    status: "Error",
  },
];

const formatIcon = (format: ExportFormat) => {
  if (format === "PDF") return FileText;
  if (format === "Excel") return FileSpreadsheet;
  return FileDown;
};

export default function ExportsPage() {
  const [exports, setExports] =
    useState<ExportRecord[]>(initialExports);

  const [search, setSearch] = useState("");
  const [formatFilter, setFormatFilter] =
    useState<"Todos" | ExportFormat>("Todos");

  const [typeFilter, setTypeFilter] =
    useState("Todos");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredExports = useMemo(() => {
    return exports.filter((item) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.report.toLowerCase().includes(searchValue) ||
        item.type.toLowerCase().includes(searchValue) ||
        item.user.toLowerCase().includes(searchValue);

      const matchesFormat =
        formatFilter === "Todos" ||
        item.format === formatFilter;

      const matchesType =
        typeFilter === "Todos" ||
        item.type === typeFilter;

      const matchesStart =
        !startDate || item.date >= startDate;

      const matchesEnd =
        !endDate || item.date <= endDate;

      return (
        matchesSearch &&
        matchesFormat &&
        matchesType &&
        matchesStart &&
        matchesEnd
      );
    });
  }, [
    exports,
    search,
    formatFilter,
    typeFilter,
    startDate,
    endDate,
  ]);

  const completedCount = exports.filter(
    (item) => item.status === "Completado"
  ).length;

  const processingCount = exports.filter(
    (item) => item.status === "Procesando"
  ).length;

  const errorCount = exports.filter(
    (item) => item.status === "Error"
  ).length;

  const totalRecords = exports.reduce(
    (total, item) => total + item.records,
    0
  );

  const clearFilters = () => {
    setSearch("");
    setFormatFilter("Todos");
    setTypeFilter("Todos");
    setStartDate("");
    setEndDate("");
  };

  const handleDownload = (item: ExportRecord) => {
    if (item.status !== "Completado") {
      return;
    }

    const content = [
      "SEPMS - Exportación de reporte",
      "",
      `Reporte: ${item.report}`,
      `Tipo: ${item.type}`,
      `Formato: ${item.format}`,
      `Fecha: ${item.date}`,
      `Hora: ${item.time}`,
      `Usuario: ${item.user}`,
      `Registros: ${item.records}`,
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.report
      .toLowerCase()
      .replace(/\s+/g, "-")}.${item.format === "PDF"
      ? "pdf"
      : item.format === "Excel"
      ? "xlsx"
      : "csv"}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const handleRetry = (id: number) => {
    setExports((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Procesando",
            }
          : item
      )
    );

    setTimeout(() => {
      setExports((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "Completado",
              }
            : item
        )
      );
    }, 1000);
  };

  return (
    <div className="exports-page">

      {/* HEADER */}

      <header className="exports-header">
        <div>
          <div className="exports-eyebrow">
            SEPMS / REPORTES / EXPORTACIONES
          </div>

          <h1>Exportaciones</h1>

          <p>
            Administra y consulta el historial de archivos
            generados desde los reportes del sistema.
          </p>
        </div>

        <button
          type="button"
          className="exports-refresh-button"
          onClick={() =>
            setExports([...initialExports])
          }
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </header>

      {/* SUMMARY */}

      <section className="exports-summary">

        <div className="export-summary-card">
          <div className="export-summary-icon total">
            <FileBarChart size={20} />
          </div>

          <div>
            <span>Total exportaciones</span>
            <strong>{exports.length}</strong>
          </div>
        </div>

        <div className="export-summary-card">
          <div className="export-summary-icon completed">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>Completadas</span>
            <strong>{completedCount}</strong>
          </div>
        </div>

        <div className="export-summary-card">
          <div className="export-summary-icon processing">
            <Clock3 size={20} />
          </div>

          <div>
            <span>En proceso</span>
            <strong>{processingCount}</strong>
          </div>
        </div>

        <div className="export-summary-card">
          <div className="export-summary-icon error">
            <XCircle size={20} />
          </div>

          <div>
            <span>Con error</span>
            <strong>{errorCount}</strong>
          </div>
        </div>

      </section>

      {/* FILTERS */}

      <section className="exports-filter-card">

        <div className="exports-section-title">
          <Filter size={19} />

          <div>
            <h2>Filtros de exportación</h2>
            <span>
              Encuentra rápidamente un archivo generado.
            </span>
          </div>
        </div>

        <div className="exports-filter-grid">

          <div className="exports-form-group search-field">
            <label htmlFor="exportSearch">
              Buscar
            </label>

            <div className="exports-input-icon">
              <Search size={17} />

              <input
                id="exportSearch"
                type="text"
                placeholder="Reporte, tipo o usuario..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          <div className="exports-form-group">
            <label htmlFor="formatFilter">
              Formato
            </label>

            <select
              id="formatFilter"
              value={formatFilter}
              onChange={(event) =>
                setFormatFilter(
                  event.target.value as
                    | "Todos"
                    | ExportFormat
                )
              }
            >
              <option value="Todos">Todos</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
              <option value="CSV">CSV</option>
            </select>
          </div>

          <div className="exports-form-group">
            <label htmlFor="typeFilter">
              Tipo de reporte
            </label>

            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="Todos">Todos</option>
              <option value="Eventos sísmicos">
                Eventos sísmicos
              </option>
              <option value="Magnitudes">
                Magnitudes
              </option>
              <option value="Geográfico">
                Geográfico
              </option>
              <option value="Alertas">
                Alertas
              </option>
              <option value="Sistema">
                Sistema
              </option>
            </select>
          </div>

          <div className="exports-form-group">
            <label htmlFor="exportStart">
              Desde
            </label>

            <div className="exports-input-icon">
              <CalendarDays size={16} />

              <input
                id="exportStart"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
              />
            </div>
          </div>

          <div className="exports-form-group">
            <label htmlFor="exportEnd">
              Hasta
            </label>

            <div className="exports-input-icon">
              <CalendarDays size={16} />

              <input
                id="exportEnd"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
              />
            </div>
          </div>

          <div className="exports-filter-actions">
            <button
              type="button"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          </div>

        </div>
      </section>

      {/* TABLE */}

      <section className="exports-table-card">

        <div className="exports-table-header">

          <div>
            <div className="exports-section-title compact">
              <Download size={19} />

              <div>
                <h2>Historial de exportaciones</h2>
                <span>
                  {filteredExports.length} registros
                  encontrados
                </span>
              </div>
            </div>
          </div>

          <div className="exports-record-count">
            {totalRecords.toLocaleString("es-PE")} registros
            procesados
          </div>

        </div>

        <div className="exports-table-wrapper">

          <table className="exports-table">

            <thead>
              <tr>
                <th>Reporte</th>
                <th>Tipo</th>
                <th>Formato</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Registros</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {filteredExports.map((item) => {

                const Icon = formatIcon(item.format);

                return (
                  <tr key={item.id}>

                    <td>
                      <div className="export-report-name">
                        <div className="export-file-icon">
                          <Icon size={18} />
                        </div>

                        <div>
                          <strong>
                            {item.report}
                          </strong>

                          <small>
                            Exportación #{item.id
                              .toString()
                              .padStart(4, "0")}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="export-type">
                        {item.type}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`export-format ${item.format.toLowerCase()}`}
                      >
                        {item.format}
                      </span>
                    </td>

                    <td>
                      <div className="export-date">
                        <strong>
                          {item.date}
                        </strong>

                        <small>
                          {item.time} UTC
                        </small>
                      </div>
                    </td>

                    <td>
                      {item.user}
                    </td>

                    <td>
                      {item.records.toLocaleString(
                        "es-PE"
                      )}
                    </td>

                    <td>

                      {item.status ===
                        "Completado" && (
                        <span className="export-status completed">
                          <CheckCircle2 size={14} />
                          Completado
                        </span>
                      )}

                      {item.status ===
                        "Procesando" && (
                        <span className="export-status processing">
                          <Clock3 size={14} />
                          Procesando
                        </span>
                      )}

                      {item.status ===
                        "Error" && (
                        <span className="export-status error">
                          <XCircle size={14} />
                          Error
                        </span>
                      )}

                    </td>

                    <td>

                      <div className="export-actions">

                        {item.status ===
                          "Completado" && (
                          <button
                            type="button"
                            title="Descargar"
                            onClick={() =>
                              handleDownload(item)
                            }
                          >
                            <Download size={16} />
                          </button>
                        )}

                        {item.status === "Error" && (
                          <button
                            type="button"
                            title="Reintentar"
                            onClick={() =>
                              handleRetry(item.id)
                            }
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}

                        {item.status ===
                          "Procesando" && (
                          <span className="processing-icon">
                            <RefreshCw
                              size={16}
                              className="spin"
                            />
                          </span>
                        )}

                      </div>

                    </td>

                  </tr>
                );
              })}

              {filteredExports.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="exports-empty"
                  >
                    <FileBarChart size={32} />

                    <strong>
                      No hay exportaciones
                    </strong>

                    <span>
                      No existen registros que
                      coincidan con los filtros
                      seleccionados.
                    </span>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      </section>

    </div>
  );
}
