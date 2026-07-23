import {
  Award,
  Blocks,
  Bot,
  Gauge,
  Inbox,
  KanbanSquare,
  LibraryBig,
  Map,
  PenSquare,
  Settings2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { hasPermission, ROLE_HOMES, type Permission, type Role } from "@/lib/roles";

/**
 * Primary navigation config, shared by the desktop sidebar (server) and the
 * mobile drawer (client). Each item carries BOTH the personas it belongs to
 * and the permission the REAL role needs — an assumed persona never surfaces
 * a link the underlying role would hit an AccessDenied wall on.
 */

const ALL_PERSONAS: Role[] = [
  "executive",
  "pursuit_lead",
  "delivery_lead",
  "data_steward",
  "content_curator",
  "platform_admin",
];

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  personas: Role[];
  permission: Permission;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Explore",
    items: [
      // "Landscape" (/explore) is intentionally not a sidebar destination —
      // its content is now surfaced contextually as a drawer from the
      // composer's sector-selection step. The route itself still works as a
      // deep-linkable reference (see search-index.ts's "Sector reference"
      // rows) — do not delete src/app/explore/page.tsx.
      { href: "/scenarios", label: "Scenarios", icon: Map, personas: ALL_PERSONAS, permission: "library.read" },
      { href: "/library", label: "Pack Library", icon: LibraryBig, personas: ALL_PERSONAS, permission: "library.read" },
      { href: "/practices", label: "Best Practices", icon: Award, personas: ALL_PERSONAS, permission: "library.read" },
    ],
  },
  {
    title: "Deliver",
    items: [
      {
        href: "/composer",
        label: "Composer",
        icon: Blocks,
        personas: ["pursuit_lead", "delivery_lead", "platform_admin"],
        permission: "project.compose",
      },
      {
        href: "/projects",
        label: "Projects",
        icon: KanbanSquare,
        personas: ["pursuit_lead", "delivery_lead", "executive", "platform_admin"],
        permission: "project.read",
      },
      {
        href: "/copilot",
        label: "Copilot",
        icon: Sparkles,
        personas: ["pursuit_lead", "delivery_lead", "data_steward", "content_curator", "platform_admin"],
        permission: "ai.use",
      },
    ],
  },
  {
    title: "Operate",
    items: [
      { href: "/dashboards", label: "Dashboards", icon: Gauge, personas: ALL_PERSONAS, permission: "library.read" },
      {
        href: "/steward",
        label: "My Day",
        icon: Inbox,
        personas: ["data_steward", "platform_admin"],
        permission: "steward.workqueue",
      },
      {
        href: "/agents",
        label: "Agents",
        icon: Bot,
        personas: ["data_steward", "delivery_lead", "platform_admin"],
        permission: "agents.supervise",
      },
      {
        href: "/exec",
        label: "Value",
        icon: TrendingUp,
        personas: ["executive", "platform_admin"],
        permission: "dashboards.executive",
      },
    ],
  },
  {
    title: "Govern",
    items: [
      {
        href: "/studio",
        label: "Studio",
        icon: PenSquare,
        personas: ["content_curator", "platform_admin"],
        permission: "library.author",
      },
      {
        href: "/admin",
        label: "Admin",
        icon: Settings2,
        personas: ["platform_admin"],
        permission: "admin.platform",
      },
    ],
  },
];

/**
 * Groups visible for the active persona, restricted to what the real role can
 * actually open — no persona dead-ends into an AccessDenied page.
 */
export function visibleNavGroups(persona: Role, role: Role): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => item.personas.includes(persona) && hasPermission(role, item.permission),
    ),
  })).filter((group) => group.items.length > 0);
}

/**
 * Landing page for a persona that the REAL role can actually open: the
 * persona's natural home when permitted, otherwise the first visible nav item.
 * Keeps the persona switcher and the brand link from dead-ending on
 * AccessDenied (e.g. a pursuit lead assuming the executive lens, whose home
 * /exec needs dashboards.executive).
 */
export function personaHome(persona: Role, role: Role): string {
  const items = visibleNavGroups(persona, role).flatMap((group) => group.items);
  const home = ROLE_HOMES[persona];
  if (items.some((item) => item.href === home)) return home;
  return items[0]?.href ?? "/";
}
