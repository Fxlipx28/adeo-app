import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function VerificationScreen() {
  const colors = useColors();
  const [documentType, setDocumentType] = useState<"passport" | "license" | "id_card">("id_card");
  const [documentNumber, setDocumentNumber] = useState("");
  const [step, setStep] = useState<"type" | "upload" | "complete">("type");

  const verificationStatus = trpc.verifications.getStatus.useQuery();
  const submitVerification = trpc.verifications.submitVerification.useMutation();

  const handleSubmit = async () => {
    if (!documentNumber.trim()) {
      Alert.alert("Error", "Por favor ingresa el número de documento");
      return;
    }

    // TODO: Implementar carga de imágenes
    // Por ahora, mostrar mensaje
    Alert.alert(
      "Próximo paso",
      "Necesitas cargar fotos del documento y una selfie. Esta funcionalidad estará disponible pronto."
    );
  };

  if (verificationStatus.isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const isVerified = verificationStatus.data?.status === "approved";
  const isPending = verificationStatus.data?.status === "pending";
  const isRejected = verificationStatus.data?.status === "rejected";

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
            Verificación de Identidad
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            Verifica tu identidad para acceder a todas las funciones de Adeo
          </Text>
        </View>

        {/* Status Badge */}
        {isVerified && (
          <View
            style={{
              backgroundColor: colors.success + "20",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: colors.success,
            }}
          >
            <Text style={{ color: colors.success, fontSize: 16, fontWeight: "600" }}>
              ✓ Verificado
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              Tu identidad ha sido verificada correctamente
            </Text>
          </View>
        )}

        {isPending && (
          <View
            style={{
              backgroundColor: colors.warning + "20",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: colors.warning,
            }}
          >
            <Text style={{ color: colors.warning, fontSize: 16, fontWeight: "600" }}>
              ⏳ Pendiente de Revisión
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              Tu solicitud está siendo revisada. Nos pondremos en contacto en 24-48 horas
            </Text>
          </View>
        )}

        {isRejected && (
          <View
            style={{
              backgroundColor: colors.error + "20",
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: colors.error,
            }}
          >
            <Text style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}>
              ✗ Rechazado
            </Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
              {verificationStatus.data?.rejectionReason || "Tu solicitud fue rechazada"}
            </Text>
          </View>
        )}

        {!isVerified && !isPending && !isRejected && (
          <>
            {/* Document Type Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
                Tipo de Documento
              </Text>

              {(["id_card", "passport", "license"] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setDocumentType(type)}
                  style={({ pressed }) => [
                    {
                      backgroundColor: documentType === type ? colors.primary : colors.surface,
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: documentType === type ? "#ffffff" : colors.foreground,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {type === "id_card" && "Cédula de Identidad"}
                    {type === "passport" && "Pasaporte"}
                    {type === "license" && "Licencia de Conducir"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Document Number Input */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                Número de Documento
              </Text>
              <View
                style={{
                  backgroundColor: colors.background,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ color: colors.foreground, fontSize: 14 }}>
                  {documentNumber || "Ingresa tu número de documento"}
                </Text>
              </View>
            </View>

            {/* Info Box */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 8 }}>
                ℹ️ Información Importante
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
                • Tu documento debe estar vigente{"\n"}
                • La foto debe ser clara y legible{"\n"}
                • La selfie debe mostrar tu rostro completo{"\n"}
                • Tus datos se mantienen seguros y encriptados
              </Text>
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
                Continuar con Verificación
              </Text>
            </Pressable>
          </>
        )}

        {/* Why Verification */}
        <View style={{ marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600", marginBottom: 12 }}>
            ¿Por qué necesitamos verificación?
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>
            La verificación de identidad ayuda a mantener Adeo seguro para todos. Nos permite:
            {"\n\n"}
            • Prevenir fraudes y actividades ilícitas
            {"\n"}
            • Proteger a conductores y pasajeros
            {"\n"}
            • Cumplir con regulaciones locales
            {"\n"}
            • Crear una comunidad de confianza
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
