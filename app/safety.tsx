import { Alert, Linking, ScrollView, Text, TextInput, View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { currentCountry, t } from "@/lib/i18n";
import { getCountry } from "@/shared/countries";

export default function SafetyScreen() {
  const colors = useColors();
  const router = useRouter();
  const country = getCountry(currentCountry());
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const save = trpc.safety.saveSafetyProfile.useMutation({
    onSuccess: () => Alert.alert("✅", t("saved")),
    onError: (e) => Alert.alert(t("error"), e.message),
  });
  const sos = trpc.safety.sos.useMutation({
    onSuccess: (r) => {
      const msg =
        `Carabineros/Policía: ${r.emergency.police}\nAmbulancia: ${r.emergency.ambulance}\nBomberos: ${r.emergency.fire}` +
        (r.trustedContact ? `\n\nContacto de confianza: ${r.trustedContact.name} (${r.trustedContact.phone})` : "");
      Alert.alert("SOS enviado", msg, [
        { text: `Llamar ${r.emergency.police}`, onPress: () => Linking.openURL(`tel:${r.emergency.police}`) },
        { text: "Cerrar", style: "cancel" },
      ]);
    },
    onError: (e) => Alert.alert(t("error"), e.message),
  });

  const field = (label: string, value: string, onChange: (v: string) => void, phonePad = false) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={phonePad ? "phone-pad" : "default"}
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          color: colors.foreground,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      />
    </View>
  );

  return (
    <ScreenContainer className="p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>← Volver</Text>
        </Pressable>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
          {t("safety")}
        </Text>

        <Pressable
          onPress={() => sos.mutate({})}
          disabled={sos.isPending}
          style={({ pressed }) => ({
            backgroundColor: colors.error,
            borderRadius: 16,
            paddingVertical: 22,
            alignItems: "center",
            marginBottom: 8,
            opacity: pressed || sos.isPending ? 0.7 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>{t("sos")}</Text>
        </Pressable>
        <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 20, textAlign: "center" }}>{t("sosHint")}</Text>

        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <Text style={{ color: colors.foreground, fontWeight: "600", marginBottom: 8 }}>Números de emergencia · {country.name}</Text>
          {(
            [
              ["Policía", country.emergency.police],
              ["Ambulancia", country.emergency.ambulance],
              ["Bomberos", country.emergency.fire],
            ] as const
          ).map(([label, num]) => (
            <Pressable key={label} onPress={() => Linking.openURL(`tel:${num}`)} style={{ paddingVertical: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 15 }}>
                {label}: {num}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600", marginBottom: 8 }}>
          {t("emergencyContact")}
        </Text>
        {field(t("contactName"), name, setName)}
        {field(t("contactPhone"), phone, setPhone, true)}
        <Pressable
          onPress={() =>
            save.mutate({ emergencyContactName: name, emergencyContactPhone: phone, countryCode: country.code })
          }
          disabled={save.isPending || name.trim().length < 2 || phone.trim().length < 6}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            opacity: pressed || name.trim().length < 2 || phone.trim().length < 6 ? 0.5 : 1,
          })}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>{t("save")}</Text>
        </Pressable>

        <View style={{ marginTop: 28, flexDirection: "row", gap: 16 }}>
          <Pressable onPress={() => router.push("/legal/terms")}>
            <Text style={{ color: colors.muted, fontSize: 13, textDecorationLine: "underline" }}>{t("terms")}</Text>
          </Pressable>
          <Pressable onPress={() => router.push("/legal/privacy")}>
            <Text style={{ color: colors.muted, fontSize: 13, textDecorationLine: "underline" }}>{t("privacy")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
