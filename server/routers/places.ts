import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { routeDistanceKm, searchPlaces } from "../lib/geo";

const latlng = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const placesRouter = router({
  /** Buscar un lugar por nombre (requiere sesión para evitar abuso del servicio). */
  search: protectedProcedure
    .input(z.object({ q: z.string().trim().min(3).max(120), countryCode: z.string().length(2).default("CL") }))
    .query(async ({ input }) => {
      try {
        return await searchPlaces(input.q, input.countryCode);
      } catch {
        throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "No pudimos buscar lugares ahora. Intenta de nuevo." });
      }
    }),

  /** Distancia por carretera entre dos puntos. */
  route: protectedProcedure
    .input(z.object({ from: latlng, to: latlng }))
    .query(({ input }) => routeDistanceKm(input.from, input.to)),
});
