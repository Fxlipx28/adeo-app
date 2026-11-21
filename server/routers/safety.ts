import { z } from "zod";
import { randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reports, blocks, supportTickets, trips, bookings, tripShares, userProfiles, users } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import { getCountry } from "../../shared/countries";

export const safetyRouter = router({
  /**
   * Crear un reporte de usuario
   */
  reportUser: protectedProcedure
    .input(
      z.object({
        reportedUserId: z.number(),
        tripId: z.number().optional(),
        reason: z.string().min(10),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // No permitir reportarse a sí mismo
        if (input.reportedUserId === ctx.user.id) {
          throw new Error("No puedes reportarte a ti mismo");
        }

        await db.insert(reports).values({
          reportedByUserId: ctx.user.id,
          reportedUserId: input.reportedUserId,
          tripId: input.tripId,
          reason: input.reason,
          description: input.description,
          status: "open",
        });

        return {
          success: true,
          message: "Reporte enviado. Será revisado por nuestro equipo.",
        };
      } catch (error) {
        console.error("Error reporting user:", error);
        throw error;
      }
    }),

  /**
   * Bloquear un usuario
   */
  blockUser: protectedProcedure
    .input(
      z.object({
        blockedUserId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // No permitir bloquearse a sí mismo
        if (input.blockedUserId === ctx.user.id) {
          throw new Error("No puedes bloquearte a ti mismo");
        }

        // Verificar si ya está bloqueado
        const existing = await db
          .select()
          .from(blocks)
          .where(
            and(
              eq(blocks.userId, ctx.user.id),
              eq(blocks.blockedUserId, input.blockedUserId)
            )
          )
          .limit(1);

        if (existing[0]) {
          throw new Error("Este usuario ya está bloqueado");
        }

        await db.insert(blocks).values({
          userId: ctx.user.id,
          blockedUserId: input.blockedUserId,
          reason: input.reason,
        });

        return { success: true, message: "Usuario bloqueado" };
      } catch (error) {
        console.error("Error blocking user:", error);
        throw error;
      }
    }),

  /**
   * Desbloquear un usuario
   */
  unblockUser: protectedProcedure
    .input(z.object({ blockedUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .delete(blocks)
          .where(and(eq(blocks.userId, ctx.user.id), eq(blocks.blockedUserId, input.blockedUserId)));

        return { success: true, message: "Usuario desbloqueado" };
      } catch (error) {
        console.error("Error unblocking user:", error);
        throw error;
      }
    }),

  /**
   * Obtener lista de usuarios bloqueados
   */
  getBlockedUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const blockedUsers = await db
        .select()
        .from(blocks)
        .where(eq(blocks.userId, ctx.user.id));

      return blockedUsers;
    } catch (error) {
      console.error("Error fetching blocked users:", error);
      return [];
    }
  }),

  /**
   * Crear ticket de soporte
   */
  createSupportTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5),
        description: z.string().min(20),
        category: z.enum(["payment", "safety", "technical", "other"]),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(supportTickets).values({
          userId: ctx.user.id,
          subject: input.subject,
          description: input.description,
          category: input.category,
          priority: input.priority || "medium",
          status: "open",
        });

        return {
          success: true,
          message: "Ticket de soporte creado. Nos pondremos en contacto pronto.",
        };
      } catch (error) {
        console.error("Error creating support ticket:", error);
        throw error;
      }
    }),

  /**
   * Obtener mis tickets de soporte
   */
  mySupportTickets: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const tickets = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.userId, ctx.user.id));

      return tickets;
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      return [];
    }
  }),

  /**
   * Obtener reportes (solo admin)
   */
  getReports: adminProcedure
    .input(
      z.object({
        status: z.enum(["open", "investigating", "resolved", "dismissed"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        if (input?.status) {
          return await db.select().from(reports).where(eq(reports.status, input.status));
        }

        return await db.select().from(reports);
      } catch (error) {
        console.error("Error fetching reports:", error);
        return [];
      }
    }),

  /**
   * Actualizar estado de reporte (solo admin)
   */
  updateReportStatus: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        status: z.enum(["open", "investigating", "resolved", "dismissed"]),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(reports)
          .set({
            status: input.status,
            resolution: input.resolution,
            resolvedAt: input.status === "resolved" ? new Date() : undefined,
          })
          .where(eq(reports.id, input.reportId));

        return { success: true };
      } catch (error) {
        console.error("Error updating report:", error);
        throw error;
      }
    }),

  /**
   * Guardar contacto de emergencia y país del usuario.
   */
  saveSafetyProfile: protectedProcedure
    .input(
      z.object({
        emergencyContactName: z.string().trim().min(2).max(120),
        emergencyContactPhone: z.string().trim().min(6).max(20),
        countryCode: z.string().length(2).default("CL"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
      const values = {
        emergencyContactName: input.emergencyContactName,
        emergencyContactPhone: input.emergencyContactPhone,
        countryCode: input.countryCode.toUpperCase(),
      };
      if (existing[0]) {
        await db.update(userProfiles).set(values).where(eq(userProfiles.userId, ctx.user.id));
      } else {
        await db.insert(userProfiles).values({ userId: ctx.user.id, ...values });
      }
      return { success: true as const };
    }),

  /**
   * Compartir un viaje: genera un enlace (token aleatorio, expira en 24 h) para
   * que un familiar vea ruta y horario. Solo conductor o pasajero con reserva.
   */
  createTripShare: protectedProcedure
    .input(z.object({ tripId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

      const tripRows = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
      const trip = tripRows[0];
      if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Viaje no encontrado" });

      let participant = trip.driverId === ctx.user.id;
      if (!participant) {
        const mine = await db
          .select()
          .from(bookings)
          .where(and(eq(bookings.tripId, trip.id), eq(bookings.passengerId, ctx.user.id)));
        participant = mine.some((b) => b.status === "pending" || b.status === "confirmed" || b.status === "completed");
      }
      if (!participant) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo participantes del viaje pueden compartirlo" });
      }

      const token = randomBytes(24).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await db.insert(tripShares).values({ tripId: trip.id, userId: ctx.user.id, token, expiresAt });
      return { token, expiresAt };
    }),

  /**
   * Vista pública del enlace compartido. Datos mínimos: ruta, horario y
   * primer nombre del conductor. Nunca teléfono, email ni documento.
   */
  getSharedTrip: publicProcedure
    .input(z.object({ token: z.string().min(32).max(64) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const shares = await db
        .select()
        .from(tripShares)
        .where(and(eq(tripShares.token, input.token), gt(tripShares.expiresAt, new Date())))
        .limit(1);
      if (!shares[0]) return null;

      const tripRows = await db.select().from(trips).where(eq(trips.id, shares[0].tripId)).limit(1);
      const trip = tripRows[0];
      if (!trip) return null;
      const driver = await db.select().from(users).where(eq(users.id, trip.driverId)).limit(1);

      return {
        origin: trip.origin,
        destination: trip.destination,
        departureDate: trip.departureDate,
        departureTime: trip.departureTime,
        status: trip.status,
        driverFirstName: driver[0]?.name?.split(" ")[0] ?? null,
        expiresAt: shares[0].expiresAt,
      };
    }),

  /**
   * Botón SOS: registra un ticket urgente de seguridad y devuelve los números
   * de emergencia del país junto al contacto de confianza del usuario.
   * No reemplaza llamar a emergencias.
   */
  sos: protectedProcedure
    .input(
      z.object({
        tripId: z.number().optional(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

      const profileRows = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
      const profile = profileRows[0];
      const country = getCountry(profile?.countryCode);

      const where =
        input.latitude != null && input.longitude != null ? ` Ubicación: ${input.latitude}, ${input.longitude}.` : "";
      await db.insert(supportTickets).values({
        userId: ctx.user.id,
        subject: "SOS - alerta de seguridad",
        description: `El usuario activó el botón SOS${input.tripId ? ` en el viaje #${input.tripId}` : ""}.${where}`,
        category: "safety",
        priority: "urgent",
        status: "open",
      });

      return {
        emergency: country.emergency,
        trustedContact: profile?.emergencyContactPhone
          ? { name: profile.emergencyContactName, phone: profile.emergencyContactPhone }
          : null,
      };
    }),
});
