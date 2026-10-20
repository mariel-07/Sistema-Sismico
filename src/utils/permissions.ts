export type UserRole =
  | "Administrador"
  | "Analista ML"
  | "Operador de Alertas"
  | "Operador de alertas"
  | "Auditor"
  | "Solo lectura";

export interface RoleInfo {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  persona: string;
  color: string;
  bgLight: string;
  borderColor: string;
  allowedModules: string[];
  capabilities: string[];
  restrictions: string[];
}

export const ROLES_CATALOG: Record<string, RoleInfo> = {
  Administrador: {
    id: "admin",
    name: "Administrador",
    shortName: "Admin",
    tagline: "Control total de la plataforma y gobernanza",
    description:
      "Máximo nivel de privilegio. Administra usuarios, configuraciones del sistema, reglas de alerta, fuentes y supervisa bitácoras de auditoría.",
    persona: "Responsables de TI, Seguridad de la Información y Jefes de Operaciones.",
    color: "#4f46e5",
    bgLight: "rgba(99, 102, 241, 0.12)",
    borderColor: "#6366f1",
    allowedModules: [
      "dashboard",
      "events",
      "map",
      "statistics",
      "sources",
      "datasets",
      "ml",
      "alerts",
      "reports",
      "admin",
      "audit",
      "settings",
      "help",
    ],
    capabilities: [
      "Crear, suspender y reasignar cuentas de usuarios",
      "Configurar parámetros globales de la plataforma",
      "Crear y activar reglas automáticas de alerta sísmica",
      "Gestionar fuentes de datos y conectores externos",
      "Auditar toda la trazabilidad y accesos del sistema",
    ],
    restrictions: ["Ninguna restricción de acceso."],
  },
  "Analista ML": {
    id: "analyst",
    name: "Analista ML",
    shortName: "Analista",
    tagline: "Modelado científico y analítica avanzada",
    description:
      "Especialista en ciencia de datos y sismología. Evalúa la calidad de datasets sísmicos, ejecuta análisis estadísticos y explora experimentos de Machine Learning.",
    persona: "Científicos de datos, sismólogos e investigadores analíticos.",
    color: "#0891b2",
    bgLight: "rgba(6, 182, 212, 0.12)",
    borderColor: "#06b6d4",
    allowedModules: [
      "dashboard",
      "events",
      "map",
      "statistics",
      "datasets",
      "ml",
      "reports",
      "help",
    ],
    capabilities: [
      "Inspeccionar y evaluar la calidad del catálogo sísmico",
      "Ejecutar análisis estadísticos descriptivos con filtros por magnitud",
      "Explorar modelos y métricas experimentales registradas",
      "Visualizar eventos en el mapa interactivo y estadísticas históricas",
      "Exportar resúmenes de calidad y analítica en CSV/Excel",
    ],
    restrictions: [
      "No puede modificar usuarios ni roles del sistema.",
      "No puede reconfigurar parámetros del sistema ni ver bitácoras de seguridad.",
    ],
  },
  "Operador de Alertas": {
    id: "operator",
    name: "Operador de Alertas",
    shortName: "Operador",
    tagline: "Vigilancia en tiempo real y triaje de emergencias",
    description:
      "Monitorea eventos sísmicos en tiempo real, verifica el estado de las alertas disparadas, gestiona el flujo de atención y configura reglas operativas de advertencia.",
    persona: "Operadores del Centro de Operaciones de Emergencia (COEN/INDECI) y despachadores.",
    color: "#d97706",
    bgLight: "rgba(245, 158, 11, 0.12)",
    borderColor: "#f59e0b",
    allowedModules: [
      "dashboard",
      "events",
      "map",
      "statistics",
      "alerts",
      "sources",
      "reports",
      "help",
    ],
    capabilities: [
      "Atender y marcar alertas como revisadas o atendidas",
      "Monitorear eventos sísmicos recientes y su visualización espacial",
      "Crear y activar reglas de alerta basadas en umbrales de magnitud y profundidad",
      "Supervisar el estado de sincronización del conector IGP",
    ],
    restrictions: [
      "No puede modificar la estructura de usuarios ni roles.",
      "No puede alterar configuraciones críticas del servidor.",
    ],
  },
  Auditor: {
    id: "auditor",
    name: "Auditor",
    shortName: "Auditor",
    tagline: "Cumplimiento normativo y trazabilidad forense",
    description:
      "Supervisa la bitácora completa de auditoría (quién hizo qué, cuándo y desde qué IP), verifica la integridad de los datos y genera informes de trazabilidad.",
    persona: "Oficiales de cumplimiento, auditores internos y evaluadores de control de calidad.",
    color: "#059669",
    bgLight: "rgba(16, 185, 129, 0.12)",
    borderColor: "#10b981",
    allowedModules: [
      "dashboard",
      "events",
      "map",
      "statistics",
      "audit",
      "sources",
      "datasets",
      "reports",
      "help",
    ],
    capabilities: [
      "Consultar la bitácora exhaustiva de eventos de auditoría y seguridad",
      "Revisar el historial de sincronizaciones y latencias de ingesta",
      "Inspeccionar registros de calidad y anomalías en datasets",
      "Exportar reportes de auditoría para auditorías externas",
    ],
    restrictions: [
      "Acceso de solo lectura sobre eventos, usuarios y reglas (no modifica datos).",
    ],
  },
  "Solo lectura": {
    id: "reader",
    name: "Solo lectura",
    shortName: "Consulta",
    tagline: "Consulta pública e informativa sin privilegios de edición",
    description:
      "Permite consultar el catálogo sísmico nacional, el mapa en vivo y los indicadores generales. Diseñado para clientes, observadores o público general.",
    persona: "Clientes externos, directivos observadores, estudiantes y público general.",
    color: "#64748b",
    bgLight: "rgba(100, 116, 139, 0.12)",
    borderColor: "#94a3b8",
    allowedModules: [
      "dashboard",
      "events",
      "map",
      "statistics",
      "reports",
      "help",
    ],
    capabilities: [
      "Consultar los más de 21,000 eventos sísmicos registrados",
      "Explorar el mapa interactivo en vivo con filtros por magnitud",
      "Revisar análisis estadísticos generales y curvas de actividad",
      "Consultar guías técnicas y documentación del sistema",
    ],
    restrictions: [
      "No puede crear, modificar ni eliminar ningún registro.",
      "No tiene acceso a administración de usuarios ni a bitácoras de auditoría.",
    ],
  },
};

