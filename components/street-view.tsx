import { createElement, useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

const KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;

/** Enlace oficial de Street View: no requiere API key, abre Google Maps en modo panorámico. */
export const streetViewUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;

/**
 * Street View de un punto (por ejemplo, el lugar de encuentro).
 * - Con EXPO_PUBLIC_GOOGLE_MAPS_KEY (Maps Embed API) en web: se ve dentro de la app.
 * - Sin key o en celular nativo: botón que abre Street View en Google Maps.
 */
export function StreetView({ lat, lng, title }: { lat: number; lng: number; title: string }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const canEmbed = Platform.OS === "web" && !!KEY;

  const onPress = () => (canEmbed ? setOpen((v) => !v) : Linking.openURL(streetViewUrl(lat, lng)));

  return (
    <View style={{ marginBottom: 10 }}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 14,
          padding: 12,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 22, marginRight: 10 }}>🏙️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Ver el lugar en Street View antes de ir</Text>
        </View>
        <Text style={{ color: colors.primary, fontWeight: "600" }}>{canEmbed ? (open ? "Cerrar" : "Ver") : "Abrir ↗"}</Text>
      </Pressable>

      {canEmbed &&
        open &&
        createElement("iframe", {
          title,
          src: `https://www.google.com/maps/embed/v1/streetview?key=${KEY}&location=${lat},${lng}&heading=0&pitch=0&fov=90`,
          loading: "lazy",
          allowFullScreen: true,
          referrerPolicy: "no-referrer-when-downgrade",
          style: { width: "100%", height: 240, border: 0, borderRadius: 14, marginTop: 8 },
        })}
    </View>
  );
}
