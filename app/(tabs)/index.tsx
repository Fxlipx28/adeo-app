import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { useTrips } from "@/hooks/use-trips";

export default function HomeScreen() {
  const colors = useColors();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const { listTrips } = useTrips();

  const handleSearch = () => {
    console.log("Searching for trips:", { origin, destination, date });
  };

  const handlePublishTrip = () => {
    console.log("Navigate to publish trip");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>
            Adeo
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            Viajes compartidos económicos
          </Text>
        </View>

        {/* Search Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Buscar Viaje
          </Text>

          <TextInput
            placeholder="Origen"
            placeholderTextColor={colors.muted}
            value={origin}
            onChangeText={setOrigin}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <TextInput
            placeholder="Destino"
            placeholderTextColor={colors.muted}
            value={destination}
            onChangeText={setDestination}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 10,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <TextInput
            placeholder="Fecha (YYYY-MM-DD)"
            placeholderTextColor={colors.muted}
            value={date}
            onChangeText={setDate}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <Pressable
            onPress={handleSearch}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>Buscar</Text>
          </Pressable>
        </View>

        {/* Publish Trip Button */}
        <Pressable
          onPress={handlePublishTrip}
          style={({ pressed }) => [
            {
              backgroundColor: colors.success,
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 20,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
            + Publicar un Viaje
          </Text>
        </Pressable>

        {/* Available Trips */}
        <View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
            Viajes Disponibles
          </Text>

          {listTrips.isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : listTrips.data && listTrips.data.length > 0 ? (
            listTrips.data.map((trip) => (
              <Pressable
                key={trip.id}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                      {trip.origin} → {trip.destination}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
                      {trip.departureDate} a las {trip.departureTime}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>
                    ${trip.pricePerSeat}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.success, fontSize: 12, fontWeight: "600" }}>
                    {trip.availableSeats} asientos
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Text style={{ color: colors.muted, fontSize: 16 }}>
                No hay viajes disponibles
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
