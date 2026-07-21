import { afterAll, describe, expect, it } from "vitest";
import { config } from "dotenv";

/**
 * Secrets round-trip against the real local database when DATABASE_URL is
 * available (repo-root .env), otherwise skips cleanly. Dynamic imports keep
 * env validation out of DB-less environments (same pattern as retrieval test).
 */

config({ path: "../.env" });
config({ path: ".env.local", override: true });
process.env.AUTH_SECRET ??= "vitest-only-secret-not-real";

const hasDb = Boolean(process.env.DATABASE_URL);
const SETTING_KEY = "secret.anthropic-api-key";
const TIMEOUT = 30_000;

describe.runIf(hasDb)("ai secrets", () => {
  afterAll(async () => {
    const { db } = await import("@/db/client");
    const { aiSettings } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");
    await db.delete(aiSettings).where(eq(aiSettings.key, SETTING_KEY));
    await (globalThis as { pgClient?: { end(): Promise<void> } }).pgClient?.end();
  });

  it(
    "round-trips an admin-set key encrypted at rest",
    async () => {
      const { setAnthropicApiKey, getAnthropicApiKey, anthropicKeyStatus } = await import(
        "./secrets"
      );
      const { db } = await import("@/db/client");
      const { aiSettings } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      // updated_by is a uuid FK to users — use a real seeded user.
      const { users } = await import("@/db/schema");
      const anyUser = await db.select({ id: users.id }).from(users).limit(1);
      expect(anyUser.length).toBe(1);

      const fake = "sk-ant-test-000000000000000000000000abcd";
      await setAnthropicApiKey(fake, anyUser[0].id);

      // Stored value must not contain the plaintext.
      const row = await db.query.aiSettings.findFirst({
        where: eq(aiSettings.key, SETTING_KEY),
      });
      expect(JSON.stringify(row?.value)).not.toContain("sk-ant-test");

      // But the gateway-facing getter decrypts it.
      expect(await getAnthropicApiKey()).toBe(fake);

      const status = await anthropicKeyStatus();
      expect(status.source).toBe("admin");
      expect(status.last4).toBe("abcd");
    },
    TIMEOUT,
  );

  it(
    "remove falls back to the environment (or none)",
    async () => {
      const { removeAnthropicApiKey, anthropicKeyStatus } = await import("./secrets");
      await removeAnthropicApiKey();
      const status = await anthropicKeyStatus();
      expect(status.source === "env" || status.source === "none").toBe(true);
    },
    TIMEOUT,
  );
});
