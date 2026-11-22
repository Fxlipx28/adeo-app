import { Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export interface TripRulesData {
  luggage?: "light" | "backpack" | "large" | null;
  allowsPets?: boolean | null;
  allowsGear?: boolean | null;
  meetingPoint?: string | null;
}

export const LUGGAGE_LABEL = { light: "Equipaje liviano", backpack: "Mochila OK", large: "Maletas grandes OK" } as const;
const LUGGAGE_ICON: Record<string, IconName> = { light: "work-outline", backpack: "backpack", large: "luggage" };

/** Reglas como lista de etiquetas (icono + texto). */
export function ruleItems(t: TripRulesData): { icon: IconName; label: string }[] {
  const items: { icon: IconName; label: string }[] = [];
  const l = t.luggage ?? "backpack";
  items.push({ icon: LUGGAGE_ICON[l] ?? "work-outline", label: LUGGAGE_LABEL[l] });
  if (t.allowsPets) items.push({ icon: "pets", label: "Mascotas OK" });
  if (t.allowsGear) items.push({ icon: "directions-bike", label: "Bici / tabla OK" });
  return items;
}

/** Etiquetas compactas para las tarjetas de viaje. */
export function RuleChips({ trip }: { trip: TripRulesData }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {ruleItems(trip).map((r) => (
        <View key={r.label} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, borderWidth: 1, borderColor: colors.border }}>
          <MaterialIcons name={r.icon} size={13} color={colors.primary} />
          <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "600", marginLeft: 4 }}>{r.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** Bloque de detalle: reglas del viaje + punto de encuentro con consejo de seguridad. */
export function TripRules({ trip }: { trip: TripRulesData }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, marginBottom: 16 }}>
      <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800", marginBottom: 10 }}>Reglas del viaje</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {ruleItems(trip).map((r) => (
          <View key={r.label} style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
            <MaterialIcons name={r.icon} size={16} color={colors.primary} />
            <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "600", marginLeft: 6 }}>{r.label}</Text>
          </View>
        ))}
      </View>
      {!!trip.meetingPoint && (
        <View style={{ flexDirection: "row", marginTop: 14 }}>
          <MaterialIcons name="place" size={20} color={colors.accent} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 }}>PUNTO DE ENCUENTRO</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginTop: 2 }}>{trip.meetingPoint}</Text>
          </View>
        </View>
      )}
      <View style={{ flexDirection: "row", marginTop: 12, backgroundColor: "#E4F2EA", borderRadius: 12, padding: 10 }}>
        <MaterialIcons name="shield" size={16} color={colors.success} />
        <Text style={{ flex: 1, color: "#1d5a3a", fontSize: 12, marginLeft: 8, lineHeight: 17 }}>
          Encuéntrense siempre en un lugar público y con gente, y comparte tu viaje con alguien de confianza antes de salir.
        </Text>
      </View>
    </View>
  );
}
