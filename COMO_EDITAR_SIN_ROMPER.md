# 🛠️ Cómo Editar Archivos Sin Romper Nada

Esta guía te enseña DÓNDE y CÓMO editar cada tipo de archivo sin quebrar la app.

---

## 1️⃣ EDITAR PANTALLAS (Archivos en `app/(tabs)/`)

### Dónde: `app/(tabs)/index.tsx`

**SEGURO - Puedes cambiar:**
- Textos que ves en pantalla
- Colores de botones
- Tamaño de fuentes
- Agregar nuevos campos de búsqueda

**EJEMPLO - Cambiar el título:**
```typescript
// ANTES:
<Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
  Buscar Viaje
</Text>

// DESPUÉS:
<Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
  🚗 Busca tu Viaje Perfecto
</Text>
```

**PELIGROSO - NO cambies:**
- Nombres de funciones (como `handleSearch`)
- Importaciones (como `import { trpc }`)
- Estructura de componentes (como `<ScreenContainer>`)

---

## 2️⃣ EDITAR COLORES (Archivo `theme.config.js`)

### Dónde: `theme.config.js`

**SEGURO - Puedes cambiar:**
- Valores de colores (hex, rgb, etc.)
- Agregar nuevos colores

**EJEMPLO - Cambiar color principal:**
```javascript
// ANTES:
primary: { light: '#0a7ea4', dark: '#0a7ea4' }

// DESPUÉS (rojo):
primary: { light: '#FF0000', dark: '#CC0000' }
```

**Después de cambiar:** Guarda y recarga la app en el navegador. ¡Los cambios aparecen automáticamente!

---

## 3️⃣ EDITAR CONFIGURACIÓN (Archivo `app.config.ts`)

### Dónde: `app.config.ts`

**SEGURO - Puedes cambiar:**
- `appName` - Nombre de la app
- `version` - Número de versión

**EJEMPLO - Cambiar nombre:**
```typescript
// ANTES:
appName: "Adeo",

// DESPUÉS:
appName: "Adeo - Viajes Compartidos",
```

**PELIGROSO - NO cambies:**
- `appSlug` - Identificador único (rompe todo)
- `iosBundleId` - Identificador de iOS
- `androidPackage` - Identificador de Android

---

## 4️⃣ EDITAR LÓGICA DEL SERVIDOR (Archivos en `server/routers/`)

### Dónde: `server/routers/trips.ts`

**SEGURO - Puedes cambiar:**
- Mensajes de error
- Validaciones (qué datos se aceptan)
- Agregar nuevas funciones

**EJEMPLO - Cambiar validación:**
```typescript
// ANTES:
const trip = await db.select().from(trips).where(eq(trips.id, input.tripId));

// DESPUÉS (agregar validación):
const trip = await db.select().from(trips).where(eq(trips.id, input.tripId));
if (!trip[0]) {
  throw new Error("Viaje no encontrado - ID inválido");
}
```

**PELIGROSO - NO cambies:**
- Nombres de funciones (como `list`, `publish`)
- Nombres de parámetros
- Estructura de respuestas

---

## 5️⃣ AGREGAR NUEVAS FUNCIONES A LA API

### Paso 1: Edita `server/routers/trips.ts`

Agrega una nueva función al final:

```typescript
/**
 * Obtener viajes cercanos (nueva función)
 */
getNearby: publicProcedure
  .input(z.object({ latitude: z.number(), longitude: z.number() }))
  .query(async ({ input }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      // TODO: Implementar búsqueda por ubicación
      return [];
    } catch (error) {
      console.error("Error fetching nearby trips:", error);
      return [];
    }
  }),
```

### Paso 2: Usa la función en una pantalla

En `app/(tabs)/index.tsx`:

```typescript
// Importa el hook
import { useTrips } from "@/hooks/use-trips";

// Usa la función
const { getNearby } = useTrips();

// Llama la función
const nearbyTrips = await getNearby.mutateAsync({
  latitude: -33.8688,
  longitude: -51.2093
});
```

---

## 6️⃣ AGREGAR NUEVAS TABLAS A LA BD

### Paso 1: Edita `drizzle/schema.ts`

Agrega una nueva tabla al final:

```typescript
/**
 * Reviews table - Reseñas de viajes
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
```

### Paso 2: Genera la migración

En la terminal:
```bash
pnpm drizzle-kit generate
```

