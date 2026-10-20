import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../services/api/client";
import "./login.css";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email.trim(), password);

      const destination = (location.state as { from?: string } | null)?.from;

      navigate(destination || "/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <header className="login-header">
          <p className="login-brand">SEPMS</p>

          <h1 className="login-title">
            Iniciar sesión
          </h1>

          <p className="login-subtitle">
            Sistema de monitoreo y análisis sísmico
          </p>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="login-input"
              placeholder="tu@correo.com"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="login-input"
              placeholder="Introduce tu contraseña"
            />
          </div>

          {error && (
            <p role="alert" className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="login-button"
          >
            {submitting ? "Verificando…" : "Entrar"}
          </button>
        </form>

        <p className="login-footer">
          Acceso exclusivo para usuarios autorizados.
        </p>
      </section>
    </main>
  );
}
