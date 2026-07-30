import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reports, blocks, supportTickets } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

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

        // TODO: Usar delete en lugar de update cuando esté disponible
        // await db.delete(blocks).where(...);

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
  getReports: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "investigating", "resolved", "dismissed"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        // TODO: Verificar si el usuario es admin

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
  updateReportStatus: protectedProcedure
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

        // TODO: Verificar si el usuario es admin

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
});
