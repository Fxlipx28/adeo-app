import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import { t } from "@/lib/i18n";

export interface Picked {
  name: string;
  lat: number;
  lng: number;
}

/** Campo de lugar: escribes, presionas Buscar y eliges un resultado del mapa (OpenStreetMap). */
export function PlaceField({ label, value, onPick, country }: { label: string; value: Picked | null; onPick: (p: Picked) => void; country: string }) {
  const colors = useColors();
  const utils = trpc.useUtils();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ name: string; label: string; lat: number; lng: number }[]>([]);

  const search = async () => {
    if (q.trim().length < 3) return;
    setBusy(true);
    try {
      setResults(await utils.places.search.fetch({ q: q.trim(), countryCode: country }));
    } catch (e: any) {
      Alert.alert(t("error"), e?.message ?? "No se pudo buscar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "600", marginBottom: 6 }}>{label.toUpperCase()}</Text>
      {value && (
        <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 }}>
          <Text style={{ color: colors.foreground, fontWeight: "700" }}>📍 {value.name}</Text>
        </View>
      )}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={q}
          onChangeText={setQ}
          onSubmitEditing={search}
          returnKeyType="search"
          placeholder="Ej: Viña del Mar, Terminal Alameda…"
          placeholderTextColor={colors.muted}
          style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.foreground }}
        />
        <Pressable onPress={search} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 16, justifyContent: "center" }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "600" }}>Buscar</Text>}
        </Pressable>
      </View>
      {results.map((r, i) => (
        <Pressable
          key={`${r.lat},${r.lng},${i}`}
          onPress={() => {
            onPick({ name: r.name, lat: r.lat, lng: r.lng });
            setResults([]);
            setQ("");
          }}
          style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "600" }}>{r.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
            {r.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

