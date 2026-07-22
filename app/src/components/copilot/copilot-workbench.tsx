"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/cn";

/**
 * Client workbench for the Governance Copilot: a Library Q&A chat and a
 * "Compose from a brief" flow. Finished turns persist to localStorage so a
 * reload keeps the working context; the server keeps the audit trail in
 * ai_calls.
 */

const QA_STORAGE_KEY = "copilot-history:qa";
const COMPOSE_STORAGE_KEY = "copilot-history:compose";

interface Citation {
  kind: string;
  key: string;
  name: string;
}

interface QaTurn {
  question: string;
  answer?: string;
  citations?: Citation[];
  degraded?: boolean;
  error?: string;
  pending?: boolean;
}

interface ComposeResult {
  needsClarification?: boolean;
  message?: string;
  sectorKey?: string;
  sectorName?: string;
  scenarioKey?: string;
  scenarioName?: string;
  rationale?: string;
  suggestedElements?: { key: string; name: string }[];
  composerHref?: string;
  degraded?: boolean;
  error?: string;
}

function readStorage<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — history is session-only, which is fine
  }
}

function clearStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function citationHref(citation: Citation): string {
  return citation.kind === "best-practice" ? "/practices" : "/library";
}

function GuardrailStrip() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
      <ShieldCheck className="h-3.5 w-3.5 text-teal-500/70" />
      <span>Guardrails active: PII redaction · grounded citations · audit logged</span>
    </div>
  );
}

function DegradedBanner() {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
      Offline demo mode — no model provider reachable, so the built-in mock answered. Responses
      are deterministic and still grounded in the published library.
    </div>
  );
}

/** "Label… 4s" — animated ellipsis plus a live elapsed-seconds counter. */
function PendingLabel({ label }: { label: string }) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = window.setInterval(
      () => setSeconds(Math.floor((Date.now() - started) / 1000)),
      500,
    );
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="inline-flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>
        <span className="animated-ellipsis">{label}</span>
        {seconds > 0 && <span className="tabular-nums"> {seconds}s</span>}
      </span>
    </span>
  );
}

function ClearHistoryButton({ onClear }: { onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300"
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Clear history
    </button>
  );
}

