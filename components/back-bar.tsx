import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useColors } from "@/hooks/use-colors";

/** Barra superior con flecha atrás y título para pantallas que no son pestañas. */
export function BackBar({ title }: { title: string }) {
  const colors = useColors();
  const router = useRouter();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingBottom: 12, paddingTop: 4 }}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
        accessibilityLabel="Volver"
        hitSlop={8}
        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginRight: 12 }}
      >
        <MaterialIcons name="arrow-back" size={22} color={colors.foreground} />
      </Pressable>
      <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 }}>{title}</Text>
    </View>
  );
}
