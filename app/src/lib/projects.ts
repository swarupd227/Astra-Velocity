import { and, asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { auditLog, projects, workspaceMembers } from "@/db/schema";
import type { ProjectPlatformVariant } from "@/db/schema/projects";
import { contentStore } from "@/content/store";
import { hasPermission, type Role } from "@/lib/roles";
import { SCENARIO_KEYS, SECTOR_KEYS } from "@/content/types";

const MAX_PLATFORM_VARIANTS = 4;

/**
 * Server-only project data access. Every mutation re-checks the session and
 * RBAC here — next to the data — and appends an audit_log entry. Reads are
 * scoped through workspace membership.
 */

export type Project = typeof projects.$inferSelect;

export interface CreateProjectInput {
  name: string;
  clientLabel?: string | null;
  sectorKey: string;
  scenarioKey: string;
  selectedElementKeys: string[];
  platformKeys?: string[];
  platformVariants?: ProjectPlatformVariant[];
  notes?: string | null;
}

interface SessionUser {
  id: string;
  role: Role;
}

async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return { id: session.user.id, role: session.user.role };
}

function requireComposePermission(user: SessionUser): void {
  if (!hasPermission(user.role, "project.compose")) {
    throw new Error(`Role ${user.role} cannot compose projects`);
  }
}

/** The user's first workspace (by membership date) — projects live there. */
async function firstWorkspaceIdFor(userId: string): Promise<string> {
  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaceMembers.createdAt))
    .limit(1);
  if (!membership) throw new Error("User has no workspace membership");
  return membership.workspaceId;
}

async function isMemberOf(userId: string, workspaceId: string): Promise<boolean> {
  const [row] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(
      and(eq(workspaceMembers.userId, userId), eq(workspaceMembers.workspaceId, workspaceId)),
    )
    .limit(1);
  return Boolean(row);
}

/** Validate sector/scenario keys against published content and element keys ⊆ library. */
async function validateContentKeys(
  sectorKey: string,
  scenarioKey: string,
  selectedElementKeys: string[],
): Promise<void> {
  if (!(SECTOR_KEYS as readonly string[]).includes(sectorKey)) {
    throw new Error(`Unknown sector: ${sectorKey}`);
  }
  if (!(SCENARIO_KEYS as readonly string[]).includes(scenarioKey)) {
    throw new Error(`Unknown scenario: ${scenarioKey}`);
  }
  const [sectors, scenarios, elements] = await Promise.all([
    contentStore.sectors(),
    contentStore.scenarios(),
    contentStore.elements(),
  ]);
  if (!sectors.some((s) => s.key === sectorKey)) {
    throw new Error(`Sector not published: ${sectorKey}`);
  }
  if (!scenarios.some((s) => s.key === scenarioKey)) {
    throw new Error(`Scenario not published: ${scenarioKey}`);
  }
  const known = new Set(elements.map((e) => e.key));
  const unknown = selectedElementKeys.filter((k) => !known.has(k));
  if (unknown.length > 0) {
    throw new Error(`Unknown element keys: ${unknown.join(", ")}`);
  }
}

/** Validate a project's platform stack against published platform content. */
async function validatePlatformStack(
  platformKeys: string[],
  platformVariants: ProjectPlatformVariant[],
): Promise<void> {
  if (platformVariants.length > MAX_PLATFORM_VARIANTS) {
    throw new Error(`At most ${MAX_PLATFORM_VARIANTS} market variants are allowed`);
  }
  for (const variant of platformVariants) {
    if (!variant.label.trim()) {
      throw new Error("Every market variant requires a non-empty label");
    }
  }
  const platforms = await contentStore.platforms();
  const known = new Set<string>(platforms.map((p) => p.key));
  const unknown = [
    ...platformKeys,
    ...platformVariants.flatMap((v) => v.platformKeys),
  ].filter((k) => !known.has(k));
  if (unknown.length > 0) {
    throw new Error(`Unknown platform keys: ${[...new Set(unknown)].join(", ")}`);
  }
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const user = await requireUser();
  requireComposePermission(user);
  const platformKeys = input.platformKeys ?? [];
  const platformVariants = input.platformVariants ?? [];
  await validateContentKeys(input.sectorKey, input.scenarioKey, input.selectedElementKeys);
  await validatePlatformStack(platformKeys, platformVariants);

  const workspaceId = await firstWorkspaceIdFor(user.id);
  const [project] = await db
    .insert(projects)
    .values({
      workspaceId,
      name: input.name,
      clientLabel: input.clientLabel ?? null,
      sectorKey: input.sectorKey,
      scenarioKey: input.scenarioKey,
      selectedElementKeys: [...new Set(input.selectedElementKeys)],
      platformKeys: [...new Set(platformKeys)],
      platformVariants,
      notes: input.notes ?? null,
      createdBy: user.id,
    })
    .returning();

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "project.create",
    entityType: "project",
    entityId: project.id,
    workspaceId,
    detail: {
      name: project.name,
      sectorKey: project.sectorKey,
      scenarioKey: project.scenarioKey,
      elementCount: project.selectedElementKeys.length,
    },
  });

  return project;
}

export async function updateProjectElements(
  projectId: string,
  selectedElementKeys: string[],
): Promise<Project> {
  const user = await requireUser();
  requireComposePermission(user);

  const existing = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!existing) throw new Error("Project not found");
  if (!(await isMemberOf(user.id, existing.workspaceId))) {
    throw new Error("Not a member of the project's workspace");
  }
  await validateContentKeys(existing.sectorKey, existing.scenarioKey, selectedElementKeys);

  const [project] = await db
    .update(projects)
    .set({ selectedElementKeys: [...new Set(selectedElementKeys)], updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: user.id,
    action: "project.update",
    entityType: "project",
    entityId: project.id,
    workspaceId: project.workspaceId,
    detail: { elementCount: project.selectedElementKeys.length },
  });

  return project;
}

/** Project by id, only if the current user belongs to its workspace. */
export async function getProject(projectId: string): Promise<Project | null> {
  const user = await requireUser();
  const project = await db.query.projects.findFirst({ where: eq(projects.id, projectId) });
  if (!project) return null;
  if (!(await isMemberOf(user.id, project.workspaceId))) return null;
  return project;
}

/** Projects in the user's first workspace, most recently updated first. */
export async function listProjectsForUser(): Promise<Project[]> {
  const user = await requireUser();
  const [membership] = await db
    .select({ workspaceId: workspaceMembers.workspaceId })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user.id))
    .orderBy(asc(workspaceMembers.createdAt))
    .limit(1);
  if (!membership) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.workspaceId, membership.workspaceId))
    .orderBy(desc(projects.updatedAt));
}
