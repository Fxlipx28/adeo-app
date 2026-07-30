# ⚡ Primeros Pasos - Guía Rápida

## 1️⃣ DESCARGAR Y EXTRAER

1. Click en **"More"** (⋯) → **"Download as ZIP"**
2. Extrae el ZIP en tu computadora
3. Abre la carpeta `adeo-app`

---

## 2️⃣ INSTALAR PNPM (si no lo tienes)

Abre PowerShell/Terminal y escribe:
```bash
npm install -g pnpm
```

---

## 3️⃣ INSTALAR DEPENDENCIAS

En la carpeta `adeo-app`, escribe:
```bash
pnpm install
```

**Espera a que termine** (puede tardar 2-5 minutos)

---

## 4️⃣ INICIAR EL PROYECTO

```bash
pnpm dev
```

Verás:
```
Metro Bundler started on http://localhost:8081
API server started on http://localhost:3000
```

---

## 5️⃣ ABRIR EN VS CODE

1. Abre VS Code
2. **File → Open Folder** → Selecciona `adeo-app`
3. Listo! Ahora puedes editar

---

## 6️⃣ EDITAR Y VER CAMBIOS

- **Edita un archivo** (ej: `app/(tabs)/index.tsx`)
- **Guarda** (Ctrl+S)
- **Recarga** http://localhost:8081 en el navegador
- ¡Ves los cambios automáticamente!

---

## 📂 ARCHIVOS IMPORTANTES

| Archivo | Qué hace |
|---------|----------|
| `app/(tabs)/index.tsx` | Pantalla de búsqueda |
| `app/(tabs)/profile.tsx` | Pantalla de perfil |
| `server/routers/trips.ts` | Lógica de viajes |
| `drizzle/schema.ts` | Estructura de BD |
| `theme.config.js` | Colores de la app |
| `app.config.ts` | Nombre y versión de la app |

---

## 🆘 SI ALGO NO FUNCIONA

```bash
# Reinicia el servidor
# Presiona Ctrl+C para detener
# Luego:
pnpm dev

# Si sigue sin funcionar:
rm -rf node_modules
pnpm install
pnpm dev
```

---

## 🎯 PRÓXIMO: Lee la guía completa

Abre `GUIA_EXPORTACION_VSCODE.md` para entender toda la estructura en detalle.

---

¡Éxito! 🚀
