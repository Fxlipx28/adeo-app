import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, notInArray } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blocks, trips, userProfiles, users } from "../../drizzle/schema";
import { COUNTRY_CODES, getCountry, isFutureDeparture, isLaunched, localNowStamp } from "../../shared/countries";
import { maxPricePerSeat, tripTotalCost } from "../../shared/pricing";
import { assertVerified } from "../lib/guards";
import { routeDistanceKm } from "../lib/geo";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/** Agrega a cada viaje los datos públicos del conductor: primer nombre, foto y calificación. */
async function withDrivers<T extends { driverId: number }>(db: Db, rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.driverId))];
  const info = new Map<number, { firstName: string; photoUrl: string | null; rating: number | null; totalTrips: number }>();
  for (const id of ids) {
    const u = (await db.select().from(users).where(eq(users.id, id)).limit(1))[0];
    const p = (await db.select().from(userProfiles).where(eq(userProfiles.userId, id)).limit(1))[0];
    info.set(id, {
      firstName: u?.name?.trim().split(" ")[0] || "Conductor",
      photoUrl: p?.photoUrl ?? null,
      rating: p?.averageRating != null ? p.averageRating / 10 : null,
      totalTrips: p?.totalTrips ?? 0,
    });
  }
  return rows.map((r) => ({ ...r, driver: info.get(r.driverId)! }));
}

const dateRe = /^\d{4}-\d{2}-\d{2}$/;
const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;

export const tripsRouter = router({
  /**
   * Buscar viajes activos y futuros. Si hay sesión, oculta conductores con
   * los que existe un bloqueo (en cualquier dirección).
   */
  list: publicProcedure
    .input(
      z
        .object({
          origin: z.string().optional(),
          destination: z.string().optional(),
          date: z.string().regex(dateRe).optional(),
          countryCode: z.enum(COUNTRY_CODES as [string, ...string[]]).optional(),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const country = input?.countryCode ?? "CL";
      const today = localNowStamp(country).slice(0, 10);

      const conditions = [
        eq(trips.status, "active"),
        eq(trips.countryCode, country),
        gte(trips.departureDate, input?.date ?? today),
        gte(trips.availableSeats, 1),
      ];
      if (input?.date) conditions.push(eq(trips.departureDate, input.date));

      if (ctx.user) {
        const rows = await db.select().from(blocks);
        const hidden = rows
          .filter((b) => b.userId === ctx.user!.id || b.blockedUserId === ctx.user!.id)
          .map((b) => (b.userId === ctx.user!.id ? b.blockedUserId : b.userId));
        if (hidden.length) conditions.push(notInArray(trips.driverId, hidden));
      }

      const results = await db
        .select()
        .from(trips)
        .where(and(...conditions))
        .orderBy(asc(trips.departureDate), asc(trips.departureTime))
        .limit(100);

      // Búsqueda flexible por texto (acentos/mayúsculas) y que no salgan viajes ya partidos hoy
      const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
      const now = localNowStamp(country);
      const filtered = results.filter((t) => {
        if (`${t.departureDate} ${t.departureTime}` <= now) return false;
        if (input?.origin && !norm(t.origin).includes(norm(input.origin))) return false;
        if (input?.destination && !norm(t.destination).includes(norm(input.destination))) return false;
        return true;
      });
      return withDrivers(db, filtered);
    }),

  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(trips).where(eq(trips.id, input.id)).limit(1);
    if (!rows[0]) return null;
    return (await withDrivers(db, rows))[0];
  }),

  /** Tope de precio para mostrarlo en el formulario de publicación. */
  priceCap: publicProcedure
    .input(
      z.object({
        countryCode: z.enum(COUNTRY_CODES as [string, ...string[]]),
        distanceKm: z.number().int().min(1).max(5000),
        tollsAmount: z.number().int().min(0).default(0),
        totalSeats: z.number().int().min(1).max(8),
      }),
    )
    .query(({ input }) => ({
      launched: isLaunched(input.countryCode),
      totalCost: tripTotalCost(input),
      maxPricePerSeat: maxPricePerSeat(input),
      currency: getCountry(input.countryCode).currency,
    })),

  /**
   * Publicar un viaje. Reglas:
   *  - el conductor debe tener identidad verificada
   *  - el país debe estar habilitado
   *  - la salida debe ser futura
   *  - el precio por asiento no puede superar el costo compartido
   */
  publish: protectedProcedure
    .input(
      z.object({
        origin: z.string().trim().min(2).max(255),
        destination: z.string().trim().min(2).max(255),
        departureDate: z.string().regex(dateRe),
        departureTime: z.string().regex(timeRe),
        totalSeats: z.number().int().min(1).max(8),
        pricePerSeat: z.number().int().min(0),
        // El conductor elige lugares del mapa; la distancia la calcula el servidor.
        originLat: z.number().min(-90).max(90),
        originLng: z.number().min(-180).max(180),
        destLat: z.number().min(-90).max(90),
        destLng: z.number().min(-180).max(180),
        tollsAmount: z.number().int().min(0).default(0),
        countryCode: z.enum(COUNTRY_CODES as [string, ...string[]]).default("CL"),
        description: z.string().max(1000).optional(),
        luggage: z.enum(["light", "backpack", "large"]).default("backpack"),
        allowsPets: z.boolean().default(false),
        allowsGear: z.boolean().default(false),
        meetingPoint: z.string().trim().max(255).optional(),
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
      if (!isFutureDeparture(input.countryCode, input.departureDate, input.departureTime)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La salida debe ser en el futuro." });
      }

      await assertVerified(db, ctx.user.id, "Debes verificar tu identidad para publicar viajes.");

      // Distancia real por carretera (no se confía en lo que diga el cliente)
      const { km: distanceKm } = await routeDistanceKm(
        { lat: input.originLat, lng: input.originLng },
        { lat: input.destLat, lng: input.destLng },
      );

      const cap = maxPricePerSeat({ ...input, distanceKm });
      if (input.pricePerSeat > cap) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `En Adeo solo se comparten los costos del viaje. El máximo por asiento para esta ruta es ${cap}.`,
        });
      }

      const country = getCountry(input.countryCode);
      const result = await db.insert(trips).values({
        driverId: ctx.user.id,
        origin: input.origin,
        destination: input.destination,
        departureDate: input.departureDate,
        departureTime: input.departureTime,
        totalSeats: input.totalSeats,
        availableSeats: input.totalSeats,
        pricePerSeat: input.pricePerSeat,
        distanceKm,
        originLat: input.originLat,
        originLng: input.originLng,
        destLat: input.destLat,
        destLng: input.destLng,
        tollsAmount: input.tollsAmount,
        countryCode: country.code,
        currency: country.currency,
        description: input.description,
        luggage: input.luggage,
        allowsPets: input.allowsPets,
        allowsGear: input.allowsGear,
        meetingPoint: input.meetingPoint || null,
        status: "active",
      });

      return { success: true as const, tripId: Number((result as any)[0]?.insertId ?? 0) };
    }),

  myTrips: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(trips).where(eq(trips.driverId, ctx.user.id));
  }),

  cancel: protectedProcedure.input(z.object({ tripId: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Base de datos no disponible" });

    const rows = await db.select().from(trips).where(eq(trips.id, input.tripId)).limit(1);
    const trip = rows[0];
    if (!trip) throw new TRPCError({ code: "NOT_FOUND", message: "Viaje no encontrado" });
    if (trip.driverId !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Solo el conductor puede cancelar este viaje" });
    }

    await db.update(trips).set({ status: "cancelled" }).where(eq(trips.id, input.tripId));
    return { success: true as const };
  }),
});
