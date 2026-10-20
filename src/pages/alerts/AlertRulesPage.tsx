
import { useEffect, useMemo, useState } from "react";
import { getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule } from "../../services/api/alertRules.api";
import {
  BellRing,
  Plus,
  Search,
  Pencil,
  Power,
  Trash2,
  X,
  Save,
  Info,
  SlidersHorizontal,
  ShieldCheck,
} from "lucide-react";
import './alerts.css';
type RulePriority = "Crítica" | "Alta" | "Media" | "Baja";
type RuleCondition = "mayor" | "menor" | "igual";

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: RuleCondition;
  threshold: number;
  unit: string;
  priority: RulePriority;
  enabled: boolean;
  channel: string;
}

type RuleForm = Omit<AlertRule, "id">;

const emptyForm: RuleForm = {
  name: "",
  description: "",
  metric: "Calidad del dataset",
  condition: "menor",
  threshold: 80,
  unit: "%",
  priority: "Media",
  enabled: true,
  channel: "Panel interno",
};

const priorityStyles: Record<RulePriority, string> = {
  Crítica: "rule-priority-critical",
  Alta: "rule-priority-high",
  Media: "rule-priority-medium",
  Baja: "rule-priority-low",
};

export default function AlertRulesPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  useEffect(() => { getAlertRules().then(setRules).catch(() => setLoadError("No se pudieron cargar las reglas del servidor.")).finally(() => setLoading(false)); }, []);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todas");
  const [priorityFilter, setPriorityFilter] = useState("Todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const enabledCount = rules.filter((rule) => rule.enabled).length;
  const disabledCount = rules.length - enabledCount;
  const criticalCount = rules.filter(
    (rule) => rule.enabled && rule.priority === "Crítica",
  ).length;

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const searchable = [
        rule.id,
        rule.name,
        rule.description,
        rule.metric,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (statusFilter === "Todas" ||
          (statusFilter === "Activas" && rule.enabled) ||
          (statusFilter === "Inactivas" && !rule.enabled)) &&
        (priorityFilter === "Todas" || rule.priority === priorityFilter)
      );
    });
  }, [rules, search, statusFilter, priorityFilter]);

  const updateForm = <K extends keyof RuleForm>(
    key: K,
    value: RuleForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (rule: AlertRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      description: rule.description,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      unit: rule.unit,
      priority: rule.priority,
      enabled: rule.enabled,
      channel: rule.channel,
    });
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const saveRule = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.name.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres.");
      return;
    }

    if (!Number.isFinite(form.threshold) || form.threshold < 0) {
      setError("El umbral debe ser un número válido mayor o igual a cero.");
      return;
    }

    if (form.unit === "%" && form.threshold > 100) {
      setError("Cuando la unidad es porcentaje, el umbral no puede superar 100.");
      return;
    }

    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
    };

    const save = async () => {
      try {
        if (editingId) {
          const updated = await updateAlertRule(editingId, normalizedForm);
          setRules((current) => current.map((rule) => rule.id === editingId ? updated : rule));
          setSuccess("Regla actualizada.");
        } else {
          const created = await createAlertRule(normalizedForm);
          setRules((current) => [created, ...current]);
          setSuccess("Regla creada.");
        }
        setModalOpen(false);
      } catch {
        setError("No se pudo guardar la regla en el servidor.");
      }
    };
    void save();
  };

  const toggleRule = async (id: string) => {
    const rule = rules.find((item) => item.id === id);
    if (!rule) return;
    try {
      const updated = await updateAlertRule(id, { ...rule, enabled: !rule.enabled });
      setRules((current) => current.map((item) => item.id === id ? updated : item));
      setSuccess("Estado de la regla actualizado.");
    } catch {
      setError("No se pudo actualizar el estado de la regla.");
    }
  };

  const deleteRule = async (id: string) => {
    const confirmed = window.confirm("?Deseas eliminar esta regla?");
    if (!confirmed) return;
    try {
      await deleteAlertRule(id);
      setRules((current) => current.filter((rule) => rule.id !== id));
      setSuccess("Regla eliminada.");
    } catch {
      setError("No se pudo eliminar la regla del servidor.");
    }
  };

  const resetDemo = () => {
    setSearch("");
    setStatusFilter("Todas");
    setPriorityFilter("Todas");
    setSuccess("Se limpiaron los filtros. Las reglas guardadas no se modificaron.");
    setError("");
  };

  return (
    <main className="module-page alert-rules-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">CONFIGURACIÓN DEL SISTEMA</span>
          <h1>Reglas de alertas</h1>
          <p>
            Administra las condiciones que el sistema deberá evaluar al procesar
            información.
          </p>
        </div>

        <div className="rule-heading-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={resetDemo}
          >
            Restaurar demo
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            Nueva regla
          </button>
        </div>
      </div>

      <div className="rule-demo-notice">
        <Info size={19} />
        <div>
          <strong>Configuración de demostración</strong>
          <span>
            Estas reglas se evalúan visualmente, pero todavía no ejecutan
            procesos en el backend ni generan avisos sísmicos reales.
          </span>
        </div>
      </div>

      {success && (
        <div className="rule-feedback rule-feedback-success" role="status">
          <ShieldCheck size={17} />
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Cerrar mensaje"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loading && <p>Cargando reglas?</p>}
      {loadError && <p role="alert">{loadError}</p>}
      <section className="metrics-grid rule-metrics">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Reglas registradas</span>
            <span className="metric-icon metric-blue">
              <SlidersHorizontal size={20} />
            </span>
          </div>
          <div className="metric-value">{rules.length}</div>
          <p className="metric-description">Reglas de ejemplo</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Activas</span>
            <span className="metric-icon metric-teal">
              <BellRing size={20} />
            </span>
          </div>
          <div className="metric-value">{enabledCount}</div>
          <p className="metric-description">Habilitadas localmente</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Inactivas</span>
            <span className="metric-icon metric-orange">
              <Power size={20} />
            </span>
          </div>
          <div className="metric-value">{disabledCount}</div>
          <p className="metric-description">Deshabilitadas localmente</p>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-label">Prioridad crítica</span>
            <span className="metric-icon metric-violet">
              <BellRing size={20} />
            </span>
          </div>
          <div className="metric-value">{criticalCount}</div>
          <p className="metric-description">Reglas críticas activas</p>
        </article>
      </section>

      <section className="panel rule-panel">
        <div className="panel-heading rule-panel-heading">
          <div>
            <h2>Listado de reglas</h2>
            <p>{filteredRules.length} reglas coinciden con los filtros</p>
          </div>
          <SlidersHorizontal size={22} />
        </div>

        <div className="rule-filters">
          <label className="rule-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar regla o métrica..."
              aria-label="Buscar reglas"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filtrar por estado"
            className="rule-select"
          >
            <option value="Todas">Todos los estados</option>
            <option value="Activas">Activas</option>
            <option value="Inactivas">Inactivas</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            aria-label="Filtrar por prioridad"
            className="rule-select"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Crítica">Crítica</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div className="rule-list">
          {filteredRules.map((rule) => (
            <article className="rule-card" key={rule.id}>
              <div className="rule-card-main">
                <div className="rule-card-icon">
                  <BellRing size={20} />
                </div>

                <div className="rule-card-info">
                  <div className="rule-title-row">
                    <h3>{rule.name}</h3>
                    <span
                      className={`rule-priority ${priorityStyles[rule.priority]}`}
                    >
                      {rule.priority}
                    </span>
                    <span
                      className={`rule-state ${rule.enabled ? "rule-state-active" : "rule-state-inactive"}`}
                    >
                      {rule.enabled ? "Activa" : "Inactiva"}
                    </span>
                  </div>

                  <p>{rule.description || "Sin descripción."}</p>

                  <div className="rule-parameters">
                    <span>
                      <strong>Métrica:</strong> {rule.metric}
                    </span>
                    <span>
                      <strong>Condición:</strong>{" "}
                      {rule.condition === "mayor"
                        ? "Mayor que"
                        : rule.condition === "menor"
                          ? "Menor que"
                          : "Igual a"}{" "}
                      {rule.threshold} {rule.unit}
                    </span>
                    <span>
                      <strong>Canal:</strong> {rule.channel}
                    </span>
                  </div>

                  <small className="rule-id">{rule.id}</small>
                </div>
              </div>

              <div className="rule-actions">
                <button
                  type="button"
                  className="rule-action-button"
                  onClick={() => openEditModal(rule)}
                  title="Editar regla"
                  aria-label={`Editar ${rule.name}`}
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  className={`rule-action-button ${rule.enabled ? "rule-action-disable" : "rule-action-enable"}`}
                  onClick={() => toggleRule(rule.id)}
                  title={rule.enabled ? "Desactivar regla" : "Activar regla"}
                  aria-label={`${rule.enabled ? "Desactivar" : "Activar"} ${rule.name}`}
                >
                  <Power size={16} />
                </button>

                <button
                  type="button"
                  className="rule-action-button rule-action-delete"
                  onClick={() => deleteRule(rule.id)}
                  title="Eliminar regla"
                  aria-label={`Eliminar ${rule.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}

          {filteredRules.length === 0 && (
            <div className="rule-empty">
              <Search size={28} />
              <strong>No se encontraron reglas</strong>
              <span>Prueba con otros filtros o crea una regla nueva.</span>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("Todas");
                  setPriorityFilter("Todas");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <div
          className="rule-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setModalOpen(false);
            }
          }}
        >
          <section
            className="rule-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rule-modal-title"
          >
            <div className="rule-modal-header">
              <div>
                <span className="eyebrow">CONFIGURACIÓN</span>
                <h2 id="rule-modal-title">
                  {editingId ? "Editar regla" : "Crear regla"}
                </h2>
              </div>
              <button
                type="button"
                className="rule-close-button"
                onClick={() => setModalOpen(false)}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form className="rule-form" onSubmit={saveRule}>
              <label>
                Nombre de la regla *
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="Ej. Control de calidad"
                  required
                  minLength={3}
                  maxLength={100}
                />
              </label>

              <label>
                Descripción
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe el objetivo de esta regla"
                  rows={3}
                  maxLength={500}
                />
              </label>

              <div className="rule-form-row">
                <label>
                  Métrica
                  <select
                    value={form.metric}
                    onChange={(event) => {
                      const metric = event.target.value;
                      updateForm("metric", metric);
                      if (metric === "Disponibilidad" || metric === "Calidad del dataset") {
                        updateForm("unit", "%");
                      } else if (metric === "Errores de procesamiento") {
                        updateForm("unit", "errores");
                      } else {
                        updateForm("unit", "%");
                      }
                    }}
                  >
                    <option>Calidad del dataset</option>
                    <option>Disponibilidad</option>
                    <option>Errores de procesamiento</option>
                    <option>Error del modelo</option>
                    <option>Registros procesados</option>
                  </select>
                </label>

                <label>
                  Condición
                  <select
                    value={form.condition}
                    onChange={(event) =>
                      updateForm(
                        "condition",
                        event.target.value as RuleCondition,
                      )
                    }
                  >
                    <option value="mayor">Mayor que</option>
                    <option value="menor">Menor que</option>
                    <option value="igual">Igual a</option>
                  </select>
                </label>
              </div>

              <div className="rule-form-row">
                <label>
                  Umbral *
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(event) =>
                      updateForm("threshold", Number(event.target.value))
                    }
                    min={0}
                    max={form.unit === "%" ? 100 : undefined}
                    step="any"
                    required
                  />
                </label>

                <label>
                  Unidad
                  <select
                    value={form.unit}
                    onChange={(event) => updateForm("unit", event.target.value)}
                  >
                    <option value="%">Porcentaje (%)</option>
                    <option value="errores">Errores</option>
                    <option value="registros">Registros</option>
                  </select>
                </label>
              </div>

              <div className="rule-form-row">
                <label>
                  Prioridad
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      updateForm("priority", event.target.value as RulePriority)
                    }
                  >
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </label>

                <label>
                  Canal de notificación
                  <select
                    value={form.channel}
                    onChange={(event) => updateForm("channel", event.target.value)}
                  >
                    <option value="Panel interno">Panel interno</option>
                    <option value="Correo electrónico">Correo electrónico</option>
                    <option value="Webhook">Webhook</option>
                  </select>
                </label>
              </div>

              <label className="rule-enabled-checkbox">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(event) => updateForm("enabled", event.target.checked)}
                />
                Activar esta regla
              </label>

              {error && (
                <div className="rule-feedback rule-feedback-error" role="alert">
                  {error}
                </div>
              )}

              <div className="rule-form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  <Save size={16} />
                  {editingId ? "Guardar cambios" : "Crear regla"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
