import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { contentStore } from "@/content/store";
import { buildBlueprint } from "@/engine/blueprint";
import { recommendDashboards, type EngineContext } from "@/engine/recommend";
import { getProject } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintButton } from "./print-button";

export const metadata = { title: "Project Blueprint — Astra Velocity" };

const TOTAL_WEEKS = 26;

const PRINT_CSS = `@media print {
  body { background: #ffffff !important; color: #0f172a !important; }
  header, nav, .no-print { display: none !important; }
  .print-doc, .print-doc * {
    background: transparent !important;
    color: #0f172a !important;
    border-color: #cbd5e1 !important;
    box-shadow: none !important;
  }
  .print-doc .print-bar { background: #0d9488 !important; }
  .print-doc h1, .print-doc h2, .print-doc h3, .print-doc h4 { color: #0b1220 !important; }
  .print-doc section { break-inside: avoid; }
}`;

function typeLabel(type: string): string {
  return type
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-xl text-slate-900 dark:text-white">
      <span className="mr-2 text-teal-600 dark:text-teal-400">/</span>
      {children}
    </h2>
  );
}

export default async function ProjectBlueprintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const project = await getProject(id);
  if (!project) notFound();

  const [sectors, scenarios, elements, dashboards, bestPractices, obligations] =
    await Promise.all([
      contentStore.sectors(),
      contentStore.scenarios(),
      contentStore.elements(),
      contentStore.dashboards(),
      contentStore.bestPractices(),
      contentStore.obligations(),
    ]);

  const sector = sectors.find((s) => s.key === project.sectorKey);
  const scenario = scenarios.find((s) => s.key === project.scenarioKey);
  if (!sector || !scenario) notFound();

  const selectedSet = new Set(project.selectedElementKeys);
  const selectedElements = elements.filter((e) => selectedSet.has(e.key));

  const ctx: EngineContext = { sectors, scenarios, elements, dashboards, bestPractices, obligations };
  const dashboardRecs = recommendDashboards(
    { sector: sector.key, scenario: scenario.key },
    ctx,
  ).slice(0, 6);

  const blueprint = buildBlueprint({
    sector,
    scenario,
    elements: selectedElements,
    dashboards: dashboardRecs.map((r) => r.dashboard),
    bestPractices,
    obligations,
  });

  return (
    <div className="print-doc space-y-8">
      <style>{PRINT_CSS}</style>

      {/* ---------- Header ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            href="/projects"
            className="no-print mb-2 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600 dark:text-teal-400">
            Project Blueprint
          </p>
          <h1 className="mt-1 font-display text-3xl text-slate-900 dark:text-white">{project.name}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            {sector.name} <span className="text-slate-400 dark:text-slate-600">×</span> {scenario.name}
            {project.clientLabel && (
              <>
                {" "}
                <Badge variant="highlight" className="ml-2 align-middle">
                  {project.clientLabel}
                </Badge>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{selectedElements.length} elements</Badge>
          <Badge variant={project.status === "active" ? "success" : "outline"}>
            {project.status}
          </Badge>
          <PrintButton />
        </div>
      </header>

      {/* ---------- Executive summary ---------- */}
      <section className="space-y-3">
        <SectionTitle>Executive summary</SectionTitle>
        {blueprint.executiveSummary.map((paragraph) => (
          <p key={paragraph.slice(0, 40)} className="max-w-4xl leading-relaxed text-slate-600 dark:text-slate-300">
            {paragraph}
          </p>
        ))}
      </section>

      {/* ---------- Phase timeline ---------- */}
      <section className="space-y-4">
        <SectionTitle>Phase timeline · 26 weeks</SectionTitle>
        <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
          {blueprint.phases.map((phase) => (
            <div key={phase.key} className="grid items-center gap-3 md:grid-cols-[280px_1fr_90px]">
              <span className="truncate text-sm text-slate-600 dark:text-slate-300">{phase.name}</span>
              <div className="relative h-4 rounded-sm bg-slate-200 dark:bg-slate-800/70">
                <div
                  className="print-bar absolute top-0 h-full rounded-sm bg-teal-500/80"
                  style={{
                    left: `${((phase.weekStart - 1) / TOTAL_WEEKS) * 100}%`,
                    width: `${((phase.weekEnd - phase.weekStart + 1) / TOTAL_WEEKS) * 100}%`,
                  }}
                />
              </div>
              <span className="text-right text-xs tabular-nums text-slate-500">
                {phase.window}
              </span>
            </div>
          ))}
          {blueprint.crossCuttingEnablement.elementNames.length > 0 && (
            <div className="grid items-center gap-3 md:grid-cols-[280px_1fr_90px]">
              <span className="truncate text-sm text-slate-500 dark:text-slate-400">Cross-cutting enablement</span>
              <div className="relative h-4 rounded-sm bg-slate-200 dark:bg-slate-800/70">
                <div className="print-bar absolute top-0 h-full w-full rounded-sm bg-amber-500/50" />
              </div>
              <span className="text-right text-xs tabular-nums text-slate-500">Weeks 1–26</span>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {blueprint.phases.map((phase) => (
            <Card key={phase.key}>
              <CardHeader>
                <CardTitle>{phase.name}</CardTitle>
                <p className="text-xs text-teal-700 dark:text-teal-300">{phase.window}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="list-disc space-y-1 pl-4 text-sm text-slate-500 dark:text-slate-400">
                  {phase.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
                {phase.elementNames.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Deployed elements
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {phase.elementNames.map((name) => (
                        <Badge key={name} variant="outline">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {blueprint.crossCuttingEnablement.elementNames.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Cross-cutting enablement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">{blueprint.crossCuttingEnablement.note}</p>
              <div className="flex flex-wrap gap-1.5">
                {blueprint.crossCuttingEnablement.elementNames.map((name) => (
                  <Badge key={name} variant="highlight">
                    {name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ---------- Element manifest ---------- */}
      <section className="space-y-4">
        <SectionTitle>Element manifest</SectionTitle>
        <div className="space-y-4">
          {blueprint.manifest.map((group) => (
            <div key={group.capability}>
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.label}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {group.entries.map((entry) => (
                  <div
                    key={entry.elementKey}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{entry.elementName}</h4>
                      <Badge variant="outline">{typeLabel(entry.elementType)}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{entry.soWhat}</p>
                    {entry.practiceTitle && (
                      <p className="mt-2 text-xs text-teal-700 dark:text-teal-300">
                        Operationalizes: &ldquo;{entry.practiceTitle}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Obligations addressed ---------- */}
      {blueprint.obligationsAddressed.length > 0 && (
        <section className="space-y-4">
          <SectionTitle>Obligations addressed</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {blueprint.obligationsAddressed.map((obligation) => (
              <div
                key={obligation.key}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{obligation.name}</h4>
                  <Badge variant="accent">{obligation.authority}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{obligation.summary}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Evidence: {obligation.evidenceExpectations[0]}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Success metrics ---------- */}
      <section className="space-y-3">
        <SectionTitle>Success metrics</SectionTitle>
        <ul className="grid gap-2 md:grid-cols-2">
          {blueprint.successMetrics.map((metric) => (
            <li
              key={metric}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
            >
              {metric}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Pod model & train-the-trainer ---------- */}
      <section className="space-y-4">
        <SectionTitle>Pod model &amp; train-the-trainer</SectionTitle>
        <p className="max-w-3xl text-sm text-slate-500 dark:text-slate-400">{blueprint.podModel.summary}</p>
        <div className="grid gap-3 md:grid-cols-2">
          {blueprint.podModel.pairs.map((pair) => (
            <div
              key={pair.consultingRole}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
            >
              <p className="font-semibold text-slate-900 dark:text-white">
                {pair.consultingRole} <span className="text-teal-600 dark:text-teal-400">⇄</span> {pair.clientRole}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{pair.focus}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {blueprint.trainTheTrainer.waves.map((wave) => (
            <div
              key={wave.wave}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
            >
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">{wave.wave}</h4>
                <Badge variant="accent">{wave.namedTraineeSlots} named trainee slots</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{wave.focus}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {blueprint.trainTheTrainer.readinessDemonstration}
          </p>
        </div>
      </section>

      {/* ---------- Risks ---------- */}
      <section className="space-y-3">
        <SectionTitle>Risks &amp; mitigations</SectionTitle>
        <ul className="space-y-2">
          {blueprint.risks.map((risk) => (
            <li
              key={risk}
              className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 border-l-2 border-l-amber-400/70 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300"
            >
              {risk}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Dashboard set ---------- */}
      <section className="space-y-3">
        <SectionTitle>Dashboard set</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {blueprint.dashboards.map((dashboard) => (
            <div
              key={dashboard.key}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold text-slate-900 dark:text-white">{dashboard.name}</h4>
                <Badge variant="outline">{dashboard.category}</Badge>
                {dashboard.builtIn && <Badge variant="accent">live in-app</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{dashboard.questionsAnswered[0]}</p>
              <p className="mt-2 text-xs text-slate-500">
                Audience: {dashboard.audience.join(", ")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
