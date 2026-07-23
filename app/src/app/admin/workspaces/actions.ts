"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import {
  agentSuggestions,
  aiCalls,
  auditLog,
  projects,
  users,
  workspaceMembers,
  workspaceStatus as workspaceStatusEnum,
  workspaces,
  workspaceKind as workspaceKindEnum,
} from "@/db/schema";
import { isForeignKeyViolation } from "@/lib/db-errors";
import { requirePermission } from "@/lib/require-permission";

/**
 * Workspace administration actions — create, rename, archive/activate,
 * membership, and hard delete. Every action re-checks "admin.platform"
 * server-side and appends an audit_log row. Hard delete snapshots the row
 * and its dependent counts, writes the audit entry BEFORE deleting (in the
 * same transaction, so a failed delete never leaves a false audit record),
 * and turns a foreign-key violation (e.g. retained AI call history) into a
 * clear message instead of a raw DB error.
 */

const SlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slugs are lowercase kebab-case (letters, digits, hyphens)");
const NameSchema = z.string().trim().min(2, "Name is required (2+ characters)").max(160);
const KindSchema = z.enum(workspaceKindEnum.enumValues);
const StatusSchema = z.enum(workspaceStatusEnum.enumValues);
const IdSchema = z.string().uuid();
const EmailSchema = z.string().trim().toLowerCase().email();

export interface CreateWorkspaceState {
  ok: boolean;
  error?: string;
}

/** Create a workspace. Audited as "admin.workspace.create". */
export async function createWorkspaceAction(
  _prev: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const admin = await requirePermission("admin.platform");

  const parsed = z
    .object({ name: NameSchema, slug: SlugSchema, kind: KindSchema })
    .safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
      kind: formData.get("kind"),
    });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const { name, slug, kind } = parsed.data;

  const existing = await db.query.workspaces.findFirst({ where: eq(workspaces.slug, slug) });
  if (existing) {
    return { ok: false, error: `A workspace with slug "${slug}" already exists.` };
  }

  const [created] = await db
    .insert(workspaces)
    .values({ name, slug, kind })
    .returning({ id: workspaces.id });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.create",
    entityType: "workspace",
    entityId: created.id,
    workspaceId: created.id,
    detail: { name, slug, kind },
  });

  revalidatePath("/admin/workspaces");
  redirect(`/admin/workspaces/${created.id}`);
}

/** Rename a workspace and/or change its kind. Audited as "admin.workspace.update". */
export async function updateWorkspaceAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const id = IdSchema.parse(formData.get("id"));
  const name = NameSchema.parse(formData.get("name"));
  const kind = KindSchema.parse(formData.get("kind"));

  const target = await db.query.workspaces.findFirst({ where: eq(workspaces.id, id) });
  if (!target) redirect("/admin/workspaces?error=not-found");

  if (target.name === name && target.kind === kind) {
    return; // no-op — nothing to change, nothing to audit
  }

  await db.update(workspaces).set({ name, kind, updatedAt: new Date() }).where(eq(workspaces.id, id));
  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.update",
    entityType: "workspace",
    entityId: id,
    workspaceId: id,
    detail: { from: { name: target.name, kind: target.kind }, to: { name, kind } },
  });

  revalidatePath("/admin/workspaces");
  revalidatePath(`/admin/workspaces/${id}`);
}

/** Toggle a workspace between active and archived. Audited as "admin.workspace.archive". */
export async function setWorkspaceStatusAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const id = IdSchema.parse(formData.get("id"));
  const status = StatusSchema.parse(formData.get("status"));

  const target = await db.query.workspaces.findFirst({ where: eq(workspaces.id, id) });
  if (!target) redirect("/admin/workspaces?error=not-found");
  if (target.status === status) return;

  await db.update(workspaces).set({ status, updatedAt: new Date() }).where(eq(workspaces.id, id));
  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.archive",
    entityType: "workspace",
    entityId: id,
    workspaceId: id,
    detail: { from: target.status, to: status },
  });

  revalidatePath("/admin/workspaces");
  revalidatePath(`/admin/workspaces/${id}`);
}

