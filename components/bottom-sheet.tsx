import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder, Platform, ScrollView, View } from "react-native";
import { useColors } from "@/hooks/use-colors";

export type Snap = "peek" | "half" | "full";
export const PEEK_HEIGHT = 176;

/**
 * Hoja inferior estilo Google Maps: se arrastra desde la manija/encabezado
 * entre tres posiciones (asomada, mitad, completa).
 */
export function BottomSheet({
  containerHeight,
  snap,
  onSnapChange,
  header,
  children,
}: {
  containerHeight: number;
  snap: Snap;
  onSnapChange: (s: Snap) => void;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const heights = useMemo(
    () => ({ peek: PEEK_HEIGHT, half: Math.round(containerHeight * 0.52), full: Math.max(containerHeight - 88, PEEK_HEIGHT + 80) }),
    [containerHeight],
  );
  const h = useRef(new Animated.Value(PEEK_HEIGHT)).current;
  const current = useRef(PEEK_HEIGHT);
  const start = useRef(PEEK_HEIGHT);
  const heightsRef = useRef(heights);
  heightsRef.current = heights;
  const snapRef = useRef(snap);
  snapRef.current = snap;
  const cbRef = useRef(onSnapChange);
  cbRef.current = onSnapChange;

  useEffect(() => {
    const id = h.addListener(({ value }) => (current.current = value));
    return () => h.removeListener(id);
  }, [h]);

  useEffect(() => {
    Animated.timing(h, { toValue: heights[snap], duration: 240, useNativeDriver: false }).start();
  }, [snap, heights, h]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          h.stopAnimation();
          start.current = current.current;
        },
        onPanResponderMove: (_, g) => {
          const hs = heightsRef.current;
          h.setValue(Math.min(hs.full, Math.max(hs.peek, start.current - g.dy)));
        },
        onPanResponderRelease: (_, g) => {
          const hs = heightsRef.current;
          const order: Snap[] = ["peek", "half", "full"];
          let target: Snap;
          if (Math.abs(g.dy) < 6) {
            // toque en la manija: alterna entre asomada y mitad
            target = snapRef.current === "peek" ? "half" : "peek";
          } else if (Math.abs(g.vy) > 0.6) {
            const i = order.indexOf(snapRef.current);
            target = order[Math.min(2, Math.max(0, i + (g.vy < 0 ? 1 : -1)))];
          } else {
            const cur = current.current;
            target = order.reduce((best, s) => (Math.abs(hs[s] - cur) < Math.abs(hs[best] - cur) ? s : best), "peek" as Snap);
          }
          cbRef.current(target);
          Animated.timing(h, { toValue: hs[target], duration: 200, useNativeDriver: false }).start();
        },
      }),
    [h],
  );

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: h,
        zIndex: 20,
        backgroundColor: colors.background,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden",
        shadowColor: "#1D2A24",
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: -6 },
        elevation: 16,
      }}
    >
      <View
        {...pan.panHandlers}
        style={[{ paddingTop: 10, paddingHorizontal: 18, paddingBottom: 8 }, Platform.OS === "web" ? ({ userSelect: "none", cursor: "grab", touchAction: "none" } as object) : null]}
      >
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 10 }} />
        {header}
      </View>
      <ScrollView
        scrollEnabled={snap !== "peek"}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 28, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}
