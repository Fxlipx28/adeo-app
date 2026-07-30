import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { verifications } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const verificationsRouter = router({
  /**
   * Obtener estado de verificación del usuario actual
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return null;

      const verification = await db
        .select()
        .from(verifications)
        .where(eq(verifications.userId, ctx.user.id))
        .limit(1);

      return verification[0] || null;
    } catch (error) {
      console.error("Error fetching verification status:", error);
      return null;
    }
  }),

  /**
   * Crear solicitud de verificación
   */
  submitVerification: protectedProcedure
    .input(
      z.object({
        documentType: z.enum(["passport", "license", "id_card"]),
        documentNumber: z.string().min(5),
        documentImageUrl: z.string().url(),
        selfieImageUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar si ya existe una verificación
        const existing = await db
          .select()
          .from(verifications)
          .where(eq(verifications.userId, ctx.user.id))
          .limit(1);

        if (existing[0]) {
          throw new Error("Ya existe una solicitud de verificación para este usuario");
        }

        // Crear nueva verificación
        await db.insert(verifications).values({
          userId: ctx.user.id,
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          documentImageUrl: input.documentImageUrl,
          selfieImageUrl: input.selfieImageUrl,
          status: "pending",
        });

        return {
          success: true,
          message: "Verificación enviada. Será revisada en 24-48 horas.",
        };
      } catch (error) {
        console.error("Error submitting verification:", error);
        throw error;
      }
    }),

  /**
   * Verificar si el usuario está verificado
   */
  isVerified: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return false;

        const verification = await db
          .select()
          .from(verifications)
          .where(eq(verifications.userId, input.userId))
          .limit(1);

        return verification[0]?.status === "approved";
      } catch (error) {
        console.error("Error checking verification:", error);
        return false;
      }
    }),

  /**
   * Obtener verificación de un usuario (solo para admin)
   */
  getVerification: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        // TODO: Verificar si el usuario es admin
        const verification = await db
          .select()
          .from(verifications)
          .where(eq(verifications.userId, input.userId))
          .limit(1);

        return verification[0] || null;
      } catch (error) {
        console.error("Error fetching verification:", error);
        return null;
      }
    }),

  /**
   * Rechazar verificación (solo admin)
   */
  rejectVerification: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // TODO: Verificar si el usuario es admin

        await db
          .update(verifications)
          .set({
            status: "rejected",
            rejectionReason: input.reason,
          })
          .where(eq(verifications.userId, input.userId));

        return { success: true };
      } catch (error) {
        console.error("Error rejecting verification:", error);
        throw error;
      }
    }),

  /**
   * Aprobar verificación (solo admin)
   */
  approveVerification: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // TODO: Verificar si el usuario es admin

        // Calcular fecha de expiración (1 año)
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await db
          .update(verifications)
          .set({
            status: "approved",
            verifiedAt: new Date(),
            expiresAt,
          })
          .where(eq(verifications.userId, input.userId));

        return { success: true };
      } catch (error) {
        console.error("Error approving verification:", error);
        throw error;
      }
    }),
});
