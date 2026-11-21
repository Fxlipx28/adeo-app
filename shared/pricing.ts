import { getCountry } from "./countries";

/**
 * Regla de COSTO COMPARTIDO.
 *
 * El conductor no puede cobrar por sobre lo que cuesta el viaje. El costo total
 * (km * costo operativo + peajes) se reparte entre todos los ocupantes,
 * incluido el conductor. Así el viaje sigue siendo carpooling y no transporte
 * remunerado de pasajeros.
 */

export interface PriceCapInput {
  countryCode: string;
  distanceKm: number;
  tollsAmount: number;
  totalSeats: number;
}

/** Costo total estimado del viaje en unidades de la moneda. */
export function tripTotalCost({ countryCode, distanceKm, tollsAmount }: Omit<PriceCapInput, "totalSeats">): number {
  const { costPerKm } = getCountry(countryCode);
  if (costPerKm == null) return 0;
  return Math.round(distanceKm * costPerKm + tollsAmount);
}

/**
 * Precio máximo por asiento. Divide entre (asientos + conductor), redondeando
 * hacia arriba para no penalizar por centavos.
 */
export function maxPricePerSeat(input: PriceCapInput): number {
  const total = tripTotalCost(input);
  return Math.ceil(total / (input.totalSeats + 1));
}

export interface BookingAmounts {
  /** Lo que recibe el conductor (siempre = precio publicado * asientos). */
  driverEarnings: number;
  /** Fee de servicio de Adeo, pagado por el pasajero ENCIMA del precio. */
  platformCommission: number;
  /** Total que paga el pasajero. */
  totalPrice: number;
}

/**
 * El fee se suma al pasajero; el conductor recibe el precio completo.
 * Así el conductor nunca recibe más que el costo compartido y Adeo se financia
 * con una tarifa de servicio transparente.
 */
export function calcBookingAmounts(pricePerSeat: number, seats: number, feeRate: number): BookingAmounts {
  const driverEarnings = pricePerSeat * seats;
  const platformCommission = Math.ceil(driverEarnings * feeRate);
  return {
    driverEarnings,
    platformCommission,
    totalPrice: driverEarnings + platformCommission,
  };
}
