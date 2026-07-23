import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { contentStore } from "@/content/store";
import { CAPABILITY_LABELS, type Artifact, type Element } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IntegrationNote } from "@/components/integration-note";
import { ArtifactViewer } from "@/components/library/artifact-viewer";
import { resolveArtifact } from "@/components/library/artifact-stat";
import { PlatformVariantNotes } from "@/components/library/platform-variant-notes";
import { TYPE_LABELS } from "@/components/library/type-labels";
import { getSectorScope, isInSectorScope } from "@/lib/workspace-scope";

/**
 * "Complements, never replaces": per-artifact-kind integration notes that spell
 * out how this asset deploys into the client's existing stack.
 */
const INTEGRATION_NOTES: Partial<
  Record<Artifact["kind"], { title: string; body: string; chain: string[] }>
> = {
  "dq-rules": {
    title: "Deploys into your stack",
    body: "These rules compile to your existing DQ engines (Informatica CDQ, dbt tests, warehouse-native SQL) and execute where your data lives; breaches route to your ticketing (ServiceNow, Jira) — nothing replaces your current architecture.",
    chain: ["Profiling", "Rule authoring here", "Your DQ engine", "Your monitoring / ticketing"],
  },
  "cde-set": {
    title: "Publishes into your catalog",
    body: "This CDE set publishes into your existing catalog (Informatica CDGC, Collibra, Atlan) via API and is curated there by your stewards — a governed head start, not a parallel catalog.",
    chain: ["Curated here", "Your catalog (CDGC, Collibra, Atlan)", "Stewardship in your tools"],
  },
  glossary: {
    title: "Publishes into your catalog",
    body: "These terms publish into your existing catalog (Informatica CDGC, Collibra, Atlan) via API and are curated there — one business vocabulary in the tool your organization already uses, not a parallel catalog.",
    chain: ["Curated here", "Your catalog (CDGC, Collibra, Atlan)", "Stewardship in your tools"],
  },
  code: {
    title: "Governance-as-code — deploys into your platforms",
    body: "A CI pipeline deploys these definitions into your platforms — catalog entries, warehouse tags, and access policies land in the tools you already run, versioned and reviewed like any other code.",
    chain: ["Pull request", "CI validation", "Your catalog / tags / policies"],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const elements = await contentStore.elements();
  const element = elements.find((el) => el.key === key);
  return {
    title: element ? `${element.name} — Astra Velocity` : "Library Element — Astra Velocity",
  };
}

function AgentContract({ element }: { element: Element }) {
  const meta = element.agentMeta;
  if (!meta) return null;
  return (
    <Card className="border-teal-500/50 bg-teal-500/[0.04]">
      <CardHeader>
        <CardTitle>Agent operating contract</CardTitle>
        <p className="text-xs text-slate-500">
          A digital co-worker: it drafts, a named human decides, and its leverage is measured.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-teal-500/30 bg-slate-100 dark:bg-slate-950/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">Drafts</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meta.drafts}</p>
          </div>
          <div className="rounded-xl border border-teal-500/30 bg-slate-100 dark:bg-slate-950/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              You decide
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meta.humanDecides}</p>
          </div>
          <div className="rounded-xl border border-teal-500/30 bg-slate-100 dark:bg-slate-950/60 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
              Measured by
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{meta.leverageMetric}</p>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Guardrails</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta.guardrails.map((g) => (
              <span
                key={g}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700 dark:text-amber-300"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1.5 border-t border-slate-200 dark:border-slate-800 pt-3 text-sm font-medium text-teal-700 dark:text-teal-300 transition hover:text-teal-600 dark:hover:text-teal-200"
        >
          See this contract live in the agent workbench <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function ElementDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const [elements, packs, bestPractices, obligations, kpis, platforms] = await Promise.all([
    contentStore.elements(),
    contentStore.packs(),
    contentStore.bestPractices(),
    contentStore.obligations(),
    contentStore.kpis(),
    contentStore.platforms(),
  ]);

  const element = elements.find((el) => el.key === key);
  if (!element) notFound();

  // Workspace sector scope: elements pinned entirely outside scope are hidden.
  const scope = await getSectorScope();
  if (!isInSectorScope(element.sectorAffinity, scope)) notFound();

  const pack = packs.find((p) => p.key === element.packKey);
  const artifact = resolveArtifact(element);
  const isAgent = element.type === "agent";
  const integrationNote = artifact ? INTEGRATION_NOTES[artifact.kind] : undefined;

  const linkedPractices = element.bestPracticeKeys
    .map((k) => bestPractices.find((bp) => bp.key === k))
    .filter((bp) => bp !== undefined);
  const linkedObligations = (element.obligationKeys ?? [])
    .map((k) => obligations.find((o) => o.key === k))
    .filter((o) => o !== undefined);
  const linkedKpis = (element.kpiKeys ?? [])
    .map((k) => kpis.find((kpi) => kpi.key === k))
    .filter((kpi) => kpi !== undefined);
  const platformNameByKey = new Map(platforms.map((p) => [p.key, p.name]));
  const platformVariantNotes = (element.platformVariants ?? []).map((v) => ({
    platformKey: v.platformKey,
    platformName: platformNameByKey.get(v.platformKey) ?? v.platformKey,
    note: v.note,
  }));

  return (
    <div className="space-y-6">
      <Link
        href="/library"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Pack Library
      </Link>

      {/* ---------- Header ---------- */}
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isAgent ? "accent" : "default"}>
            {isAgent ? "Agent co-worker" : TYPE_LABELS[element.type]}
          </Badge>
          {pack && (
            <>
              <Badge variant="accent">{pack.code}</Badge>
              <span className="text-sm text-slate-500 dark:text-slate-400">{pack.name}</span>
            </>
          )}
          {element.effortSavedStewardWeeks !== undefined && (
            <Badge variant="success">saves ~{element.effortSavedStewardWeeks} steward-weeks</Badge>
          )}
        </div>
        <h1 className="mt-3 font-display text-3xl text-slate-900 dark:text-white">{element.name}</h1>
        <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">{element.pitch}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------- Main column: the artifact is the star ---------- */}
        <div className="min-w-0 space-y-6">
          {isAgent && element.agentMeta && <AgentContract element={element} />}

          {integrationNote && (
            <IntegrationNote
              title={integrationNote.title}
              body={integrationNote.body}
              chain={integrationNote.chain}
            />
          )}

          {artifact ? (
            <Card>
              <CardHeader>
                <CardTitle>Working asset</CardTitle>
              </CardHeader>
              <CardContent>
                <ArtifactViewer artifact={artifact} />
              </CardContent>
            </Card>
          ) : (
            !(isAgent && element.agentMeta) && (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-6 text-sm text-slate-500">
                Working asset ships with the pack — the starter sample for this element is not
                published in the demo library yet.
              </div>
            )
          )}

          {platformVariantNotes.length > 0 && <PlatformVariantNotes variants={platformVariantNotes} />}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">About this element</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{element.description}</p>
              <p className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-teal-700 dark:text-teal-300">So what: </span>
                {element.soWhat}
              </p>
              <p className="text-xs text-slate-500">Audience: {element.audience.join(" · ")}</p>
            </CardContent>
          </Card>
        </div>

        {/* ---------- Side rail ---------- */}
        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          {linkedPractices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Grounded in practice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {linkedPractices.map((bp) => (
                  <Link
                    key={bp.key}
                    href="/practices"
                    className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3 transition hover:border-teal-500/50"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{bp.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bp.statement}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {linkedObligations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Obligations served</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {linkedObligations.map((o) => (
                  <div key={o.key} className="flex items-start justify-between gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">{o.name}</span>
                    <Badge variant="outline" className="shrink-0">
                      {o.authority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {linkedKpis.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">KPIs it protects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {linkedKpis.map((kpi) => (
                  <div key={kpi.key}>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{kpi.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-500">{kpi.formula}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {element.capabilities.map((c) => (
                  <Badge key={c} variant="accent">
                    {CAPABILITY_LABELS[c]}
                  </Badge>
                ))}
              </div>
              {element.toolTags.length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Works with
                  </p>
                  <ul className="mt-1.5 space-y-1">
                    {element.toolTags.map((t) => (
                      <li key={t} className="text-xs text-slate-500 dark:text-slate-400">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Link
            href="/composer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Compose with this pack <ArrowRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>
    </div>
  );
}
