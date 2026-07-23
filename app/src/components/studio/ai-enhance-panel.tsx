"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { ContentKind } from "@/content/types";

/**
 * AI Enhance — sits BESIDE the manual JSON editor in Library Studio, never
 * inside it. It only ever proposes a full revised payload; applying a
 * suggestion just fills the parent's own manual-editor state, so the
 * existing save/publish path (and its Zod validation) is the only way
 * anything reaches the database. This component never saves or publishes.
 */

const MIN_INSTRUCTION_LENGTH = 8;

interface StudioEnhanceResponse {
  suggestedPayload?: unknown;
  degraded?: boolean;
  callId?: string | null;
  error?: string;
  detail?: string;
  killed?: boolean;
}

/** "Label… 4s" — animated ellipsis plus a live elapsed-seconds counter (mirrors CopilotWorkbench's PendingLabel). */
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

/** Top-level keys whose value differs between the current and suggested payloads. */
function changedTopLevelKeys(before: unknown, after: unknown): string[] {
  if (!before || typeof before !== "object" || !after || typeof after !== "object") return [];
  const b = before as Record<string, unknown>;
  const a = after as Record<string, unknown>;
  const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  return keys.filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k]));
}

export function AiEnhancePanel({
  kind,
  kindLabel,
  currentPayloadText,
  onApply,
}: {
  kind: ContentKind;
  kindLabel: string;
  /** Raw JSON text of the payload as it currently stands in the manual editor. Parsed best-effort here. */
  currentPayloadText: string;
  /** Called with the accepted suggestion — the parent fills its own manual editor state. Never saves/publishes. */
  onApply: (payload: unknown) => void;
}) {
  const [instruction, setInstruction] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ payload: unknown; degraded: boolean } | null>(
    null,
  );

  let currentPayload: unknown = undefined;
  let payloadInvalidReason: string | null = null;
  try {
    currentPayload = JSON.parse(currentPayloadText);
  } catch (err) {
    payloadInvalidReason = `Current payload isn't valid JSON (${err instanceof Error ? err.message : String(err)}) — fix it in the editor before using AI Enhance.`;
  }

  const instructionTooShort = instruction.trim().length < MIN_INSTRUCTION_LENGTH;
  const disabled = pending || instructionTooShort || payloadInvalidReason !== null;

  async function enhance(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setPending(true);
    setError(null);
    setSuggestion(null);
    try {
      const res = await fetch("/api/ai/studio-enhance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, currentPayload, instruction: instruction.trim() }),
      });
      const data = (await res.json()) as StudioEnhanceResponse;
      if (!res.ok || data.suggestedPayload === undefined) {
        setError(data.error ?? "The assistant could not produce a suggestion.");
        return;
      }
      setSuggestion({ payload: data.suggestedPayload, degraded: Boolean(data.degraded) });
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(false);
    }
  }

  function discard() {
    setSuggestion(null);
  }

  function apply() {
    if (!suggestion) return;
    onApply(suggestion.payload);
    setSuggestion(null);
  }

  const changedKeys = suggestion ? changedTopLevelKeys(currentPayload, suggestion.payload) : [];

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400" /> AI Enhance
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Describe a change to the {kindLabel} payload. The assistant drafts a full suggestion —
        nothing is applied or saved until you accept it.
      </p>

      <form onSubmit={enhance} className="mt-3 space-y-1.5">
        <Textarea
          rows={3}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder='e.g. "Add another glossary term for reinsurance cession" or "Tighten the pitch to be more concrete"'
          aria-label="AI Enhance instruction"
          disabled={pending}
        />
        <div className="flex items-center justify-between gap-3">
          {payloadInvalidReason ? (
            <p className="text-xs text-amber-600 dark:text-amber-400">{payloadInvalidReason}</p>
          ) : instructionTooShort ? (
            <p className="text-xs text-slate-400 dark:text-slate-600">
              describe the change in at least {MIN_INSTRUCTION_LENGTH} characters
            </p>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm" disabled={disabled}>
            {pending ? <PendingLabel label="Enhancing" /> : "Enhance with AI"}
          </Button>
        </div>
      </form>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {suggestion && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested payload
            </p>
            {suggestion.degraded && (
              <Badge variant="highlight">degraded — mock suggestion</Badge>
            )}
            {changedKeys.length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {changedKeys.map((k) => (
                  <Badge key={k} variant="accent">
                    {k}
                  </Badge>
                ))}
              </span>
            )}
          </div>
          <pre className="max-h-[360px] overflow-auto rounded-xl bg-slate-100 dark:bg-slate-950/70 p-3 font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {JSON.stringify(suggestion.payload, null, 2)}
          </pre>
          <div className="flex items-center gap-3">
            <Button type="button" size="sm" onClick={apply}>
              Apply to draft
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={discard}>
              Discard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
