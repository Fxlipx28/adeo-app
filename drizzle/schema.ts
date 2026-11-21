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
  pricePerSeat: int("pricePerSeat").notNull(), // En unidades mínimas de la moneda (CLP no tiene decimales)
  countryCode: varchar("countryCode", { length: 2 }).default("CL").notNull(),
  currency: varchar("currency", { length: 3 }).default("CLP").notNull(),
  distanceKm: int("distanceKm").default(0).notNull(), // Base del tope de costo compartido
  tollsAmount: int("tollsAmount").default(0).notNull(), // Peajes del trayecto
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
  countryCode: varchar("countryCode", { length: 2 }).default("CL").notNull(),
  emergencyContactName: varchar("emergencyContactName", { length: 120 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 20 }),
  userType: mysqlEnum("userType", ["passenger", "driver", "both"]).default("passenger").notNull(),
  averageRating: int("averageRating"), // Almacenado como número entero (ej: 48 = 4.8)
  totalTrips: int("totalTrips").default(0).notNull(),
  totalEarnings: int("totalEarnings").default(0).notNull(), // Para conductores
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Verifications table - Verificación de identidad de usuarios
 */
export const verifications = mysqlTable("verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  documentType: varchar("documentType", { length: 50 }).notNull(),
  documentNumber: varchar("documentNumber", { length: 100 }).notNull(),
  documentImageUrl: text("documentImageUrl"),
  selfieImageUrl: text("selfieImageUrl"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  verifiedAt: timestamp("verifiedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

/**
 * Transactions table - Historial de transacciones de pago
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["paypal", "stripe", "cash"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Reports table - Reportes de usuarios
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  reportedByUserId: int("reportedByUserId").notNull(),
  reportedUserId: int("reportedUserId").notNull(),
  tripId: int("tripId"),
  reason: varchar("reason", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["open", "investigating", "resolved", "dismissed"]).default("open").notNull(),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Blocks table - Usuarios bloqueados
 */
export const blocks = mysqlTable("blocks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  blockedUserId: int("blockedUserId").notNull(),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = typeof blocks.$inferInsert;

/**
 * Trip tracking table - Seguimiento en tiempo real de viajes
 */
export const tripTracking = mysqlTable("tripTracking", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  latitude: varchar("latitude", { length: 20 }).notNull(),
  longitude: varchar("longitude", { length: 20 }).notNull(),
  accuracy: int("accuracy"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type TripTracking = typeof tripTracking.$inferSelect;
export type InsertTripTracking = typeof tripTracking.$inferInsert;

/**
 * Trip shares - Enlaces para que un familiar siga un viaje en vivo.
 * El token es aleatorio, expira y solo expone datos mínimos del viaje.
 */
export const tripShares = mysqlTable("tripShares", {
  id: int("id").autoincrement().primaryKey(),
  tripId: int("tripId").notNull(),
  userId: int("userId").notNull(), // quien comparte
  token: varchar("token", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TripShare = typeof tripShares.$inferSelect;
export type InsertTripShare = typeof tripShares.$inferInsert;

/**
 * Payment methods table - Métodos de pago guardados
 */
export const paymentMethods = mysqlTable("paymentMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["paypal", "stripe", "cash"]).notNull(),
  isDefault: int("isDefault").default(0).notNull(),
  paypalEmail: varchar("paypalEmail", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

/**
 * Support tickets table - Tickets de soporte
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  response: text("response"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
