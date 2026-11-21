import { ActivityIndicator, Alert, ScrollView, Text, View, Pressable } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { Avatar } from "@/components/avatar";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";
import { calcBookingAmounts } from "@/shared/pricing";
import { getCountry } from "@/shared/countries";

export default function TripDetailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const [seats, setSeats] = useState(1);

  const utils = trpc.useUtils();
  const trip = trpc.trips.getById.useQuery({ id: tripId }, { enabled: Number.isFinite(tripId) });
  const me = trpc.auth.me.useQuery();
  const create = trpc.bookings.create.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      utils.bookings.myBookings.invalidate();
      utils.trips.getById.invalidate({ id: tripId });
      Alert.alert("✅", t("booked"), [{ text: "OK", onPress: () => router.replace("/(tabs)/my-trips") }]);
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  if (trip.isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const data = trip.data;
  if (!data) {
    return (
      <ScreenContainer className="p-4">
        <Text style={{ color: colors.muted }}>Viaje no encontrado</Text>
      </ScreenContainer>
    );
  }

  const amounts = calcBookingAmounts(data.pricePerSeat, seats, getCountry(data.countryCode).serviceFeeRate);
  const isOwn = me.data?.id === data.driverId;
  const canBook = data.status === "active" && data.availableSeats > 0 && !isOwn;

  const onReserve = () => {
    if (!me.data) {
      Alert.alert(t("loginNeeded"));
      return;
    }
    create.mutate({ tripId, seatsBooked: seats });
  };

  const row = (label: string, value: string, bold = false) => (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
      <Text style={{ color: colors.muted, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: bold ? "700" : "400" }}>{value}</Text>
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Volver</Text>
        </Pressable>

        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
          {data.origin} → {data.destination}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4, marginBottom: 16 }}>
          {t("departure")}: {data.departureDate} · {data.departureTime}
        </Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {row(t("price"), `${formatMoney(data.pricePerSeat, data.countryCode)} ${t("perSeat")}`, true)}
          {row(t("seats"), String(data.availableSeats))}
          {data.distanceKm > 0 && row("Distancia", `${data.distanceKm} km`)}
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Avatar name={data.driver.firstName} photoUrl={data.driver.photoUrl} size={40} />
            <View style={{ marginLeft: 10 }}>
              <Text style={{ color: colors.foreground, fontWeight: "700" }}>{data.driver.firstName}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {data.driver.rating ? `⭐ ${data.driver.rating.toFixed(1)} · ` : ""}
                {data.driver.totalTrips} viajes
              </Text>
            </View>
          </View>
          {!!data.description && (
            <Text style={{ color: colors.muted, fontSize: 14, marginTop: 8 }}>{data.description}</Text>
          )}
        </View>

        <View
          style={{
            backgroundColor: colors.surface,
            borderLeftWidth: 4,
            borderLeftColor: colors.success,
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 4 }}>{t("costShareTitle")}</Text>
          <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>{t("costShareBody")}</Text>
        </View>

        {canBook && (
          <>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              {t("seatsToBook")}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <Pressable
                onPress={() => setSeats((s) => Math.max(1, s - 1))}
                style={{ backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 }}
              >
                <Text style={{ color: colors.foreground, fontSize: 20 }}>−</Text>
              </Pressable>
              <Text style={{ color: colors.foreground, fontSize: 20, marginHorizontal: 20 }}>{seats}</Text>
              <Pressable
                onPress={() => setSeats((s) => Math.min(data.availableSeats, s + 1))}
                style={{ backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 8 }}
              >
                <Text style={{ color: colors.foreground, fontSize: 20 }}>+</Text>
              </Pressable>
            </View>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 12 }}>
              {row(t("price"), formatMoney(amounts.driverEarnings, data.countryCode))}
              {row(t("serviceFee"), formatMoney(amounts.platformCommission, data.countryCode))}
              {row(t("total"), formatMoney(amounts.totalPrice, data.countryCode), true)}
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>{t("driverGets")}</Text>
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 16 }}>{t("payInfo")}</Text>

            <Pressable
              onPress={onReserve}
              disabled={create.isPending}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                opacity: pressed || create.isPending ? 0.7 : 1,
              })}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                {create.isPending ? t("loading") : `${t("reserve")} · ${formatMoney(amounts.totalPrice, data.countryCode)}`}
              </Text>
            </Pressable>
          </>
        )}

        {isOwn && (
          <Text style={{ color: colors.muted, fontSize: 14 }}>Este es tu viaje.</Text>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
