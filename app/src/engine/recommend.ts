import type {
  BestPractice,
  Capability,
  Dashboard,
  Element,
  Obligation,
  Scenario,
  ScenarioKey,
  Sector,
  SectorKey,
} from "@/content/types";
import { CAPABILITIES, CAPABILITY_LABELS } from "@/content/types";

/**
 * The recommendation engine: deterministic, explainable scoring of velocity-pack
 * elements and dashboards for a (sector, scenario) pair.
 *
 * Every recommendation carries human-readable reasons — the "why this is in your
 * pack" surface that keeps best practices and obligations visible (structurally,
 * not as an afterthought).
 */

export interface EngineContext {
  sectors: Sector[];
  scenarios: Scenario[];
  elements: Element[];
  dashboards: Dashboard[];
  bestPractices: BestPractice[];
  obligations: Obligation[];
}

export interface ComposeInput {
  sector: SectorKey;
  scenario: ScenarioKey;
}

export interface ElementRecommendation {
  element: Element;
  score: number;
  /** Ordered, human-readable justifications. First reason is the headline. */
  reasons: string[];
  bestPractices: BestPractice[];
  tier: "core" | "recommended" | "optional";
}

export interface DashboardRecommendation {
  dashboard: Dashboard;
  score: number;
  reasons: string[];
}

export interface CoverageReport {
  /** 0-100 per capability, weighted by scenario emphasis. */
  byCapability: Record<Capability, { emphasis: number; covered: number; label: string }>;
  /** 0-100 overall weighted coverage. */
  overall: number;
  gaps: Capability[];
}

const SCENARIO_WEIGHT = 3;
const SECTOR_WEIGHT = 2;
const OBLIGATION_BONUS = 2;
const EMPHASIS_WEIGHT = 1;

function affinity(map: Partial<Record<string, number>>, key: string): number {
  return map[key] ?? 0;
}

export function scoreElement(
  el: Element,
  input: ComposeInput,
  sector: Sector,
  scenario: Scenario,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const scenarioFit = affinity(el.scenarioAffinity, input.scenario);
  const sectorFit = affinity(el.sectorAffinity, input.sector);

  let score = scenarioFit * SCENARIO_WEIGHT + sectorFit * SECTOR_WEIGHT;

  if (scenarioFit >= 3) reasons.push(`Signature asset for the ${scenario.name} scenario`);
  else if (scenarioFit === 2) reasons.push(`Strong fit for ${scenario.name}`);
  if (sectorFit >= 3) reasons.push(`Built for ${sector.name}`);
  else if (sectorFit === 2) reasons.push(`Proven pattern in ${sector.name}`);

  // Obligation alignment: element serves a regulation that binds this sector.
  const sectorObligations = new Set(sector.obligationKeys);
  const matchedObligations = (el.obligationKeys ?? []).filter((o) => sectorObligations.has(o));
  if (matchedObligations.length > 0) {
    score += Math.min(matchedObligations.length, 2) * OBLIGATION_BONUS;
  }

  // Capability alignment: element covers what the scenario emphasizes.
  const emphasisSum = el.capabilities.reduce(
    (sum, cap) => sum + affinity(scenario.capabilityEmphasis, cap),
    0,
  );
  if (emphasisSum > 0) {
    score += Math.min(emphasisSum, 6) * EMPHASIS_WEIGHT;
    const topCaps = el.capabilities
      .filter((cap) => affinity(scenario.capabilityEmphasis, cap) >= 2)
      .map((cap) => CAPABILITY_LABELS[cap]);
    if (topCaps.length > 0) {
      reasons.push(`Covers ${topCaps.join(", ")} — where this scenario concentrates`);
    }
  }

  return { score, reasons };
}

export function recommendElements(
  input: ComposeInput,
  ctx: EngineContext,
): ElementRecommendation[] {
  const sector = ctx.sectors.find((s) => s.key === input.sector);
  const scenario = ctx.scenarios.find((s) => s.key === input.scenario);
  if (!sector || !scenario) throw new Error("Unknown sector or scenario");

  const practicesByKey = new Map(ctx.bestPractices.map((b) => [b.key, b]));
  const obligationsByKey = new Map(ctx.obligations.map((o) => [o.key, o]));
  const sectorObligations = new Set(sector.obligationKeys);

  const recs: ElementRecommendation[] = [];
  for (const el of ctx.elements) {
    const { score, reasons } = scoreElement(el, input, sector, scenario);
    if (score <= 0) continue;

    const practices = el.bestPracticeKeys
      .map((k) => practicesByKey.get(k))
      .filter((b): b is BestPractice => Boolean(b));
    // Best practice as rationale — always present, always visible.
    if (practices[0]) reasons.push(`Operationalizes: “${practices[0].title}”`);

    for (const key of el.obligationKeys ?? []) {
      if (sectorObligations.has(key)) {
        const ob = obligationsByKey.get(key);
        if (ob) reasons.push(`Evidence for ${ob.name}`);
      }
    }

    recs.push({
      element: el,
      score,
      reasons,
      bestPractices: practices,
      tier: score >= 10 ? "core" : score >= 6 ? "recommended" : "optional",
    });
  }

  return recs.sort((a, b) => b.score - a.score || a.element.name.localeCompare(b.element.name));
}

export function recommendDashboards(
  input: ComposeInput,
  ctx: EngineContext,
): DashboardRecommendation[] {
  const sector = ctx.sectors.find((s) => s.key === input.sector);
  const scenario = ctx.scenarios.find((s) => s.key === input.scenario);
  if (!sector || !scenario) throw new Error("Unknown sector or scenario");

  return ctx.dashboards
    .map((d) => {
      const scenarioFit = affinity(d.scenarioAffinity, input.scenario);
      const sectorFit = affinity(d.sectorAffinity, input.sector);
      // Governance dashboards are broadly applicable; business dashboards must earn fit.
      const base = d.category === "governance" ? 2 : 0;
      const score = base + scenarioFit * SCENARIO_WEIGHT + sectorFit * SECTOR_WEIGHT;
      const reasons: string[] = [];
      if (scenarioFit >= 2) reasons.push(`Answers the questions ${scenario.name} raises`);
      if (sectorFit >= 2) reasons.push(`Tuned to ${sector.name}`);
      if (d.builtIn) reasons.push("Available live in-platform from day one");
      return { dashboard: d, score, reasons };
    })
    .filter((r) => r.score >= 2)
    .sort((a, b) => b.score - a.score || a.dashboard.name.localeCompare(b.dashboard.name));
}

/** Coverage of the scenario's capability emphasis by the currently selected elements. */
export function computeCoverage(
  selected: Element[],
  scenario: Scenario,
): CoverageReport {
  const byCapability = {} as CoverageReport["byCapability"];
  let weightedSum = 0;
  let weightTotal = 0;
  const gaps: Capability[] = [];

  for (const cap of CAPABILITIES) {
    const emphasis = affinity(scenario.capabilityEmphasis, cap);
    // Depth of coverage: how many selected elements serve this capability (2 ≈ full).
    const count = selected.filter((e) => e.capabilities.includes(cap)).length;
    const covered = Math.min(100, count * 50);
    byCapability[cap] = { emphasis, covered, label: CAPABILITY_LABELS[cap] };
    if (emphasis > 0) {
      weightedSum += covered * emphasis;
      weightTotal += 100 * emphasis;
      if (covered === 0) gaps.push(cap);
    }
  }

  return {
    byCapability,
    overall: weightTotal === 0 ? 0 : Math.round((weightedSum / weightTotal) * 100),
    gaps,
  };
}
