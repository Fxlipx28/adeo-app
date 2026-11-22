import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Avatar } from "./avatar";
import { clusterGroups } from "@/shared/cluster";
import { getCountry } from "@/shared/countries";
import { CHILE_CENTER, type TripMapProps } from "./trip-map-types";

/**
 * Mapa interactivo nativo (iOS/Android) con react-native-maps: zoom, arrastre y
 * pines con la foto del primer conductor + contador "+N".
 * Android usa Google Maps (requiere API key en la build); iOS usa Apple Maps.
 */
export function TripMap({ groups, selectedKey, onSelect, height = 380, bottomInset = 0 }: TripMapProps) {
  const ref = useRef<MapView | null>(null);
  const fitted = useRef(false);
  // Los pines con imágenes necesitan "tracksViewChanges" un momento para renderizarse
  const [zoom, setZoom] = useState(6);
  const [track, setTrack] = useState(true);
  useEffect(() => {
    setTrack(true);
    const t = setTimeout(() => setTrack(false), 1200);
    return () => clearTimeout(t);
  }, [groups, selectedKey, Math.round(zoom)]);

  const sel = groups.find((g) => g.key === selectedKey) ?? null;
  const clusters = clusterGroups(groups, zoom, { keepSeparate: selectedKey });

  useEffect(() => {
    if (sel) {
      const pts = [
        { latitude: sel.lat, longitude: sel.lng },
        ...sel.trips.filter((t) => t.originLat != null && t.originLng != null).map((t) => ({ latitude: t.originLat as number, longitude: t.originLng as number })),
      ];
      ref.current?.fitToCoordinates(pts, { edgePadding: { top: 110, right: 60, bottom: 60 + bottomInset, left: 60 }, animated: true });
    } else if (!fitted.current && groups.length > 0) {
      fitted.current = true;
      ref.current?.fitToCoordinates(
        groups.map((g) => ({ latitude: g.lat, longitude: g.lng })),
        { edgePadding: { top: 110, right: 60, bottom: 60 + bottomInset, left: 60 }, animated: false },
      );
    }
  }, [selectedKey, groups]);

  return (
    <View style={{ height, width: "100%" }}>
      <MapView
        ref={ref}
        style={{ flex: 1 }}
        initialRegion={{ latitude: CHILE_CENTER.lat, longitude: CHILE_CENTER.lng, latitudeDelta: 8, longitudeDelta: 8 }}
        onPress={() => onSelect(null)}
        onRegionChangeComplete={(r) => setZoom(Math.max(1, Math.log2(360 / r.longitudeDelta)))}
        showsUserLocation={false}
        toolbarEnabled={false}
      >
        {sel &&
          sel.trips
            .filter((t) => t.originLat != null && t.originLng != null)
            .map((t) => (
              <Polyline
                key={`r${t.id}`}
                coordinates={[
                  { latitude: t.originLat as number, longitude: t.originLng as number },
                  { latitude: sel.lat, longitude: sel.lng },
                ]}
                strokeColor="#E8743B"
                strokeWidth={4}
                lineDashPattern={[10, 8]}
              />
            ))}

        {clusters.map((c) => {
          const merged = c.groups.length > 1;
          const selected = !merged && c.key === selectedKey;
          const label = !merged ? c.groups[0].label : c.countryCode && zoom <= 4 ? getCountry(c.countryCode).name : `${c.groups.length} destinos`;
          return (
            <Marker
              key={c.key}
              coordinate={{ latitude: c.lat, longitude: c.lng }}
              onPress={(e) => {
                e.stopPropagation?.();
                if (!merged) onSelect(c.groups[0].key);
                else
                  ref.current?.fitToCoordinates(
                    c.groups.map((g) => ({ latitude: g.lat, longitude: g.lng })),
                    { edgePadding: { top: 110, right: 80, bottom: 80 + bottomInset, left: 80 }, animated: true },
                  );
              }}
              tracksViewChanges={track}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={selected ? 10 : 1}
            >
              <View style={{ alignItems: "center", width: 90 }}>
                <View
                  style={{
                    padding: 3,
                    backgroundColor: "#fff",
                    borderRadius: 40,
                    borderWidth: selected ? 4 : 3,
                    borderColor: selected ? "#E8743B" : "#1F6B57",
                  }}
                >
                  <Avatar name={c.first.firstName} photoUrl={c.first.photoUrl} size={selected ? 44 : 36} />
                </View>
                {c.extra > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -6,
                      right: 14,
                      minWidth: 22,
                      height: 22,
                      borderRadius: 11,
                      paddingHorizontal: 5,
                      backgroundColor: "#0f172a",
                      borderWidth: 2,
                      borderColor: "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>+{c.extra}</Text>
                  </View>
                )}
                <Text style={{ fontSize: 12, fontWeight: "700", color: selected ? "#C2561F" : "#334155", marginTop: 2 }} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}
