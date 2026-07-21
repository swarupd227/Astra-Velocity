import Link from "next/link";
import {
  Award,
  Blocks,
  Bot,
  Compass,
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
import { auth, signOut } from "@/auth";
import { getActivePersona, switchPersona } from "@/lib/persona";
import { assumablePersonas, ROLE_HOMES, ROLE_LABELS, type Role } from "@/lib/roles";
import { RoleSwitcher } from "@/components/role-switcher";

const ALL_PERSONAS: Role[] = [
  "executive",
  "pursuit_lead",
  "delivery_lead",
  "data_steward",
  "content_curator",
  "platform_admin",
];

/** Persona-filtered primary navigation, grouped for the sidebar. */
const NAV_GROUPS: {
  title: string;
  items: { href: string; label: string; icon: LucideIcon; personas: Role[] }[];
}[] = [
  {
    title: "Explore",
    items: [
      { href: "/explore", label: "Landscape", icon: Compass, personas: ALL_PERSONAS },
      { href: "/scenarios", label: "Scenarios", icon: Map, personas: ALL_PERSONAS },
      { href: "/library", label: "Pack Library", icon: LibraryBig, personas: ALL_PERSONAS },
      { href: "/practices", label: "Best Practices", icon: Award, personas: ALL_PERSONAS },
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
      },
      {
        href: "/projects",
        label: "Projects",
        icon: KanbanSquare,
        personas: ["pursuit_lead", "delivery_lead", "executive", "platform_admin"],
      },
      {
        href: "/copilot",
        label: "Copilot",
        icon: Sparkles,
        personas: ["pursuit_lead", "delivery_lead", "data_steward", "content_curator", "platform_admin"],
      },
    ],
  },
  {
    title: "Operate",
    items: [
      { href: "/dashboards", label: "Dashboards", icon: Gauge, personas: ALL_PERSONAS },
      { href: "/steward", label: "My Day", icon: Inbox, personas: ["data_steward", "platform_admin"] },
      {
        href: "/agents",
        label: "Agents",
        icon: Bot,
        personas: ["data_steward", "delivery_lead", "platform_admin"],
      },
      { href: "/exec", label: "Value", icon: TrendingUp, personas: ["executive", "platform_admin"] },
    ],
  },
  {
    title: "Govern",
    items: [
      { href: "/studio", label: "Studio", icon: PenSquare, personas: ["content_curator", "platform_admin"] },
      { href: "/admin", label: "Admin", icon: Settings2, personas: ["platform_admin"] },
    ],
  },
];

/**
 * App shell: fixed vertical sidebar (brand + grouped nav), slim top bar with
 * the role switcher and sign-out, constrained content column.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return <>{children}</>;

  const persona = (await getActivePersona()) ?? session.user.role;
  const options = assumablePersonas(session.user.role);

  async function doSwitch(next: Role) {
    "use server";
    await switchPersona(next);
  }

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => item.personas.includes(persona)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <Link href={ROLE_HOMES[persona]} className="flex flex-col gap-0.5 px-5 pb-4 pt-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-400">
            Artizent
          </span>
          <span className="font-serif text-xl text-white">Astra Velocity</span>
        </Link>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Primary">
          {visibleGroups.map((group) => (
            <div key={group.title}>
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
                    >
                      <item.icon className="h-4 w-4 text-slate-500" aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-slate-800 px-5 py-4">
          <p className="truncate text-sm font-medium text-slate-200">{session.user.name}</p>
          <p className="truncate text-xs text-slate-500">{ROLE_LABELS[session.user.role]}</p>
        </div>
      </aside>

      {/* Content column */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            {/* Brand shows in the top bar only when the sidebar is hidden (small screens) */}
            <Link href={ROLE_HOMES[persona]} className="flex items-baseline gap-2 md:invisible">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
                Artizent
              </span>
              <span className="font-serif text-lg text-white">Astra Velocity</span>
            </Link>
            <div className="flex items-center gap-3">
              <RoleSwitcher active={persona} options={options} onSwitch={doSwitch} />
              <form action={doSignOut}>
                <button
                  type="submit"
                  className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
