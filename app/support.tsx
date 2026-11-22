import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { BackBar } from "@/components/back-bar";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function SupportScreen() {
  const colors = useColors();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"payment" | "safety" | "technical" | "other">("technical");

  const myTickets = trpc.safety.mySupportTickets.useQuery();
  const createTicket = trpc.safety.createSupportTicket.useMutation();

  const handleCreateTicket = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      await createTicket.mutateAsync({
        subject,
        description,
        category,
      });

      Alert.alert("Éxito", "Tu ticket de soporte ha sido creado. Nos pondremos en contacto pronto.");
      setSubject("");
      setDescription("");
      setCategory("technical");
    } catch (error) {
      Alert.alert("Error", "No pudimos crear tu ticket. Intenta de nuevo.");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <BackBar title="Soporte" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
            Centro de Soporte
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 4 }}>
            ¿Necesitas ayuda? Estamos aquí para ti
          </Text>
        </View>

        {/* Create Ticket Form */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Crear Nuevo Ticket
          </Text>

          {/* Category Selection */}
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Categoría</Text>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {(["payment", "safety", "technical", "other"] as const).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={({ pressed }) => [
                  {
                    backgroundColor: category === cat ? colors.primary : colors.background,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: category === cat ? "#ffffff" : colors.foreground,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {cat === "payment" && "Pago"}
                  {cat === "safety" && "Seguridad"}
                  {cat === "technical" && "Técnico"}
                  {cat === "other" && "Otro"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Subject */}
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Asunto</Text>
          <TextInput
            placeholder="Breve descripción del problema"
            placeholderTextColor={colors.muted}
            value={subject}
            onChangeText={setSubject}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          {/* Description */}
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>Descripción Detallada</Text>
          <TextInput
            placeholder="Cuéntanos qué está pasando..."
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            style={{
              backgroundColor: colors.background,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              color: colors.foreground,
              borderWidth: 1,
              borderColor: colors.border,
              textAlignVertical: "top",
            }}
          />

          {/* Submit Button */}
          <Pressable
            onPress={handleCreateTicket}
            disabled={createTicket.isPending}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingVertical: 12,
                alignItems: "center",
                opacity: pressed || createTicket.isPending ? 0.7 : 1,
              },
            ]}
          >
            {createTicket.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={{ color: "#ffffff", fontSize: 14, fontWeight: "600" }}>
                Enviar Ticket
              </Text>
            )}
          </Pressable>
        </View>

        {/* My Tickets */}
        <View>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Mis Tickets
          </Text>

          {myTickets.isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : myTickets.data && myTickets.data.length > 0 ? (
            myTickets.data.map((ticket) => (
              <View
                key={ticket.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: "600" }}>
                      {ticket.subject}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                      #{ticket.id}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor:
                        ticket.status === "open"
                          ? colors.warning
                          : ticket.status === "resolved"
                            ? colors.success
                            : colors.muted,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontSize: 10, fontWeight: "600" }}>
                      {ticket.status === "open" && "Abierto"}
                      {ticket.status === "in_progress" && "En Progreso"}
                      {ticket.status === "resolved" && "Resuelto"}
                      {ticket.status === "closed" && "Cerrado"}
                    </Text>
                  </View>
                </View>

                <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
                  {ticket.description.substring(0, 100)}...
                </Text>

                <Text style={{ color: colors.muted, fontSize: 10 }}>
                  Creado: {new Date(ticket.createdAt).toLocaleDateString("es-ES")}
                </Text>
              </View>
            ))
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <Text style={{ color: colors.muted, fontSize: 14 }}>
                No tienes tickets de soporte
              </Text>
            </View>
          )}
        </View>

        {/* FAQ Section */}
        <View style={{ marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Preguntas Frecuentes
          </Text>

          {[
            {
              q: "¿Cómo puedo cambiar mi método de pago?",
              a: "Ve a Configuración → Métodos de Pago para agregar o cambiar tu método.",
            },
            {
              q: "¿Qué hago si tengo un problema de seguridad?",
              a: "Reporta al usuario desde su perfil o crea un ticket en la categoría 'Seguridad'.",
            },
            {
              q: "¿Cuánto tiempo tarda la verificación?",
              a: "La verificación generalmente toma 24-48 horas. Te notificaremos cuando esté lista.",
            },
          ].map((item, idx) => (
            <View key={idx} style={{ marginBottom: 12 }}>
              <Text style={{ color: colors.foreground, fontSize: 12, fontWeight: "600" }}>
                Q: {item.q}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>
                A: {item.a}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
