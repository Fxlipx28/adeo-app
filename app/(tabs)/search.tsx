import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppHeader } from "@/components/app-header";
import { ScreenContainer } from "@/components/screen-container";
import { TripCard } from "@/components/trip-card";
import { RequestCard } from "@/components/request-card";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";

type Sort = "price" | "date" | "seats";
type Mode = "trips" | "requests";
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();
  const utils = trpc.useUtils();
  const trips = trpc.trips.list.useQuery({ countryCode: country });
  const requests = trpc.requests.list.useQuery({ countryCode: country });
  const cancelReq = trpc.requests.cancel.useMutation({
    onSuccess: () => {
      utils.requests.list.invalidate();
      utils.requests.mine.invalidate();
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const [mode, setMode] = useState<Mode>("trips");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<Sort>("price");
  const [fBackpack, setFBackpack] = useState(false);
  const [fPets, setFPets] = useState(false);
  const [fGear, setFGear] = useState(false);

  const match = (o: string, d: string) => (!norm(from) || norm(o).includes(norm(from))) && (!norm(to) || norm(d).includes(norm(to)));

  const results = useMemo(() => {
    const rows = (trips.data ?? []).filter(
      (tr) =>
        match(tr.origin, tr.destination) &&
        (!fBackpack || tr.luggage !== "light") &&
        (!fPets || tr.allowsPets) &&
        (!fGear || tr.allowsGear),
    );
    return [...rows].sort((a, b) =>
      sort === "price"
        ? a.pricePerSeat - b.pricePerSeat
        : sort === "seats"
          ? b.availableSeats - a.availableSeats
          : `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trips.data, from, to, sort, fBackpack, fPets, fGear]);

  const reqResults = useMemo(
    () => (requests.data ?? []).filter((r) => match(r.origin, r.destination)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requests.data, from, to],
  );

  const input = (icon: React.ComponentProps<typeof MaterialIcons>["name"], value: string, set: (v: string) => void, placeholder: string) => (
    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 12 }}>
      <MaterialIcons name={icon} size={20} color={colors.primary} />
      <TextInput
        value={value}
        onChangeText={set}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: colors.foreground, fontSize: 15 } as object}
      />
      {!!value && (
        <Pressable onPress={() => set("")} hitSlop={8}>
          <MaterialIcons name="close" size={18} color={colors.muted} />
        </Pressable>
      )}
    </View>
  );

  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      onPress={onPress}
      style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: on ? colors.primary : colors.surface }}
    >
      <Text style={{ color: on ? "#fff" : colors.foreground, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );

  const segment = (key: Mode, label: string, count: number) => (
    <Pressable
      key={key}
      onPress={() => setMode(key)}
      style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: mode === key ? "#fff" : "transparent" }}
    >
      <Text style={{ color: mode === key ? colors.foreground : colors.muted, fontWeight: "800", fontSize: 14 }}>
        {label} <Text style={{ color: mode === key ? colors.primary : colors.muted }}>{count}</Text>
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <AppHeader title="Buscar" subtitle="Encuentra con quién compartir ruta y costo" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: "row", backgroundColor: colors.surface, borderRadius: 16, padding: 4, marginBottom: 14 }}>
          {segment("trips", "Viajes", results.length)}
          {segment("requests", "Pasajeros buscando", reqResults.length)}
        </View>

        <View style={{ gap: 10 }}>
          {input("trip-origin", from, setFrom, "Desde (ej. Santiago)")}
          {input("place", to, setTo, "Hacia (ej. Viña del Mar)")}
        </View>

        {mode === "trips" ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 8 }}>
              {chip("Más baratos", sort === "price", () => setSort("price"))}
              {chip("Salen antes", sort === "date", () => setSort("date"))}
              {chip("Más cupos", sort === "seats", () => setSort("seats"))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 14 }} contentContainerStyle={{ gap: 8 }}>
              {chip("🎒 Cabe mi mochila", fBackpack, () => setFBackpack(!fBackpack))}
              {chip("🐾 Mascotas", fPets, () => setFPets(!fPets))}
              {chip("🚲 Bici / tabla", fGear, () => setFGear(!fGear))}
            </ScrollView>
            {trips.isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
            ) : results.length ? (
              results.map((tr) => <TripCard key={tr.id} trip={tr} onPress={() => router.push(`/trip/${tr.id}`)} />)
            ) : (
              <View style={{ alignItems: "center", marginTop: 28, paddingHorizontal: 12 }}>
                <MaterialIcons name="travel-explore" size={44} color={colors.border} />
                <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8 }}>{t("noTrips")}</Text>
                <Pressable
                  onPress={() => router.push("/request" as never)}
                  style={{ marginTop: 14, backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>Publicar “Busco viaje”</Text>
                </Pressable>
              </View>
            )}
          </>
        ) : (
          <>
            <Pressable
              onPress={() => router.push("/request" as never)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.accent,
                borderRadius: 14,
                paddingVertical: 13,
                marginVertical: 14,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <MaterialIcons name="front-hand" size={18} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15, marginLeft: 8 }}>Busco viaje: publica tu ruta</Text>
            </Pressable>
            <Text style={{ color: colors.muted, fontSize: 12.5, marginBottom: 12 }}>
              Personas que necesitan ir a un destino. Si vas para allá, ofrece tu viaje y comparte el costo.
            </Text>
            {requests.isLoading ? (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
            ) : reqResults.length ? (
              reqResults.map((r) => (
                <RequestCard key={r.id} req={r} onOffer={() => router.push("/publish")} onCancel={() => cancelReq.mutate({ requestId: r.id })} />
              ))
            ) : (
              <View style={{ alignItems: "center", marginTop: 24 }}>
                <MaterialIcons name="front-hand" size={44} color={colors.border} />
                <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8 }}>Nadie está buscando esa ruta por ahora.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
