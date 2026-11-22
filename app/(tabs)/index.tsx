import { ActivityIndicator, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ScreenContainer } from "@/components/screen-container";
import { TripMap } from "@/components/trip-map";
import { TripCard } from "@/components/trip-card";
import { BottomSheet, PEEK_HEIGHT, type Snap } from "@/components/bottom-sheet";
import { MenuButton } from "@/components/app-menu";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, deviceCountryNotLaunched, t } from "@/lib/i18n";
import { groupByDestination } from "@/shared/mapgroups";
import { IS_DEMO } from "@/lib/demo-link";

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = currentCountry();
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const insets = useSafeAreaInsets();
  const topPad = insets.top;
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snap>("peek");
  const [boxH, setBoxH] = useState(640);

  const trips = trpc.trips.list.useQuery({ countryCode: country });
  const groups = useMemo(
    () => groupByDestination((trips.data ?? []).map((tr) => ({ ...tr, availableSeats: tr.availableSeats }))),
    [trips.data],
  );
  const selected = groups.find((g) => g.key === selectedKey) ?? null;
  const list = selected ? selected.trips : (trips.data ?? []);

  const select = (key: string | null) => {
    setSelectedKey(key);
    setSnap(key ? "half" : "peek");
  };

  const title = selected ? `Viajes a ${selected.label}` : t("availableTrips");
  const subtitle = selected
    ? `${list.length} ${list.length === 1 ? "viaje" : "viajes"} · toca el mapa para volver`
    : `${list.length} ${list.length === 1 ? "viaje" : "viajes"} · toca una foto del mapa para ver el destino`;

  const heading = (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.foreground, fontSize: 19, fontWeight: "800", letterSpacing: -0.3 }} numberOfLines={1}>
            {title}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12.5, marginTop: 2 }} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        {selected && (
          <Pressable
            onPress={() => select(null)}
            style={{ backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 }}
          >
            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 13 }}>Ver todos</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const tripsList = (
    <View style={{ paddingTop: 8 }}>
      {!IS_DEMO && deviceCountryNotLaunched() && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 14, padding: 12, marginBottom: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{t("comingSoon")}</Text>
        </View>
      )}
      {trips.isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 24 }} />
      ) : list.length > 0 ? (
        list.map((trip) => <TripCard key={trip.id} trip={trip} onPress={() => router.push(`/trip/${trip.id}`)} />)
      ) : (
        <View style={{ alignItems: "center", marginVertical: 28 }}>
          <MaterialIcons name="explore" size={40} color={colors.border} />
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8 }}>{t("noTrips")}</Text>
        </View>
      )}
    </View>
  );

  const topBar = (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", top: 12 + topPad, left: 14, right: 14, zIndex: 30, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}
    >
      <View style={{ alignItems: "flex-start" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#fff",
            borderRadius: 999,
            paddingVertical: 6,
            paddingLeft: 6,
            paddingRight: 16,
            shadowColor: "#1D2A24",
            shadowOpacity: 0.2,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 5,
          }}
        >
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <MaterialIcons name="landscape" size={19} color="#fff" />
          </View>
          <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800", marginLeft: 8, letterSpacing: -0.4 }}>Adeo</Text>
        </View>
        {IS_DEMO && (
          <View style={{ backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8 }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>DEMO · datos de ejemplo</Text>
          </View>
        )}
      </View>
      <MenuButton floating />
    </View>
  );

  const inset = snap === "half" ? Math.round(boxH * 0.52) : PEEK_HEIGHT;

  return (
    <ScreenContainer edges={["left", "right"]} fullWidth>
      <View style={{ flex: 1, flexDirection: desktop ? "row" : "column" }}>
        {desktop && (
          <View style={{ width: 420, backgroundColor: colors.background, borderRightWidth: 1, borderRightColor: colors.border, zIndex: 40 }}>
            <View style={{ padding: 18, paddingBottom: 8 }}>{heading}</View>
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}>{tripsList}</ScrollView>
          </View>
        )}

        <View style={{ flex: 1 }} onLayout={(e) => setBoxH(e.nativeEvent.layout.height)}>
          <TripMap groups={groups} selectedKey={selectedKey} onSelect={select} height="100%" bottomInset={desktop ? 0 : inset} />
          {topBar}
          {!desktop && (
            <BottomSheet containerHeight={boxH} snap={snap} onSnapChange={setSnap} header={heading}>
              {tripsList}
            </BottomSheet>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
