import Link from "next/link";
import { auth, signOut } from "@/auth";
import { getActivePersona, switchPersona } from "@/lib/persona";
import { assumablePersonas, ROLE_HOMES, ROLE_LABELS, type Role } from "@/lib/roles";
import { RoleSwitcher } from "@/components/role-switcher";

/**
 * Phase-0 shell: header with brand, persona-aware nav, role switcher, sign-out.
 * Replaced by the full design system in Phase 2.
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
          <Link href={ROLE_HOMES[persona]} className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
              Artizent
            </span>
            <span className="font-serif text-lg text-white">Astra Velocity</span>
          </Link>

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
