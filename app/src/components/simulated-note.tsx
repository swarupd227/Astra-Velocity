"use client";

import { Info, X } from "lucide-react";
import { useDismissable } from "@/lib/use-dismissable";

/**
 * Single slim, dismissible "simulated telemetry" banner shared by the live
 * dashboard pages and the steward queue. Dismissed once, hidden everywhere —
 * it is one fact about the demo, not five separate footnotes.
 */

export function SimulatedNote() {
  const { dismissed, dismiss } = useDismissable("astra-simulated-note");

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-xs text-slate-400">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
      <p className="flex-1 leading-relaxed">
        Simulated telemetry — figures on this page are generated demo data. Wire to live
        governance tooling via the API.
      </p>
      <button
        type="button"
        aria-label="Dismiss simulated telemetry note"
        onClick={dismiss}
        className="rounded p-0.5 text-slate-500 transition hover:text-slate-300"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}
