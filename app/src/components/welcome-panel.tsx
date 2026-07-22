"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { useDismissable } from "@/lib/use-dismissable";

/**
 * Dismissible per-persona orientation panel shown at the top of each persona
 * home. Dismissal is remembered per persona in localStorage; the panel renders
 * nothing on the server so SSR output never disagrees with the stored flag.
 */

interface WelcomeCopy {
  title: string;
  body: string;
  links: { href: string; label: string }[];
}

const COPY = {
  exec: {
    title: "Welcome to the Executive View",
    body: "This is the leadership lens: portfolio governance maturity, the value narrative, and the trajectory to the 2028 goal — no operational queues. Every number rolls up from the same telemetry the delivery dashboards use.",
    links: [
      { href: "/dashboards/value", label: "Executive Value" },
      { href: "/dashboards/gpi", label: "GPI Portfolio" },
      { href: "/projects", label: "Projects" },
    ],
  },
  composer: {
    title: "Welcome to the Project Composer",
    body: "The Composer assembles a client-ready governance project in three picks: sector, scenario, then the recommended Velocity Pack elements. Everything it proposes is justified by a best practice or an obligation.",
    links: [
      { href: "/explore", label: "Landscape" },
      { href: "/scenarios", label: "Scenarios" },
      { href: "/library", label: "Pack Library" },
    ],
  },
  projects: {
    title: "Welcome to Projects",
    body: "This is the delivery workspace: every composed engagement lives here with its blueprint, elements, and dashboards. Open a project for its full brief, or compose a new one from the library.",
    links: [
      { href: "/composer", label: "Compose a project" },
      { href: "/dashboards", label: "Dashboards" },
      { href: "/library", label: "Pack Library" },
    ],
  },
  steward: {
    title: "Welcome to My Day",
    body: "This is your decision queue: agents draft classifications, rules, and metadata — you approve, edit, or reject, and every decision lands in the audit log. Acceptance telemetry feeds the agent workbench.",
    links: [
      { href: "/agents", label: "Agent Workbench" },
      { href: "/dashboards/dq", label: "DQ Health" },
      { href: "/library", label: "Pack Library" },
    ],
  },
  studio: {
    title: "Welcome to the Library Studio",
    body: "This is where governed library content is authored: draft, validate against the content schema, and publish. Published versions are immutable — revisions go through drafts, and only published content reaches the library and the engine.",
    links: [
      { href: "/library", label: "Pack Library" },
      { href: "/practices", label: "Best Practices" },
      { href: "/explore", label: "Landscape" },
    ],
  },
  admin: {
    title: "Welcome to Platform Admin",
    body: "Admin covers the platform itself: user accounts and roles, AI routing and guardrails, and the audit trail. Every change made here is logged. Start with users if you are setting up a workspace.",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/ai", label: "AI Console" },
      { href: "/admin/audit", label: "Audit Trail" },
    ],
  },
} as const satisfies Record<string, WelcomeCopy>;

export type WelcomeKey = keyof typeof COPY;

export function WelcomePanel({ workspace }: { workspace: WelcomeKey }) {
  const { dismissed, dismiss } = useDismissable(`astra-welcome-${workspace}`);
  const copy = COPY[workspace];

  if (dismissed) return null;

  return (
    <section
      aria-label={copy.title}
      className="relative rounded-2xl border border-teal-500/30 bg-teal-500/[0.06] p-5"
    >
      <button
        type="button"
        aria-label="Dismiss welcome panel"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded p-1 text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
      <h2 className="flex items-center gap-2 pr-8 text-sm font-semibold text-teal-700 dark:text-teal-300">
        <Sparkles className="h-4 w-4 shrink-0" aria-hidden /> {copy.title}
      </h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {copy.links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 transition hover:border-teal-500/50 hover:text-slate-900 dark:hover:text-white"
          >
            {l.label} <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
