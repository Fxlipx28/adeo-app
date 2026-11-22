import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { BackBar } from "@/components/back-bar";
import { PlaceField, type Picked } from "@/components/place-field";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";

/** "Busco viaje": publica la ruta que necesitas para que los conductores que van para allá te encuentren. */
export default function RequestScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();
  const utils = trpc.useUtils();

  const [origin, setOrigin] = useState<Picked | null>(null);
  const [destination, setDestination] = useState<Picked | null>(null);
  const [date, setDate] = useState("");
  const [seats, setSeats] = useState(1);
  const [note, setNote] = useState("");

  const create = trpc.requests.create.useMutation({
    onSuccess: () => {
      utils.requests.list.invalidate();
      utils.requests.mine.invalidate();
      Alert.alert("✅", "Publicamos tu búsqueda. Los conductores que vayan a esa ruta la verán.", [{ text: "OK", onPress: () => router.back() }]);
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const ready = !!origin && !!destination && /^\d{4}-\d{2}-\d{2}$/.test(date);

  const submit = () => {
    if (!origin || !destination) return;
    create.mutate({
      origin: origin.name,
      destination: destination.name,
      originLat: origin.lat,
      originLng: origin.lng,
      destLat: destination.lat,
      destLng: destination.lng,
      countryCode: country,
      travelDate: date,
      seats,
      note: note.trim() || undefined,
    });
  };

  const stepper = (label: string, onPress: () => void) => (
    <Pressable onPress={onPress} style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 8 }}>
      <Text style={{ color: colors.foreground, fontSize: 20 }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <BackBar title="Busco viaje" />
        <View style={{ backgroundColor: "#FBE9DF", borderRadius: 14, padding: 14, marginBottom: 16 }}>
          <Text style={{ color: "#8A3A14", fontSize: 13, lineHeight: 19 }}>
            Cuéntanos a dónde necesitas ir. Los conductores que vayan para allá verán tu búsqueda y podrán ofrecerte su viaje; tú lo reservas desde la app.
          </Text>
        </View>

        <PlaceField label={t("origin")} value={origin} onPick={setOrigin} country={country} />
        <PlaceField label={t("destination")} value={destination} onPick={setDestination} country={country} />

        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{t("date").toUpperCase()}</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2026-12-05"
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground, marginBottom: 14 }}
        />

        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>PERSONAS</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
          {stepper("−", () => setSeats((s) => Math.max(1, s - 1)))}
          <Text style={{ color: colors.foreground, fontSize: 20, marginHorizontal: 20 }}>{seats}</Text>
          {stepper("+", () => setSeats((s) => Math.min(4, s + 1)))}
        </View>

        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>NOTA (OPCIONAL)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          maxLength={500}
          placeholder="Ej: voy con mochila, flexible con el horario"
          placeholderTextColor={colors.muted}
          style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground, minHeight: 70 }}
        />
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6, marginBottom: 18 }}>
          Por tu seguridad, no escribas tu teléfono, redes sociales ni dirección. La coordinación se hace dentro de Adeo.
        </Text>

        <Pressable
          onPress={submit}
          disabled={!ready || create.isPending}
          style={({ pressed }) => ({ backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: "center", opacity: !ready || create.isPending || pressed ? 0.5 : 1 })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{create.isPending ? t("loading") : "Publicar mi búsqueda"}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
