"use client";

import { useMemo, useState } from "react";
import {
  CAPABILITIES,
  CAPABILITY_LABELS,
  SECTOR_KEYS,
  type BestPractice,
  type Capability,
  type SectorKey,
} from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type SectorOption = { key: SectorKey; name: string };
type ElementRef = { key: string; name: string; bestPracticeKeys: string[] };
type ObligationRef = { key: string; name: string };

/** Filterable, high-visibility gallery of the best-practice canon. */
export function PracticesHub({
  practices,
  sectors,
  elements,
  obligations,
}: {
  practices: BestPractice[];
  sectors: SectorOption[];
  elements: ElementRef[];
  obligations: ObligationRef[];
}) {
  const [capability, setCapability] = useState<"" | Capability>("");
  const [sector, setSector] = useState<"" | SectorKey>("");

  const orderedSectors = useMemo(
    () =>
      SECTOR_KEYS.map((key) => sectors.find((s) => s.key === key)).filter(
        (s): s is SectorOption => Boolean(s),
      ),
    [sectors],
  );

  const obligationNames = useMemo(
    () => new Map(obligations.map((o) => [o.key, o.name])),
    [obligations],
  );

  const operationalizedBy = useMemo(() => {
    const map = new Map<string, ElementRef[]>();
    for (const el of elements) {
      for (const bpKey of el.bestPracticeKeys) {
        const list = map.get(bpKey) ?? [];
        list.push(el);
        map.set(bpKey, list);
      }
    }
    return map;
  }, [elements]);

  // Capability narrows the list; the sector select highlights each practice's
  // sector note without hiding practices — the canon is universal.
  const filtered = practices.filter(
    (p) => !capability || p.capabilities.includes(capability),
  );

  const activeSector = sector ? orderedSectors.find((s) => s.key === sector) ?? null : null;

  return (
    <div>
      {/* Filters */}
      <div className="grid gap-3 sm:max-w-xl sm:grid-cols-2">
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
          value={sector}
          onChange={(e) => setSector(e.target.value as "" | SectorKey)}
          aria-label="Highlight sector notes"
        >
          <option value="">All sectors</option>
          {orderedSectors.map((s) => (
            <option key={s.key} value={s.key}>
              {s.name}
            </option>
          ))}
        </Select>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {filtered.length} of {practices.length} practices
      </p>

      <div className="mt-6 space-y-6">
        {filtered.map((practice) => {
          const ops = operationalizedBy.get(practice.key) ?? [];
          const note = activeSector ? practice.sectorNotes?.[activeSector.key] : undefined;
          return (
            <Card key={practice.key}>
              <CardHeader>
                <h2 className="font-display text-2xl text-white">{practice.title}</h2>
                <p className="text-sm text-slate-300">{practice.statement}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {note && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-3 text-sm text-teal-200">
                    <span className="font-semibold">In {activeSector?.name}: </span>
                    {note}
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-400">
                      What good looks like
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{practice.whatGoodLooksLike}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 border-l-4 border-l-amber-500 bg-slate-950/60 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-400">
                      Anti-pattern
                    </h3>
                    <p className="mt-2 text-sm text-slate-300">{practice.antiPattern}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Evidence
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">{practice.evidence}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {practice.capabilities.map((c) => (
                    <Badge key={c} variant="accent">
                      {CAPABILITY_LABELS[c]}
                    </Badge>
                  ))}
                  {(practice.obligationKeys ?? []).map((key) => (
                    <Badge key={key} variant="outline">
                      {obligationNames.get(key) ?? key}
                    </Badge>
                  ))}
                </div>

                {ops.length > 0 && (
                  <p className="border-t border-slate-800 pt-3 text-xs text-slate-400">
                    <span className="font-semibold text-white">
                      Operationalized by {ops.length} library element{ops.length === 1 ? "" : "s"}
                    </span>
                    {" — "}
                    {ops.slice(0, 3).map((el) => el.name).join(" · ")}
                    {ops.length > 3 ? " …" : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
