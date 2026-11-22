import { useEffect, useRef } from "react";
import { createElement } from "react";
import type { TripMapProps } from "./trip-map-types";
import { CHILE_CENTER } from "./trip-map-types";

/**
 * Mapa interactivo (web) con Leaflet + OpenStreetMap: zoom con rueda/pellizco,
 * arrastre, y pines con la foto del primer conductor + contador "+N".
 *
 * Tiles: por defecto CARTO "Voyager" (estilo limpio y claro, gratis para pruebas/uso no comercial).
 * OpenStreetMap bloquea el uso desde apps sin su política (error 403). En producción
 * define EXPO_PUBLIC_TILE_URL con un proveedor con licencia (MapTiler, Stadia, Mapbox, CARTO).
 */
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const TILE_URL = process.env.EXPO_PUBLIC_TILE_URL ?? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";

let leafletPromise: Promise<any> | null = null;
function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = LEAFLET_CSS;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = LEAFLET_JS;
    js.onload = () => resolve(w.L);
    js.onerror = () => reject(new Error("No se pudo cargar el mapa"));
    document.head.appendChild(js);
  });
  return leafletPromise;
}

/** Pin: foto (o inicial) en círculo, contador +N y anillo naranja si está seleccionado. */
function buildPin(opts: { name: string; photoUrl: string | null; extra: number; selected: boolean; label: string }) {
  const size = opts.selected ? 56 : 46;
  const root = document.createElement("div");
  root.style.cssText = `position:relative;width:${size}px;height:${size}px;cursor:pointer`;

  const ring = document.createElement("div");
  ring.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:#fff;box-sizing:border-box;padding:3px;box-shadow:0 4px 14px rgba(15,23,42,.3);border:${opts.selected ? "4px solid #f97316" : "3px solid #0a7ea4"}`;

  const url = opts.photoUrl && /^(https?:\/\/|\/|data:image\/)/.test(opts.photoUrl) ? opts.photoUrl : null;
  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = opts.name;
    img.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;display:block";
    ring.appendChild(img);
  } else {
    const ini = document.createElement("div");
    ini.textContent = (opts.name || "?").charAt(0).toUpperCase();
    ini.style.cssText = "width:100%;height:100%;border-radius:50%;background:#0a7ea4;color:#fff;font:700 18px sans-serif;display:flex;align-items:center;justify-content:center";
    ring.appendChild(ini);
  }
  root.appendChild(ring);

  if (opts.extra > 0) {
    const badge = document.createElement("div");
    badge.textContent = `+${opts.extra}`;
    badge.style.cssText = "position:absolute;top:-6px;right:-8px;min-width:22px;height:22px;border-radius:11px;padding:0 6px;background:#0f172a;color:#fff;font:700 12px sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #fff";
    root.appendChild(badge);
  }

  const label = document.createElement("div");
  label.textContent = opts.label;
  label.style.cssText = `position:absolute;left:50%;top:${size + 2}px;transform:translateX(-50%);white-space:nowrap;font:700 12px sans-serif;color:${opts.selected ? "#c2410c" : "#334155"};text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff`;
  root.appendChild(label);
  return root;
}

export function TripMap({ groups, selectedKey, onSelect, height = 380 }: TripMapProps) {
  const el = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const fittedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Crear el mapa una sola vez
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !el.current || mapRef.current) return;
      const map = L.map(el.current, { zoomControl: true, attributionControl: true }).setView([CHILE_CENTER.lat, CHILE_CENTER.lng], 6);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: "Tiles &copy; Esri" }).addTo(map);
      map.on("click", () => onSelectRef.current(null));
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      // Recalcular tamaño cuando el contenedor cambie (evita que el mapa quede con zoom mínimo)
      if (typeof ResizeObserver !== "undefined" && el.current) {
        new ResizeObserver(() => map.invalidateSize()).observe(el.current);
      }
      setTimeout(() => map.invalidateSize(), 100);
      (window as any).__adeoRedraw?.();
    });
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Dibujar pines y rutas cuando cambian los datos
  useEffect(() => {
    const draw = () => {
      const L = (window as any).L;
      const map = mapRef.current;
      const layer = layerRef.current;
      if (!L || !map || !layer) return;
      map.invalidateSize();
      layer.clearLayers();

      const sel = groups.find((g) => g.key === selectedKey) ?? null;
      if (sel) {
        for (const t of sel.trips) {
          if (t.originLat == null || t.originLng == null) continue;
          L.polyline([[t.originLat, t.originLng], [sel.lat, sel.lng]], { color: "#f97316", weight: 4, opacity: 0.7, dashArray: "8 8" }).addTo(layer);
          L.circleMarker([t.originLat, t.originLng], { radius: 6, color: "#fff", weight: 2, fillColor: "#0a7ea4", fillOpacity: 1 }).addTo(layer);
        }
      }

      for (const g of groups) {
        const selected = g.key === selectedKey;
        const icon = L.divIcon({
          className: "",
          html: buildPin({ name: g.first.firstName, photoUrl: g.first.photoUrl, extra: g.extra, selected, label: g.label }),
          iconSize: [0, 0],
          iconAnchor: [selected ? 28 : 23, selected ? 28 : 23],
        });
        const m = L.marker([g.lat, g.lng], { icon, zIndexOffset: selected ? 1000 : 0 }).addTo(layer);
        m.on("click", (e: any) => {
          L.DomEvent.stopPropagation(e);
          onSelectRef.current(g.key);
        });
      }

      if (sel) {
        const pts = [[sel.lat, sel.lng], ...sel.trips.filter((t) => t.originLat != null).map((t) => [t.originLat, t.originLng])];
        map.flyToBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 11, duration: 0.6 });
      } else if (!fittedRef.current && groups.length > 0) {
        fittedRef.current = true;
        map.fitBounds(L.latLngBounds(groups.map((g) => [g.lat, g.lng])), { padding: [60, 60], maxZoom: 9 });
      }
    };
    (window as any).__adeoRedraw = draw;
    draw();
  }, [groups, selectedKey]);

  return createElement("div", { ref: el, style: { width: "100%", height, background: "#e9f2f8", borderRadius: 0 } });
}
