import { useEffect, useMemo, useState } from "react";
import { getDatasetQuality, type DatasetQuality } from "../../services/api/datasets.api";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  FileSearch,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import './Dataset.css';
type DatasetStatus = "Listo" | "Revisar" | "Pendiente";

type Dataset = {
  id: string;
  name: string;
  description: string;
  source: string;
  records: number;
  missing: number;
  duplicates: number;
  invalid: number;
  updatedAt: string;
  status: DatasetStatus;
  fields: string[];
};



function getQualityPercent(dataset: Dataset) {
  if (dataset.records <= 0) return 0;

return -1;
}

function getStatusClass(status: DatasetStatus) {
  if (status === "Listo") return "quality-status-ready";
  if (status === "Revisar") return "quality-status-review";
  return "quality-status-pending";
}

function formatNumber(value: number) {
  return value.toLocaleString("es-PE");
}

export default function DatasetQualityPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [quality, setQuality] = useState<DatasetQuality | null>(null);
  const [loadingQuality, setLoadingQuality] = useState(true);
const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selected, setSelected] = useState<Dataset | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState(
    "Indicadores obtenidos desde la API real del catálogo sísmico."
  );


  useEffect(() => {
    let active = true;
    getDatasetQuality()
      .then((data) => {
        if (!active) return;
        setQuality(data);
        setDatasets([{
          id: "DS-REAL-001",
          name: "Catálogo sísmico real",
          description: "Resumen calculado a partir de los registros del catálogo sísmico.",
          source: "Catálogo sísmico IGP",
          records: data.total_records,
          missing: data.missing_optional_values,
          duplicates: data.duplicate_source_hash_groups,
          invalid: data.invalid_coordinate_records + data.negative_depth_records,
          updatedAt: new Date().toLocaleDateString("es-PE"),
          status: data.missing_optional_values || data.duplicate_source_hash_groups || data.invalid_coordinate_records || data.negative_depth_records ? "Revisar" : "Listo",
          fields: ["origin_time_utc", "latitude", "longitude", "depth_km", "magnitude"],
        }]);
        setNotice("Indicadores cargados desde la API del catálogo sísmico.");
      })
      .catch(() => {
        if (active) setNotice("No se pudieron cargar los indicadores reales. Comprueba que FastAPI está activo y vuelve a cargar la página.");
      })
      .finally(() => { if (active) setLoadingQuality(false); });
    return () => { active = false; };
  }, []);
  
  const filteredDatasets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return datasets.filter((dataset) => {
      const matchesSearch =
        dataset.name.toLowerCase().includes(query) ||
        dataset.id.toLowerCase().includes(query) ||
        dataset.source.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "Todos" || dataset.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [datasets, search, statusFilter]);

  const readyCount = datasets.filter((item) => item.status === "Listo").length;

  const reviewCount = datasets.filter(
    (item) => item.status === "Revisar"
  ).length;

  const pendingCount = datasets.filter(
    (item) => item.status === "Pendiente"
  ).length;

  const totalRecords = datasets.reduce(
    (sum, item) => sum + item.records,
    0
  );

  const totalIssues = quality
    ? quality.missing_optional_values + quality.duplicate_source_hash_groups + quality.invalid_coordinate_records + quality.negative_depth_records
    : 0;

  function validateDataset(dataset: Dataset) {
    if (validatingId) return;

    setValidatingId(dataset.id);
    setNotice(
      `Validación simulada de ${dataset.name}. No se han consultado archivos ni una base de datos.`
    );

    window.setTimeout(() => {
      const hasIssues =
        dataset.missing > 0 ||
        dataset.duplicates > 0 ||
        dataset.invalid > 0;

      const updated: Dataset = {
        ...dataset,
        status: hasIssues ? "Revisar" : "Listo",
        updatedAt: new Date().toLocaleDateString("es-PE"),
      };

      setDatasets((current) =>
        current.map((item) => (item.id === dataset.id ? updated : item))
      );

      setSelected((current) =>
        current?.id === dataset.id ? updated : current
      );

      setValidatingId(null);
      setNotice(
        hasIssues
          ? `La revisión de ejemplo de ${dataset.name} detectó incidencias pendientes.`
          : `La revisión de ejemplo de ${dataset.name} no detectó incidencias en los indicadores disponibles.`
      );
    }, 700);
  }

  function exportSummary() {
    const headers = [
      "ID",
      "Dataset",
      "Registros",
      "Faltantes",
      "Duplicados",
      "Invalidos",
      "Calidad_estimada_pct",
      "Estado",
    ];

    const rows = datasets.map((dataset) => [
      dataset.id,
      dataset.name,
      dataset.records,
      dataset.missing,
      dataset.duplicates,
      dataset.invalid,
      getQualityPercent(dataset),
      dataset.status,
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(";"))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sepms-calidad-datasets.csv";
    link.click();
    URL.revokeObjectURL(url);

    setNotice(
      "Se exportó un resumen CSV de los indicadores locales de demostración."
    );
  }

  if (loadingQuality) {
    return <section className="module-page dataset-quality-page"><p role="status">Cargando indicadores reales de calidad...</p></section>;
  }

  return (
    <section className="module-page dataset-quality-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">MACHINE LEARNING / PREPARACIÓN</span>
          <h1>Calidad de datasets</h1>
          <p>
            Inspecciona la integridad de los datos antes de preparar un
            conjunto para análisis o experimentación.
          </p>
        </div>

        <button className="secondary-button" onClick={exportSummary}>
          <Download size={17} />
          Exportar resumen CSV
        </button>
      </header>

      <div className="demo-notice quality-demo-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Calidad del catálogo sísmico</strong>
          <p>{notice}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Datasets registrados</span>
            <span className="metric-icon metric-blue">
              <Database size={20} />
            </span>
          </div>
          <strong className="metric-value">{datasets.length}</strong>
          <span className="metric-description">Catálogos consultados</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Registros del catálogo</span>
            <span className="metric-icon metric-violet">
              <FileSearch size={20} />
            </span>
          </div>
          <strong className="metric-value">{formatNumber(totalRecords)}</strong>
          <span className="metric-description">Registros reales consultados desde la API</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Listos para revisión</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <strong className="metric-value">{readyCount}</strong>
          <span className="metric-description">Sin incidencias declaradas</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Incidencias registradas</span>
            <span className="metric-icon metric-orange">
              <AlertTriangle size={20} />
            </span>
          </div>
          <strong className="metric-value">{formatNumber(totalIssues)}</strong>
          <span className="metric-description">
            Valores nulos opcionales; no equivalen a registros afectados
          </span>
        </article>
      </div>

      <div className="quality-status-summary">
        <div>
          <span className="quality-summary-dot quality-dot-ready" />
          <span>Listos</span>
          <strong>{readyCount}</strong>
        </div>
        <div>
          <span className="quality-summary-dot quality-dot-review" />
          <span>Revisar</span>
          <strong>{reviewCount}</strong>
        </div>
        <div>
          <span className="quality-summary-dot quality-dot-pending" />
          <span>Pendientes</span>
          <strong>{pendingCount}</strong>
        </div>
      </div>

      <section className="panel quality-datasets-panel">
        <div className="panel-heading quality-panel-heading">
          <div>
            <h2>Conjuntos de datos</h2>
            <p>Busca un dataset para consultar sus indicadores de calidad.</p>
          </div>
          <span className="source-total">
            {filteredDatasets.length} resultado(s)
          </span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, ID o procedencia..."
              aria-label="Buscar datasets"
            />
          </label>

          <label className="quality-filter">
            <Filter size={16} />
            <select
              className="source-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrar datasets por estado"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Listo">Listos</option>
              <option value="Revisar">Revisar</option>
              <option value="Pendiente">Pendientes</option>
            </select>
          </label>
        </div>

        <div className="quality-dataset-grid">
          {filteredDatasets.map((dataset) => {
            const quality = getQualityPercent(dataset);
            const issueCount =
              dataset.missing + dataset.duplicates + dataset.invalid;

            return (
              <article className="quality-dataset-card" key={dataset.id}>
                <div className="quality-card-top">
                  <span className="quality-dataset-icon">
                    <Database size={21} />
                  </span>
                  <span
                    className={`quality-status ${getStatusClass(dataset.status)}`}
                  >
                    {dataset.status}
                  </span>
                </div>

                <span className="quality-dataset-id">{dataset.id}</span>
                <h3>{dataset.name}</h3>
                <p className="quality-dataset-description">
                  {dataset.description}
                </p>

                <div className="quality-source-line">
                  <span>Procedencia</span>
                  <strong>{dataset.source}</strong>
                </div>

                <div className="quality-progress-heading">
                  <span>Porcentaje de integridad</span>
                  <strong>{quality < 0 ? "No calculada" : `${quality}%`}</strong>
                </div>

                <div
                  className="quality-progress-track"
                  role="progressbar"
                  aria-label={`Porcentaje de integridad de ${dataset.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.max(0, quality)}
                >
                  <span
                    className={
                      quality >= 99
                        ? "quality-progress-fill quality-fill-good"
                        : quality >= 95
                          ? "quality-progress-fill quality-fill-medium"
                          : "quality-progress-fill quality-fill-low"
                    }
                    style={{ width: `${Math.max(0, quality)}%` }}
                  />
                </div>

                <div className="quality-issue-grid">
                  <div>
                    <span>Faltantes</span>
                    <strong>{formatNumber(dataset.missing)}</strong>
                  </div>
                  <div>
                    <span>Duplicados</span>
                    <strong>{formatNumber(dataset.duplicates)}</strong>
                  </div>
                  <div>
                    <span>Inválidos</span>
                    <strong>{formatNumber(dataset.invalid)}</strong>
                  </div>
                </div>

                <div className="quality-card-footer">
                  <span>
                    {formatNumber(dataset.records)} registros · {issueCount}{" "}
                    incidencias
                  </span>
                  <button
                    className="quality-view-button"
                    onClick={() => setSelected(dataset)}
                  >
                    <Eye size={16} />
                    Revisar
                  </button>
                </div>
              </article>
            );
          })}

          {filteredDatasets.length === 0 && (
            <div className="quality-empty-state">
              <Database size={30} />
              <strong>No hay datasets coincidentes</strong>
              <span>Modifica la búsqueda o el filtro de estado.</span>
            </div>
          )}
        </div>
      </section>

      {selected && (
        <div
          className="sync-detail-backdrop"
          onClick={() => setSelected(null)}
        >
          <section
            className="sync-detail-modal quality-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quality-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="sync-detail-header">
              <div>
                <span className="eyebrow">INSPECCIÓN DEL DATASET</span>
                <h2 id="quality-detail-title">{selected.name}</h2>
                <p>
                  {selected.id} · {selected.source}
                </p>
              </div>
              <button
                className="source-action-button"
                onClick={() => setSelected(null)}
                aria-label="Cerrar detalles"
              >
                <XCircle size={18} />
              </button>
            </header>

            <div className="quality-detail-overview">
              <div>
                <span>Porcentaje de integridad</span>
                <strong>{getQualityPercent(selected) < 0 ? "No calculada" : `${getQualityPercent(selected)}%`}</strong>
              </div>
              <span
                className={`quality-status ${getStatusClass(selected.status)}`}
              >
                {selected.status}
              </span>
            </div>

            <h3 className="quality-detail-subtitle">Indicadores de calidad</h3>

            <div className="sync-detail-grid">
              <div>
                <span>Total de registros</span>
                <strong>{formatNumber(selected.records)}</strong>
              </div>
              <div>
                <span>Valores faltantes</span>
                <strong>{formatNumber(selected.missing)}</strong>
              </div>
              <div>
                <span>Duplicados</span>
                <strong>{formatNumber(selected.duplicates)}</strong>
              </div>
              <div>
                <span>Registros inválidos</span>
                <strong>{formatNumber(selected.invalid)}</strong>
              </div>
              <div>
                <span>Campos principales</span>
                <strong>{selected.fields.length}</strong>
              </div>
              <div>
                <span>Última revisión</span>
                <strong>{selected.updatedAt}</strong>
              </div>
            </div>

            <h3 className="quality-detail-subtitle">Campos declarados</h3>
            <div className="quality-field-list">
              {selected.fields.map((field) => (
                <span key={field}>{field}</span>
              ))}
            </div>

            <div className="quality-detail-warning">
              <AlertTriangle size={19} />
              <p>
                La integridad mostrada es una estimación basada en contadores
                ficticios. No se ha inspeccionado un archivo ni se han
                comprobado las coordenadas, fechas o magnitudes reales.
              </p>
            </div>

            <div className="quality-detail-actions">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Cerrar
              </button>
              <button
                className="primary-button"
                disabled={validatingId !== null}
                onClick={() => validateDataset(selected)}
              >
                {validatingId === selected.id ? (
                  <RefreshCw size={17} className="spin" />
                ) : (
                  <ClipboardCheck size={17} />
                )}
                {validatingId === selected.id
                  ? "Revisando..."
                  : "Actualizar indicadores"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}









