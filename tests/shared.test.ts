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

import { groupByDestination, type MapTrip } from "../shared/mapgroups";

describe("Agrupar viajes por destino (mapa)", () => {
  const mk = (id: number, destLat: number, destLng: number, name: string, seats = 2): MapTrip => ({
    id,
    origin: "Santiago",
    destination: "Viña del Mar, Valparaíso",
    originLat: -33.45,
    originLng: -70.67,
    destLat,
    destLng,
    availableSeats: seats,
    driver: { firstName: name, photoUrl: null },
  });

  it("junta viajes al mismo lugar; la foto es la del primer conductor y suma +N", () => {
    const groups = groupByDestination([mk(7, -33.02, -71.55, "Ana"), mk(3, -33.03, -71.56, "Beto"), mk(9, -33.01, -71.54, "Cami")]);
    expect(groups).toHaveLength(1);
    expect(groups[0].first.firstName).toBe("Beto"); // id más bajo = primero
    expect(groups[0].extra).toBe(2);
    expect(groups[0].label).toBe("Viña del Mar");
  });

  it("separa destinos distintos y omite viajes llenos o sin coordenadas", () => {
    const groups = groupByDestination([
      mk(1, -33.02, -71.55, "A"),
      mk(2, -36.83, -73.05, "B"),
      mk(3, -36.83, -73.05, "C", 0),
      { ...mk(4, 0, 0, "D"), destLat: null, destLng: null },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.map((g) => g.extra)).toEqual([0, 0]);
  });
});

import { clusterGroups } from "../shared/cluster";

describe("clusterGroups (agrupar pines por zoom)", () => {
  const mk = (id: number, dest: string, lat: number, lng: number, cc = "CL") => ({
    id, origin: "X", destination: dest, originLat: null, originLng: null,
    destLat: lat, destLng: lng, availableSeats: 2, countryCode: cc,
    driver: { firstName: `D${id}`, photoUrl: null },
  });
  const groups = groupByDestination([
    mk(1, "Santiago", -33.45, -70.67),
    mk(2, "Viña del Mar", -33.02, -71.55),
    mk(3, "Santiago", -33.45, -70.67),
    mk(4, "Temuco", -38.74, -72.59),
    mk(5, "Ciudad de México", 19.43, -99.13, "MX"),
  ]);

  it("lejos: junta por país; el primer conductor es el del viaje más antiguo", () => {
    const c = clusterGroups(groups, 2);
    const cl = c.find((x) => x.countryCode === "CL")!;
    expect(cl.total).toBe(4);
    expect(cl.extra).toBe(3);
    expect(cl.first.firstName).toBe("D1");
  });

  it("cerca: cada destino queda separado", () => {
    const c = clusterGroups(groups, 12);
    expect(c.length).toBe(groups.length);
  });

  it("zoom medio: Santiago y Viña se juntan pero Temuco no", () => {
    const c = clusterGroups(groups, 6);
    expect(c.some((x) => x.groups.length >= 2)).toBe(true);
    expect(c.find((x) => x.groups.some((g) => g.label === "Temuco"))!.groups.length).toBe(1);
  });

  it("el grupo seleccionado nunca se funde con otros", () => {
    const sel = groups.find((g) => g.label === "Santiago")!.key;
    const c = clusterGroups(groups, 2, { keepSeparate: sel });
    expect(c.find((x) => x.key === sel)!.groups.length).toBe(1);
  });
});
