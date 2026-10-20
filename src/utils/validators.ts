export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
}

export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: "La contraseña debe tener al menos 8 caracteres." };
  }
  return { valid: true };
}

export function isValidMagnitude(magnitude: number): boolean {
  return Number.isFinite(magnitude) && magnitude >= 0 && magnitude <= 10;
}

export function isValidDepth(depth: number): boolean {
  return Number.isFinite(depth) && depth >= 0 && depth <= 1000;
}

export function isValidCoordinates(lat: number, lon: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

