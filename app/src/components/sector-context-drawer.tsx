"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Kpi, Obligation, Sector } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { ValueChainRibbon } from "@/components/viz/value-chain-ribbon";

/** One sector's full business context — the same shape /explore renders per-sector. */
export interface SectorContextData {
  sector: Sector;
  obligations: Obligation[];
  kpis: Kpi[];
}

/**
 * Right-side slide-over surfacing one sector's business context (narrative,
 * value chain, obligations, KPIs, signature pain points) on demand, relocated
 * from the standalone /explore page to wherever sector choice actually
 * happens. Mirrors the mobile-nav drawer pattern: backdrop + Escape + body
 * scroll lock, slides in from the right instead of the left. Purely
 * presentational — open/close state lives in the caller.
 */
export function SectorContextDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: SectorContextData | null;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !data) return null;
  const { sector, obligations, kpis } = data;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${sector.name} business context`}
        className="drawer-in-right absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-300 dark:shadow-slate-950"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400">
              {sector.tagline}
            </span>
            <h2 className="font-display text-xl text-slate-900 dark:text-white">{sector.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close business context"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Sector narrative */}
          <div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{sector.narrative}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Distribution model
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sector.distributionModel}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  System archetypes
                </h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {sector.systemArchetypes.map((a) => (
                    <Badge key={a} variant="outline">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Value chain */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Value chain — select a stage to see its data domains and pain points
            </h3>
            <div className="mt-2">
              <ValueChainRibbon sector={sector} />
            </div>
          </div>

          {/* Regulatory obligations (compact) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Regulatory obligations
            </h3>
            <div className="mt-2 space-y-3">
              {obligations.map((o) => (
                <div
                  key={o.key}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3.5"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{o.name}</h4>
                    <span className="text-xs text-teal-600 dark:text-teal-400">{o.authority}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-500">Evidence expected: </span>
                    {o.evidenceExpectations[0]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs (compact) */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              KPIs that live or die on data
            </h3>
            <div className="mt-2 space-y-3">
              {kpis.map((k) => (
                <div
                  key={k.key}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3.5"
                >
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{k.name}</h4>
                  <p className="mt-1 font-mono text-xs text-teal-700 dark:text-teal-300">{k.formula}</p>
                  {k.cdeHints[0] && (
                    <span className="mt-2 inline-block rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                      {k.cdeHints[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Signature pain points */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signature pain points
            </h3>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {sector.signaturePainPoints.map((p) => (
                <li key={p} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">▸</span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
