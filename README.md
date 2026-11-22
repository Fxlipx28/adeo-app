# Adeo — viajes compartidos (Chile primero, mundial después)

Comparte el viaje, comparte el costo. App Expo (web + iOS + Android) con backend tRPC.

## Ver la app en 2 minutos (sin base de datos ni login)

```bash
git fetch origin
git checkout feature/chile-mvp
git pull
pnpm install
pnpm demo
```

Abre `http://localhost:8081` (en GitHub Codespaces: pestaña **Ports** → puerto **8081** → "Abrir en el navegador").
`pnpm demo` usa datos de ejemplo: mapa con zoom, pines con foto, reservar, publicar, SOS. No guarda nada.

## App completa (servidor + MySQL)

1. `cp .env.example .env` y completa `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`.
2. `pnpm db:push` (crea/actualiza las tablas).
3. `REQUIRE_VERIFICATION=false pnpm dev` (sin verificación de identidad, solo para desarrollo).

## Si `git` te da error

| Mensaje | Qué hacer |
|---|---|
| `pathspec 'feature/chile-mvp' did not match` | `git fetch origin` y repite el `checkout` |
| `Your local changes would be overwritten` | `git stash` y luego `git pull` |
| `divergent branches` / conflictos | `git fetch origin && git reset --hard origin/feature/chile-mvp` (**borra cambios locales**) |
| `not a git repository` | Entra a la carpeta del proyecto: `cd adeo-app` |

## Variables opcionales de mapas
- `EXPO_PUBLIC_TILE_URL`: proveedor de mapa propio (MapTiler, Stadia, Mapbox). El de OpenStreetMap es solo para pruebas.
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY`: activa Street View dentro de la app (Maps Embed API). Sin key, el botón abre Street View en Google Maps.

## Publicar la demo web (GitHub Pages)
`pnpm build:pages` y subir `dist-pages` a la rama `gh-pages`.

Más detalle legal y de diseño: `docs/LEGAL_CHILE.md`, `todo.md`.
