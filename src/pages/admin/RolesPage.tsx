
import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Shield,
  BrainCircuit,
  BellRing,
  ClipboardList,
  Eye,
  Search,
  Pencil,
  Check,
  X,
  LockKeyhole,
  Info,
} from "lucide-react";
import './admin.css';
type Permission =
  | "dashboard"
  | "events"
  | "datasets"
  | "experiments"
  | "models"
  | "alerts"
  | "sources"
  | "reports"
  | "users"
  | "audit";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  system: boolean;
};

const permissionCatalog: {
  id: Permission;
  label: string;
  description: string;
  group: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "Consultar indicadores generales.",
    group: "Monitoreo",
  },
  {
    id: "events",
    label: "Eventos sísmicos",
    description: "Consultar el catálogo de eventos.",
    group: "Monitoreo",
  },
  {
    id: "datasets",
    label: "Datasets",
    description: "Consultar y gestionar conjuntos de datos.",
    group: "Machine Learning",
  },
  {
    id: "experiments",
    label: "Experimentos ML",
    description: "Consultar y gestionar experimentos.",
    group: "Machine Learning",
  },
  {
    id: "models",
    label: "Modelos ML",
    description: "Consultar el catálogo de modelos.",
    group: "Machine Learning",
  },
  {
    id: "alerts",
    label: "Alertas",
    description: "Consultar y gestionar alertas.",
    group: "Operaciones",
  },
  {
    id: "sources",
    label: "Fuentes de datos",
    description: "Consultar fuentes y sincronizaciones.",
    group: "Operaciones",
  },
  {
    id: "reports",
    label: "Reportes",
    description: "Consultar y generar reportes.",
    group: "Operaciones",
  },
  {
    id: "users",
    label: "Usuarios y roles",
    description: "Administrar cuentas y perfiles.",
    group: "Administración",
  },
  {
    id: "audit",
    label: "Auditoría",
    description: "Consultar el historial de actividad.",
    group: "Administración",
  },
];

const initialRoles: Role[] = [
  {
    id: "ROLE-001",
    name: "Administrador",
    description:
      "Administración general de la plataforma y configuración de accesos.",
    permissions: permissionCatalog.map((item) => item.id),
    system: true,
  },
  {
    id: "ROLE-002",
    name: "Analista ML",
    description:
      "Trabajo con datasets, experimentos y evaluación de modelos.",
    permissions: [
      "dashboard",
      "events",
      "datasets",
      "experiments",
      "models",
      "reports",
    ],
    system: true,
  },
  {
    id: "ROLE-003",
    name: "Operador de alertas",
    description:
      "Consulta de eventos y gestión operativa de alertas.",
    permissions: ["dashboard", "events", "alerts", "sources", "reports"],
    system: true,
  },
  {
    id: "ROLE-004",
    name: "Auditor",
    description:
      "Consulta de información y trazabilidad de las operaciones.",
    permissions: [
      "dashboard",
      "events",
      "datasets",
      "experiments",
      "models",
      "alerts",
      "sources",
      "reports",
      "audit",
    ],
    system: true,
  },
  {
    id: "ROLE-005",
    name: "Solo lectura",
    description:
      "Acceso de consulta a los módulos generales autorizados.",
    permissions: ["dashboard", "events", "reports"],
    system: true,
  },
];

function getRoleIcon(roleName: string) {
  switch (roleName) {
    case "Administrador":
      return <ShieldCheck size={21} />;
    case "Analista ML":
      return <BrainCircuit size={21} />;
    case "Operador de alertas":
      return <BellRing size={21} />;
    case "Auditor":
      return <ClipboardList size={21} />;
    default:
      return <Eye size={21} />;
  }
}

