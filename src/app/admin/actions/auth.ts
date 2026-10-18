"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";
import { failure, handleActionError, success, type ActionState } from "@/lib/admin/forms";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { checkLoginRateLimit, recordLoginAttempt } from "@/lib/auth/rate-limit";
import { assertAdmin, createSession, destroyOtherSessions, destroySession } from "@/lib/auth/session";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return failure("Enter your email and password.");
  const { email, password } = parsed.data;

  const { ipHash, limited } = await checkLoginRateLimit(email);
  if (limited) return failure("Too many failed attempts. Please wait 15 minutes and try again.");

  const [admin] = await db.select().from(admins).where(eq(sql`lower(${admins.email})`, email)).limit(1);
  const valid = await verifyPassword(password, admin?.passwordHash);
  await recordLoginAttempt(ipHash, email, valid);
  if (!admin || !valid) return failure("Incorrect email or password.");

  await db.update(admins).set({ lastLoginAt: new Date() }).where(eq(admins.id, admin.id));
  await createSession(admin.id);

  const next = formData.get("next");
  redirect(typeof next === "string" && /^\/admin(\/[\w\-/]*)?$/.test(next) ? next : "/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const me = await assertAdmin();
    const current = String(formData.get("current") ?? "");
    const next = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    const [row] = await db.select({ hash: admins.passwordHash }).from(admins).where(eq(admins.id, me.id));
    if (!(await verifyPassword(current, row?.hash))) return failure("Your current password is incorrect.", { current: "Incorrect password" });
    const problem = passwordProblem(next);
    if (problem) return failure(problem, { password: problem });
    if (next !== confirm) return failure("Passwords don't match.", { confirm: "Doesn't match" });
    await db.update(admins).set({ passwordHash: await hashPassword(next) }).where(eq(admins.id, me.id));
    await destroyOtherSessions(me.id);
    return success("Password updated. Other devices have been signed out.");
  } catch (err) {
    return handleActionError(err);
  }
}

export async function signOutOtherDevices(): Promise<ActionState> {
  try {
    const me = await assertAdmin();
    await destroyOtherSessions(me.id);
    return success("Signed out of all other devices.");
  } catch (err) {
    return handleActionError(err);
  }
}

const newAdminSchema = z.object({
  name: z.string().trim().min(1, "Required").max(60),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  password: z.string(),
  role: z.enum(["owner", "admin"]),
});

export async function createAdmin(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await assertAdmin("owner");
    const parsed = newAdminSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return failure("Please fix the highlighted fields.", Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])));
    const problem = passwordProblem(parsed.data.password);
    if (problem) return failure(problem, { password: problem });
    const [exists] = await db.select({ id: admins.id }).from(admins).where(eq(sql`lower(${admins.email})`, parsed.data.email));
    if (exists) return failure("An admin with that email already exists.", { email: "Already exists" });
    await db.insert(admins).values({ ...parsed.data, passwordHash: await hashPassword(parsed.data.password) });
    return success(`Added ${parsed.data.email}.`);
  } catch (err) {
    return handleActionError(err);
  }
}

export async function removeAdmin(id: string): Promise<ActionState> {
  try {
    const me = await assertAdmin("owner");
    if (id === me.id) return failure("You can't remove your own account.");
    const owners = await db.select({ id: admins.id }).from(admins).where(and(eq(admins.role, "owner"), ne(admins.id, id)));
    if (owners.length === 0) return failure("There must always be at least one owner.");
    await db.delete(sessions).where(eq(sessions.adminId, id));
    await db.delete(admins).where(eq(admins.id, id));
    return success("Admin removed.");
  } catch (err) {
    return handleActionError(err);
  }
}
