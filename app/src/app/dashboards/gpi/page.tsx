import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationNote } from "@/components/integration-note";
import { SimulatedNote } from "@/components/simulated-note";
import { Term } from "@/components/term";
import { BurnUp } from "@/components/viz/burn-up";
import { StatBars } from "@/components/viz/stat-bars";
import { sequentialColor } from "@/components/viz/tokens";
import { getSimForCurrentUser } from "@/sim/context";

export const metadata = { title: "GPI Portfolio — Astra Velocity" };

export default async function GpiDashboardPage() {
  const ctx = await getSimForCurrentUser();
  if (!ctx) redirect("/login");
  const { portfolio } = ctx.sim;

  const products = [...portfolio.products].sort((a, b) => b.currentGpi - a.currentGpi);

  // Scale mechanics: products per wave from the sim portfolio, plus what remains
  // of the full portfolio beyond the currently tracked products.
  const waveCounts = ([1, 2, 3] as const).map((w) => ({
    wave: w,
    n: portfolio.products.filter((p) => p.wave === w).length,
  }));
  const remainingPortfolio = Math.max(portfolio.burnUpTarget - portfolio.products.length, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboards"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Dashboards
      </Link>

      <header>
        <h1 className="font-display text-3xl text-slate-900 dark:text-white">
          <Term k="gpi">GPI</Term> Portfolio
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          So what: is the portfolio on trajectory to {portfolio.burnUpTarget} governed data
          products by Q4-28 — and which products are stalling?
        </p>
      </header>

      <IntegrationNote
        title={`The path to ${portfolio.burnUpTarget}`}
        body="Scale is wave-based: governance patterns proven in early products compound, and each system archetype solved once makes every later product on that archetype cheaper to govern. Waves 1–2 buy the patterns; the rest of the portfolio rides them."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Products at target maturity</CardTitle>
            <CardDescription>
              Actuals through Q2-27, projection to the {portfolio.burnUpTarget}-product goal.
              {ctx.projectName ? ` Seeded from project “${ctx.projectName}”.` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BurnUp
              points={portfolio.burnUp}
              target={portfolio.burnUpTarget}
              targetLabel="Goal"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capability coverage</CardTitle>
            <CardDescription>Share of products governed per capability</CardDescription>
          </CardHeader>
          <CardContent>
            <StatBars
              maxValue={100}
              rows={portfolio.capabilityCoverage.map((c) => ({
                key: c.capability,
                label: c.label,
                value: c.coveredPct,
                display: `${c.coveredPct}%`,
                detail: "Products with this capability at or above gate criteria",
              }))}
            />
            <p className="mt-4 text-xs text-slate-500">
              {portfolio.atTargetNow} of {portfolio.products.length} tracked products at target
              maturity (GPI ≥ {portfolio.targetMaturityGpi}) this quarter.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scale mechanics</CardTitle>
          <CardDescription>How a {portfolio.products.length}-product beachhead becomes a {portfolio.burnUpTarget}-product portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="flex flex-wrap items-center gap-y-1.5">
            {waveCounts.map(({ wave, n }) => (
              <span key={wave} className="flex items-center">
                <span className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs text-teal-800 dark:text-teal-200">
                  Wave {wave}: <span className="font-semibold tabular-nums">{n}</span> products
                </span>
                <span className="mx-1.5 text-slate-400 dark:text-slate-600" aria-hidden>
                  →
                </span>
              </span>
            ))}
            <span className="rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
              Remaining portfolio: <span className="font-semibold tabular-nums">{remainingPortfolio}</span>
            </span>
          </p>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Each wave reuses the prior wave&apos;s patterns via governance-as-code — that
            compounding is what reaches {portfolio.burnUpTarget} by Q4-28.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product GPI — current quarter</CardTitle>
          <CardDescription>
            Composite Governance Performance Index per data product (0–100), with
            quarter-over-quarter movement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Data product</th>
                  <th className="py-2 pr-4 font-medium">Wave</th>
                  <th className="py-2 pr-4 font-medium">Domain</th>
                  <th className="py-2 pr-4 font-medium">GPI</th>
                  <th className="py-2 font-medium">QoQ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const delta = Math.round((p.currentGpi - p.previousGpi) * 10) / 10;
                  return (
                    <tr key={p.key} className="border-b border-slate-200/70 dark:border-slate-800/60">
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-200">
                        {p.name}
                        {p.atTarget && (
                          <Badge variant="accent" className="ml-2 text-[10px]">
                            at target
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-slate-500 dark:text-slate-400">Wave {p.wave}</td>
                      <td className="py-2 pr-4 text-slate-500">{p.domain}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: sequentialColor(p.currentGpi / 100) }}
                            aria-hidden="true"
                          />
                          <span className="tabular-nums text-slate-700 dark:text-slate-200">{p.currentGpi}</span>
                        </span>
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs tabular-nums ${
                            delta > 0.5
                              ? "text-teal-700 dark:text-teal-300"
                              : delta < -0.5
                                ? "text-amber-700 dark:text-amber-300"
                                : "text-slate-500"
                          }`}
                        >
                          {delta > 0.5 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : delta < -0.5 ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </td>
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
