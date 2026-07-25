import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Trips table - Viajes publicados por conductores
 */
export const trips = mysqlTable("trips", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull(),
  origin: varchar("origin", { length: 255 }).notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  departureDate: varchar("departureDate", { length: 10 }).notNull(), // YYYY-MM-DD
  departureTime: varchar("departureTime", { length: 5 }).notNull(), // HH:MM
  totalSeats: int("totalSeats").notNull(),
  availableSeats: int("availableSeats").notNull(),
  pricePerSeat: int("pricePerSeat").notNull(), // En centavos o unidades mínimas
  description: text("description"),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type InsertTrip = typeof trips.$inferInsert;

/**
 * Bookings table - Reservas de pasajeros
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  passengerId: int("passengerId").notNull(),
  seatsBooked: int("seatsBooked").notNull(),
  totalPrice: int("totalPrice").notNull(), // Precio total de la reserva
  platformCommission: int("platformCommission").notNull(), // Comisión de Adeo
  driverEarnings: int("driverEarnings").notNull(), // Lo que gana el conductor
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Ratings table - Calificaciones entre usuarios
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  tripId: int("tripId").notNull(),
  score: int("score").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * User profiles - Información adicional del usuario
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  bio: text("bio"),
  userType: mysqlEnum("userType", ["passenger", "driver", "both"]).default("passenger").notNull(),
  averageRating: int("averageRating"), // Almacenado como número entero (ej: 48 = 4.8)
  totalTrips: int("totalTrips").default(0).notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(), // Para conductores
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
