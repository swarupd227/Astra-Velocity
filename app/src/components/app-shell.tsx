import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getActivePersona, switchPersona } from "@/lib/persona";
import { personaHome, visibleNavGroups } from "@/lib/nav";
import { buildSearchIndex } from "@/lib/search-index";
import { assumablePersonas, ROLE_LABELS, type Role } from "@/lib/roles";
import { CommandPalette } from "@/components/command-palette";
import { MobileNav } from "@/components/mobile-nav";
import { RoleSwitcher } from "@/components/role-switcher";

/**
 * App shell: fixed vertical sidebar (brand + grouped nav), slim top bar with
 * the role switcher and sign-out, constrained content column. Navigation is
 * filtered by BOTH the active persona and the real role's permissions (see
 * src/lib/nav.ts) so no visible item dead-ends on AccessDenied.
 */
export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) return <>{children}</>;

  const role = session.user.role;
  const persona = (await getActivePersona()) ?? role;
  const options = assumablePersonas(role);

  async function doSwitch(next: Role) {
    "use server";
    await switchPersona(next);
  }

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const visibleGroups = visibleNavGroups(persona, role);
  const home = personaHome(persona, role);
  const searchRows = await buildSearchIndex(visibleGroups);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-slate-800 bg-slate-950 md:flex">
        <Link href={home} className="flex flex-col gap-0.5 px-5 pb-4 pt-5">
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
          <p className="truncate text-xs text-slate-500">{ROLE_LABELS[role]}</p>
        </div>
      </aside>

      {/* Content column */}
      <div className="md:pl-60">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <MobileNav persona={persona} role={role} userName={session.user.name ?? ""} />
              {/* Brand shows in the top bar only when the sidebar is hidden (small screens) */}
              <Link
                href={home}
                className="flex items-baseline gap-2 truncate md:invisible"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
                  Artizent
                </span>
                <span className="font-serif text-lg text-white">Astra Velocity</span>
              </Link>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <CommandPalette rows={searchRows} />
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
          {persona !== role && (
            <div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-200 sm:px-6">
              Viewing as <span className="font-semibold">{ROLE_LABELS[persona]}</span> — your
              permissions remain {ROLE_LABELS[role]}.
            </div>
          )}
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
