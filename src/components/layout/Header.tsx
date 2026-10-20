import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Menu,
  LogOut,
  Search,
  ShieldCheck,
  BrainCircuit,
  BellRing,
  ClipboardList,
  Eye,
  RefreshCw,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import { checkDatabaseHealth, type DatabaseHealth } from "../../services/api/database.api";
import { getRoleInfo, normalizeRole } from "../../utils/permissions";

interface HeaderProps {
  onMenuClick: () => void;
}

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Panel de Control",
  "/events": "Eventos Recientes",
  "/map": "Mapa en Vivo",
  "/statistics": "Análisis Estadístico",
  "/sources": "Conectores Externos",
  "/sources/history": "Historial de Sincronizaciones",
  "/datasets/quality": "Preparación de Datos",
  "/ml/experiments": "Experimentos ML",
  "/ml/models": "Registro de Modelos ML",
  "/alerts": "Centro de Alertas",
  "/alerts/rules": "Reglas de Alertas",
  "/reports": "Generar Reportes",
  "/reports/exports": "Exportaciones",
  "/audit/logs": "Bitácora de Auditoría",
  "/admin/users": "Gestión de Usuarios",
  "/admin/roles": "Roles y Permisos",
  "/settings": "Parámetros del Sistema",
  "/help/guides": "Guías Técnicas",
  "/help": "Centro de Ayuda",
};

export default function Header({ onMenuClick }: HeaderProps) {
  const [search, setSearch] = useState("");
  const [dbHealth, setDbHealth] = useState<DatabaseHealth | null>(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = normalizeRole(auth?.user?.role);
  const roleInfo = getRoleInfo(currentRole);

  const currentTitle = ROUTE_NAMES[location.pathname] || "Monitoreo Sísmico";

  const today = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  async function refreshDbHealth() {
    setCheckingDb(true);
    try {
      const data = await checkDatabaseHealth();
      setDbHealth(data);
    } catch {
      setDbHealth({ status: "error", database: "PostgreSQL - Supabase", connection: false });
    } finally {
      setCheckingDb(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshDbHealth();
    const interval = window.setInterval(refreshDbHealth, 45000);
    return () => clearInterval(interval);
  }, []);

  function getRoleIcon(role: string) {
    switch (role) {
      case "Administrador":
        return <ShieldCheck size={18} />;
      case "Analista ML":
        return <BrainCircuit size={18} />;
      case "Operador de Alertas":
        return <BellRing size={18} />;
      case "Auditor":
        return <ClipboardList size={18} />;
      default:
        return <Eye size={18} />;
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="icon-button mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>

        <div className="breadcrumb">
          <span>SEPMS</span>
          <span className="breadcrumb-separator">/</span>
          <strong>{currentTitle}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Indicador de conexión a Base de Datos */}
        <div
          title={
            dbHealth?.connection
              ? "Base de datos Supabase (PostgreSQL) conectada y operativa"
              : "Sin conexión con PostgreSQL Supabase"
          }
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.3rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            backgroundColor: dbHealth?.connection
              ? "rgba(16, 185, 129, 0.12)"
              : "rgba(239, 68, 68, 0.12)",
            color: dbHealth?.connection ? "#059669" : "#dc2626",
            border: `1px solid ${
              dbHealth?.connection
                ? "rgba(16, 185, 129, 0.25)"
                : "rgba(239, 68, 68, 0.25)"
            }`,
            cursor: "pointer",
          }}
          onClick={refreshDbHealth}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: dbHealth?.connection ? "#10b981" : "#ef4444",
              display: "inline-block",
              boxShadow: dbHealth?.connection
                ? "0 0 6px rgba(16, 185, 129, 0.6)"
                : "0 0 6px rgba(239, 68, 68, 0.6)",
            }}
          />
          <span>{dbHealth?.connection ? "BD Conectada" : "BD Desconectada"}</span>
          <RefreshCw
            size={12}
            style={{
              animation: checkingDb ? "spin 1s linear infinite" : "none",
              opacity: 0.7,
            }}
          />
        </div>

        <label className="topbar-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar en la plataforma..."
            aria-label="Buscar"
          />
          {search && (
            <button
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </label>

        <div className="topbar-date">
          <CalendarDays size={17} />
          <span>{today}</span>
        </div>

        <button
          className="icon-button notification-button"
          aria-label="Centro de alertas"
          title="Centro de alertas"
          onClick={() => navigate("/alerts")}
        >
          <Bell size={20} />
          <span className="notification-indicator" />
        </button>

        <button
          className="icon-button"
          type="button"
          onClick={() => {
            auth?.logout();
            navigate("/login", { replace: true });
          }}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>

        <div className="profile-divider" />

        {/* Perfil del usuario autenticado según su cuenta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            padding: "0.25rem 0.5rem",
          }}
        >
          <div
            className="profile-avatar"
            style={{
              backgroundColor: roleInfo.bgLight,
              color: roleInfo.color,
              border: `1px solid ${roleInfo.borderColor}`,
              width: "36px",
              height: "36px",
              borderRadius: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getRoleIcon(currentRole)}
          </div>

          <div className="profile-info" style={{ display: "flex", flexDirection: "column" }}>
            <strong style={{ fontSize: "0.85rem", color: "var(--text-primary, #0f172a)" }}>
              {auth?.user?.name || "Usuario"}
            </strong>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: roleInfo.color,
              }}
            >
              {currentRole}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
