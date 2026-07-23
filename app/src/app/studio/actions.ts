"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLog, contentItems } from "@/db/schema";
import {
  CONTENT_KINDS,
  PLATFORM_KEYS,
  SCENARIO_KEYS,
  SECTOR_KEYS,
  type ContentKind,
} from "@/content/types";
import { requirePermission } from "@/lib/require-permission";
import { blankPayloadForKind, KIND_SCHEMAS } from "./kind-schemas";
import { findPublishedReferences } from "./references";

/** Kinds whose key is a fixed enum, not a freeform kebab-case identifier. */
const ENUM_KEYED_KINDS: Partial<Record<ContentKind, readonly string[]>> = {
  sector: SECTOR_KEYS,
  scenario: SCENARIO_KEYS,
  platform: PLATFORM_KEYS,
};

const FreeKeySchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "keys are stable kebab-case identifiers");

/**
 * Library Studio content lifecycle. The governed-content contract:
 *   - published rows are immutable — edits happen on a new draft version
 *   - drafts are validated against the kind's Zod schema before saving
 *   - publish deprecates the previously-published version in one transaction
 *   - every mutation appends an audit_log row
 * Guards: library.author for draft/edit/discard, library.publish for publish.
 */

const IdSchema = z.string().uuid();

function checksumOf(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/**
 * Copy an item's payload into a NEW row (same kind/key, version+1, status
 * draft). Audited as "content.draft". If a draft already exists for the
 * kind/key, navigates to it instead of creating a duplicate.
 */
export async function createDraftAction(formData: FormData): Promise<void> {
  const user = await requirePermission("library.author");
  const id = IdSchema.parse(formData.get("id"));

  const source = await db.query.contentItems.findFirst({ where: eq(contentItems.id, id) });
  if (!source) redirect("/studio?error=not-found");

  const existingDraft = await db.query.contentItems.findFirst({
    where: and(
      eq(contentItems.kind, source.kind),
      eq(contentItems.key, source.key),
      eq(contentItems.status, "draft"),
    ),
  });
  if (existingDraft) redirect(`/studio/${existingDraft.id}`);

  const [{ maxVersion }] = await db
    .select({ maxVersion: max(contentItems.version) })
    .from(contentItems)
    .where(and(eq(contentItems.kind, source.kind), eq(contentItems.key, source.key)));

  const [created] = await db
    .insert(contentItems)
    .values({
      kind: source.kind,
      key: source.key,
      version: (maxVersion ?? source.version) + 1,
      status: "draft",
      payload: source.payload,
      checksum: source.checksum,
      createdBy: user.id,
    })
    .returning({ id: contentItems.id, version: contentItems.version });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "content.draft",
    entityType: "content_item",
    entityId: created.id,
    detail: {
      kind: source.kind,
      key: source.key,
      fromVersion: source.version,
      version: created.version,
    },
  });

  revalidatePath("/studio");
  redirect(`/studio/${created.id}`);
}

export interface SaveDraftState {
  ok: boolean;
  errors?: string[];
  savedAt?: string;
}

/**
 * Save a draft's payload after validating it against the Zod schema for its
 * kind. Returns validation issues for inline display. Audited as "content.edit".
 */
export async function saveDraftAction(
  _prev: SaveDraftState,
  formData: FormData,
): Promise<SaveDraftState> {
  const user = await requirePermission("library.author");

  const idParse = IdSchema.safeParse(formData.get("id"));
  if (!idParse.success) return { ok: false, errors: ["Invalid item reference."] };

  const row = await db.query.contentItems.findFirst({
    where: eq(contentItems.id, idParse.data),
  });
  if (!row) return { ok: false, errors: ["This item no longer exists."] };
  if (row.status !== "draft") {
    return { ok: false, errors: ["Only draft versions can be edited — create a draft revision first."] };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("payload") ?? ""));
  } catch (err) {
    return { ok: false, errors: [`Not valid JSON: ${err instanceof Error ? err.message : String(err)}`] };
  }

  const schema = KIND_SCHEMAS[row.kind];
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues
        .slice(0, 20)
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
    };
  }

  const payload = parsed.data as { key?: string };
  if (payload.key !== row.key) {
    return {
      ok: false,
      errors: [
        `payload.key ("${String(payload.key)}") must equal the item key ("${row.key}") — published keys are stable identifiers.`,
      ],
    };
  }

  const checksum = checksumOf(payload);
  await db
    .update(contentItems)
    .set({ payload, checksum, updatedAt: new Date() })
    .where(eq(contentItems.id, row.id));

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "content.edit",
    entityType: "content_item",
    entityId: row.id,
    detail: { kind: row.kind, key: row.key, version: row.version, checksum },
  });

  revalidatePath("/studio");
  revalidatePath(`/studio/${row.id}`);
  return { ok: true, savedAt: new Date().toISOString() };
}

/**
 * Publish a draft: mark it published and deprecate the previously-published
 * version of the same kind/key, in one transaction. Audited as "content.publish".
 */
