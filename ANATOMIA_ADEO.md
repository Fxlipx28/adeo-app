# 🔬 Anatomía de Adeo - Qué Hace Cada Archivo

Este documento explica **QUÉ HACE** cada archivo y carpeta en Adeo, paso a paso.

---

## 📱 PARTE 1: LO QUE VES EN LA PANTALLA (Carpeta `app/`)

### `app/_layout.tsx`
**¿Qué es?** El "esqueleto" principal de la app.
**¿Qué hace?** Define cómo se estructura toda la aplicación, qué proveedores (providers) se usan, y cómo se conecta todo.
**Analógía:** Es como el marco de una casa - todo lo demás se construye dentro de él.

```typescript
// Aquí se definen:
// - Tema (colores claros/oscuros)
// - Autenticación
// - Rutas de navegación
// - Proveedores de datos
```

---

### `app/(tabs)/_layout.tsx`
**¿Qué es?** Configuración de las 5 pestañas (tabs) que ves abajo en la app.
**¿Qué hace?** Define:
- Qué pestañas existen (Buscar, Verificación, Soporte, Mis Viajes, Perfil)
- Qué icono tiene cada pestaña
- Qué pantalla se abre al hacer clic

**Ejemplo:**
```typescript
<Tabs.Screen
  name="index"
  options={{
    title: "Buscar",
    tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
  }}
/>
```
**Significa:** Hay una pestaña llamada "Buscar" con un icono de casa.

---

### `app/(tabs)/index.tsx`
**¿Qué es?** La pantalla principal - "Buscar Viajes".
**¿Qué hace?**
1. Muestra un formulario para buscar (origen, destino, fecha)
2. Botón "Buscar" que filtra viajes
3. Botón "Publicar un Viaje" (verde)
4. Lista de viajes disponibles

**Componentes que usa:**
- `ScreenContainer` - Envoltorio para la pantalla
- `useTrips()` - Hook para obtener viajes de la API
- `TextInput` - Campos de entrada

---

### `app/(tabs)/profile.tsx`
**¿Qué es?** Pantalla de perfil del usuario.
**¿Qué hace?**
1. Muestra información del usuario (nombre, email, calificación)
2. Estadísticas (viajes como conductor, viajes como pasajero)
3. Botón de logout (cerrar sesión)

**Datos que muestra:**
- Nombre y foto del usuario
- Calificación promedio (⭐)
- Número de viajes completados
- Opción para editar perfil

---

### `app/(tabs)/my-trips.tsx`
**¿Qué es?** Pantalla "Mis Viajes".
**¿Qué hace?**
1. Muestra viajes donde eres pasajero (reservas)
2. Muestra viajes donde eres conductor (publicados)
3. Estado de cada viaje (activo, completado, cancelado)

**Datos que muestra:**
- Origen y destino
- Fecha y hora
- Precio
- Estado de la reserva

---

### `app/(tabs)/verification.tsx`
**¿Qué es?** Pantalla de verificación de identidad.
**¿Qué hace?**
1. Muestra estado de verificación (pendiente, aprobado, rechazado)
2. Formulario para enviar documento
3. Permite seleccionar tipo de documento (cédula, pasaporte, licencia)
4. Explica por qué es necesaria la verificación

**Estados posibles:**
- ✓ Verificado - Tu identidad está confirmada
- ⏳ Pendiente - Esperando revisión (24-48 horas)
- ✗ Rechazado - Intenta de nuevo con otro documento

---

### `app/(tabs)/support.tsx`
**¿Qué es?** Centro de soporte técnico.
**¿Qué hace?**
1. Formulario para crear ticket de soporte
2. Seleccionar categoría (pago, seguridad, técnico, otro)
3. Escribir asunto y descripción
4. Ver mis tickets anteriores
5. Sección de FAQ (preguntas frecuentes)

**Categorías de tickets:**
- Pago - Problemas con transacciones
- Seguridad - Reportar usuario sospechoso
- Técnico - Bugs o errores de la app
- Otro - Otros temas

---

## 🖥️ PARTE 2: LA LÓGICA DEL SERVIDOR (Carpeta `server/`)

### `server/routers.ts`
**¿Qué es?** El "director de orquesta" del servidor.
**¿Qué hace?** Conecta todos los routers (trips, bookings, payments, etc.) en un solo lugar.

**Analógía:** Es como el índice de un libro - te dice dónde encontrar cada cosa.

```typescript
export const appRouter = router({
  trips: tripsRouter,           // Funciones de viajes
  bookings: bookingsRouter,     // Funciones de reservas
  ratings: ratingsRouter,       // Funciones de calificaciones
  verifications: verificationsRouter, // Funciones de verificación
  payments: paymentsRouter,     // Funciones de pagos
  safety: safetyRouter,         // Funciones de reportes
});
```

---