export function normalizeRole(roleName?: string | null): string {
  if (!roleName) return "Solo lectura";
  const trimmed = roleName.trim().toLowerCase();
  if (trimmed.includes("admin")) return "Administrador";
  if (trimmed.includes("analis") || trimmed.includes("ml")) return "Analista ML";
  if (trimmed.includes("operador") || trimmed.includes("alerta")) return "Operador de Alertas";
  if (trimmed.includes("audit")) return "Auditor";
  return "Solo lectura";
}

export function getRoleInfo(roleName?: string | null): RoleInfo {
  const normalized = normalizeRole(roleName);
  return ROLES_CATALOG[normalized] || ROLES_CATALOG["Solo lectura"];
}

export function canAccessModule(roleName: string | undefined | null, module: string): boolean {
  const role = getRoleInfo(roleName);
  return role.allowedModules.includes(module.toLowerCase());
}

export function canManageUsers(roleName?: string | null): boolean {
  return normalizeRole(roleName) === "Administrador";
}

export function canManageRules(roleName?: string | null): boolean {
  const r = normalizeRole(roleName);
  return r === "Administrador" || r === "Operador de Alertas";
}

export function canViewAudit(roleName?: string | null): boolean {
  const r = normalizeRole(roleName);
  return r === "Administrador" || r === "Auditor";
}

export function canEditData(roleName?: string | null): boolean {
  const r = normalizeRole(roleName);
  return r === "Administrador" || r === "Operador de Alertas";
}

export function getRoleHomePath(roleName?: string | null): string {
  const r = normalizeRole(roleName);
  switch (r) {
    case "Analista ML":
      return "/datasets/quality";
    case "Operador de Alertas":
      return "/alerts";
    case "Auditor":
      return "/audit/logs";
    case "Solo lectura":
    case "Administrador":
    default:
      return "/dashboard";
  }
}


