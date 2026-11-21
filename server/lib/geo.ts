/**
 * Geocodificación y rutas con servicios abiertos de OpenStreetMap.
 *
 * - Nominatim (buscar lugares) y OSRM (distancia por carretera).
 * - Son servicios públicos de demostración: para producción conviene un
 *   proveedor propio o de pago (Mapbox, Google, Stadia, OpenRouteService...).
 *   Configura GEOCODER_URL / ROUTER_URL para cambiarlos sin tocar el código.
 */
const GEOCODER_URL = process.env.GEOCODER_URL ?? "https://nominatim.openstreetmap.org";
const ROUTER_URL = process.env.ROUTER_URL ?? "https://router.project-osrm.org";
const UA = "Adeo/1.0 (carpooling Chile)";

export interface Place {
  name: string;
  label: string;
  lat: number;
  lng: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

async function fetchJson(url: string, ms = 5000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Distancia en línea recta (km). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Caché simple en memoria (respeta el límite de ~1 req/s de Nominatim)
const searchCache = new Map<string, { at: number; data: Place[] }>();
let lastSearchAt = 0;

export async function searchPlaces(query: string, countryCode: string): Promise<Place[]> {
  const key = `${countryCode}:${query.toLowerCase().trim()}`;
  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < 24 * 3600 * 1000) return hit.data;

  const wait = lastSearchAt + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastSearchAt = Date.now();

  const url =
    `${GEOCODER_URL}/search?format=jsonv2&limit=6&addressdetails=0&accept-language=es` +
    `&countrycodes=${encodeURIComponent(countryCode.toLowerCase())}&q=${encodeURIComponent(query)}`;
  const rows: any[] = await fetchJson(url);
  const data: Place[] = rows
    .map((r) => ({
      name: String(r.name || r.display_name?.split(",")[0] || query),
      label: String(r.display_name ?? r.name ?? query),
      lat: Number(r.lat),
      lng: Number(r.lon),
    }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  searchCache.set(key, { at: Date.now(), data });
  return data;
}

/** Distancia por carretera en km (OSRM). Si falla, estima con línea recta × 1.25. */
export async function routeDistanceKm(a: LatLng, b: LatLng): Promise<{ km: number; source: "osrm" | "estimate" }> {
  try {
    const url = `${ROUTER_URL}/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false`;
    const json = await fetchJson(url);
    const meters = json?.routes?.[0]?.distance;
    if (typeof meters === "number" && meters > 0) return { km: Math.max(1, Math.round(meters / 1000)), source: "osrm" };
  } catch {
    /* cae al estimado */
  }
  return { km: Math.max(1, Math.round(haversineKm(a, b) * 1.25)), source: "estimate" };
}