### `server/routers/trips.ts`
**¿Qué es?** Todas las funciones relacionadas con viajes.
**¿Qué hace?** Define operaciones:

1. **`list`** - Obtiene lista de viajes disponibles
   ```typescript
   // Retorna: [{ id: 1, origin: "Santiago", destination: "Viña", price: 5000 }, ...]
   ```

2. **`getById`** - Obtiene detalles de un viaje específico
   ```typescript
   // Retorna: { id: 1, origin: "Santiago", destination: "Viña", driver: {...}, seats: 3 }
   ```

3. **`publish`** - Crea un nuevo viaje (solo conductores)
   ```typescript
   // Entrada: { origin: "Santiago", destination: "Viña", date: "2026-08-01", seats: 4, price: 5000 }
   // Retorna: { success: true, tripId: 42 }
   ```

4. **`cancel`** - Cancela un viaje (solo el conductor propietario)
   ```typescript
   // Entrada: { tripId: 42 }
   // Retorna: { success: true }
   ```

5. **`myTrips`** - Obtiene viajes publicados por el usuario actual
   ```typescript
   // Retorna: [{ id: 42, origin: "Santiago", ... }, ...]
   ```

---

### `server/routers/bookings.ts`
**¿Qué es?** Todas las funciones relacionadas con reservas.
**¿Qué hace?** Define operaciones:

1. **`create`** - Crea una reserva (pasajero reserva un viaje)
   ```typescript
   // Entrada: { tripId: 42, seats: 2 }
   // Retorna: { success: true, bookingId: 100 }
   // Adeo gana comisión automáticamente
   ```

2. **`getMyBookings`** - Obtiene mis reservas
   ```typescript
   // Retorna: [{ id: 100, tripId: 42, status: "confirmed", ... }, ...]
   ```

3. **`cancel`** - Cancela una reserva
   ```typescript
   // Entrada: { bookingId: 100 }
   // Retorna: { success: true }
   ```

4. **`getBookingsForTrip`** - Obtiene reservas de un viaje (solo conductor)
   ```typescript
   // Retorna: [{ passengerId: 5, seats: 2, status: "confirmed" }, ...]
   ```

---

### `server/routers/ratings.ts`
**¿Qué es?** Todas las funciones relacionadas con calificaciones.
**¿Qué hace?** Define operaciones:

1. **`create`** - Califica a otro usuario (1-5 estrellas)
   ```typescript
   // Entrada: { ratedUserId: 10, score: 5, comment: "Excelente conductor" }
   // Retorna: { success: true }
   ```

2. **`getForUser`** - Obtiene calificaciones de un usuario
   ```typescript
   // Retorna: { averageScore: 4.8, totalRatings: 25, ratings: [...] }
   ```

3. **`getMyRatings`** - Obtiene mis calificaciones
   ```typescript
   // Retorna: [{ ratedBy: "Juan", score: 5, comment: "Muy bueno" }, ...]
   ```

---

### `server/routers/verifications.ts`
**¿Qué es?** Todas las funciones relacionadas con verificación de identidad.
**¿Qué hace?** Define operaciones:

1. **`getStatus`** - Obtiene mi estado de verificación
   ```typescript
   // Retorna: { status: "pending", documentType: "id_card", ... }
   ```

2. **`submitVerification`** - Envía documento y selfie
   ```typescript
   // Entrada: { documentType: "id_card", documentNumber: "12345678", documentImageUrl: "...", selfieImageUrl: "..." }
   // Retorna: { success: true, message: "Será revisado en 24-48 horas" }
   ```

3. **`isVerified`** - Verifica si un usuario está verificado
   ```typescript
   // Entrada: { userId: 10 }
   // Retorna: true o false
   ```

---

### `server/routers/payments.ts`
**¿Qué es?** Todas las funciones relacionadas con pagos.
**¿Qué hace?** Define operaciones:

1. **`getPaymentMethods`** - Obtiene mis métodos de pago guardados
   ```typescript
   // Retorna: [{ type: "paypal", paypalEmail: "user@gmail.com" }, { type: "cash" }, ...]
   ```

2. **`addPaymentMethod`** - Agrega un nuevo método de pago
   ```typescript
   // Entrada: { type: "paypal", paypalEmail: "user@gmail.com" }
   // Retorna: { success: true }
   ```

3. **`createTransaction`** - Crea una transacción de pago
   ```typescript
   // Entrada: { bookingId: 100, amount: 5000, paymentMethod: "paypal" }
   // Retorna: { success: true }
   ```

4. **`confirmPayment`** - Confirma que el pago fue exitoso
   ```typescript
   // Entrada: { transactionId: 500, paymentId: "PAY-123456" }
   // Retorna: { success: true }
   ```

