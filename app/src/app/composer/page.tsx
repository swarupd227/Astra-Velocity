import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { contentStore } from "@/content/store";
import {
  recommendDashboards,
  recommendElements,
  type EngineContext,
} from "@/engine/recommend";
import { Badge } from "@/components/ui/badge";
import { Term } from "@/components/term";
import { WelcomePanel } from "@/components/welcome-panel";
import { getSectorScope } from "@/lib/workspace-scope";
import { ComposerCanvas } from "./composer-canvas";

export const metadata = { title: "Composer — Astra Velocity" };

/**
 * Project Composer. One page, three states driven by ?sector=&scenario=:
 * pick a sector → pick a scenario → compose the pack from tiered
 * recommendations and save it as a project.
 */
export default async function ComposerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const sectorParam = typeof sp.sector === "string" ? sp.sector : undefined;
  const scenarioParam = typeof sp.scenario === "string" ? sp.scenario : undefined;

  const [sectors, scenarios, scope] = await Promise.all([
    contentStore.sectors(),
    contentStore.scenarios(),
    getSectorScope(),
  ]);
  // Workspace sector scope: only in-scope sectors are selectable (or linkable).
  const scopedSectors = sectors.filter((s) => scope.has(s.key));
  const sector = scopedSectors.find((s) => s.key === sectorParam);
  const scenario = scenarios.find((s) => s.key === scenarioParam);

  // ---------- Selection step ----------
  if (!sector || !scenario) {
    return (
      <div className="space-y-8">
        <WelcomePanel workspace="composer" />

        <header>
          <h1 className="font-display text-3xl text-slate-900 dark:text-white">Project Composer</h1>
          <p className="mt-1 max-w-2xl text-slate-500 dark:text-slate-400">
            Pick the client&apos;s sector, then the engagement scenario. The engine composes a{" "}
            <Term k="velocity-pack">Velocity Pack</Term> — every element justified by best
            practices and <Term k="obligation">obligations</Term>.
          </p>
        </header>

        <section>
          <div className="mb-3 flex items-baseline gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">1 · Sector</h2>
            {sector && <span className="text-sm text-teal-700 dark:text-teal-300">{sector.name}</span>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {scopedSectors.map((s) => {
              const active = s.key === sector?.key;
              return (
                <Link
                  key={s.key}
                  href={`/composer?sector=${s.key}`}
                  className={`rounded-2xl border p-4 transition ${
                    active
                      ? "border-teal-500/60 bg-teal-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.tagline}</p>
                  <p className="mt-2 text-xs text-slate-500">{s.distributionModel}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {sector && (
          <section>
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">2 · Scenario</h2>
              <span className="text-sm text-slate-500">
                What is the client actually trying to do?
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {scenarios.map((sc) => (
                <Link
                  key={sc.key}
                  href={`/composer?sector=${sector.key}&scenario=${sc.key}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 transition hover:border-teal-500/50"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">{sc.name}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sc.tagline}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500">{sc.stakes}</p>
                  {sc.sectorNotes?.[sector.key] && (
                    <p className="mt-2 line-clamp-2 text-xs text-teal-700/80 dark:text-teal-300/80">
                      {sc.sectorNotes[sector.key]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // ---------- Composition step ----------
  const [elements, dashboards, bestPractices, obligations, packs] = await Promise.all([
    contentStore.elements(),
    contentStore.dashboards(),
    contentStore.bestPractices(),
    contentStore.obligations(),
    contentStore.packs(),
  ]);

  const ctx: EngineContext = { sectors, scenarios, elements, dashboards, bestPractices, obligations };
  const input = { sector: sector.key, scenario: scenario.key };
  const recommendations = recommendElements(input, ctx);
  const dashboardRecs = recommendDashboards(input, ctx).slice(0, 6);
  const packCodes = Object.fromEntries(packs.map((p) => [p.key, p.code]));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href={`/composer?sector=${sector.key}`}
            className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Change sector / scenario
          </Link>
          <h1 className="font-display text-3xl text-slate-900 dark:text-white">
            {sector.name} <span className="text-slate-500">×</span> {scenario.name}
          </h1>
          <p className="mt-1 max-w-2xl text-slate-500 dark:text-slate-400">{scenario.stakes}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{recommendations.length} recommended elements</Badge>
          <Badge variant="outline">{scenario.stakeholders.length} stakeholder groups</Badge>
        </div>
      </header>

      <ComposerCanvas
        sectorKey={sector.key}
        sectorName={sector.name}
        scenario={scenario}
        recommendations={recommendations}
        dashboards={dashboardRecs}
        packCodes={packCodes}
      />
    </div>
  );
}
