/**
 * Utilidades para el RUT chileno (módulo 11).
 */

/** Deja el RUT en formato "12345678-5" (sin puntos, DV en mayúscula). */
export function normalizeRut(input: string): string {
  const clean = input.replace(/[^0-9kK]/g, "").toUpperCase();
  if (clean.length < 2) return clean;
  return `${clean.slice(0, -1)}-${clean.slice(-1)}`;
}

/** Calcula el dígito verificador de un cuerpo numérico. */
export function computeRutDv(body: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  if (rest === 11) return "0";
  if (rest === 10) return "K";
  return String(rest);
}

export function isValidRut(input: string): boolean {
  const rut = normalizeRut(input);
  const match = /^(\d{7,8})-([0-9K])$/.exec(rut);
  if (!match) return false;
  return computeRutDv(match[1]) === match[2];
}

/** Enmascara un documento para guardarlo/mostrarlo: "***4-5". */
export function maskDocument(input: string): string {
  const clean = input.replace(/[^0-9a-zA-Z]/g, "");
  if (clean.length <= 4) return "****";
  return `${"*".repeat(clean.length - 3)}${clean.slice(-3)}`;
}
