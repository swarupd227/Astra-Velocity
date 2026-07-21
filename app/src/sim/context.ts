import { asc, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { projects, workspaceMembers, workspaces } from "@/db/schema";
import { contentStore } from "@/content/store";
import { simulate, type SimResult } from "./engine";

/**
 * Server-side glue between the session and the deterministic sim engine.
 * Seed precedence: the user's most recent project id, else the workspace
 * slug — so every workspace demos with stable but distinct telemetry.
 */

export interface WorkspaceRef {
  id: string;
  slug: string;
  name: string;
}

export async function getWorkspaceForUser(userId: string): Promise<WorkspaceRef | null> {
  const [row] = await db
    .select({ id: workspaces.id, slug: workspaces.slug, name: workspaces.name })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaceMembers.createdAt))
    .limit(1);
  return row ?? null;
}

export interface SimContext {
  sim: SimResult;
  seedKey: string;
  workspace: WorkspaceRef | null;
  projectName: string | null;
}

/** Simulation for the current user: seeded, with project effort-saved wired in. */
export async function getSimForCurrentUser(): Promise<SimContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const workspace = await getWorkspaceForUser(session.user.id);
  let seedKey = workspace?.slug ?? session.user.id;
  let projectName: string | null = null;
  let stewardWeeksSaved: number | null = null;

  if (workspace) {
    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        selectedElementKeys: projects.selectedElementKeys,
      })
      .from(projects)
      .where(eq(projects.workspaceId, workspace.id))
      .orderBy(desc(projects.updatedAt))
      .limit(1);
    if (project) {
      seedKey = project.id;
      projectName = project.name;
      const selected = new Set(project.selectedElementKeys);
      const elements = await contentStore.elements();
      stewardWeeksSaved = elements
        .filter((el) => selected.has(el.key))
        .reduce((sum, el) => sum + (el.effortSavedStewardWeeks ?? 0), 0);
    }
  }

  return {
    sim: simulate(seedKey, { stewardWeeksSaved }),
    seedKey,
    workspace,
    projectName,
  };
}
