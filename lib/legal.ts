/**
 * Textos legales (BORRADOR).
 * Deben ser revisados por un abogado chileno antes del lanzamiento público.
 */
export interface LegalSection {
  title: string;
  body: string;
}

export const LEGAL_VERSION = "2026-11-21 (borrador)";

export const TERMS: LegalSection[] = [
  {
    title: "1. Qué es Adeo",
    body:
      "Adeo es una plataforma tecnológica que conecta a personas que ya van a realizar un viaje con otras que quieren compartirlo para repartir los costos. Adeo no es una empresa de transporte, no presta servicios de transporte y no emplea a los conductores.",
  },
  {
    title: "2. Solo costos compartidos, sin lucro",
    body:
      "El precio por asiento puede cubrir únicamente combustible, peajes y desgaste del vehículo, repartidos entre todos los ocupantes, incluido el conductor. Está prohibido ofrecer viajes con ánimo de lucro o como servicio habitual de transporte de pasajeros. Adeo aplica un tope automático de precio por ruta y puede suspender cuentas que lo eludan.",
  },
  {
    title: "3. Verificación de identidad",
    body:
      "Para publicar o reservar viajes debes verificar tu identidad con tu documento y una selfie. Los conductores deben contar con licencia de conducir vigente y con el seguro obligatorio (SOAP) y la revisión técnica al día. Adeo puede rechazar o revocar verificaciones.",
  },
  {
    title: "3.bis Responsabilidad del conductor",
    body:
      "El conductor es el único responsable de conducir de forma segura, de las condiciones del vehículo y del cumplimiento de la Ley de Tránsito. Los pasajeros deben usar cinturón de seguridad y respetar las reglas acordadas.",
  },
  {
    title: "4. Reservas, tarifa de servicio y cancelaciones",
    body:
      "El pasajero ve el precio total antes de reservar: precio por asiento fijado por el conductor más una tarifa de servicio de Adeo. El conductor recibe el precio completo por asiento. Las cancelaciones devuelven el asiento al viaje.",
  },
  {
    title: "5. Seguridad",
    body:
      "Adeo ofrece reportes, bloqueos, compartir viaje con un contacto de confianza y un botón SOS. Estas herramientas no reemplazan llamar a Carabineros (133), Ambulancia (131) o Bomberos (132) ante una emergencia.",
  },
  {
    title: "6. Conducta prohibida",
    body:
      "Está prohibido el acoso, la discriminación, conducir bajo los efectos del alcohol o drogas, transportar sustancias ilícitas, suplantar identidades y cobrar por sobre el costo compartido. Podemos suspender o eliminar cuentas que incumplan estas normas.",
  },
  {
    title: "7. Derechos del consumidor",
    body:
      "Se aplican los derechos de la Ley 19.496 sobre protección de los derechos de los consumidores. Puedes presentar reclamos desde la sección Soporte de la app.",
  },
  {
    title: "8. Cambios y ley aplicable",
    body:
      "Podemos actualizar estos términos y te avisaremos dentro de la app. Se rigen por las leyes de Chile y los tribunales competentes de Santiago.",
  },
];

export const PRIVACY: LegalSection[] = [
  {
    title: "1. Responsable",
    body:
      "Adeo es responsable del tratamiento de tus datos personales conforme a la Ley 19.628 y, desde su entrada en vigencia, a la Ley 21.719 sobre protección de datos personales.",
  },
  {
    title: "2. Qué datos recopilamos",
    body:
      "Nombre, correo, teléfono, datos del viaje (origen, destino, fecha), reservas, calificaciones y, para la verificación, una foto de tu documento y una selfie. Del documento guardamos solo una versión enmascarada del número.",
  },
  {
    title: "3. Para qué los usamos",
    body:
      "Para operar la plataforma, verificar identidades, prevenir fraudes y delitos, atender reportes y soporte, y cumplir obligaciones legales. No vendemos tus datos.",
  },
  {
    title: "4. Qué ven los demás",
    body:
      "Antes de reservar solo se muestran tu primer nombre, calificación y verificación. Tu teléfono y datos de contacto se comparten únicamente con las personas de un viaje confirmado. Los enlaces para compartir viaje exponen solo ruta, horario y primer nombre del conductor, y vencen a las 24 horas.",
  },
  {
    title: "5. Seguridad de la información",
    body:
      "Las imágenes de documento y selfie se guardan cifradas, con acceso restringido al equipo de verificación, y se eliminan al terminar el plazo legal o al cerrar tu cuenta.",
  },
  {
    title: "6. Tus derechos",
    body:
      "Puedes pedir acceso, rectificación, supresión, oposición y portabilidad de tus datos desde Soporte. Si lo consideras necesario, puedes reclamar ante la autoridad de protección de datos.",
  },
  {
    title: "7. Ubicación",
    body:
      "Solo usamos tu ubicación cuando activas el botón SOS o el seguimiento de un viaje, y puedes desactivarlo en cualquier momento.",
  },
];
