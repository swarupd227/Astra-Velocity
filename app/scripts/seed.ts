import { config } from "dotenv";
config({ path: "../.env" });
config({ path: ".env.local", override: true });

import { hash } from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { ROLES, type Role } from "../src/lib/roles";

/**
 * Idempotent seed: demo users (one per role) + a demo workspace.
 * Phase 1 extends this with the ontology + velocity pack content.
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });

  const password = process.env.SEED_PASSWORD ?? "AstraDemo!2026";
  const passwordHash = await hash(password, 12);

  const [workspace] = await db
    .insert(schema.workspaces)
    .values({ slug: "demo", name: "Demo Workspace", kind: "demo" })
    .onConflictDoUpdate({
      target: schema.workspaces.slug,
      set: { name: "Demo Workspace", kind: "demo" },
    })
    .returning();

  const demoUsers: { email: string; name: string; role: Role }[] = ROLES.map((role) => ({
    email: `${role.replace("_", ".")}@astra.demo`,
    name: role
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
    role,
  }));

  for (const u of demoUsers) {
    const [user] = await db
      .insert(schema.users)
      .values({ ...u, passwordHash })
      .onConflictDoUpdate({ target: schema.users.email, set: { role: u.role, name: u.name } })
      .returning();

    await db
      .insert(schema.workspaceMembers)
      .values({ workspaceId: workspace.id, userId: user.id })
      .onConflictDoNothing();
  }

  await db.insert(schema.auditLog).values({
    actorType: "system",
    actorId: "seed",
    action: "seed.run",
    detail: { users: demoUsers.length, workspace: workspace.slug },
  });

  console.log(`Seeded ${demoUsers.length} demo users (password: ${password}) in workspace "demo":`);
  for (const u of demoUsers) console.log(`  - ${u.email} (${u.role})`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
