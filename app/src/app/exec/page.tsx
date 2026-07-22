import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Blocks, Gauge, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulatedNote } from "@/components/simulated-note";
import { Term } from "@/components/term";
import { WelcomePanel } from "@/components/welcome-panel";
import { BurnUp } from "@/components/viz/burn-up";
import { getSimForCurrentUser } from "@/sim/context";

export const metadata = { title: "Executive View — Astra Velocity" };

export default async function ExecPage() {
  const ctx = await getSimForCurrentUser();
  if (!ctx) redirect("/login");
  const { portfolio, value } = ctx.sim;

  const cycleDelta = Math.round((value.accessCycleDaysStart - value.accessCycleDaysNow) * 10) / 10;
  const lastActual = portfolio.burnUp[ctx.sim.currentQuarterIndex]?.actual ?? 0;

  const links = [
    {
      href: "/dashboards/value",
      icon: TrendingUp,
      title: "Executive Value",
      text: "The two-curve economics chart and the value narrative behind it.",
    },
    {
      href: "/dashboards/gpi",
      icon: Gauge,
      title: "GPI Portfolio",
      text: "Per-product maturity, waves, and the capability bottleneck this quarter.",
    },
    {
      href: "/projects",
      icon: Blocks,
      title: "Projects",
      text: "The composed governance projects funding this trajectory.",
    },
  ];

  return (
    <div className="space-y-6">
      <WelcomePanel workspace="exec" />

      <header>
        <h1 className="font-display text-3xl text-white">Executive Value</h1>
        <p className="mt-1 text-slate-400">
          Portfolio <Term k="gpi">GPI</Term> maturity, value narrative, and the 2028 burn-up — at
          a glance.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={String(lastActual)} label="Products governed today" detail={`of ${portfolio.burnUpTarget} planned by Q4-28`} />
        <Stat value={String(value.incidentsAvoided)} label="Incidents avoided" detail="on filing- and close-critical reports" />
        <Stat value={`−${cycleDelta}d`} label="Access cycle time" detail={`${value.accessCycleDaysStart}d → ${value.accessCycleDaysNow}d`} />
        <Stat
          value={String(value.stewardWeeksSaved)}
          label={
            <>
              <Term k="steward">Steward</Term>-weeks saved
            </>
          }
          detail="vs. the manual baseline"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Burn-up to the 2028 goal</CardTitle>
          <CardDescription>
            Data products at target governance maturity — actuals through Q2-27, projection beyond.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BurnUp points={portfolio.burnUp} target={portfolio.burnUpTarget} targetLabel="Goal" />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-teal-500/50"
          >
            <l.icon className="h-5 w-5 text-teal-400" />
            <h2 className="mt-3 font-semibold text-white">{l.title}</h2>
            <p className="mt-1 text-xs text-slate-400">{l.text}</p>
            <span className="mt-3 flex items-center gap-1 text-xs font-medium text-teal-300">
              Open <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <SimulatedNote />
    </div>
  );
}

function Stat({
  value,
  label,
  detail,
}: {
  value: string;
  label: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <p className="text-3xl font-semibold text-white tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
