import { useEffect, useMemo, useState } from "react";
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
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./auditorio.css";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";
import {
  listAuditLogs,
  type AuditLog,
} from "../../services/api/auditLogs.api";
import { getApiErrorMessage } from "../../services/api/client";
import { getStoredLoginLocations, PERU_DEPARTMENTS_COORDS } from "../../utils/geolocation";

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

export interface ConnectionLocation {
  id: number;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  connections: number;
  lastSeen: string;
  ip: string;
  user: string;
  department: string;
  stationName: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function mapAuditLog(log: AuditLog): AuditRecord {
  let result: AuditResult = "Error";

  if (
    log.result === "Correcto" ||
    log.result === "Rechazado" ||
    log.result === "Error"
  ) {
    result = log.result;
  }

  return {
    id: log.id,
    timestamp: log.created_at,
    actor: log.actor_email,
    role: log.role,
    action: log.action,
    module: log.module,
    resource: log.resource,
    result,
    ip: log.ip_address,
    description: log.description,
  };
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

// Nodos dinámicos calculados exclusivamente de los inicios de sesión reales de los usuarios
// Helper to center the map programmatically when a location is clicked
function MapCenterController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 7, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function AuditLogsPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("Todos");
  const [moduleFilter, setModuleFilter] = useState("Todos");
  const [regionFilter, setRegionFilter] = useState("Todas");

  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionLocation | null>(null);

  async function loadAuditLogs() {
    try {
      setLoadingLogs(true);
      setError("");

      const data = await listAuditLogs();
      setRecords(data.map(mapAuditLog));
    } catch (err) {
      console.error("Error cargando auditoría:", err);
      setError(
        getApiErrorMessage(err) ||
          "No se pudieron cargar los registros de auditoría desde el backend.",
      );
      setRecords([]);
    } finally {
      setLoadingLogs(false);
    }
  }

  useEffect(() => {
    void loadAuditLogs();
  }, []);

  // Filter records by Year
  const recordsByYear = useMemo(() => {
    if (!selectedYear || selectedYear === "Todos") return records;
    return records.filter((r) => {
      const match = r.timestamp?.match(/\b(19\d\d|20\d\d)\b/);
      if (match) return match[1] === selectedYear;
      const parsed = new Date(r.timestamp);
      return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear().toString() === selectedYear;
    });
  }, [records, selectedYear]);

    // Construir ubicaciones del mapa ÚNICAMENTE para lugares donde usuarios han iniciado sesión
  const connections: ConnectionLocation[] = useMemo(() => {
    const storedLocations = getStoredLoginLocations();

    // 1. Filtrar registros de auditoría correspondientes a inicio de sesión
    const loginRecords = recordsByYear.filter(
      (r) =>
        r.action.toLowerCase().includes("inicio") ||
        r.action.toLowerCase().includes("login") ||
        r.description.toLowerCase().includes("inicio de sesión"),
    );

    const locationMap = new Map<
      string,
      {
        id: number;
        region: string;
        city: string;
        department: string;
        stationName: string;
        latitude: number;
        longitude: number;
        connections: number;
        lastSeen: string;
        ip: string;
        user: string;
        users: Set<string>;
      }
    >();

    let nextId = 1;

    // Procesar cada registro de inicio de sesión real
    loginRecords.forEach((record) => {
      const coordMatch = record.description.match(
        /\((-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\)/,
      );

      let lat: number | null = coordMatch ? parseFloat(coordMatch[1]) : null;
      let lng: number | null = coordMatch ? parseFloat(coordMatch[2]) : null;
      let city = "";
      let region = "";
      let department = "";

      const storedMatch = storedLocations.find(
        (sl) => sl.email.toLowerCase() === record.actor.toLowerCase(),
      );

      if (storedMatch) {
        if (lat === null || lng === null) {
          lat = storedMatch.latitude;
          lng = storedMatch.longitude;
        }
        city = storedMatch.city;
        region = storedMatch.region;
        department = storedMatch.department;
      }

      if (!region) {
        const textToSearch = `${record.description} ${record.actor}`.toLowerCase();
        for (const [deptKey, deptInfo] of Object.entries(PERU_DEPARTMENTS_COORDS)) {
          if (textToSearch.includes(deptKey)) {
            if (lat === null || lng === null) {
              lat = deptInfo.latitude;
              lng = deptInfo.longitude;
            }
            city = deptInfo.city;
            region = deptInfo.city;
            department = deptInfo.department;
            break;
          }
        }
      }

      if (lat === null || lng === null) {
        lat = -12.0464;
        lng = -77.0428;
        city = "Lima";
        region = "Lima";
        department = "Lima Metropolitana";
      }

      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;

      if (locationMap.has(key)) {
        const existing = locationMap.get(key)!;
        existing.connections += 1;
        existing.users.add(record.actor);
        if (new Date(record.timestamp).getTime() >= new Date(existing.lastSeen).getTime()) {
          existing.lastSeen = formatDate(record.timestamp);
          existing.user = record.actor;
          existing.ip = record.ip;
        }
      } else {
        const usersSet = new Set<string>();
        usersSet.add(record.actor);
        locationMap.set(key, {
          id: nextId++,
          region: region || city,
          city,
          department: department || `${city}, Perú`,
          stationName: `Terminal de Usuario - ${city}`,
          latitude: lat,
          longitude: lng,
          connections: 1,
          lastSeen: formatDate(record.timestamp),
          ip: record.ip || "127.0.0.1",
          user: record.actor,
          users: usersSet,
        });
      }
    });

    storedLocations.forEach((stored) => {
      const key = `${stored.latitude.toFixed(3)},${stored.longitude.toFixed(3)}`;
      if (!locationMap.has(key)) {
        const usersSet = new Set<string>();
        usersSet.add(stored.email);
        locationMap.set(key, {
          id: nextId++,
          region: stored.region || stored.city,
          city: stored.city,
          department: stored.department,
          stationName: `Terminal de Usuario - ${stored.city}`,
          latitude: stored.latitude,
          longitude: stored.longitude,
          connections: 1,
          lastSeen: formatDate(stored.timestamp),
          ip: stored.ip,
          user: stored.email,
          users: usersSet,
        });
      }
    });

    return Array.from(locationMap.values()).map((loc) => ({
      id: loc.id,
      region: loc.region,
      city: loc.city,
      department: loc.department,
      stationName: loc.stationName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      connections: loc.connections,
      lastSeen: loc.lastSeen,
      ip: loc.ip,
      user: loc.users.size > 1 ? `${loc.user} (+${loc.users.size - 1} más)` : loc.user,
    }));
  }, [recordsByYear]);

  const modules = useMemo(
    () => [...new Set(recordsByYear.map((record) => record.module))].sort(),
    [recordsByYear],
  );

  const regions = useMemo(
    () => [...new Set(connections.map((item) => item.region))].sort(),
    [connections],
  );

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return recordsByYear
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
        const matchesResult = resultFilter === "Todos" || record.result === resultFilter;
        const matchesModule = moduleFilter === "Todos" || record.module === moduleFilter;

        return matchesSearch && matchesResult && matchesModule;
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [recordsByYear, search, resultFilter, moduleFilter]);

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
          connection.department,
          connection.stationName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesRegion && matchesSearch;
    });
  }, [connections, regionFilter, search]);

  const successfulCount = recordsByYear.filter(
    (record) => record.result === "Correcto",
  ).length;

  const rejectedCount = recordsByYear.filter(
    (record) => record.result === "Rechazado",
  ).length;

  const errorCount = recordsByYear.filter(
    (record) => record.result === "Error",
  ).length;

  const uniqueActors = new Set(recordsByYear.map((record) => record.actor)).size;

  const totalConnections = filteredConnections.reduce(
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
      "IP",
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
      .map((row) =>
        row.map((value) => escapeCsv(String(value))).join(","),
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sepms-auditoria-${selectedYear}.csv`;
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
    setSelectedYear(DEFAULT_YEAR);
  };

  const mapCenterCoords: [number, number] | null = selectedConnection
    ? [selectedConnection.latitude, selectedConnection.longitude]
    : null;

  return (
    <main className="module-page audit-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">SEGURIDAD Y TRAZABILIDAD</span>
          <h1>Registro de auditoría y accesos geográficos</h1>
          <p>
            Supervisa en tiempo real las conexiones en el mapa del Perú, actividad de operadores y bitácora del backend.
          </p>
        </div>

        <div className="audit-heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => void loadAuditLogs()}
            disabled={loadingLogs}
          >
            <RefreshCw size={16} />
            {loadingLogs ? "Actualizando..." : "Actualizar"}
          </button>

          <button
            type="button"
            className="primary-button"
            onClick={exportCsv}
            disabled={loadingLogs || filteredRecords.length === 0}
          >
            <Download size={17} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Global Year Filter (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={filteredRecords.length}
        label="Filtrar bitácora por año:"
      />

      <div className="audit-demo-notice">
        <Activity size={18} />
        <div>
          <strong>Bitácora geolocalizada conectada al backend SEPMS</strong>
          <span>
            Los registros de actividad y los puntos de conexión se procesan desde la infraestructura de auditoría y nodos sismológicos en todo el Perú.
          </span>
        </div>
      </div>

      {error && (
        <div className="users-feedback users-feedback-error">
          {error}
        </div>
      )}

      {/* MAPA DEL PERÚ - GEOLOCALIZACIÓN DE CONEXIONES */}
      <section className="panel audit-map-panel">
        <div className="panel-heading audit-map-heading">
          <div>
            <span className="eyebrow">DISTRIBUCIÓN GEOGRÁFICA EN EL MAPA DEL PERÚ</span>
            <h2>Mapa de ubicaciones de usuarios con sesión iniciada</h2>
            <p>
              Muestra exclusivamente las ubicaciones geográficas desde donde los usuarios han iniciado sesión en el sistema.
            </p>
          </div>

          <div className="audit-map-total">
            <span>Conexiones activas ({selectedYear})</span>
            <strong>{totalConnections}</strong>
          </div>
        </div>

        <div className="audit-map-filters">
          <label>
            <MapPin size={16} />
            <span>Filtrar por Región / Departamento:</span>
            <select
              value={regionFilter}
              onChange={(event) => {
                setRegionFilter(event.target.value);
                const match = connections.find(c => c.region === event.target.value);
                if (match) setSelectedConnection(match);
                else setSelectedConnection(null);
              }}
              aria-label="Filtrar mapa por región"
            >
              <option value="Todas">Todo el Perú ({connections.length} sedes)</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span className="audit-map-legend">
              <span />
              Ubicación de usuario con sesión iniciada
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Ubicaciones con inicio de sesión: <strong>{connections.length}</strong>
            </span>
          </div>
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

              <MapCenterController center={mapCenterCoords} />

              {filteredConnections.length === 0 && (
                <div className="audit-map-empty-overlay">
                  <MapPin size={28} />
                  <strong>Sin inicios de sesión en este filtro</strong>
                  <p>El mapa muestra exclusivamente las ubicaciones de los usuarios que han iniciado sesión en el sistema.</p>
                </div>
              )}

              {filteredConnections.map((location) => {
                const isSelected = selectedConnection?.id === location.id;
                const markerRadius = 8 + Math.min(location.connections, 16);

                return (
                  <CircleMarker
                    key={location.id}
                    center={[location.latitude, location.longitude]}
                    radius={markerRadius}
                    pathOptions={{
                      color: isSelected ? "#f59e0b" : "#0f766e",
                      fillColor: isSelected ? "#fbbf24" : "#14b8a6",
                      fillOpacity: isSelected ? 0.95 : 0.82,
                      weight: isSelected ? 3.5 : 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedConnection(location),
                    }}
                  >
                    <Popup>
                      <div className="audit-map-popup">
                        <strong style={{ color: "#0f766e", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                          📍 {location.city}, {location.region}
                        </strong>
                        <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>
                          {location.stationName}
                        </div>
                        <p style={{ margin: "3px 0" }}>
                          <strong>Conexiones:</strong> <span style={{ color: "#0d9488", fontWeight: "700" }}>{location.connections} accesos</span>
                        </p>
                        <p style={{ margin: "3px 0" }}>
                          <strong>Último usuario:</strong> {location.user}
                        </p>
                        <p style={{ margin: "3px 0" }}>
                          <strong>Dirección IP:</strong> <code style={{ background: "#f1f5f9", padding: "1px 4px", borderRadius: "3px" }}>{location.ip}</code>
                        </p>
                        <p style={{ margin: "3px 0" }}>
                          <strong>Última actividad:</strong> {location.lastSeen}
                        </p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          <aside className="audit-region-list">
            <h3>
              <MapPinned size={17} />
              Sedes con inicio de sesión ({selectedYear})
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
                  title={`Clic para ubicar ${location.city} en el mapa`}
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
                No hay ubicaciones para el filtro.
              </p>
            )}

            <p className="audit-region-disclaimer">
              📍 Ubicaciones geográficas marcadas exclusivamente para los lugares donde los usuarios han iniciado sesión en el sistema.
            </p>
          </aside>
        </div>

        {selectedConnection && (
          <div className="audit-connection-detail" style={{ animation: "fadeIn 0.25s ease" }}>
            <div className="audit-connection-detail-icon">
              <MapPin size={22} />
            </div>

            <div className="audit-connection-detail-content">
              <strong>
                {selectedConnection.city}, {selectedConnection.region} ({selectedConnection.department})
              </strong>

              <span style={{ color: "#0d9488", fontWeight: "600" }}>
                {selectedConnection.stationName}
              </span>

              <span>
                Último operador: <strong>{selectedConnection.user}</strong> · IP:{" "}
                <code>{selectedConnection.ip}</code>
              </span>

              <span>
                Total de conexiones registradas:{" "}
                <strong>{selectedConnection.connections}</strong> · Última actividad:{" "}
                <strong>{selectedConnection.lastSeen}</strong>
              </span>
            </div>

            <button
              type="button"
              className="audit-close-button"
              onClick={() => setSelectedConnection(null)}
              aria-label="Cerrar detalle"
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
            <span className="metric-label">Registros ({selectedYear})</span>
            <span className="metric-icon metric-blue">
              <Activity size={20} />
            </span>
          </div>

          <div className="metric-value">
            {recordsByYear.length}
          </div>

          <p className="metric-description">
            Eventos de auditoría en {selectedYear}
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Operaciones correctas</span>
            <span className="metric-icon metric-teal">
              <CheckCircle2 size={20} />
            </span>
          </div>

          <div className="metric-value">
            {successfulCount}
          </div>

          <p className="metric-description">
            Acciones autorizadas y completadas
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Rechazados / Errores</span>
            <span className="metric-icon metric-orange">
              <XCircle size={20} />
            </span>
          </div>

          <div className="metric-value">
            {rejectedCount + errorCount}
          </div>

          <p className="metric-description">
            {rejectedCount} rechazados · {errorCount} errores
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Usuarios activos</span>
            <span className="metric-icon metric-violet">
              <Users size={20} />
            </span>
          </div>

          <div className="metric-value">
            {uniqueActors}
          </div>

          <p className="metric-description">
            Actores con operaciones registradas
          </p>
        </article>
      </section>

      {/* TABLA DE AUDITORÍA */}
      <section className="panel audit-table-panel">
        <div className="panel-heading audit-panel-heading">
          <div>
            <h2>Bitácora de eventos del sistema</h2>
            <p>
              Mostrando {filteredRecords.length} de {recordsByYear.length} registros del año {selectedYear}
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
              placeholder="Buscar usuario, acción, recurso, IP..."
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
            Limpiar filtros
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
              {loadingLogs ? (
                <tr>
                  <td colSpan={6}>
                    <div className="audit-empty">
                      <RefreshCw size={28} />
                      <strong>Cargando registros de auditoría...</strong>
                      <span>Consultando información desde el backend.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span className="audit-id">{record.id}</span>
                        <small>{record.resource}</small>
                      </td>

                      <td>
                        <strong className="audit-actor">{record.actor}</strong>
                        <small>{record.role} · {record.ip}</small>
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
                        <span className={`audit-result ${getResultClass(record.result)}`}>
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
                          <strong>No se encontraron registros para el año {selectedYear}</strong>
                          <span>Cambia el filtro de año o prueba con otros términos de búsqueda.</span>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={resetFilters}
                          >
                            Restablecer filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-table-footer">
          <span>
            <ShieldCheck size={15} />
            Vista de auditoría y conexiones geolocalizadas · Backend SEPMS
          </span>

          <span>
            {filteredRecords.length} resultados en {selectedYear}
          </span>
        </div>
      </section>

      {/* MODAL DE DETALLE DE REGISTRO */}
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
              <span className={`audit-result ${getResultClass(selectedRecord.result)}`}>
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
                <span>IP de origen</span>
                <strong>{selectedRecord.ip}</strong>
              </div>
            </div>

            <div className="audit-description">
              <span>Descripción técnica</span>
              <p>{selectedRecord.description}</p>
            </div>

            <p className="audit-modal-note">
              Registro auditado e inmutable obtenido desde el backend de SEPMS.
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
