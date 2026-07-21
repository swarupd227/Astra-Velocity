import { CircleAlert, OctagonAlert, Square, TriangleAlert } from "lucide-react";
import type { Artifact, DataDomain } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { CHART } from "@/components/viz/tokens";
import { artifactStat } from "./artifact-stat";
import { CopyButton } from "./copy-button";

/**
 * Renders an element's working artifact as a real asset — tables, checklists,
 * code, curricula — never a marketing paragraph. Server component; the only
 * client island is the copy button on code artifacts.
 */

const SEVERITY_META = {
  critical: { label: "Critical", color: CHART.status.critical, Icon: OctagonAlert },
  serious: { label: "Serious", color: CHART.status.serious, Icon: CircleAlert },
  warning: { label: "Warning", color: CHART.status.warning, Icon: TriangleAlert },
} as const;

function SeverityChip({ severity }: { severity: keyof typeof SEVERITY_META }) {
  const { label, color, Icon } = SEVERITY_META[severity];
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{ color, borderColor: `${color}59`, backgroundColor: `${color}1a` }}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

function DomainChip({ domain }: { domain: DataDomain }) {
  return (
    <Badge variant="outline" className="whitespace-nowrap text-[11px]">
      {domain}
    </Badge>
  );
}

function DataTable({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-950/60">
            {head.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const ROW = "border-b border-slate-800/60 align-top last:border-0";
const CELL = "px-3 py-2.5";

function ArtifactBody({ artifact }: { artifact: Artifact }) {
  switch (artifact.kind) {
    case "glossary":
      return (
        <DataTable head={["Term", "Definition", "Domain"]}>
          {artifact.terms.map((t) => (
            <tr key={t.term} className={ROW}>
              <td className={`${CELL} whitespace-nowrap font-medium text-white`}>{t.term}</td>
              <td className={`${CELL} text-slate-300`}>
                {t.definition}
                {t.note && <span className="mt-1 block text-xs text-slate-500">{t.note}</span>}
              </td>
              <td className={CELL}>{t.domain && <DomainChip domain={t.domain} />}</td>
            </tr>
          ))}
        </DataTable>
      );

    case "dq-rules":
      return (
        <DataTable head={["Rule", "Expression", "Severity"]}>
          {artifact.rules.map((r) => (
            <tr key={r.id} className={ROW}>
              <td className={`${CELL} min-w-[220px]`}>
                <span className="font-mono text-[11px] text-teal-400">{r.id}</span>
                <span className="block font-medium text-white">{r.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{r.rationale}</span>
              </td>
              <td className={CELL}>
                <code className="block whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
                  {r.expression}
                </code>
              </td>
              <td className={CELL}>
                <SeverityChip severity={r.severity} />
              </td>
            </tr>
          ))}
        </DataTable>
      );

    case "cde-set":
      return (
        <DataTable head={["CDE", "Domain", "Definition", "Quality dimensions"]}>
          {artifact.cdes.map((c) => (
            <tr key={c.name} className={ROW}>
              <td className={`${CELL} whitespace-nowrap font-medium text-white`}>{c.name}</td>
              <td className={CELL}>
                <DomainChip domain={c.domain} />
              </td>
              <td className={`${CELL} text-slate-300`}>
                {c.definition}
                {c.exampleIssue && (
                  <span className="mt-1 block text-xs text-amber-300/80">
                    e.g. {c.exampleIssue}
                  </span>
                )}
              </td>
              <td className={CELL}>
                <span className="flex flex-wrap gap-1">
                  {c.qualityDimensions.map((d) => (
                    <Badge key={d} variant="default" className="text-[11px]">
                      {d}
                    </Badge>
                  ))}
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      );

    case "checklist":
      return (
        <div className="space-y-4">
          {artifact.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <h4 className="text-sm font-semibold text-white">{section.title}</h4>
              <ul className="mt-2.5 space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                    <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "template":
      return (
        <div className="space-y-3">
          {artifact.sections.map((section, i) => (
            <div key={section.title} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs text-teal-400">{String(i + 1).padStart(2, "0")}</span>
                <h4 className="text-sm font-semibold text-white">{section.title}</h4>
              </div>
              <p className="mt-1 text-sm text-slate-400">{section.purpose}</p>
              {section.fields && section.fields.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {section.fields.map((f) => (
                    <span
                      key={f}
                      className="rounded border border-slate-700/80 bg-slate-900 px-1.5 py-0.5 font-mono text-[11px] text-slate-300"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "code":
      return (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/60 px-4 py-2">
            <span className="font-mono text-xs uppercase tracking-wide text-teal-400">
              {artifact.language}
            </span>
            <CopyButton text={artifact.snippet} />
          </div>
          <p className="border-b border-slate-800/60 bg-slate-950/40 px-4 py-2 text-xs text-slate-500">
            {artifact.description}
          </p>
          <div className="overflow-x-auto bg-slate-950/80">
            <pre className="px-4 py-4 font-mono text-[13px] leading-relaxed text-slate-200">
              {artifact.snippet}
            </pre>
          </div>
        </div>
      );

    case "curriculum":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {artifact.modules.map((m) => (
            <div key={m.code} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" className="font-mono">
                  {m.code}
                </Badge>
                <span className="text-[11px] uppercase tracking-wide text-slate-500">{m.format}</span>
              </div>
              <h4 className="mt-2 text-sm font-semibold text-white">{m.title}</h4>
              <ul className="mt-2 space-y-1">
                {m.topics.map((t) => (
                  <li key={t} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-teal-500/70" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case "method":
      return (
        <ol className="space-y-3">
          {artifact.steps.map((step, i) => (
            <li key={step.name} className="flex gap-3.5 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-500/15 font-mono text-sm font-semibold text-teal-300">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white">{step.name}</h4>
                <p className="mt-1 text-sm text-slate-400">{step.description}</p>
                {step.decisionRule && (
                  <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-200">
                    <span className="font-semibold">Decision rule: </span>
                    {step.decisionRule}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      );

    case "reference-data":
      return (
        <div className="space-y-5">
          {artifact.sets.map((set) => (
            <div key={set.name}>
              <h4 className="mb-2 text-sm font-semibold text-white">
                {set.name}{" "}
                <span className="font-normal text-slate-500">· {set.codes.length} codes</span>
              </h4>
              <DataTable head={["Code", "Label", "Note"]}>
                {set.codes.map((c) => (
                  <tr key={c.code} className={ROW}>
                    <td className={`${CELL} whitespace-nowrap font-mono text-xs text-teal-300`}>
                      {c.code}
                    </td>
                    <td className={`${CELL} text-slate-200`}>{c.label}</td>
                    <td className={`${CELL} text-xs text-slate-500`}>{c.note}</td>
                  </tr>
                ))}
              </DataTable>
            </div>
          ))}
        </div>
      );

    case "metric-spec":
      return (
        <DataTable head={["Metric", "Formula", "Target"]}>
          {artifact.metrics.map((m) => (
            <tr key={m.name} className={ROW}>
              <td className={`${CELL} min-w-[220px]`}>
                <span className="font-medium text-white">{m.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{m.definition}</span>
              </td>
              <td className={CELL}>
                <code className="block whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-300">
                  {m.formula}
                </code>
              </td>
              <td className={`${CELL} whitespace-nowrap text-sm text-teal-300`}>{m.target}</td>
            </tr>
          ))}
        </DataTable>
      );
  }
}

export function ArtifactViewer({ artifact }: { artifact: Artifact }) {
  const note = "note" in artifact ? artifact.note : undefined;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-sm font-semibold text-teal-300">{artifactStat(artifact)}</span>
        {note && <span className="text-xs text-slate-500">{note}</span>}
      </div>
      <div className="mt-3">
        <ArtifactBody artifact={artifact} />
      </div>
    </div>
  );
}
