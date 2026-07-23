import type { Artifact, Element } from "@/content/types";
import { ARTIFACTS } from "@/content/data/artifacts";

/** Human label per artifact kind — drives the Library's "Format" filter. */
export const ARTIFACT_KIND_LABELS: Record<Artifact["kind"], string> = {
  glossary: "Glossary",
  "dq-rules": "DQ Rules",
  "cde-set": "CDE Set",
  checklist: "Checklist",
  template: "Template",
  code: "Code",
  curriculum: "Curriculum",
  method: "Method",
  "reference-data": "Reference Data",
  "metric-spec": "Metric Spec",
};

/** Flattened, searchable text pulled from an artifact's own body — so search
 * and the command palette can find a rule expression, a code snippet's
 * language/description, or a glossary term even when the element's own
 * pitch/description text never happens to say "code" or "yaml". */
export function artifactSearchText(artifact: Artifact): string {
  switch (artifact.kind) {
    case "glossary":
      return artifact.terms.map((t) => `${t.term} ${t.definition}`).join(" ");
    case "dq-rules":
      return artifact.rules.map((r) => `${r.name} ${r.expression} ${r.rationale}`).join(" ");
    case "cde-set":
      return artifact.cdes.map((c) => `${c.name} ${c.definition}`).join(" ");
    case "checklist":
      return artifact.sections.map((s) => `${s.title} ${s.items.join(" ")}`).join(" ");
    case "template":
      return artifact.sections.map((s) => `${s.title} ${s.purpose}`).join(" ");
    case "code":
      return `code ${artifact.language} ${artifact.description} ${artifact.snippet}`;
    case "curriculum":
      return artifact.modules.map((m) => `${m.title} ${m.topics.join(" ")}`).join(" ");
    case "method":
      return artifact.steps.map((s) => `${s.name} ${s.description}`).join(" ");
    case "reference-data":
      return artifact.sets.map((s) => `${s.name} ${s.codes.map((c) => c.label).join(" ")}`).join(" ");
    case "metric-spec":
      return artifact.metrics.map((m) => `${m.name} ${m.definition}`).join(" ");
  }
}

/**
 * Resolve an element's working artifact: prefer the published payload from the
 * content store, fall back to the authored ARTIFACTS map so freshly authored
 * assets show up before a reseed. Returns undefined when neither exists.
 */
export function resolveArtifact(element: Element): Artifact | undefined {
  return element.artifact ?? ARTIFACTS[element.key];
}

/** Concrete one-line stat for an artifact — "18 rules · 3 critical", "24 terms". */
export function artifactStat(artifact: Artifact): string {
  switch (artifact.kind) {
    case "glossary":
      return `${artifact.terms.length} terms`;
    case "dq-rules": {
      const critical = artifact.rules.filter((r) => r.severity === "critical").length;
      return critical > 0
        ? `${artifact.rules.length} rules · ${critical} critical`
        : `${artifact.rules.length} rules`;
    }
    case "cde-set":
      return `${artifact.cdes.length} CDEs`;
    case "checklist": {
      const items = artifact.sections.reduce((n, s) => n + s.items.length, 0);
      return `${items} checks · ${artifact.sections.length} section${artifact.sections.length === 1 ? "" : "s"}`;
    }
    case "template":
      return `${artifact.sections.length}-section template`;
    case "code":
      return `${artifact.language} code`;
    case "curriculum":
      return `${artifact.modules.length} modules`;
    case "method":
      return `${artifact.steps.length}-step method`;
    case "reference-data": {
      const codes = artifact.sets.reduce((n, s) => n + s.codes.length, 0);
      return `${codes} codes · ${artifact.sets.length} set${artifact.sets.length === 1 ? "" : "s"}`;
    }
    case "metric-spec":
      return `${artifact.metrics.length} metrics`;
  }
}

/**
 * Stat chip for a library card. Agents' working asset is their operating
 * contract, so they get a guardrail count when no other artifact exists.
 */
export function elementStat(element: Element): string | undefined {
  const artifact = resolveArtifact(element);
  if (artifact) return artifactStat(artifact);
  if (element.type === "agent" && element.agentMeta) {
    return `${element.agentMeta.guardrails.length} guardrails`;
  }
  return undefined;
}