5. **`getTransactionHistory`** - Obtiene historial de pagos
   ```typescript
   // Retorna: [{ id: 500, amount: 5000, status: "completed", date: "2026-07-30" }, ...]
   ```

---

### `server/routers/safety.ts`
**¿Qué es?** Todas las funciones relacionadas con seguridad (reportes, bloqueos, soporte).
**¿Qué hace?** Define operaciones:

1. **`reportUser`** - Reporta a un usuario por comportamiento sospechoso
   ```typescript
   // Entrada: { reportedUserId: 10, reason: "Acoso", description: "Me amenazó durante el viaje" }
   // Retorna: { success: true, message: "Reporte enviado" }
   ```

2. **`blockUser`** - Bloquea a un usuario (no verás sus viajes)
   ```typescript
   // Entrada: { blockedUserId: 10, reason: "Usuario sospechoso" }
   // Retorna: { success: true }
   ```

3. **`getBlockedUsers`** - Obtiene lista de usuarios que bloqueé
   ```typescript
   // Retorna: [{ id: 10, reason: "Usuario sospechoso" }, ...]
   ```

4. **`createSupportTicket`** - Crea un ticket de soporte
   ```typescript
   // Entrada: { subject: "No puedo pagar", description: "...", category: "payment" }
   // Retorna: { success: true, message: "Ticket creado" }
   ```

5. **`mySupportTickets`** - Obtiene mis tickets de soporte
   ```typescript
   // Retorna: [{ id: 1, subject: "No puedo pagar", status: "open", priority: "high" }, ...]
   ```

---

### `server/db.ts`
**¿Qué es?** Conexión a la base de datos.
**¿Qué hace?** Establece la conexión con MySQL y la exporta para que otros archivos la usen.

```typescript
export async function getDb() {
  // Conecta a MySQL
  // Retorna la conexión para hacer queries
}
```

---

## 🗄️ PARTE 3: LA BASE DE DATOS (Carpeta `drizzle/`)

### `drizzle/schema.ts`
**¿Qué es?** La "estructura" de la base de datos.
**¿Qué hace?** Define todas las tablas y sus campos.

**Ejemplo - Tabla `users`:**
```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),        // ID único
  email: varchar("email", { length: 255 }).notNull(), // Email
  name: varchar("name", { length: 255 }),            // Nombre
  createdAt: timestamp("createdAt").defaultNow(),    // Fecha de creación
});
```

**Significa:** Hay una tabla llamada "users" con 4 campos: id, email, name, createdAt.

**Todas las tablas en Adeo:**

| Tabla | Qué guarda |
|-------|-----------|
| `users` | Usuarios (email, nombre, etc.) |
| `userProfiles` | Información extra del usuario (tipo, calificación) |
| `trips` | Viajes publicados (origen, destino, precio, etc.) |
| `bookings` | Reservas (qué usuario reservó qué viaje) |
| `ratings` | Calificaciones entre usuarios |
| `verifications` | Estado de verificación de identidad |
| `transactions` | Historial de pagos |
| `paymentMethods` | Métodos de pago guardados |
| `reports` | Reportes de usuarios |
| `blocks` | Usuarios bloqueados |
| `tripTracking` | Ubicación en tiempo real del viaje |
| `supportTickets` | Tickets de soporte |

---

### `drizzle/0002_*.sql`
**¿Qué es?** Script SQL que crea las tablas.
**¿Qué hace?** Cuando ejecutas `pnpm db:push`, este archivo crea todas las tablas en MySQL.

**Ejemplo:**
```sql
CREATE TABLE `trips` (
  `id` int AUTO_INCREMENT NOT NULL,
  `driverId` int NOT NULL,
  `origin` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `seats` int NOT NULL,
  `price` int NOT NULL,
  PRIMARY KEY(`id`)
);
```

---

## 🪝 PARTE 4: CONEXIÓN FRONTEND-BACKEND (Carpeta `hooks/`)

### `hooks/use-trips.ts`
**¿Qué es?** Un "puente" entre la pantalla y la API de viajes.
**¿Qué hace?** Facilita usar las funciones de viajes desde las pantallas.

**Cómo se usa:**
```typescript
// En una pantalla:
const { listTrips, publishTrip } = useTrips();

// Obtener viajes:
const trips = await listTrips.mutateAsync({
  origin: "Santiago",
  destination: "Viña"
});

// Publicar viaje:
const result = await publishTrip.mutateAsync({
  origin: "Santiago",
  destination: "Viña",
  seats: 4,
  price: 5000
});
```

**Otros hooks similares:**
- `use-bookings.ts` - Para reservas
- `use-ratings.ts` - Para calificaciones
- `use-auth.ts` - Para autenticación
- `use-colors.ts` - Para colores del tema

---

## 🧩 PARTE 5: COMPONENTES REUTILIZABLES (Carpeta `components/`)

