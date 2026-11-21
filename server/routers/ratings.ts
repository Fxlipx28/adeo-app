import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { bookings, ratings, trips, userProfiles } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";

export const ratingsRouter = router({
  /**
   * Crear una calificación
   */
  create: protectedProcedure
    .input(
      z.object({
        toUserId: z.number(),
        tripId: z.number(),
        score: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        if (input.toUserId === ctx.user.id) {
          throw new Error("No puedes calificarte a ti mismo");
        }

        // Solo participantes del viaje (conductor <-> pasajero con reserva confirmada/completada)
        const tripRows = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
        const trip = tripRows[0];
        if (!trip) throw new Error("Viaje no encontrado");
        const tripBookings = await db.select().from(bookings).where(eq(bookings.tripId, input.tripId));
        const valid = tripBookings.filter((b) => b.status === "confirmed" || b.status === "completed");
        const passengers = new Set(valid.map((b) => b.passengerId));
        const participants = new Set<number>([trip.driverId, ...passengers]);
        if (!participants.has(ctx.user.id) || !participants.has(input.toUserId)) {
          throw new Error("Solo puedes calificar a personas con las que compartiste este viaje");
        }
        if (ctx.user.id !== trip.driverId && input.toUserId !== trip.driverId) {
          throw new Error("Los pasajeros solo califican al conductor");
        }

        // Una calificación por persona y viaje
        const dup = await db
          .select()
          .from(ratings)
          .where(and(eq(ratings.fromUserId, ctx.user.id), eq(ratings.toUserId, input.toUserId), eq(ratings.tripId, input.tripId)))
          .limit(1);
        if (dup[0]) throw new Error("Ya calificaste este viaje");

        // Crear calificación
        await db.insert(ratings).values({
          fromUserId: ctx.user.id,
          toUserId: input.toUserId,
          tripId: input.tripId,
          score: input.score,
          comment: input.comment,
        });

        // Actualizar promedio de calificación del usuario
        const userRatings = await db
          .select()
          .from(ratings)
          .where(eq(ratings.toUserId, input.toUserId));

        if (userRatings.length > 0) {
          const averageScore =
            userRatings.reduce((sum, r) => sum + r.score, 0) / userRatings.length;
          const averageScoreInt = Math.round(averageScore * 10); // Guardar como 48 = 4.8

          // Actualizar o crear perfil de usuario
          const profile = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, input.toUserId))
            .limit(1);

          if (profile[0]) {
            await db
              .update(userProfiles)
              .set({ averageRating: averageScoreInt })
              .where(eq(userProfiles.userId, input.toUserId));
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error creating rating:", error);
        throw error;
      }
    }),

  /**
   * Obtener calificaciones de un usuario
   */
  getUserRatings: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const userRatings = await db
          .select()
          .from(ratings)
          .where(eq(ratings.toUserId, input.userId));

        return userRatings;
      } catch (error) {
        console.error("Error fetching user ratings:", error);
        return [];
      }
    }),

  /**
   * Obtener promedio de calificación de un usuario
   */
  getAverageRating: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const profile = await db
          .select()
          .from(userProfiles)
          .where(eq(userProfiles.userId, input.userId))
          .limit(1);

        if (!profile[0]) {
          return null;
        }

        // Convertir de 48 a 4.8
        const averageRating = profile[0].averageRating
          ? profile[0].averageRating / 10
          : null;

        return {
          userId: input.userId,
          averageRating,
          totalRatings: profile[0].totalTrips,
        };
      } catch (error) {
        console.error("Error fetching average rating:", error);
        return null;
      }
    }),

  /**
   * Obtener calificaciones que el usuario ha dado
   */
  myRatings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const myRatings = await db
        .select()
        .from(ratings)
        .where(eq(ratings.fromUserId, ctx.user.id));

      return myRatings;
    } catch (error) {
      console.error("Error fetching my ratings:", error);
      return [];
    }
  }),
});
