import { Tabs, useRouter } from "expo-router";
import { Platform, Pressable, Text, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const icon =
  (name: IconName) =>
  ({ color, focused }: { color: string; focused: boolean }) => <MaterialIcons name={name} size={focused ? 27 : 25} color={color} />;

export default function TabLayout() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  const tabBarHeight = 62 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", lineHeight: 15 },
        tabBarStyle: {
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
              style={({ pressed }) => ({ flex: 1, alignItems: "center", opacity: pressed ? 0.85 : 1 })}
            >
              <View
                style={{
                  marginTop: -22,
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
