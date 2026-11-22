import { ActivityIndicator, Alert, ScrollView, Share, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { AppHeader } from "@/components/app-header";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { t, type TKey } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";

export default function MyTripsScreen() {
  const colors = useColors();
  const router = useRouter();
  const utils = trpc.useUtils();

  const me = trpc.auth.me.useQuery();
  const bookings = trpc.bookings.myBookings.useQuery(undefined, { enabled: !!me.data });
  const published = trpc.trips.myTrips.useQuery(undefined, { enabled: !!me.data });
  const myRequests = trpc.requests.mine.useQuery(undefined, { enabled: !!me.data });
  const cancelRequest = trpc.requests.cancel.useMutation({
    onSuccess: () => {
      utils.requests.mine.invalidate();
      utils.requests.list.invalidate();
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const cancelBooking = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      utils.bookings.myBookings.invalidate();
      utils.trips.list.invalidate();
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });
  const cancelTrip = trpc.trips.cancel.useMutation({
    onSuccess: () => {
      utils.trips.myTrips.invalidate();
      utils.trips.list.invalidate();
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });
  const share = trpc.safety.createTripShare.useMutation({
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const shareTrip = async (tripId: number) => {
    const r = await share.mutateAsync({ tripId });
    await Share.share({
      message: `Sigue mi viaje en Adeo (válido 24 h): ${Linking.createURL(`share/${r.token}`)}`,
    });
  };

  const statusColor = (s: string) =>
    s === "confirmed" || s === "active" ? colors.success : s === "pending" ? colors.warning : s === "cancelled" ? colors.error : colors.muted;

  const badge = (status: string) => (
    <Text style={{ color: statusColor(status), fontSize: 12, fontWeight: "600" }}>
      {t(`status_${status}` as TKey)}
    </Text>
  );

  const btn = (label: string, onPress: () => void, danger = false) => (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: danger ? colors.error : colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginRight: 8,
      }}
    >
      <Text style={{ color: danger ? colors.error : colors.primary, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );

  const card = (key: string, children: React.ReactNode, onPress?: () => void) => (
    <Pressable
      key={key}
      onPress={onPress}
      style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 16, marginBottom: 12 }}
    >
      {children}
    </Pressable>
  );

  if (!me.isLoading && !me.data) {
    return (
      <ScreenContainer>
        <AppHeader title={t("myTrips")} />
        <Text style={{ color: colors.muted, marginTop: 12 }}>{t("loginNeeded")}</Text>
      </ScreenContainer>
    );
  }

  const loading = me.isLoading || bookings.isLoading || published.isLoading;
  const empty = !bookings.data?.length && !published.data?.length && !myRequests.data?.length;

  return (
    <ScreenContainer>
      <AppHeader title={t("myTrips")} subtitle="Tus viajes como pasajero y como conductor" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 24, paddingHorizontal: 16 }}>

        {loading && <ActivityIndicator color={colors.primary} />}
        {!loading && empty && <Text style={{ color: colors.muted, textAlign: "center", marginTop: 32 }}>{t("none")}</Text>}

        {!!myRequests.data?.length && (
          <>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Mis búsquedas (busco viaje)</Text>
            {myRequests.data.map((r) =>
              card(
                `r${r.id}`,
                <>
                  <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600" }}>
                    {r.origin} → {r.destination}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 14, marginVertical: 6 }}>
                    {r.travelDate} · {r.seats} {r.seats === 1 ? "persona" : "personas"}
                  </Text>
                  <View style={{ flexDirection: "row" }}>{btn(t("cancel"), () => cancelRequest.mutate({ requestId: r.id }), true)}</View>
                </>,
              ),
            )}
          </>
        )}

        {!!bookings.data?.length && (
          <>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
              {t("asPassenger")}
            </Text>
            {bookings.data.map((b) =>
              card(
                `b${b.id}`,
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", flex: 1 }}>
                      {b.trip.origin} → {b.trip.destination}
                    </Text>
                    {badge(b.status)}
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    {b.trip.departureDate} · {b.trip.departureTime}
                  </Text>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold", marginVertical: 8 }}>
                    {formatMoney(b.totalPrice, b.trip.countryCode)}
                  </Text>
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <View style={{ flexDirection: "row" }}>
                      {btn(t("shareTrip"), () => shareTrip(b.tripId))}
                      {btn(t("cancel"), () => cancelBooking.mutate({ bookingId: b.id }), true)}
                    </View>
                  )}
                </>,
                () => router.push(`/trip/${b.tripId}`),
              ),
            )}
          </>
        )}

        {!!published.data?.length && (
          <>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginVertical: 8 }}>
              {t("asDriver")}
            </Text>
            {published.data.map((trip) =>
              card(
                `t${trip.id}`,
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                    <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", flex: 1 }}>
                      {trip.origin} → {trip.destination}
                    </Text>
                    {badge(trip.status)}
                  </View>
                  <Text style={{ color: colors.muted, fontSize: 14 }}>
                    {trip.departureDate} · {trip.departureTime} · {trip.availableSeats}/{trip.totalSeats} {t("seats")}
                  </Text>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: "bold", marginVertical: 8 }}>
                    {formatMoney(trip.pricePerSeat, trip.countryCode)} {t("perSeat")}
                  </Text>
                  {trip.status === "active" && (
                    <View style={{ flexDirection: "row" }}>
                      {btn(t("shareTrip"), () => shareTrip(trip.id))}
                      {btn(t("cancel"), () => cancelTrip.mutate({ tripId: trip.id }), true)}
                    </View>
                  )}
                </>,
                () => router.push(`/trip/${trip.id}`),
              ),
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
