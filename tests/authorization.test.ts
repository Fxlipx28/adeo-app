import { describe, expect, it } from "vitest";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

type U = NonNullable<TrpcContext["user"]>;

function ctxFor(role: "user" | "admin" | null): TrpcContext {
  const user: U | null =
    role === null
      ? null
      : {
          id: role === "admin" ? 99 : 1,
          openId: `u-${role}`,
          email: "x@example.com",
          name: "Test User",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        };
  return { user, req: { protocol: "https", headers: {} } as any, res: {} as any };
}

describe("Autorización (sin base de datos)", () => {
  it("un usuario normal NO puede aprobar su propia verificación", async () => {
    const caller = appRouter.createCaller(ctxFor("user"));
    await expect(caller.verifications.approveVerification({ userId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      caller.verifications.rejectVerification({ userId: 1, reason: "motivo suficiente" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("un usuario normal NO puede marcar pagos como completados ni reembolsar", async () => {
    const caller = appRouter.createCaller(ctxFor("user"));
    await expect(caller.payments.confirmPayment({ transactionId: 1, paymentId: "x" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(caller.payments.refundPayment({ transactionId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("un usuario normal NO puede ver ni gestionar reportes", async () => {
    const caller = appRouter.createCaller(ctxFor("user"));
    await expect(caller.safety.getReports({})).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(caller.safety.updateReportStatus({ reportId: 1, status: "resolved" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("sin sesión no se puede publicar, reservar ni activar SOS", async () => {
    const caller = appRouter.createCaller(ctxFor(null));
    await expect(
      caller.trips.publish({
        origin: "Santiago",
        destination: "Viña del Mar",
        departureDate: "2099-01-01",
        departureTime: "08:00",
        totalSeats: 3,
        pricePerSeat: 1000,
        originLat: -33.45,
        originLng: -70.67,
        destLat: -33.02,
        destLng: -71.55,
        tollsAmount: 0,
        countryCode: "CL",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.bookings.create({ tripId: 1, seatsBooked: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.safety.sos({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("el tope de costo compartido se informa por la API", async () => {
    const caller = appRouter.createCaller(ctxFor(null));
    const r = await caller.trips.priceCap({ countryCode: "CL", distanceKm: 120, tollsAmount: 6000, totalSeats: 3 });
    expect(r.launched).toBe(true);
    expect(r.maxPricePerSeat).toBe(5400);
  });

  it("países no habilitados lo informan", async () => {
    const caller = appRouter.createCaller(ctxFor(null));
    const r = await caller.trips.priceCap({ countryCode: "AR", distanceKm: 100, tollsAmount: 0, totalSeats: 3 });
    expect(r.launched).toBe(false);
  });
});
