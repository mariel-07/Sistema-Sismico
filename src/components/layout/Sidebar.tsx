import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  BellRing,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Database,
  FileChartColumn,
  FileClock,
  FileText,
  Globe,
  Lock,
  MapPin,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { canAccessModule, getRoleInfo, normalizeRole } from "../../utils/permissions";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface MenuSection {
  id: string;
  title: string;
  icon: LucideIcon;
  items: MenuItem[];
}

const sections: MenuSection[] = [
  {
    id: "monitoring",
    title: "MONITOREO SÍSMICO",
    icon: Globe,
    items: [
      {
        label: "Panel de Control",
        path: "/dashboard",
        icon: Activity,
      },
      {
        label: "Eventos Recientes",
        path: "/events",
        icon: FileText,
      },
      {
        label: "Mapa en Vivo",
        path: "/map",
        icon: MapPin,
      },
      {
        label: "Análisis Estadístico",
        path: "/statistics",
        icon: Activity,
      },
    ],
  },
  {
    id: "ml",
    title: "PREDICCIÓN Y ANALÍTICA ML",
    icon: BrainCircuit,
    items: [
      {
        label: "Preparación de Datos",
        path: "/datasets/quality",
        icon: Database,
      },
      {
        label: "Modelos de Machine Learning",
        path: "/ml/models",
        icon: BrainCircuit,
      },
      {
        label: "Experimentos ML",
        path: "/ml/experiments",
        icon: Activity,
      },
    ],
  },
  {
    id: "alerts",
    title: "ALERTAS RESPONSABLES",
    icon: BellRing,
    items: [
      {
        label: "Centro de Alertas",
        path: "/alerts",
        icon: BellRing,
      },
      {
        label: "Reglas de Alertas",
        path: "/alerts/rules",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "sources",
    title: "FUENTES DE DATOS",
    icon: Database,
    items: [
      {
        label: "Conectores Externos",
        path: "/sources",
        icon: Globe,
      },
      {
        label: "Historial de Sincronizaciones",
        path: "/sources/history",
        icon: FileClock,
      },
    ],
  },
  {
    id: "reports",
    title: "REPORTES EMPRESARIALES",
    icon: FileChartColumn,
    items: [
      {
        label: "Generar Reportes",
        path: "/reports",
        icon: FileText,
      },
      {
        label: "Exportaciones",
        path: "/reports/exports",
        icon: FileChartColumn,
      },
    ],
  },
  {
    id: "admin",
    title: "ADMINISTRACIÓN",
    icon: Users,
    items: [
      {
        label: "Usuarios",
        path: "/admin/users",
        icon: Users,
      },
      {
        label: "Roles y Permisos",
        path: "/admin/roles",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "settings",
    title: "CONFIGURACIÓN",
    icon: Settings,
    items: [
      {
        label: "Parámetros del Sistema",
        path: "/settings",
        icon: Settings,
      },
      {
        label: "Bitácora de Auditoría",
        path: "/audit/logs",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "help",
    title: "AYUDA Y SOPORTE",
    icon: CircleHelp,
    items: [
      {
        label: "Guías Técnicas",
        path: "/help/guides",
        icon: BookOpen,
      },
      {
        label: "Centro de Ayuda",
        path: "/help",
        icon: CircleHelp,
      },
    ],
  },
];

function findActiveSection(pathname: string): string | null {
  for (const section of sections) {
    const hasMatch = section.items.some(
      (item) =>
        pathname === item.path ||
        (item.path !== "/" && pathname.startsWith(`${item.path}/`)),
    );

    if (hasMatch) {
      return section.id;
    }
  }

  return null;
}

export default function Sidebar({
  mobileOpen,
  onClose,
  collapsed,
  onToggle,
}: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const currentRole = normalizeRole(user?.role);
  const roleInfo = getRoleInfo(currentRole);

  const [openSection, setOpenSection] = useState<string | null>(
    () => findActiveSection(location.pathname) ?? "monitoring",
  );

  useEffect(() => {
    const activeSection = findActiveSection(location.pathname);
    if (activeSection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenSection(activeSection);
    }
  }, [location.pathname]);

  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  function handleSectionClick(sectionId: string) {
    if (collapsed) {
      onToggle();
      setOpenSection(sectionId);
      return;
    }

    setOpenSection((current) => (current === sectionId ? null : sectionId));
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú de navegación"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "sidebar",
          collapsed ? "sidebar-collapsed" : "",
          mobileOpen ? "sidebar-mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Barra lateral de navegación SEPMS"
      >
        {/* Marca */}
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Activity size={25} strokeWidth={2} />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <strong>SEPMS</strong>
              <span>MONITOREO SÍSMICO</span>
            </div>
          )}

          <button
            type="button"
            className="sidebar-close mobile-only"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Estado del sistema con rol activo */}
        <div
          className="sidebar-status"
          title={`Rol activo: ${currentRole} — ${roleInfo.tagline}`}
        >
          <span
            className="status-dot"
            style={{ backgroundColor: roleInfo.color }}
          />

          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>
                {roleInfo.shortName} ({currentRole})
              </span>
            </div>
          )}
        </div>

        {/* Navegación según el rol asignado */}
        <nav className="sidebar-navigation" aria-label="Navegación principal">
          {sections
            .filter((section) => {
              if (currentRole === "Administrador") return true;
              return canAccessModule(currentRole, section.id);
            })
            .map((section) => {
              const SectionIcon = section.icon;
              const isOpen = openSection === section.id;
            const isAllowed = canAccessModule(currentRole, section.id);

            const hasActiveItem = section.items.some(
              (item) =>
                location.pathname === item.path ||
                (item.path !== "/" &&
                  location.pathname.startsWith(`${item.path}/`)),
            );

            return (
              <div className="sidebar-section" key={section.id}>
                <button
                  type="button"
                  className={[
                    "sidebar-section-toggle",
                    hasActiveItem ? "section-has-active" : "",
                    isOpen ? "section-expanded" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSectionClick(section.id)}
                  aria-expanded={!collapsed && isOpen}
                  title={
                    collapsed
                      ? `${section.title}${!isAllowed ? " (Restringido)" : ""}`
                      : undefined
                  }
                  style={{
                    opacity: isAllowed ? 1 : 0.65,
                  }}
                >
                  <SectionIcon
                    className="sidebar-section-icon"
                    size={19}
                    strokeWidth={1.9}
                  />

                  {!collapsed && (
                    <>
                      <span className="sidebar-section-label">
                        {section.title}
                      </span>

                      {!isAllowed && (
                        <span
                          title="Módulo con acceso restringido para tu rol"
                          style={{
                            marginRight: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          <Lock size={12} style={{ color: "#94a3b8" }} />
                        </span>
                      )}

                      <ChevronDown
                        size={15}
                        className={[
                          "section-chevron",
                          isOpen ? "chevron-open" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="sidebar-submenu">
                    {section.items.map((item) => {
                      const ItemIcon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end
                          onClick={onClose}
                          className={({ isActive }) =>
                            [
                              "sidebar-submenu-link",
                              isActive ? "sidebar-submenu-link-active" : "",
                            ]
                              .filter(Boolean)
                              .join(" ")
                          }
                        >
                          <ItemIcon
                            size={17}
                            strokeWidth={1.8}
                            className="submenu-icon"
                          />

                          <span>{item.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Pie del Sidebar con información de versión y perfil */}
        <div className="sidebar-footer">
          <div
            className="sidebar-footer-icon"
            style={{ color: roleInfo.color }}
          >
            <ShieldCheck size={20} strokeWidth={1.9} />
          </div>

          {!collapsed && (
            <div className="sidebar-footer-info">
              <strong>SEPMS Enterprise v2.0</strong>
              <span title={roleInfo.persona} style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                {roleInfo.tagline}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
