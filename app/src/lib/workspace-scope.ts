import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { aiSettings } from "@/db/schema";
import { PLATFORM_KEYS, SECTOR_KEYS, type PlatformKey, type SectorKey } from "@/content/types";
import { getWorkspaceForUser } from "@/sim/context";

/**
 * Workspace-level sector scoping. A workspace can be narrowed to the sectors
 * its client actually operates in; every sector-typed surface (explore,
 * composer, scenarios, library, command palette) then filters to that scope.
 *
 * Storage: the generic ai_settings key-value store under
 * `workspace-scope.<workspaceSlug>` holding a string[] of sector keys — no
 * schema change. Absent or empty means "all sectors" (no restriction).
 */

const KEY_PREFIX = "workspace-scope.";

export function scopeSettingKey(workspaceSlug: string): string {
  return `${KEY_PREFIX}${workspaceSlug}`;
}

/** Parse a stored scope value; null means "no restriction" (all sectors). */
export function parseScopeValue(value: unknown): ReadonlySet<SectorKey> | null {
  if (!Array.isArray(value)) return null;
  const keys = value.filter((v): v is SectorKey => SECTOR_KEYS.includes(v as SectorKey));
  if (keys.length === 0) return null;
  return new Set(keys);
}

export function allSectors(): ReadonlySet<SectorKey> {
  return new Set(SECTOR_KEYS);
}

/** Scope for a specific workspace slug; all sectors when unset. */
export async function getSectorScopeForWorkspace(
  workspaceSlug: string,
): Promise<ReadonlySet<SectorKey>> {
  const [row] = await db
    .select({ value: aiSettings.value })
    .from(aiSettings)
    .where(eq(aiSettings.key, scopeSettingKey(workspaceSlug)))
    .limit(1);
  return parseScopeValue(row?.value) ?? allSectors();
}

/**
 * Scope for the current session's workspace. Falls back to all sectors when
 * signed out or not a member of any workspace — scoping narrows, never blocks.
 */
export async function getSectorScope(): Promise<ReadonlySet<SectorKey>> {
  const session = await auth();
  if (!session?.user?.id) return allSectors();
  const workspace = await getWorkspaceForUser(session.user.id);
  if (!workspace) return allSectors();
  return getSectorScopeForWorkspace(workspace.slug);
}

/**
 * An element (or dashboard) stays visible when its sector affinity is broad
 * (no positive sector pins) or when at least one pinned sector is in scope.
 * Only elements pinned exclusively to out-of-scope sectors are hidden.
 */
export function isInSectorScope(
  sectorAffinity: Partial<Record<SectorKey, number>>,
  scope: ReadonlySet<SectorKey>,
): boolean {
  if (scope.size >= SECTOR_KEYS.length) return true;
  const pinned = (Object.keys(sectorAffinity) as SectorKey[]).filter(
    (k) => (sectorAffinity[k] ?? 0) > 0,
  );
  if (pinned.length === 0) return true;
  return pinned.some((k) => scope.has(k));
}

/**
 * Workspace-level default technology & platform stack scope — same storage
 * mechanism as sector scope (generic ai_settings key-value store), keyed
 * under `workspace-platform-scope.<workspaceSlug>` holding a string[] of
 * platform keys. Absent or empty means "all platforms" (no restriction).
 * This narrows which platforms are offered/highlighted by default when
 * composing a project in this workspace — it does not hard-block a choice.
 */

const PLATFORM_KEY_PREFIX = "workspace-platform-scope.";

export function platformScopeSettingKey(workspaceSlug: string): string {
  return `${PLATFORM_KEY_PREFIX}${workspaceSlug}`;
}

/** Parse a stored platform scope value; null means "no restriction" (all platforms). */
export function parsePlatformScopeValue(value: unknown): ReadonlySet<PlatformKey> | null {
  if (!Array.isArray(value)) return null;
  const keys = value.filter((v): v is PlatformKey => PLATFORM_KEYS.includes(v as PlatformKey));
  if (keys.length === 0) return null;
  return new Set(keys);
}

export function allPlatforms(): ReadonlySet<PlatformKey> {
  return new Set(PLATFORM_KEYS);
}

/** Platform scope for a specific workspace slug; all platforms when unset. */
export async function getPlatformScopeForWorkspace(
  workspaceSlug: string,
): Promise<ReadonlySet<PlatformKey>> {
  const [row] = await db
    .select({ value: aiSettings.value })
    .from(aiSettings)
    .where(eq(aiSettings.key, platformScopeSettingKey(workspaceSlug)))
    .limit(1);
  return parsePlatformScopeValue(row?.value) ?? allPlatforms();
}
