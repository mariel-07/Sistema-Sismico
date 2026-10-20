import { useEffect, useMemo, useState } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  type ApiUser,
} from "../../services/api/users.api";
import {
  UserRound,
  UserPlus,
  Search,
  ShieldCheck,
  Shield,
  Pencil,
  X,
  CheckCircle2,
  UserX,
  Users,
  BrainCircuit,
} from "lucide-react";
import "./admin.css";

type UserRole =
  | "Administrador"
  | "Analista ML"
  | "Operador de alertas"
  | "Auditor"
  | "Solo lectura";

type UserStatus = "Activo" | "Inactivo";

type SEPMSUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

const roles: UserRole[] = [
  "Administrador",
  "Analista ML",
  "Operador de alertas",
  "Auditor",
  "Solo lectura",
];

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "Solo lectura",
};

function mapApiUser(user: ApiUser): SEPMSUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.is_active ? "Activo" : "Inactivo",
    createdAt: user.created_at.slice(0, 10),
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<SEPMSUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "Todos" | UserStatus
  >("Todos");
  const [roleFilter, setRoleFilter] = useState<
    "Todos" | UserRole
  >("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] =
    useState<SEPMSUser | null>(null);

  const [form, setForm] = useState<UserForm>(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoadingUsers(true);
      setError("");

      try {
        const data = await listUsers();

        if (active) {
          setUsers(data.map(mapApiUser));
        }
      } catch {
        if (active) {
          setError(
            "No se pudieron cargar los usuarios desde el backend.",
          );
        }
      } finally {
        if (active) {
          setLoadingUsers(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = [
        user.id,
        user.name,
        user.email,
        user.role,
      ].some((value) =>
        value.toLowerCase().includes(term),
      );

      const matchesStatus =
        statusFilter === "Todos" ||
        user.status === statusFilter;

      const matchesRole =
        roleFilter === "Todos" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesRole
      );
    });
  }, [users, search, statusFilter, roleFilter]);

  const activeCount = users.filter(
    (user) => user.status === "Activo",
  ).length;

  const inactiveCount = users.length - activeCount;

  function openCreateModal() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function openEditModal(user: SEPMSUser) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 3) {
      setError(
        "El nombre debe tener al menos 3 caracteres.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setError(
        "Introduce un correo electrónico válido.",
      );
      return;
    }

    if (!editingUser && form.password.length < 12) {
      setError(
        "La contraseña debe tener al menos 12 caracteres.",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        const updated = await updateUser(
          editingUser.id,
          {
            name,
            email,
            role: form.role,
          },
        );

        setUsers((current) =>
          current.map((user) =>
            user.id === editingUser.id
              ? mapApiUser(updated)
              : user,
          ),
        );

        setSuccess(
          "Usuario actualizado correctamente.",
        );
      } else {
        const created = await createUser({
          name,
          email,
          password: form.password,
          role: form.role,
        });

        setUsers((current) => [
          ...current,
          mapApiUser(created),
        ]);

        setSuccess(
          "Usuario creado correctamente.",
        );
      }

      setModalOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    } catch (requestError: unknown) {
      const detail =
        (requestError as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "No se pudo guardar el usuario.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(userId: string) {
    const currentUser = users.find(
      (user) => user.id === userId,
    );

    if (!currentUser) return;

    setError("");
    setSuccess("");

    try {
      const updated = await updateUser(userId, {
        is_active:
          currentUser.status !== "Activo",
      });

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? mapApiUser(updated)
            : user,
        ),
      );

      setSuccess(
        updated.is_active
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente.",
      );
    } catch (requestError: unknown) {
      const detail =
        (requestError as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "No se pudo actualizar el estado del usuario.",
      );
    }
  }

  function getRoleClass(role: UserRole) {
    switch (role) {
      case "Administrador":
        return "users-role-admin";

      case "Analista ML":
        return "users-role-analyst";

      case "Operador de alertas":
        return "users-role-operator";

      case "Auditor":
        return "users-role-auditor";

      default:
        return "users-role-reader";
    }
  }

  return (
    <main className="module-page users-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            ADMINISTRACIÓN Y SEGURIDAD
          </span>

          <h1>Usuarios y roles</h1>

          <p>
            Administra las cuentas y los roles asignados
            en SEPMS.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateModal}
          disabled={loadingUsers}
        >
          <UserPlus size={18} />
          Nuevo usuario
        </button>
      </div>

      <div className="users-demo-notice">
        <ShieldCheck size={21} />

        <div>
          <strong>Usuarios conectados al backend</strong>

          <p>
            Los usuarios mostrados se cargan desde la API
            de seguridad de SEPMS. Los cambios se guardan
            en el backend.
          </p>
        </div>
      </div>

      {success && (
        <div className="users-feedback users-feedback-success">
          <CheckCircle2 size={17} />

          {success}

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Cerrar mensaje"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {error && !modalOpen && (
        <div className="users-feedback users-feedback-error">
          {error}

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Cerrar mensaje"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics-grid users-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Usuarios registrados
            </span>

            <span className="metric-icon metric-blue">
              <Users size={21} />
            </span>
          </div>

          <h2 className="metric-value">
            {users.length}
          </h2>

          <p className="metric-description">
            Cuentas registradas en el backend
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Usuarios activos
            </span>

            <span className="metric-icon metric-teal">
              <UserRound size={21} />
            </span>
          </div>

          <h2 className="metric-value">
            {activeCount}
          </h2>

          <p className="metric-description">
            Marcados como activos
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Usuarios inactivos
            </span>

            <span className="metric-icon metric-orange">
              <UserX size={21} />
            </span>
          </div>

          <h2 className="metric-value">
            {inactiveCount}
          </h2>

          <p className="metric-description">
            Marcados como inactivos
          </p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">
              Roles disponibles
            </span>

            <span className="metric-icon metric-violet">
              <Shield size={21} />
            </span>
          </div>

          <h2 className="metric-value">
            {roles.length}
          </h2>

          <p className="metric-description">
            Perfiles configurados
          </p>
        </article>
      </section>

      <section className="panel users-catalog-panel">
        <div className="panel-heading users-panel-heading">
          <div>
            <h2>Directorio de usuarios</h2>

            <p>
              Busca cuentas y revisa sus permisos
              asignados.
            </p>
          </div>

          <span className="users-total">
            {filteredUsers.length} resultados
          </span>
        </div>

        <div className="users-toolbar">
          <label className="users-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Buscar por nombre, correo, ID o rol..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </label>

          <select
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "Todos"
                  | UserStatus,
              )
            }
          >
            <option value="Todos">
              Todos los estados
            </option>

            <option value="Activo">
              Activo
            </option>

            <option value="Inactivo">
              Inactivo
            </option>
          </select>

          <select
            aria-label="Filtrar por rol"
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as
                  | "Todos"
                  | UserRole,
              )
            }
          >
            <option value="Todos">
              Todos los roles
            </option>

            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role}
              </option>
            ))}
          </select>
        </div>

        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol asignado</th>
                <th>Estado</th>
                <th>Fecha de registro</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {loadingUsers ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                    }}
                  >
                    Cargando usuarios...
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="users-name-cell">
                        <span className="users-avatar">
                          {user.name
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>

                        <div>
                          <strong>
                            {user.name}
                          </strong>

                          <small>
                            {user.email}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`users-role ${getRoleClass(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`users-status ${
                          user.status === "Activo"
                            ? "users-status-active"
                            : "users-status-inactive"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      {user.createdAt}
                    </td>

                    <td>
                      <div className="users-row-actions">
                        <button
                          type="button"
                          className="users-icon-button"
                          title="Editar usuario"
                          aria-label={`Editar ${user.name}`}
                          onClick={() =>
                            openEditModal(user)
                          }
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="users-icon-button"
                          title={
                            user.status ===
                            "Activo"
                              ? "Desactivar usuario"
                              : "Activar usuario"
                          }
                          aria-label={
                            user.status ===
                            "Activo"
                              ? `Desactivar ${user.name}`
                              : `Activar ${user.name}`
                          }
                          onClick={() =>
                            void toggleStatus(
                              user.id,
                            )
                          }
                        >
                          {user.status ===
                          "Activo" ? (
                            <UserX size={16} />
                          ) : (
                            <CheckCircle2
                              size={16}
                            />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {!loadingUsers &&
            filteredUsers.length === 0 && (
              <div className="users-empty">
                <Users size={32} />

                <strong>
                  No hay usuarios coincidentes
                </strong>

                <p>
                  Prueba con otro término o filtro.
                </p>
              </div>
            )}
        </div>
      </section>

      <section className="panel users-roles-info">
        <div className="panel-heading">
          <div>
            <h2>Descripción de roles</h2>

            <p>
              Referencia de permisos previstos para
              la aplicación.
            </p>
          </div>
        </div>

        <div className="users-role-cards">
          <article>
            <ShieldCheck size={20} />

            <strong>
              Administrador
            </strong>

            <p>
              Gestiona usuarios, configuración y
              acceso a los módulos.
            </p>
          </article>

          <article>
            <BrainCircuit size={20} />

            <strong>
              Analista ML
            </strong>

            <p>
              Trabaja con datasets, experimentos y
              evaluación de modelos.
            </p>
          </article>

          <article>
            <CheckCircle2 size={20} />

            <strong>
              Operador de alertas
            </strong>

            <p>
              Consulta y gestiona las alertas según
              los procedimientos autorizados.
            </p>
          </article>

          <article>
            <Shield size={20} />

            <strong>
              Auditor
            </strong>

            <p>
              Consulta registros de actividad y
              trazabilidad.
            </p>
          </article>

          <article>
            <UserRound size={20} />

            <strong>
              Solo lectura
            </strong>

            <p>
              Consulta los módulos habilitados sin
              modificarlos.
            </p>
          </article>
        </div>
      </section>

      {modalOpen && (
        <div
          className="users-modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <section
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="users-modal-title"
          >
            <header className="users-modal-header">
              <div>
                <span className="eyebrow">
                  ADMINISTRACIÓN
                </span>

                <h2 id="users-modal-title">
                  {editingUser
                    ? "Editar usuario"
                    : "Registrar usuario"}
                </h2>

                <p>
                  Completa los datos y selecciona
                  el rol correspondiente.
                </p>
              </div>

              <button
                type="button"
                className="users-icon-button"
                aria-label="Cerrar formulario"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="users-modal-body">
                <label className="users-form-field">
                  <span>
                    Nombre completo
                  </span>

                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target
                          .value,
                      }))
                    }
                    placeholder="Introduce el nombre"
                    required
                    minLength={3}
                    maxLength={120}
                    disabled={saving}
                  />
                </label>

                <label className="users-form-field">
                  <span>
                    Correo electrónico
                  </span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        email: event.target
                          .value,
                      }))
                    }
                    placeholder="usuario@ejemplo.com"
                    required
                    maxLength={254}
                    disabled={saving}
                  />
                </label>

                {!editingUser && (
                  <label className="users-form-field">
                    <span>
                      Contraseña
                    </span>

                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password:
                            event.target
                              .value,
                        }))
                      }
                      placeholder="Mínimo 12 caracteres"
                      required
                      minLength={12}
                      autoComplete="new-password"
                      disabled={saving}
                    />
                  </label>
                )}

                <label className="users-form-field">
                  <span>Rol</span>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        role: event.target
                          .value as UserRole,
                      }))
                    }
                    disabled={saving}
                  >
                    {roles.map((role) => (
                      <option
                        key={role}
                        value={role}
                      >
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                {editingUser && (
                  <p className="users-password-note">
                    La contraseña existente no se
                    modifica desde este formulario.
                  </p>
                )}

                {error && (
                  <div className="users-feedback users-feedback-error">
                    {error}
                  </div>
                )}
              </div>

              <footer className="users-modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Guardando..."
                    : editingUser
                      ? "Guardar cambios"
                      : "Registrar usuario"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
