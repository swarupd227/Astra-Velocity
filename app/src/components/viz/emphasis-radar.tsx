"use client";

import type { Capability } from "@/content/types";
import { CAPABILITIES, CAPABILITY_LABELS } from "@/content/types";
import { CHART } from "./tokens";

/**
 * Seven-axis capability radar for a scenario's emphasis profile (0–3 per
 * capability). Single series, direct axis labels — identity never color-alone.
 */
export function EmphasisRadar({
  emphasis,
  size = 240,
}: {
  emphasis: Partial<Record<Capability, number>>;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 42;
  const n = CAPABILITIES.length;

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const rr = (value / 3) * r;
    return [cx + rr * Math.cos(angle), cy + rr * Math.sin(angle)] as const;
  };

  const polygon = CAPABILITIES.map((cap, i) => point(i, emphasis[cap] ?? 0))
    .map(([px, py]) => `${px},${py}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full" role="img" aria-label="Capability emphasis radar">
      {[1, 2, 3].map((ring) => (
        <polygon
          key={ring}
          points={CAPABILITIES.map((_, i) => point(i, ring)).map(([px, py]) => `${px},${py}`).join(" ")}
          fill="none"
          stroke={CHART.ink.grid}
          strokeWidth={1}
        />
      ))}
      {CAPABILITIES.map((cap, i) => {
        const [px, py] = point(i, 3);
        const [lx, ly] = point(i, 3.9);
        return (
          <g key={cap}>
            <line x1={cx} y1={cy} x2={px} y2={py} stroke={CHART.ink.grid} strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill={(emphasis[cap] ?? 0) >= 2 ? CHART.ink.primary : CHART.ink.muted}
            >
              {CAPABILITY_LABELS[cap].split(" & ")[0]}
            </text>
          </g>
        );
      })}
      <polygon points={polygon} fill={CHART.series[0]} opacity={0.22} />
      <polygon points={polygon} fill="none" stroke={CHART.series[0]} strokeWidth={2} />
      {CAPABILITIES.map((cap, i) => {
        const v = emphasis[cap] ?? 0;
        if (v === 0) return null;
        const [px, py] = point(i, v);
        return <circle key={cap} cx={px} cy={py} r={3.5} fill={CHART.series[0]} stroke={CHART.surface} strokeWidth={2} />;
      })}
    </svg>
  );
}
