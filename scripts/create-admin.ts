/**
 * Create (or reset the password of) an administrator account.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name" [--role owner|admin]
 *
 * The password is read from a hidden prompt, or from ADMIN_PASSWORD when not interactive.
 */
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import { scriptDb } from "./db";

function prompt(question: string, hidden = false): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, encoding, cb) {
      if (!muted) process.stdout.write(chunk, encoding);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
    muted = hidden;
  });
}

function passwordProblem(password: string) {
  if (password.length < 10) return "Password must be at least 10 characters.";
  if (password.length > 128) return "Password must be at most 128 characters.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9\W_]/.test(password)) return "Use a mix of letters and numbers or symbols.";
  return null;
}

async function main() {
  const { values } = parseArgs({
    options: { email: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "owner" } },
  });
  const email = (values.email ?? (await prompt("Email: "))).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please provide a valid email address.");
  const name = values.name ?? ((await prompt("Display name: ")) || email.split("@")[0]);
  const role = values.role === "admin" ? "admin" : "owner";

  let password = process.env.ADMIN_PASSWORD ?? "";
  if (!password) {
    if (!process.stdin.isTTY) throw new Error("Set ADMIN_PASSWORD when running non-interactively.");
    password = await prompt("Password (hidden): ", true);
    const confirm = await prompt("Confirm password: ", true);
    if (password !== confirm) throw new Error("Passwords don't match.");
  }
  const problem = passwordProblem(password);
  if (problem) throw new Error(problem);

  const { db, close, schema } = scriptDb();
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [existing] = await db.select().from(schema.admins).where(eq(sql`lower(${schema.admins.email})`, email)).limit(1);
    if (existing) {
      await db.update(schema.admins).set({ passwordHash, name, role }).where(eq(schema.admins.id, existing.id));
      await db.delete(schema.sessions).where(eq(schema.sessions.adminId, existing.id));
      console.log(`✓ Updated ${email} (${role}) and signed out their existing sessions.`);
    } else {
      await db.insert(schema.admins).values({ email, name, passwordHash, role });
      console.log(`✓ Created ${role} account for ${email}. Sign in at /admin/login`);
    }
  } finally {
    await close();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
