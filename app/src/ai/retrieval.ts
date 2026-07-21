import { sql } from "drizzle-orm";
import { db } from "@/db/client";

/**
 * Grounding for Library Q&A: Postgres full-text search over published
 * content_items. At library scale (a few hundred rows) an on-the-fly
 * to_tsvector over the JSON payload is fast enough — no index required.
 * Every answer the copilot gives must trace back to one of these snippets.
 */

export const RETRIEVAL_KINDS = [
  "element",
  "best-practice",
  "obligation",
  "sector",
  "scenario",
  "pack",
] as const;
export type RetrievalKind = (typeof RETRIEVAL_KINDS)[number];

export interface LibrarySnippet {
  kind: RetrievalKind;
  key: string;
  name: string;
  text: string;
}

const TOP_K = 8;

/** Best human-readable title a payload offers, by kind-agnostic field order. */
function pickName(payload: Record<string, unknown>): string {
  for (const field of ["name", "title"]) {
    const v = payload[field];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return String(payload.key ?? "untitled");
}

/** Condense the payload's prose fields into one grounded snippet line. */
function pickText(payload: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const field of [
    "pitch",
    "tagline",
    "statement",
    "summary",
    "description",
    "narrative",
    "whatGoodLooksLike",
    "stakes",
    "soWhat",
    "evidence",
  ]) {
    const v = payload[field];
    if (typeof v === "string" && v.length > 0) parts.push(v);
  }
  const joined = parts.join(" ");
  return joined.length > 600 ? `${joined.slice(0, 597)}…` : joined;
}

/**
 * Natural-language questions must not require every word to match
 * (plainto_tsquery ANDs terms, so "what does good lineage look like for
 * Schedule P?" matched nothing). OR the meaningful lexemes instead and let
 * ts_rank sort — recall first, ranking second.
 */
function toOrTsQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .slice(0, 12)
    .join(" | ");
}

export async function searchLibrary(query: string): Promise<LibrarySnippet[]> {
  const q = toOrTsQuery(query.trim());
  if (!q) return [];

  const rows = await db.execute(sql`
    select kind, key, payload
    from content_items
    where status = 'published'
      and kind in ('element', 'best-practice', 'obligation', 'sector', 'scenario', 'pack')
      and to_tsvector('english', payload::text) @@ to_tsquery('english', ${q})
    order by ts_rank(to_tsvector('english', payload::text), to_tsquery('english', ${q})) desc
    limit ${TOP_K}
  `);

  const snippets: LibrarySnippet[] = [];
  for (const row of rows as unknown as {
    kind: string;
    key: string;
    payload: Record<string, unknown>;
  }[]) {
    if (!(RETRIEVAL_KINDS as readonly string[]).includes(row.kind)) continue;
    snippets.push({
      kind: row.kind as RetrievalKind,
      key: row.key,
      name: pickName(row.payload),
      text: pickText(row.payload),
    });
  }
  return snippets;
}

/** Serialize snippets in the SNIPPET line format the gateway prompts (and mock provider) understand. */
export function formatSnippets(snippets: LibrarySnippet[]): string {
  return snippets
    .map(
      (s) =>
        `SNIPPET kind=${s.kind} key=${s.key} name="${s.name.replace(/"/g, "'")}"\n${s.text.replace(/\s+/g, " ")}`,
    )
    .join("\n\n");
}