export async function publishDraftAction(formData: FormData): Promise<void> {
  const user = await requirePermission("library.publish");
  const id = IdSchema.parse(formData.get("id"));

  const row = await db.query.contentItems.findFirst({ where: eq(contentItems.id, id) });
  if (!row) redirect("/studio?error=not-found");
  if (row.status !== "draft") redirect(`/studio/${row.id}?error=not-a-draft`);

  // A payload that fails its schema must never become the published version.
  const parsed = KIND_SCHEMAS[row.kind].safeParse(row.payload);
  if (!parsed.success) redirect(`/studio/${row.id}?error=invalid-payload`);

  await db.transaction(async (tx) => {
    const superseded = await tx
      .update(contentItems)
      .set({ status: "deprecated", updatedAt: new Date() })
      .where(
        and(
          eq(contentItems.kind, row.kind),
          eq(contentItems.key, row.key),
          eq(contentItems.status, "published"),
        ),
      )
      .returning({ id: contentItems.id, version: contentItems.version });

    await tx
      .update(contentItems)
      .set({ status: "published", updatedAt: new Date() })
      .where(eq(contentItems.id, row.id));

    await tx.insert(auditLog).values({
      actorType: "human",
      actorId: user.id,
      action: "content.publish",
      entityType: "content_item",
      entityId: row.id,
      detail: {
        kind: row.kind,
        key: row.key,
        version: row.version,
        supersededVersions: superseded.map((s) => s.version),
      },
    });
  });

  revalidatePath("/studio");
  revalidatePath(`/studio/${row.id}`);
}

/** Delete a draft revision without publishing it. Audited as "content.discard". */
export async function discardDraftAction(formData: FormData): Promise<void> {
  const user = await requirePermission("library.author");
  const id = IdSchema.parse(formData.get("id"));

  const row = await db.query.contentItems.findFirst({ where: eq(contentItems.id, id) });
  if (!row) redirect("/studio?error=not-found");
  if (row.status !== "draft") redirect(`/studio/${row.id}?error=not-a-draft`);

  await db.delete(contentItems).where(eq(contentItems.id, row.id));

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "content.discard",
    entityType: "content_item",
    entityId: row.id,
    detail: { kind: row.kind, key: row.key, version: row.version },
  });

  revalidatePath("/studio");
  redirect("/studio");
}

export interface CreateBlankDraftState {
  ok: boolean;
  error?: string;
}

/**
 * Create a genuinely new content item: version 1, status draft, kind/key
 * chosen by the author (validated — kebab-case for freeform kinds, one of
 * the fixed enum values for sector/scenario/platform — and checked for
 * collision against every existing version of that kind/key). The payload
 * starts as a minimal-but-schema-valid skeleton (see blankPayloadForKind)
 * rather than `{}`, since validation only surfaces on save, not live.
 * Audited as "content.create".
 */
export async function createBlankDraftAction(
  _prev: CreateBlankDraftState,
  formData: FormData,
): Promise<CreateBlankDraftState> {
  const user = await requirePermission("library.author");

  const kindParse = z.enum(CONTENT_KINDS).safeParse(formData.get("kind"));
  if (!kindParse.success) return { ok: false, error: "Choose a content kind." };
  const kind = kindParse.data;

  const rawKey = String(formData.get("key") ?? "").trim();
  const enumKeys = ENUM_KEYED_KINDS[kind];
  let key: string;
  if (enumKeys) {
    if (!enumKeys.includes(rawKey)) {
      return { ok: false, error: `Choose one of the available ${kind} keys.` };
    }
    key = rawKey;
  } else {
    const keyParse = FreeKeySchema.safeParse(rawKey);
    if (!keyParse.success) {
      return { ok: false, error: keyParse.error.issues.map((i) => i.message).join("; ") };
    }
    key = keyParse.data;
  }

  const existing = await db.query.contentItems.findFirst({
    where: and(eq(contentItems.kind, kind), eq(contentItems.key, key)),
  });
  if (existing) {
    return { ok: false, error: `${kind}/${key} already exists — choose a different key.` };
  }

  const payload = blankPayloadForKind(kind, key);
  const checksum = checksumOf(payload);

  const [created] = await db
    .insert(contentItems)
    .values({ kind, key, version: 1, status: "draft", payload, checksum, createdBy: user.id })
    .returning({ id: contentItems.id });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "content.create",
    entityType: "content_item",
    entityId: created.id,
    detail: { kind, key, version: 1 },
  });

  revalidatePath("/studio");
  redirect(`/studio/${created.id}`);
}

export interface HardDeleteContentState {
  ok: boolean;
  error?: string;
}

/**
 * Permanently delete a content item version. Only allowed for draft or
 * deprecated status — a published version must be superseded (publish a
 * replacement) or deprecated first. If this is the LAST remaining row for
 * its kind/key (deleting it would erase the key from the library entirely)
 * and other published content still references that key, the delete is
 * blocked with a clear message. The audit snapshot (full payload) is
 * written in the same transaction as the delete. Audited as "content.delete".
 */
export async function hardDeleteContentAction(formData: FormData): Promise<void> {
  const user = await requirePermission("library.publish");
  const id = IdSchema.parse(formData.get("id"));

  const row = await db.query.contentItems.findFirst({ where: eq(contentItems.id, id) });
  if (!row) redirect("/studio?error=not-found");
  if (row.status === "published") {
    redirect(`/studio/${row.id}?error=cannot-delete-published`);
  }

  const [{ n: siblingCount }] = await db
    .select({ n: count() })
    .from(contentItems)
    .where(and(eq(contentItems.kind, row.kind), eq(contentItems.key, row.key)));

  if (siblingCount === 1) {
    const references = await findPublishedReferences(row.kind, row.key);
    if (references.length > 0) {
      redirect(`/studio/${row.id}?error=still-referenced`);
    }
  }

  await db.transaction(async (tx) => {
    await tx.insert(auditLog).values({
      actorType: "human",
      actorId: user.id,
      action: "content.delete",
      entityType: "content_item",
      entityId: row.id,
      detail: {
        kind: row.kind,
        key: row.key,
        version: row.version,
        status: row.status,
        payload: row.payload,
        checksum: row.checksum,
      },
    });
    await tx.delete(contentItems).where(eq(contentItems.id, row.id));
  });

  revalidatePath("/studio");
  redirect("/studio");
}
