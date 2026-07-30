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

## Fase 7: Configuración y Preferencias
- [ ] Crear pantalla de Configuración
- [ ] Implementar selector de tema (claro/oscuro)
- [ ] Agregar preferencias de notificaciones
- [ ] Implementar logout

## Fase 8: Pulido y Optimización
- [ ] Revisar flujos de usuario end-to-end
- [ ] Optimizar rendimiento de listas
- [ ] Mejorar UX/UI basado en feedback
- [ ] Pruebas en iOS y Android
- [ ] Documentar funcionalidades

## Notas
- Usar AsyncStorage para datos locales inicialmente
- Implementar backend para sincronización de viajes
- Considerar notificaciones push para nuevas reservas
- Sistema de pagos: integrar después de MVP
