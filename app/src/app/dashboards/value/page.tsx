import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { Clock3, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";
import { db } from "@/db/client";
import { agentSuggestions } from "@/db/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoLineChart } from "@/components/viz/two-line";
import { getSimForCurrentUser } from "@/sim/context";

export const metadata = { title: "Executive Value — Astra Velocity" };

export default async function ValueDashboardPage() {
  const ctx = await getSimForCurrentUser();
  if (!ctx) redirect("/login");
  const { value, leverage } = ctx.sim;

  // Acceptance rate from the real suggestion queue when decisions exist,
  // simulated otherwise — the demo stays coherent either way.
  let acceptanceRate = leverage.overallAcceptanceRate;
  if (ctx.workspace) {
    const rows = await db
      .select({ status: agentSuggestions.status, n: count() })
      .from(agentSuggestions)
      .where(eq(agentSuggestions.workspaceId, ctx.workspace.id))
      .groupBy(agentSuggestions.status);
    const byStatus = new Map(rows.map((r) => [r.status, r.n]));
    const approved = (byStatus.get("approved") ?? 0) + (byStatus.get("edited") ?? 0);
    const decided = approved + (byStatus.get("rejected") ?? 0);
    if (decided > 0) acceptanceRate = approved / decided;
  }

  const cycleDelta = Math.round((value.accessCycleDaysStart - value.accessCycleDaysNow) * 10) / 10;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-white">Executive Value</h1>
        <p className="mt-1 text-slate-400">
          So what: what has governance made measurably cheaper, faster, or safer — in terms the
          CFO can retell?
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HeroTile
          icon={<ShieldCheck className="h-5 w-5 text-teal-400" />}
          value={String(value.incidentsAvoided)}
          label="Incidents avoided on priority reports"
          detail="Breaches caught before a filed or executive number shipped"
        />
        <HeroTile
          icon={<Clock3 className="h-5 w-5 text-teal-400" />}
          value={`−${cycleDelta}d`}
          label="Access-provisioning cycle time"
          detail={`${value.accessCycleDaysStart}d → ${value.accessCycleDaysNow}d since Q1-26`}
        />
        <HeroTile
          icon={<TrendingDown className="h-5 w-5 text-teal-400" />}
          value={String(value.stewardWeeksSaved)}
          label="Steward-weeks saved"
          detail={
            ctx.projectName
              ? `From the “${ctx.projectName}” velocity-pack selection`
              : "Cumulative vs. the manual baseline"
          }
        />
        <HeroTile
          icon={<Sparkles className="h-5 w-5 text-teal-400" />}
          value={`${Math.round(acceptanceRate * 100)}%`}
          label="Agent suggestion acceptance"
          detail="Share of agent drafts stewards approve or approve-with-edits"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program economics — cumulative steward effort</CardTitle>
          <CardDescription>
            Manual baseline vs. the velocity-pack curve; the widening gap is the funded capacity
            returned to the data office.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoLineChart
            points={value.economics}
            baselineName="Manual baseline"
            actualName="Velocity pack"
            unit="steward-weeks"
          />
        </CardContent>
      </Card>

      <p className="rounded-2xl border border-teal-500/30 bg-teal-500/5 px-5 py-3 text-sm text-slate-300">
        Value narrative: agents draft at machine speed, stewards decide at human judgment, and the
        gap between the two curves — {value.stewardWeeksSaved} steward-weeks so far — is what
        funds the next wave of governed products without new headcount.
      </p>

      <p className="text-xs text-slate-600">
        Simulated telemetry — wire to live governance tooling via the API.
      </p>
    </div>
  );
}

function HeroTile({
  icon,
  value,
  label,
  detail,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      {icon}
      <p className="mt-3 text-3xl font-semibold text-white tabular-nums">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
