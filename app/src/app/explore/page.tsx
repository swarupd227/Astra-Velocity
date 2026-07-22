import Link from "next/link";
import { contentStore } from "@/content/store";
import { CAPABILITY_LABELS, SECTOR_KEYS, type SectorKey } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ValueChainRibbon } from "@/components/viz/value-chain-ribbon";

export const metadata = { title: "Landscape Explorer — Astra Velocity" };

function isSectorKey(value: string | undefined): value is SectorKey {
  return SECTOR_KEYS.includes(value as SectorKey);
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const params = await searchParams;
  const sectorKey: SectorKey = isSectorKey(params.sector) ? params.sector : "pc-personal";

  const [sectors, obligations, kpis] = await Promise.all([
    contentStore.sectors(),
    contentStore.obligations(),
    contentStore.kpis(),
  ]);

  const orderedSectors = SECTOR_KEYS.map((key) => sectors.find((s) => s.key === key)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s),
  );
  const sector = orderedSectors.find((s) => s.key === sectorKey) ?? orderedSectors[0];

  const sectorObligations = sector.obligationKeys
    .map((key) => obligations.find((o) => o.key === key))
    .filter((o): o is NonNullable<typeof o> => Boolean(o));
  const sectorKpis = sector.kpiKeys
    .map((key) => kpis.find((k) => k.key === key))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));

  return (
    <section>
      <h1 className="font-display text-3xl text-slate-900 dark:text-white">Insurance Landscape Explorer</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Nine sectors, their value chains, and the obligations and KPIs that make governance non-negotiable.
      </p>

      {/* Sector picker */}
      <nav aria-label="Sectors" className="mt-6 flex flex-wrap gap-2">
        {orderedSectors.map((s) => {
          const active = s.key === sector.key;
          return (
            <Link
              key={s.key}
              href={`/explore?sector=${s.key}`}
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

      {/* Sector narrative */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <CardTitle className="font-display text-xl">{sector.name}</CardTitle>
            <span className="text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400">{sector.tagline}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{sector.narrative}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Distribution model
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sector.distributionModel}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                System archetypes
              </h3>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {sector.systemArchetypes.map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Value chain */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Value chain — select a stage to see its data domains and pain points
        </h2>
        <div className="mt-3">
          <ValueChainRibbon sector={sector} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Regulatory obligations */}
        <Card>
          <CardHeader>
            <CardTitle>Regulatory obligations</CardTitle>
            <p className="text-xs text-slate-500">What examiners will actually ask this sector for.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorObligations.map((o) => (
              <div key={o.key} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{o.name}</h3>
                  <span className="text-xs text-teal-600 dark:text-teal-400">{o.authority}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-500">Evidence expected: </span>
                  {o.evidenceExpectations[0]}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {o.capabilities.map((c) => (
                    <Badge key={c} variant="accent">
                      {CAPABILITY_LABELS[c]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* KPIs */}
        <Card>
          <CardHeader>
            <CardTitle>KPIs that live or die on data</CardTitle>
            <p className="text-xs text-slate-500">
              The numbers leadership watches — and the critical data elements underneath them.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {sectorKpis.map((k) => (
              <div key={k.key} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{k.name}</h3>
                <p className="mt-1 font-mono text-xs text-teal-700 dark:text-teal-300">{k.formula}</p>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {k.cdeHints.slice(0, 3).map((hint) => (
                    <span
                      key={hint}
                      className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300"
                    >
                      {hint}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Signature pain points */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Signature pain points</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            {sector.signaturePainPoints.map((p) => (
              <li key={p} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">▸</span>
                {p}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
