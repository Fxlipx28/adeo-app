import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, trips } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const bookingsRouter = router({
  /**
   * Crear una nueva reserva
   */
  create: protectedProcedure
    .input(
      z.object({
        tripId: z.number(),
        seatsBooked: z.number().min(1).max(8),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obtener información del viaje
        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, input.tripId))
          .limit(1);

        if (!trip[0]) {
          throw new Error("Trip not found");
        }

        // Validar asientos disponibles
        if (trip[0].availableSeats < input.seatsBooked) {
          throw new Error("Not enough available seats");
        }

        // Calcular precios
        const totalPrice = trip[0].pricePerSeat * input.seatsBooked;
        const platformCommission = Math.ceil(totalPrice * 0.1); // 10% para Adeo
        const driverEarnings = totalPrice - platformCommission;

        // Crear reserva
        await db.insert(bookings).values({
          tripId: input.tripId,
          passengerId: ctx.user.id,
          seatsBooked: input.seatsBooked,
          totalPrice,
          platformCommission,
          driverEarnings,
          status: "pending",
        });

        // Actualizar asientos disponibles
        await db
          .update(trips)
          .set({
            availableSeats: trip[0].availableSeats - input.seatsBooked,
          })
          .where(eq(trips.id, input.tripId));

        return {
          success: true,
          message: "Booking created successfully",
          totalPrice,
          platformCommission,
          driverEarnings,
        };
      } catch (error) {
        console.error("Error creating booking:", error);
        throw error;
      }
    }),

  /**
   * Obtener reservas del usuario actual
   */
  myBookings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const userBookings = await db
        .select()
        .from(bookings)
        .where(eq(bookings.passengerId, ctx.user.id));

      return userBookings;
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      return [];
    }
  }),

  /**
   * Obtener reservas para un viaje específico (solo el conductor)
   */
  tripBookings: protectedProcedure
    .input(z.object({ tripId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        // Verificar que el usuario es el conductor del viaje
        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, input.tripId))
          .limit(1);

        if (!trip[0] || trip[0].driverId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the driver can view bookings");
        }

        const tripBookings = await db
          .select()
          .from(bookings)
          .where(eq(bookings.tripId, input.tripId));

        return tripBookings;
      } catch (error) {
        console.error("Error fetching trip bookings:", error);
        return [];
      }
    }),

  /**
   * Cancelar una reserva
   */
  cancel: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const booking = await db
          .select()
          .from(bookings)
          .where(eq(bookings.id, input.bookingId))
          .limit(1);

        if (!booking[0]) {
          throw new Error("Booking not found");
        }

        if (booking[0].passengerId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the passenger can cancel this booking");
        }

        // Actualizar estado de la reserva
        await db
          .update(bookings)
          .set({ status: "cancelled" })
          .where(eq(bookings.id, input.bookingId));

        // Devolver asientos al viaje
        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, booking[0].tripId))
          .limit(1);

        if (trip[0]) {
          await db
            .update(trips)
            .set({
              availableSeats: trip[0].availableSeats + booking[0].seatsBooked,
            })
            .where(eq(trips.id, booking[0].tripId));
        }

        return { success: true };
      } catch (error) {
        console.error("Error cancelling booking:", error);
        throw error;
      }
    }),

  /**
   * Confirmar una reserva (cambiar de pending a confirmed)
   */
  confirm: protectedProcedure
    .input(z.object({ bookingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const booking = await db
          .select()
          .from(bookings)
          .where(eq(bookings.id, input.bookingId))
          .limit(1);

        if (!booking[0]) {
          throw new Error("Booking not found");
        }

        // Verificar que es el conductor del viaje
        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, booking[0].tripId))
          .limit(1);

        if (!trip[0] || trip[0].driverId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the driver can confirm bookings");
        }

        await db
          .update(bookings)
          .set({ status: "confirmed" })
          .where(eq(bookings.id, input.bookingId));

        return { success: true };
      } catch (error) {
        console.error("Error confirming booking:", error);
        throw error;
      }
    }),
});
