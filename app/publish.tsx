import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";

export default function PublishScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [tolls, setTolls] = useState("0");
  const [seats, setSeats] = useState("3");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const distanceKm = parseInt(distance, 10) || 0;
  const totalSeats = Math.min(8, Math.max(1, parseInt(seats, 10) || 1));
  const priceInt = parseInt(price, 10) || 0;
  const tollsInt = parseInt(tolls, 10) || 0;

  const cap = trpc.trips.priceCap.useQuery(
    { countryCode: country, distanceKm, tollsAmount: tollsInt, totalSeats },
    { enabled: distanceKm > 0 },
  );
  const overCap = cap.data ? priceInt > cap.data.maxPricePerSeat : false;

  const utils = trpc.useUtils();
  const publish = trpc.trips.publish.useMutation({
    onSuccess: () => {
      utils.trips.list.invalidate();
      utils.trips.myTrips.invalidate();
      Alert.alert("✅", t("published"), [{ text: "OK", onPress: () => router.replace("/(tabs)/my-trips") }]);
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const input = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { numeric?: boolean; placeholder?: string; multiline?: boolean },
  ) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={opts?.placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={opts?.numeric ? "number-pad" : "default"}
        multiline={opts?.multiline}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </View>
  );

  const submit = () => {
    publish.mutate({
      origin,
      destination,
      departureDate: date,
      departureTime: time,
      totalSeats,
      pricePerSeat: priceInt,
      distanceKm,
      tollsAmount: tollsInt,
      countryCode: country,
      description: notes || undefined,
    });
  };

  const ready = origin && destination && date && time && distanceKm > 0 && priceInt >= 0 && !overCap;

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Volver</Text>
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>
          {t("publishTitle")}
        </Text>

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

        {input(t("origin"), origin, setOrigin, { placeholder: "Santiago" })}
        {input(t("destination"), destination, setDestination, { placeholder: "Viña del Mar" })}
        {input(t("date"), date, setDate, { placeholder: "2026-12-05" })}
        {input(t("time"), time, setTime, { placeholder: "08:30" })}
        {input(t("distanceKm"), distance, setDistance, { numeric: true, placeholder: "120" })}
        {input(t("tolls"), tolls, setTolls, { numeric: true })}
        {input(t("totalSeats"), seats, setSeats, { numeric: true })}

        {cap.isFetching && <ActivityIndicator color={colors.primary} />}
        {cap.data && (
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>
            {t("maxAllowed")}: {formatMoney(cap.data.maxPricePerSeat, country)} {t("perSeat")}
          </Text>
        )}
        {input(t("pricePerSeat"), price, setPrice, { numeric: true })}
        {overCap && <Text style={{ color: colors.error, fontSize: 13, marginBottom: 8 }}>{t("overCap")}</Text>}
        {input(t("description"), notes, setNotes, { multiline: true })}

        <Pressable
          onPress={submit}
          disabled={!ready || publish.isPending}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            opacity: !ready || publish.isPending || pressed ? 0.5 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            {publish.isPending ? t("loading") : t("publish")}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
