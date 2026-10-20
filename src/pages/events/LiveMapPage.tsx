import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Layers,
  MapPin,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { getMapEvents } from "../../services/api/events.api";
import { getApiErrorMessage } from "../../services/api/client";
import type { SeismicEvent } from "../../types/event";
import YearFilter, { DEFAULT_YEAR } from "../../components/common/YearFilter";

interface MapEvent {
  id: string;
  location: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  time: string;
}

function ResetMapButton() {
  const map = useMap();

  return (
    <button
      className="map-reset-button"
      onClick={() => map.setView([-9.5, -75.0], 5)}
    >
      <RotateCcw size={15} />
      Restablecer vista
    </button>
  );
}

function toMapEvent(event: SeismicEvent): MapEvent {
  return {
    id: event.external_id || event.id,
    location:
      event.reference_location ||
      [event.district, event.province, event.department]
        .filter(Boolean)
        .join(", ") ||
      `Lat. ${event.latitude.toFixed(3)}, Lon. ${event.longitude.toFixed(3)}`,
    magnitude: event.magnitude,
    depth: event.depth_km,
    latitude: event.latitude,
    longitude: event.longitude,
    time: event.origin_time_utc,
  };
}

export default function LiveMapPage() {
  const [selectedYear, setSelectedYear] = useState<string>(DEFAULT_YEAR);
  const [minimumMagnitude, setMinimumMagnitude] = useState("0");
  const [showEvents, setShowEvents] = useState(true);
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadMapEvents() {
      setLoading(true);
      setApiError("");

      try {
        const data = await getMapEvents({ limit: 10000 });
        if (!cancelled) {
          setEvents(
            data
              .filter(
                (event) =>
                  Number.isFinite(event.latitude) &&
                  Number.isFinite(event.longitude) &&
                  event.latitude >= -90 &&
                  event.latitude <= 90 &&
                  event.longitude >= -180 &&
                  event.longitude <= 180,
              )
              .map(toMapEvent),
          );
        }
      } catch (error) {
        if (!cancelled) {
          setApiError(getApiErrorMessage(error));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMapEvents();
    return () => {
      cancelled = true;
    };
  }, []);

  const yearFilteredEvents = useMemo(() => {
    if (!selectedYear || selectedYear === "Todos") return events;
    return events.filter((e) => {
      const match = e.time?.match(/\b(19\d\d|20\d\d)\b/);
      if (match) return match[1] === selectedYear;
      const parsed = new Date(e.time);
      return !Number.isNaN(parsed.getTime()) && parsed.getUTCFullYear().toString() === selectedYear;
    });
  }, [events, selectedYear]);

  const visibleEvents = useMemo(
    () =>
      yearFilteredEvents.filter(
        (event) => event.magnitude >= Number(minimumMagnitude),
      ),
    [yearFilteredEvents, minimumMagnitude],
  );

  const maximumMagnitude =
    visibleEvents.length > 0
      ? Math.max(...visibleEvents.map((event) => event.magnitude))
      : null;

  const center: LatLngExpression = [-9.5, -75.0];

  return (
    <div className="module-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <MapPin size={15} />
            MONITOREO SÍSMICO
          </div>
          <h1>Mapa sísmico</h1>
          <p>
            Distribución geográfica de los eventos recibidos desde el catálogo.
          </p>
        </div>
      </div>

      {/* Year Filter Component (Default: 2026) */}
      <YearFilter
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        itemCount={visibleEvents.length}
        label="Filtrar eventos del mapa por año:"
      />

      <div className="demo-notice" role="status">
        <ShieldAlert size={19} />
        <div>
          <strong>
            {loading
              ? "Consultando eventos"
              : apiError
                ? "No se pudo cargar el mapa"
                : "Datos del catálogo"}
          </strong>
          <p>
            {loading
              ? "Esperando respuesta del backend."
              : apiError
                ? apiError
                : `${events.length} eventos recibidos. El mapa muestra registros almacenados, no una predicción ni una transmisión en tiempo real.`}
          </p>
        </div>
      </div>

      <section className="map-summary-grid">
        <article className="metric-card">
          <div className="metric-label">Registros visibles</div>
          <div className="metric-value">{visibleEvents.length}</div>
          <div className="metric-description">Según el filtro de magnitud</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Magnitud máxima visible</div>
          <div className="metric-value">
            {maximumMagnitude === null ? "—" : maximumMagnitude.toFixed(1)}
          </div>
          <div className="metric-description">Registros filtrados</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Área de visualización</div>
          <div className="metric-value">Perú</div>
          <div className="metric-description">Vista geográfica inicial</div>
        </article>
      </section>

      <section className="panel map-panel">
        <div className="map-toolbar">
          <div>
            <h2>
              <Layers size={18} />
              Distribución de eventos
            </h2>
            <p>Selecciona un marcador para consultar sus datos.</p>
          </div>

          <label className="map-filter">
            Magnitud mínima
            <select
              value={minimumMagnitude}
              onChange={(event) => setMinimumMagnitude(event.target.value)}
            >
              <option value="0">Todas</option>
              <option value="2">2.0+</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
            </select>
          </label>
        </div>

        <div className="map-legend">
          <span>
            <i className="map-legend-dot map-legend-low" />
            Menor a 3.0
          </span>
          <span>
            <i className="map-legend-dot map-legend-medium" />
            De 3.0 a 3.9
          </span>
          <span>
            <i className="map-legend-dot map-legend-high" />
            4.0 o más
          </span>

          <label className="map-toggle">
            <input
              type="checkbox"
              checked={showEvents}
              onChange={(event) => setShowEvents(event.target.checked)}
            />
            Mostrar marcadores
          </label>
        </div>

        <div className="leaflet-map-wrapper">
          <MapContainer
            center={center}
            zoom={5}
            minZoom={3}
            maxZoom={15}
            scrollWheelZoom
            className="sepms-leaflet-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {showEvents &&
              visibleEvents.map((event) => {
                const color =
                  event.magnitude >= 4
                    ? "#e16a4c"
                    : event.magnitude >= 3
                      ? "#d8a03c"
                      : "#0d9488";

                return (
                  <CircleMarker
                    key={`${event.id}-${event.time}`}
                    center={[event.latitude, event.longitude]}
                    radius={5 + Math.min(event.magnitude, 8) * 1.5}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.7,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="map-popup">
                        <strong>{event.id}</strong>
                        <p>{event.location}</p>
                        <span>Magnitud: {event.magnitude.toFixed(1)}</span>
                        <span>Profundidad: {event.depth} km</span>
                        <small>
                          {new Date(event.time).toLocaleString("es-PE", {
                            timeZone: "UTC",
                            dateStyle: "medium",
                            timeStyle: "medium",
                          })} UTC
                        </small>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}

            <ResetMapButton />
          </MapContainer>
        </div>

        <div className="map-footer">
          <Activity size={15} />
          <span>
            {loading
              ? "Cargando registros..."
              : apiError
                ? "No se recibieron datos del backend."
                : `${visibleEvents.length} registros del catálogo cumplen el filtro.`}
          </span>
        </div>
      </section>
    </div>
  );
}