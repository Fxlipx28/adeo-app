import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { verifications } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { isValidRut, maskDocument } from "../../shared/rut";
import { isUserVerified } from "../lib/guards";
import { storagePut } from "../storage";

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
   * Subir la foto del documento o la selfie (base64). Máx ~5 MB, solo JPEG/PNG.
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        kind: z.enum(["document", "selfie"]),
        mimeType: z.enum(["image/jpeg", "image/png"]),
        base64: z.string().min(100).max(7_000_000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.length > 5 * 1024 * 1024) throw new Error("La imagen supera los 5 MB");
      const ext = input.mimeType === "image/png" ? "png" : "jpg";
      const { url } = await storagePut(`verifications/${ctx.user.id}/${input.kind}.${ext}`, buffer, input.mimeType);
      return { url };
    }),

  /**
   * Crear solicitud de verificación
   */
  submitVerification: protectedProcedure
    .input(
      z.object({
        documentType: z.enum(["passport", "license", "id_card"]),
        documentNumber: z.string().min(5).max(30),
        countryCode: z.string().length(2).default("CL"),
        documentImageUrl: z.string().min(1).max(2000),
        selfieImageUrl: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // En Chile, la cédula se valida con el dígito verificador (módulo 11)
        if (input.countryCode.toUpperCase() === "CL" && input.documentType === "id_card" && !isValidRut(input.documentNumber)) {
          throw new Error("El RUT ingresado no es válido");
        }

        // Verificar si ya existe una verificación
        const existing = await db
          .select()
          .from(verifications)
          .where(eq(verifications.userId, ctx.user.id))
          .limit(1);

        if (existing[0] && existing[0].status !== "rejected") {
          throw new Error("Ya existe una solicitud de verificación para este usuario");
        }

        const values = {
          userId: ctx.user.id,
          documentType: input.documentType,
          // Privacidad: nunca guardamos el número completo, solo enmascarado
          documentNumber: maskDocument(input.documentNumber),
          documentImageUrl: input.documentImageUrl,
          selfieImageUrl: input.selfieImageUrl,
          status: "pending" as const,
          rejectionReason: null,
        };

        if (existing[0]) {
          // Reintento tras un rechazo
          await db.update(verifications).set(values).where(eq(verifications.userId, ctx.user.id));
        } else {
          await db.insert(verifications).values(values);
        }

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
   * ¿Mi identidad está verificada? (solo consulta el propio estado)
   */
  isVerified: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return false;
    return isUserVerified(db, ctx.user.id);
  }),

  /**
   * Obtener verificación de un usuario (solo para admin)
   */
  getVerification: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

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
  rejectVerification: adminProcedure
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
  approveVerification: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");


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
