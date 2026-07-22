"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, RotateCcw, Search } from "lucide-react";
import type { Scenario } from "@/content/types";
import {
  computeCoverage,
  type DashboardRecommendation,
  type ElementRecommendation,
} from "@/engine/recommend";
import { SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { isNextRedirect, toast } from "@/components/ui/toaster";
import { CoverageBars } from "@/components/viz/coverage-bars";
import { saveProjectAction } from "./actions";

/**
 * Composition canvas (client): tiered recommendations on the left, live
 * coverage + dashboard set + save form in a sticky right rail. All props are
 * plain JSON — selection state lives here; coverage recomputes on every toggle
 * with the same pure engine the server uses. Selections autosave to
 * localStorage per sector × scenario and restore on return.
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

function readDraft(key: string): string[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every((k) => typeof k === "string")) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(key: string, keys: string[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(keys));
  } catch {
    // storage unavailable — selection still lives in state for this session
  }
}

function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const bs = new Set(b);
  return a.every((k) => bs.has(k));
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
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900 dark:text-white">
              <Link
                href={`/library/${el.key}`}
                className="transition hover:text-teal-600 dark:hover:text-teal-300 hover:underline"
              >
                {el.name}
              </Link>
            </h4>
            <Badge variant="outline">{typeLabel(el.type)}</Badge>
            {packCode && <Badge>{packCode}</Badge>}
            <span className="text-xs tabular-nums text-slate-500">score {rec.score}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{el.pitch}</p>
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
            <li key={reason} className="text-xs text-teal-700/90 dark:text-teal-200/90">
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
  const defaultKeys = useMemo(
    () => recommendations.filter((r) => r.tier === "core").map((r) => r.element.key),
    [recommendations],
  );
  const draftKey = `composer-draft:${sectorKey}:${scenario.key}`;

  const [selectedKeys, setSelectedKeys] = useState<string[]>(defaultKeys);
  const selected = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  // Restore a saved draft after mount (localStorage is client-only, so this
  // cannot run during render without a hydration mismatch).
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const draft = readDraft(draftKey);
    if (!draft) return;
    const known = new Set(recommendations.map((r) => r.element.key));
    const usable = draft.filter((k) => known.has(k));
    if (sameSet(usable, defaultKeys)) return;
    // Deferred so the restore lands after first paint instead of forcing a
    // synchronous cascading render inside the effect.
    const id = window.setTimeout(() => {
      setSelectedKeys(usable);
      toast("Draft restored", "info");
    }, 0);
    return () => window.clearTimeout(id);
  }, [draftKey, defaultKeys, recommendations]);

  const coverage = useMemo(
    () =>
      computeCoverage(
        recommendations.filter((r) => selected.has(r.element.key)).map((r) => r.element),
        scenario,
      ),
    [recommendations, selected, scenario],
  );

  const toggle = (key: string) =>
    setSelectedKeys((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      writeDraft(draftKey, next);
      return next;
    });

  const resetToDefault = () => {
    setSelectedKeys(defaultKeys);
    clearDraft(draftKey);
  };

  // Divergence from the core preselection (chip + reset in the right rail).
  const addedCount = selectedKeys.filter((k) => !defaultKeys.includes(k)).length;
  const removedCount = defaultKeys.filter((k) => !selectedKeys.includes(k)).length;
  const isModified = addedCount > 0 || removedCount > 0;

  // In-canvas filter: free-text + element type, applied to visible rows only —
  // selection state is untouched by filtering.
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const elementTypes = useMemo(
    () => Array.from(new Set(recommendations.map((r) => r.element.type))).sort(),
    [recommendations],
  );

  const matchesFilter = (rec: ElementRecommendation) => {
    if (typeFilter !== "all" && rec.element.type !== typeFilter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      rec.element.name.toLowerCase().includes(q) ||
      rec.element.pitch.toLowerCase().includes(q) ||
      typeLabel(rec.element.type).toLowerCase().includes(q)
    );
  };

  const tiers = (["core", "recommended", "optional"] as const).map((tier) => {
    const all = recommendations.filter((r) => r.tier === tier);
    return { tier, recs: all.filter(matchesFilter), total: all.length };
  });
  const anyVisible = tiers.some((t) => t.recs.length > 0);
  const filtering = query.trim().length > 0 || typeFilter !== "all";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* Left: filter bar + tiered recommendations */}
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter recommendations…"
              aria-label="Filter recommendations"
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by element type"
            className="sm:w-48"
          >
            <option value="all">All types</option>
            {elementTypes.map((t) => (
              <option key={t} value={t}>
                {typeLabel(t)}
              </option>
            ))}
          </Select>
        </div>

        {!anyVisible && (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            No recommendations match your filter.
            <button
              type="button"
              className="ml-2 font-medium text-teal-600 dark:text-teal-400 hover:underline"
              onClick={() => {
                setQuery("");
                setTypeFilter("all");
              }}
            >
              Clear filter
            </button>
          </div>
        )}

        {tiers.map(({ tier, recs, total }) => {
          if (recs.length === 0) return null;
          const meta = TIER_META[tier];
          const header = (
            <div className="flex items-baseline gap-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{meta.title}</h3>
              <span className="text-sm text-slate-500">
                {filtering && recs.length !== total
                  ? `${recs.length} of ${total} elements`
                  : `${total} element${total === 1 ? "" : "s"}`}
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
          if (tier === "optional" && !filtering) {
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
        {isModified && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-teal-500/30 bg-teal-500/5 px-3 py-2">
            <span className="text-xs font-medium text-teal-700 dark:text-teal-300">
              Modified from default: {addedCount > 0 && <>+{addedCount} added</>}
              {addedCount > 0 && removedCount > 0 && " / "}
              {removedCount > 0 && <>−{removedCount} removed</>}
            </span>
            <button
              type="button"
              onClick={resetToDefault}
              className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" aria-hidden /> Reset to recommended
            </button>
          </div>
        )}

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
                  <span className="truncate text-sm text-slate-600 dark:text-slate-300">{rec.dashboard.name}</span>
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
            <form
              action={async (formData: FormData) => {
                try {
                  // On success the action redirects to the new blueprint.
                  await saveProjectAction(formData);
                  clearDraft(draftKey);
                } catch (err) {
                  if (isNextRedirect(err)) {
                    // Redirect = the save succeeded — drop the local draft.
                    clearDraft(draftKey);
                    throw err;
                  }
                  toast("Could not save the project — check the form and try again.", "error");
                }
              }}
              className="space-y-3"
            >
              <input type="hidden" name="sectorKey" value={sectorKey} />
              <input type="hidden" name="scenarioKey" value={scenario.key} />
              <input
                type="hidden"
                name="selectedElementKeys"
                value={JSON.stringify(selectedKeys)}
              />
              <div className="space-y-1">
                <label htmlFor="project-name" className="text-xs font-medium text-slate-500 dark:text-slate-400">
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
                <label htmlFor="client-label" className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Client label <span className="text-slate-400 dark:text-slate-600">(optional)</span>
                </label>
                <Input
                  id="client-label"
                  name="clientLabel"
                  maxLength={120}
                  placeholder="e.g. Meridian Mutual pursuit"
                />
              </div>
              <SubmitButton
                className="w-full"
                disabled={selected.size === 0}
                pendingLabel="Saving…"
              >
                Save project
              </SubmitButton>
              {selected.size === 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-300">Select at least one element to save.</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
