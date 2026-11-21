import { describe, expect, it } from "vitest";
import { isValidRut, normalizeRut, computeRutDv, maskDocument } from "../shared/rut";
import { calcBookingAmounts, maxPricePerSeat, tripTotalCost } from "../shared/pricing";
import { formatMoney, getCountry, isLaunched } from "../shared/countries";

describe("RUT", () => {
  it("valida RUTs correctos con distintos formatos", () => {
    expect(isValidRut("12.345.678-5")).toBe(true);
    expect(isValidRut("12345678-5")).toBe(true);
    expect(isValidRut("123456785")).toBe(true);
    expect(isValidRut("11.111.111-1")).toBe(true);
  });

  it("rechaza dígito verificador incorrecto o formato inválido", () => {
    expect(isValidRut("12.345.678-9")).toBe(false);
    expect(isValidRut("123")).toBe(false);
    expect(isValidRut("abc")).toBe(false);
  });

  it("calcula DV 0 y K", () => {
    expect(computeRutDv("10000013")).toBe("K");
    expect(computeRutDv("10000000")).toBe("8");
    expect(isValidRut("10.000.013-K")).toBe(true);
    expect(isValidRut("10000013-k")).toBe(true);
  });

  it("normaliza y enmascara", () => {
    expect(normalizeRut("12.345.678-5")).toBe("12345678-5");
    expect(maskDocument("12345678-5")).toBe("******785");
  });
});

describe("Costo compartido", () => {
  it("Santiago-Viña (120 km + peajes, 3 asientos) queda cerca de 5 lukas", () => {
    const cap = maxPricePerSeat({ countryCode: "CL", distanceKm: 120, tollsAmount: 6000, totalSeats: 3 });
    expect(tripTotalCost({ countryCode: "CL", distanceKm: 120, tollsAmount: 6000 })).toBe(21600);
    expect(cap).toBe(5400);
    expect(cap).toBeGreaterThanOrEqual(5000);
  });

  it("más asientos -> menor tope por asiento", () => {
    const a = maxPricePerSeat({ countryCode: "CL", distanceKm: 100, tollsAmount: 0, totalSeats: 1 });
    const b = maxPricePerSeat({ countryCode: "CL", distanceKm: 100, tollsAmount: 0, totalSeats: 4 });
    expect(b).toBeLessThan(a);
  });

  it("el fee va encima del pasajero y el conductor recibe el precio completo", () => {
    const r = calcBookingAmounts(5000, 2, 0.1);
    expect(r.driverEarnings).toBe(10000);
    expect(r.platformCommission).toBe(1000);
    expect(r.totalPrice).toBe(11000);
  });
});

describe("Países", () => {
  it("solo Chile está habilitado al inicio", () => {
    expect(isLaunched("CL")).toBe(true);
    expect(isLaunched("AR")).toBe(false);
    expect(isLaunched("XX")).toBe(false);
  });

  it("formatea CLP sin decimales", () => {
    expect(formatMoney(5400, "CL").replace(/\s/g, "")).toContain("5.400");
    expect(getCountry("cl").currency).toBe("CLP");
  });
});
