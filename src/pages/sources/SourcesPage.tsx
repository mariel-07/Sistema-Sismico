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
} from "lucide-react";
import {
  createSource,
  getSources,
  updateSourceStatus,
  type DataSource,
} from "../../services/api/sources.api";
import { getApiErrorMessage } from "../../services/api/client";

type SourceStatus = "Activa" | "Inactiva";

function getStatus(source: DataSource): SourceStatus {
  return source.is_active ? "Activa" : "Inactiva";
}

function formatDate(value: string | null): string {
  if (!value) return "Sin registros";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return date.toLocaleString("es-PE");
}

export default function SourcesPage() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
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
      setNotice("Fuentes cargadas desde el backend.");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      return matchesSearch &&
        (statusFilter === "Todas" || status === statusFilter);
    });
  }, [sources, search, statusFilter]);

  const activeCount = sources.filter((source) => source.is_active).length;
  const inactiveCount = sources.length - activeCount;
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
        is_active: false,
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

  return (
    <section className="module-page sources-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTEGRACIONES Y CONECTIVIDAD</span>
          <h1>Fuentes de datos</h1>
          <p>
            Administra las fuentes sísmicas registradas y consulta su estado
            real en el backend.
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowForm((current) => !current)}
        >
          {showForm ? <XCircle size={18} /> : <Plus size={18} />}
          {showForm ? "Cancelar" : "Nueva fuente"}
        </button>
      </header>

      {(notice || error) && (
        <div className={`demo-notice source-notice${error ? " source-error" : ""}`}>
          {error ? <ShieldAlert size={20} /> : <CheckCircle2 size={20} />}
          <div>
            <strong>{error ? "No se pudo completar la operación" : "Estado"}</strong>
            <p>{error || notice}</p>
          </div>
        </div>
      )}

      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes registradas</span>
            <span className="metric-icon metric-blue"><Database size={20} /></span>
          </div>
          <strong className="metric-value">{sources.length}</strong>
          <span className="metric-description">Registros obtenidos de la base de datos</span>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes activas</span>
            <span className="metric-icon metric-teal"><CheckCircle2 size={20} /></span>
          </div>
          <strong className="metric-value">{activeCount}</strong>
          <span className="metric-description">Marcadas como activas en el backend</span>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Ejecuciones registradas</span>
            <span className="metric-icon metric-violet"><Activity size={20} /></span>
          </div>
          <strong className="metric-value">{totalRuns.toLocaleString("es-PE")}</strong>
          <span className="metric-description">Historial de ejecuciones por fuente</span>
        </article>
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes inactivas</span>
            <span className="metric-icon metric-orange"><XCircle size={20} /></span>
          </div>
          <strong className="metric-value">{inactiveCount}</strong>
          <span className="metric-description">Marcadas como inactivas en el backend</span>
        </article>
      </div>

      {showForm && (
        <section className="panel source-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Registrar fuente</h2>
              <p>La fuente se guardará en la base de datos.</p>
            </div>
          </div>
          <form onSubmit={handleCreateSource} className="source-form">
            <label>
              Nombre de la fuente
              <input
                required
                minLength={3}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Ej. Catálogo sísmico regional"
              />
            </label>
            <label>
              Tipo de fuente
              <select
                value={form.source_type}
                onChange={(event) => setForm({ ...form, source_type: event.target.value })}
              >
                <option value="official">Oficial</option>
                <option value="catalog">Catálogo</option>
                <option value="api">API externa</option>
                <option value="custom">Personalizada</option>
              </select>
            </label>
            <label className="source-form-wide">
              URL del servicio (opcional)
              <input
                type="url"
                value={form.endpoint}
                onChange={(event) => setForm({ ...form, endpoint: event.target.value })}
                placeholder="https://ejemplo.org/api/eventos"
              />
            </label>
            <label>
              Organización
              <input
                value={form.organization}
                onChange={(event) => setForm({ ...form, organization: event.target.value })}
                placeholder="Organización"
              />
            </label>
            <label>
              Licencia o información de uso
              <input
                value={form.license_info}
                onChange={(event) => setForm({ ...form, license_info: event.target.value })}
                placeholder="Licencia o condiciones"
              />
            </label>
            <label className="source-form-wide">
              Descripción
              <input
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Descripción de la fuente"
              />
            </label>
            <div className="source-form-actions">
              <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="primary-button" disabled={saving}>
                <Plus size={17} />
                {saving ? "Guardando..." : "Registrar fuente"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel source-list-panel">
        <div className="panel-heading source-list-heading">
          <div>
            <h2>Catálogo de fuentes</h2>
            <p>Datos consultados directamente desde el backend.</p>
          </div>
          <span className="source-total">{filteredSources.length} resultado(s)</span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar fuente, organización o endpoint..."
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
            <option value="Activa">Activas</option>
            <option value="Inactiva">Inactivas</option>
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
                <th>Fuente</th>
                <th>Última ejecución</th>
                <th>Estado</th>
                <th>Registros recibidos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && sources.length === 0 && (
                <tr><td colSpan={5}>Cargando fuentes desde el backend...</td></tr>
              )}
              {!loading && !error && filteredSources.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="source-empty-state">
                      <Database size={28} />
                      <strong>No se encontraron fuentes</strong>
                      <span>Cambia los filtros o registra una nueva fuente.</span>
                    </div>
                  </td>
                </tr>
              )}
              {filteredSources.map((source) => (
                <tr key={source.id}>
                  <td>
                    <div className="source-name-cell">
                      <span className="source-provider-icon"><Globe2 size={19} /></span>
                      <div>
                        <strong>{source.name}</strong>
                        <span>{source.organization || source.source_type}</span>
                        <small>{source.base_url || source.description || "Sin endpoint configurado"}</small>
                      </div>
                    </div>
                  </td>
                  <td className="source-last-sync">
                    {formatDate(source.last_sync)}
                    {source.last_sync_status && <small>{` · ${source.last_sync_status}`}</small>}
                  </td>
                  <td>
                    <span className={`source-status source-status-${getStatus(source).toLowerCase()}`}>
                      <span />
                      {getStatus(source)}
                    </span>
                  </td>
                  <td className="source-event-count">
                    {source.total_runs.toLocaleString("es-PE")}
                  </td>
                  <td>
                    <div className="source-actions">
                      <button
                        className="source-action-button"
                        onClick={() => void loadSources()}
                        disabled={loading}
                        title="Actualizar datos"
                        aria-label={`Actualizar datos de ${source.name}`}
                      >
                        <RefreshCw size={16} />
                      </button>
                      <button
                        className="source-action-button"
                        onClick={() => void toggleStatus(source)}
                        disabled={busyId === source.id}
                        title={source.is_active ? "Desactivar fuente" : "Activar fuente"}
                        aria-label={`Cambiar estado de ${source.name}`}
                      >
                        {source.is_active ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="source-table-footer">
          <span><Activity size={15} /> Estado consultado desde el backend</span>
          <span>SEPMS · Integraciones</span>
        </footer>
      </section>
    </section>
  );
}


