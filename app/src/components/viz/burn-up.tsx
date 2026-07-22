"use client";

import { useMemo, useRef, useState } from "react";
import { CHART } from "./tokens";

export interface BurnUpPoint {
  label: string; // e.g. "Q1 26"
  actual: number | null; // null once beyond "today"
  projected: number;
}

/**
 * Portfolio maturity burn-up: governed data products over time toward a target.
 * Line + area, crosshair hover with tooltip, direct end labels, single y-axis.
 */
export function BurnUp({
  points,
  target,
  height = 260,
  targetLabel = "Target",
}: {
  points: BurnUpPoint[];
  target: number;
  height?: number;
  targetLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 640;
  const pad = { top: 20, right: 84, bottom: 28, left: 40 };
  const iw = width - pad.left - pad.right;
  const ih = height - pad.top - pad.bottom;
  const maxY = Math.max(target * 1.08, ...points.map((p) => p.projected));

  const x = (i: number) => pad.left + (i / Math.max(1, points.length - 1)) * iw;
  const y = (v: number) => pad.top + ih - (v / maxY) * ih;

  const { actualPath, actualArea, projectedPath, lastActualIdx } = useMemo(() => {
    let lastIdx = -1;
    points.forEach((p, i) => {
      if (p.actual !== null) lastIdx = i;
    });
    const actualPts = points.slice(0, lastIdx + 1);
    const ap = actualPts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.actual!)}`).join(" ");
    const area =
      ap +
      ` L${x(Math.max(0, lastIdx))},${y(0)} L${x(0)},${y(0)} Z`;
    const projPts = points.slice(Math.max(0, lastIdx));
    const pp = projPts
      .map((p, i) => {
        const xi = x(lastIdx + i);
        const v = i === 0 && p.actual !== null ? p.actual : p.projected;
        return `${i === 0 ? "M" : "L"}${xi},${y(v)}`;
      })
      .join(" ");
    return { actualPath: ap, actualArea: area, projectedPath: pp, lastActualIdx: lastIdx };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, maxY]);

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => Math.round(maxY * f));

  function onMove(e: React.MouseEvent) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const i = Math.round(((px - pad.left) / iw) * (points.length - 1));
    setHover(i >= 0 && i < points.length ? i : null);
  }

  const h = hover !== null ? points[hover] : null;

  return (
    // Chart internals are dark-optimized (validated palette) — in light theme
    // the chart keeps its own dark panel; in dark theme the panel disappears.
    <div className="relative rounded-xl bg-[#0d1424] p-3 dark:bg-transparent dark:p-0">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Burn-up of governed data products toward a target of ${target}`}
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

        {/* target line */}
        <line
          x1={pad.left}
          x2={pad.left + iw}
          y1={y(target)}
          y2={y(target)}
          stroke={CHART.ink.secondary}
          strokeDasharray="6 4"
          strokeWidth={1.5}
        />
        <text x={pad.left + iw + 8} y={y(target) + 4} fontSize={11} fill={CHART.ink.secondary}>
          {targetLabel} {target}
        </text>

        {/* actuals */}
        <path d={actualArea} fill={CHART.series[0]} opacity={0.14} />
        <path d={actualPath} fill="none" stroke={CHART.series[0]} strokeWidth={2} />

        {/* projection */}
        <path d={projectedPath} fill="none" stroke={CHART.series[0]} strokeWidth={2} strokeDasharray="3 5" opacity={0.7} />

        {/* direct labels at line ends */}
        {lastActualIdx >= 0 && points[lastActualIdx].actual !== null && (
          <>
            <circle cx={x(lastActualIdx)} cy={y(points[lastActualIdx].actual!)} r={4} fill={CHART.series[0]} stroke={CHART.surface} strokeWidth={2} />
            <text
              x={x(lastActualIdx) + 8}
              y={y(points[lastActualIdx].actual!) - 8}
              fontSize={11}
              fontWeight={600}
              fill={CHART.ink.primary}
            >
              {points[lastActualIdx].actual} governed
            </text>
          </>
        )}

        {/* x labels */}
        {points.map((p, i) =>
          i % Math.ceil(points.length / 8) === 0 ? (
            <text key={p.label} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={CHART.ink.muted}>
              {p.label}
            </text>
          ) : null,
        )}

        {/* crosshair */}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + ih} stroke={CHART.ink.secondary} strokeWidth={1} opacity={0.5} />
        )}
      </svg>

      {h && hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl"
          style={{ left: `${(x(hover) / width) * 100}%`, top: 0 }}
        >
          <p className="font-semibold text-white">{h.label}</p>
          {h.actual !== null && <p className="text-slate-300">Governed: {h.actual}</p>}
          <p className="text-slate-400">Plan: {h.projected}</p>
        </div>
      )}
    </div>
  );
}
