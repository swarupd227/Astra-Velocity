"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { personaHome, visibleNavGroups } from "@/lib/nav";
import { ROLE_LABELS, type Role } from "@/lib/roles";

/**
 * Mobile navigation: hamburger in the top bar (below md) opening a slide-over
 * drawer with the same grouped, persona+permission-filtered nav as the desktop
 * sidebar. Body scroll locks while open; closes on link tap, backdrop, or Esc.
 */
export function MobileNav({
  persona,
  role,
  userName,
}: {
  persona: Role;
  role: Role;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const groups = visibleNavGroups(persona, role);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-slate-600 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white md:hidden"
      >
        <Menu className="h-4 w-4" aria-hidden />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="drawer-in absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-300 dark:shadow-slate-950"
          >
            <div className="flex items-start justify-between px-5 pb-4 pt-5">
              <Link
                href={personaHome(persona, role)}
                onClick={() => setOpen(false)}
                className="flex flex-col gap-0.5"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                  Artizent
                </span>
                <span className="font-serif text-xl text-slate-900 dark:text-white">Astra Velocity</span>
              </Link>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4" aria-label="Primary">
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                    {group.title}
                  </p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-slate-600 dark:text-slate-300 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
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

            <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-4">
              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{userName}</p>
              <p className="truncate text-xs text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
