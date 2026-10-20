
import { useMemo, useState } from "react";
import {
  Activity,
  Download,
  Search,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Users,
  Clock3,
  Filter,
  RefreshCw,
  MapPin,
  MapPinned,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import './auditorio.css';
type AuditResult = "Correcto" | "Rechazado" | "Error";

interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  resource: string;
  result: AuditResult;
  ip: string;
  description: string;
}

interface ConnectionLocation {
  id: number;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  connections: number;
  lastSeen: string;
  ip: string;
  user: string;
}

// DATOS FICTICIOS PARA LA INTERFAZ.
// Reemplazar por registros obtenidos desde la API de auditoría.
const demoRecords: AuditRecord[] = [
  {
    id: "AUD-0008",
    timestamp: "2026-10-15T14:35:00",
    actor: "admin.demo",
    role: "Administrador",
    action: "Inicio de sesión",
    module: "Autenticación",
    resource: "Sesión",
    result: "Correcto",
    ip: "192.0.2.10",
    description: "Inicio de sesión de demostración.",
  },
  {
    id: "AUD-0007",
    timestamp: "2026-10-15T13:50:00",
    actor: "analista.demo",
    role: "Analista ML",
    action: "Consulta",
    module: "Modelos ML",
    resource: "Modelo sísmico de prueba",
    result: "Correcto",
    ip: "192.0.2.11",
    description: "Consulta de información de un modelo ficticio.",
  },
  {
    id: "AUD-0006",
    timestamp: "2026-10-15T12:20:00",
    actor: "operador.demo",
    role: "Operador de alertas",
    action: "Actualización",
    module: "Alertas",
    resource: "Regla de demostración",
    result: "Correcto",
    ip: "192.0.2.12",
    description: "Actualización de una regla ficticia de alertas.",
  },
  {
    id: "AUD-0005",
    timestamp: "2026-10-15T11:40:00",
    actor: "usuario.demo",
    role: "Solo lectura",
    action: "Acceso denegado",
    module: "Usuarios",
    resource: "Administración de usuarios",
    result: "Rechazado",
    ip: "192.0.2.13",
    description: "Acceso de demostración denegado por permisos insuficientes.",
  },
  {
    id: "AUD-0004",
    timestamp: "2026-10-15T10:15:00",
    actor: "analista.demo",
    role: "Analista ML",
    action: "Creación",
    module: "Experimentos",
    resource: "EXP-DEMO-004",
    result: "Correcto",
    ip: "192.0.2.11",
    description: "Creación local de un experimento ficticio.",
  },
  {
    id: "AUD-0003",
    timestamp: "2026-10-14T17:30:00",
    actor: "admin.demo",
    role: "Administrador",
    action: "Actualización",
    module: "Roles",
    resource: "Analista ML",
    result: "Correcto",
    ip: "192.0.2.10",
    description: "Modificación de permisos en datos de demostración.",
  },
  {
    id: "AUD-0002",
    timestamp: "2026-10-14T15:05:00",
    actor: "operador.demo",
    role: "Operador de alertas",
    action: "Consulta",
    module: "Eventos sísmicos",
    resource: "EVT-DEMO-002",
    result: "Error",
    ip: "192.0.2.12",
    description: "Ejemplo de una consulta que terminó con error.",
  },
  {
    id: "AUD-0001",
    timestamp: "2026-10-14T09:00:00",
    actor: "admin.demo",
    role: "Administrador",
    action: "Inicio de sesión",
    module: "Autenticación",
    resource: "Sesión",
    result: "Correcto",
    ip: "192.0.2.10",
    description: "Inicio de sesión de demostración.",
  },
];

