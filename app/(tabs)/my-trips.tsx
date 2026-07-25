import { ScrollView, Text, View, FlatList, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

interface Trip {
  id: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  price: number;
  driver?: string;
  status: "upcoming" | "completed" | "cancelled";
}

// Mock data - será reemplazado con datos reales de la base de datos
const mockTrips: Trip[] = [
  {
    id: "1",
    origin: "Santiago",
    destination: "Viña del Mar",
    date: "2026-07-30",
    time: "10:00 AM",
    price: 10,
    driver: "Carlos M.",
    status: "upcoming",
  },
  {
    id: "2",
    origin: "Valparaíso",
    destination: "Concepción",
    date: "2026-07-28",
    time: "2:30 PM",
    price: 15,
    driver: "María L.",
    status: "completed",
  },
];

export default function MyTripsScreen() {
  const colors = useColors();

  const renderTripCard = (trip: Trip) => {
    const statusColor =
      trip.status === "upcoming"
        ? colors.primary
        : trip.status === "completed"
          ? colors.success
          : colors.error;

    return (
      <Pressable
        key={trip.id}
        style={({ pressed }) => [
          {
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderLeftWidth: 4,
            borderLeftColor: statusColor,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
            {trip.origin} → {trip.destination}
          </Text>
          <Text
            style={{
              color: statusColor,
              fontSize: 12,
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {trip.status === "upcoming"
              ? "Próximo"
              : trip.status === "completed"
                ? "Completado"
                : "Cancelado"}
          </Text>
        </View>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {trip.date} a las {trip.time}
          </Text>
          {trip.driver && (
            <Text style={{ color: colors.muted, fontSize: 14 }}>Conductor: {trip.driver}</Text>
          )}
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>
            ${trip.price}
          </Text>
          <Pressable
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 12, fontWeight: "600" }}>Ver Detalles</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
            Mis Viajes
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            Tus reservas y viajes publicados
          </Text>
        </View>

        {mockTrips.length > 0 ? (
          <View>{mockTrips.map((trip) => renderTripCard(trip))}</View>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 16, textAlign: "center" }}>
              No tienes viajes aún
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8, textAlign: "center" }}>
              Busca un viaje o publica uno nuevo
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
