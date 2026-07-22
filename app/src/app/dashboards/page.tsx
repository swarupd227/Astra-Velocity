import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Gauge, HeartPulse, ShieldCheck, TrendingUp } from "lucide-react";
import { auth } from "@/auth";
import { contentStore } from "@/content/store";
import { Badge } from "@/components/ui/badge";
import { Term } from "@/components/term";
import { CHART } from "@/components/viz/tokens";

export const metadata = { title: "Dashboards — Astra Velocity" };

const LIVE_DASHBOARDS = [
  {
    href: "/dashboards/gpi",
    key: "gpi-portfolio",
    icon: Gauge,
    name: "GPI Portfolio",
    soWhat: "Is the portfolio on trajectory to the 2028 governed-product goal?",
    preview: "burnup",
  },
  {
    href: "/dashboards/dq",
    key: "dq-health",
    icon: HeartPulse,
    name: "DQ Health",
    soWhat: "Which breaches threaten filing-critical reports, and who owns them?",
    preview: "bars",
  },
  {
    href: "/dashboards/value",
    key: "executive-value",
    icon: TrendingUp,
    name: "Executive Value",
    soWhat: "What did governance make cheaper, faster, or safer this quarter?",
    preview: "twoline",
  },
  {
    href: "/steward",
    key: "steward-my-day",
    icon: ShieldCheck,
    name: "Steward Command Center",
    soWhat: "What decisions are waiting on you right now — and which SLA first?",
    preview: "queue",
  },
] as const;

export default async function DashboardsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const blueprints = await contentStore.dashboards();
  const byKey = new Map(blueprints.map((d) => [d.key, d]));
  const governance = blueprints.filter((d) => d.category === "governance");
  const business = blueprints.filter((d) => d.category === "business");

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-white">Dashboards</h1>
        <p className="mt-1 text-slate-400">
          Four live dashboards — <Term k="gpi">GPI</Term> portfolio, <Term k="dq">DQ</Term>{" "}
          health, executive value, and the steward queue — run in-app on simulated telemetry; the
          full blueprint catalog below defines what each one needs to go live against client
          tooling.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {LIVE_DASHBOARDS.map((d) => {
          const spec = byKey.get(d.key);
          return (
            <Link
              key={d.key}
              href={d.href}
              className="group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-teal-500/50"
            >
              <div className="flex items-center justify-between">
                <d.icon className="h-5 w-5 text-teal-400" />
                <Badge variant="accent">Live</Badge>
              </div>
              <h2 className="mt-3 font-semibold text-white">{d.name}</h2>
              <p className="mt-1 text-xs text-slate-400">{d.soWhat}</p>
              <div className="mt-3">
                <MiniPreview kind={d.preview} />
              </div>
              <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-teal-300">
                Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </span>
              {spec && (
                <p className="mt-1 text-[11px] text-slate-600">
                  Audience: {spec.audience.slice(0, 2).join(", ")}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-slate-400">
        The live dashboards are fed by the six agent co-workers — see their roster, guardrails,
        and acceptance telemetry in the{" "}
        <Link href="/agents" className="text-teal-300 hover:text-teal-200">
          Agent Workbench →
        </Link>
      </p>

      <BlueprintSection title="Governance blueprints" dashboards={governance} />
      <BlueprintSection title="Business blueprints" dashboards={business} />
    </div>
  );
}

/** Decorative thumbnails only — the live pages carry the real, labeled charts. */
function MiniPreview({ kind }: { kind: string }) {
  const teal = CHART.series[0];
  const blue = CHART.series[1];
  if (kind === "burnup") {
    return (
      <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
        <path d="M0,36 L20,33 L40,28 L60,22 L75,18" fill="none" stroke={teal} strokeWidth={2} />
        <path d="M75,18 L95,11 L120,4" fill="none" stroke={teal} strokeWidth={2} strokeDasharray="3 4" opacity={0.7} />
        <line x1="0" x2="120" y1="6" y2="6" stroke={CHART.ink.baseline} strokeDasharray="4 3" />
      </svg>
    );
  }
  if (kind === "bars") {
    return (
      <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
        {[34, 62, 48, 80, 26].map((w, i) => (
          <rect key={i} x={0} y={i * 8} width={w} height={5} rx={1.5} fill={teal} opacity={0.55 + i * 0.08} />
        ))}
      </svg>
    );
  }
  if (kind === "twoline") {
    return (
      <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
        <path d="M0,34 L30,28 L60,21 L90,14 L120,6" fill="none" stroke={blue} strokeWidth={2} />
        <path d="M0,35 L30,31 L60,28 L90,26 L120,25" fill="none" stroke={teal} strokeWidth={2} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 40" className="h-10 w-full" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={0} y={i * 13} width={120} height={9} rx={2} fill={CHART.ink.grid} />
          <rect x={3} y={i * 13 + 2.5} width={4} height={4} rx={2} fill={teal} />
        </g>
      ))}
    </svg>
  );
}

function BlueprintSection({
  title,
  dashboards,
}: {
  title: string;
  dashboards: Awaited<ReturnType<typeof contentStore.dashboards>>;
}) {
  if (dashboards.length === 0) return null;
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboards.map((d) => (
          <article key={d.key} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-white">{d.name}</h3>
              {d.builtIn && <Badge variant="accent">Live in-app</Badge>}
            </div>
            <p className="mt-1 text-xs text-slate-500">Audience: {d.audience.join(", ")}</p>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <p className="font-medium text-slate-400">Questions answered</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-400/90">
                  {d.questionsAnswered.slice(0, 3).map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-400">Key panels</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-400/90">
                  {d.kpis.slice(0, 3).map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
              {d.targetStack.map((t) => (
                <Badge key={t} variant="outline" className="text-[11px] font-normal">
                  {t}
                </Badge>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
