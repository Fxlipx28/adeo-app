/**
 * Configuración por país.
 *
 * Adeo es mundial, pero cada país se habilita (`launched: true`) solo cuando
 * tiene validado su marco legal y sus parámetros de costo compartido.
 * Chile es el mercado de lanzamiento.
 *
 * IMPORTANTE (Chile): Adeo es una plataforma de VIAJES COMPARTIDOS (carpooling).
 * El conductor solo puede recuperar costos del viaje (combustible, peajes,
 * desgaste), nunca lucrar. Si un viaje se cobrara por sobre el costo, pasaría a
 * ser "transporte remunerado de pasajeros" y caería bajo la Ley 21.553
 * (EAT) y el DS 212/1992. Por eso el precio por asiento tiene un tope.
 */

export type CountryCode = "CL" | "AR" | "PE" | "CO" | "MX" | "ES" | "US";

export interface CountryConfig {
  code: CountryCode;
  name: string;
  currency: string;
  /** Locale BCP-47 para formatear montos y fechas */
  locale: string;
  /** Zona horaria IANA para validar fechas de salida */
  timeZone: string;
  /** Decimales de la moneda (CLP = 0, USD = 2) */
  currencyDigits: number;
  /** Nombre del documento de identidad nacional */
  idLabel: string;
  /** Números de emergencia locales */
  emergency: { police: string; ambulance: string; fire: string };
  /**
   * Costo operativo estimado por km (en unidades de la moneda, sin decimales
   * extra). Se usa para calcular el tope de costo compartido.
   * `null` = país sin parámetros validados -> no se pueden publicar viajes.
   */
  costPerKm: number | null;
  /** Fee de servicio que se suma al pasajero (ej. 0.1 = 10%). */
  serviceFeeRate: number;
  /** País habilitado para publicar y reservar viajes. */
  launched: boolean;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  CL: {
    code: "CL",
    name: "Chile",
    currency: "CLP",
    locale: "es-CL",
    timeZone: "America/Santiago",
    currencyDigits: 0,
    idLabel: "RUT",
    emergency: { police: "133", ambulance: "131", fire: "132" },
    // Referencial (combustible + desgaste). Ajustar con datos reales de mercado.
    costPerKm: 130,
    serviceFeeRate: 0.1,
    launched: true,
  },
  AR: {
    code: "AR",
    name: "Argentina",
    currency: "ARS",
    locale: "es-AR",
    timeZone: "America/Argentina/Buenos_Aires",
    currencyDigits: 0,
    idLabel: "DNI",
    emergency: { police: "911", ambulance: "107", fire: "100" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
  PE: {
    code: "PE",
    name: "Perú",
    currency: "PEN",
    locale: "es-PE",
    timeZone: "America/Lima",
    currencyDigits: 2,
    idLabel: "DNI",
    emergency: { police: "105", ambulance: "116", fire: "116" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
  CO: {
    code: "CO",
    name: "Colombia",
    currency: "COP",
    locale: "es-CO",
    timeZone: "America/Bogota",
    currencyDigits: 0,
    idLabel: "Cédula",
    emergency: { police: "123", ambulance: "123", fire: "123" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
  MX: {
    code: "MX",
    name: "México",
    currency: "MXN",
    locale: "es-MX",
    timeZone: "America/Mexico_City",
    currencyDigits: 2,
    idLabel: "INE/CURP",
    emergency: { police: "911", ambulance: "911", fire: "911" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
  ES: {
    code: "ES",
    name: "España",
    currency: "EUR",
    locale: "es-ES",
    timeZone: "Europe/Madrid",
    currencyDigits: 2,
    idLabel: "DNI/NIE",
    emergency: { police: "112", ambulance: "112", fire: "112" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
  US: {
    code: "US",
    name: "United States",
    currency: "USD",
    locale: "en-US",
    timeZone: "America/New_York",
    currencyDigits: 2,
    idLabel: "ID",
    emergency: { police: "911", ambulance: "911", fire: "911" },
    costPerKm: null,
    serviceFeeRate: 0.1,
    launched: false,
  },
};

export const DEFAULT_COUNTRY: CountryCode = "CL";

export const COUNTRY_CODES = Object.keys(COUNTRIES) as CountryCode[];

export function getCountry(code: string | null | undefined): CountryConfig {
  const key = (code ?? DEFAULT_COUNTRY).toUpperCase() as CountryCode;
  return COUNTRIES[key] ?? COUNTRIES[DEFAULT_COUNTRY];
}

export function isLaunched(code: string | null | undefined): boolean {
  const key = (code ?? "").toUpperCase() as CountryCode;
  return Boolean(COUNTRIES[key]?.launched);
}

/** Formatea un monto (guardado en unidades mínimas) con la moneda del país. */
export function formatMoney(amountMinor: number, code: string | null | undefined): string {
  const country = getCountry(code);
  const value = amountMinor / 10 ** country.currencyDigits;
  return new Intl.NumberFormat(country.locale, {
    style: "currency",
    currency: country.currency,
    minimumFractionDigits: country.currencyDigits,
    maximumFractionDigits: country.currencyDigits,
  }).format(value);
}

/**
 * "Ahora" en la zona horaria del país, como "YYYY-MM-DD HH:MM".
 * Sirve para comparar (lexicográficamente) con la fecha/hora de salida de un viaje.
 */
export function localNowStamp(code: string | null | undefined, now: Date = new Date()): string {
  const { timeZone } = getCountry(code);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

export function isFutureDeparture(
  code: string | null | undefined,
  date: string,
  time: string,
  now: Date = new Date(),
): boolean {
  return `${date} ${time}` > localNowStamp(code, now);
}