### Paso 3: Aplica la migración

```bash
pnpm db:push
```

---

## 7️⃣ AGREGAR NUEVOS CAMPOS A UNA TABLA

### Paso 1: Edita `drizzle/schema.ts`

En la tabla `trips`, agrega un nuevo campo:

```typescript
export const trips = mysqlTable("trips", {
  // ... campos existentes ...
  
  // NUEVO CAMPO:
  carModel: varchar("carModel", { length: 100 }),
  carColor: varchar("carColor", { length: 50 }),
});
```

### Paso 2: Genera y aplica migración

```bash
pnpm drizzle-kit generate
pnpm db:push
```

---

## 8️⃣ EDITAR HOOKS (Archivos en `hooks/`)

### Dónde: `hooks/use-trips.ts`

**SEGURO - Puedes cambiar:**
- Lógica de transformación de datos
- Agregar validaciones
- Cambiar nombres de variables locales

**EJEMPLO - Agregar validación:**
```typescript
// ANTES:
const trips = await db.select().from(trips);

// DESPUÉS (con validación):
const trips = await db.select().from(trips);
if (!trips || trips.length === 0) {
  console.warn("No trips found");
  return [];
}
return trips;
```

**PELIGROSO - NO cambies:**
- Nombre del hook (como `useTrips`)
- Nombres de funciones exportadas
- Tipos de datos retornados

---

## 9️⃣ AGREGAR NUEVAS PANTALLAS

### Paso 1: Crea un archivo nuevo

Crea `app/(tabs)/messages.tsx`:

```typescript
import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function MessagesScreen() {
  const colors = useColors();

  return (
    <ScreenContainer className="p-4">
      <ScrollView>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "bold" }}>
          Mensajes
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}
```

### Paso 2: Agrega la pestaña en `app/(tabs)/_layout.tsx`

```typescript
<Tabs.Screen
  name="messages"
  options={{
    title: "Mensajes",
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="envelope.fill" color={color} />,
  }}
/>
```

### Paso 3: Agrega el icono en `components/ui/icon-symbol.tsx`

```typescript
const MAPPING = {
  // ... iconos existentes ...
  "envelope.fill": "mail",
};
```

---

## 🔟 CHECKLIST: ANTES DE GUARDAR

Antes de guardar cambios, verifica:

- [ ] ¿Guardé el archivo? (Ctrl+S)
- [ ] ¿Aparecen errores en la terminal? (Si es sí, léelos y corrígelos)
- [ ] ¿Se recargó la app en el navegador?
- [ ] ¿Funcionan los cambios?

---

## ⚠️ SI ALGO SE ROMPE

### Error: "Cannot find module"
**Solución:** Verifica que el nombre del archivo sea correcto
```typescript
// INCORRECTO:
import { useTrips } from "@/hooks/use-trip"; // Falta la "s"

// CORRECTO:
import { useTrips } from "@/hooks/use-trips";
```

### Error: "Property does not exist"
**Solución:** Verifica que la función exista
```typescript
// INCORRECTO:
const { listTrips, publishTrip, getNeaby } = useTrips(); // Typo: "getNeaby"

// CORRECTO:
const { listTrips, publishTrip, getNearby } = useTrips();
```

### Error: "Unexpected token"
**Solución:** Verifica que no falten llaves o paréntesis
```typescript
// INCORRECTO:
<Text>Hola</Text // Falta >

// CORRECTO:
<Text>Hola</Text>
```

### La app no se recarga
**Solución:** Reinicia el servidor
```bash
# Presiona Ctrl+C en la terminal
pnpm dev
```

---

## 🎯 RESUMEN: QUÉ PUEDES HACER

| Acción | Dónde | Riesgo |
|--------|-------|--------|
| Cambiar textos | `app/(tabs)/*.tsx` | Bajo |
| Cambiar colores | `theme.config.js` | Bajo |
| Cambiar nombre app | `app.config.ts` | Bajo |
| Agregar validaciones | `server/routers/*.ts` | Medio |
| Agregar nuevas funciones | `server/routers/*.ts` | Medio |
| Agregar nuevas pantallas | `app/(tabs)/*.tsx` | Medio |
| Agregar nuevas tablas | `drizzle/schema.ts` | Alto |
| Cambiar estructura BD | `drizzle/schema.ts` | Alto |

---

¡Ahora sabes dónde editar sin miedo! 🎉