### `components/screen-container.tsx`
**¿Qué es?** Un envoltorio para todas las pantallas.
**¿Qué hace?** Asegura que:
- El contenido no se superponga con la barra de estado (notch del iPhone)
- El fondo se extienda correctamente
- La pantalla tenga márgenes adecuados

**Cómo se usa:**
```typescript
<ScreenContainer className="p-4">
  {/* Contenido de la pantalla */}
</ScreenContainer>
```

### `components/ui/icon-symbol.tsx`
**¿Qué es?** Mapeo de iconos.
**¿Qué hace?** Convierte nombres de iconos de iOS a iconos de Android/Web.

**Ejemplo:**
```typescript
const MAPPING = {
  "house.fill": "home",                    // iOS → Android
  "checkmark.circle.fill": "verified-user", // iOS → Android
};
```

---

## ⚙️ PARTE 6: CONFIGURACIÓN (Archivos en la raíz)

### `app.config.ts`
**¿Qué es?** Configuración general de la app.
**¿Qué contiene?**
- Nombre: "Adeo"
- Versión: "1.0.0"
- Icono: ruta a la imagen
- Permisos necesarios (cámara, ubicación, etc.)
- Bundle ID para iOS/Android

**Ejemplo:**
```typescript
const env = {
  appName: "Adeo",
  appSlug: "adeo-app",
  logoUrl: "https://...",
};
```

---

### `theme.config.js`
**¿Qué es?** Paleta de colores de la app.
**¿Qué contiene?** Colores para:
- Fondo (background)
- Texto (foreground)
- Botones (primary)
- Errores (error)
- Éxito (success)
- etc.

**Ejemplo:**
```javascript
const themeColors = {
  primary: { light: '#0a7ea4', dark: '#0a7ea4' },
  background: { light: '#ffffff', dark: '#151718' },
  error: { light: '#EF4444', dark: '#F87171' },
};
```

---

### `package.json`
**¿Qué es?** Lista de dependencias (librerías externas).
**¿Qué contiene?** Todas las librerías que usa la app:

```json
{
  "dependencies": {
    "react": "19.1.0",              // Framework UI
    "expo": "~54.0.29",             // Herramienta para apps móviles
    "react-native": "0.81.5",       // Código móvil
    "drizzle-orm": "^0.44.7",       // ORM para BD
    "@trpc/client": "11.7.2",       // Cliente para API
    "tailwindcss": "^3.4.17"        // Framework CSS
  }
}
```

---

### `drizzle.config.ts`
**¿Qué es?** Configuración de la base de datos.
**¿Qué contiene?**
- Tipo de BD (MySQL)
- Ubicación del schema
- Ubicación de migraciones

---

### `tailwind.config.js`
**¿Qué es?** Configuración de Tailwind CSS (framework de estilos).
**¿Qué hace?** Define cómo se aplican los estilos a la app.

---

## 🔄 FLUJO COMPLETO: Cómo Funciona Todo Junto

### Ejemplo: Un usuario busca un viaje

```
1. Usuario abre la app
   ↓
2. Pantalla `app/(tabs)/index.tsx` se carga
   ↓
3. Usuario ingresa origen, destino, fecha
   ↓
4. Usuario hace clic en "Buscar"
   ↓
5. Hook `use-trips.ts` llama a la API
   ↓
6. API `server/routers/trips.ts` recibe la solicitud
   ↓
7. API consulta la BD: `SELECT * FROM trips WHERE origin = "Santiago" AND destination = "Viña"`
   ↓
8. BD retorna lista de viajes
   ↓
9. API retorna datos al frontend
   ↓
10. Hook `use-trips.ts` actualiza el estado
    ↓
11. Pantalla `index.tsx` se re-renderiza con los viajes
    ↓
12. Usuario ve la lista de viajes disponibles ✓
```

---

## 📊 RESUMEN: Quién Habla con Quién

```
PANTALLA (app/tabs/index.tsx)
    ↓ usa
HOOK (hooks/use-trips.ts)
    ↓ llama
API CLIENTE (lib/trpc.ts)
    ↓ envía solicitud HTTP
SERVIDOR (server/routers/trips.ts)
    ↓ consulta
BASE DE DATOS (drizzle/schema.ts)
    ↓ retorna datos
SERVIDOR
    ↓ retorna respuesta
API CLIENTE
    ↓ actualiza estado
HOOK
    ↓ notifica cambios
PANTALLA (se re-renderiza)
```

---

## 🎯 AHORA ENTIENDE:

✅ Qué hace cada archivo
✅ Cómo se conectan entre sí
✅ Cómo fluyen los datos
✅ Dónde agregar nuevas funciones

**Próximo paso:** Abre cada archivo en VS Code y lee los comentarios. ¡Ahora sabrás exactamente qué hace cada línea!

---

¡Felicidades! Ya entiendes la anatomía de Adeo 🎉
