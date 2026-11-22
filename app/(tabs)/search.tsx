import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { AppHeader } from "@/components/app-header";
import { ScreenContainer } from "@/components/screen-container";
import { TripCard } from "@/components/trip-card";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";

type Sort = "price" | "date" | "seats";
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const trips = trpc.trips.list.useQuery({ countryCode: currentCountry() });
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<Sort>("price");

  const results = useMemo(() => {
    const f = norm(from);
    const d = norm(to);
    const rows = (trips.data ?? []).filter((tr) => (!f || norm(tr.origin).includes(f)) && (!d || norm(tr.destination).includes(d)));
    return [...rows].sort((a, b) =>
      sort === "price"
        ? a.pricePerSeat - b.pricePerSeat
        : sort === "seats"
          ? b.availableSeats - a.availableSeats
          : `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`),
    );
  }, [trips.data, from, to, sort]);

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

  const chip = (key: Sort, label: string) => (
    <Pressable
      key={key}
      onPress={() => setSort(key)}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: sort === key ? colors.primary : colors.surface,
      }}
    >
      <Text style={{ color: sort === key ? "#fff" : colors.foreground, fontWeight: "700", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScreenContainer>
      <AppHeader title="Buscar viaje" subtitle="Encuentra con quién compartir ruta y costo" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 10 }}>
          {input("trip-origin", from, setFrom, "Desde (ej. Santiago)")}
          {input("place", to, setTo, "Hacia (ej. Viña del Mar)")}
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginVertical: 14 }}>
          {chip("price", "Más baratos")}
          {chip("date", "Salen antes")}
          {chip("seats", "Más cupos")}
        </View>
        <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 10 }}>
          {results.length} {results.length === 1 ? "viaje" : "viajes"}
        </Text>
        {trips.isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 24 }} />
        ) : results.length ? (
          results.map((tr) => <TripCard key={tr.id} trip={tr} onPress={() => router.push(`/trip/${tr.id}`)} />)
        ) : (
          <View style={{ alignItems: "center", marginTop: 36 }}>
            <MaterialIcons name="travel-explore" size={44} color={colors.border} />
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8 }}>{t("noTrips")}</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
