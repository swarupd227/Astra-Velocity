import { config } from "dotenv";
config({ path: "../.env" });
config({ path: ".env.local", override: true });

import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { PROMPT_TEMPLATES } from "../src/ai/prompts";

/**
 * Seeds the AI layer runtime config:
 *   - versioned prompt templates (library-qa v1, copilot-compose v1)
 *   - default aiSettings rows: routing.default → anthropic/claude-opus-4-8
 *     (the gateway falls back to mock automatically when no key is set),
 *     kill-switches present and OFF.
 *
 * Re-runs are safe: templates upsert by (key, version); settings are inserted
 * only when missing so admin edits are never clobbered.
 */

const DEFAULT_SETTINGS: { key: string; value: unknown }[] = [
  { key: "routing.default", value: { provider: "anthropic", model: "claude-opus-4-8" } },
  { key: "killswitch.all", value: false },
  { key: "killswitch.library-qa", value: false },
  { key: "killswitch.copilot-compose", value: false },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });

  let templatesInserted = 0;
  let templatesUpdated = 0;
  for (const t of PROMPT_TEMPLATES) {
    const existing = await db.query.promptTemplates.findFirst({
      where: and(
        eq(schema.promptTemplates.key, t.key),
        eq(schema.promptTemplates.version, t.version),
      ),
    });
    if (!existing) {
      await db.insert(schema.promptTemplates).values({
        key: t.key,
        version: t.version,
        description: t.description,
        template: t.template,
        active: true,
      });
      templatesInserted++;
    } else if (existing.template !== t.template || existing.description !== t.description) {
      await db
        .update(schema.promptTemplates)
        .set({ template: t.template, description: t.description })
        .where(eq(schema.promptTemplates.id, existing.id));
      templatesUpdated++;
    }
  }

  let settingsInserted = 0;
  for (const s of DEFAULT_SETTINGS) {
    const existing = await db.query.aiSettings.findFirst({
      where: eq(schema.aiSettings.key, s.key),
    });
    if (!existing) {
      await db.insert(schema.aiSettings).values({ key: s.key, value: s.value });
      settingsInserted++;
    }
  }

  await db.insert(schema.auditLog).values({
    actorType: "system",
    actorId: "seed-ai",
    action: "ai.seed",
    detail: { templatesInserted, templatesUpdated, settingsInserted },
  });

  console.log(
    `AI seed complete: ${templatesInserted} templates inserted, ${templatesUpdated} updated, ${settingsInserted} settings inserted (existing settings left untouched).`,
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
