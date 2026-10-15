
import { useMemo, useState } from "react";
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

interface MapEvent {
  id: string;
  location: string;
  magnitude: number;
  depth: number;
  position: [number, number];
}

const MAP_EVENTS: MapEvent[] = [
  {
    id: "DEMO-001",
    location: "Costa central del Perú",
    magnitude: 4.2,
    depth: 38,
    position: [-12.1, -77.3],
  },
  {
    id: "DEMO-002",
    location: "Región sur del Perú",
    magnitude: 3.6,
    depth: 52,
    position: [-16.4, -73.2],
  },
  {
    id: "DEMO-003",
    location: "Región norte del Perú",
    magnitude: 2.8,
    depth: 24,
    position: [-5.8, -80.1],
  },
  {
    id: "DEMO-004",
    location: "Frente a la costa peruana",
    magnitude: 3.9,
    depth: 41,
    position: [-14.2, -76.0],
  },
  {
    id: "DEMO-005",
    location: "Zona costera",
    magnitude: 2.4,
    depth: 18,
    position: [-9.2, -78.6],
  },
  {
    id: "DEMO-006",
    location: "Región sur, zona costera",
    magnitude: 4.8,
    depth: 67,
    position: [-17.1, -71.5],
  },
  {
    id: "DEMO-007",
    location: "Región oriental",
    magnitude: 3.1,
    depth: 33,
    position: [-8.4, -74.9],
  },
];

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

export default function LiveMapPage() {
  const [minimumMagnitude, setMinimumMagnitude] = useState("0");
  const [showEvents, setShowEvents] = useState(true);

  const visibleEvents = useMemo(
    () =>
      MAP_EVENTS.filter(
        (event) => event.magnitude >= Number(minimumMagnitude),
      ),
    [minimumMagnitude],
  );

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
            Explora la distribución geográfica de los registros del catálogo.
          </p>
        </div>
      </div>

      <div className="demo-notice">
        <ShieldAlert size={19} />
        <div>
          <strong>Mapa de demostración</strong>
          <p>
            Los marcadores son ficticios. El mapa base requiere conexión a
            internet y no representa una transmisión sísmica en vivo.
          </p>
        </div>
      </div>

      <section className="map-summary-grid">
        <article className="metric-card">
          <div className="metric-label">Registros visibles</div>
          <div className="metric-value">{visibleEvents.length}</div>
          <div className="metric-description">Después de aplicar el filtro</div>
        </article>
        <article className="metric-card">
          <div className="metric-label">Magnitud máxima de la muestra</div>
          <div className="metric-value">
            {Math.max(...MAP_EVENTS.map((event) => event.magnitude)).toFixed(1)}
          </div>
          <div className="metric-description">Dato demostrativo</div>
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
            <p>Selecciona un marcador para consultar su ficha.</p>
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
                    key={event.id}
                    center={event.position}
                    radius={5 + event.magnitude * 1.5}
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
                        <span>
                          Magnitud: {event.magnitude.toFixed(1)}
                        </span>
                        <span>Profundidad: {event.depth} km</span>
                        <small>Registro ficticio de demostración</small>
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
            {visibleEvents.length} registros de ejemplo incluidos en el filtro.
          </span>
        </div>
      </section>
    </div>
  );
}