/** Add a member by email. The user must already have an account. Audited as "admin.workspace.member.add". */
export async function addWorkspaceMemberAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const workspaceId = IdSchema.parse(formData.get("workspaceId"));
  const emailParse = EmailSchema.safeParse(formData.get("email"));
  if (!emailParse.success) redirect(`/admin/workspaces/${workspaceId}?error=invalid-email`);
  const email = emailParse.data;

  const workspace = await db.query.workspaces.findFirst({ where: eq(workspaces.id, workspaceId) });
  if (!workspace) redirect("/admin/workspaces?error=not-found");

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) redirect(`/admin/workspaces/${workspaceId}?error=no-such-user`);

  const existing = await db.query.workspaceMembers.findFirst({
    where: and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, user.id)),
  });
  if (existing) {
    revalidatePath(`/admin/workspaces/${workspaceId}`);
    return; // already a member — no-op
  }

  await db.insert(workspaceMembers).values({ workspaceId, userId: user.id });
  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.member.add",
    entityType: "workspace",
    entityId: workspaceId,
    workspaceId,
    detail: { email: user.email, userId: user.id },
  });

  revalidatePath(`/admin/workspaces/${workspaceId}`);
}

/** Remove a member. Audited as "admin.workspace.member.remove". */
export async function removeWorkspaceMemberAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const workspaceId = IdSchema.parse(formData.get("workspaceId"));
  const userId = IdSchema.parse(formData.get("userId"));

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  await db
    .delete(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.workspace.member.remove",
    entityType: "workspace",
    entityId: workspaceId,
    workspaceId,
    detail: { email: user?.email ?? null, userId },
  });

  revalidatePath(`/admin/workspaces/${workspaceId}`);
}

/**
 * Permanently delete a workspace. workspace_members and agent_suggestions
 * cascade at the DB level; projects.workspace_id also cascades (deleting a
 * workspace deletes ALL its projects). ai_calls.workspace_id does NOT
 * cascade — a workspace with AI call history is retained and the delete
 * will fail with a foreign-key violation, which we turn into a clear
 * message rather than a raw DB error.
 */
export async function deleteWorkspaceAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.platform");
  const id = IdSchema.parse(formData.get("id"));

  const target = await db.query.workspaces.findFirst({ where: eq(workspaces.id, id) });
  if (!target) redirect("/admin/workspaces?error=not-found");

  const [[memberCount], [projectCount], [aiCallCount], [suggestionCount]] = await Promise.all([
    db.select({ n: count() }).from(workspaceMembers).where(eq(workspaceMembers.workspaceId, id)),
    db.select({ n: count() }).from(projects).where(eq(projects.workspaceId, id)),
    db.select({ n: count() }).from(aiCalls).where(eq(aiCalls.workspaceId, id)),
    db.select({ n: count() }).from(agentSuggestions).where(eq(agentSuggestions.workspaceId, id)),
  ]);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(auditLog).values({
        actorType: "human",
        actorId: admin.id,
        action: "admin.workspace.delete",
        entityType: "workspace",
        entityId: target.id,
        workspaceId: target.id,
        detail: {
          snapshot: target,
          dependents: {
            members: memberCount.n,
            projects: projectCount.n,
            aiCalls: aiCallCount.n,
            agentSuggestions: suggestionCount.n,
          },
        },
      });
      await tx.delete(workspaces).where(eq(workspaces.id, id));
    });
  } catch (err) {
    if (isForeignKeyViolation(err)) {
      redirect(`/admin/workspaces/${id}?error=fk-blocked`);
    }
    throw err;
  }

  revalidatePath("/admin/workspaces");
  redirect("/admin/workspaces");
}
