import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq, gte } from "drizzle-orm";
import { CheckCheck, Inbox, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { agentSuggestions } from "@/db/schema";
import { contentStore } from "@/content/store";
import { hasPermission } from "@/lib/roles";
import { getWorkspaceForUser } from "@/sim/context";
import { StewardQueue, type QueueAgent, type QueueSuggestion } from "./steward-queue";

export const metadata = { title: "Steward My Day — Astra Velocity" };

export default async function StewardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "steward.workqueue")) {
    return (
      <section className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">
        <ShieldCheck className="mx-auto h-8 w-8 text-slate-600" />
        <h1 className="mt-3 font-display text-2xl text-white">Steward Command Center</h1>
        <p className="mt-2 text-sm text-slate-400">
          The suggestion queue is a steward decision surface — your role ({session.user.role})
          does not carry the steward workqueue permission. Switch to a steward persona in a demo
          workspace, or ask an admin.
        </p>
      </section>
    );
  }

  const workspace = await getWorkspaceForUser(session.user.id);
  if (!workspace) redirect("/login");

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [pendingRows, statusCounts, todayCounts, agentElements] = await Promise.all([
    db
      .select()
      .from(agentSuggestions)
      .where(
        and(
          eq(agentSuggestions.workspaceId, workspace.id),
          eq(agentSuggestions.status, "pending"),
        ),
      )
      .orderBy(desc(agentSuggestions.createdAt)),
    db
      .select({ status: agentSuggestions.status, n: count() })
      .from(agentSuggestions)
      .where(eq(agentSuggestions.workspaceId, workspace.id))
      .groupBy(agentSuggestions.status),
    db
      .select({ n: count() })
      .from(agentSuggestions)
      .where(
        and(
          eq(agentSuggestions.workspaceId, workspace.id),
          gte(agentSuggestions.decidedAt, startOfToday),
        ),
      ),
    contentStore.elements().then((els) => els.filter((el) => el.type === "agent")),
  ]);

  const byStatus = new Map(statusCounts.map((r) => [r.status, r.n]));
  const approved = (byStatus.get("approved") ?? 0) + (byStatus.get("edited") ?? 0);
  const rejected = byStatus.get("rejected") ?? 0;
  const decided = approved + rejected;
  const acceptanceRate = decided > 0 ? approved / decided : null;

  const agents: QueueAgent[] = agentElements.map((el) => ({
    key: el.key,
    name: el.name,
    pitch: el.pitch,
  }));

  const suggestions: QueueSuggestion[] = pendingRows.map((row) => ({
    id: row.id,
    agentKey: row.agentKey,
    kind: row.kind,
    title: row.title,
    payload: row.payload as Record<string, unknown>,
    confidence: Number(row.confidence),
    createdAt: row.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Steward — My Day</h1>
          <p className="mt-1 text-slate-400">
            Agents draft, you decide. Every approval, edit, and rejection lands in the audit log.{" "}
            <Link href="/agents" className="text-teal-300 hover:text-teal-200">
              Agent Workbench →
            </Link>
          </p>
        </div>
        <div className="flex gap-3">
          <StatTile icon="inbox" label="Pending" value={String(suggestions.length)} />
          <StatTile icon="check" label="Decisions today" value={String(todayCounts[0]?.n ?? 0)} />
          <StatTile
            icon="shield"
            label="Acceptance rate"
            value={acceptanceRate === null ? "—" : `${Math.round(acceptanceRate * 100)}%`}
          />
        </div>
      </header>

      <StewardQueue suggestions={suggestions} agents={agents} />

      <p className="text-xs text-slate-600">
        Simulated telemetry — wire to live governance tooling via the API.
      </p>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = icon === "inbox" ? Inbox : icon === "check" ? CheckCheck : ShieldCheck;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <Icon className="h-4 w-4 text-teal-400" />
      <div>
        <p className="text-lg font-semibold leading-tight text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}
