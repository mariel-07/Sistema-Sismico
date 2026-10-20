
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Menu,
  LogOut,
  Search,
  ShieldCheck,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [search, setSearch] = useState("");
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const today = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

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
          <strong>Panel de control</strong>
        </div>
      </div>

      <div className="topbar-actions">
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
          aria-label="Notificaciones"
          title="Notificaciones"
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

        <div className="profile">
          <div className="profile-avatar">
            <ShieldCheck size={21} />
          </div>
          <div className="profile-info">
            <strong>Administrador</strong>
            <span>Acceso de demostración</span>
          </div>
        </div>
      </div>
    </header>
  );
}
