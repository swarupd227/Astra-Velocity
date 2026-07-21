import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pgClient?: ReturnType<typeof postgres> };

// Reuse the connection across Next.js hot reloads in dev.
const client =
  globalForDb.pgClient ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 5,
    onnotice: () => {},
  });

if (env.NODE_ENV !== "production") globalForDb.pgClient = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
