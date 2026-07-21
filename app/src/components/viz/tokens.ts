/**
 * Chart color tokens — validated with the dataviz palette validator against the
 * app's dark chart surface (#0d1424): lightness band, chroma floor, CVD
 * separation, normal-vision floor, contrast all PASS (4 categorical slots).
 * Charts here run 1–2 series with direct labels (secondary encoding present).
 */
export const CHART = {
  surface: "#0d1424",
  series: ["#0d9488", "#3987e5", "#d55181", "#c98500"] as const,
  /** Sequential teal ramp (magnitude) — near-zero recedes toward the dark surface. */
  sequential: ["#0f2e2b", "#115e59", "#0f766e", "#0d9488", "#14b8a6"] as const,
  status: {
    good: "#0ca30c",
    warning: "#fab219",
    serious: "#ec835a",
    critical: "#d03b3b",
  },
  ink: {
    primary: "#ffffff",
    secondary: "#c3c2b7",
    muted: "#898781",
    grid: "#1e293b",
    baseline: "#383835",
  },
} as const;

export function sequentialColor(t: number): string {
  const steps = CHART.sequential;
  const clamped = Math.max(0, Math.min(1, t));
  return steps[Math.min(steps.length - 1, Math.floor(clamped * steps.length))];
}
