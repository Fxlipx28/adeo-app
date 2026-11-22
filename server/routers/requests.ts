import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blocks, rideRequests, userProfiles, users } from "../../drizzle/schema";
import { COUNTRY_CODES, isLaunched, localNowStamp } from "../../shared/countries";
import { assertVerified } from "../lib/guards";

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
/** Máximo de búsquedas abiertas por persona (evita spam). */
const MAX_OPEN_PER_USER = 3;

/**
 * "Busco viaje": el pasajero publica la ruta que necesita y los conductores la ven.
 * No se muestran datos de contacto: el conductor responde publicando su viaje y el
 * pasajero lo reserva por la app (así todo queda dentro de las reglas de seguridad).
 */
export const requestsRouter = router({
  list: publicProcedure
    .input(z.object({ countryCode: z.enum(COUNTRY_CODES as [string, ...string[]]).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const country = input?.countryCode ?? "CL";
      const today = localNowStamp(country).slice(0, 10);
      let rows = await db
        .select()
        .from(rideRequests)
        .where(and(eq(rideRequests.status, "open"), eq(rideRequests.countryCode, country), gte(rideRequests.travelDate, today)))
        .orderBy(asc(rideRequests.travelDate))
        .limit(100);

      if (ctx.user) {
        const all = await db.select().from(blocks);
        const hidden = new Set(
          all
            .filter((b) => b.userId === ctx.user!.id || b.blockedUserId === ctx.user!.id)
            .map((b) => (b.userId === ctx.user!.id ? b.blockedUserId : b.userId)),
        );
        rows = rows.filter((r) => !hidden.has(r.userId));
      }

      const out = [];
      for (const r of rows) {
        const u = (await db.select().from(users).where(eq(users.id, r.userId)).limit(1))[0];
        const p = (await db.select().from(userProfiles).where(eq(userProfiles.userId, r.userId)).limit(1))[0];
        const { userId, ...rest } = r;
        out.push({
          ...rest,
          mine: ctx.user?.id === userId,
          passenger: {
            firstName: u?.name?.trim().split(" ")[0] || "Viajero",
            photoUrl: p?.photoUrl ?? null,
            rating: p?.averageRating != null ? p.averageRating / 10 : null,
          },
        });
      }
      return out;
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(rideRequests).where(and(eq(rideRequests.userId, ctx.user.id), eq(rideRequests.status, "open")));
  }),

  create: protectedProcedure
    .input(
      z.object({
        origin: z.string().trim().min(2).max(255),
        destination: z.string().trim().min(2).max(255),
        originLat: z.number().min(-90).max(90),
        originLng: z.number().min(-180).max(180),
        destLat: z.number().min(-90).max(90),
        destLng: z.number().min(-180).max(180),
        countryCode: z.enum(COUNTRY_CODES as [string, ...string[]]).default("CL"),
        travelDate: z.string().regex(dateRe),
        seats: z.number().int().min(1).max(4).default(1),
        note: z.string().trim().max(500).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });
      if (!isLaunched(input.countryCode)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Adeo aún no está disponible en este país." });
      }
      if (input.origin.toLowerCase() === input.destination.toLowerCase()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "El origen y el destino no pueden ser iguales." });
      }
      if (input.travelDate < localNowStamp(input.countryCode).slice(0, 10)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La fecha no puede ser pasada." });
      }
      await assertVerified(db, ctx.user.id, "Debes verificar tu identidad para publicar una búsqueda.");

      const open = await db.select().from(rideRequests).where(and(eq(rideRequests.userId, ctx.user.id), eq(rideRequests.status, "open")));
      if (open.length >= MAX_OPEN_PER_USER) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Puedes tener hasta ${MAX_OPEN_PER_USER} búsquedas abiertas. Cancela una para crear otra.` });
      }

      const result = await db.insert(rideRequests).values({ ...input, userId: ctx.user.id, note: input.note || null });
      return { success: true as const, requestId: Number((result as any)[0]?.insertId ?? 0) };
    }),

  cancel: protectedProcedure.input(z.object({ requestId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });
    const r = (await db.select().from(rideRequests).where(eq(rideRequests.id, input.requestId)).limit(1))[0];
    if (!r || r.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND", message: "Búsqueda no encontrada" });
    await db.update(rideRequests).set({ status: "cancelled" }).where(eq(rideRequests.id, r.id));
    return { success: true as const };
  }),
});
