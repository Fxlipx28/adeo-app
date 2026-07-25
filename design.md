# Adeo - Diseño de Interfaz Móvil

## Visión General

Adeo es una plataforma de viajes compartidos enfocada en mochileros y viajeros de bajo presupuesto. Los conductores publican viajes, los pasajeros se unen pagando una tarifa económica, y la plataforma gana una comisión por cada conexión exitosa.

**Orientación:** Retrato (9:16) | **Uso:** Una mano | **Estilo:** iOS-first, limpio y directo

---

## Pantallas Principales

| Pantalla | Propósito | Contenido Clave |
|----------|-----------|-----------------|
| **Inicio de Sesión** | Autenticar usuario | Email/teléfono, contraseña, botón de registro |
| **Registro** | Crear cuenta nueva | Nombre, email, teléfono, tipo de usuario (conductor/pasajero), contraseña |
| **Home - Pasajero** | Buscar viajes disponibles | Buscador (origen/destino/fecha), lista de viajes, mapa |
| **Home - Conductor** | Publicar y gestionar viajes | Botón "Publicar Viaje", lista de viajes activos, historial |
| **Detalle de Viaje** | Ver información completa | Ruta, fecha/hora, precio, conductor/pasajeros, botón reservar |
| **Publicar Viaje** | Crear nuevo viaje (conductor) | Origen, destino, fecha, hora, asientos disponibles, precio por pasajero |
| **Reservar Viaje** | Confirmar reserva (pasajero) | Resumen del viaje, precio total, método de pago, botón confirmar |
| **Perfil de Usuario** | Gestionar cuenta | Nombre, foto, calificación, historial de viajes, método de pago |
| **Mis Viajes** | Ver reservas activas | Viajes próximos, historial, estado de cada reserva |
| **Configuración** | Preferencias de app | Tema (claro/oscuro), notificaciones, privacidad |

---

## Flujos de Usuario Clave

### Flujo 1: Pasajero Busca y Reserva Viaje

1. Pasajero abre app → Home (lista de viajes cercanos)
2. Ingresa origen, destino y fecha en buscador
3. Ve resultados con precio, conductor, horario
4. Toca un viaje → Detalle con mapa y descripción del conductor
5. Toca "Reservar" → Confirma datos y método de pago
6. Reserva confirmada → Recibe datos del conductor

### Flujo 2: Conductor Publica Viaje

1. Conductor abre app → Home (vista de conductor)
2. Toca "Publicar Viaje"
3. Ingresa origen, destino, fecha, hora, asientos, precio
4. Revisa y confirma publicación
5. Viaje aparece en búsquedas de pasajeros
6. Cuando se llena o vence, viaje se cierra automáticamente

### Flujo 3: Comisiones

- **Pasajero paga:** $10 por viaje
- **Conductor recibe:** $9 (Adeo gana $1 por conexión)
- Sistema calcula automáticamente en cada reserva

---

## Paleta de Colores

| Elemento | Color Claro | Color Oscuro | Uso |
|----------|------------|-------------|-----|
| **Primario** | `#0a7ea4` (Azul) | `#0a7ea4` | Botones, enlaces, énfasis |
| **Fondo** | `#ffffff` | `#151718` | Fondo de pantalla |
| **Superficie** | `#f5f5f5` | `#1e2022` | Tarjetas, componentes |
| **Texto Principal** | `#11181C` | `#ECEDEE` | Títulos, cuerpo |
| **Texto Secundario** | `#687076` | `#9BA1A6` | Subtítulos, ayuda |
| **Borde** | `#E5E7EB` | `#334155` | Líneas divisoras |
| **Éxito** | `#22C55E` | `#4ADE80` | Confirmaciones |
| **Advertencia** | `#F59E0B` | `#FBBF24` | Alertas |
| **Error** | `#EF4444` | `#F87171` | Errores |

---

## Componentes Reutilizables

- **TripCard:** Tarjeta de viaje con origen, destino, precio, conductor
- **UserAvatar:** Avatar redondo con foto de perfil
- **RatingBadge:** Estrella + número de calificación
- **PriceTag:** Precio destacado en color primario
- **LocationPin:** Icono de ubicación + texto
- **Button:** Primario (azul), secundario (gris), peligro (rojo)

---

## Consideraciones de UX

- **Búsqueda rápida:** Pasajeros deben encontrar viajes en máximo 3 toques
- **Claridad de precios:** Mostrar siempre el precio total (sin sorpresas)
- **Confianza:** Calificación y foto del conductor visible antes de reservar
- **Notificaciones:** Alertar sobre cambios en reservas, nuevos pasajeros, etc.
- **Accesibilidad:** Texto legible, contraste suficiente, tamaños táctiles ≥44pt

---

## Próximas Fases

1. Generar logo y assets visuales
2. Implementar autenticación y base de datos
3. Desarrollar búsqueda y publicación de viajes
4. Sistema de reservas y pagos
5. Perfiles de usuario y calificaciones
6. Notificaciones en tiempo real
