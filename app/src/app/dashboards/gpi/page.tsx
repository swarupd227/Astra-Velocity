import { redirect } from "next/navigation";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-white">GPI Portfolio</h1>
        <p className="mt-1 text-slate-400">
          So what: is the portfolio on trajectory to {portfolio.burnUpTarget} governed data
          products by Q4-28 — and which products are stalling?
        </p>
      </header>

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
                <tr className="border-b border-slate-800 text-left text-xs text-slate-500">
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
                    <tr key={p.key} className="border-b border-slate-800/60">
                      <td className="py-2 pr-4 text-slate-200">
                        {p.name}
                        {p.atTarget && (
                          <Badge variant="accent" className="ml-2 text-[10px]">
                            at target
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-slate-400">Wave {p.wave}</td>
                      <td className="py-2 pr-4 text-slate-500">{p.domain}</td>
                      <td className="py-2 pr-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: sequentialColor(p.currentGpi / 100) }}
                            aria-hidden="true"
                          />
                          <span className="tabular-nums text-slate-200">{p.currentGpi}</span>
                        </span>
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs tabular-nums ${
                            delta > 0.5
                              ? "text-teal-300"
                              : delta < -0.5
                                ? "text-amber-300"
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

      <p className="text-xs text-slate-600">
        Simulated telemetry — wire to live governance tooling via the API.
      </p>
    </div>
  );
}
