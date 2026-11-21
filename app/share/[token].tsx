import { ActivityIndicator, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

/** Vista pública para un familiar: solo ruta, horario y primer nombre del conductor. */
export default function SharedTripScreen() {
  const colors = useColors();
  const { token } = useLocalSearchParams<{ token: string }>();
  const q = trpc.safety.getSharedTrip.useQuery({ token: String(token ?? "") }, { enabled: !!token });

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Viaje compartido
      </Text>
      {q.isLoading ? (
        <ActivityIndicator color={colors.primary} />
      ) : !q.data ? (
        <Text style={{ color: colors.muted }}>Este enlace no existe o ya venció.</Text>
      ) : (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>
            {q.data.origin} → {q.data.destination}
          </Text>
          <Text style={{ color: colors.muted, marginTop: 6 }}>
            {q.data.departureDate} · {q.data.departureTime}
          </Text>
          {q.data.driverFirstName && (
            <Text style={{ color: colors.muted, marginTop: 6 }}>Conductor: {q.data.driverFirstName}</Text>
          )}
          <Text style={{ color: colors.muted, marginTop: 6 }}>Estado: {q.data.status}</Text>
        </View>
      )}
    </ScreenContainer>
  );
}
