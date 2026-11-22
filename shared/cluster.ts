import type { DestGroup, MapDriver, MapTrip } from "./mapgroups";

/**
 * Agrupación visual del mapa según el zoom: a medida que se aleja, los destinos
 * cercanos (en pantalla) se juntan en un solo pin que suma sus viajes. El pin
 * conserva el mismo tamaño y muestra la foto del primer conductor.
 * Así los de Chile se quedan en Chile, los de Argentina en Argentina, etc.
 */
export interface MapCluster<T extends MapTrip = MapTrip> {
  key: string;
  lat: number;
  lng: number;
  groups: DestGroup<T>[];
  /** Cantidad total de viajes dentro del pin. */
  total: number;
  /** "+N" del pin: viajes adicionales al primero. */
  extra: number;
  /** Conductor del viaje más antiguo dentro del pin. */
  first: MapDriver;
  /** Código de país si todos los viajes son del mismo país. */
  countryCode: string | null;
}

/** Proyección Web Mercator a píxeles para un zoom dado (tiles de 256 px). */
function project(lat: number, lng: number, zoom: number): [number, number] {
  const size = 256 * 2 ** zoom;
  const x = ((lng + 180) / 360) * size;
  const sin = Math.sin((Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180);
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size;
  return [x, y];
}

export function clusterGroups<T extends MapTrip>(
  groups: DestGroup<T>[],
  zoom: number,
  opts: { minPx?: number; keepSeparate?: string | null } = {},
): MapCluster<T>[] {
  const minPx = opts.minPx ?? 64;
  const anchorId = (g: DestGroup<T>) => g.trips[0].id;
  const sorted = [...groups].sort((a, b) => anchorId(a) - anchorId(b));
  const pts = new Map(sorted.map((g) => [g.key, project(g.lat, g.lng, zoom)] as const));

  const used = new Set<string>();
  const out: MapCluster<T>[] = [];

  for (const g of sorted) {
    if (used.has(g.key)) continue;
    used.add(g.key);
    const members = [g];
    if (g.key !== opts.keepSeparate) {
      const [ax, ay] = pts.get(g.key)!;
      for (const o of sorted) {
        if (used.has(o.key) || o.key === opts.keepSeparate) continue;
        const [ox, oy] = pts.get(o.key)!;
        if (Math.hypot(ax - ox, ay - oy) <= minPx) {
          used.add(o.key);
          members.push(o);
        }
      }
    }

    const total = members.reduce((n, m) => n + m.trips.length, 0);
    const lat = members.reduce((n, m) => n + m.lat * m.trips.length, 0) / total;
    const lng = members.reduce((n, m) => n + m.lng * m.trips.length, 0) / total;
    const countries = new Set(members.flatMap((m) => m.trips.map((t) => t.countryCode ?? "")));
    out.push({
      key: members.length === 1 ? g.key : `c:${g.key}:${members.length}`,
      lat: members.length === 1 ? g.lat : lat,
      lng: members.length === 1 ? g.lng : lng,
      groups: members,
      total,
      extra: total - 1,
      first: g.first,
      countryCode: countries.size === 1 && [...countries][0] ? [...countries][0] : null,
    });
  }
  return out;
}
