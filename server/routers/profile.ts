import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { userProfiles } from "../../drizzle/schema";
import { storagePut } from "../storage";

export const profileRouter = router({
  /** Subir/cambiar la foto de perfil (se muestra en el mapa y en los viajes). */
  setPhoto: protectedProcedure
    .input(
      z.object({
        mimeType: z.enum(["image/jpeg", "image/png"]),
        base64: z.string().min(100).max(3_000_000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.length > 2 * 1024 * 1024) throw new TRPCError({ code: "BAD_REQUEST", message: "La foto supera los 2 MB" });

      const ext = input.mimeType === "image/png" ? "png" : "jpg";
      const { url } = await storagePut(`avatars/${ctx.user.id}/photo.${ext}`, buffer, input.mimeType);

      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
      if (existing[0]) {
        await db.update(userProfiles).set({ photoUrl: url }).where(eq(userProfiles.userId, ctx.user.id));
      } else {
        await db.insert(userProfiles).values({ userId: ctx.user.id, photoUrl: url });
      }
      return { photoUrl: url };
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return rows[0] ?? null;
  }),
});
