"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import type { Scenario } from "@/content/types";
import {
  computeCoverage,
  type DashboardRecommendation,
  type ElementRecommendation,
} from "@/engine/recommend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CoverageBars } from "@/components/viz/coverage-bars";
import { saveProjectAction } from "./actions";

/**
 * Composition canvas (client): tiered recommendations on the left, live
 * coverage + dashboard set + save form in a sticky right rail. All props are
 * plain JSON — selection state lives here; coverage recomputes on every toggle
 * with the same pure engine the server uses.
 */

const TIER_META: Record<
  ElementRecommendation["tier"],
  { title: string; blurb: string }
> = {
  core: {
    title: "Core",
    blurb: "Signature fit for this sector × scenario — preselected.",
  },
  recommended: {
    title: "Recommended",
    blurb: "Strong fit; add to deepen coverage where the scenario concentrates.",
  },
  optional: {
    title: "Optional",
    blurb: "Relevant extensions — add selectively.",
  },
};

function typeLabel(type: string): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function ElementRow({
  rec,
  packCode,
  selected,
  onToggle,
}: {
  rec: ElementRecommendation;
  packCode: string | undefined;
  selected: boolean;
  onToggle: () => void;
}) {
  const el = rec.element;
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        selected
          ? "border-teal-500/50 bg-teal-500/5"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-white">{el.name}</h4>
            <Badge variant="outline">{typeLabel(el.type)}</Badge>
            {packCode && <Badge>{packCode}</Badge>}
            <span className="text-xs tabular-nums text-slate-500">score {rec.score}</span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{el.pitch}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={selected ? "secondary" : "primary"}
          onClick={onToggle}
          aria-pressed={selected}
        >
          {selected ? (
            <>
              <Minus className="h-3.5 w-3.5" /> Remove
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" /> Add
            </>
          )}
        </Button>
      </div>

      {/* Why this is in your pack — the signature surface, always visible. */}
      {rec.reasons.length > 0 && (
        <ul className="mt-3 space-y-1 border-l-2 border-teal-500/40 pl-3">
          {rec.reasons.map((reason) => (
            <li key={reason} className="text-xs text-teal-200/90">
              {reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ComposerCanvas({
  sectorKey,
  sectorName,
  scenario,
  recommendations,
  dashboards,
  packCodes,
}: {
  sectorKey: string;
  sectorName: string;
  scenario: Scenario;
  recommendations: ElementRecommendation[];
  dashboards: DashboardRecommendation[];
  packCodes: Record<string, string>;
}) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() =>
    recommendations.filter((r) => r.tier === "core").map((r) => r.element.key),
  );
  const selected = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const coverage = useMemo(
    () =>
      computeCoverage(
        recommendations.filter((r) => selected.has(r.element.key)).map((r) => r.element),
        scenario,
      ),
    [recommendations, selected, scenario],
  );

  const toggle = (key: string) =>
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );

  const tiers = (["core", "recommended", "optional"] as const).map((tier) => ({
    tier,
    recs: recommendations.filter((r) => r.tier === tier),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left: tiered recommendations */}
      <div className="space-y-8">
        {tiers.map(({ tier, recs }) => {
          if (recs.length === 0) return null;
          const meta = TIER_META[tier];
          const header = (
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-white">{meta.title}</h3>
              <span className="text-sm text-slate-500">
                {recs.length} element{recs.length === 1 ? "" : "s"}
              </span>
              <span className="hidden text-xs text-slate-500 sm:inline">{meta.blurb}</span>
            </div>
          );
          const rows = (
            <div className="mt-3 space-y-3">
              {recs.map((rec) => (
                <ElementRow
                  key={rec.element.key}
                  rec={rec}
                  packCode={packCodes[rec.element.packKey]}
                  selected={selected.has(rec.element.key)}
                  onToggle={() => toggle(rec.element.key)}
                />
              ))}
            </div>
          );
          if (tier === "optional") {
            return (
              <details key={tier} className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
                  {header}
                </summary>
                {rows}
              </details>
            );
          }
          return (
            <section key={tier}>
              {header}
              {rows}
            </section>
          );
        })}
      </div>

      {/* Right rail: coverage, dashboards, save */}
      <div className="space-y-4 self-start lg:sticky lg:top-20">
        <Card>
          <CardHeader>
            <CardTitle>Capability coverage</CardTitle>
            <p className="text-xs text-slate-500">
              {selected.size} element{selected.size === 1 ? "" : "s"} selected ·{" "}
              {sectorName} × {scenario.name}
            </p>
          </CardHeader>
          <CardContent>
            <CoverageBars report={coverage} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommended dashboards</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {dashboards.map((rec) => (
                <li key={rec.dashboard.key} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-300">{rec.dashboard.name}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline">{rec.dashboard.category}</Badge>
                    {rec.dashboard.builtIn && <Badge variant="accent">live</Badge>}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Save project</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveProjectAction} className="space-y-3">
              <input type="hidden" name="sectorKey" value={sectorKey} />
              <input type="hidden" name="scenarioKey" value={scenario.key} />
              <input
                type="hidden"
                name="selectedElementKeys"
                value={JSON.stringify(selectedKeys)}
              />
              <div className="space-y-1">
                <label htmlFor="project-name" className="text-xs font-medium text-slate-400">
                  Project name
                </label>
                <Input
                  id="project-name"
                  name="name"
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder={`${sectorName} — ${scenario.name}`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="client-label" className="text-xs font-medium text-slate-400">
                  Client label <span className="text-slate-600">(optional)</span>
                </label>
                <Input
                  id="client-label"
                  name="clientLabel"
                  maxLength={120}
                  placeholder="e.g. Meridian Mutual pursuit"
                />
              </div>
              <Button type="submit" className="w-full" disabled={selected.size === 0}>
                Save project
              </Button>
              {selected.size === 0 && (
                <p className="text-xs text-amber-300">Select at least one element to save.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
