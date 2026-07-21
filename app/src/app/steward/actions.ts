"use server";

import { revalidatePath } from "next/cache";
import { and, count, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { agentSuggestions, auditLog } from "@/db/schema";
import { hasPermission, type Role } from "@/lib/roles";
import { getWorkspaceForUser } from "@/sim/context";
import { draftSuggestions } from "@/sim/generate-suggestions";

/**
 * Steward decision surface. Every action re-checks session + RBAC server-side
 * ("agents.supervise"), mutates the suggestion queue, and appends audit_log
 * rows — agents draft, stewards decide, everything is logged.
 */

const MAX_PENDING_PER_WORKSPACE = 40;

interface Supervisor {
  id: string;
  role: Role;
  workspaceId: string;
}

async function requireSupervisor(): Promise<Supervisor> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (!hasPermission(session.user.role, "agents.supervise")) {
    throw new Error(`Role ${session.user.role} cannot supervise agents`);
  }
  const workspace = await getWorkspaceForUser(session.user.id);
  if (!workspace) throw new Error("User has no workspace membership");
  return { id: session.user.id, role: session.user.role, workspaceId: workspace.id };
}

/**
 * "Run agents": draft 15–25 suggestions deterministically from the content
 * library. Idempotent-ish — pending suggestions are capped per workspace and
 * already-pending titles are skipped, so re-running does not flood the queue.
 */
export async function runAgentsAction(): Promise<void> {
  const user = await requireSupervisor();

  const [{ pending }] = await db
    .select({ pending: count() })
    .from(agentSuggestions)
    .where(
      and(
        eq(agentSuggestions.workspaceId, user.workspaceId),
        eq(agentSuggestions.status, "pending"),
      ),
    );

  const headroom = MAX_PENDING_PER_WORKSPACE - pending;
  if (headroom <= 0) {
    revalidatePath("/steward");
    return;
  }

  // Seed varies with total history so consecutive runs draw fresh batches,
  // while any given (workspace, run-number) pair stays deterministic.
  const [{ total }] = await db
    .select({ total: count() })
    .from(agentSuggestions)
    .where(eq(agentSuggestions.workspaceId, user.workspaceId));
  const drafts = draftSuggestions(`${user.workspaceId}:${total}`);

  const existingPending = await db
    .select({ title: agentSuggestions.title })
    .from(agentSuggestions)
    .where(
      and(
        eq(agentSuggestions.workspaceId, user.workspaceId),
        eq(agentSuggestions.status, "pending"),
      ),
    );
  const pendingTitles = new Set(existingPending.map((r) => r.title));

  const rows = drafts
    .filter((d) => !pendingTitles.has(d.title))
    .slice(0, headroom)
    .map((d) => ({
      agentKey: d.agentKey,
      workspaceId: user.workspaceId,
      kind: d.kind,
      title: d.title,
      payload: d.payload,
      confidence: d.confidence.toFixed(3),
    }));

  if (rows.length > 0) {
    const inserted = await db.insert(agentSuggestions).values(rows).returning({
      id: agentSuggestions.id,
      agentKey: agentSuggestions.agentKey,
    });
    await db.insert(auditLog).values(
      inserted.map((row) => ({
        actorType: "agent" as const,
        actorId: row.agentKey,
        action: "suggestion.create",
        entityType: "agent_suggestion",
        entityId: row.id,
        workspaceId: user.workspaceId,
        detail: { triggeredBy: user.id },
      })),
    );
  }

  revalidatePath("/steward");
  revalidatePath("/agents");
}

const DecisionSchema = z.object({
  suggestionId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  note: z.string().trim().max(2000).optional(),
});

/** Approve / edit-note-and-approve / reject a pending suggestion. */
export async function decideSuggestionAction(formData: FormData): Promise<void> {
  const user = await requireSupervisor();
  const input = DecisionSchema.parse({
    suggestionId: formData.get("suggestionId"),
    decision: formData.get("decision"),
    note: String(formData.get("note") ?? "").trim() || undefined,
  });

  const suggestion = await db.query.agentSuggestions.findFirst({
    where: eq(agentSuggestions.id, input.suggestionId),
  });
  if (!suggestion) throw new Error("Suggestion not found");
  if (suggestion.workspaceId !== user.workspaceId) {
    throw new Error("Suggestion belongs to another workspace");
  }
  if (suggestion.status !== "pending") return; // already decided — idempotent

  const status =
    input.decision === "reject" ? "rejected" : input.note ? "edited" : "approved";
  const action =
    input.decision === "reject"
      ? "suggestion.reject"
      : input.note
        ? "suggestion.edit"
        : "suggestion.approve";

  await db
    .update(agentSuggestions)
    .set({
      status,
      decidedBy: user.id,
      decisionNote: input.note ?? null,
      decidedAt: new Date(),
    })
    .where(eq(agentSuggestions.id, suggestion.id));

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action,
    entityType: "agent_suggestion",
    entityId: suggestion.id,
    workspaceId: user.workspaceId,
    detail: {
      agentKey: suggestion.agentKey,
      kind: suggestion.kind,
      title: suggestion.title,
      confidence: suggestion.confidence,
      ...(input.note ? { noteLength: input.note.length } : {}),
    },
  });

  revalidatePath("/steward");
  revalidatePath("/agents");
}

/** Bulk decide (used by "approve all high-confidence" style flows if needed). */
export async function bulkDecideAction(
  suggestionIds: string[],
  decision: "approve" | "reject",
): Promise<void> {
  const user = await requireSupervisor();
  const ids = z.array(z.string().uuid()).min(1).max(100).parse(suggestionIds);

  const rows = await db
    .select()
    .from(agentSuggestions)
    .where(
      and(
        inArray(agentSuggestions.id, ids),
        eq(agentSuggestions.workspaceId, user.workspaceId),
        eq(agentSuggestions.status, "pending"),
      ),
    );
  if (rows.length === 0) return;

  const status = decision === "approve" ? "approved" : "rejected";
  const action = decision === "approve" ? "suggestion.approve" : "suggestion.reject";
  await db
    .update(agentSuggestions)
    .set({ status, decidedBy: user.id, decidedAt: new Date() })
    .where(inArray(agentSuggestions.id, rows.map((r) => r.id)));

  await db.insert(auditLog).values(
    rows.map((r) => ({
      actorType: "human" as const,
      actorId: user.id,
      action,
      entityType: "agent_suggestion",
      entityId: r.id,
      workspaceId: user.workspaceId,
      detail: { agentKey: r.agentKey, kind: r.kind, title: r.title, bulk: true },
    })),
  );

  revalidatePath("/steward");
  revalidatePath("/agents");
}
