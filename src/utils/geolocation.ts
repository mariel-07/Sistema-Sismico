// Utilidades para la geolocalización de inicio de sesión de usuarios

export interface UserLoginLocation {
  email: string;
  role?: string;
  city: string;
  region: string;
  department: string;
  latitude: number;
  longitude: number;
  ip: string;
  timestamp: string;
}

export const PERU_DEPARTMENTS_COORDS: Record<
  string,
  { latitude: number; longitude: number; city: string; department: string }
> = {
  lima: { latitude: -12.0464, longitude: -77.0428, city: "Lima", department: "Lima Metropolitana" },
  arequipa: { latitude: -16.409, longitude: -71.5375, city: "Arequipa", department: "Arequipa" },
  cusco: { latitude: -13.5319, longitude: -71.9675, city: "Cusco", department: "Cusco" },
  cuzco: { latitude: -13.5319, longitude: -71.9675, city: "Cusco", department: "Cusco" },
  "la libertad": { latitude: -8.1118, longitude: -79.0287, city: "Trujillo", department: "La Libertad" },
  trujillo: { latitude: -8.1118, longitude: -79.0287, city: "Trujillo", department: "La Libertad" },
  piura: { latitude: -5.1945, longitude: -80.6328, city: "Piura", department: "Piura" },
  junin: { latitude: -12.0651, longitude: -75.2049, city: "Huancayo", department: "Junín" },
  junín: { latitude: -12.0651, longitude: -75.2049, city: "Huancayo", department: "Junín" },
  huancayo: { latitude: -12.0651, longitude: -75.2049, city: "Huancayo", department: "Junín" },
  loreto: { latitude: -3.7491, longitude: -73.2538, city: "Iquitos", department: "Loreto" },
  iquitos: { latitude: -3.7491, longitude: -73.2538, city: "Iquitos", department: "Loreto" },
  tacna: { latitude: -18.0146, longitude: -70.2536, city: "Tacna", department: "Tacna" },
  puno: { latitude: -15.8402, longitude: -70.0219, city: "Puno", department: "Puno" },
  ancash: { latitude: -9.5278, longitude: -77.5278, city: "Huaraz", department: "Áncash" },
  áncash: { latitude: -9.5278, longitude: -77.5278, city: "Huaraz", department: "Áncash" },
  lambayeque: { latitude: -6.7714, longitude: -79.8409, city: "Chiclayo", department: "Lambayeque" },
  chiclayo: { latitude: -6.7714, longitude: -79.8409, city: "Chiclayo", department: "Lambayeque" },
  moquegua: { latitude: -17.1983, longitude: -70.9357, city: "Moquegua", department: "Moquegua" },
  callao: { latitude: -12.0565, longitude: -77.1181, city: "Callao", department: "Callao" },
  ica: { latitude: -14.0678, longitude: -75.7286, city: "Ica", department: "Ica" },
  ayacucho: { latitude: -13.1588, longitude: -74.2239, city: "Ayacucho", department: "Ayacucho" },
  cajamarca: { latitude: -7.1617, longitude: -78.5126, city: "Cajamarca", department: "Cajamarca" },
  huanuco: { latitude: -9.9306, longitude: -76.2422, city: "Huánuco", department: "Huánuco" },
  huánuco: { latitude: -9.9306, longitude: -76.2422, city: "Huánuco", department: "Huánuco" },
  sanmartin: { latitude: -6.4869, longitude: -76.3688, city: "Tarapoto", department: "San Martín" },
  "san martín": { latitude: -6.4869, longitude: -76.3688, city: "Tarapoto", department: "San Martín" },
  ucayali: { latitude: -8.3791, longitude: -74.5539, city: "Pucallpa", department: "Ucayali" },
  tumbes: { latitude: -3.5669, longitude: -80.4515, city: "Tumbes", department: "Tumbes" },
  madre: { latitude: -12.5933, longitude: -69.1891, city: "Puerto Maldonado", department: "Madre de Dios" },
  amazonas: { latitude: -6.2317, longitude: -77.8690, city: "Chachapoyas", department: "Amazonas" },
  apurimac: { latitude: -13.6339, longitude: -72.8814, city: "Abancay", department: "Apurímac" },
  apurímac: { latitude: -13.6339, longitude: -72.8814, city: "Abancay", department: "Apurímac" },
  huancavelica: { latitude: -12.7864, longitude: -74.9727, city: "Huancavelica", department: "Huancavelica" },
  pasco: { latitude: -10.6675, longitude: -76.2561, city: "Cerro de Pasco", department: "Pasco" },
};

const STORAGE_KEY = "sepms_user_login_locations";

export async function detectClientLocation(): Promise<{
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  department: string;
  ip?: string;
}> {
  // Intentar geolocalización HTML5 del navegador con timeout
  if (typeof window !== "undefined" && "geolocation" in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 600000,
          enableHighAccuracy: false,
        });
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      return {
        latitude: lat,
        longitude: lng,
        city: "Lima",
        region: "Lima",
        department: "Lima Metropolitana",
      };
    } catch {
      // Ignorar rechazo o timeout
    }
  }

  // Fallback por IP pública
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.latitude === "number" && typeof data.longitude === "number") {
        return {
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city || "Lima",
          region: data.region || "Lima",
          department: data.region || "Lima Metropolitana",
          ip: data.ip,
        };
      }
    }
  } catch {
    // Si falla o hay bloqueo, ubicación por defecto de la sede central Lima
  }

  return {
    latitude: -12.0464,
    longitude: -77.0428,
    city: "Lima",
    region: "Lima",
    department: "Lima Metropolitana",
    ip: "127.0.0.1",
  };
}

export function saveUserLoginLocation(location: UserLoginLocation): void {
  try {
    const stored = getStoredLoginLocations();
    // Reemplazar si el usuario ya existe o actualizar su última ubicación
    const filtered = stored.filter((item) => item.email.toLowerCase() !== location.email.toLowerCase());
    filtered.unshift(location);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (err) {
    console.warn("No se pudo guardar la ubicación de sesión:", err);
  }
}

export function getStoredLoginLocations(): UserLoginLocation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserLoginLocation[];
  } catch {
    return [];
  }
}

