import { Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar } from "@/components/avatar";
import { useColors } from "@/hooks/use-colors";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";

export interface TripCardData {
  id: number;
  origin: string;
  destination: string;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  countryCode: string;
  driver: { firstName: string; photoUrl: string | null; rating?: number | null };
}

/** Tarjeta de viaje: conductor, ruta, fecha, precio por asiento y cupos. */
export function TripCard({ trip, onPress }: { trip: TripCardData; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        padding: 14,
        marginBottom: 12,
        opacity: pressed ? 0.85 : 1,
        shadowColor: "#1D2A24",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Avatar name={trip.driver.firstName} photoUrl={trip.driver.photoUrl} size={46} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }} numberOfLines={1}>
            {trip.origin} → {trip.destination}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }} numberOfLines={1}>
            {trip.driver.firstName}
            {trip.driver.rating ? ` · ★ ${trip.driver.rating.toFixed(1)}` : ""}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "800" }}>{formatMoney(trip.pricePerSeat, trip.countryCode)}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>{t("perSeat")}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
          <MaterialIcons name="event" size={14} color={colors.muted} />
          <Text style={{ color: colors.foreground, fontSize: 12, marginLeft: 4, fontWeight: "600" }}>
            {trip.departureDate} · {trip.departureTime}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: trip.availableSeats > 0 ? "#E4F2EA" : "#F6E3DE", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 }}>
          <MaterialIcons name="event-seat" size={14} color={trip.availableSeats > 0 ? colors.success : colors.error} />
          <Text style={{ color: trip.availableSeats > 0 ? colors.success : colors.error, fontSize: 12, marginLeft: 4, fontWeight: "700" }}>
            {trip.availableSeats} {trip.availableSeats === 1 ? t("seat") : t("seats")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
