import Link from "next/link";
import { contentStore } from "@/content/store";
import { SECTOR_KEYS, type SectorKey } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmphasisRadar } from "@/components/viz/emphasis-radar";

export const metadata = { title: "Scenario Catalog — Astra Velocity" };

function isSectorKey(value: string | undefined): value is SectorKey {
  return SECTOR_KEYS.includes(value as SectorKey);
}

export default async function ScenariosPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const params = await searchParams;
  const sectorKey: SectorKey | null = isSectorKey(params.sector) ? params.sector : null;

  const [scenarios, sectors] = await Promise.all([
    contentStore.scenarios(),
    contentStore.sectors(),
  ]);
  const orderedSectors = SECTOR_KEYS.map((key) => sectors.find((s) => s.key === key)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const activeSector = sectorKey ? orderedSectors.find((s) => s.key === sectorKey) ?? null : null;

  return (
    <section>
      <h1 className="font-display text-3xl text-slate-900 dark:text-white">Scenario Catalog</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Ten engagement scenarios — the situations that bring clients to the table, and what winning looks like.
      </p>

      {/* Sector filter */}
      <nav aria-label="Sector filter" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/scenarios"
          aria-current={!activeSector ? "page" : undefined}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
            !activeSector
              ? "border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          All sectors
        </Link>
        {orderedSectors.map((s) => {
          const active = s.key === activeSector?.key;
          return (
            <Link
              key={s.key}
              href={`/scenarios?sector=${s.key}`}
              aria-current={active ? "page" : undefined}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                active
                  ? "border-teal-500 bg-teal-500/15 text-teal-700 dark:text-teal-300"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {s.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {scenarios.map((scenario) => {
          const note = activeSector ? scenario.sectorNotes?.[activeSector.key] : undefined;
          const composerHref = activeSector
            ? `/composer?sector=${activeSector.key}&scenario=${scenario.key}`
            : `/composer?scenario=${scenario.key}`;
          return (
            <Card key={scenario.key} className="flex flex-col">
              <CardHeader>
                <CardTitle className="font-display text-lg">{scenario.name}</CardTitle>
                <p className="text-sm text-teal-600 dark:text-teal-400">{scenario.tagline}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">{scenario.stakes}</p>

                {note && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 p-3 text-sm text-teal-800 dark:text-teal-200">
                    <span className="font-semibold">In {activeSector?.name}: </span>
                    {note}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_170px]">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pain points
                      </h3>
                      <ul className="mt-1.5 space-y-1">
                        {scenario.painPoints.slice(0, 3).map((p) => (
                          <li key={p} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">▸</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Success metrics
                      </h3>
                      <ul className="mt-1.5 space-y-1">
                        {scenario.successMetrics.slice(0, 3).map((m) => (
                          <li key={m} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400">✓</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mx-auto w-full max-w-[170px]">
                    <EmphasisRadar emphasis={scenario.capabilityEmphasis} size={200} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {scenario.stakeholders.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto pt-1">
                  <Link
                    href={composerHref}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                  >
                    Compose this engagement →
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
