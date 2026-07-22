"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { aiSettings, auditLog, workspaces } from "@/db/schema";
import { SECTOR_KEYS, type SectorKey } from "@/content/types";
import { requirePermission } from "@/lib/require-permission";
import { scopeSettingKey } from "@/lib/workspace-scope";

/**
 * Platform administration actions. Workspace sector scope lives in the
 * ai_settings key-value store under `workspace-scope.<slug>` (string[] of
 * sector keys; empty/absent = all sectors). Every write is audited.
 */

const SlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "invalid workspace slug");

/** Save a workspace's sector scope. Audited as "admin.workspace.scope". */
export async function saveWorkspaceScopeAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const slug = SlugSchema.parse(formData.get("slug"));

  const [workspace] = await db
    .select({ id: workspaces.id, slug: workspaces.slug })
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1);
  if (!workspace) throw new Error(`Unknown workspace: ${slug}`);

  const selected = formData
    .getAll("sectors")
    .map(String)
    .filter((s): s is SectorKey => SECTOR_KEYS.includes(s as SectorKey));

  // Full selection is the same as no restriction — store [] so absence and
  // "everything" read identically downstream.
  const value: SectorKey[] = selected.length >= SECTOR_KEYS.length ? [] : selected;

  const key = scopeSettingKey(workspace.slug);
  await db
    .insert(aiSettings)
    .values({ key, value, updatedBy: admin.id, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: aiSettings.key,
      set: { value, updatedBy: admin.id, updatedAt: new Date() },
    });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.scope",
    entityType: "workspace",
    entityId: workspace.slug,
    workspaceId: workspace.id,
    detail: { sectors: value.length === 0 ? "all" : value },
  });

  revalidatePath("/admin");
}
