import { ActivityIndicator, Alert, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";
import { formatMoney } from "@/shared/countries";
import { PlaceField, type Picked } from "@/components/place-field";

const LUGGAGE_OPTIONS = [
  { value: "light", label: "Equipaje liviano" },
  { value: "backpack", label: "Mochila OK" },
  { value: "large", label: "Maletas grandes OK" },
] as const;

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
  const [luggage, setLuggage] = useState<"light" | "backpack" | "large">("backpack");
  const [pets, setPets] = useState(false);
  const [gear, setGear] = useState(false);
  const [meeting, setMeeting] = useState("");

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

  const toggle = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: on ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor: on ? colors.primary : colors.border,
      }}
    >
      <Text style={{ color: on ? "#fff" : colors.foreground, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
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
      luggage,
      allowsPets: pets,
      allowsGear: gear,
      meetingPoint: meeting.trim() || undefined,
    });
  };

  const ready = !!origin && !!destination && date && time && distanceKm > 0 && priceInt >= 0 && !overCap;

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <BackBar title="Publicar un viaje" />
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold", marginBottom: 12 }}>{t("publishTitle")}</Text>

        <View style={{ backgroundColor: "#E4F2EA", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: "#1d5a3a", fontWeight: "600", marginBottom: 4 }}>{t("costShareTitle")}</Text>
          <Text style={{ color: "#1d5a3a", fontSize: 13, lineHeight: 19 }}>{t("costShareBody")}</Text>
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

        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "800", marginTop: 8, marginBottom: 4 }}>Reglas del viaje</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 10 }}>
          Los pasajeros ven esto antes de reservar. Ser claro evita sorpresas en el punto de encuentro.
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>EQUIPAJE</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {LUGGAGE_OPTIONS.map((o) => toggle(o.label, luggage === o.value, () => setLuggage(o.value)))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {toggle("🐾 Acepto mascotas", pets, () => setPets(!pets))}
          {toggle("🚲 Bici / tabla de surf", gear, () => setGear(!gear))}
        </View>
        {input("Punto de encuentro (opcional)", meeting, setMeeting, { placeholder: "Ej: Metro Los Leones, salida Providencia" })}
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: -6, marginBottom: 14 }}>
          Elige un lugar público y con gente: terminal, metro, servicentro o mall. Evita calles solitarias o tu casa.
        </Text>

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
