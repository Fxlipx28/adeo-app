# Adeo — Marco legal para Chile (notas de diseño)

> Esto NO es asesoría legal. Son las decisiones de diseño y los puntos a validar con un abogado antes de lanzar.

## 1. Por qué "solo costos compartidos"
- La **Ley 21.553** (apps de transporte remunerado, abril 2023) regula a las plataformas que ofrecen transporte
  pagado de pasajeros: exige empresa chilena inscrita en el registro del MTT, conductores con licencia
  profesional, etc. Además prohíbe a esas apps ofrecer servicios de carácter compartido.
- El **carpooling** (compartir un viaje que el conductor ya iba a hacer) es legal mientras no haya lucro:
  la regla práctica es que solo se reparten los costos.
- Por eso Adeo:
  - fija un **tope de precio por asiento** = (km × costo/km + peajes) ÷ (asientos + conductor) → `shared/pricing.ts`
  - cobra el fee de Adeo **al pasajero, encima** del precio; el conductor recibe el precio completo
  - lo declara en los Términos (`lib/legal.ts`)
- **A validar con abogado:** (a) que la tarifa de servicio al pasajero no haga que Adeo caiga como "EAT";
  (b) el costo/km referencial (`COUNTRIES.CL.costPerKm = 130`); (c) cómo se cobra/gestiona el pago.

## 2. Datos personales
- **Ley 21.719** reemplaza casi por completo la Ley 19.628. Su entrada en vigencia estaba fijada para el
  **1 de diciembre de 2026**, pero hay un proyecto aprobado por el Senado (28-oct-2026) que la posterga
  hasta el **15 de octubre de 2027**; falta su paso por la Cámara. Diseñamos para cumplirla igual.
- Medidas ya implementadas: documento guardado **enmascarado**, enlaces de viaje con datos mínimos y vencimiento,
  ubicación solo bajo SOS/seguimiento, derechos ARCO por Soporte, términos y privacidad en la app.
- Pendiente: DPA con el proveedor de almacenamiento, política de retención/borrado de fotos de documento,
  designar contacto/encargado de privacidad, cifrado de imágenes en reposo (confirmar con el proveedor).

## 3. Seguridad (anti-secuestro / abuso)
Verificación de identidad obligatoria para publicar **y** reservar · RUT con módulo 11 · calificaciones solo entre
participantes · bloqueos mutuos · reportes · compartir viaje con familiar (24 h) · botón SOS con números
locales (133/131/132) y contacto de confianza · acciones de admin protegidas.

## 4. Multi-país
`shared/countries.ts`: cada país tiene moneda, locale, zona horaria, emergencias y `launched`.
Solo **Chile** está habilitado. Para abrir otro país: definir `costPerKm`, validar su ley de transporte
compartido y poner `launched: true`.
