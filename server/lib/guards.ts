import { TRPCError } from "@trpc/server";
import { and, eq, or } from "drizzle-orm";
import { ENV } from "../_core/env";
import { blocks, verifications } from "../../drizzle/schema";
import type { getDb } from "../db";

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

/** Identidad aprobada y no vencida. */
export async function isUserVerified(db: Db, userId: number): Promise<boolean> {
  if (!ENV.requireVerification) return true;
  const rows = await db.select().from(verifications).where(eq(verifications.userId, userId)).limit(1);
  const v = rows[0];
  if (!v || v.status !== "approved") return false;
  return !v.expiresAt || v.expiresAt.getTime() > Date.now();
}

export async function assertVerified(db: Db, userId: number, message: string) {
  if (!(await isUserVerified(db, userId))) {
    throw new TRPCError({ code: "FORBIDDEN", message });
  }
}

/** true si alguno de los dos bloqueó al otro. */
export async function areBlocked(db: Db, a: number, b: number): Promise<boolean> {
  const rows = await db
    .select()
    .from(blocks)
    .where(
      or(
        and(eq(blocks.userId, a), eq(blocks.blockedUserId, b)),
        and(eq(blocks.userId, b), eq(blocks.blockedUserId, a)),
      ),
    )
    .limit(1);
  return rows.length > 0;
}
