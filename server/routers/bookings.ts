import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, trips } from "../../drizzle/schema";
import { getCountry, isFutureDeparture } from "../../shared/countries";
import { calcBookingAmounts } from "../../shared/pricing";
import { areBlocked, assertVerified } from "../lib/guards";

const affected = (res: unknown): number => Number((res as any)?.[0]?.affectedRows ?? (res as any)?.affectedRows ?? 0);

export const bookingsRouter = router({
  /**
   * Reservar asientos. Es atómico: el descuento de asientos solo ocurre si
   * quedan lugares, así dos pasajeros no pueden reservar el mismo asiento.
   * El fee de Adeo se suma al pasajero; el conductor recibe el precio completo.
   */
  create: protectedProcedure
    .input(z.object({ tripId: z.number(), seatsBooked: z.number().int().min(1).max(8) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

      const rows = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
      const trip = rows[0];
      if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Viaje no encontrado" });
      if (trip.status !== "active") throw new TRPCError({ code: "BAD_REQUEST", message: "Este viaje ya no está disponible" });
      if (trip.driverId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No puedes reservar tu propio viaje" });
      }
      if (!isFutureDeparture(trip.countryCode, trip.departureDate, trip.departureTime)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Este viaje ya salió" });
      }
      if (await areBlocked(db, ctx.user.id, trip.driverId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "No puedes reservar este viaje" });
      }
      await assertVerified(db, ctx.user.id, "Debes verificar tu identidad para reservar viajes.");

      const existing = await db
        .select()
        .from(bookings)
        .where(and(eq(bookings.tripId, trip.id), eq(bookings.passengerId, ctx.user.id)));
      if (existing.some((b) => b.status === "pending" || b.status === "confirmed")) {
        throw new TRPCError({ code: "CONFLICT", message: "Ya tienes una reserva en este viaje" });
      }

      const amounts = calcBookingAmounts(trip.pricePerSeat, input.seatsBooked, getCountry(trip.countryCode).serviceFeeRate);

      const bookingId = await db.transaction(async (tx) => {
        const res = await tx
          .update(trips)
          .set({ availableSeats: sql`${trips.availableSeats} - ${input.seatsBooked}` })
          .where(and(eq(trips.id, trip.id), eq(trips.status, "active"), sql`${trips.availableSeats} >= ${input.seatsBooked}`));
        if (affected(res) === 0) {
          throw new TRPCError({ code: "CONFLICT", message: "No quedan asientos suficientes" });
        }
        const ins = await tx.insert(bookings).values({
          tripId: trip.id,
          passengerId: ctx.user.id,
          seatsBooked: input.seatsBooked,
          totalPrice: amounts.totalPrice,
          platformCommission: amounts.platformCommission,
          driverEarnings: amounts.driverEarnings,
          status: "pending",
        });
        return Number((ins as any)[0]?.insertId ?? 0);
      });

      return { success: true as const, bookingId, ...amounts };
    }),

  myBookings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    // Cada reserva con los datos de su viaje (para mostrar ruta, fecha y moneda)
    const rows = await db
      .select({ booking: bookings, trip: trips })
      .from(bookings)
      .innerJoin(trips, eq(bookings.tripId, trips.id))
      .where(eq(bookings.passengerId, ctx.user.id));
    return rows.map((r) => ({ ...r.booking, trip: r.trip }));
  }),

  /** Reservas de un viaje (solo el conductor). */
  tripBookings: protectedProcedure.input(z.object({ tripId: z.number() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
    if (!rows[0] || rows[0].driverId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo el conductor puede ver las reservas" });
    }
    return db.select().from(bookings).where(eq(bookings.tripId, input.tripId));
  }),

  /** Cancelar una reserva: solo si está activa, y devuelve los asientos una única vez. */
  cancel: protectedProcedure.input(z.object({ bookingId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

    const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
    const booking = rows[0];
    if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada" });
    if (booking.passengerId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo el pasajero puede cancelar su reserva" });
    }

    await db.transaction(async (tx) => {
      // Cambio de estado condicionado: si ya estaba cancelada/completada, no hace nada.
      const res = await tx
        .update(bookings)
        .set({ status: "cancelled" })
        .where(and(eq(bookings.id, booking.id), sql`${bookings.status} IN ('pending','confirmed')`));
      if (affected(res) === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Esta reserva ya no se puede cancelar" });
      }
      await tx
        .update(trips)
        .set({ availableSeats: sql`${trips.availableSeats} + ${booking.seatsBooked}` })
        .where(eq(trips.id, booking.tripId));
    });

    return { success: true as const };
  }),

  /** El conductor confirma una reserva pendiente. */
  confirm: protectedProcedure.input(z.object({ bookingId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

    const rows = await db.select().from(bookings).where(eq(bookings.id, input.bookingId)).limit(1);
    const booking = rows[0];
    if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada" });

    const tripRows = await db.select().from(trips).where(eq(trips.id, booking.tripId)).limit(1);
    if (!tripRows[0] || tripRows[0].driverId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo el conductor puede confirmar reservas" });
    }
    if (booking.status !== "pending") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Solo se pueden confirmar reservas pendientes" });
    }

    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, input.bookingId));
    return { success: true as const };
  }),
});
