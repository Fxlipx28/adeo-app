import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { transactions, paymentMethods, bookings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const paymentsRouter = router({
  /**
   * Obtener métodos de pago del usuario
   */
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const methods = await db
        .select()
        .from(paymentMethods)
        .where(eq(paymentMethods.userId, ctx.user.id));

      return methods;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      return [];
    }
  }),

  /**
   * Agregar método de pago
   */
  addPaymentMethod: protectedProcedure
    .input(
      z.object({
        type: z.enum(["paypal", "stripe", "cash"]),
        paypalEmail: z.string().email().optional(),
        stripeCustomerId: z.string().optional(),
        isDefault: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Si es el método por defecto, desmarcar otros
        if (input.isDefault) {
          await db
            .update(paymentMethods)
            .set({ isDefault: 0 })
            .where(eq(paymentMethods.userId, ctx.user.id));
        }

        await db.insert(paymentMethods).values({
          userId: ctx.user.id,
          type: input.type,
          paypalEmail: input.paypalEmail,
          stripeCustomerId: input.stripeCustomerId,
          isDefault: input.isDefault ? 1 : 0,
        });

        return { success: true };
      } catch (error) {
        console.error("Error adding payment method:", error);
        throw error;
      }
    }),

  /**
   * Crear transacción de pago
   */
  createTransaction: protectedProcedure
    .input(
      z.object({
        bookingId: z.number(),
        amount: z.number().min(1),
        paymentMethod: z.enum(["paypal", "stripe", "cash"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar que la reserva existe y pertenece al usuario
        const booking = await db
          .select()
          .from(bookings)
          .where(eq(bookings.id, input.bookingId))
          .limit(1);

        if (!booking[0] || booking[0].passengerId !== ctx.user.id) {
          throw new Error("Booking not found or unauthorized");
        }

        // Crear transacción
        const result = await db.insert(transactions).values({
          bookingId: input.bookingId,
          userId: ctx.user.id,
          amount: input.amount,
          paymentMethod: input.paymentMethod,
          paymentStatus: "pending",
          description: `Pago de viaje - Reserva #${input.bookingId}`,
        });

        return {
          success: true,
          message: "Transacción creada. Proceda al pago.",
        };
      } catch (error) {
        console.error("Error creating transaction:", error);
        throw error;
      }
    }),

  /**
   * Obtener historial de transacciones
   */
  getTransactionHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const history = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, ctx.user.id));

      return history;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }),

  /**
   * Confirmar pago (webhook de PayPal/Stripe)
   */
  confirmPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.number(),
        paymentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verificar que la transacción pertenece al usuario
        const transaction = await db
          .select()
          .from(transactions)
          .where(eq(transactions.id, input.transactionId))
          .limit(1);

        if (!transaction[0] || transaction[0].userId !== ctx.user.id) {
          throw new Error("Transaction not found or unauthorized");
        }

        // Actualizar estado de la transacción
        await db
          .update(transactions)
          .set({
            paymentStatus: "completed",
            transactionId: input.paymentId,
          })
          .where(eq(transactions.id, input.transactionId));

        return { success: true };
      } catch (error) {
        console.error("Error confirming payment:", error);
        throw error;
      }
    }),

  /**
   * Procesar reembolso
   */
  refundPayment: protectedProcedure
    .input(z.object({ transactionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const transaction = await db
          .select()
          .from(transactions)
          .where(eq(transactions.id, input.transactionId))
          .limit(1);

        if (!transaction[0] || transaction[0].userId !== ctx.user.id) {
          throw new Error("Transaction not found or unauthorized");
        }

        // TODO: Procesar reembolso en PayPal/Stripe

        await db
          .update(transactions)
          .set({ paymentStatus: "refunded" })
          .where(eq(transactions.id, input.transactionId));

        return { success: true, message: "Reembolso procesado" };
      } catch (error) {
        console.error("Error refunding payment:", error);
        throw error;
      }
    }),
});
