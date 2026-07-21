"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLog, contentItems } from "@/db/schema";
import { requirePermission } from "@/lib/require-permission";
import { KIND_SCHEMAS } from "./kind-schemas";

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
