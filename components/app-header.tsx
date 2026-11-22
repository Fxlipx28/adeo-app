import { Text, View } from "react-native";
import { MenuButton } from "@/components/app-menu";
import { useColors } from "@/hooks/use-colors";

/** Encabezado de las pestañas: título a la izquierda y menú (3 rayitas) arriba a la derecha. */
export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.foreground, fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }}>{title}</Text>
        {subtitle ? <Text style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      <MenuButton />
    </View>
  );
}
