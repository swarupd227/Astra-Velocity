import Link from "next/link";
import { redirect } from "next/navigation";
import { Blocks, ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { contentStore } from "@/content/store";
import { listProjectsForUser } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";
import { WelcomePanel } from "@/components/welcome-panel";

export const metadata = { title: "Projects — Astra Velocity" };

const STATUS_VARIANT = {
  draft: "outline",
  active: "success",
  archived: "default",
} as const;

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [projects, sectors, scenarios] = await Promise.all([
    listProjectsForUser(),
    contentStore.sectors(),
    contentStore.scenarios(),
  ]);
  const sectorNames = new Map<string, string>(sectors.map((s) => [s.key, s.name]));
  const scenarioNames = new Map<string, string>(scenarios.map((s) => [s.key, s.name]));

  return (
    <div className="space-y-6">
      <WelcomePanel workspace="projects" />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-slate-900 dark:text-white">Projects</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Composed governance projects in your workspace — open one for its blueprint.
          </p>
        </div>
        <Link
          href="/composer"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
        >
          <Blocks className="h-4 w-4" /> New project
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-12 text-center">
          <Blocks className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
          <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">No projects yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Compose your first governance project: pick a sector and scenario, and the engine
            assembles the Velocity Pack.
          </p>
          <Link
            href="/composer"
            className="mt-4 inline-block rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Open the Composer
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 transition hover:border-teal-500/50"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-900 dark:text-white">{project.name}</h2>
                    {project.clientLabel && (
                      <Badge variant="highlight">{project.clientLabel}</Badge>
                    )}
                    <Badge variant={STATUS_VARIANT[project.status]}>{project.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {sectorNames.get(project.sectorKey) ?? project.sectorKey}
                    <span className="text-slate-400 dark:text-slate-600"> × </span>
                    {scenarioNames.get(project.scenarioKey) ?? project.scenarioKey}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {project.selectedElementKeys.length} element
                    {project.selectedElementKeys.length === 1 ? "" : "s"} · updated{" "}
                    {dateFormat.format(project.updatedAt)}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-600" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
