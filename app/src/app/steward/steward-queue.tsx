"use client";

import { useMemo, useState, useTransition } from "react";
import { AlertTriangle, Bot, Check, Pencil, Play, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { isNextRedirect, toast } from "@/components/ui/toaster";
import { SUGGESTION_KIND_LABELS, type SuggestionKind } from "@/sim/generate-suggestions";
import { decideSuggestionAction, runAgentsAction } from "./actions";

export interface QueueAgent {
  key: string;
  name: string;
  pitch: string;
}

export interface QueueSuggestion {
  id: string;
  agentKey: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
  confidence: number;
  createdAt: string;
}

const KIND_VARIANT: Record<string, "accent" | "highlight" | "outline" | "default" | "success"> = {
  "glossary-term": "accent",
  "dq-rule": "success",
  classification: "highlight",
  "lineage-stitch": "outline",
  triage: "default",
  "drift-flag": "highlight",
};

export function StewardQueue({
  suggestions,
  agents,
}: {
  suggestions: QueueSuggestion[];
  agents: QueueAgent[];
}) {
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [running, startRun] = useTransition();
  const [, startDecision] = useTransition();
  // Optimistically hidden cards: removed on click, restored if the action fails.
  const [removedIds, setRemovedIds] = useState<ReadonlySet<string>>(new Set());

  const visible = suggestions.filter((s) => !removedIds.has(s.id));

  const agentByKey = useMemo(() => new Map(agents.map((a) => [a.key, a])), [agents]);
  const kinds = useMemo(
    () => [...new Set(suggestions.map((s) => s.kind))].sort(),
    [suggestions],
  );

  const filtered = visible.filter(
    (s) =>
      (agentFilter === "all" || s.agentKey === agentFilter) &&
      (kindFilter === "all" || s.kind === kindFilter),
  );

  /** Remove the card immediately, decide server-side, revert + toast on failure. */
  const decide = (s: QueueSuggestion, decision: "approve" | "reject", note?: string) => {
    setRemovedIds((prev) => new Set(prev).add(s.id));
    startDecision(async () => {
      const formData = new FormData();
      formData.set("suggestionId", s.id);
      formData.set("decision", decision);
      if (note) formData.set("note", note);
      try {
        await decideSuggestionAction(formData);
        toast(
          decision === "reject"
            ? "Rejected — logged to audit trail"
            : note
              ? "Approved with note — logged to audit trail"
              : "Approved — logged to audit trail",
          decision === "reject" ? "info" : "success",
        );
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        setRemovedIds((prev) => {
          const next = new Set(prev);
          next.delete(s.id);
          return next;
        });
        toast("Decision failed — the suggestion was restored to the queue.", "error");
      }
    });
  };

  const grouped = useMemo(() => {
    const map = new Map<string, QueueSuggestion[]>();
    for (const s of filtered) {
      const list = map.get(s.agentKey) ?? [];
      list.push(s);
      map.set(s.agentKey, list);
    }
    // Stable ordering: library agent order first, unknowns last.
    const order = agents.map((a) => a.key);
    return [...map.entries()].sort(
      (a, b) =>
        (order.indexOf(a[0]) + 1 || order.length + 1) -
        (order.indexOf(b[0]) + 1 || order.length + 1),
    );
  }, [filtered, agents]);

  const runAgents = () =>
    startRun(async () => {
      try {
        await runAgentsAction();
        toast("Agents finished drafting — fresh suggestions are in the queue.", "success");
      } catch (err) {
        if (isNextRedirect(err)) throw err;
        toast("Agent run failed — please try again.", "error");
      }
    });

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
        <Bot className="mx-auto h-8 w-8 text-slate-600" />
        <h2 className="mt-3 text-lg font-semibold text-white">The queue is clear</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
          Agent co-workers draft glossary terms, DQ rules, classifications, lineage stitches,
          triage bundles, and drift flags from the content library. Nothing publishes without a
          steward decision — run the agents to fill your morning queue.
        </p>
        <Button className="mt-4" onClick={runAgents} disabled={running}>
          <Play className="h-4 w-4" /> {running ? "Agents drafting…" : "Run agents"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Agent
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
          >
            <option value="all">All agents</option>
            {agents.map((a) => (
              <option key={a.key} value={a.key}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Kind
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-slate-200"
          >
            <option value="all">All kinds</option>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {SUGGESTION_KIND_LABELS[k as SuggestionKind] ?? k}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-slate-500">
          {filtered.length} of {visible.length} pending
        </span>
        <div className="ml-auto">
          <Button variant="secondary" size="sm" onClick={runAgents} disabled={running}>
            <Play className="h-3.5 w-3.5" /> {running ? "Agents drafting…" : "Run agents"}
          </Button>
        </div>
      </div>

      {grouped.map(([agentKey, items]) => {
        const agent = agentByKey.get(agentKey);
        return (
          <section key={agentKey}>
            <div className="mb-2 flex items-baseline gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Bot className="h-4 w-4 text-teal-400" /> {agent?.name ?? agentKey}
              </h2>
              <span className="text-xs text-slate-500">
                {items.length} pending{agent ? ` · ${agent.pitch}` : ""}
              </span>
            </div>
            <ul className="grid gap-3 lg:grid-cols-2">
              {items.map((s) => (
                <SuggestionCard
                  key={s.id}
                  suggestion={s}
                  onDecide={(decision, note) => decide(s, decision, note)}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function SuggestionCard({
  suggestion: s,
  onDecide,
}: {
  suggestion: QueueSuggestion;
  onDecide: (decision: "approve" | "reject", note?: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const lowConfidence = s.confidence < 0.7;
  const pct = Math.round(s.confidence * 100);

  return (
    <li className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={KIND_VARIANT[s.kind] ?? "default"}>
          {SUGGESTION_KIND_LABELS[s.kind as SuggestionKind] ?? s.kind}
        </Badge>
        <span className="text-xs text-slate-500">
          drafted {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
      <h3 className="mt-2 text-sm font-semibold text-white">{s.title}</h3>

      <div className="mt-2 flex-1">
        <PayloadView kind={s.kind} payload={s.payload} />
      </div>

      {/* confidence bar — amber below 0.7, with an explicit label (never color alone) */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Confidence</span>
          <span className={lowConfidence ? "flex items-center gap-1 text-amber-300" : "text-slate-400"}>
            {lowConfidence && <AlertTriangle className="h-3 w-3" />}
            {pct}%{lowConfidence ? " — needs closer review" : ""}
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full ${lowConfidence ? "bg-amber-400" : "bg-teal-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 border-t border-slate-800 pt-3">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const note = String(new FormData(e.currentTarget).get("note") ?? "").trim();
              onDecide("approve", note || undefined);
            }}
            className="space-y-2"
          >
            <textarea
              name="note"
              rows={2}
              required
              placeholder="Steward note — what you changed or verified before approving…"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm">
                <Check className="h-3.5 w-3.5" /> Approve with note
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => onDecide("approve")}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit note + approve
            </Button>
            <ConfirmButton
              type="button"
              variant="ghost"
              size="sm"
              className="text-slate-400"
              prompt="Reject this suggestion?"
              confirmLabel="Reject"
              onConfirm={() => onDecide("reject")}
            >
              <X className="h-3.5 w-3.5" /> Reject
            </ConfirmButton>
          </div>
        )}
      </div>
    </li>
  );
}

function PayloadView({ kind, payload }: { kind: string; payload: Record<string, unknown> }) {
  const str = (k: string) => (typeof payload[k] === "string" ? (payload[k] as string) : null);

  if (kind === "glossary-term") {
    return (
      <div className="space-y-1 text-xs">
        <p className="font-medium text-teal-300">{str("term")}</p>
        <p className="text-slate-300">{str("definition")}</p>
        {str("evidence") && <p className="text-slate-500">Evidence: {str("evidence")}</p>}
      </div>
    );
  }
  if (kind === "dq-rule") {
    return (
      <div className="space-y-1.5 text-xs">
        <pre className="overflow-x-auto rounded-lg bg-slate-950/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-teal-200">
          {str("ruleKey")}: {str("expression")}
        </pre>
        <p className="text-slate-400">
          {str("obligation") ? `Protects: ${str("obligation")}` : null}
        </p>
        {str("evidence") && <p className="text-slate-500">Evidence: {str("evidence")}</p>}
      </div>
    );
  }
  if (kind === "classification") {
    const chain = Array.isArray(payload.chain) ? (payload.chain as string[]) : [];
    return (
      <div className="space-y-1.5 text-xs">
        <p className="font-mono text-[11px] text-slate-300">
          {str("attribute")} <span className="text-slate-600">·</span> {str("dataset")}
        </p>
        <p className="flex flex-wrap items-center gap-1">
          {chain.map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-amber-200">{c}</span>
              {i < chain.length - 1 && <span className="text-slate-600">→</span>}
            </span>
          ))}
          {payload.cdeCandidate === true && (
            <span className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[11px] text-teal-300">CDE candidate</span>
          )}
        </p>
        {str("rationale") && <p className="text-slate-500">{str("rationale")}</p>}
      </div>
    );
  }
  if (kind === "lineage-stitch") {
    return (
      <div className="space-y-1.5 text-xs">
        <p className="font-mono text-[11px] text-slate-300">
          {str("source")} <span className="text-teal-400">→</span> {str("target")}
        </p>
        <p className="text-slate-400">{str("method")}</p>
        {str("coverageGain") && <p className="text-slate-500">{str("coverageGain")}</p>}
      </div>
    );
  }
  if (kind === "triage") {
    const alerts = Array.isArray(payload.alerts)
      ? (payload.alerts as Array<{ alert?: string; severity?: string }>)
      : [];
    return (
      <div className="space-y-1.5 text-xs">
        <ul className="space-y-1">
          {alerts.map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-slate-300">
              <AlertTriangle
                className={`mt-0.5 h-3 w-3 shrink-0 ${
                  a.severity === "critical"
                    ? "text-red-400"
                    : a.severity === "serious"
                      ? "text-orange-400"
                      : "text-amber-300"
                }`}
              />
              <span>
                {a.alert} <span className="text-slate-500">({a.severity})</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="text-slate-400">
          Owner: <span className="text-slate-200">{str("proposedOwner")}</span> · {str("priority")} · due in{" "}
          {String(payload.dueInDays ?? "—")}d
        </p>
        {str("rationale") && <p className="text-slate-500">{str("rationale")}</p>}
      </div>
    );
  }
  if (kind === "drift-flag") {
    return (
      <div className="space-y-1 text-xs">
        <p className="text-slate-400">
          <span className="text-slate-500">Standard:</span> {str("standard")}
        </p>
        <p className="text-slate-400">
          <span className="text-slate-500">Deployed:</span> {str("deployed")}
        </p>
        {str("proposedRoute") && <p className="text-slate-500">Route: {str("proposedRoute")}</p>}
      </div>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-lg bg-slate-950/70 px-3 py-2 font-mono text-[11px] text-slate-300">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}
