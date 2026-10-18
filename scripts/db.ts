import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { loadEnv } from "./env";

/** Standalone DB client for CLI scripts (the app's client is guarded by `server-only`). */
export function scriptDb() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local first.");
  const client = postgres(url, { max: 1, prepare: false, ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined });
  return { db: drizzle(client, { schema }), close: () => client.end(), schema };
}
