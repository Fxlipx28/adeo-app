/**
 * MODO DEMO (EXPO_PUBLIC_DEMO=1)
 *
 * Reemplaza al servidor por datos de ejemplo en memoria para poder ver la app
 * publicada como sitio estático (GitHub Pages) sin base de datos ni login.
 * Nada se guarda: al recargar vuelve al estado inicial.
 */
import { TRPCClientError, type TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "@/server/routers";
import { COUNTRIES } from "@/shared/countries";
import { calcBookingAmounts, maxPricePerSeat, tripTotalCost } from "@/shared/pricing";

export const IS_DEMO = process.env.EXPO_PUBLIC_DEMO === "1";

const CITIES: Record<string, { name: string; lat: number; lng: number }> = {
  stgo: { name: "Santiago", lat: -33.4489, lng: -70.6693 },
  vina: { name: "Viña del Mar", lat: -33.0153, lng: -71.55 },
  valpo: { name: "Valparaíso", lat: -33.0472, lng: -71.6127 },
  conce: { name: "Concepción", lat: -36.8201, lng: -73.0444 },
  talca: { name: "Talca", lat: -35.4264, lng: -71.6554 },
  serena: { name: "La Serena", lat: -29.9027, lng: -71.252 },
  temuco: { name: "Temuco", lat: -38.7359, lng: -72.5904 },
  rancagua: { name: "Rancagua", lat: -34.1708, lng: -70.7444 },
  losandes: { name: "Los Andes", lat: -32.8337, lng: -70.5983 },
  chillan: { name: "Chillán", lat: -36.6066, lng: -72.1034 },
  pucon: { name: "Pucón", lat: -39.2823, lng: -71.9755 },
  osorno: { name: "Osorno", lat: -40.5739, lng: -73.1332 },
};

const haversine = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
};
const roadKm = (a: any, b: any) => Math.max(1, Math.round(haversine(a, b) * 1.2));
const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Avatar de ejemplo (SVG en data-URI) para que los pines muestren "fotos". */
const avatar = (_letter: string, bg: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='${bg}'/><circle cx='48' cy='38' r='17' fill='#fff' fill-opacity='.9'/><ellipse cx='48' cy='86' rx='30' ry='24' fill='#fff' fill-opacity='.9'/></svg>`,
  );

const DRIVERS: Record<number, { firstName: string; photoUrl: string | null; rating: number; totalTrips: number }> = {
  1: { firstName: "Felipe", photoUrl: null, rating: 5, totalTrips: 3 },
  2: { firstName: "Carlos", photoUrl: avatar("C", "#0a7ea4"), rating: 4.9, totalTrips: 41 },
  3: { firstName: "María", photoUrl: avatar("M", "#db2777"), rating: 4.8, totalTrips: 27 },
  4: { firstName: "Joaquín", photoUrl: avatar("J", "#16a34a"), rating: 4.9, totalTrips: 18 },
  5: { firstName: "Valentina", photoUrl: avatar("V", "#7c3aed"), rating: 4.8, totalTrips: 33 },
  6: { firstName: "Camila", photoUrl: avatar("C", "#ea580c"), rating: 5.0, totalTrips: 12 },
  7: { firstName: "Matías", photoUrl: avatar("M", "#0891b2"), rating: 4.7, totalTrips: 9 },
};

const today = new Date();
const dayStr = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

let nextId = 100;
const seed = (id: number, driverId: number, o: string, d: string, day: number, time: string, seats: number, price: number, desc = "") => {
  const O = CITIES[o], D = CITIES[d];
  const km = roadKm(O, D);
  return {
    id, driverId, origin: O.name, destination: D.name,
    departureDate: dayStr(day), departureTime: time,
    totalSeats: 3, availableSeats: seats, pricePerSeat: price,
    originLat: O.lat, originLng: O.lng, destLat: D.lat, destLng: D.lng,
    countryCode: "CL", currency: "CLP", distanceKm: km, tollsAmount: Math.round((km * 45) / 100) * 100,
    description: desc, status: "active" as const, createdAt: new Date(), updatedAt: new Date(),
  };
};

const trips: any[] = [
  seed(1, 2, "stgo", "vina", 1, "08:30", 3, 4500, "Salgo desde Los Leones. Equipaje liviano."),
  seed(2, 3, "stgo", "vina", 1, "17:00", 2, 4800, "Vuelvo el domingo si alguien necesita."),
  seed(3, 4, "stgo", "conce", 3, "07:00", 3, 12500, "Paro a tomar café en Chillán."),
  seed(4, 5, "stgo", "serena", 4, "06:30", 3, 9800),
  seed(5, 6, "stgo", "temuco", 5, "06:00", 2, 16500),
  seed(6, 7, "chillan", "conce", 2, "12:00", 2, 3800),
  seed(7, 2, "vina", "stgo", 2, "19:30", 1, 4500),
  seed(8, 3, "rancagua", "stgo", 1, "07:15", 3, 2500),
  seed(9, 4, "stgo", "talca", 2, "09:00", 2, 6500),
  seed(10, 5, "stgo", "valpo", 2, "10:00", 3, 4600),
  seed(11, 6, "stgo", "pucon", 6, "05:30", 3, 21000),
  seed(12, 7, "conce", "stgo", 3, "16:00", 3, 12500),
  seed(13, 2, "losandes", "stgo", 1, "18:00", 3, 2500),
];
const bookings: any[] = [];
const me = { id: 1, openId: "demo", name: "Felipe López", email: "demo@adeo.app", loginMethod: "demo", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() };

const withDriver = (t: any) => ({ ...t, driver: DRIVERS[t.driverId] ?? DRIVERS[2] });
const err = (message: string) => { throw new Error(message); };

function handle(path: string, input: any): unknown {
  switch (path) {
    case "auth.me": return me;
    case "auth.logout": return { success: true };

    case "trips.list": {
      const c = input?.countryCode ?? "CL";
      return trips
        .filter((t) => t.status === "active" && t.availableSeats > 0 && t.countryCode === c)
        .filter((t) => !input?.origin || norm(t.origin).includes(norm(input.origin)))
        .filter((t) => !input?.destination || norm(t.destination).includes(norm(input.destination)))
        .map(withDriver);
    }
    case "trips.getById": { const t = trips.find((x) => x.id === input.id); return t ? withDriver(t) : null; }
    case "trips.priceCap":
      return { launched: !!COUNTRIES[input.countryCode as "CL"]?.launched, totalCost: tripTotalCost(input), maxPricePerSeat: maxPricePerSeat(input), currency: "CLP" };
    case "trips.publish": {
      const km = roadKm({ lat: input.originLat, lng: input.originLng }, { lat: input.destLat, lng: input.destLng });
      const cap = maxPricePerSeat({ countryCode: input.countryCode, distanceKm: km, tollsAmount: input.tollsAmount ?? 0, totalSeats: input.totalSeats });
      if (input.pricePerSeat > cap) err(`En Adeo solo se comparten los costos del viaje. El máximo por asiento para esta ruta es ${cap}.`);
      const id = nextId++;
      trips.unshift({
        id, driverId: 1, origin: input.origin, destination: input.destination, departureDate: input.departureDate, departureTime: input.departureTime,
        totalSeats: input.totalSeats, availableSeats: input.totalSeats, pricePerSeat: input.pricePerSeat,
        originLat: input.originLat, originLng: input.originLng, destLat: input.destLat, destLng: input.destLng,
        countryCode: "CL", currency: "CLP", distanceKm: km, tollsAmount: input.tollsAmount ?? 0, description: input.description ?? "",
        status: "active", createdAt: new Date(), updatedAt: new Date(),
      });
      return { success: true, tripId: id };
    }
    case "trips.myTrips": return trips.filter((t) => t.driverId === 1);
    case "trips.cancel": { const t = trips.find((x) => x.id === input.tripId); if (t) t.status = "cancelled"; return { success: true }; }

    case "bookings.create": {
      const t = trips.find((x) => x.id === input.tripId) ?? err("Viaje no encontrado");
      if (t.driverId === 1) err("No puedes reservar tu propio viaje");
      if (t.availableSeats < input.seatsBooked) err("No quedan asientos suficientes");
      const a = calcBookingAmounts(t.pricePerSeat, input.seatsBooked, COUNTRIES.CL.serviceFeeRate);
      t.availableSeats -= input.seatsBooked;
      const b = { id: nextId++, tripId: t.id, passengerId: 1, seatsBooked: input.seatsBooked, totalPrice: a.totalPrice, platformCommission: a.platformCommission, driverEarnings: a.driverEarnings, status: "pending", createdAt: new Date(), updatedAt: new Date() };
      bookings.push(b);
      return { success: true, bookingId: b.id, ...a };
    }
    case "bookings.myBookings": return bookings.map((b) => ({ ...b, trip: trips.find((t) => t.id === b.tripId) }));
    case "bookings.cancel": {
      const b = bookings.find((x) => x.id === input.bookingId);
      if (b && b.status !== "cancelled") { b.status = "cancelled"; const t = trips.find((x) => x.id === b.tripId); if (t) t.availableSeats += b.seatsBooked; }
      return { success: true };
    }
    case "bookings.tripBookings": return [];
    case "bookings.confirm": return { success: true };

    case "places.search": {
      const q = norm(input.q);
      return Object.values(CITIES).filter((c) => norm(c.name).includes(q)).map((c) => ({ name: c.name, label: `${c.name}, Chile`, lat: c.lat, lng: c.lng }));
    }
    case "places.route": return { km: roadKm(input.from, input.to), source: "estimate" };

    case "verifications.getStatus": return { status: "approved", userId: 1 };
    case "verifications.isVerified": return true;
    case "verifications.uploadImage": return { url: "demo" };
    case "verifications.submitVerification": return { success: true, message: "Demo: verificación simulada." };

    case "profile.mine": return { photoUrl: null };
    case "profile.setPhoto": return { photoUrl: null };

    case "safety.sos": return { emergency: COUNTRIES.CL.emergency, trustedContact: null };
    case "safety.createTripShare": return { token: "demo".padEnd(48, "0"), expiresAt: new Date(Date.now() + 864e5) };
    case "safety.getSharedTrip": return null;
    case "safety.saveSafetyProfile": return { success: true };
    case "safety.createSupportTicket": return { success: true, message: "Demo: ticket simulado." };
    case "ratings.getAverageRating": return { averageRating: 4.9, totalRatings: 3 };
    default: return /^(my|list|get)[A-Z]/.test(path.split(".")[1] ?? "") ? [] : null;
  }
}

export const demoLink: TRPCLink<AppRouter> = () => ({ op }) =>
  observable((observer) => {
    const t = setTimeout(() => {
      try {
        observer.next({ result: { data: handle(op.path, op.input) } } as any);
        observer.complete();
      } catch (e) {
        observer.error(TRPCClientError.from(e as Error));
      }
    }, 120);
    return () => clearTimeout(t);
  });