function CitationChips({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {citations.map((c) => (
        <Link key={`${c.kind}:${c.key}`} href={citationHref(c)}>
          <Badge variant="accent" className="cursor-pointer hover:bg-teal-500/25">
            {c.kind === "best-practice" ? "practice" : c.kind} · {c.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Library Q&A tab
// ---------------------------------------------------------------------------

function LibraryQaTab() {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<QaTurn[]>([]);
  const busy = turns.some((t) => t.pending);
  const hydratedRef = useRef(false);

  // Restore finished turns once on mount; persist on every settled change.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = readStorage<QaTurn[]>(QA_STORAGE_KEY);
    if (!Array.isArray(saved) || saved.length === 0) return;
    // Deferred so the restore lands after first paint instead of forcing a
    // synchronous cascading render inside the effect.
    const id = window.setTimeout(
      () => setTurns(saved.filter((t) => typeof t?.question === "string" && !t.pending)),
      0,
    );
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || busy) return;
    if (turns.length > 0) writeStorage(QA_STORAGE_KEY, turns);
  }, [turns, busy]);

  function clearHistory() {
    setTurns([]);
    clearStorage(QA_STORAGE_KEY);
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3 || busy) return;
    setQuestion("");
    setTurns((prev) => [...prev, { question: q, pending: true }]);

    try {
      const res = await fetch("/api/ai/library-qa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1
            ? res.ok
              ? {
                  question: q,
                  answer: data.answer,
                  citations: data.citations ?? [],
                  degraded: data.degraded,
                }
              : { question: q, error: data.error ?? "The copilot hit an error." }
            : t,
        ),
      );
    } catch {
      setTurns((prev) =>
        prev.map((t, i) =>
          i === prev.length - 1 ? { question: q, error: "Network error — try again." } : t,
        ),
      );
    }
  }

  return (
    <div className="space-y-4">
      {turns.length === 0 && (
        <Card>
          <CardContent className="pt-5 text-sm text-slate-500 dark:text-slate-400">
            Ask anything the published library can answer — obligations by sector, what a
            velocity pack contains, which best practice covers claims reserving data quality.
            If it isn&apos;t in the library, the copilot says so instead of guessing.
          </CardContent>
        </Card>
      )}

      {turns.length > 0 && (
        <div className="flex justify-end">
          <ClearHistoryButton onClear={clearHistory} />
        </div>
      )}

      <div className="space-y-3">
        {turns.map((turn, i) => (
          <div key={i} className="space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-teal-500/15 px-4 py-2.5 text-sm text-teal-900 dark:text-teal-100">
                {turn.question}
              </div>
            </div>
            <div className="flex justify-start">
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl rounded-bl-sm border px-4 py-3 text-sm",
                  turn.error
                    ? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 text-slate-700 dark:text-slate-200",
                )}
              >
                {turn.pending ? (
                  <span className="text-slate-500 dark:text-slate-400">
                    <PendingLabel label="Consulting the library" />
                  </span>
                ) : turn.error ? (
                  turn.error
                ) : (
                  <>
                    {turn.degraded && (
                      <div className="mb-2">
                        <DegradedBanner />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{turn.answer}</p>
                    <CitationChips citations={turn.citations ?? []} />
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={ask} className="space-y-1.5">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Which obligations apply to life & annuities reserving data?"
            aria-label="Ask the library"
          />
          <Button type="submit" disabled={busy || question.trim().length < 3}>
            Ask
          </Button>
        </div>
        {!busy && question.trim().length < 3 && (
          <p className="text-xs text-slate-400 dark:text-slate-600">type at least 3 characters</p>
        )}
      </form>
      <GuardrailStrip />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compose-from-a-brief tab
// ---------------------------------------------------------------------------

function ComposeTab() {
  const [brief, setBrief] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ComposeResult | null>(null);
  const hydratedRef = useRef(false);

  // Restore the last compose exchange once on mount; persist on settle.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = readStorage<{ brief?: string; result?: ComposeResult }>(COMPOSE_STORAGE_KEY);
    if (!saved?.result) return;
    // Deferred so the restore lands after first paint instead of forcing a
    // synchronous cascading render inside the effect.
    const id = window.setTimeout(() => {
      setResult(saved.result ?? null);
      if (typeof saved.brief === "string") setBrief(saved.brief);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  function clearHistory() {
    setResult(null);
    setBrief("");
    clearStorage(COMPOSE_STORAGE_KEY);
  }

  async function compose(e: React.FormEvent) {
    e.preventDefault();
    if (pending || brief.trim().length < 20) return;
    setPending(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/compose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: brief.trim() }),
      });
      const data = await res.json();
      const next: ComposeResult = res.ok
        ? data
        : { error: data.error ?? "The copilot hit an error." };
      setResult(next);
      if (!next.error) writeStorage(COMPOSE_STORAGE_KEY, { brief: brief.trim(), result: next });
    } catch {
      setResult({ error: "Network error — try again." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Compose from a brief
            </span>
            {result && !pending && <ClearHistoryButton onClear={clearHistory} />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={compose} className="space-y-3">
            <Textarea
              rows={5}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="Describe the client situation — e.g. 'Mid-size commercial P&C carrier, state exams flagged Schedule P restatements, finance can't reconcile earned premium between the ledger and the actuarial data mart…'"
              aria-label="Client brief"
            />
            <div className="flex items-center justify-between gap-3">
              <GuardrailStrip />
              <Button type="submit" disabled={pending || brief.trim().length < 20}>
                {pending ? <PendingLabel label="Composing" /> : "Shape the engagement"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result?.error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-200">
          {result.error}
        </div>
      )}

      {result?.needsClarification && (
        <Card>
          <CardContent className="pt-5">
            {result.degraded && (
              <div className="mb-3">
                <DegradedBanner />
              </div>
            )}
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">Needs a sharper brief</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.message}</p>
          </CardContent>
        </Card>
      )}

      {result && !result.error && !result.needsClarification && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.sectorName} <span className="text-slate-500">×</span> {result.scenarioName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.degraded && <DegradedBanner />}
            <p className="text-sm text-slate-600 dark:text-slate-300">{result.rationale}</p>
            {(result.suggestedElements?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Suggested library elements
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.suggestedElements!.map((el) => (
                    <Badge key={el.key} variant="outline">
                      {el.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {result.composerHref && (
              <Link
                href={result.composerHref}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Open in Composer <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workbench shell
// ---------------------------------------------------------------------------

export function CopilotWorkbench() {
  const [tab, setTab] = useState<"qa" | "compose">("qa");

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-1">
        <button
          type="button"
          onClick={() => setTab("qa")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition",
            tab === "qa" ? "bg-teal-500 font-semibold text-slate-950" : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <BookOpenCheck className="h-4 w-4" /> Ask the Library
        </button>
        <button
          type="button"
          onClick={() => setTab("compose")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition",
            tab === "compose"
              ? "bg-teal-500 font-semibold text-slate-950"
              : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white",
          )}
        >
          <Sparkles className="h-4 w-4" /> Compose from a brief
        </button>
      </div>

      {tab === "qa" ? <LibraryQaTab /> : <ComposeTab />}
    </div>
  );
}
