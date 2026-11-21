import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Avatar } from "@/components/avatar";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRatings } from "@/hooks/use-ratings";

export default function ProfileScreen() {
  const colors = useColors();
  const currentUser = trpc.auth.me.useQuery();
  const { getAverageRating } = useRatings();
  const averageRating = currentUser.data ? getAverageRating(currentUser.data.id) : null;

  const logoutMutation = trpc.auth.logout.useMutation();

  const utils = trpc.useUtils();
  const myProfile = trpc.profile.mine.useQuery(undefined, { enabled: !!currentUser.data });
  const setPhoto = trpc.profile.setPhoto.useMutation({
    onSuccess: () => utils.profile.mine.invalidate(),
    onError: (e) => Alert.alert("Error", e.message),
  });

  const changePhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    const asset = r.canceled ? null : r.assets?.[0];
    if (!asset?.base64) return;
    setPhoto.mutate({ mimeType: asset.mimeType === "image/png" ? "image/png" : "image/jpeg", base64: asset.base64 });
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleEditProfile = () => {
    console.log("Edit profile");
  };

  if (currentUser.isLoading) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!currentUser.data) {
    return (
      <ScreenContainer className="p-4">
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: colors.muted }}>No hay datos de usuario</Text>
        </View>
      </ScreenContainer>
    );
  }

  const user = {
    name: currentUser.data.name || "Usuario",
    email: currentUser.data.email || "No disponible",
    phone: "+56 9 1234 5678",
    rating: averageRating?.data?.averageRating || 0,
    trips: averageRating?.data?.totalRatings || 0,
    joinDate: new Date(currentUser.data.createdAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    }),
    bio: "Viajero de Adeo",
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Pressable onPress={changePhoto} style={{ marginBottom: 12 }}>
            <Avatar name={user.name} photoUrl={myProfile.data?.photoUrl} size={100} color={colors.primary} />
            <Text style={{ color: colors.primary, fontSize: 12, textAlign: "center", marginTop: 6 }}>
              {setPhoto.isPending ? "Subiendo…" : "Cambiar foto"}
            </Text>
          </Pressable>

          <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "bold" }}>
            {user.name}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 18, fontWeight: "bold" }}>
              ★ {user.rating.toFixed(1)}
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
            <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 4 }}>
              Calificación
            </Text>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: "bold" }}>
              {user.rating.toFixed(1)}
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
          <Text style={{ color: colors.error, fontSize: 16, fontWeight: "600" }}>
            Cerrar Sesión
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
