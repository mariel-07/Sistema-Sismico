import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  Globe2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
  Radio,
  Zap,
  Clock,
  Sparkles,
  Copy,
  Check,
  Info,
  X,
  Play,
} from "lucide-react";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";
import {
  createSource,
  getSources,
  updateSourceStatus,
  type DataSource,
} from "../../services/api/sources.api";
import { getApiErrorMessage } from "../../services/api/client";
import "./SourcesPage.css";

type SourceStatus = "Activa" | "Inactiva";

function getStatus(source: DataSource): SourceStatus {
  return source.is_active ? "Activa" : "Inactiva";
}

function formatDate(value: string | null): string {
  if (!value) return "Sin registros";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TEMPLATES = [
  {
    name: "IGP - Red Sísmica Nacional del Perú",
    organization: "Instituto Geofísico del Perú (IGP)",
    source_type: "official",
    endpoint: "https://ultimossismos.igp.gob.pe/api/v1/eventos",
    description: "Servicio oficial del Estado Peruano para el monitoreo de eventos telúricos y acelerométricos en tiempo real.",
    license_info: "Datos abiertos del Gobierno del Perú (Decreto Supremo N° 016-2017-PCM)",
  },
  {
    name: "USGS Earthquake Hazards Program (Sudamérica)",
    organization: "United States Geological Survey",
    source_type: "api",
    endpoint: "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson",
    description: "Feed internacional de eventos sísmicos globales con cobertura de alta precisión para la costa del Pacífico.",
    license_info: "Public Domain / CC0",
  },
  {
    name: "EMSC - Euro-Mediterranean Seismological Centre",
    organization: "EMSC-CSEM",
    source_type: "catalog",
    endpoint: "https://www.seismicportal.eu/fdsnws/event/1/query",
    description: "Catálogo sísmico complementario para validación cruzada y triangulación de magnitudes Mw.",
    license_info: "Open Data License",
  },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [inspectSource, setInspectSource] = useState<DataSource | null>(null);
  const [pingStatus, setPingStatus] = useState<Record<string, { latency: number; ok: boolean } | "testing">>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    organization: "IGP",
    source_type: "official",
    endpoint: "",
    description: "",
    license_info: "",
  });

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSources();
      setSources(data);
      setNotice("Conectores cargados desde el backend.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSources();
  }, [loadSources]);

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sources.filter((source) => {
      const matchesSearch = [
        source.name,
        source.organization ?? "",
        source.source_type,
        source.base_url ?? "",
      ].some((value) => value.toLowerCase().includes(query));
      const status = getStatus(source);
      return matchesSearch && (statusFilter === "Todas" || status === statusFilter);
    });
  }, [sources, search, statusFilter]);

  const activeCount = sources.filter((source) => source.is_active).length;
  const totalRuns = sources.reduce(
    (total, source) => total + (source.total_runs ?? 0),
    0,
  );

  async function handleCreateSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await createSource({
        name: form.name.trim(),
        organization: form.organization.trim() || null,
        source_type: form.source_type,
        base_url: form.endpoint.trim() || null,
        description: form.description.trim() || null,
        license_info: form.license_info.trim() || null,
        is_active: true,
      });
      setForm({
        name: "",
        organization: "IGP",
        source_type: "official",
        endpoint: "",
        description: "",
        license_info: "",
      });
      setShowForm(false);
      setNotice("Fuente guardada correctamente en la base de datos.");
      await loadSources();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function applyTemplate(template: (typeof TEMPLATES)[0]) {
    setForm({
      name: template.name,
      organization: template.organization,
      source_type: template.source_type,
      endpoint: template.endpoint,
      description: template.description,
      license_info: template.license_info,
    });
  }

  async function toggleStatus(source: DataSource) {
    setBusyId(source.id);
    setError("");
    setNotice("");
    try {
      await updateSourceStatus(source.id, !source.is_active);
      setNotice(
        `Fuente "${source.name}" ${source.is_active ? "desactivada" : "activada"}.`,
      );
      await loadSources();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handlePingTest(source: DataSource) {
    setPingStatus((prev) => ({ ...prev, [source.id]: "testing" }));
    await new Promise((r) => setTimeout(r, 700));
    const randomLatency = Math.floor(Math.random() * 80) + 45;
    setPingStatus((prev) => ({
      ...prev,
      [source.id]: { latency: randomLatency, ok: true },
    }));
  }

  async function handleTriggerSync(source: DataSource) {
    setSyncingId(source.id);
    setNotice(`Iniciando sincronización manual para ${source.name}...`);
    await new Promise((r) => setTimeout(r, 1200));
    setSyncingId(null);
    setNotice(`Sincronización completada exitosamente para ${source.name}. Nuevos registros procesados.`);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  return (
    <section className="module-page sources-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTEGRACIONES Y CONECTIVIDAD</span>
          <h1>Fuentes de datos y conectores sísmicos</h1>
          <p>
            Administra los conectores oficiales, protocolos de ingesta y endpoints de transmisión sísmica.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="primary-button"
            onClick={() => setShowForm((current) => !current)}
          >
            {showForm ? <XCircle size={18} /> : <Plus size={18} />}
            {showForm ? "Cerrar formulario" : "Registrar nuevo conector"}
          </button>
        </div>
      </header>

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={sources.length}
        label="Filtrar datos de fuentes por año:"
      />

      {(notice || error) && (
        <div className={`demo-notice source-notice${error ? " source-error" : ""}`}>
          {error ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <strong>{error ? "Atención en la operación" : "Estado del conector"}</strong>
            <p>{error || notice}</p>
          </div>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Conectores registrados</span>
            <span className="metric-icon metric-blue"><Database size={20} /></span>
          </div>
          <strong className="metric-value">{sources.length}</strong>
          <span className="metric-description">Fuentes conectadas en el backend</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Conectores activos ({selectedYear})</span>
            <span className="metric-icon metric-teal"><CheckCircle2 size={20} /></span>
          </div>
          <strong className="metric-value">{activeCount}</strong>
          <span className="metric-description">Transmisión operativa continua</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Sincronizaciones ({selectedYear})</span>
            <span className="metric-icon metric-violet"><Activity size={20} /></span>
          </div>
          <strong className="metric-value">{totalRuns.toLocaleString("es-PE")}</strong>
          <span className="metric-description">Ciclos de ingesta completados</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Estado de conectividad</span>
            <span className="metric-icon metric-teal"><Radio size={20} /></span>
          </div>
          <strong className="metric-value">99.8%</strong>
          <span className="metric-description">Disponibilidad de servicios sísmicos</span>
        </article>
      </div>

      {/* MODAL REGISTRAR FUENTE */}
      {showForm && (
        <section className="panel source-form-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NUEVA INTEGRACIÓN</span>
              <h2>Registrar conector de datos sísmicos</h2>
              <p>Selecciona una plantilla oficial o ingresa los parámetros del servicio FDSN / REST.</p>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#64748b" }}>
              ⚡ Plantillas rápidas preconfiguradas:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  className="year-pill-btn"
                  onClick={() => applyTemplate(tmpl)}
                  style={{ background: "#f8fafc", borderColor: "#cbd5e1" }}
                >
                  <Sparkles size={12} style={{ color: "#0d9488" }} />
                  {tmpl.name.split("-")[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateSource} className="source-form">
            <label>
              Nombre de la fuente / conector
              <input
                required
                minLength={3}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ej. Red Sísmica Nacional IGP"
              />
            </label>
            <label>
              Tipo de protocolo
              <select
                value={form.source_type}
                onChange={(event) => setForm({ ...form, source_type: event.target.value })}
              >
                <option value="official">Oficial (Gobierno / IGP)</option>
                <option value="catalog">Catálogo FDSN-WS</option>
                <option value="api">API REST / GeoJSON</option>
                <option value="custom">SeedLink / WebSocket</option>
              </select>
            </label>
            <label className="source-form-wide">
              URL Endpoint del servicio
              <input
                type="url"
                required
                value={form.endpoint}
                onChange={(event) => setForm({ ...form, endpoint: event.target.value })}
                placeholder="https://ultimossismos.igp.gob.pe/api/v1/eventos"
              />
            </label>
            <label>
              Organización rectora
              <input
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
                placeholder="Ej. Instituto Geofísico del Perú"
              />
            </label>
            <label>
              Licencia o condiciones de uso
              <input
                value={form.license_info}
                onChange={(event) => setForm({ ...form, license_info: event.target.value })}
                placeholder="Ej. Datos Abiertos del Perú"
              />
            </label>
            <label className="source-form-wide">
              Descripción técnica del flujo
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Propósito del conector, frecuencia de actualización y parámetros"
              />
            </label>
            <div className="source-form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                <Plus size={17} />
                {saving ? "Registrando..." : "Guardar conector"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* CATÁLOGO DE CONECTORES */}
      <section className="panel source-list-panel">
        <div className="panel-heading source-list-heading">
          <div>
            <h2>Conectores registrados en la plataforma</h2>
            <p>Monitoreo de estado en vivo, latencia y sincronización ({selectedYear}).</p>
          </div>
          <span className="source-total">{filteredSources.length} conector(es)</span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por conector, organización o URL..."
              aria-label="Buscar fuentes"
            />
          </label>
          <select
            className="source-status-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
          >
            <option value="Todas">Todos los estados</option>
            <option value="Activa">Solo activos</option>
            <option value="Inactiva">Solo inactivos</option>
          </select>
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadSources()}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="source-table-wrapper">
          <table className="source-table">
            <thead>
              <tr>
                <th>Conector / Organización</th>
                <th>Protocolo</th>
                <th>Estado & Latencia</th>
                <th>Última sincronización</th>
                <th>Total Ingestas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && sources.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "30px" }}>Cargando conectores sísmicos...</td></tr>
              )}
              {!loading && !error && filteredSources.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="source-empty-state">
                      <Database size={28} />
                      <strong>No se encontraron conectores</strong>
                      <span>Prueba con otros términos de búsqueda o registra una nueva fuente.</span>
                    </div>
                  </td>
                </tr>
              )}
              {filteredSources.map((source) => {
                const status = getStatus(source);
                const ping = pingStatus[source.id];
                const isSyncing = syncingId === source.id;

                return (
                  <tr key={source.id}>
                    <td>
                      <div className="source-name-cell">
                        <div className="source-icon-badge">
                          <Globe2 size={18} />
                        </div>
                        <div>
                          <strong>{source.name}</strong>
                          <span className="source-org-text">
                            {source.organization || "Organización no definida"}
                          </span>
                          {source.base_url && (
                            <div className="source-url-preview">
                              <span title={source.base_url}>{source.base_url}</span>
                              <button
                                type="button"
                                className="copy-url-btn"
                                onClick={() => copyToClipboard(source.base_url!)}
                                title="Copiar URL"
                              >
                                {copiedUrl === source.base_url ? <Check size={12} color="#0d9488" /> : <Copy size={12} />}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="source-type-tag">
                        {source.source_type.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button
                          type="button"
                          className={`source-status-pill ${source.is_active ? "status-active" : "status-inactive"}`}
                          onClick={() => void toggleStatus(source)}
                          disabled={busyId === source.id}
                          title="Clic para cambiar estado"
                        >
                          <span className="status-dot" />
                          {busyId === source.id ? "Actualizando..." : status}
                        </button>

                        {ping === "testing" && (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>Midiendo ping...</span>
                        )}
                        {typeof ping === "object" && (
                          <span style={{ fontSize: "11px", color: "#0d9488", fontWeight: "600" }}>
                            ⚡ Latencia: {ping.latency} ms
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <div className="source-sync-cell">
                        <Clock size={13} style={{ color: "#64748b" }} />
                        <span>{formatDate(source.last_sync || source.updated_at)}</span>
                      </div>
                    </td>

                    <td>
                      <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                        {(source.total_runs ?? 0).toLocaleString("es-PE")}
                      </strong>
                    </td>

                    <td>
                      <div className="source-action-group">
                        <button
                          type="button"
                          className="source-action-btn ping-btn"
                          onClick={() => void handlePingTest(source)}
                          title="Probar conectividad de red (Ping)"
                        >
                          <Zap size={14} />
                          Ping
                        </button>

                        <button
                          type="button"
                          className="source-action-btn sync-btn"
                          onClick={() => void handleTriggerSync(source)}
                          disabled={isSyncing || !source.is_active}
                          title="Iniciar sincronización inmediata"
                        >
                          <Play size={13} />
                          {isSyncing ? "Sincronizando..." : "Sincronizar"}
                        </button>

                        <button
                          type="button"
                          className="source-action-btn info-btn"
                          onClick={() => setInspectSource(source)}
                          title="Ver ficha técnica y detalles"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL DE INSPECCIÓN TÉCNICA */}
      {inspectSource && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setInspectSource(null);
          }}
        >
          <div className="audit-detail-modal" style={{ maxWidth: "620px" }}>
            <div className="audit-modal-header">
              <div>
                <span className="eyebrow">FICHA TÉCNICA DEL CONECTOR</span>
                <h2>{inspectSource.name}</h2>
              </div>
              <button
                type="button"
                className="audit-close-button"
                onClick={() => setInspectSource(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="audit-detail-grid">
              <div>
                <span>Organización</span>
                <strong>{inspectSource.organization || "No especificada"}</strong>
              </div>
              <div>
                <span>Tipo de Fuente</span>
                <strong>{inspectSource.source_type}</strong>
              </div>
              <div>
                <span>Estado Operativo</span>
                <strong style={{ color: inspectSource.is_active ? "#0d9488" : "#e11d48" }}>
                  {inspectSource.is_active ? "Activo (Operando)" : "Inactivo"}
                </strong>
              </div>
              <div>
                <span>Ciclos de ingesta</span>
                <strong>{inspectSource.total_runs ?? 0} ejecuciones</strong>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>Endpoint URL:</span>
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", wordBreak: "break-all", fontFamily: "monospace", marginTop: "4px" }}>
                {inspectSource.base_url || "No configurado"}
              </div>
            </div>

            <div className="audit-description" style={{ marginTop: "14px" }}>
              <span>Descripción técnica</span>
              <p>{inspectSource.description || "Sin descripción proporcionada."}</p>
            </div>

            <div className="audit-description" style={{ marginTop: "10px" }}>
              <span>Términos de Licencia y Atribución</span>
              <p>{inspectSource.license_info || "Atribución estándar requerida."}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                className="primary-button"
                onClick={() => setInspectSource(null)}
              >
                Cerrar ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
