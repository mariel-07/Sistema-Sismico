import { useState, useEffect, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../services/api/client";
import { checkDatabaseHealth } from "../services/api/database.api";
import { getRoleHomePath } from "../utils/permissions";
import "./login.css";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    checkDatabaseHealth()
      .then((data) => {
        if (active) setDbConnected(Boolean(data.connection));
      })
      .catch(() => {
        if (active) setDbConnected(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Si ya está autenticado, redirigir al módulo según su rol asignado
  if (isAuthenticated && user) {
    const defaultPath = getRoleHomePath(user.role);
    return <Navigate to={defaultPath} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const loggedUser = await login(email.trim(), password);

      // Determinar la ruta de destino según el rol asignado a la cuenta
      const stateFrom = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const targetDestination = stateFrom && stateFrom !== "/login"
        ? stateFrom
        : getRoleHomePath(loggedUser.role);

      navigate(targetDestination, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        {/* Enlace para volver a la Landing Page */}
        <div style={{ marginBottom: "1.25rem" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.84rem",
              color: "#94a3b8",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#2dd4bf")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
          >
            &larr; Volver a la p&aacute;gina principal
          </Link>
        </div>

        {/* Cabecera del formulario */}
        <header className="login-header">
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#22d3ee",
              fontWeight: 800,
              fontSize: "13px",
              letterSpacing: "0.2em",
              marginBottom: "0.5rem",
            }}
          >
            <Activity size={18} />
            <span>SEPMS PLATFORM</span>
          </div>

          <h1 className="login-title">Iniciar Sesión</h1>

          <p className="login-subtitle">
            Sistema Empresarial de Monitoreo y Predicción Sísmica
          </p>

          {/* Indicador de conexión con la BD */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
              marginTop: "0.75rem",
              backgroundColor:
                dbConnected === true
                  ? "rgba(16, 185, 129, 0.15)"
                  : dbConnected === false
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(148, 163, 184, 0.15)",
              color:
                dbConnected === true
                  ? "#34d399"
                  : dbConnected === false
                  ? "#f87171"
                  : "#94a3b8",
              border: `1px solid ${
                dbConnected === true
                  ? "rgba(16, 185, 129, 0.3)"
                  : dbConnected === false
                  ? "rgba(239, 68, 68, 0.3)"
                  : "rgba(148, 163, 184, 0.3)"
              }`,
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor:
                  dbConnected === true
                    ? "#34d399"
                    : dbConnected === false
                    ? "#f87171"
                    : "#94a3b8",
              }}
            />
            <span>
              {dbConnected === true
                ? "Base de datos conectada"
                : dbConnected === false
                ? "Servidor sin conexión"
                : "Verificando conexión..."}
            </span>
          </div>
        </header>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Correo institucional
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="login-input"
                placeholder="usuario@sepms.pe"
                disabled={submitting}
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="login-input"
                placeholder="Introduce tu contraseña"
                disabled={submitting}
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="login-error"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="login-button"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <ShieldCheck size={18} />
            <span>
              {submitting ? "Verificando cuenta..." : "Ingresar al Sistema"}
            </span>
          </button>
        </form>

        <p className="login-footer">
          El sistema adaptará automáticamente los módulos y herramientas según el
          rol asignado a tu cuenta.
        </p>
      </section>
    </main>
  );
}
