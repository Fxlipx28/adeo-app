# Guía Completa: Exportar Adeo a VS Code

## 📥 PASO 1: Descargar el Proyecto

1. **En el panel derecho (Management UI)**, busca el botón **"More"** (⋯) en la esquina superior derecha
2. Haz clic en **"Download as ZIP"**
3. Se descargará un archivo llamado `adeo-app.zip`
4. **Extrae el ZIP** en tu computadora (por ejemplo: `C:\Users\TuUsuario\Documentos\adeo-app`)

---

## 📂 PASO 2: Entender la Estructura del Proyecto

Después de extraer, verás una carpeta así:

```
adeo-app/
├── app/                    # 🎨 PANTALLAS DE LA APP (lo que ves en el celular)
│   ├── (tabs)/            # Carpeta con las 5 pestañas principales
│   │   ├── index.tsx      # Pantalla "Buscar" (home)
│   │   ├── my-trips.tsx   # Pantalla "Mis Viajes"
│   │   ├── profile.tsx    # Pantalla "Perfil"
│   │   ├── verification.tsx # Pantalla "Verificación"
│   │   ├── support.tsx    # Pantalla "Soporte"
│   │   └── _layout.tsx    # Configuración de las pestañas
│   ├── _layout.tsx        # Layout principal de la app
│   └── oauth/             # Autenticación (no tocar)
│
├── server/                # 🖥️ BACKEND (lógica del servidor)
│   ├── routers/          # Funciones de la API
│   │   ├── trips.ts      # API para viajes (crear, listar, cancelar)
│   │   ├── bookings.ts   # API para reservas
│   │   ├── ratings.ts    # API para calificaciones
│   │   ├── verifications.ts # API para verificación de identidad
│   │   ├── payments.ts   # API para pagos
│   │   └── safety.ts     # API para reportes y bloqueos
│   ├── routers.ts        # Archivo principal que conecta todos los routers
│   ├── db.ts             # Conexión a la base de datos
│   └── _core/            # Configuración interna (no tocar)
│
├── drizzle/              # 🗄️ BASE DE DATOS
│   ├── schema.ts         # Definición de tablas (users, trips, bookings, etc.)
│   ├── migrations/       # Cambios históricos de la BD
│   └── 0002_*.sql        # Scripts SQL que crean las tablas
│
├── components/           # 🧩 COMPONENTES REUTILIZABLES
│   ├── screen-container.tsx # Envoltorio para pantallas
│   ├── ui/              # Componentes pequeños (botones, iconos)
│   └── ...
│
├── hooks/               # 🪝 LÓGICA COMPARTIDA
│   ├── use-trips.ts     # Hook para usar API de viajes
│   ├── use-bookings.ts  # Hook para usar API de reservas
│   ├── use-ratings.ts   # Hook para usar API de calificaciones
│   ├── use-colors.ts    # Hook para colores del tema
│   └── use-auth.ts      # Hook para autenticación
│
├── lib/                 # 📚 LIBRERÍAS Y UTILIDADES
│   ├── trpc.ts          # Cliente para conectar con la API
│   ├── utils.ts         # Funciones útiles
│   └── _core/           # Configuración interna
│
├── assets/              # 🖼️ IMÁGENES Y RECURSOS
│   └── images/          # Logo, iconos, splash screen
│
├── package.json         # 📋 Lista de dependencias (librerías que usa la app)
├── pnpm-lock.yaml       # 🔒 Versiones exactas de las dependencias
├── app.config.ts        # ⚙️ Configuración de la app (nombre, versión, etc.)
├── theme.config.js      # 🎨 Colores y estilos
├── tailwind.config.js   # 🎨 Configuración de Tailwind CSS
├── tsconfig.json        # 📝 Configuración de TypeScript
└── drizzle.config.ts    # 🗄️ Configuración de la base de datos

```

---

## 🔧 PASO 3: Instalar Dependencias

Una vez que tengas la carpeta en tu computadora:

### En Windows:
1. Abre **PowerShell** o **CMD** en la carpeta `adeo-app`
   - Haz clic derecho en la carpeta → "Abrir PowerShell aquí"
2. Escribe:
   ```bash
   pnpm install
   ```
   - Si no tienes `pnpm`, primero instálalo:
     ```bash
     npm install -g pnpm
     ```

### En Mac/Linux:
1. Abre **Terminal** en la carpeta `adeo-app`
2. Escribe:
   ```bash
   pnpm install
   ```

**¿Qué hace?** Descarga todas las librerías necesarias (React, Expo, etc.) que están listadas en `package.json`.

---

## 🚀 PASO 4: Ejecutar Localmente

En la terminal de la carpeta `adeo-app`, escribe:

```bash
pnpm dev
```

Verás algo como:
```
Metro Bundler started on http://localhost:8081
API server started on http://localhost:3000
```

Esto significa:
- **http://localhost:8081** → Vista previa de la app en el navegador
- **http://localhost:3000** → API del servidor (donde viven los datos)

---

## 📱 PASO 5: Abrir en VS Code

