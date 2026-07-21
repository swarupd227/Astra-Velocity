"use client";

import { useState } from "react";
import { CHART } from "./tokens";

export interface StatBarRow {
  key: string;
  label: string;
  value: number;
  /** Formatted value shown at the right rail (defaults to value). */
  display?: string;
  /** Extra line inside the hover tooltip. */
  detail?: string;
}

/**
 * Horizontal magnitude bars — one series, one hue, thin marks, value at the
 * right rail in ink color, per-row hover tooltip (CoverageBars pattern).
 */
export function StatBars({ rows, maxValue }: { rows: StatBarRow[]; maxValue?: number }) {
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const max = maxValue ?? Math.max(1, ...rows.map((r) => r.value));

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.key}
          className="group relative grid grid-cols-[140px_1fr_84px] items-center gap-3"
          onMouseEnter={() => setHoverKey(row.key)}
          onMouseLeave={() => setHoverKey(null)}
        >
          <span className="truncate text-xs text-slate-200">{row.label}</span>
          <div className="h-3 overflow-hidden rounded-sm bg-slate-800/80">
            <div
              className="h-full rounded-sm transition-all"
              style={{ width: `${(row.value / max) * 100}%`, backgroundColor: CHART.series[0] }}
            />
          </div>
          <span className="text-right text-xs tabular-nums text-slate-400">
            {row.display ?? row.value.toLocaleString("en-US")}
          </span>

          {hoverKey === row.key && (
            <div className="pointer-events-none absolute left-36 top-5 z-10 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
              <p className="font-semibold text-white">{row.label}</p>
              <p className="text-slate-300">{row.display ?? row.value.toLocaleString("en-US")}</p>
              {row.detail && <p className="text-slate-400">{row.detail}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
