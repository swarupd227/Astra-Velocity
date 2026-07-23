import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { contentItems } from "@/db/schema";
import type { ContentKind } from "@/content/types";

export interface ContentReference {
  kind: ContentKind;
  key: string;
}

/**
 * Heuristic cross-reference scan: published content items (of any other
 * kind/key) whose payload JSON contains this key as a quoted string —
 * catches both array membership (e.g. `obligationKeys: ["x"]`) and
 * partialRecord keys (e.g. `sectorAffinity: {"x": 2}`). Not a full graph
 * walk of the integrity-checker's cross-reference rules — a text scan is
 * enough to warn clearly before an irreversible delete without building a
 * bespoke join per content kind.
 */
export async function findPublishedReferences(
  kind: ContentKind,
  key: string,
): Promise<ContentReference[]> {
  const pattern = `%"${key}"%`;
  const rows = await db
    .select({ kind: contentItems.kind, key: contentItems.key })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.status, "published"),
        sql`NOT (${contentItems.kind} = ${kind} AND ${contentItems.key} = ${key})`,
        sql`${contentItems.payload}::text ILIKE ${pattern}`,
      ),
    )
    .limit(25);
  return rows;
}
