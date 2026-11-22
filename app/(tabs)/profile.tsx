import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Avatar } from "@/components/avatar";
import { AppHeader } from "@/components/app-header";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { useRatings } from "@/hooks/use-ratings";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const currentUser = trpc.auth.me.useQuery();
  const { getAverageRating } = useRatings();
  const averageRating = currentUser.data ? getAverageRating(currentUser.data.id) : null;
  const logoutMutation = trpc.auth.logout.useMutation({ onSuccess: () => utils.auth.me.invalidate() });

  const utils = trpc.useUtils();
  const myProfile = trpc.profile.mine.useQuery(undefined, { enabled: !!currentUser.data });
  const setPhoto = trpc.profile.setPhoto.useMutation({
    onSuccess: () => utils.profile.mine.invalidate(),
    onError: (e) => Alert.alert("Error", e.message),
  });

  const changePhoto = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    const asset = r.canceled ? null : r.assets?.[0];
    if (!asset?.base64) return;
    setPhoto.mutate({ mimeType: asset.mimeType === "image/png" ? "image/png" : "image/jpeg", base64: asset.base64 });
  };

  if (currentUser.isLoading) {
    return (
      <ScreenContainer>
        <AppHeader title="Perfil" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  if (!currentUser.data) {
    return (
      <ScreenContainer>
        <AppHeader title="Perfil" />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
          <MaterialIcons name="account-circle" size={56} color={colors.border} />
          <Text style={{ color: colors.muted, marginTop: 8, textAlign: "center" }}>Inicia sesión para ver tu perfil.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const name = currentUser.data.name || "Viajero Adeo";
  const rating = averageRating?.data?.averageRating || 0;
  const trips = averageRating?.data?.totalRatings || 0;
  const since = new Date(currentUser.data.createdAt).toLocaleDateString("es-CL", { year: "numeric", month: "short" });

  const row = (icon: IconName, label: string, hint: string, path: string, danger = false) => (
    <Pressable
      key={path}
      onPress={() => router.push(path as never)}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14, opacity: pressed ? 0.7 : 1 })}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: danger ? "#F8E1DB" : colors.surface }}>
        <MaterialIcons name={icon} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: danger ? colors.error : colors.foreground, fontSize: 15, fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>{hint}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.border} />
    </Pressable>
  );

  const stat = (value: string, label: string) => (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "800" }}>{value}</Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );

  return (
    <ScreenContainer>
      <AppHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28 }}>
        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 24, overflow: "hidden", marginBottom: 14 }}>
          <View style={{ height: 70, backgroundColor: colors.primary }} />
          <View style={{ alignItems: "center", marginTop: -40, paddingBottom: 18 }}>
            <Pressable onPress={changePhoto} style={{ alignItems: "center" }}>
              <View style={{ borderWidth: 4, borderColor: "#fff", borderRadius: 52 }}>
                <Avatar name={name} photoUrl={myProfile.data?.photoUrl} size={96} color={colors.accent} />
              </View>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700", marginTop: 6 }}>
                {setPhoto.isPending ? "Subiendo…" : "Cambiar foto"}
              </Text>
            </Pressable>
            <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 6 }}>{name}</Text>
            <Text style={{ color: colors.muted, fontSize: 13 }}>{currentUser.data.email || "Correo no disponible"}</Text>
            <View style={{ flexDirection: "row", width: "100%", marginTop: 16, paddingHorizontal: 12 }}>
              {stat(rating ? `★ ${rating.toFixed(1)}` : "—", "Calificación")}
              {stat(String(trips), "Valoraciones")}
              {stat(since, "Miembro desde")}
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, borderRadius: 20, marginBottom: 14 }}>
          {row("verified-user", "Verificar identidad", "Obligatorio para viajar y publicar", "/verification")}
          {row("sos", "SOS y seguridad", "Contacto de confianza y emergencias", "/safety", true)}
          {row("settings", "Configuración", "País, idioma y cuenta", "/settings")}
          {row("support-agent", "Soporte", "Reporta un problema o pregunta", "/support")}
        </View>

        <Pressable
          onPress={() => logoutMutation.mutate()}
          style={({ pressed }) => ({
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 15,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.error, fontSize: 15, fontWeight: "700" }}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
