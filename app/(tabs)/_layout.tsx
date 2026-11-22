import { Tabs, useRouter } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, Text, View } from "react-native";
import { useIsDesktop } from "@/hooks/use-desktop";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const icon =
  (name: IconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => <MaterialIcons name={name} size={focused ? 27 : 25} color={color} />;

const RAIL: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Explorar", icon: "explore" },
  search: { label: "Buscar", icon: "search" },
  "my-trips": { label: "Mis viajes", icon: "directions-car" },
  profile: { label: "Perfil", icon: "person" },
};

/** Riel lateral para computador: logo arriba, secciones y botón Publicar. */
function DesktopRail({ state, navigation }: BottomTabBarProps) {
  const colors = useColors();
  const router = useRouter();
  const item = (name: string, index: number) => {
    const r = RAIL[name];
    if (!r) return null;
    const focused = state.index === index;
    return (
      <Pressable
        key={name}
        onPress={() => navigation.navigate(name)}
        style={({ pressed }) => ({ width: 76, alignItems: "center", paddingVertical: 10, borderRadius: 16, marginBottom: 4, backgroundColor: focused ? colors.surface : "transparent", opacity: pressed ? 0.7 : 1 })}
      >
        <MaterialIcons name={r.icon} size={26} color={focused ? colors.primary : colors.muted} />
        <Text style={{ color: focused ? colors.primary : colors.muted, fontSize: 11, fontWeight: "700", marginTop: 3 }}>{r.label}</Text>
      </Pressable>
    );
  };
  const idx = (n: string) => state.routes.findIndex((x) => x.name === n);
  return (
    <View style={{ width: 92, backgroundColor: "#fff", borderRightWidth: 1, borderRightColor: colors.border, alignItems: "center", paddingTop: 18 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
        <MaterialIcons name="landscape" size={26} color="#fff" />
      </View>
      {item("index", idx("index"))}
      {item("search", idx("search"))}
      <Pressable onPress={() => router.push("/publish")} style={({ pressed }) => ({ alignItems: "center", marginVertical: 12, opacity: pressed ? 0.85 : 1 })}>
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", shadowColor: colors.accent, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}>
          <MaterialIcons name="add" size={30} color="#fff" />
        </View>
        <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", marginTop: 4 }}>Publicar</Text>
      </Pressable>
      {item("my-trips", idx("my-trips"))}
      {item("profile", idx("profile"))}
    </View>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // En computador: riel lateral izquierdo (como Google Maps); en teléfono: barra inferior
  const desktop = useIsDesktop();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  const tabBarHeight = 62 + bottomPadding;

  return (
    <Tabs
      tabBar={desktop ? (props) => <DesktopRail {...props} /> : undefined}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarPosition: desktop ? "left" : "bottom",
        tabBarVariant: desktop ? "material" : "uikit",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", lineHeight: 15 },
        tabBarStyle: desktop
          ? {
              width: 84,
              paddingTop: 14,
              backgroundColor: "#fff",
              borderRightColor: colors.border,
              borderRightWidth: 1,
              borderTopWidth: 0,
            }
          : {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: "#fff",
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Explorar", tabBarIcon: icon("explore") }} />
      <Tabs.Screen name="search" options={{ title: "Buscar", tabBarIcon: icon("search") }} />
      <Tabs.Screen
        name="new"
        options={{
          title: "Publicar",
          tabBarButton: () => (
            <Pressable
              onPress={() => router.push("/publish")}
              accessibilityLabel="Publicar un viaje"
              style={({ pressed }) => ({
                ...(desktop ? { width: 84, height: 84, justifyContent: "center", marginVertical: 6 } : { flex: 1 }),
                alignItems: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <View
                style={{
                  marginTop: desktop ? 0 : -22,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 4,
                  borderColor: "#fff",
                  shadowColor: colors.accent,
                  shadowOpacity: 0.45,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              >
                <MaterialIcons name="add" size={30} color="#fff" />
              </View>
              <Text style={{ color: colors.accent, fontSize: 11, fontWeight: "800", marginTop: 3 }}>Publicar</Text>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="my-trips" options={{ title: "Mis viajes", tabBarIcon: icon("directions-car") }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: icon("person") }} />
    </Tabs>
  );
}
