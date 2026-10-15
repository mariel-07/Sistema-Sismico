
import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import './SourceFormPage';
type SourceStatus = "Activa" | "Inactiva" | "Error";

type DataSource = {
  id: number;
  name: string;
  provider: string;
  endpoint: string;
  frequency: string;
  status: SourceStatus;
  lastSync: string;
  eventsReceived: number;
  latency: string;
};

const initialSources: DataSource[] = [
  {
    id: 1,
    name: "Fuente sísmica principal",
    provider: "IGP",
    endpoint: "Servicio oficial por configurar",
    frequency: "Cada 5 minutos",
    status: "Activa",
    lastSync: "Datos de demostración",
    eventsReceived: 128,
    latency: "—",
  },
  {
    id: 2,
    name: "Catálogo de referencia",
    provider: "USGS",
    endpoint: "Servicio externo por configurar",
    frequency: "Cada 15 minutos",
    status: "Activa",
    lastSync: "Datos de demostración",
    eventsReceived: 96,
    latency: "—",
  },
  {
    id: 3,
    name: "Fuente secundaria",
    provider: "Personalizada",
    endpoint: "Sin endpoint configurado",
    frequency: "Cada 30 minutos",
    status: "Inactiva",
    lastSync: "Sin sincronizaciones",
    eventsReceived: 0,
    latency: "—",
  },
];

