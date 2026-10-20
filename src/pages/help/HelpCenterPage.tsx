import {
  AlertTriangle,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Database,
  FileText,
  Map,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

import "./help.css";

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  articles: string[];
}

const helpTopics: HelpTopic[] = [
  {
    id: "monitoring",
    title: "Monitoreo sísmico",
    description:
      "Consulta información sobre eventos sísmicos, mapas y análisis estadístico.",
    icon: Map,
    category: "Monitoreo",
    articles: [
      "¿Cómo consultar eventos sísmicos?",
      "¿Cómo utilizar el mapa en vivo?",
      "¿Cómo interpretar la información de un evento?",
      "¿Cómo consultar el análisis estadístico?",
    ],
  },
  {
    id: "sources",
    title: "Fuentes de datos",
    description:
      "Información sobre conectores, fuentes externas y sincronización de datos.",
    icon: Database,
    category: "Datos",
    articles: [
      "¿Cómo registrar una fuente de datos?",
      "¿Cómo consultar las fuentes disponibles?",
      "¿Cómo revisar el historial de sincronizaciones?",
      "¿Qué ocurre cuando una sincronización falla?",
    ],
  },
  {
    id: "datasets",
    title: "Datasets",
    description:
      "Ayuda para consultar y revisar la calidad de los conjuntos de datos.",
    icon: FileText,
    category: "Datos",
    articles: [
      "¿Cómo consultar un dataset?",
      "¿Cómo revisar la calidad de los datos?",
      "¿Qué significan las métricas de calidad?",
      "¿Cómo detectar datos incompletos?",
    ],
  },
  {
    id: "alerts",
    title: "Sistema de alertas",
    description:
      "Consulta el funcionamiento del centro de alertas y sus reglas.",
    icon: AlertTriangle,
    category: "Alertas",
    articles: [
      "¿Cómo consultar una alerta?",
      "¿Cómo funcionan las reglas de alerta?",
      "¿Qué estados puede tener una alerta?",
      "¿Cómo revisar el historial de alertas?",
    ],
  },
  {
    id: "ml",
    title: "Machine Learning",
    description:
      "Información sobre modelos, experimentos y procesos de análisis predictivo.",
    icon: Settings,
    category: "Analítica",
    articles: [
      "¿Qué es un experimento ML?",
      "¿Cómo consultar los modelos disponibles?",
      "¿Cómo revisar un experimento?",
      "¿Cómo interpretar los resultados de un modelo?",
    ],
  },
  {
    id: "reports",
    title: "Reportes y exportaciones",
    description:
      "Ayuda para generar reportes y exportar información del sistema.",
    icon: BookOpen,
    category: "Reportes",
    articles: [
      "¿Cómo generar un reporte?",
      "¿Cómo exportar información?",
      "¿Qué formatos de exportación están disponibles?",
      "¿Cómo consultar reportes generados?",
    ],
  },
  {
    id: "administration",
    title: "Administración",
    description:
      "Información sobre usuarios, roles y permisos del sistema.",
    icon: Users,
    category: "Administración",
    articles: [
      "¿Cómo gestionar usuarios?",
      "¿Cómo funcionan los roles?",
      "¿Cómo asignar permisos?",
      "¿Cómo desactivar un usuario?",
    ],
  },
  {
    id: "audit",
    title: "Auditoría y seguridad",
    description:
      "Consulta información sobre trazabilidad, bitácora y seguridad.",
    icon: ShieldCheck,
    category: "Seguridad",
    articles: [
      "¿Qué registra la bitácora de auditoría?",
      "¿Cómo consultar los registros?",
      "¿Qué acciones quedan registradas?",
      "¿Cómo interpretar un registro de auditoría?",
    ],
  },
];

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] =
    useState<HelpTopic | null>(null);

  const filteredTopics = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return helpTopics;
    }

    return helpTopics.filter((topic) => {
      const content = [
        topic.title,
        topic.description,
        topic.category,
        ...topic.articles,
      ]
        .join(" ")
        .toLowerCase();

      return content.includes(value);
    });
  }, [search]);

  return (
    <div className="help-page">
      <header className="help-hero">
        <div className="help-hero-icon">
          <CircleHelp size={32} />
        </div>

        <div>
          <span className="help-eyebrow">
            AYUDA Y SOPORTE
          </span>

          <h1>Centro de Ayuda</h1>

          <p>
            Encuentra información para utilizar correctamente
            la plataforma SEPMS de monitoreo sísmico.
          </p>
        </div>
      </header>

      <section className="help-search-card">
        <div className="help-search-icon">
          <Search size={21} />
        </div>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar en el centro de ayuda..."
          aria-label="Buscar en el centro de ayuda"
        />
      </section>

      {search && (
        <div className="help-search-result">
          {filteredTopics.length} resultado
          {filteredTopics.length !== 1 ? "s" : ""} encontrado
          {filteredTopics.length !== 1 ? "s" : ""}
        </div>
      )}

      <section className="help-section">
        <div className="help-section-heading">
          <div>
            <span className="help-section-label">
              RECURSOS
            </span>

            <h2>¿En qué podemos ayudarte?</h2>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="help-empty">
            <Search size={42} />
            <h3>No encontramos resultados</h3>
            <p>
              Prueba con otro término de búsqueda.
            </p>
          </div>
        ) : (
          <div className="help-topic-grid">
            {filteredTopics.map((topic) => {
              const TopicIcon = topic.icon;

              return (
                <button
                  type="button"
                  className="help-topic-card"
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="help-topic-icon">
                    <TopicIcon size={24} />
                  </div>

                  <div className="help-topic-content">
                    <span className="help-topic-category">
                      {topic.category}
                    </span>

                    <h3>{topic.title}</h3>

                    <p>{topic.description}</p>

                    <span className="help-topic-action">
                      Ver información
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="help-contact-card">
        <div className="help-contact-icon">
          <CircleHelp size={25} />
        </div>

        <div>
          <span className="help-section-label">
            SOPORTE
          </span>

          <h2>¿Necesitas más información?</h2>

          <p>
            Consulta las guías técnicas para conocer con mayor
            detalle el funcionamiento de los módulos de SEPMS.
          </p>
        </div>
      </section>

      {selectedTopic && (
        <div
          className="help-modal-backdrop"
          onClick={() => setSelectedTopic(null)}
        >
          <div
            className="help-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="help-modal-header">
              <div className="help-modal-title">
                <div className="help-topic-icon">
                  <selectedTopic.icon size={23} />
                </div>

                <div>
                  <span className="help-topic-category">
                    {selectedTopic.category}
                  </span>

                  <h2>{selectedTopic.title}</h2>
                </div>
              </div>

              <button
                type="button"
                className="help-modal-close"
                onClick={() => setSelectedTopic(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <p className="help-modal-description">
              {selectedTopic.description}
            </p>

            <div className="help-article-list">
              {selectedTopic.articles.map((article) => (
                <button
                  type="button"
                  key={article}
                  className="help-article-item"
                >
                  <FileText size={18} />
                  <span>{article}</span>
                  <ChevronRight size={17} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