1. Abre **VS Code**
2. **File → Open Folder** → Selecciona la carpeta `adeo-app`
3. VS Code cargará todo el proyecto

---

## 🎯 ¿QUÉ EDITAR Y DÓNDE?

### Si quieres cambiar lo que VES en la app:
**Edita archivos en `app/(tabs)/`**
- Ejemplo: Para cambiar la pantalla de búsqueda, edita `app/(tabs)/index.tsx`
- Cambios aparecen automáticamente en http://localhost:8081

### Si quieres cambiar la LÓGICA del servidor:
**Edita archivos en `server/routers/`**
- Ejemplo: Para cambiar cómo funciona la creación de viajes, edita `server/routers/trips.ts`
- Cambios aparecen automáticamente en la API

### Si quieres agregar NUEVAS TABLAS a la BD:
**Edita `drizzle/schema.ts`**
- Define la nueva tabla
- Ejecuta: `pnpm drizzle-kit generate`
- Ejecuta: `pnpm db:push`

### Si quieres cambiar COLORES y ESTILOS:
**Edita `theme.config.js`**
- Cambia los colores (primary, background, etc.)
- Se aplican automáticamente a toda la app

---

## 🔄 FLUJO DE DESARROLLO

```
1. Haces cambios en el código
   ↓
2. Guardas el archivo (Ctrl+S)
   ↓
3. La app se recarga automáticamente
   ↓
4. Ves los cambios en http://localhost:8081
   ↓
5. Si hay errores, aparecen en la terminal
```

---

## 📚 EXPLICACIÓN DE ARCHIVOS CLAVE

### `package.json`
**¿Qué es?** Lista de todas las librerías que usa la app.
**Ejemplo:**
```json
{
  "dependencies": {
    "react": "19.1.0",           // Framework para hacer la UI
    "expo": "~54.0.29",          // Herramienta para hacer apps móviles
    "react-native": "0.81.5"     // Librería para escribir código móvil
  }
}
```
**Cuándo lo editas:** Cuando quieres agregar una nueva librería
```bash
pnpm add nombre-de-libreria
```

### `app.config.ts`
**¿Qué es?** Configuración general de la app.
**Qué contiene:**
- Nombre de la app: `"Adeo"`
- Versión: `"1.0.0"`
- Icono: `"./assets/images/icon.png"`
- Permisos necesarios

### `drizzle/schema.ts`
**¿Qué es?** Definición de la estructura de la base de datos.
**Ejemplo:**
```typescript
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  // ... más campos
});
```
**Significa:** Hay una tabla llamada "trips" con campos id, origin, destination, etc.

### `server/routers/trips.ts`
**¿Qué es?** Funciones que el servidor puede hacer (crear viaje, listar viajes, etc.)
**Ejemplo:**
```typescript
list: publicProcedure.query(async () => {
  // Retorna lista de viajes disponibles
})
```

### `hooks/use-trips.ts`
**¿Qué es?** Forma fácil de usar la API desde las pantallas.
**Cómo se usa:**
```typescript
const { listTrips } = useTrips();
// Ahora puedo usar listTrips.data para obtener viajes
```

---

## ⚠️ ERRORES COMUNES Y SOLUCIONES

### Error: "pnpm: command not found"
**Solución:** Instala pnpm
```bash
npm install -g pnpm
```

### Error: "Cannot find module"
**Solución:** Ejecuta `pnpm install` de nuevo
```bash
pnpm install
```

### La app no se recarga después de cambios
**Solución:** Reinicia el servidor
```bash
# Presiona Ctrl+C en la terminal para detener
# Luego ejecuta de nuevo:
pnpm dev
```

### Error de base de datos
**Solución:** Asegúrate de que el servidor está corriendo en `http://localhost:3000`

---

## 🎓 PRÓXIMOS PASOS

1. **Familiarízate con la estructura** - Abre cada archivo y lee los comentarios
2. **Haz cambios pequeños** - Cambia colores, textos, etc.
3. **Agrega nuevas pantallas** - Crea archivos nuevos en `app/(tabs)/`
4. **Agrega nuevas funciones** - Crea routers nuevos en `server/routers/`
5. **Prueba en tu celular** - Usa Expo Go para ver la app en tiempo real

---

## 📞 COMANDOS ÚTILES

```bash
# Iniciar desarrollo
pnpm dev

# Detener el servidor (Ctrl+C)

# Instalar dependencias
pnpm install

# Generar migración de BD
pnpm drizzle-kit generate

# Aplicar cambios a la BD
pnpm db:push

# Limpiar caché
rm -rf node_modules
pnpm install

# Compilar para producción
pnpm build
```

---

## 🚀 CUANDO ESTÉS LISTO PARA PUBLICAR

1. Genera APK para Android:
   ```bash
   eas build --platform android
   ```

2. Genera IPA para iOS:
   ```bash
   eas build --platform ios
   ```

3. Sube a Play Store o App Store

---

¡Ahora estás listo para trabajar localmente! 🎉
