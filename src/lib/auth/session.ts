import "server-only";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";
import { randomToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "cn_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const RENEW_AFTER_MS = 1000 * 60 * 60 * 24; // slide the expiry at most once a day

export type CurrentAdmin = { id: string; email: string; name: string; role: "owner" | "admin" };

export async function createSession(adminId: string) {
  const token = randomToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const userAgent = (await headers()).get("user-agent")?.slice(0, 300) ?? null;
  await db.insert(sessions).values({ id: sha256(token), adminId, expiresAt, userAgent });
  // Opportunistically clean up expired sessions.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await setSessionCookie(token, expiresAt);
}

async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    priority: "high",
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  store.delete(SESSION_COOKIE);
}

export async function destroyOtherSessions(adminId: string) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db
    .delete(sessions)
    .where(token ? and(eq(sessions.adminId, adminId), ne(sessions.id, sha256(token))) : eq(sessions.adminId, adminId));
}

/** Validates the session cookie against the database. Deduplicated per request. */
export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  // Session checks compare against the current time, so they must always run per request.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const [row] = await db
    .select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      role: admins.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(admins, eq(admins.id, sessions.adminId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;

  if (row.expiresAt.getTime() - Date.now() < SESSION_TTL_MS - RENEW_AFTER_MS) {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
    // Cookies can only be written from Server Actions / Route Handlers; ignore during render.
    try {
      await setSessionCookie(token, expiresAt);
    } catch {}
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
});

/** For pages and layouts: redirect to the login page when not signed in. */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in as an administrator.");
  }
}

/** For Server Actions and Route Handlers: throw instead of redirecting. */
export async function assertAdmin(role?: "owner"): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new UnauthorizedError();
  if (role === "owner" && admin.role !== "owner") throw new Error("Only the site owner can do that.");
  return admin;
}
