import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";

interface Picked {
  name: string;
  lat: number;
  lng: number;
}

/** Campo de lugar: escribes, presionas Buscar y eliges un resultado del mapa (OpenStreetMap). */
function PlaceField({ label, value, onPick, country }: { label: string; value: Picked | null; onPick: (p: Picked) => void; country: string }) {
  const colors = useColors();
  const utils = trpc.useUtils();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; label: string; lat: number; lng: number }[]>([]);

  const search = async () => {
    if (q.trim().length < 3) return;
    setBusy(true);
    try {
      setResults(await utils.places.search.fetch({ q: q.trim(), countryCode: country }));
    } catch (e: any) {
      Alert.alert(t("error"), e?.message ?? "No se pudo buscar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{label.toUpperCase()}</Text>
      {value && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>📍 {value.name}</Text>
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={search}
          returnKeyType="search"
          placeholder="Ej: Viña del Mar, Terminal Alameda…"
          placeholderTextColor={colors.muted}
          style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground }}
        />
        <Pressable onPress={search} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Buscar</Text>}
        </Pressable>
      </View>
      {results.map((r, i) => (
        <Pressable
          key={`${r.lat},${r.lng},${i}`}
          onPress={() => {
            onPick({ name: r.name, lat: r.lat, lng: r.lng });
            setResults([]);
            setQ("");
          }}
          style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600" }}>{r.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
            {r.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function PublishScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();

  const [origin, setOrigin] = useState<Picked | null>(null);
  const [destination, setDestination] = useState<Picked | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tolls, setTolls] = useState("0");
  const [seats, setSeats] = useState("3");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const totalSeats = Math.min(8, Math.max(1, parseInt(seats, 10) || 1));
  const priceInt = parseInt(price, 10) || 0;
  const tollsInt = parseInt(tolls, 10) || 0;

  // Distancia real por carretera (la calcula el servidor)
  const route = trpc.places.route.useQuery(
    origin && destination
      ? { from: { lat: origin.lat, lng: origin.lng }, to: { lat: destination.lat, lng: destination.lng } }
      : (undefined as never),
    { enabled: !!origin && !!destination },
  );
  const distanceKm = route.data?.km ?? 0;

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
      Alert.alert("✅", t("published"), [{ text: "OK", onPress: () => router.replace("/(tabs)") }]);
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const input = (label: string, value: string, onChange: (v: string) => void, opts?: { numeric?: boolean; placeholder?: string; multiline?: boolean }) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={opts?.placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={opts?.numeric ? "number-pad" : "default"}
        multiline={opts?.multiline}
        style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground }}
      />
    </View>
  );

  const submit = () => {
    if (!origin || !destination) return;
    publish.mutate({
      origin: origin.name,
      destination: destination.name,
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: destination.lat,
      destLng: destination.lng,
      departureDate: date,
      departureTime: time,
      totalSeats,
      pricePerSeat: priceInt,
      tollsAmount: tollsInt,
      countryCode: country,
      description: notes || undefined,
    });
  };

  const ready = !!origin && !!destination && date && time && distanceKm > 0 && priceInt >= 0 && !overCap;

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Volver</Text>
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>{t("publishTitle")}</Text>

        <View style={{ backgroundColor: "#e6f4f9", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: "#0c4a5e", fontWeight: "600", marginBottom: 4 }}>{t("costShareTitle")}</Text>
          <Text style={{ color: "#0c4a5e", fontSize: 13, lineHeight: 19 }}>{t("costShareBody")}</Text>
        </View>

        <PlaceField label={t("origin")} value={origin} onPick={setOrigin} country={country} />
        <PlaceField label={t("destination")} value={destination} onPick={setDestination} country={country} />

        {route.isFetching && <ActivityIndicator color={colors.primary} />}
        {distanceKm > 0 && (
          <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>
            Distancia por carretera: <Text style={{ fontWeight: "700", color: colors.foreground }}>{distanceKm} km</Text>
          </Text>
        )}

        {input(t("date"), date, setDate, { placeholder: "2026-12-05" })}
        {input(t("time"), time, setTime, { placeholder: "08:30" })}
        {input(t("tolls"), tolls, setTolls, { numeric: true })}
        {input(t("totalSeats"), seats, setSeats, { numeric: true })}

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
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            opacity: !ready || publish.isPending || pressed ? 0.5 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{publish.isPending ? t("loading") : t("publish")}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
