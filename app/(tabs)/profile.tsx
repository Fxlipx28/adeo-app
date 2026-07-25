import { ScrollView, Text, View, Pressable, Image } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function ProfileScreen() {
  const colors = useColors();

  // Mock user data - será reemplazado con datos reales
  const user = {
    name: "Juan Pérez",
    email: "juan@example.com",
    phone: "+56 9 1234 5678",
    rating: 4.8,
    trips: 12,
    joinDate: "Enero 2024",
    bio: "Viajero apasionado por conocer nuevos lugares",
  };

  const handleLogout = () => {
    // Implementar logout
    console.log("Logout");
  };

  const handleEditProfile = () => {
    // Navegar a editar perfil
    console.log("Edit profile");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.primary,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 40, fontWeight: "bold" }}>
              {user.name.charAt(0)}
            </Text>
          </View>

          <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "bold" }}>
            {user.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>
              ★ {user.rating}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 14, marginLeft: 8 }}>
              ({user.trips} viajes)
            </Text>
          </View>
        </View>

        {/* User Info */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Email</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {user.email}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Teléfono</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {user.phone}
            </Text>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Miembro desde</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {user.joinDate}
            </Text>
          </View>

          <View>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Biografía</Text>
            <Text style={{ color: colors.foreground, fontSize: 14, marginTop: 4 }}>
              {user.bio}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Viajes</Text>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "bold" }}>
              {user.trips}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>Calificación</Text>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "bold" }}>
              {user.rating}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Pressable
          onPress={handleEditProfile}
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              marginBottom: 12,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "600" }}>
            Editar Perfil
          </Text>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            {
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}>Cerrar Sesión</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
