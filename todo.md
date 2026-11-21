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
- [x] Crear pantalla Detalle de Viaje
- [x] Implementar pantalla Reservar Viaje
- [x] Crear pantalla Mis Viajes (reservas activas)

## Fase 4: Funcionalidades Core - Conductor
- [x] Crear vista Home para conductores (compartida con pasajeros)
- [x] Implementar pantalla Publicar Viaje
- [x] Crear formulario de publicación (origen, destino, fecha, hora, asientos, precio) + tope de costo compartido
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
- [x] Implementar pantalla de selfie con cámara (expo-image-picker)
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
- [ ] Panel de administrador (los endpoints ya exigen rol admin)
- [ ] Notificaciones de seguridad

## Fase 7.5: Centro de Soporte
- [x] Crear tabla de support tickets
- [x] Implementar pantalla de soporte
- [x] Sistema de creación de tickets (API endpoint)
- [x] Historial de tickets
- [ ] Respuestas automáticas

## Fase 10: Preparación para Producción
- [x] Términos de servicio (borrador, revisar con abogado)
- [x] Política de privacidad (borrador, revisar con abogado)
- [ ] Configuración de Play Store
- [ ] Certificados y firmas
- [ ] Testing final
- [ ] Documentación para usuarios

## Notas
- Usar AsyncStorage para datos locales inicialmente
- Implementar backend para sincronización de viajes
- Considerar notificaciones push para nuevas reservas
- Sistema de pagos: integrar después de MVP

## Fase 11: Chile + Mundial (nuevo)
- [x] Config por país (moneda, locale, zona horaria, emergencias) — solo Chile habilitado
- [x] Tope de precio por costo compartido (legalidad carpooling)
- [x] Fee de servicio al pasajero (el conductor recibe el precio completo)
- [x] Reservas atómicas (sin overbooking) y cancelaciones sin doble devolución de asientos
- [x] Endpoints de admin protegidos (verificaciones, reportes, pagos)
- [x] RUT validado (módulo 11) y documento guardado enmascarado
- [x] Compartir viaje con familiar (24 h) y botón SOS
- [x] i18n es/en
- [ ] Pasarela de pago real para Chile (Webpay/Flow/Mercado Pago)
- [ ] Mapas y distancia automática (hoy la distancia la ingresa el conductor)
- [ ] Datos del vehículo, licencia, SOAP y revisión técnica del conductor
- [ ] Panel admin para aprobar verificaciones
- [ ] Revisión legal (ver docs/LEGAL_CHILE.md)
