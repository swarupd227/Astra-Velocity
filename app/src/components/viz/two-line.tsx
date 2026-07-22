"use client";

import { useRef, useState } from "react";
import { CHART } from "./tokens";

export interface TwoLinePoint {
  label: string;
  /** First series (e.g. manual baseline) — always present. */
  baseline: number;
  /** Second series actuals — null beyond "today". */
  actual: number | null;
  /** Second series projection — null before "today". */
  projected: number | null;
}

/**
 * Two-line comparison on a single axis (e.g. manual-baseline cost curve vs.
 * velocity-pack actual + projection). Thin lines, direct end labels, legend
 * for the two series, crosshair + tooltip on hover — follows BurnUp's pattern.
 */
export function TwoLineChart({
  points,
  baselineName,
  actualName,
  unit,
  height = 260,
}: {
  points: TwoLinePoint[];
  baselineName: string;
  actualName: string;
  unit: string;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 640;
  const pad = { top: 20, right: 120, bottom: 28, left: 44 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const maxY = Math.max(
    ...points.map((p) => Math.max(p.baseline, p.actual ?? 0, p.projected ?? 0)),
  ) * 1.08;

  const x = (i: number) => pad.left + (i / Math.max(1, points.length - 1)) * iw;
  const y = (v: number) => pad.top + ih - (v / maxY) * ih;

  const baselinePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.baseline)}`)
    .join(" ");

  let lastActualIdx = -1;
  points.forEach((p, i) => {
    if (p.actual !== null) lastActualIdx = i;
  });
  const actualPath = points
    .slice(0, lastActualIdx + 1)
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.actual!)}`)
    .join(" ");
  const projectedPath = points
    .map((p, i) => ({ i, v: i === lastActualIdx ? p.actual : p.projected }))
    .filter((d) => d.i >= lastActualIdx && d.v !== null)
    .map((d, k) => `${k === 0 ? "M" : "L"}${x(d.i)},${y(d.v!)}`)
    .join(" ");

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => Math.round(maxY * f));
  const baselineColor = CHART.series[1];
  const actualColor = CHART.series[0];
  const h = hover !== null ? points[hover] : null;

  function onMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((px - pad.left) / iw) * (points.length - 1));
    setHover(i >= 0 && i < points.length ? i : null);
  }

  const lastPoint = points[points.length - 1];

  return (
    // Chart internals are dark-optimized (validated palette) — in light theme
    // the chart keeps its own dark panel; in dark theme the panel disappears.
    <div className="relative rounded-xl bg-[#0d1424] p-3 dark:bg-transparent dark:p-0">
      {/* legend — two series, identity never color-alone (direct labels too) */}
      <div className="mb-2 flex flex-wrap gap-4 text-xs text-slate-300">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ backgroundColor: baselineColor }} />
          {baselineName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded" style={{ backgroundColor: actualColor }} />
          {actualName}
        </span>
        <span className="inline-flex items-center gap-1.5 text-slate-500">
          <span
            className="h-0 w-4 border-t-2 border-dashed"
            style={{ borderColor: actualColor, opacity: 0.7 }}
          />
          projection
        </span>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`${baselineName} versus ${actualName}, in ${unit}`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        {gridLines.map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={pad.left + iw} y1={y(v)} y2={y(v)} stroke={CHART.ink.grid} strokeWidth={1} />
            <text x={pad.left - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill={CHART.ink.muted}>
              {v}
            </text>
          </g>
        ))}

        <path d={baselinePath} fill="none" stroke={baselineColor} strokeWidth={2} />
        <path d={actualPath} fill="none" stroke={actualColor} strokeWidth={2} />
        <path d={projectedPath} fill="none" stroke={actualColor} strokeWidth={2} strokeDasharray="3 5" opacity={0.7} />

        {/* direct end labels — text in ink colors, mark carries the identity */}
        <circle cx={x(points.length - 1)} cy={y(lastPoint.baseline)} r={4} fill={baselineColor} stroke={CHART.surface} strokeWidth={2} />
        <text x={x(points.length - 1) + 8} y={y(lastPoint.baseline) + 4} fontSize={11} fontWeight={600} fill={CHART.ink.primary}>
          {lastPoint.baseline} {unit}
        </text>
        {lastActualIdx >= 0 && (
          <>
            <circle cx={x(lastActualIdx)} cy={y(points[lastActualIdx].actual!)} r={4} fill={actualColor} stroke={CHART.surface} strokeWidth={2} />
            <text x={x(lastActualIdx) + 8} y={y(points[lastActualIdx].actual!) + 16} fontSize={11} fontWeight={600} fill={CHART.ink.primary}>
              {points[lastActualIdx].actual} {unit}
            </text>
          </>
        )}
        {lastPoint.projected !== null && (
          <text x={x(points.length - 1) + 8} y={y(lastPoint.projected) + 4} fontSize={11} fill={CHART.ink.secondary}>
            {lastPoint.projected} proj.
          </text>
        )}

        {/* x labels */}
        {points.map((p, i) =>
          i % Math.ceil(points.length / 8) === 0 ? (
            <text key={p.label} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={CHART.ink.muted}>
              {p.label}
            </text>
          ) : null,
        )}

        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + ih} stroke={CHART.ink.secondary} strokeWidth={1} opacity={0.5} />
        )}
      </svg>

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${(x(hover) / width) * 100}%`, top: 24 }}
        >
          <p className="font-semibold text-white">{h.label}</p>
          <p className="text-slate-300">
            {baselineName}: {h.baseline} {unit}
          </p>
          {h.actual !== null && (
            <p className="text-slate-300">
              {actualName}: {h.actual} {unit}
            </p>
          )}
          {h.actual === null && h.projected !== null && (
            <p className="text-slate-400">
              {actualName} (proj.): {h.projected} {unit}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
