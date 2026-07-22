"use client";

import { useState } from "react";
import type { CoverageReport } from "@/engine/recommend";
import { CHART } from "./tokens";

/**
 * Capability coverage: one row per capability, bar = coverage %, right rail
 * shows the scenario's emphasis (●●● = where the scenario concentrates).
 * Emphasized-but-uncovered rows surface as gaps in warning color.
 */
export function CoverageBars({ report }: { report: CoverageReport }) {
  const [hoverCap, setHoverCap] = useState<string | null>(null);
  const rows = Object.entries(report.byCapability).sort(
    (a, b) => b[1].emphasis - a[1].emphasis || b[1].covered - a[1].covered,
  );

  return (
    // Chart internals are dark-optimized (validated palette) — in light theme
    // the chart keeps its own dark panel; in dark theme the panel disappears.
    <div className="space-y-2 rounded-xl bg-[#0d1424] p-4 dark:bg-transparent dark:p-0">
      {rows.map(([cap, { emphasis, covered, label }]) => {
        const isGap = emphasis > 0 && covered === 0;
        const barColor = isGap ? CHART.status.warning : CHART.series[0];
        return (
          <div
            key={cap}
            className="group relative grid grid-cols-[130px_1fr_64px] items-center gap-3"
            onMouseEnter={() => setHoverCap(cap)}
            onMouseLeave={() => setHoverCap(null)}
          >
            <span className={`truncate text-xs ${emphasis > 0 ? "text-slate-200" : "text-slate-500"}`}>
              {label}
            </span>
            <div className="h-3 overflow-hidden rounded-sm bg-slate-800/80">
              <div
                className="h-full rounded-sm transition-all"
                style={{ width: `${covered}%`, backgroundColor: barColor, opacity: emphasis > 0 ? 1 : 0.45 }}
              />
            </div>
            <span className="text-right text-xs tabular-nums text-slate-400">
              {isGap ? "gap" : `${covered}%`}{" "}
              <span className="text-teal-500">{"●".repeat(emphasis)}</span>
            </span>

            {hoverCap === cap && (
              <div className="pointer-events-none absolute left-32 top-5 z-10 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
                <p className="font-semibold text-white">{label}</p>
                <p className="text-slate-300">Coverage {covered}% · scenario emphasis {emphasis}/3</p>
                {isGap && <p className="text-amber-300">Emphasized by this scenario but not covered yet</p>}
              </div>
            )}
          </div>
        );
      })}
      <p className="pt-1 text-xs text-slate-500">
        Overall weighted coverage <span className="font-semibold text-slate-200">{report.overall}%</span>
        {report.gaps.length > 0 && (
          <span className="text-amber-300"> · {report.gaps.length} gap{report.gaps.length > 1 ? "s" : ""}</span>
        )}
      </p>
    </div>
  );
}
