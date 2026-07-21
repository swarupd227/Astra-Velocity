import { config } from "dotenv";
config({ path: "../.env" });
config({ path: ".env.local", override: true });

import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { contentBundle } from "../src/content/bundle";
import { checkBundleIntegrity } from "../src/content/integrity";
import type { ContentKind } from "../src/content/types";

/**
 * Seeds the authored content bundle into content_items as published v1.
 * Re-runs are cheap and safe: unchanged payloads (by checksum) are skipped,
 * changed payloads update in place (still v1 while seed-owned; authored edits
 * via Library Studio create new versions instead).
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const issues = checkBundleIntegrity(contentBundle);
  if (issues.length > 0) {
    console.error(`Content bundle failed integrity checks (${issues.length}):`);
    for (const issue of issues) console.error(`  - [${issue.where}] ${issue.problem}`);
    process.exit(1);
  }

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });

  const groups: [ContentKind, { key: string }[]][] = [
    ["sector", contentBundle.sectors],
    ["scenario", contentBundle.scenarios],
    ["obligation", contentBundle.obligations],
    ["kpi", contentBundle.kpis],
    ["pack", contentBundle.packs],
    ["element", contentBundle.elements],
    ["best-practice", contentBundle.bestPractices],
    ["dashboard", contentBundle.dashboards],
  ];

  let inserted = 0;
  let updated = 0;
  let unchanged = 0;

  for (const [kind, items] of groups) {
    for (const item of items) {
      const payload = JSON.stringify(item);
      const checksum = createHash("sha256").update(payload).digest("hex");

      const existing = await db.query.contentItems.findFirst({
        where: and(
          eq(schema.contentItems.kind, kind),
          eq(schema.contentItems.key, item.key),
          eq(schema.contentItems.version, 1),
        ),
      });

      if (!existing) {
        await db.insert(schema.contentItems).values({
          kind,
          key: item.key,
          version: 1,
          status: "published",
          payload: item,
          checksum,
          createdBy: "seed",
        });
        inserted++;
      } else if (existing.checksum !== checksum) {
        await db
          .update(schema.contentItems)
          .set({ payload: item, checksum, status: "published", updatedAt: new Date() })
          .where(eq(schema.contentItems.id, existing.id));
        updated++;
      } else {
        unchanged++;
      }
    }
  }

  await db.insert(schema.auditLog).values({
    actorType: "system",
    actorId: "seed-content",
    action: "content.seed",
    detail: { inserted, updated, unchanged },
  });

  console.log(`Content seed complete: ${inserted} inserted, ${updated} updated, ${unchanged} unchanged.`);
  const counts = groups.map(([kind, items]) => `${kind}: ${items.length}`).join(", ");
  console.log(`Bundle: ${counts}`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
