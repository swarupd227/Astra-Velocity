"use client";

import { useState } from "react";
import type { Sector } from "@/content/types";

/**
 * The sector value chain as an interactive ribbon of stages. Selecting a stage
 * reveals its data domains and pain points — the "insurance-domain-rich"
 * centerpiece used by the Landscape Explorer. Diagram, not a data chart.
 */
export function ValueChainRibbon({
  sector,
  onSelectStage,
}: {
  sector: Sector;
  onSelectStage?: (stageKey: string) => void;
}) {
  const [active, setActive] = useState<string | null>(null);
  const stage = sector.valueChain.find((s) => s.key === active) ?? null;

  return (
    <div>
      <div className="flex flex-wrap items-stretch gap-1.5">
        {sector.valueChain.map((s, i) => {
          const isActive = s.key === active;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => {
                setActive(isActive ? null : s.key);
                onSelectStage?.(s.key);
              }}
              className={`relative flex min-w-28 flex-1 items-center justify-center px-3 py-2.5 text-xs font-medium transition
                ${isActive ? "bg-teal-500 text-slate-950" : "bg-slate-200 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700"}
                ${i === 0 ? "rounded-l-lg" : ""} ${i === sector.valueChain.length - 1 ? "rounded-r-lg" : ""}`}
              style={{
                clipPath:
                  i === sector.valueChain.length - 1
                    ? undefined
                    : "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
              }}
              aria-pressed={isActive}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      {stage && (
        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{stage.name}</h4>
            <div className="flex flex-wrap gap-1.5">
              {stage.dataDomains.map((d) => (
                <span key={d} className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[11px] text-teal-700 dark:text-teal-300">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{stage.description}</p>
          <ul className="mt-3 space-y-1">
            {stage.painPoints.map((p) => (
              <li key={p} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 text-amber-600 dark:text-amber-400">▸</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
