import type { DestGroup, MapTrip } from "@/shared/mapgroups";

export interface TripMapProps {
  groups: DestGroup<MapTrip>[];
  selectedKey: string | null;
  /** Se llama con la clave del grupo tocado, o null al tocar el mapa vacío. */
  onSelect: (key: string | null) => void;
  /** Alto en px o "100%" para llenar el contenedor. */
  height?: number | `${number}%`;
  /** Píxeles de la parte inferior tapados por la hoja de viajes (para encuadrar bien). */
  bottomInset?: number;
}

/** Centro y zoom iniciales: zona central de Chile. */
export const CHILE_CENTER = { lat: -34.2, lng: -71.0 };

/**
 * Límites del mapa: el mundo completo, una sola vez (sin repetirse al alejar),
 * igual que Google Maps. [[sur, oeste], [norte, este]]
 */
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [-85, -180],
  [85, 180],
];
