"use client";

import { useMemo, useState } from "react";
import {
  CAPABILITIES,
  CAPABILITY_LABELS,
  ELEMENT_TYPES,
  PLATFORM_CATEGORIES,
  PLATFORM_CATEGORY_LABELS,
  type Artifact,
  type Capability,
  type Element,
  type ElementType,
  type Pack,
  type Platform,
  type PlatformKey,
} from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { ARTIFACT_KIND_LABELS } from "./artifact-stat";
import { ElementCard } from "./element-card";
import { TYPE_LABELS } from "./type-labels";

type ArtifactKind = Artifact["kind"];
/** Kinds actually worth offering in the filter, in a stable, meaningful order. */
const FORMAT_ORDER: ArtifactKind[] = [
  "code",
  "dq-rules",
  "cde-set",
  "glossary",
  "template",
  "checklist",
  "method",
  "curriculum",
  "reference-data",
  "metric-spec",
];

/** Client-side filterable browser over all pack elements, grouped by pack. */
export function LibraryBrowser({
  packs,
  elements,
  stats,
  artifactKinds,
  artifactSearch,
  platforms,
}: {
  packs: Pack[];
  elements: Element[];
  /** Element key → concrete artifact stat ("24 terms"), computed server-side. */
  stats: Record<string, string>;
  /** Element key → artifact kind ("code", "glossary", …) — drives the Format filter.
   * Governance-as-code examples are real elements whose TYPE is "template" or
   * "toolkit" (element type ≠ artifact format), so this is the only way to find
   * "every Code artifact" in one click instead of by luck while scrolling. */
  artifactKinds: Record<string, ArtifactKind>;
  /** Element key → flattened text from inside the artifact body, folded into search. */
  artifactSearch: Record<string, string>;
  platforms: Platform[];
}) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"" | ElementType>("");
  const [capability, setCapability] = useState<"" | Capability>("");
  const [packKey, setPackKey] = useState("");
  const [platformKey, setPlatformKey] = useState<"" | PlatformKey>("");
  const [format, setFormat] = useState<"" | ArtifactKind>("");

  const availableFormats = useMemo(() => {
    const present = new Set(Object.values(artifactKinds));
    return FORMAT_ORDER.filter((k) => present.has(k));
  }, [artifactKinds]);

  const sortedPacks = useMemo(
    () => [...packs].sort((a, b) => a.code.localeCompare(b.code)),
    [packs],
  );

  const groupedPlatforms = useMemo(
    () =>
      PLATFORM_CATEGORIES.map((category) => ({
        category,
        items: platforms.filter((p) => p.category === category),
      })).filter((g) => g.items.length > 0),
    [platforms],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return elements.filter((el) => {
      if (type && el.type !== type) return false;
      if (format && artifactKinds[el.key] !== format) return false;
      if (capability && !el.capabilities.includes(capability)) return false;
      if (packKey && el.packKey !== packKey) return false;
      // Skip elements with no platformAffinity data when a platform filter is active.
      if (platformKey && !(el.platformAffinity && (el.platformAffinity[platformKey] ?? 0) > 0)) {
        return false;
      }
      if (q) {
        const haystack = [
          el.name,
          el.pitch,
          el.description,
          el.soWhat,
          ...el.toolTags,
          artifactSearch[el.key] ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [elements, query, type, format, capability, packKey, platformKey, artifactKinds, artifactSearch]);

  const groups = sortedPacks
    .map((pack) => ({ pack, items: filtered.filter((el) => el.packKey === pack.key) }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      {/* Filter row */}
      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          type="search"
          placeholder="Search elements, pitches, tools, rule text…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search elements"
        />
        <Select
          value={type}
          onChange={(e) => setType(e.target.value as "" | ElementType)}
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {ELEMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value as "" | ArtifactKind)}
          aria-label="Filter by format"
        >
          <option value="">All formats</option>
          {availableFormats.map((f) => (
            <option key={f} value={f}>
              {ARTIFACT_KIND_LABELS[f]}
            </option>
          ))}
        </Select>
        <Select
          value={capability}
          onChange={(e) => setCapability(e.target.value as "" | Capability)}
          aria-label="Filter by capability"
        >
          <option value="">All capabilities</option>
          {CAPABILITIES.map((c) => (
            <option key={c} value={c}>
              {CAPABILITY_LABELS[c]}
            </option>
          ))}
        </Select>
        <Select
          value={packKey}
          onChange={(e) => setPackKey(e.target.value)}
          aria-label="Filter by pack"
        >
          <option value="">All packs</option>
          {sortedPacks.map((p) => (
            <option key={p.key} value={p.key}>
              {p.code} — {p.name}
            </option>
          ))}
        </Select>
        <Select
          value={platformKey}
          onChange={(e) => setPlatformKey(e.target.value as "" | PlatformKey)}
          aria-label="Filter by platform"
        >
          <option value="">All platforms</option>
          {groupedPlatforms.map(({ category, items }) => (
            <optgroup key={category} label={PLATFORM_CATEGORY_LABELS[category]}>
              {items.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>

      {format === "code" && (
        <p className="mt-3 rounded-lg border border-teal-500/30 bg-teal-500/5 dark:bg-teal-500/10 px-3 py-2 text-xs text-slate-600 dark:text-slate-300">
          Governance-as-code: declarative definitions — classification chains, DQ rules, access
          policy, CI pipelines — that deploy into your platforms, not documentation about them.
        </p>
      )}

      <p className="mt-3 text-xs text-slate-500">
        {filtered.length} of {elements.length} elements
      </p>

      {groups.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No elements match these filters.
        </div>
      )}

      {groups.map(({ pack, items }) => (
        <section key={pack.key} className="mt-10">
          <div className="flex flex-wrap items-baseline gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <Badge variant="accent">{pack.code}</Badge>
            <h2 className="font-display text-xl text-slate-900 dark:text-white">{pack.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{pack.summary}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((el) => (
              <ElementCard
                key={el.key}
                element={el}
                typeLabel={TYPE_LABELS[el.type]}
                stat={stats[el.key]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
