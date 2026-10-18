import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { loadEnv } from "./env";

loadEnv();

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, { max: 1, prepare: false, ssl: process.env.DATABASE_SSL === "true" ? "require" : undefined });
  await migrate(drizzle(client), { migrationsFolder: "drizzle" });
  await client.end();
  console.log("✓ Database migrations applied");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
