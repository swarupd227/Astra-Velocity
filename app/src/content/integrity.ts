import type { ContentBundle } from "./types";

export interface IntegrityIssue {
  where: string;
  problem: string;
}

/**
 * Referential integrity across the content bundle. Zod validates shapes;
 * this validates the joins — every cross-entity key must resolve.
 */
export function checkBundleIntegrity(bundle: ContentBundle): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  const obligationKeys = new Set(bundle.obligations.map((o) => o.key));
  const kpiKeys = new Set(bundle.kpis.map((k) => k.key));
  const packKeys = new Set(bundle.packs.map((p) => p.key));
  const practiceKeys = new Set(bundle.bestPractices.map((b) => b.key));

  const dupes = (keys: string[], where: string) => {
    const seen = new Set<string>();
    for (const k of keys) {
      if (seen.has(k)) issues.push({ where, problem: `duplicate key "${k}"` });
      seen.add(k);
    }
  };
  dupes(bundle.sectors.map((s) => s.key), "sectors");
  dupes(bundle.scenarios.map((s) => s.key), "scenarios");
  dupes(bundle.obligations.map((o) => o.key), "obligations");
  dupes(bundle.kpis.map((k) => k.key), "kpis");
  dupes(bundle.packs.map((p) => p.key), "packs");
  dupes(bundle.elements.map((e) => e.key), "elements");
  dupes(bundle.bestPractices.map((b) => b.key), "bestPractices");
  dupes(bundle.dashboards.map((d) => d.key), "dashboards");

  for (const sector of bundle.sectors) {
    for (const key of sector.obligationKeys) {
      if (!obligationKeys.has(key))
        issues.push({ where: `sector ${sector.key}`, problem: `unknown obligation "${key}"` });
    }
    for (const key of sector.kpiKeys) {
      if (!kpiKeys.has(key))
        issues.push({ where: `sector ${sector.key}`, problem: `unknown kpi "${key}"` });
    }
  }

  for (const el of bundle.elements) {
    if (!packKeys.has(el.packKey))
      issues.push({ where: `element ${el.key}`, problem: `unknown pack "${el.packKey}"` });
    for (const key of el.bestPracticeKeys) {
      if (!practiceKeys.has(key))
        issues.push({ where: `element ${el.key}`, problem: `unknown best practice "${key}"` });
    }
    for (const key of el.obligationKeys ?? []) {
      if (!obligationKeys.has(key))
        issues.push({ where: `element ${el.key}`, problem: `unknown obligation "${key}"` });
    }
    for (const key of el.kpiKeys ?? []) {
      if (!kpiKeys.has(key))
        issues.push({ where: `element ${el.key}`, problem: `unknown kpi "${key}"` });
    }
    if (el.type === "agent" && !el.agentMeta)
      issues.push({ where: `element ${el.key}`, problem: "agent element missing agentMeta" });
    const hasScenario = Object.values(el.scenarioAffinity).some((v) => (v ?? 0) > 0);
    const hasSector = Object.values(el.sectorAffinity).some((v) => (v ?? 0) > 0);
    if (!hasScenario)
      issues.push({ where: `element ${el.key}`, problem: "no non-zero scenario affinity" });
    if (!hasSector)
      issues.push({ where: `element ${el.key}`, problem: "no non-zero sector affinity" });
  }

  for (const bp of bundle.bestPractices) {
    for (const key of bp.obligationKeys ?? []) {
      if (!obligationKeys.has(key))
        issues.push({ where: `best practice ${bp.key}`, problem: `unknown obligation "${key}"` });
    }
  }

  // Every pack should have at least one element; every practice should justify something.
  const packsWithElements = new Set(bundle.elements.map((e) => e.packKey));
  for (const pack of bundle.packs) {
    if (!packsWithElements.has(pack.key))
      issues.push({ where: `pack ${pack.key}`, problem: "pack has no elements" });
  }
  const referencedPractices = new Set(bundle.elements.flatMap((e) => e.bestPracticeKeys));
  for (const bp of bundle.bestPractices) {
    if (!referencedPractices.has(bp.key))
      issues.push({
        where: `best practice ${bp.key}`,
        problem: "not referenced by any element (orphaned practice)",
      });
  }

  return issues;
}
