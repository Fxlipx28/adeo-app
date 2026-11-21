import type { DestGroup, MapTrip } from "@/shared/mapgroups";

export interface TripMapProps {
  groups: DestGroup<MapTrip>[];
  selectedKey: string | null;
  /** Se llama con la clave del grupo tocado, o null al tocar el mapa vacío. */
  onSelect: (key: string | null) => void;
  height?: number;
}

/** Centro y zoom iniciales: zona central de Chile. */
export const CHILE_CENTER = { lat: -34.2, lng: -71.0 };
