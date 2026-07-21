import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { CONTENT_KINDS } from "@/content/types";

export const contentKind = pgEnum("content_kind", CONTENT_KINDS);
export const contentStatus = pgEnum("content_status", ["draft", "published", "deprecated"]);

/**
 * Versioned library content — the platform's IP under governance.
 *
 * Every ontology entity and velocity-pack element is a row: (kind, key, version)
 * is unique; exactly one version per (kind, key) should be "published" at a time.
 * Payloads are validated against the Zod schemas in content/types.ts before
 * insert (seed pipeline and, later, the Library Studio review workflow).
 */
export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: contentKind("kind").notNull(),
    key: text("key").notNull(),
    version: integer("version").notNull().default(1),
    status: contentStatus("status").notNull().default("draft"),
    payload: jsonb("payload").notNull(),
    /** sha256 of canonical payload JSON — cheap change detection for re-seeds. */
    checksum: text("checksum").notNull(),
    createdBy: text("created_by").notNull().default("seed"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("content_kind_key_version_idx").on(t.kind, t.key, t.version),
    index("content_kind_status_idx").on(t.kind, t.status),
  ],
);
