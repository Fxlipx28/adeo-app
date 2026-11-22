import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar } from "@/components/avatar";
import { useColors } from "@/hooks/use-colors";

export interface RequestCardData {
  id: number;
  origin: string;
  destination: string;
  travelDate: string;
  seats: number;
  note?: string | null;
  mine?: boolean;
  passenger: { firstName: string; photoUrl: string | null; rating: number | null };
}

/** "Busco viaje": un pasajero que necesita ir a un destino; el conductor puede ofrecerle un viaje. */
export function RequestCard({ req, onOffer, onCancel }: { req: RequestCardData; onOffer: () => void; onCancel: () => void }) {
  const colors = useColors();
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        shadowColor: "#1D2A24",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Avatar name={req.passenger.firstName} photoUrl={req.passenger.photoUrl} size={46} color={colors.accent} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>
            {req.origin} → {req.destination}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
            {req.passenger.firstName}
            {req.passenger.rating ? ` · ★ ${req.passenger.rating.toFixed(1)}` : " · nuevo"}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FBE9DF", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          <MaterialIcons name="front-hand" size={13} color={colors.accent} />
          <Text style={{ color: "#B2481A", fontSize: 11, fontWeight: "800", marginLeft: 4 }}>BUSCA VIAJE</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
          <MaterialIcons name="event" size={14} color={colors.muted} />
          <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>{req.travelDate}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
          <MaterialIcons name="person" size={14} color={colors.muted} />
          <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
            {req.seats} {req.seats === 1 ? "persona" : "personas"}
          </Text>
        </View>
      </View>

      {!!req.note && <Text style={{ color: colors.muted, fontSize: 13, marginTop: 10 }}>{req.note}</Text>}

      <Pressable
        onPress={req.mine ? onCancel : onOffer}
        style={({ pressed }) => ({
          marginTop: 12,
          borderRadius: 14,
          paddingVertical: 11,
          alignItems: "center",
          backgroundColor: req.mine ? "#fff" : colors.primary,
          borderWidth: req.mine ? 1 : 0,
          borderColor: colors.error,
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <Text style={{ color: req.mine ? colors.error : "#fff", fontWeight: "800", fontSize: 14 }}>
          {req.mine ? "Cancelar mi búsqueda" : "Ofrecer un viaje a esta ruta"}
        </Text>
      </Pressable>
    </View>
  );
}
