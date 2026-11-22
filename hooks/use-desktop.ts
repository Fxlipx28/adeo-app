import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";

/**
 * true en pantallas anchas de la web (computador). Empieza en false y se actualiza
 * después de montar para no desincronizar el HTML estático con el cliente.
 */
export function useIsDesktop(): boolean {
  const { width } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted && Platform.OS === "web" && width >= 900;
}