function getRoleColor(roleName: string) {
  switch (roleName) {
    case "Administrador":
      return "role-color-admin";
    case "Analista ML":
      return "role-color-analyst";
    case "Operador de alertas":
      return "role-color-operator";
    case "Auditor":
      return "role-color-auditor";
    default:
      return "role-color-reader";
  }
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("ROLE-001");
  const [editing, setEditing] = useState(false);
  const [draftPermissions, setDraftPermissions] = useState<Permission[]>([]);
  const [message, setMessage] = useState("");

  const filteredRoles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term)
    );
  }, [roles, search]);

  const selectedRole =
    roles.find((role) => role.id === selectedRoleId) ?? null;

  const permissionGroups = useMemo(() => {
    return permissionCatalog.reduce<
      Record<string, typeof permissionCatalog>
    >((groups, permission) => {
      groups[permission.group] ??= [];
      groups[permission.group].push(permission);
      return groups;
    }, {});
  }, []);

  function selectRole(role: Role) {
    setSelectedRoleId(role.id);
    setDraftPermissions([...role.permissions]);
    setEditing(false);
    setMessage("");
  }

  function beginEditing() {
    if (!selectedRole) return;

    setDraftPermissions([...selectedRole.permissions]);
    setEditing(true);
    setMessage("");
  }

  function togglePermission(permission: Permission) {
    setDraftPermissions((current) =>
      current.includes(permission)
        ? current.filter((item) => item !== permission)
        : [...current, permission]
    );
  }

  function savePermissions() {
    if (!selectedRole) return;

    setRoles((current) =>
      current.map((role) =>
        role.id === selectedRole.id
          ? { ...role, permissions: [...draftPermissions] }
          : role
      )
    );

    setEditing(false);
    setMessage(
      "Permisos actualizados en la demostración local. No se han aplicado en el servidor."
    );
  }

  function cancelEditing() {
    if (selectedRole) {
      setDraftPermissions([...selectedRole.permissions]);
    }

    setEditing(false);
    setMessage("");
  }

  return (
    <main className="module-page roles-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN Y SEGURIDAD</span>
          <h1>Roles y permisos</h1>
          <p>
            Consulta los perfiles y revisa qué módulos puede utilizar
            cada tipo de usuario.
          </p>
        </div>
      </div>

      <div className="roles-demo-notice">
        <Info size={20} />
        <div>
          <strong>Matriz de permisos de demostración</strong>
          <p>
            Esta configuración solo modifica el estado de la interfaz.
            Los permisos reales deben verificarse en cada endpoint del
            backend y no únicamente ocultando opciones del menú.
          </p>
        </div>
      </div>

      {message && (
        <div className="roles-feedback">
          <Check size={17} />
          <span>{message}</span>
          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Cerrar mensaje"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics-grid roles-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Roles registrados</span>
            <span className="metric-icon metric-blue">
              <Shield size={21} />
            </span>
          </div>
          <h2 className="metric-value">{roles.length}</h2>
          <p className="metric-description">
            Perfiles configurados localmente
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Módulos controlados</span>
            <span className="metric-icon metric-violet">
              <LockKeyhole size={21} />
            </span>
          </div>
          <h2 className="metric-value">{permissionCatalog.length}</h2>
          <p className="metric-description">
            Permisos disponibles en la interfaz
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Roles de sistema</span>
            <span className="metric-icon metric-teal">
              <ShieldCheck size={21} />
            </span>
          </div>
          <h2 className="metric-value">
            {roles.filter((role) => role.system).length}
          </h2>
          <p className="metric-description">
            Perfiles predeterminados
          </p>
        </article>
      </section>

      <section className="roles-workspace">
        <aside className="panel roles-list-panel">
          <div className="roles-list-header">
            <h2>Perfiles</h2>
            <span>{filteredRoles.length}</span>
          </div>

          <label className="roles-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Buscar rol..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <div className="roles-list">
            {filteredRoles.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`roles-list-item ${
                  selectedRoleId === role.id
                    ? "roles-list-item-selected"
                    : ""
                }`}
                onClick={() => selectRole(role)}
              >
                <span
                  className={`roles-list-icon ${getRoleColor(role.name)}`}
                >
                  {getRoleIcon(role.name)}
                </span>

                <span className="roles-list-text">
                  <strong>{role.name}</strong>
                  <small>
                    {role.permissions.length} de{" "}
                    {permissionCatalog.length} permisos
                  </small>
                </span>

                {selectedRoleId === role.id && (
                  <span className="roles-selected-indicator">
                    <Check size={15} />
                  </span>
                )}
              </button>
            ))}

            {filteredRoles.length === 0 && (
              <p className="roles-no-results">
                No se encontraron roles.
              </p>
            )}
          </div>
        </aside>

        <section className="panel roles-permissions-panel">
          {selectedRole ? (
            <>
              <header className="roles-detail-header">
                <div className="roles-detail-title">
                  <span
                    className={`roles-detail-icon ${getRoleColor(
                      selectedRole.name
                    )}`}
                  >
                    {getRoleIcon(selectedRole.name)}
                  </span>

                  <div>
                    <span className="eyebrow">
                      CONFIGURACIÓN DEL PERFIL
                    </span>
                    <h2>{selectedRole.name}</h2>
                    <p>{selectedRole.description}</p>
                  </div>
                </div>

                {!editing && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={beginEditing}
                  >
                    <Pencil size={16} />
                    Editar permisos
                  </button>
                )}
              </header>

              <div className="roles-permission-summary">
                <div>
                  <span>Permisos habilitados</span>
                  <strong>
                    {editing
                      ? draftPermissions.length
                      : selectedRole.permissions.length}
                  </strong>
                </div>
                <div>
                  <span>Total disponible</span>
                  <strong>{permissionCatalog.length}</strong>
                </div>
                <div>
                  <span>Tipo de perfil</span>
                  <strong>
                    {selectedRole.system ? "Sistema" : "Personalizado"}
                  </strong>
                </div>
              </div>

              <div className="roles-permission-groups">
                {Object.entries(permissionGroups).map(
                  ([groupName, permissions]) => (
                    <section
                      key={groupName}
                      className="roles-permission-group"
                    >
                      <h3>{groupName}</h3>

                      {permissions.map((permission) => {
                        const enabled = editing
                          ? draftPermissions.includes(permission.id)
                          : selectedRole.permissions.includes(
                              permission.id
                            );

                        return (
                          <label
                            key={permission.id}
                            className={`roles-permission-row ${
                              enabled ? "roles-permission-enabled" : ""
                            } ${
                              !editing
                                ? "roles-permission-readonly"
                                : ""
                            }`}
                          >
                            <span className="roles-permission-check">
                              <input
                                type="checkbox"
                                checked={enabled}
                                disabled={!editing}
                                onChange={() =>
                                  togglePermission(permission.id)
                                }
                              />
                            </span>

                            <span className="roles-permission-copy">
                              <strong>{permission.label}</strong>
                              <small>{permission.description}</small>
                            </span>

                            <span
                              className={`roles-permission-state ${
                                enabled
                                  ? "roles-permission-state-on"
                                  : "roles-permission-state-off"
                              }`}
                            >
                              {enabled ? "Permitido" : "Sin acceso"}
                            </span>
                          </label>
                        );
                      })}
                    </section>
                  )
                )}
              </div>

              {editing && (
                <footer className="roles-edit-footer">
                  <p>
                    <Info size={16} />
                    Los cambios solo se aplicarán a esta demostración.
                  </p>
                  <div>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={savePermissions}
                    >
                      <Check size={17} />
                      Guardar cambios
                    </button>
                  </div>
                </footer>
              )}
            </>
          ) : (
            <div className="roles-no-selection">
              <Shield size={35} />
              <h2>Selecciona un perfil</h2>
              <p>
                Elige un rol de la lista para consultar sus permisos.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
