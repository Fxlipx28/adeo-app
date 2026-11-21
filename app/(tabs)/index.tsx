import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, deviceCountryNotLaunched, t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  // Filtros aplicados (solo cambian al presionar Buscar)
  const [filters, setFilters] = useState<{ origin?: string; destination?: string; date?: string }>({});

  const trips = trpc.trips.list.useQuery({ ...filters, countryCode: country });

  const search = () =>
    setFilters({
      origin: origin.trim() || undefined,
      destination: destination.trim() || undefined,
      date: /^\d{4}-\d{2}-\d{2}$/.test(date.trim()) ? date.trim() : undefined,
    });

  const inputStyle = {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
  } as const;

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "bold" }}>Adeo</Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>{t("tagline")}</Text>
        </View>

        {deviceCountryNotLaunched() && (
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{t("comingSoon")}</Text>
          </View>
        )}

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            {t("search")}
          </Text>
          <TextInput
            placeholder={t("origin")}
            placeholderTextColor={colors.muted}
            value={origin}
            onChangeText={setOrigin}
            style={inputStyle}
          />
          <TextInput
            placeholder={t("destination")}
            placeholderTextColor={colors.muted}
            value={destination}
            onChangeText={setDestination}
            style={inputStyle}
          />
          <TextInput
            placeholder={t("date")}
            placeholderTextColor={colors.muted}
            value={date}
            onChangeText={setDate}
            style={{ ...inputStyle, marginBottom: 12 }}
          />
          <Pressable
            onPress={search}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              borderRadius: 8,
              paddingVertical: 12,
              alignItems: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("searchBtn")}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push("/publish")}
          style={({ pressed }) => ({
            backgroundColor: colors.success,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: "center",
            marginBottom: 20,
            opacity: pressed ? 0.8 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("publishTrip")}</Text>
        </Pressable>

        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "bold", marginBottom: 12 }}>
          {t("availableTrips")}
        </Text>

        {trips.isLoading ? (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : trips.data && trips.data.length > 0 ? (
          trips.data.map((trip) => (
            <Pressable
              key={trip.id}
              onPress={() => router.push(`/trip/${trip.id}`)}
              style={({ pressed }) => ({
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                    {trip.origin} → {trip.destination}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
                    {trip.departureDate} · {trip.departureTime}
                  </Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>
                  {formatMoney(trip.pricePerSeat, trip.countryCode)}
                </Text>
              </View>
              <View style={{ paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Text style={{ color: colors.success, fontSize: 12, fontWeight: "600" }}>
                  {trip.availableSeats} {trip.availableSeats === 1 ? t("seat") : t("seats")}
                </Text>
              </View>
            </Pressable>
          ))
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ color: colors.muted, fontSize: 16 }}>{t("noTrips")}</Text>
          </View>
        )}

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
      </ScrollView>
    </ScreenContainer>
  );
}
