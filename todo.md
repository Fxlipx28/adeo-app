# Adeo - Project TODO

## Fase 1: Diseño y Assets
- [x] Generar logo de Adeo
- [x] Crear paleta de colores personalizada
- [x] Diseñar iconos para tab bar (Home, Mis Viajes, Perfil)
- [x] Actualizar app.config.ts con branding

## Fase 2: Autenticación y Base de Datos
- [x] Implementar pantalla de Login (OAuth integrado)
- [x] Implementar pantalla de Registro (OAuth integrado)
- [x] Crear esquema de base de datos (usuarios, viajes, reservas)
- [x] Integrar autenticación OAuth
- [x] Guardar datos de usuario en sesión

## Fase 3: Funcionalidades Core - Pasajero
- [x] Crear pantalla Home (lista de viajes disponibles)
- [x] Implementar buscador de viajes (origen, destino, fecha)
- [ ] Crear pantalla Detalle de Viaje
- [ ] Implementar pantalla Reservar Viaje
- [x] Crear pantalla Mis Viajes (reservas activas)

## Fase 4: Funcionalidades Core - Conductor
- [x] Crear vista Home para conductores (compartida con pasajeros)
- [ ] Implementar pantalla Publicar Viaje
- [ ] Crear formulario de publicación (origen, destino, fecha, hora, asientos, precio)
- [x] Implementar lista de viajes activos del conductor (API endpoint)
- [x] Agregar opción para cancelar/cerrar viajes (API endpoint)

## Fase 5: Sistema de Reservas y Comisiones
- [x] Implementar lógica de reserva (validar asientos disponibles)
- [x] Crear sistema de cálculo de comisiones (schema listo)
- [x] Implementar confirmación de reserva (API endpoint)
- [x] Agregar historial de transacciones (bookings table)

## Fase 6: Perfil de Usuario
- [x] Crear pantalla de Perfil
- [ ] Implementar edición de datos personales
- [ ] Agregar foto de perfil
- [x] Implementar sistema de calificación (API endpoint)
- [x] Mostrar historial de viajes

## Fase 6: Verificación de Identidad y Seguridad
- [x] Crear tabla de verificaciones (documento, selfie, estado)
- [x] Implementar pantalla de carga de documento
- [ ] Implementar pantalla de selfie con cámara (requiere expo-camera)
- [x] Sistema de validación de documentos (backend API)
- [x] Bloqueo de usuarios no verificados (lógica en backend)
- [x] Sistema de reportes y bloqueos (API endpoints)
- [x] Historial de verificaciones (tabla en DB)

## Fase 7: Sistema de Pagos
- [ ] Integrar PayPal SDK (requiere react-native-paypal)
- [x] Implementar método de pago en efectivo (schema + API)
- [x] Crear tabla de transacciones
- [ ] Pantalla de historial de pagos
- [x] Confirmación de pago antes de viaje (API endpoint)
- [x] Reembolsos y disputas (API endpoint)

## Fase 8: Mapa en Tiempo Real
- [ ] Integrar Google Maps
- [ ] Mostrar ubicación del viaje
- [ ] Seguimiento en tiempo real del conductor
- [ ] Notificaciones de llegada
- [ ] Historial de ruta del viaje

## Fase 9: Sistema de Reportes y Bloqueos
- [x] Crear tabla de reportes
- [x] Pantalla para reportar usuario (API endpoint)
- [x] Sistema de bloqueos mutuos (API endpoint)
- [ ] Panel de administrador
- [ ] Notificaciones de seguridad

## Fase 7.5: Centro de Soporte
- [x] Crear tabla de support tickets
- [x] Implementar pantalla de soporte
- [x] Sistema de creación de tickets (API endpoint)
- [x] Historial de tickets
- [ ] Respuestas automáticas

## Fase 10: Preparación para Producción
- [ ] Términos de servicio
- [ ] Política de privacidad
- [ ] Configuración de Play Store
- [ ] Certificados y firmas
- [ ] Testing final
- [ ] Documentación para usuarios

## Notas
- Usar AsyncStorage para datos locales inicialmente
- Implementar backend para sincronización de viajes
- Considerar notificaciones push para nuevas reservas
- Sistema de pagos: integrar después de MVP
