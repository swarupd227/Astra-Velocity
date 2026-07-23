"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CAPABILITY_LABELS, type Platform } from "@/content/types";
import type { RoleMapReport } from "@/engine/recommend";
import { Badge } from "@/components/ui/badge";

export interface RoleMapStack {
  label: string;
  report: RoleMapReport;
}

function platformName(key: string, platforms: Platform[]): string {
  return platforms.find((p) => p.key === key)?.name ?? key;
}

function RoleMapBody({ report, platforms }: { report: RoleMapReport; platforms: Platform[] }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {report.byCapability.map((row) => (
          <div
            key={row.capability}
            className={`rounded-xl border p-3 ${
              row.hasCoverage
                ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                : "border-amber-500/40 bg-amber-500/5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {CAPABILITY_LABELS[row.capability]}
              </span>
              {!row.hasCoverage && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Uncovered
                </span>
              )}
            </div>
            {row.hasCoverage && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {row.anchors.map((key) => (
                  <Badge key={`a-${key}`} variant="accent">
                    {platformName(key, platforms)} · anchor
                  </Badge>
                ))}
                {row.enforces.map((key) => (
                  <Badge key={`e-${key}`} variant="success">
                    {platformName(key, platforms)} · enforces
                  </Badge>
                ))}
                {row.supports.map((key) => (
                  <Badge key={`s-${key}`} variant="outline">
                    {platformName(key, platforms)} · supports
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {report.frictionMatches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Friction patterns in this stack
          </h4>
          {report.frictionMatches.map(({ pattern }) => (
            <div
              key={pattern.key}
              className="rounded-lg border border-slate-200 dark:border-slate-800 border-l-2 border-l-amber-400/70 bg-amber-500/[0.04] px-4 py-2.5"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{pattern.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {pattern.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Renders one or more RoleMapReports — how the selected stack's platforms
 * divide capability work (anchor/supports/enforces) and where friction
 * patterns surface. A single stack (the common case) renders directly with
 * no tab chrome; when named market variants are in play, each stack gets its
 * own labeled segment.
 */
export function RoleMap({ stacks, platforms }: { stacks: RoleMapStack[]; platforms: Platform[] }) {
  const [active, setActive] = useState(0);

  if (stacks.length === 0) return null;
  if (stacks.length === 1) {
    return <RoleMapBody report={stacks[0].report} platforms={platforms} />;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        {stacks.map((stack, i) => (
          <button
            key={stack.label}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active === i
                ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
            }`}
          >
            {stack.label}
          </button>
        ))}
      </div>
      <RoleMapBody report={stacks[active].report} platforms={platforms} />
    </div>
  );
}