export default function SourcesPage() {
  const [sources, setSources] = useState<DataSource[]>(initialSources);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [showForm, setShowForm] = useState(false);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const [notice, setNotice] = useState(
    "Vista de demostración: las fuentes aún no están conectadas al backend."
  );

  const [form, setForm] = useState({
    name: "",
    provider: "Personalizada",
    endpoint: "",
    frequency: "Cada 15 minutos",
  });

  const filteredSources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sources.filter((source) => {
      const matchesSearch =
        source.name.toLowerCase().includes(query) ||
        source.provider.toLowerCase().includes(query) ||
        source.endpoint.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "Todas" || source.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sources, search, statusFilter]);

  const activeCount = sources.filter(
    (source) => source.status === "Activa"
  ).length;

  const errorCount = sources.filter(
    (source) => source.status === "Error"
  ).length;

  const totalEvents = sources.reduce(
    (total, source) => total + source.eventsReceived,
    0
  );

  function handleCreateSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newSource: DataSource = {
      id: Date.now(),
      name: form.name.trim(),
      provider: form.provider,
      endpoint: form.endpoint.trim(),
      frequency: form.frequency,
      status: "Inactiva",
      lastSync: "Nunca",
      eventsReceived: 0,
      latency: "—",
    };

    setSources((current) => [newSource, ...current]);
    setForm({
      name: "",
      provider: "Personalizada",
      endpoint: "",
      frequency: "Cada 15 minutos",
    });
    setShowForm(false);
    setNotice(
      "Fuente registrada localmente. Configura el backend para conectarla a un proveedor real."
    );
  }

  function handleSync(sourceId: number) {
    const source = sources.find((item) => item.id === sourceId);

    if (!source) return;

    if (!source.endpoint.trim() ||
        source.endpoint.includes("por configurar") ||
        source.endpoint.includes("Sin endpoint")) {
      setNotice(
        `No se puede conectar "${source.name}": configura un endpoint válido y la integración del backend.`
      );
      return;
    }

    setSyncingId(sourceId);
    setNotice(
      `Solicitud de prueba para "${source.name}". Esta interfaz no descarga datos sísmicos reales.`
    );

    // Simulación local para comprobar el estado visual de la interfaz.
    window.setTimeout(() => {
      setSources((current) =>
        current.map((item) =>
          item.id === sourceId
            ? {
                ...item,
                lastSync: "Prueba local completada",
                status: "Activa",
              }
            : item
        )
      );

      setSyncingId(null);
      setNotice(
        `Prueba local completada para "${source.name}". Todavía no se han importado datos reales.`
      );
    }, 900);
  }

  function toggleStatus(sourceId: number) {
    setSources((current) =>
      current.map((source) =>
        source.id === sourceId
          ? {
              ...source,
              status: source.status === "Inactiva" ? "Activa" : "Inactiva",
            }
          : source
      )
    );
  }

  return (
    <section className="module-page sources-page">
      <header className="page-heading">
        <div>
          <span className="eyebrow">INTEGRACIONES Y CONECTIVIDAD</span>
          <h1>Fuentes de datos</h1>
          <p>
            Administra proveedores, frecuencias de consulta y estado de las
            integraciones sísmicas.
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

      <div className="demo-notice source-notice">
        <ShieldAlert size={20} />
        <div>
          <strong>Modo de demostración</strong>
          <p>{notice}</p>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes registradas</span>
            <span className="metric-icon metric-blue">
              <Database size={20} />
            </span>
          </div>
          <strong className="metric-value">{sources.length}</strong>
          <span className="metric-description">Fuentes configuradas en esta vista</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes activas</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <strong className="metric-value">{activeCount}</strong>
          <span className="metric-description">Marcadas como activas localmente</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Eventos de ejemplo</span>
            <span className="metric-icon metric-violet">
              <Activity size={20} />
            </span>
          </div>
          <strong className="metric-value">{totalEvents.toLocaleString("es-PE")}</strong>
          <span className="metric-description">Conteo de demostración, no datos en vivo</span>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Fuentes con error</span>
            <span className="metric-icon metric-orange">
              <XCircle size={20} />
            </span>
          </div>
          <strong className="metric-value">{errorCount}</strong>
          <span className="metric-description">Fuentes marcadas con error</span>
        </article>
      </div>

      {showForm && (
        <section className="panel source-form-panel">
          <div className="panel-heading">
            <div>
              <h2>Registrar fuente</h2>
              <p>Los datos se guardarán temporalmente en esta pantalla.</p>
            </div>
          </div>

          <form onSubmit={handleCreateSource} className="source-form">
            <label>
              Nombre de la fuente
              <input
                required
                minLength={3}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Ej. Catálogo sísmico regional"
              />
            </label>

            <label>
              Proveedor
              <select
                value={form.provider}
                onChange={(event) =>
                  setForm({ ...form, provider: event.target.value })
                }
              >
                <option value="IGP">IGP</option>
                <option value="USGS">USGS</option>
                <option value="EMSC">EMSC</option>
                <option value="Personalizada">Personalizada</option>
              </select>
            </label>

            <label className="source-form-wide">
              URL del servicio o endpoint
              <input
                required
                type="url"
                value={form.endpoint}
                onChange={(event) =>
                  setForm({ ...form, endpoint: event.target.value })
                }
                placeholder="https://ejemplo.org/api/eventos"
              />
            </label>

            <label>
              Frecuencia de consulta
              <select
                value={form.frequency}
                onChange={(event) =>
                  setForm({ ...form, frequency: event.target.value })
                }
              >
                <option>Cada 5 minutos</option>
                <option>Cada 15 minutos</option>
                <option>Cada 30 minutos</option>
                <option>Cada 1 hora</option>
                <option>Manual</option>
              </select>
            </label>

            <div className="source-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="primary-button">
                <Plus size={17} />
                Registrar fuente
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel source-list-panel">
        <div className="panel-heading source-list-heading">
          <div>
            <h2>Catálogo de fuentes</h2>
            <p>Consulta el estado y la configuración de cada proveedor.</p>
          </div>
          <span className="source-total">
            {filteredSources.length} resultado(s)
          </span>
        </div>

        <div className="source-toolbar">
          <label className="source-search">
            <Search size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar fuente, proveedor o endpoint..."
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
            <option value="Error">Con error</option>
          </select>
        </div>

        <div className="source-table-wrapper">
          <table className="source-table">
            <thead>
              <tr>
                <th>Fuente</th>
                <th>Frecuencia</th>
                <th>Estado</th>
                <th>Última sincronización</th>
                <th>Eventos de ejemplo</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredSources.map((source) => (
                <tr key={source.id}>
                  <td>
                    <div className="source-name-cell">
                      <span className="source-provider-icon">
                        <Globe2 size={19} />
                      </span>
                      <div>
                        <strong>{source.name}</strong>
                        <span>{source.provider}</span>
                        <small>{source.endpoint}</small>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="source-frequency">
                      <Clock3 size={15} />
                      {source.frequency}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`source-status source-status-${source.status.toLowerCase()}`}
                    >
                      <span />
                      {source.status}
                    </span>
                  </td>

                  <td className="source-last-sync">{source.lastSync}</td>

                  <td className="source-event-count">
                    {source.eventsReceived.toLocaleString("es-PE")}
                  </td>

                  <td>
                    <div className="source-actions">
                      <button
                        className="source-action-button"
                        onClick={() => handleSync(source.id)}
                        disabled={syncingId === source.id}
                        title="Probar sincronización"
                        aria-label={`Probar sincronización de ${source.name}`}
                      >
                        <RefreshCw
                          size={16}
                          className={syncingId === source.id ? "spin" : ""}
                        />
                      </button>
                      <button
                        className="source-action-button"
                        onClick={() => toggleStatus(source.id)}
                        title={
                          source.status === "Inactiva"
                            ? "Activar fuente"
                            : "Desactivar fuente"
                        }
                        aria-label={`Cambiar estado de ${source.name}`}
                      >
                        {source.status === "Inactiva" ? (
                          <CheckCircle2 size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSources.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="source-empty-state">
                      <Database size={28} />
                      <strong>No se encontraron fuentes</strong>
                      <span>
                        Cambia los filtros o registra una nueva fuente.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="source-table-footer">
          <span>
            <Activity size={15} />
            Estado actualizado en la interfaz local
          </span>
          <span>SEPMS · Integraciones</span>
        </footer>
      </section>
    </section>
  );
}
