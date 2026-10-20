import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Shield,
  Layers,
  MapPin,
  Cpu,
  BellRing,
  Database,
  ArrowRight,
  TrendingUp,
  Radio,
  Server,
  CloudLightning,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { checkDatabaseHealth } from "../../services/api/database.api";
import heroImg from "../../assets/hero.png";
import "./landing.css";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const [lastCheck, setLastCheck] = useState<string>("");

  useEffect(() => {
    let active = true;
    checkDatabaseHealth()
      .then((res) => {
        if (!active) return;
        setBackendStatus(res.connection ? "online" : "offline");
        setLastCheck(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
      })
      .catch(() => {
        if (!active) return;
        setBackendStatus("offline");
        setLastCheck(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="landing-container">
      <div className="landing-bg-overlay" />

      {/* HEADER / NAVBAR */}
      <header className="landing-navbar">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-logo">
            <Activity size={24} />
          </div>
          <div>
            <div className="landing-brand-title">SEPMS</div>
            <div className="landing-brand-subtitle">Centro Sismológico Nacional</div>
          </div>
        </Link>

        <nav className="landing-nav-links">
          <a href="#hero" className="landing-nav-link">Inicio</a>
          <a href="#caracteristicas" className="landing-nav-link">Capacidades</a>
          <a href="#geodinamica" className="landing-nav-link">Geodinámica Perú</a>
          <a href="#arquitectura" className="landing-nav-link">Arquitectura Cloud</a>
        </nav>

        <div className="landing-nav-actions">
          <div className="landing-status-badge">
            <span
              className="landing-status-dot"
              style={{
                backgroundColor: backendStatus === "online" ? "#10b981" : backendStatus === "offline" ? "#ef4444" : "#f59e0b",
                boxShadow: backendStatus === "online" ? "0 0 8px #10b981" : undefined,
              }}
            />
            <span>
              {backendStatus === "online"
                ? `Render API Online (${lastCheck})`
                : backendStatus === "offline"
                ? "Servicio Inactivo"
                : "Conectando..."}
            </span>
          </div>

          {isAuthenticated ? (
            <Link to="/dashboard" className="landing-btn landing-btn-primary">
              <span>Ir al Panel</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/login" className="landing-btn landing-btn-primary">
              <span>Iniciar Sesión</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="landing-hero">
        <div>
          <div className="landing-hero-tag">
            <Radio size={14} />
            <span>Vigilancia Geodinámica y Red Sísmica Nacional</span>
          </div>

          <h1 className="landing-hero-title">
            Plataforma Integral de <span className="landing-hero-title-gradient">Monitoreo Sísmico</span> y Alerta Temprana
          </h1>

          <p className="landing-hero-desc">
            Supervisión continua de hipocentros, análisis acelerométrico en tiempo real, 
            modelos predictivos con Machine Learning y auditoría operacional georreferenciada 
            en todo el territorio de la República del Perú.
          </p>

          <div className="landing-hero-ctas">
            <Link to="/login" className="landing-btn landing-btn-primary" style={{ padding: "0.8rem 1.6rem", fontSize: "1rem" }}>
              <span>{isAuthenticated ? "Acceder al Dashboard" : "Acceder a la Plataforma"}</span>
              <ArrowRight size={18} />
            </Link>

            <a href="#caracteristicas" className="landing-btn landing-btn-outline" style={{ padding: "0.8rem 1.4rem" }}>
              <span>Conocer Capacidades</span>
              <ChevronRight size={18} />
            </a>
          </div>

          <div className="landing-hero-stats">
            <div>
              <div className="landing-stat-number">+21,000</div>
              <div className="landing-stat-label">Sismos del Catálogo IGP</div>
            </div>
            <div>
              <div className="landing-stat-number">24</div>
              <div className="landing-stat-label">Departamentos Monitoreados</div>
            </div>
            <div>
              <div className="landing-stat-number">&lt; 15s</div>
              <div className="landing-stat-label">Latencia en Detección</div>
            </div>
            <div>
              <div className="landing-stat-number">99.8%</div>
              <div className="landing-stat-label">Disponibilidad en Servidor</div>
            </div>
          </div>
        </div>

        {/* HERO PREVIEW CARD */}
        <div className="landing-hero-preview">
          <div className="landing-preview-header">
            <div className="landing-preview-dots">
              <span />
              <span />
              <span />
            </div>
            <div className="landing-preview-title">
              <CloudLightning size={14} color="#2dd4bf" />
              <span>SEPMS Geospatial Live Console</span>
            </div>
          </div>

          <img
            src={heroImg}
            alt="Interfaz de Monitoreo Sísmico SEPMS"
            className="landing-preview-img"
          />

          <div className="landing-preview-body">
            <div className="landing-preview-metric">
              <span className="landing-preview-metric-label">
                <Radio size={14} color="#38bdf8" />
                <span>Enlace Backend Cloud (Render)</span>
              </span>
              <span className="landing-preview-metric-value">sistema-sismico-vg5i.onrender.com</span>
            </div>

            <div className="landing-preview-metric">
              <span className="landing-preview-metric-label">
                <MapPin size={14} color="#2dd4bf" />
                <span>Geotrazabilidad de Operadores</span>
              </span>
              <span className="landing-preview-metric-value">Auditoría Geográfica Activa</span>
            </div>

            <div className="landing-preview-metric">
              <span className="landing-preview-metric-label">
                <Cpu size={14} color="#a855f7" />
                <span>Modelos de Predicción ML</span>
              </span>
              <span className="landing-preview-metric-value">Random Forest & XGBoost</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES */}
      <section id="caracteristicas" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge">Módulos Especializados</span>
          <h2 className="landing-section-title">Ingeniería sísmica y analítica avanzada</h2>
          <p className="landing-section-desc">
            Diseñado para sismólogos, analistas de riesgo de desastres y personal de operaciones de emergencia.
          </p>
        </div>

        <div className="landing-grid-4">
          <div className="landing-card">
            <div className="landing-card-icon">
              <Layers size={24} />
            </div>
            <h3 className="landing-card-title">Mapa Sísmico en Vivo</h3>
            <p className="landing-card-text">
              Cartografía interactiva con Leaflet que ubica epicentros, magnitudes Mw, 
              profundidad hipocentral y rangos temporales en toda la costa, sierra y selva.
            </p>
            <Link to="/login" className="landing-card-link">
              <span>Explorar mapa</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="landing-card">
            <div className="landing-card-icon">
              <Cpu size={24} />
            </div>
            <h3 className="landing-card-title">Machine Learning Sísmico</h3>
            <p className="landing-card-text">
              Entrenamiento y evaluación de modelos probabilísticos para estimar aceleraciones 
              pico del suelo (PGA), recurrencia sísmica y patrones anómalos.
            </p>
            <Link to="/login" className="landing-card-link">
              <span>Ver experimentos</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="landing-card">
            <div className="landing-card-icon">
              <BellRing size={24} />
            </div>
            <h3 className="landing-card-title">Alertas Automatizadas</h3>
            <p className="landing-card-text">
              Configuración de reglas basadas en umbrales de magnitud e hipocentro superficial 
              con clasificación de severidad crítica, alta, media y baja.
            </p>
            <Link to="/login" className="landing-card-link">
              <span>Reglas de alerta</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="landing-card">
            <div className="landing-card-icon">
              <Shield size={24} />
            </div>
            <h3 className="landing-card-title">Auditoría Geolocalizada</h3>
            <p className="landing-card-text">
              Trazabilidad rigurosa que mapea exclusivamente los lugares y sedes reales desde 
              donde los operadores y administradores inician sesión en la plataforma.
            </p>
            <Link to="/login" className="landing-card-link">
              <span>Bitácora de accesos</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* SEISMIC CONTEXT OF PERU */}
      <section id="geodinamica" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge">Contexto Tectónico</span>
          <h2 className="landing-section-title">El Perú en el Cinturón de Fuego del Pacífico</h2>
          <p className="landing-section-desc">
            Comprender la dinámica geológica es vital para mitigar riesgos ante eventos de gran escala.
          </p>
        </div>

        <div className="landing-grid-3">
          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" }}>
              <TrendingUp size={24} />
            </div>
            <h3 className="landing-card-title">Subducción de la Placa de Nazca</h3>
            <p className="landing-card-text">
              La Placa de Nazca se introduce bajo la Placa Sudamericana a una velocidad aproximada 
              de 6 a 7 cm por año, acumulando esfuerzo elástico causante de los sismos más destructivos en la costa.
            </p>
          </div>

          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b" }}>
              <Activity size={24} />
            </div>
            <h3 className="landing-card-title">Sismicidad Cortical Intraplaca</h3>
            <p className="landing-card-text">
              Fallas activas continentales en la Cordillera de los Andes y la faja subandina (ej. Tambomachay, 
              Huaytapallana) que originan eventos focales superficiales de alto impacto local.
            </p>
          </div>

          <div className="landing-card">
            <div className="landing-card-icon" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>
              <Sparkles size={24} />
            </div>
            <h3 className="landing-card-title">Silencio Sísmico y Acoplamiento</h3>
            <p className="landing-card-text">
              Zonas de alto acoplamiento sismogénico en la Costa Central (Lima) y Sur (Moquegua-Tacna) 
              son vigiladas permanentemente como áreas con potencial de ruptura de magnitud &ge; 8.0 Mw.
            </p>
          </div>
        </div>
      </section>

      {/* ARCHITECTURE & CLOUD CONNECTIVITY */}
      <section id="arquitectura" className="landing-section">
        <div className="landing-arch-box">
          <div>
            <span className="landing-arch-badge">
              <Server size={14} />
              <span>Infraestructura Cloud Distribuida</span>
            </span>

            <h2 className="landing-arch-title">Despliegue de Alta Disponibilidad: Render + Vercel</h2>

            <p className="landing-arch-text">
              La plataforma SEPMS está optimizada para ejecutarse en entornos en la nube modernos: 
              el frontend React se aloja en <strong>Vercel Edge Network</strong> para máxima velocidad global, 
              mientras que la API FastAPI y la base de datos PostgreSQL operan en <strong>Render Cloud</strong>.
            </p>

            <div className="landing-arch-pills">
              <div className="landing-arch-pill">
                <Database size={15} color="#2dd4bf" />
                <span>Backend: <strong>Render (FastAPI)</strong></span>
              </div>
              <div className="landing-arch-pill">
                <CloudLightning size={15} color="#38bdf8" />
                <span>Frontend: <strong>Vercel SPA</strong></span>
              </div>
              <div className="landing-arch-pill">
                <Shield size={15} color="#a855f7" />
                <span>Seguridad: <strong>JWT + RBAC</strong></span>
              </div>
              <div className="landing-arch-pill">
                <MapPin size={15} color="#f59e0b" />
                <span>Auditoría: <strong>Geolocalización IP/GPS</strong></span>
              </div>
            </div>
          </div>

          <div className="landing-card" style={{ background: "rgba(11, 19, 32, 0.7)", border: "1px solid rgba(45, 212, 191, 0.2)" }}>
            <h3 style={{ fontSize: "1.1rem", color: "#ffffff", marginBottom: "1rem" }}>
              Detalles del Enlace Operativo
            </h3>

            <div style={{ display: "grid", gap: "0.85rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>Servidor Render:</span>
                <span style={{ color: "#5eead4", fontWeight: "600" }}>sistema-sismico-vg5i.onrender.com</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>Prefijo API:</span>
                <span style={{ color: "#cbd5e1" }}>/api/v1</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>CORS Origin:</span>
                <span style={{ color: "#cbd5e1" }}>Habilitado para dominios Vercel</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8" }}>Protocolo:</span>
                <span style={{ color: "#10b981", fontWeight: "600" }}>HTTPS / SSL Seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* FINAL CALL TO ACTION */}
        <div className="landing-cta-banner">
          <h2 className="landing-cta-title">¿Listo para acceder al Centro Sismológico?</h2>
          <p className="landing-cta-subtitle">
            Ingresa al sistema con tu cuenta para visualizar mapas en tiempo real, 
            generar alertas o realizar análisis predictivos de sismos.
          </p>
          <Link to="/login" className="landing-btn landing-btn-primary" style={{ padding: "0.85rem 2rem", fontSize: "1.05rem" }}>
            <span>{isAuthenticated ? "Abrir Panel de Control" : "Iniciar Sesión en SEPMS"}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-brand">
              <div className="landing-brand-logo" style={{ width: 36, height: 36 }}>
                <Activity size={20} />
              </div>
              <div>
                <div className="landing-brand-title" style={{ fontSize: "1rem" }}>SEPMS</div>
                <div className="landing-brand-subtitle">Centro Sismológico</div>
              </div>
            </div>
            <p>
              Sistema Empresarial de Predicción y Monitoreo Sísmico para el análisis geofísico, 
              gestión del riesgo y emisión de alertas tempranas en el Perú.
            </p>
          </div>

          <div className="landing-footer-col">
            <h4>Módulos</h4>
            <ul>
              <li><Link to="/login">Eventos Sísmicos</Link></li>
              <li><Link to="/login">Mapa Interactivo</Link></li>
              <li><Link to="/login">Modelos ML</Link></li>
              <li><Link to="/login">Auditoría Geográfica</Link></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h4>Infraestructura</h4>
            <ul>
              <li><a href="https://sistema-sismico-vg5i.onrender.com/api/v1/status" target="_blank" rel="noreferrer">Estado de la API</a></li>
              <li><a href="#arquitectura">Enlace Render Cloud</a></li>
              <li><a href="#arquitectura">Despliegue Vercel</a></li>
            </ul>
          </div>

          <div className="landing-footer-col">
            <h4>Emergencias Perú</h4>
            <ul>
              <li><strong style={{ color: "#ef4444" }}>119</strong> - Mensajería de Emergencia</li>
              <li><strong style={{ color: "#38bdf8" }}>115</strong> - INDECI Defensa Civil</li>
              <li><strong style={{ color: "#f59e0b" }}>105</strong> - Central Policial</li>
            </ul>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} SEPMS - Sistema de Monitoreo Sísmico. Todos los derechos reservados.</span>
          <span>Versión 2.0.0 | Desplegado en Vercel & Render</span>
        </div>
      </footer>
    </div>
  );
}

