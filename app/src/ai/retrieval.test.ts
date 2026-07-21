import { afterAll, describe, expect, it } from "vitest";
import { config } from "dotenv";

/**
 * Retrieval SQL smoke test — hits the real local database when DATABASE_URL is
 * available (repo-root .env), otherwise skips cleanly. Modules are imported
 * dynamically so env validation never runs in DB-less environments.
 */

config({ path: "../.env" });
config({ path: ".env.local", override: true });
process.env.AUTH_SECRET ??= "vitest-only-secret-not-real";

const hasDb = Boolean(process.env.DATABASE_URL);
// The db/client import chain is heavy under vitest's transform; give it room.
const SMOKE_TIMEOUT = 30_000;

describe.runIf(hasDb)("searchLibrary (SQL smoke)", () => {
  afterAll(async () => {
    // db/client caches the pool on globalThis outside production; close it so vitest exits.
    await (globalThis as { pgClient?: { end(): Promise<void> } }).pgClient?.end();
  });

  it(
    "returns ranked, typed snippets for a governance query",
    async () => {
      const { searchLibrary, RETRIEVAL_KINDS } = await import("./retrieval");
      const snippets = await searchLibrary("claims data quality obligations");

      expect(Array.isArray(snippets)).toBe(true);
      expect(snippets.length).toBeLessThanOrEqual(8);
      for (const s of snippets) {
        expect(RETRIEVAL_KINDS).toContain(s.kind);
        expect(s.key.length).toBeGreaterThan(0);
        expect(s.name.length).toBeGreaterThan(0);
      }
    },
    SMOKE_TIMEOUT,
  );

  it(
    "returns nothing for an empty query without touching SQL",
    async () => {
      const { searchLibrary } = await import("./retrieval");
      expect(await searchLibrary("   ")).toEqual([]);
    },
    SMOKE_TIMEOUT,
  );

  it(
    "formats snippets in the SNIPPET line contract the mock provider parses",
    async () => {
      const { formatSnippets } = await import("./retrieval");
      const text = formatSnippets([
        { kind: "element", key: "cde-library", name: 'CDE "Core" Library', text: "Line one.\nLine two." },
      ]);
      expect(text).toBe(
        "SNIPPET kind=element key=cde-library name=\"CDE 'Core' Library\"\nLine one. Line two.",
      );
    },
    SMOKE_TIMEOUT,
  );
});

describe.runIf(!hasDb)("searchLibrary", () => {
  it.skip("skipped — DATABASE_URL not set", () => {});
});