// Ubicaciones de ejemplo en diferentes regiones del Perú.
// Las coordenadas no representan usuarios reales.
const demoConnections: ConnectionLocation[] = [
  {
    id: 1,
    region: "Lima",
    city: "Lima",
    latitude: -12.0464,
    longitude: -77.0428,
    connections: 12,
    lastSeen: "15/10/2026, 14:35",
    ip: "192.0.2.10",
    user: "admin.demo",
  },
  {
    id: 2,
    region: "Arequipa",
    city: "Arequipa",
    latitude: -16.409,
    longitude: -71.5375,
    connections: 5,
    lastSeen: "15/10/2026, 13:50",
    ip: "192.0.2.11",
    user: "analista.demo",
  },
  {
    id: 3,
    region: "Cusco",
    city: "Cusco",
    latitude: -13.5319,
    longitude: -71.9675,
    connections: 3,
    lastSeen: "15/10/2026, 12:20",
    ip: "192.0.2.12",
    user: "operador.demo",
  },
  {
    id: 4,
    region: "Piura",
    city: "Piura",
    latitude: -5.1945,
    longitude: -80.6328,
    connections: 2,
    lastSeen: "15/10/2026, 11:40",
    ip: "192.0.2.13",
    user: "usuario.demo",
  },
  {
    id: 5,
    region: "Loreto",
    city: "Iquitos",
    latitude: -3.7491,
    longitude: -73.2538,
    connections: 1,
    lastSeen: "15/10/2026, 10:15",
    ip: "192.0.2.14",
    user: "invitado.demo",
  },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function getResultClass(result: AuditResult) {
  switch (result) {
    case "Correcto":
      return "audit-result-correcto";
    case "Rechazado":
      return "audit-result-rechazado";
    case "Error":
      return "audit-result-error";
    default:
      return "";
  }
}

export default function AuditLogsPage() {
  const [records, setRecords] = useState<AuditRecord[]>(demoRecords);
  const [connections, setConnections] =
    useState<ConnectionLocation[]>(demoConnections);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("Todos");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [regionFilter, setRegionFilter] = useState("Todas");
  const [selectedRecord, setSelectedRecord] =
    useState<AuditRecord | null>(null);
  const [selectedConnection, setSelectedConnection] =
    useState<ConnectionLocation | null>(null);

  const modules = useMemo(
    () => [...new Set(records.map((record) => record.module))].sort(),
    [records],
  );

  const regions = useMemo(
    () => [...new Set(connections.map((item) => item.region))].sort(),
    [connections],
  );

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records
      .filter((record) => {
        const searchable = [
          record.id,
          record.actor,
          record.role,
          record.action,
          record.module,
          record.resource,
          record.description,
          record.ip,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch = !term || searchable.includes(term);
        const matchesResult =
          resultFilter === "Todos" || record.result === resultFilter;
        const matchesModule =
          moduleFilter === "Todos" || record.module === moduleFilter;

        return matchesSearch && matchesResult && matchesModule;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() -
          new Date(a.timestamp).getTime(),
      );
  }, [records, search, resultFilter, moduleFilter]);

  const filteredConnections = useMemo(() => {
    const term = search.trim().toLowerCase();

    return connections.filter((connection) => {
      const matchesRegion =
        regionFilter === "Todas" || connection.region === regionFilter;

      const matchesSearch =
        !term ||
        [
          connection.region,
          connection.city,
          connection.user,
          connection.ip,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesRegion && matchesSearch;
    });
  }, [connections, regionFilter, search]);

  const successfulCount = records.filter(
    (record) => record.result === "Correcto",
  ).length;

  const rejectedCount = records.filter(
    (record) => record.result === "Rechazado",
  ).length;

  const errorCount = records.filter(
    (record) => record.result === "Error",
  ).length;

  const uniqueActors = new Set(records.map((record) => record.actor)).size;

  const totalConnections = connections.reduce(
    (total, location) => total + location.connections,
    0,
  );

  const exportCsv = () => {
    const headers = [
      "ID",
      "Fecha y hora",
      "Usuario",
      "Rol",
      "Accion",
      "Modulo",
      "Recurso",
      "Resultado",
      "IP de ejemplo",
      "Descripcion",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      formatDate(record.timestamp),
      record.actor,
      record.role,
      record.action,
      record.module,
      record.resource,
      record.result,
      record.ip,
      record.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((value) => escapeCsv(String(value))).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "sepms-auditoria-demo.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setResultFilter("Todos");
    setModuleFilter("Todos");
    setRegionFilter("Todas");
  };

  const refreshDemo = () => {
    setRecords([...demoRecords]);
    setConnections([...demoConnections]);
    resetFilters();
    setSelectedRecord(null);
    setSelectedConnection(null);
  };

  return (
    <main className="module-page audit-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEGURIDAD Y TRAZABILIDAD</span>
          <h1>Registro de auditoría</h1>
          <p>
            Consulta la actividad del sistema y la distribución geográfica
            aproximada de las conexiones.
          </p>
        </div>

        <div className="audit-heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={refreshDemo}
          >
            <RefreshCw size={16} />
            Restaurar demo
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={exportCsv}
            disabled={filteredRecords.length === 0}
          >
            <Download size={17} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="audit-demo-notice">
        <Activity size={18} />
        <div>
          <strong>Modo de demostración</strong>
          <span>
            Los registros, las IP y las ubicaciones del mapa son ficticios.
            Todavía no representan conexiones reales a SEPMS.
          </span>
        </div>
      </div>

      {/* MAPA DE CONEXIONES */}
      <section className="panel audit-map-panel">
        <div className="panel-heading audit-map-heading">
          <div>
            <span className="eyebrow">DISTRIBUCIÓN GEOGRÁFICA</span>
            <h2>Conexiones por región del Perú</h2>
            <p>
              Selecciona un marcador para consultar los detalles de ejemplo.
            </p>
          </div>

          <div className="audit-map-total">
            <span>Conexiones de demostración</span>
            <strong>{totalConnections}</strong>
          </div>
        </div>

        <div className="audit-map-filters">
          <label>
            <MapPin size={16} />
            <span>Región:</span>
            <select
              value={regionFilter}
              onChange={(event) => {
                setRegionFilter(event.target.value);
                setSelectedConnection(null);
              }}
              aria-label="Filtrar mapa por región"
            >
              <option value="Todas">Todo el Perú</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <span className="audit-map-legend">
            <span />
            Ubicación aproximada de ejemplo
          </span>
        </div>

        <div className="audit-map-layout">
          <div className="audit-peru-map">
            <MapContainer
              center={[-9.19, -75.015]}
              zoom={5}
              minZoom={4}
              maxZoom={12}
              scrollWheelZoom={false}
              className="audit-leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredConnections.map((location) => (
                <CircleMarker
                  key={location.id}
                  center={[location.latitude, location.longitude]}
                  radius={7 + Math.min(location.connections, 10)}
                  pathOptions={{
                    color: "#0f766e",
                    fillColor: "#2dd4bf",
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedConnection(location),
                  }}
                >
                  <Popup>
                    <div className="audit-map-popup">
                      <strong>
                        {location.city}, {location.region}
                      </strong>
                      <p>
                        Conexiones de ejemplo: {location.connections}
                      </p>
                      <p>Usuario de ejemplo: {location.user}</p>
                      <p>IP de ejemplo: {location.ip}</p>
                      <p>Última actividad: {location.lastSeen}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>

          <aside className="audit-region-list">
            <h3>
              <MapPinned size={17} />
              Actividad por región
            </h3>

            {filteredConnections
              .slice()
              .sort((a, b) => b.connections - a.connections)
              .map((location) => (
                <button
                  type="button"
                  className={`audit-region-item ${
                    selectedConnection?.id === location.id
                      ? "audit-region-item-active"
                      : ""
                  }`}
                  key={location.id}
                  onClick={() => setSelectedConnection(location)}
                >
                  <span className="audit-region-info">
                    <span className="audit-region-dot" />
                    <span>
                      <strong>{location.region}</strong>
                      <small>{location.city}</small>
                    </span>
                  </span>

                  <span className="audit-region-count">
                    {location.connections}
                  </span>
                </button>
              ))}

            {filteredConnections.length === 0 && (
              <p className="audit-region-empty">
                No hay ubicaciones para el filtro seleccionado.
              </p>
            )}

            <p className="audit-region-disclaimer">
              La ubicación por IP es aproximada. Puede corresponder al
              proveedor de internet o a una VPN, no necesariamente a la
              ubicación física del usuario.
            </p>
          </aside>
        </div>

        {selectedConnection && (
          <div className="audit-connection-detail">
            <div className="audit-connection-detail-icon">
              <MapPin size={20} />
            </div>
            <div className="audit-connection-detail-content">
              <strong>
                {selectedConnection.city}, {selectedConnection.region}
              </strong>
              <span>
                Usuario: {selectedConnection.user} · IP de ejemplo:{" "}
                {selectedConnection.ip}
              </span>
              <span>
                Conexiones de ejemplo: {selectedConnection.connections} ·
                Última actividad: {selectedConnection.lastSeen}
              </span>
            </div>
            <button
              type="button"
              className="audit-close-button"
              onClick={() => setSelectedConnection(null)}
              aria-label="Cerrar detalle de conexión"
            >
              <X size={18} />
            </button>
          </div>
        )}
      </section>

      {/* MÉTRICAS DE AUDITORÍA */}
      <section className="metrics-grid audit-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Registros totales</span>
            <span className="metric-icon metric-blue">
              <Activity size={20} />
            </span>
          </div>
          <div className="metric-value">{records.length}</div>
          <p className="metric-description">Eventos de demostración</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Correctos</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>
          <div className="metric-value">{successfulCount}</div>
          <p className="metric-description">Operaciones completadas</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Rechazados / errores</span>
            <span className="metric-icon metric-orange">
              <XCircle size={20} />
            </span>
          </div>
          <div className="metric-value">{rejectedCount + errorCount}</div>
          <p className="metric-description">
            {rejectedCount} rechazados · {errorCount} errores
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Usuarios de ejemplo</span>
            <span className="metric-icon metric-violet">
              <Users size={20} />
            </span>
          </div>
          <div className="metric-value">{uniqueActors}</div>
          <p className="metric-description">Actores ficticios</p>
        </article>
      </section>

      {/* TABLA DE AUDITORÍA */}
      <section className="panel audit-table-panel">
        <div className="panel-heading audit-panel-heading">
          <div>
            <h2>Actividad del sistema</h2>
            <p>
              Mostrando {filteredRecords.length} de {records.length} registros
            </p>
          </div>
          <ShieldCheck size={22} />
        </div>

        <div className="audit-filters">
          <label className="audit-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar usuario, acción, recurso..."
              aria-label="Buscar registros de auditoría"
            />
          </label>

          <label className="audit-filter-select">
            <Filter size={16} />
            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              aria-label="Filtrar por módulo"
            >
              <option value="Todos">Todos los módulos</option>
              {modules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </label>

          <select
            className="audit-result-select"
            value={resultFilter}
            onChange={(event) => setResultFilter(event.target.value)}
            aria-label="Filtrar por resultado"
          >
            <option value="Todos">Todos los resultados</option>
            <option value="Correcto">Correcto</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Error">Error</option>
          </select>

          <button
            type="button"
            className="secondary-button audit-reset-button"
            onClick={resetFilters}
          >
            Limpiar
          </button>
        </div>

        <div className="audit-table-scroll">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Usuario</th>
                <th>Acción / módulo</th>
                <th>Fecha y hora</th>
                <th>Resultado</th>
                <th>Detalle</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <span className="audit-id">{record.id}</span>
                    <small>{record.resource}</small>
                  </td>

                  <td>
                    <strong className="audit-actor">{record.actor}</strong>
                    <small>{record.role}</small>
                  </td>

                  <td>
                    <strong>{record.action}</strong>
                    <small>{record.module}</small>
                  </td>

                  <td>
                    <span className="audit-date">
                      <Clock3 size={14} />
                      {formatDate(record.timestamp)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`audit-result ${getResultClass(record.result)}`}
                    >
                      {record.result === "Correcto" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {record.result}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="audit-view-button"
                      onClick={() => setSelectedRecord(record)}
                      aria-label={`Ver detalle de ${record.id}`}
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="audit-empty">
                      <Search size={28} />
                      <strong>No se encontraron registros</strong>
                      <span>
                        Cambia los filtros o prueba con otro término.
                      </span>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={resetFilters}
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-table-footer">
          <span>
            <ShieldCheck size={15} />
            Vista de auditoría · Datos locales de ejemplo
          </span>
          <span>{filteredRecords.length} resultados</span>
        </div>
      </section>

      {/* MODAL DE DETALLE */}
      {selectedRecord && (
        <div
          className="audit-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <section
            className="audit-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
          >
            <div className="audit-modal-header">
              <div>
                <span className="eyebrow">DETALLE DEL EVENTO</span>
                <h2 id="audit-detail-title">{selectedRecord.id}</h2>
              </div>
              <button
                type="button"
                className="audit-close-button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Cerrar detalle"
              >
                <X size={20} />
              </button>
            </div>

            <div className="audit-modal-status">
              <span
                className={`audit-result ${getResultClass(selectedRecord.result)}`}
              >
                {selectedRecord.result}
              </span>
              <span>{formatDate(selectedRecord.timestamp)}</span>
            </div>

            <div className="audit-detail-grid">
              <div>
                <span>Usuario</span>
                <strong>{selectedRecord.actor}</strong>
              </div>
              <div>
                <span>Rol</span>
                <strong>{selectedRecord.role}</strong>
              </div>
              <div>
                <span>Acción</span>
                <strong>{selectedRecord.action}</strong>
              </div>
              <div>
                <span>Módulo</span>
                <strong>{selectedRecord.module}</strong>
              </div>
              <div>
                <span>Recurso</span>
                <strong>{selectedRecord.resource}</strong>
              </div>
              <div>
                <span>IP de ejemplo</span>
                <strong>{selectedRecord.ip}</strong>
              </div>
            </div>

            <div className="audit-description">
              <span>Descripción</span>
              <p>{selectedRecord.description}</p>
            </div>

            <p className="audit-modal-note">
              Este detalle pertenece a los datos ficticios del frontend.
              La auditoría real deberá ser registrada y validada por el backend.
            </p>

            <button
              type="button"
              className="primary-button audit-modal-done"
              onClick={() => setSelectedRecord(null)}
            >
              Cerrar detalle
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
