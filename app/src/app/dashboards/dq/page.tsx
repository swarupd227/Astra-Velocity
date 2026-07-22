import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, Clock3, OctagonAlert, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimulatedNote } from "@/components/simulated-note";
import { Term } from "@/components/term";
import { StatBars } from "@/components/viz/stat-bars";
import { CHART } from "@/components/viz/tokens";
import { getSimForCurrentUser } from "@/sim/context";

export const metadata = { title: "DQ Health — Astra Velocity" };

const SEVERITY_META = {
  critical: { label: "Critical", color: CHART.status.critical, Icon: OctagonAlert },
  serious: { label: "Serious", color: CHART.status.serious, Icon: TriangleAlert },
  warning: { label: "Warning", color: CHART.status.warning, Icon: AlertTriangle },
} as const;

export default async function DqDashboardPage() {
  const ctx = await getSimForCurrentUser();
  if (!ctx) redirect("/login");
  const { dq } = ctx.sim;

  const maxAging = Math.max(...dq.ownerAging.map((b) => b.count), 1);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboards"
        className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboards
      </Link>

      <header>
        <h1 className="font-display text-3xl text-white">
          <Term k="dq">DQ</Term> Health
        </h1>
        <p className="mt-1 text-slate-400">
          So what: which breaches threaten filing-critical report inputs, who owns them, and are
          they aging past SLA?
        </p>
      </header>

      {/* severity totals — status colors with icon + label + count, never color alone */}
      <div className="grid gap-4 sm:grid-cols-3">
        {dq.severityTotals.map(({ severity, count }) => {
          const meta = SEVERITY_META[severity];
          return (
            <div
              key={severity}
              className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4"
            >
              <meta.Icon className="h-6 w-6 shrink-0" style={{ color: meta.color }} />
              <div>
                <p className="text-2xl font-semibold text-white tabular-nums">{count}</p>
                <p className="text-xs text-slate-400">{meta.label} breaches open</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rule executions by capability</CardTitle>
            <CardDescription>Active rules and this quarter&apos;s execution volume</CardDescription>
          </CardHeader>
          <CardContent>
            <StatBars
              rows={dq.byCapability.map((c) => ({
                key: c.capability,
                label: c.label,
                value: c.executions,
                display: c.executions.toLocaleString("en-US"),
                detail: `${c.rules} active rules · ${c.passRate}% pass rate`,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Owner aging & remediation SLA</CardTitle>
            <CardDescription>Open breach items by days with the assigned owner</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dq.ownerAging.map((b) => (
                <div key={b.bucket} className="grid grid-cols-[90px_1fr_40px] items-center gap-3">
                  <span className="text-xs text-slate-300">{b.bucket}</span>
                  <div className="h-3 overflow-hidden rounded-sm bg-slate-800/80">
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width: `${(b.count / maxAging) * 100}%`,
                        backgroundColor:
                          b.bucket === "15+ days" ? CHART.status.serious : CHART.series[0],
                      }}
                    />
                  </div>
                  <span className="text-right text-xs tabular-nums text-slate-400">
                    {b.count}
                    {b.bucket === "15+ days" && b.count > 0 ? " ⚠" : ""}
                  </span>
                </div>
              ))}
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-800 pt-4 text-center">
              <div>
                <dt className="text-xs text-slate-500">SLA compliance</dt>
                <dd className="mt-0.5 text-lg font-semibold text-white tabular-nums">
                  {dq.slaCompliancePct}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Median triage</dt>
                <dd className="mt-0.5 text-lg font-semibold text-white tabular-nums">
                  {dq.medianTriageHours}h
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Median resolve</dt>
                <dd className="mt-0.5 text-lg font-semibold text-white tabular-nums">
                  {dq.medianResolveDays}d
                </dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 className="h-3.5 w-3.5" /> Items in the 15+ day bucket escalate to the domain
              steward lead automatically.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report inputs at risk</CardTitle>
          <CardDescription>
            Filing- and close-critical report inputs with open breaches, oldest first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Report input</th>
                  <th className="py-2 pr-4 font-medium">Severity</th>
                  <th className="py-2 pr-4 font-medium">Open breaches</th>
                  <th className="py-2 pr-4 font-medium">Days open</th>
                  <th className="py-2 font-medium">Owner</th>
                </tr>
              </thead>
              <tbody>
                {dq.reportInputsAtRisk.map((r) => {
                  const meta = SEVERITY_META[r.severity];
                  return (
                    <tr key={r.name} className="border-b border-slate-800/60">
                      <td className="py-2 pr-4 text-slate-200">{r.name}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: meta.color }}>
                          <meta.Icon className="h-3.5 w-3.5" /> {meta.label}
                        </span>
                      </td>
                      <td className="py-2 pr-4 tabular-nums text-slate-300">{r.openBreaches}</td>
                      <td className="py-2 pr-4 tabular-nums text-slate-300">{r.daysOpen}</td>
                      <td className="py-2 text-slate-400">{r.owner}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <SimulatedNote />
    </div>
  );
}
