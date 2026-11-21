import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Avatar } from "@/components/avatar";
import { TripMap } from "@/components/trip-map";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, deviceCountryNotLaunched, t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";
import { groupByDestination } from "@/shared/mapgroups";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const trips = trpc.trips.list.useQuery({ countryCode: country });

  // Solo viajes con coordenadas pueden dibujarse en el mapa
  const groups = useMemo(
    () => groupByDestination((trips.data ?? []).map((tr) => ({ ...tr, availableSeats: tr.availableSeats }))),
    [trips.data],
  );
  const selected = groups.find((g) => g.key === selectedKey) ?? null;
  const list = selected ? selected.trips : (trips.data ?? []);

  return (
    <ScreenContainer edges={["top", "left", "right"]} containerClassName="bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
          <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800" }}>Adeo</Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>{t("tagline")}</Text>
        </View>

        {deviceCountryNotLaunched() && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{t("comingSoon")}</Text>
          </View>
        )}

        <TripMap groups={groups} selectedKey={selectedKey} onSelect={setSelectedKey} height={400} />

        <View
          style={{
            marginTop: -22,
            backgroundColor: "#fff",
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingHorizontal: 16,
            paddingTop: 16,
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: -6 },
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "700" }}>
              {selected ? `Viajes a ${selected.label}` : t("availableTrips")}
            </Text>
            {selected && (
              <Pressable onPress={() => setSelectedKey(null)}>
                <Text style={{ color: colors.primary, fontWeight: "600" }}>Ver todos</Text>
              </Pressable>
            )}
          </View>
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 12 }}>
            {selected ? `${list.length} ${list.length === 1 ? "viaje" : "viajes"} · toca el mapa para volver` : "Toca una foto en el mapa para ver los viajes a ese destino."}
          </Text>

          {trips.isLoading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
          ) : list.length > 0 ? (
            list.map((trip) => (
              <Pressable
                key={trip.id}
                onPress={() => router.push(`/trip/${trip.id}`)}
                style={({ pressed }) => ({
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 12,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                  <Avatar name={trip.driver.firstName} photoUrl={trip.driver.photoUrl} size={40} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }}>
                      {trip.origin} → {trip.destination}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 13 }}>
                      {trip.driver.firstName}
                      {trip.driver.rating ? ` · ⭐ ${trip.driver.rating.toFixed(1)}` : ""} · {trip.departureDate} {trip.departureTime}
                    </Text>
                  </View>
                  <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{formatMoney(trip.pricePerSeat, trip.countryCode)}</Text>
                </View>
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: "700" }}>
                  {trip.availableSeats} {trip.availableSeats === 1 ? t("seat") : t("seats")}
                </Text>
              </Pressable>
            ))
          ) : (
            <Text style={{ color: colors.muted, textAlign: "center", marginVertical: 24 }}>{t("noTrips")}</Text>
          )}

          <Pressable
            onPress={() => router.push("/publish")}
            style={({ pressed }) => ({ backgroundColor: colors.foreground, borderRadius: 14, paddingVertical: 14, alignItems: "center", opacity: pressed ? 0.8 : 1 })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("publishTrip")}</Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
            <Pressable onPress={() => router.push("/safety")}>
              <Text style={{ color: colors.primary, fontSize: 13 }}>🛡️ {t("safety")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/legal/terms")}>
              <Text style={{ color: colors.muted, fontSize: 13, textDecorationLine: "underline" }}>{t("terms")}</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/legal/privacy")}>
              <Text style={{ color: colors.muted, fontSize: 13, textDecorationLine: "underline" }}>{t("privacy")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
