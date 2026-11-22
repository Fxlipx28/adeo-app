import { ScrollView, Text, View, Pressable } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { BackBar } from "@/components/back-bar";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { LEGAL_VERSION, PRIVACY, TERMS } from "@/lib/legal";
import { t } from "@/lib/i18n";

export default function LegalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const isPrivacy = doc === "privacy";
  const sections = isPrivacy ? PRIVACY : TERMS;
  const title = isPrivacy ? t("privacy") : t("terms");

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <BackBar title="Legal" />
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>{title}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 16 }}>
          Versión {LEGAL_VERSION}
        </Text>
        {sections.map((s) => (
          <View key={s.title} style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 4 }}>
              {s.title}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
