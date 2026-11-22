import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BackBar } from "@/components/back-bar";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry } from "@/lib/i18n";
import { getCountry } from "@/shared/countries";

export default function SettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const me = trpc.auth.me.useQuery();
  const country = getCountry(currentCountry());

  const info = (label: string, value: string) => (
    <View style={{ paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontSize: 15, fontWeight: "600", marginTop: 2 }}>{value}</Text>
    </View>
  );

  const link = (label: string, path: string) => (
    <Pressable
      key={path}
      onPress={() => router.push(path as never)}
      style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 }}
    >
      <Text style={{ flex: 1, color: colors.foreground, fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <MaterialIcons name="chevron-right" size={20} color={colors.border} />
    </Pressable>
  );

  const card = (children: React.ReactNode) => (
    <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 20, marginBottom: 16, overflow: "hidden" }}>{children}</View>
  );

  return (
    <ScreenContainer className="p-4">
      <BackBar title="Configuración" />
      <ScrollView>
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6, marginLeft: 4 }}>CUENTA</Text>
        {card(
          <>
            {info("Nombre", me.data?.name || "—")}
            {info("Correo", me.data?.email || "—")}
          </>,
        )}
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6, marginLeft: 4 }}>REGIÓN</Text>
        {card(
          <>
            {info("País", country.name)}
            {info("Moneda", country.currency)}
          </>,
        )}
        <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 6, marginLeft: 4 }}>LEGAL</Text>
        {card(
          <>
            {link("Términos de uso", "/legal/terms")}
            {link("Política de privacidad", "/legal/privacy")}
          </>,
        )}
        <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 8 }}>Adeo · versión demo</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
