import { Image, Text, View } from "react-native";

/** Foto de perfil redonda; si no hay foto, la inicial del nombre. */
export function Avatar({
  name,
  photoUrl,
  size = 44,
  color = "#0a7ea4",
}: {
  name: string;
  photoUrl?: string | null;
  size?: number;
  color?: string;
}) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={{ ...style, backgroundColor: "#e5e7eb" }} />;
  }
  return (
    <View style={{ ...style, backgroundColor: color, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: size * 0.42 }}>{(name || "?").charAt(0).toUpperCase()}</Text>
    </View>
  );
}
