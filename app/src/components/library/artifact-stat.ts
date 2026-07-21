import type { Artifact, Element } from "@/content/types";
import { ARTIFACTS } from "@/content/data/artifacts";

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
