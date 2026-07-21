import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Canonical env lives at the repo root (shared with docker-compose); app/.env.local
// overrides for Next.js runtime. Load root first, then local.
config({ path: "../.env" });
config({ path: ".env.local", override: true });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set (checked ../.env and .env.local)");
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
  strict: true,
  verbose: true,
});
