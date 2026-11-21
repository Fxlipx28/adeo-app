import { Platform, NativeModules } from "react-native";
import { COUNTRIES, DEFAULT_COUNTRY, isLaunched, type CountryCode } from "@/shared/countries";

/**
 * i18n mínimo (es / en). Español es el idioma base (lanzamiento en Chile).
 * Para agregar un idioma, copia el bloque `es` y traduce.
 */
const es = {
  tagline: "Comparte el viaje, comparte el costo",
  search: "Buscar viaje",
  origin: "Origen",
  destination: "Destino",
  date: "Fecha (AAAA-MM-DD)",
  searchBtn: "Buscar",
  publishTrip: "+ Publicar un viaje",
  availableTrips: "Viajes disponibles",
  noTrips: "No hay viajes con esos filtros",
  seats: "asientos",
  seat: "asiento",
  perSeat: "por asiento",
  tripDetail: "Detalle del viaje",
  departure: "Salida",
  driver: "Conductor",
  reserve: "Reservar",
  seatsToBook: "Asientos a reservar",
  price: "Precio",
  serviceFee: "Tarifa de servicio Adeo",
  total: "Total a pagar",
  driverGets: "El conductor recibe el precio completo",
  payInfo: "Pago: según el método acordado con el conductor. Adeo no cobra comisión al conductor.",
  booked: "¡Reserva enviada! El conductor debe confirmarla.",
  loginNeeded: "Inicia sesión para continuar",
  verifyNeeded: "Debes verificar tu identidad para reservar.",
  goVerify: "Verificar identidad",
  costShareTitle: "Solo se comparten costos",
  costShareBody:
    "En Adeo el conductor no lucra: el precio cubre combustible y peajes repartidos entre todos los ocupantes.",
  publishTitle: "Publicar viaje",
  distanceKm: "Distancia (km)",
  tolls: "Peajes totales",
  totalSeats: "Asientos disponibles",
  pricePerSeat: "Precio por asiento",
  maxAllowed: "Máximo permitido",
  description: "Notas del viaje (opcional)",
  time: "Hora (HH:MM)",
  publish: "Publicar",
  published: "¡Viaje publicado!",
  overCap: "El precio supera el costo compartido de esta ruta.",
  myTrips: "Mis viajes",
  asPassenger: "Como pasajero",
  asDriver: "Como conductor",
  none: "Aún no tienes viajes",
  cancel: "Cancelar",
  status_pending: "Pendiente",
  status_confirmed: "Confirmada",
  status_completed: "Completada",
  status_cancelled: "Cancelada",
  status_active: "Activo",
  safety: "Seguridad",
  sos: "SOS",
  sosHint: "Avisa a Adeo y muestra tus números de emergencia",
  emergencyContact: "Contacto de confianza",
  contactName: "Nombre",
  contactPhone: "Teléfono",
  save: "Guardar",
  saved: "Guardado",
  shareTrip: "Compartir viaje en vivo",
  shareHint: "Un familiar podrá ver ruta y horario por 24 horas.",
  terms: "Términos y condiciones",
  privacy: "Política de privacidad",
  error: "Error",
  loading: "Cargando…",
  comingSoon: "Adeo aún no está disponible en tu país. Mientras tanto, puedes usarlo en Chile.",
};

type Dict = typeof es;

const en: Dict = {
  tagline: "Share the ride, share the cost",
  search: "Find a ride",
  origin: "From",
  destination: "To",
  date: "Date (YYYY-MM-DD)",
  searchBtn: "Search",
  publishTrip: "+ Offer a ride",
  availableTrips: "Available rides",
  noTrips: "No rides match your filters",
  seats: "seats",
  seat: "seat",
  perSeat: "per seat",
  tripDetail: "Ride details",
  departure: "Departure",
  driver: "Driver",
  reserve: "Book",
  seatsToBook: "Seats to book",
  price: "Price",
  serviceFee: "Adeo service fee",
  total: "Total to pay",
  driverGets: "The driver receives the full price",
  payInfo: "Payment: as agreed with the driver. Adeo does not charge the driver any commission.",
  booked: "Booking sent! The driver needs to confirm it.",
  loginNeeded: "Sign in to continue",
  verifyNeeded: "You need to verify your identity to book.",
  goVerify: "Verify identity",
  costShareTitle: "Costs are shared, not profited",
  costShareBody:
    "On Adeo drivers don't make a profit: the price covers fuel and tolls split among everyone in the car.",
  publishTitle: "Offer a ride",
  distanceKm: "Distance (km)",
  tolls: "Total tolls",
  totalSeats: "Seats available",
  pricePerSeat: "Price per seat",
  maxAllowed: "Maximum allowed",
  description: "Ride notes (optional)",
  time: "Time (HH:MM)",
  publish: "Publish",
  published: "Ride published!",
  overCap: "Price is above the shared cost for this route.",
  myTrips: "My rides",
  asPassenger: "As passenger",
  asDriver: "As driver",
  none: "You have no rides yet",
  cancel: "Cancel",
  status_pending: "Pending",
  status_confirmed: "Confirmed",
  status_completed: "Completed",
  status_cancelled: "Cancelled",
  status_active: "Active",
  safety: "Safety",
  sos: "SOS",
  sosHint: "Alerts Adeo and shows your emergency numbers",
  emergencyContact: "Trusted contact",
  contactName: "Name",
  contactPhone: "Phone",
  save: "Save",
  saved: "Saved",
  shareTrip: "Share ride live",
  shareHint: "A relative can see route and schedule for 24 hours.",
  terms: "Terms & conditions",
  privacy: "Privacy policy",
  error: "Error",
  loading: "Loading…",
  comingSoon: "Adeo isn't available in your country yet. You can use it in Chile meanwhile.",
};

export type TKey = keyof Dict;
const dictionaries: Record<string, Dict> = { es, en };

function deviceLocale(): string {
  try {
    if (Platform.OS === "web") return navigator.language || "es-CL";
    const settings = NativeModules.SettingsManager?.settings;
    const ios = settings?.AppleLocale || settings?.AppleLanguages?.[0];
    const android = NativeModules.I18nManager?.localeIdentifier;
    return (ios || android || Intl.DateTimeFormat().resolvedOptions().locale || "es-CL").replace("_", "-");
  } catch {
    return "es-CL";
  }
}

const locale = deviceLocale();
const lang = locale.slice(0, 2).toLowerCase();
const dict: Dict = dictionaries[lang] ?? es;

export function t(key: TKey): string {
  return dict[key];
}

export function currentLanguage(): string {
  return dictionaries[lang] ? lang : "es";
}

/** País del dispositivo si ya está habilitado; si no, Chile. */
export function currentCountry(): CountryCode {
  const region = locale.split("-")[1]?.toUpperCase() as CountryCode | undefined;
  return region && COUNTRIES[region] && isLaunched(region) ? region : DEFAULT_COUNTRY;
}

/** ¿El país del dispositivo existe pero aún no está habilitado? */
export function deviceCountryNotLaunched(): boolean {
  const region = locale.split("-")[1]?.toUpperCase() as CountryCode | undefined;
  return Boolean(region && COUNTRIES[region] && !isLaunched(region));
}
