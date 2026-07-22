import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { Bot, CircleCheck, CirclePause, ScrollText, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { agentSuggestions } from "@/db/schema";
import { contentStore } from "@/content/store";
import { Badge } from "@/components/ui/badge";
import { getWorkspaceForUser } from "@/sim/context";

export const metadata = { title: "Agent Workbench — Astra Velocity" };

const BENCH_MIN_DECISIONS = 5;
const BENCH_ACCEPTANCE_THRESHOLD = 0.6;

interface AgentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default async function AgentsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getWorkspaceForUser(session.user.id);

  const [agentElements, statRows] = await Promise.all([
    contentStore.elements().then((els) => els.filter((el) => el.type === "agent")),
    workspace
      ? db
          .select({
            agentKey: agentSuggestions.agentKey,
            status: agentSuggestions.status,
            n: count(),
          })
          .from(agentSuggestions)
          .where(eq(agentSuggestions.workspaceId, workspace.id))
          .groupBy(agentSuggestions.agentKey, agentSuggestions.status)
      : Promise.resolve([]),
  ]);

  const stats = new Map<string, AgentStats>();
  for (const row of statRows) {
    const s = stats.get(row.agentKey) ?? { total: 0, pending: 0, approved: 0, rejected: 0 };
    s.total += row.n;
    if (row.status === "pending") s.pending += row.n;
    else if (row.status === "rejected") s.rejected += row.n;
    else s.approved += row.n; // approved + edited both count as accepted
    stats.set(row.agentKey, s);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-slate-900 dark:text-white">Agent Workbench</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Six agent co-workers with defined drafts, human decision points, and measured leverage.
        </p>
      </header>

      {/* explainer strip */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-teal-500/30 bg-teal-500/5 px-5 py-3 text-sm text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Agents draft
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Stewards decide
        </span>
        <span className="flex items-center gap-2">
          <ScrollText className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Everything is logged
        </span>
        <span className="ml-auto text-xs text-slate-500">
          Acceptance below {Math.round(BENCH_ACCEPTANCE_THRESHOLD * 100)}% over ≥
          {BENCH_MIN_DECISIONS} decisions benches an agent to draft-only.
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {agentElements.map((agent) => {
          const s = stats.get(agent.key) ?? { total: 0, pending: 0, approved: 0, rejected: 0 };
          const decided = s.approved + s.rejected;
          const acceptance = decided > 0 ? s.approved / decided : null;
          const benched =
            decided >= BENCH_MIN_DECISIONS &&
            acceptance !== null &&
            acceptance < BENCH_ACCEPTANCE_THRESHOLD;

          return (
            <article key={agent.key} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
                    <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" /> {agent.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{agent.pitch}</p>
                </div>
                {/* status chip — icon + label, color never alone */}
                {benched ? (
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--status-serious) 15%, transparent)",
                      color: "var(--status-serious)",
                    }}
                  >
                    <CirclePause className="h-3.5 w-3.5" /> benched — draft-only
                  </span>
                ) : (
                  <span
                    className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--status-good) 15%, transparent)",
                      color: "var(--status-good)",
                    }}
                  >
                    <CircleCheck className="h-3.5 w-3.5" /> active
                  </span>
                )}
              </div>

              {agent.agentMeta && (
                <dl className="mt-4 space-y-2 text-xs">
                  <MetaRow label="Drafts" value={agent.agentMeta.drafts} />
                  <MetaRow label="You decide" value={agent.agentMeta.humanDecides} />
                  <MetaRow label="Measured by" value={agent.agentMeta.leverageMetric} />
                  <div>
                    <dt className="text-slate-500">Guardrails</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {agent.agentMeta.guardrails.map((g) => (
                        <Badge key={g} variant="outline" className="text-[11px] font-normal normal-case">
                          {g}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              )}

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 pt-3 text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">{s.total}</p>
                  <p className="text-xs text-slate-500">suggestions</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
                    {acceptance === null ? "—" : `${Math.round(acceptance * 100)}%`}
                  </p>
                  <p className="text-xs text-slate-500">acceptance ({decided} decided)</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">{s.pending}</p>
                  <p className="text-xs text-slate-500">pending review</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-600">
        Operational telemetry computed from this workspace&apos;s suggestion queue. Simulated
        telemetry — wire to live governance tooling via the API.
      </p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-600 dark:text-slate-300">{value}</dd>
    </div>
  );
}
