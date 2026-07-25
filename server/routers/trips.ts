import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { trips } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const tripsRouter = router({
  /**
   * Obtener todos los viajes disponibles con filtros opcionales
   */
  list: publicProcedure
    .input(
      z.object({
        origin: z.string().optional(),
        destination: z.string().optional(),
        date: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const conditions = [eq(trips.status, "active")];
        
        if (input?.origin) {
          conditions.push(eq(trips.origin, input.origin));
        }
        if (input?.destination) {
          conditions.push(eq(trips.destination, input.destination));
        }
        if (input?.date) {
          conditions.push(eq(trips.departureDate, input.date));
        }

        const results = await db
          .select()
          .from(trips)
          .where(and(...conditions))
          .limit(50);
        
        return results;
      } catch (error) {
        console.error("Error fetching trips:", error);
        return [];
      }
    }),

  /**
   * Obtener detalles de un viaje específico
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, input.id))
          .limit(1);
        
        return trip[0] || null;
      } catch (error) {
        console.error("Error fetching trip:", error);
        return null;
      }
    }),

  /**
   * Publicar un nuevo viaje (solo usuarios autenticados)
   */
  publish: protectedProcedure
    .input(
      z.object({
        origin: z.string().min(1),
        destination: z.string().min(1),
        departureDate: z.string(),
        departureTime: z.string(),
        totalSeats: z.number().min(1).max(8),
        pricePerSeat: z.number().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(trips).values({
          driverId: ctx.user.id,
          origin: input.origin,
          destination: input.destination,
          departureDate: input.departureDate,
          departureTime: input.departureTime,
          totalSeats: input.totalSeats,
          availableSeats: input.totalSeats,
          pricePerSeat: input.pricePerSeat,
          description: input.description,
          status: "active",
        });

        return {
          success: true,
          message: "Trip published successfully",
        };
      } catch (error) {
        console.error("Error publishing trip:", error);
        throw new Error("Failed to publish trip");
      }
    }),

  /**
   * Obtener viajes publicados por el usuario actual (conductor)
   */
  myTrips: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const userTrips = await db
        .select()
        .from(trips)
        .where(eq(trips.driverId, ctx.user.id));
      
      return userTrips;
    } catch (error) {
      console.error("Error fetching user trips:", error);
      return [];
    }
  }),

  /**
   * Cancelar un viaje (solo el conductor que lo publicó)
   */
  cancel: protectedProcedure
    .input(z.object({ tripId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const trip = await db
          .select()
          .from(trips)
          .where(eq(trips.id, input.tripId))
          .limit(1);

        if (!trip[0]) {
          throw new Error("Trip not found");
        }

        if (trip[0].driverId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the driver can cancel this trip");
        }

        await db
          .update(trips)
          .set({ status: "cancelled" })
          .where(eq(trips.id, input.tripId));

        return { success: true };
      } catch (error) {
        console.error("Error cancelling trip:", error);
        throw error;
      }
    }),
});
