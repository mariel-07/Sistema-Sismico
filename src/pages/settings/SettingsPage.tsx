import { useState } from "react";
import {
  Activity,
  BellRing,
  Database,
  Gauge,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Info,
  CheckCircle2,
} from "lucide-react";

import "./settings.css";

interface SystemSettings {
  minimumMagnitude: number;
  highMagnitude: number;
  criticalMagnitude: number;
  minimumDepth: number;
  maximumDepth: number;
  refreshInterval: number;
  enableNotifications: boolean;
  enableSound: boolean;
  enableEmail: boolean;
  enableAudit: boolean;
  dataSource: string;
  timezone: string;
  alertMode: "manual" | "automatic";
}

const DEFAULT_SETTINGS: SystemSettings = {
  minimumMagnitude: 4,
  highMagnitude: 5,
  criticalMagnitude: 6,
  minimumDepth: 0,
  maximumDepth: 700,
  refreshInterval: 60,
  enableNotifications: true,
  enableSound: false,
  enableEmail: false,
  enableAudit: true,
  dataSource: "igp",
  timezone: "UTC",
  alertMode: "manual",
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<SystemSettings>({
      ...DEFAULT_SETTINGS,
    });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function updateSetting<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
    setError("");
  }

  function handleSave() {
    if (
      settings.minimumMagnitude < 0 ||
      settings.highMagnitude < settings.minimumMagnitude ||
      settings.criticalMagnitude < settings.highMagnitude
    ) {
      setError(
        "Revisa los umbrales: el valor mínimo debe ser menor o igual al alto, y el alto menor o igual al crítico.",
      );
      setSaved(false);
      return;
    }

    if (
      settings.minimumDepth < 0 ||
      settings.maximumDepth < settings.minimumDepth
    ) {
      setError(
        "El rango de profundidad no es válido.",
      );
      setSaved(false);
      return;
    }

    if (
      !Number.isFinite(settings.refreshInterval) ||
      settings.refreshInterval < 10
    ) {
      setError(
        "El intervalo de actualización debe ser de al menos 10 segundos.",
      );
      setSaved(false);
      return;
    }

    /*
     * Pendiente de integración con FastAPI.
     * No se presenta como guardado en base de datos.
     */
    setError(
      "La configuración es válida, pero aún falta conectar el servicio backend para guardarla permanentemente.",
    );
    setSaved(false);
  }

  function handleReset() {
    setSettings({ ...DEFAULT_SETTINGS });
    setSaved(false);
    setError("");
  }

  function handleNumberChange(
    key:
      | "minimumMagnitude"
      | "highMagnitude"
      | "criticalMagnitude"
      | "minimumDepth"
      | "maximumDepth"
      | "refreshInterval",
    value: string,
  ) {
    if (value.trim() === "") {
      setError("Completa los campos numéricos.");
      setSaved(false);
      return;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      setError("Introduce un valor numérico válido.");
      return;
    }

    updateSetting(key, number);
  }

  return (
    <main className="settings-page">
      <header className="settings-header">
        <div>
          <div className="settings-eyebrow">
            <Settings size={17} />
            ADMINISTRACIÓN DEL SISTEMA
          </div>

          <h1>Parámetros del Sistema</h1>

          <p>
            Configura los umbrales de monitoreo, las
            notificaciones y el comportamiento general
            de la plataforma SEPMS.
          </p>
        </div>

        <div className="settings-header-icon">
          <SlidersHorizontal size={25} />
        </div>
      </header>

      <div className="settings-notice">
        <Info size={19} />

        <div>
          <strong>Configuración del sistema</strong>
          <p>
            Los valores mostrados son parámetros iniciales
            de configuración. Deben validarse con los
            criterios técnicos del proyecto y no representan
            umbrales oficiales de alerta del IGP o INDECI.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* MONITOREO SÍSMICO */}

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon settings-icon-blue">
              <Activity size={21} />
            </div>

            <div>
              <h2>Monitoreo sísmico</h2>
              <p>
                Parámetros para clasificar y consultar eventos.
              </p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label htmlFor="minimumMagnitude">
                Magnitud mínima de consulta
              </label>

              <input
                id="minimumMagnitude"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.minimumMagnitude}
                onChange={(event) =>
                  handleNumberChange(
                    "minimumMagnitude",
                    event.target.value,
                  )
                }
              />

              <small>
                Magnitud mínima para los filtros de monitoreo.
              </small>
            </div>

            <div className="settings-field">
              <label htmlFor="highMagnitude">
                Umbral de magnitud alto
              </label>

              <input
                id="highMagnitude"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.highMagnitude}
                onChange={(event) =>
                  handleNumberChange(
                    "highMagnitude",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="settings-field">
              <label htmlFor="criticalMagnitude">
                Umbral de magnitud crítico
              </label>

              <input
                id="criticalMagnitude"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={settings.criticalMagnitude}
                onChange={(event) =>
                  handleNumberChange(
                    "criticalMagnitude",
                    event.target.value,
                  )
                }
              />

              <small>
                Son umbrales internos configurables, no
                declaraciones oficiales de emergencia.
              </small>
            </div>

            <div className="settings-form-row">
              <div className="settings-field">
                <label htmlFor="minimumDepth">
                  Profundidad mínima (km)
                </label>

                <input
                  id="minimumDepth"
                  type="number"
                  min="0"
                  value={settings.minimumDepth}
                  onChange={(event) =>
                    handleNumberChange(
                      "minimumDepth",
                      event.target.value,
                    )
                  }
                />
              </div>

              <div className="settings-field">
                <label htmlFor="maximumDepth">
                  Profundidad máxima (km)
                </label>

                <input
                  id="maximumDepth"
                  type="number"
                  min="0"
                  value={settings.maximumDepth}
                  onChange={(event) =>
                    handleNumberChange(
                      "maximumDepth",
                      event.target.value,
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* ACTUALIZACIÓN */}

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon settings-icon-violet">
              <Gauge size={21} />
            </div>

            <div>
              <h2>Actualización y consulta</h2>
              <p>
                Frecuencia de actualización de la interfaz.
              </p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label htmlFor="refreshInterval">
                Intervalo de actualización (segundos)
              </label>

              <input
                id="refreshInterval"
                type="number"
                min="10"
                max="3600"
                step="10"
                value={settings.refreshInterval}
                onChange={(event) =>
                  handleNumberChange(
                    "refreshInterval",
                    event.target.value,
                  )
                }
              />

              <small>
                El intervalo solo tendrá efecto cuando se
                implemente la actualización automática.
              </small>
            </div>

            <div className="settings-field">
              <label htmlFor="timezone">
                Zona horaria de presentación
              </label>

              <select
                id="timezone"
                value={settings.timezone}
                onChange={(event) =>
                  updateSetting(
                    "timezone",
                    event.target.value,
                  )
                }
              >
                <option value="UTC">
                  UTC — Tiempo universal coordinado
                </option>

                <option value="America/Lima">
                  America/Lima — Hora del Perú
                </option>
              </select>

              <small>
                Conserva la fecha y hora originales en UTC
                al importar registros sísmicos.
              </small>
            </div>
          </div>
        </section>

        {/* ALERTAS */}

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon settings-icon-orange">
              <BellRing size={21} />
            </div>

            <div>
              <h2>Notificaciones y alertas</h2>
              <p>
                Preferencias para la gestión de alertas.
              </p>
            </div>
          </div>

          <div className="settings-toggle-list">
            <label className="settings-toggle-row">
              <span>
                <strong>Notificaciones en la plataforma</strong>
                <small>
                  Mostrar avisos dentro de SEPMS.
                </small>
              </span>

              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(event) =>
                  updateSetting(
                    "enableNotifications",
                    event.target.checked,
                  )
                }
              />

              <span className="settings-toggle" />
            </label>

            <label className="settings-toggle-row">
              <span>
                <strong>Sonido de notificación</strong>
                <small>
                  Preferencia sonora del navegador.
                </small>
              </span>

              <input
                type="checkbox"
                checked={settings.enableSound}
                onChange={(event) =>
                  updateSetting(
                    "enableSound",
                    event.target.checked,
                  )
                }
              />

              <span className="settings-toggle" />
            </label>

            <label className="settings-toggle-row">
              <span>
                <strong>Notificaciones por correo</strong>
                <small>
                  Requiere configurar un servicio de correo.
                </small>
              </span>

              <input
                type="checkbox"
                checked={settings.enableEmail}
                onChange={(event) =>
                  updateSetting(
                    "enableEmail",
                    event.target.checked,
                  )
                }
              />

              <span className="settings-toggle" />
            </label>
          </div>

          <div className="settings-field settings-alert-mode">
            <label htmlFor="alertMode">
              Gestión de alertas
            </label>

            <select
              id="alertMode"
              value={settings.alertMode}
              onChange={(event) =>
                updateSetting(
                  "alertMode",
                  event.target.value as
                    | "manual"
                    | "automatic",
                )
              }
            >
              <option value="manual">
                Revisión manual
              </option>

              <option value="automatic">
                Procesamiento automático configurado
              </option>
            </select>

            <small>
              Esta selección no envía avisos ni activa
              protocolos de emergencia por sí sola.
            </small>
          </div>
        </section>

        {/* FUENTES Y AUDITORÍA */}

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon settings-icon-teal">
              <Database size={21} />
            </div>

            <div>
              <h2>Fuentes y auditoría</h2>
              <p>
                Preferencias de origen y trazabilidad.
              </p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="settings-field">
              <label htmlFor="dataSource">
                Fuente principal de referencia
              </label>

              <select
                id="dataSource"
                value={settings.dataSource}
                onChange={(event) =>
                  updateSetting(
                    "dataSource",
                    event.target.value,
                  )
                }
              >
                <option value="igp">
                  Instituto Geofísico del Perú (IGP)
                </option>

                <option value="indeci">
                  INDECI — Gestión del riesgo
                </option>

                <option value="multiple">
                  Varias fuentes verificadas
                </option>
              </select>

              <small>
                La selección es una preferencia de referencia;
                no establece una conexión automática con
                la entidad seleccionada.
              </small>
            </div>

            <label className="settings-toggle-row">
              <span>
                <strong>Registro de auditoría</strong>
                <small>
                  Preferencia para registrar las acciones
                  administrativas.
                </small>
              </span>

              <input
                type="checkbox"
                checked={settings.enableAudit}
                onChange={(event) =>
                  updateSetting(
                    "enableAudit",
                    event.target.checked,
                  )
                }
              />

              <span className="settings-toggle" />
            </label>

            <div className="settings-security-note">
              <ShieldCheck size={19} />

              <span>
                La auditoría efectiva deberá implementarse
                y controlarse desde el backend para que
                los registros no dependan solamente del
                navegador.
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ACCIONES */}

      <footer className="settings-footer">
        <div className="settings-footer-info">
          <ShieldCheck size={18} />

          <span>
            Los cambios todavía no se persisten en la base
            de datos.
          </span>
        </div>

        <div className="settings-footer-actions">
          <button
            type="button"
            className="settings-button settings-button-secondary"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Restablecer valores
          </button>

          <button
            type="button"
            className="settings-button settings-button-primary"
            onClick={handleSave}
          >
            <Save size={17} />
            Validar configuración
          </button>
        </div>
      </footer>

      {error && (
        <div
          className="settings-feedback settings-feedback-error"
          role="status"
        >
          <Info size={18} />
          <span>{error}</span>
        </div>
      )}

      {saved && (
        <div
          className="settings-feedback settings-feedback-success"
          role="status"
        >
          <CheckCircle2 size={18} />
          Configuración guardada correctamente.
        </div>
      )}
    </main>
  );
}