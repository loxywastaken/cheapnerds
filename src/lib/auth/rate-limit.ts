import "server-only";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { loginAttempts } from "@/db/schema";
import { hmac } from "./crypto";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_EMAIL = 5;
const MAX_FAILS_PER_IP = 20;

export async function clientIp() {
  const h = await headers();
  return h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Database-backed limiter so it holds across serverless instances. */
export async function checkLoginRateLimit(email: string) {
  const ipHash = hmac(await clientIp());
  const since = new Date(Date.now() - WINDOW_MS);
  const [[byEmail], [byIp]] = await Promise.all([
    db.select({ n: count() }).from(loginAttempts).where(and(eq(loginAttempts.email, email), eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since))),
    db.select({ n: count() }).from(loginAttempts).where(and(eq(loginAttempts.ipHash, ipHash), eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since))),
  ]);
  return { ipHash, limited: byEmail.n >= MAX_FAILS_PER_EMAIL || byIp.n >= MAX_FAILS_PER_IP };
}

export async function recordLoginAttempt(ipHash: string, email: string, success: boolean) {
  await db.insert(loginAttempts).values({ ipHash, email, success });
  if (Math.random() < 0.05) {
    await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
  }
}
