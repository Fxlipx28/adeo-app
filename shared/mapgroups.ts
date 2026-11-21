/**
 * Agrupa viajes por DESTINO para dibujarlos en el mapa.
 * Cada grupo muestra la foto del PRIMER conductor que publicó un viaje a ese
 * lugar, y un contador "+N" que va sumando a medida que hay más viajes.
 */
export interface MapDriver {
  firstName: string;
  photoUrl: string | null;
}

export interface MapTrip {
  id: number;
  origin: string;
  destination: string;
  originLat: number | null;
  originLng: number | null;
  destLat: number | null;
  destLng: number | null;
  availableSeats: number;
  driver: MapDriver;
}

export interface DestGroup<T extends MapTrip = MapTrip> {
  key: string;
  lat: number;
  lng: number;
  label: string;
  trips: T[];
  /** Conductor del primer viaje publicado a este destino (menor id). */
  first: MapDriver;
  /** Viajes adicionales al primero (para el "+N"). */
  extra: number;
}

/** Radio (km) para considerar que dos destinos son "el mismo lugar" (misma ciudad). */
export const GROUP_RADIUS_KM = 15;

function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = (x: number) => (x * Math.PI) / 180;
  const h =
    Math.sin(r(bLat - aLat) / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(r(bLng - aLng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Agrupación por cercanía: el viaje más antiguo es el "ancla" del grupo y los
 * que llegan a menos de GROUP_RADIUS_KM de ella se suman a ese grupo.
 */
export function groupByDestination<T extends MapTrip>(trips: T[]): DestGroup<T>[] {
  const valid = trips
    .filter((t) => t.destLat != null && t.destLng != null && t.availableSeats >= 1)
    .sort((a, b) => a.id - b.id);

  const groups: T[][] = [];
  for (const t of valid) {
    const g = groups.find((list) => distKm(list[0].destLat as number, list[0].destLng as number, t.destLat as number, t.destLng as number) <= GROUP_RADIUS_KM);
    if (g) g.push(t);
    else groups.push([t]);
  }

  return groups.map((list) => {
    const first = list[0];
    return {
      key: `${(first.destLat as number).toFixed(3)},${(first.destLng as number).toFixed(3)}`,
      lat: first.destLat as number,
      lng: first.destLng as number,
      label: first.destination.split(",")[0].trim(),
      trips: list,
      first: first.driver,
      extra: list.length - 1,
    };
  });
}
