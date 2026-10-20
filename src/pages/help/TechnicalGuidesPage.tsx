import {
  Activity,
  AlertTriangle,
  BookOpen,
  BrainCircuit,
  Database,
  FileChartColumn,
  FileText,
  Map,
  Server,
  ShieldCheck,
  Users,
} from "lucide-react";

import "./help.css";

interface Guide {
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  topics: string[];
}

const guides: Guide[] = [
  {
    title: "Arquitectura del sistema SEPMS",
    description:
      "Descripción general de la arquitectura frontend, backend, API y base de datos.",
    category: "Arquitectura",
    icon: Server,
    topics: [
      "Arquitectura general",
      "Comunicación frontend-backend",
      "API REST",
      "Base de datos PostgreSQL",
    ],
  },
  {
    title: "Monitoreo de eventos sísmicos",
    description:
      "Guía técnica para la consulta, visualización y análisis de eventos sísmicos.",
    category: "Monitoreo",
    icon: Activity,
    topics: [
      "Eventos sísmicos",
      "Magnitud",
      "Profundidad",
      "Coordenadas geográficas",
    ],
  },
  {
    title: "Mapa sísmico en vivo",
    description:
      "Documentación técnica del módulo de visualización geográfica.",
    category: "Monitoreo",
    icon: Map,
    topics: [
      "Visualización geográfica",
      "Marcadores sísmicos",
      "Coordenadas",
      "Actualización de eventos",
    ],
  },
  {
    title: "Fuentes y sincronización de datos",
    description:
      "Procedimientos técnicos para gestionar fuentes externas y sincronizaciones.",
    category: "Datos",
    icon: Database,
    topics: [
      "Fuentes externas",
      "Importación de datos",
      "Sincronización",
      "Historial de sincronizaciones",
    ],
  },
  {
    title: "Calidad de datasets",
    description:
      "Criterios utilizados para evaluar la calidad de los datos sísmicos.",
    category: "Datos",
    icon: FileText,
    topics: [
      "Completitud",
      "Consistencia",
      "Duplicados",
      "Valores inválidos",
    ],
  },
  {
    title: "Machine Learning",
    description:
      "Guía técnica de modelos, experimentos y análisis predictivo.",
    category: "Analítica",
    icon: BrainCircuit,
    topics: [
      "Preparación de datos",
      "Experimentos",
      "Modelos",
      "Métricas de evaluación",
    ],
  },
  {
    title: "Sistema de alertas",
    description:
      "Funcionamiento técnico del sistema de alertas y sus reglas.",
    category: "Alertas",
    icon: AlertTriangle,
    topics: [
      "Reglas de alerta",
      "Condiciones",
      "Estados",
      "Trazabilidad",
    ],
  },
  {
    title: "Reportes y exportaciones",
    description:
      "Procedimientos para generar reportes y exportar información.",
    category: "Reportes",
    icon: FileChartColumn,
    topics: [
      "Generación de reportes",
      "Exportación",
      "Formatos",
      "Descarga de información",
    ],
  },
  {
    title: "Administración y permisos",
    description:
      "Documentación técnica de usuarios, roles y control de acceso.",
    category: "Administración",
    icon: Users,
    topics: [
      "Usuarios",
      "Roles",
      "Permisos",
      "Control de acceso",
    ],
  },
  {
    title: "Auditoría y seguridad",
    description:
      "Guía para la trazabilidad de las operaciones realizadas en el sistema.",
    category: "Seguridad",
    icon: ShieldCheck,
    topics: [
      "Bitácora",
      "Eventos auditables",
      "Trazabilidad",
      "Seguridad",
    ],
  },
];

export default function TechnicalGuidesPage() {
  return (
    <div className="help-page">
      <header className="help-hero">
        <div className="help-hero-icon">
          <BookOpen size={32} />
        </div>

        <div>
          <span className="help-eyebrow">
            AYUDA Y SOPORTE
          </span>

          <h1>Guías Técnicas</h1>

          <p>
            Documentación técnica de los módulos y procesos
            principales de la plataforma SEPMS.
          </p>
        </div>
      </header>

      <section className="help-section">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">
              DOCUMENTACIÓN
            </span>

            <h2>Manuales técnicos</h2>

            <p>
              Selecciona un módulo para consultar sus
              principales aspectos técnicos.
            </p>
          </div>
        </div>

        <div className="help-guide-grid">
          {guides.map((guide) => {
            const GuideIcon = guide.icon;

            return (
              <article
                className="help-guide-card"
                key={guide.title}
              >
                <div className="help-guide-top">
                  <div className="help-topic-icon">
                    <GuideIcon size={24} />
                  </div>

                  <span className="help-topic-category">
                    {guide.category}
                  </span>
                </div>

                <h3>{guide.title}</h3>

                <p>{guide.description}</p>

                <div className="help-guide-topics">
                  {guide.topics.map((topic) => (
                    <span key={topic}>
                      {topic}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="help-guide-button"
                >
                  <BookOpen size={17} />
                  Consultar guía
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="help-info-panel">
        <div className="help-info-icon">
          <BookOpen size={24} />
        </div>

        <div>
          <h2>Documentación SEPMS</h2>

          <p>
            Estas guías sirven como referencia para comprender
            la estructura, funcionamiento y operación de la
            plataforma de monitoreo sísmico.
          </p>
        </div>
      </section>
    </div>
  );
}
