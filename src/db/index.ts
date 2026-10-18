import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local and configure it.");
  }
  return postgres(url, {
    // Serverless-friendly: few connections per instance, and no prepared statements so
    // transaction-mode poolers (Neon, Supabase, PgBouncer) work out of the box.
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    prepare: false,
    idle_timeout: 20,
    ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined,
  });
}

const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

function getClient() {
  // Reuse the client across hot reloads in development and across invocations in a warm lambda.
  globalForDb.pgClient ??= createClient();
  return globalForDb.pgClient;
}

type Db = ReturnType<typeof drizzle<typeof schema>>;
let instance: Db | undefined;

// Lazily connect so importing this module never throws during build steps that don't touch the DB.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    instance ??= drizzle(getClient(), { schema });
    return Reflect.get(instance, prop, instance);
  },
});

export { schema };
