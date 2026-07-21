/**
 * Platform roles (RBAC) and personas (experience shaping).
 *
 * A user has exactly one platform role. The role switcher lets a user assume any
 * persona their role authorizes (platform_admin and demo workspaces unlock all),
 * reshaping navigation and landing views without changing permissions.
 */

export const ROLES = [
  "executive",
  "pursuit_lead",
  "delivery_lead",
  "data_steward",
  "content_curator",
  "platform_admin",
] as const;

export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  executive: "Executive / CDO",
  pursuit_lead: "Pursuit Lead",
  delivery_lead: "Delivery Lead",
  data_steward: "Data Steward",
  content_curator: "Content Curator",
  platform_admin: "Platform Admin",
};

export const ROLE_HOMES: Record<Role, string> = {
  executive: "/exec",
  pursuit_lead: "/composer",
  delivery_lead: "/projects",
  data_steward: "/steward",
  content_curator: "/studio",
  platform_admin: "/admin",
};

/** Permissions are coarse-grained capabilities checked server-side. */
export const PERMISSIONS = [
  "library.read",
  "library.author",
  "library.publish",
  "project.compose",
  "project.read",
  "project.manage",
  "steward.workqueue",
  "agents.supervise",
  "dashboards.executive",
  "ai.use",
  "admin.users",
  "admin.ai",
  "admin.audit",
  "admin.platform",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const BASE_READ: Permission[] = ["library.read", "project.read"];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  executive: [...BASE_READ, "dashboards.executive"],
  pursuit_lead: [...BASE_READ, "project.compose", "ai.use"],
  delivery_lead: [...BASE_READ, "project.compose", "project.manage", "ai.use"],
  data_steward: [...BASE_READ, "steward.workqueue", "agents.supervise", "ai.use"],
  content_curator: [...BASE_READ, "library.author", "library.publish", "ai.use"],
  platform_admin: [...PERMISSIONS],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Personas a given role may assume in the role switcher. */
export function assumablePersonas(role: Role, opts?: { demoWorkspace?: boolean }): Role[] {
  if (role === "platform_admin" || opts?.demoWorkspace) return [...ROLES];
  // Everyone can view the executive lens (read-mostly) plus their own persona.
  const base = new Set<Role>([role, "executive"]);
  return ROLES.filter((r) => base.has(r));
}
