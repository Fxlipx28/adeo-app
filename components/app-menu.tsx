import { createContext, useContext, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/avatar";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";

type IconName = React.ComponentProps<typeof MaterialIcons>["name"];

const MenuCtx = createContext<{ open: () => void }>({ open: () => {} });
export const useAppMenu = () => useContext(MenuCtx);

/** Menú lateral (las 3 rayitas): verificación, SOS, soporte, configuración y legales. */
export function AppMenuProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const me = trpc.auth.me.useQuery();
  const profile = trpc.profile.mine.useQuery(undefined, { enabled: !!me.data });

  const go = (path: string) => {
    setVisible(false);
    setTimeout(() => router.push(path as never), 60);
  };

  const item = (icon: IconName, label: string, path: string, opts?: { danger?: boolean; hint?: string }) => (
    <Pressable
      key={path}
      onPress={() => go(path)}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 13,
        paddingHorizontal: 12,
        borderRadius: 14,
        backgroundColor: pressed ? colors.surface : "transparent",
      })}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: opts?.danger ? "#F8E1DB" : colors.surface,
        }}
      >
        <MaterialIcons name={icon} size={20} color={opts?.danger ? colors.error : colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ color: opts?.danger ? colors.error : colors.foreground, fontSize: 15, fontWeight: "600" }}>{label}</Text>
        {opts?.hint ? <Text style={{ color: colors.muted, fontSize: 12, marginTop: 1 }}>{opts.hint}</Text> : null}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.border} />
    </Pressable>
  );

  const section = (title: string) => (
    <Text style={{ color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 14, marginBottom: 4, marginLeft: 12 }}>
      {title}
    </Text>
  );

  return (
    <MenuCtx.Provider value={{ open: () => setVisible(true) }}>
      {children}
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
          <Pressable onPress={() => setVisible(false)} style={{ ...absoluteFill, backgroundColor: "rgba(20,32,27,0.45)" }} />
          <View
            style={{
              width: "86%",
              maxWidth: 360,
              backgroundColor: colors.background,
              paddingTop: Math.max(insets.top, 16),
              paddingBottom: Math.max(insets.bottom, 12),
              borderTopLeftRadius: 28,
              borderBottomLeftRadius: 28,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14 }}>
              <Avatar name={me.data?.name || "Adeo"} photoUrl={profile.data?.photoUrl} size={52} color={colors.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: colors.foreground, fontSize: 17, fontWeight: "800" }} numberOfLines={1}>
                  {me.data?.name || "Viajero Adeo"}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                  {me.data?.email || "Comparte el viaje, comparte el costo"}
                </Text>
              </View>
              <Pressable onPress={() => setVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 16 }}>
              {item("sos", "SOS y seguridad", "/safety", { danger: true, hint: "Contacto de confianza y emergencias" })}
              {section("MI CUENTA")}
              {item("verified-user", "Verificar identidad", "/verification", { hint: "Obligatorio para viajar y publicar" })}
              {item("settings", "Configuración", "/settings")}
              {section("AYUDA")}
              {item("support-agent", "Soporte", "/support")}
              {item("description", "Términos de uso", "/legal/terms")}
              {item("lock", "Política de privacidad", "/legal/privacy")}
            </ScrollView>

            <Text style={{ color: colors.muted, fontSize: 11, textAlign: "center" }}>Adeo · versión demo</Text>
          </View>
        </View>
      </Modal>
    </MenuCtx.Provider>
  );
}

const absoluteFill = { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 } as const;

/** Botón de 3 rayitas. `floating` lo dibuja como botón blanco con sombra sobre el mapa. */
export function MenuButton({ floating = false }: { floating?: boolean }) {
  const { open } = useAppMenu();
  const colors = useColors();
  return (
    <Pressable
      onPress={open}
      accessibilityLabel="Abrir menú"
      hitSlop={8}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: floating ? "#fff" : colors.surface,
        opacity: pressed ? 0.8 : 1,
        ...(floating ? { shadowColor: "#1D2A24", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 } : {}),
      })}
    >
      <MaterialIcons name="menu" size={24} color={colors.foreground} />
    </Pressable>
  );
}
