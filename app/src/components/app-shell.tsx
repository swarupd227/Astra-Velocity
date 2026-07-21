import Link from "next/link";
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

/** Persona-filtered primary navigation. */
const NAV_ITEMS: { href: string; label: string; personas: Role[] }[] = [
  { href: "/explore", label: "Explore", personas: ALL_PERSONAS },
  { href: "/scenarios", label: "Scenarios", personas: ALL_PERSONAS },
  { href: "/library", label: "Library", personas: ALL_PERSONAS },
  { href: "/practices", label: "Best Practices", personas: ALL_PERSONAS },
  { href: "/composer", label: "Composer", personas: ["pursuit_lead", "delivery_lead", "platform_admin"] },
  { href: "/projects", label: "Projects", personas: ["pursuit_lead", "delivery_lead", "executive", "platform_admin"] },
  { href: "/dashboards", label: "Dashboards", personas: ALL_PERSONAS },
  { href: "/copilot", label: "Copilot", personas: ["pursuit_lead", "delivery_lead", "data_steward", "content_curator", "platform_admin"] },
  { href: "/steward", label: "My Day", personas: ["data_steward", "platform_admin"] },
  { href: "/agents", label: "Agents", personas: ["data_steward", "delivery_lead", "platform_admin"] },
  { href: "/exec", label: "Value", personas: ["executive", "platform_admin"] },
  { href: "/studio", label: "Studio", personas: ["content_curator", "platform_admin"] },
  { href: "/admin", label: "Admin", personas: ["platform_admin"] },
];

/**
 * App shell: brand, persona-aware nav, role switcher, sign-out.
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href={ROLE_HOMES[persona]} className="flex items-baseline gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
                Artizent
              </span>
              <span className="font-serif text-lg text-white">Astra Velocity</span>
            </Link>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
              {NAV_ITEMS.filter((item) => item.personas.includes(persona)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800/70 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-400 sm:inline">
              {session.user.name} · {ROLE_LABELS[session.user.role]}
            </span>
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
  );
}
