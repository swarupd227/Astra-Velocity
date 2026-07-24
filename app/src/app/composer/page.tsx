import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { contentStore } from "@/content/store";
import type { SectorKey } from "@/content/types";
import {
  recommendElements,
  unionPlatformKeys,
  type EngineContext,
} from "@/engine/recommend";
import { Badge } from "@/components/ui/badge";
import { Term } from "@/components/term";
import { WelcomePanel } from "@/components/welcome-panel";
import { getSectorScope } from "@/lib/workspace-scope";
import type { SectorContextData } from "@/components/sector-context-drawer";
import { SectorContextTrigger } from "@/components/sector-context-trigger";
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
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "project.compose")) {
    return (
      <AccessDenied
        title="Project Composer"
        message="Composing a governance project from Velocity Pack elements requires the project composition permission."
        role={session.user.role}
      />
    );
  }

  const sp = await searchParams;
  const sectorParam = typeof sp.sector === "string" ? sp.sector : undefined;
  const scenarioParam = typeof sp.scenario === "string" ? sp.scenario : undefined;

  const [sectors, scenarios, obligations, kpis, scope] = await Promise.all([
    contentStore.sectors(),
    contentStore.scenarios(),
    contentStore.obligations(),
    contentStore.kpis(),
    getSectorScope(),
  ]);
  // Workspace sector scope: only in-scope sectors are selectable (or linkable).
  const scopedSectors = sectors.filter((s) => scope.has(s.key));
  const sector = scopedSectors.find((s) => s.key === sectorParam);
  const scenario = scenarios.find((s) => s.key === scenarioParam);

  // Full business context per in-scope sector (narrative, value chain,
  // obligations, KPIs) for the sector context drawer — loaded once here and
  // handed down as props so opening the drawer needs no extra request.
  const sectorContext: Partial<Record<SectorKey, SectorContextData>> = Object.fromEntries(
    scopedSectors.map((s) => [
      s.key,
      {
        sector: s,
        obligations: s.obligationKeys
          .map((k) => obligations.find((o) => o.key === k))
          .filter((o): o is NonNullable<typeof o> => Boolean(o)),
        kpis: s.kpiKeys
          .map((k) => kpis.find((kp) => kp.key === k))
          .filter((k): k is NonNullable<typeof k> => Boolean(k)),
      },
    ]),
  );

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
              const ctx = sectorContext[s.key];
              return (
                <div
                  key={s.key}
                  className={`flex flex-col rounded-2xl border p-4 transition ${
                    active
                      ? "border-teal-500/60 bg-teal-500/10"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <Link href={`/composer?sector=${s.key}`} className="block">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{s.name}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.tagline}</p>
                    <p className="mt-2 text-xs text-slate-500">{s.distributionModel}</p>
                  </Link>
                  {ctx && (
                    <div className="mt-3 flex justify-end border-t border-slate-200 dark:border-slate-800 pt-3">
                      <SectorContextTrigger data={ctx} />
                    </div>
                  )}
                </div>
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
  const [elements, dashboards, bestPractices, packs, platforms, frictionPatterns] = await Promise.all([
    contentStore.elements(),
    contentStore.dashboards(),
    contentStore.bestPractices(),
    contentStore.packs(),
    contentStore.platforms(),
    contentStore.frictionPatterns(),
  ]);

  const ctx: EngineContext = {
    sectors,
    scenarios,
    elements,
    dashboards,
    bestPractices,
    obligations,
    platforms,
    frictionPatterns,
  };
  // Fresh composition (no project yet): default the primary stack to the six
  // anchor-tier platforms — derived, never hardcoded.
  const defaultAnchorKeys = platforms.filter((p) => p.tier === "anchor").map((p) => p.key);
  const platformKeys = unionPlatformKeys(defaultAnchorKeys, []) as typeof defaultAnchorKeys;
  const input = { sector: sector.key, scenario: scenario.key, platformKeys };
  const recommendations = recommendElements(input, ctx);
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="accent">{recommendations.length} recommended elements</Badge>
          <Badge variant="outline">{scenario.stakeholders.length} stakeholder groups</Badge>
          {sectorContext[sector.key] && (
            <SectorContextTrigger data={sectorContext[sector.key]!} label="Business context" />
          )}
        </div>
      </header>

      <ComposerCanvas
        sector={sector}
        scenario={scenario}
        elements={elements}
        dashboardPool={dashboards}
        bestPractices={bestPractices}
        obligations={obligations}
        platforms={platforms}
        frictionPatterns={frictionPatterns}
        packCodes={packCodes}
        defaultPlatformKeys={defaultAnchorKeys}
      />
    </div>
  );
}
