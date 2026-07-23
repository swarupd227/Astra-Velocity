import type {
  BestPractice,
  Capability,
  Dashboard,
  Element,
  FrictionPattern,
  Obligation,
  Platform,
  PlatformCategory,
  PlatformKey,
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
  platforms: Platform[];
  frictionPatterns: FrictionPattern[];
}

export interface ComposeInput {
  sector: SectorKey;
  scenario: ScenarioKey;
  /**
   * The EFFECTIVE/union set of platform keys to score element fit against.
   * The caller is responsible for unioning a project's primary platformKeys
   * with every ProjectPlatformVariant.platformKeys (see `unionPlatformKeys`)
   * before constructing this input — this field does not distinguish primary
   * from variant stacks, it only asks "is this platform in play anywhere".
   */
  platformKeys: PlatformKey[];
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
const PLATFORM_WEIGHT = 2;

function affinity(map: Partial<Record<string, number>>, key: string): number {
  return map[key] ?? 0;
}

function resolvePlatformNames(keys: PlatformKey[], platforms: Platform[]): string[] {
  const byKey = new Map(platforms.map((p) => [p.key, p.name]));
  return keys.map((k) => byKey.get(k)).filter((n): n is string => Boolean(n));
}

export function scoreElement(
  el: Element,
  input: ComposeInput,
  sector: Sector,
  scenario: Scenario,
  ctx: Pick<EngineContext, "platforms">,
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const scenarioFit = affinity(el.scenarioAffinity, input.scenario);
  const sectorFit = affinity(el.sectorAffinity, input.sector);

  // Authoring convention: broadly applicable elements list many sectors (1-2),
  // specialized ones only theirs. Zero sector affinity means "not for this
  // sector" — a life glossary must never reach a P&C composition.
  if (sectorFit === 0) return { score: 0, reasons };

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

  // Platform-affinity: an element only needs to fit ONE platform in the selected
  // stack to be relevant, so we take the max affinity across input.platformKeys
  // rather than summing (a project runs multiple platforms at once). Elements
  // without any platformAffinity data are neutral — not excluded, not penalized —
  // since platform authoring is intentionally bounded to a subset of the library.
  const platformMap = el.platformAffinity;
  if (platformMap && input.platformKeys.length > 0) {
    let platformFit = 0;
    for (const key of input.platformKeys) {
      const fit = affinity(platformMap, key);
      if (fit > platformFit) platformFit = fit;
    }
    if (platformFit > 0) score += platformFit * PLATFORM_WEIGHT;
    if (platformFit >= 2) {
      const matchedKeys = input.platformKeys.filter(
        (key) => affinity(platformMap, key) === platformFit,
      );
      const names = resolvePlatformNames(matchedKeys, ctx.platforms);
      if (names.length > 0) {
        reasons.push(`Strong fit for ${names.join(", ")}`);
      }
      const variantNote = el.platformVariants?.find((v) => matchedKeys.includes(v.platformKey));
      if (variantNote) {
        const note =
          variantNote.note.length > 100 ? `${variantNote.note.slice(0, 97)}...` : variantNote.note;
        reasons.push(note);
      }
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
    const { score, reasons } = scoreElement(el, input, sector, scenario, ctx);
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

// ---------- Platform role map & friction analysis ----------

export interface CapabilityRoleMapRow {
  capability: Capability;
  /** Platforms in the input set whose capabilityRoles[capability] === "anchor". */
  anchors: PlatformKey[];
  /** ..."supports". */
  supports: PlatformKey[];
  /** ..."enforces". */
  enforces: PlatformKey[];
  hasCoverage: boolean;
}

export interface MatchedFrictionPattern {
  pattern: FrictionPattern;
  /** Which of the pattern's involvedCategories are present in the selected stack. */
  matchedCategories: PlatformCategory[];
}

export interface RoleMapReport {
  /** One row per Capability, in CAPABILITIES order. */
  byCapability: CapabilityRoleMapRow[];
  /** Patterns where every involvedCategory is represented in the selected stack. */
  frictionMatches: MatchedFrictionPattern[];
  /** Capabilities with zero role coverage across the selected stack. */
  uncoveredCapabilities: Capability[];
}

/**
 * Maps a selected platform stack onto capability roles (anchor/supports/enforces)
 * and surfaces friction patterns whose full category set is represented — the
 * "how these tools actually divide the work, and where they'll rub" view.
 */
export function computeRoleMap(
  input: { platformKeys: PlatformKey[] },
  ctx: Pick<EngineContext, "platforms" | "frictionPatterns">,
): RoleMapReport {
  const selectedKeys = new Set(input.platformKeys);
  const selectedPlatforms = ctx.platforms.filter((p) => selectedKeys.has(p.key));

  const byCapability: CapabilityRoleMapRow[] = CAPABILITIES.map((capability) => {
    const anchors: PlatformKey[] = [];
    const supports: PlatformKey[] = [];
    const enforces: PlatformKey[] = [];
    for (const platform of selectedPlatforms) {
      const role = platform.capabilityRoles[capability];
      if (role === "anchor") anchors.push(platform.key);
      else if (role === "supports") supports.push(platform.key);
      else if (role === "enforces") enforces.push(platform.key);
    }
    return {
      capability,
      anchors,
      supports,
      enforces,
      hasCoverage: anchors.length + supports.length + enforces.length > 0,
    };
  });

  const uncoveredCapabilities = byCapability
    .filter((row) => !row.hasCoverage)
    .map((row) => row.capability);

  // Matched by category, not exact platform: the selected stack's category set
  // must be a superset of the pattern's involvedCategories.
  const selectedCategories = new Set(selectedPlatforms.map((p) => p.category));
  const frictionMatches: MatchedFrictionPattern[] = ctx.frictionPatterns
    .filter((pattern) => pattern.involvedCategories.every((c) => selectedCategories.has(c)))
    .map((pattern) => ({
      pattern,
      matchedCategories: pattern.involvedCategories.filter((c) => selectedCategories.has(c)),
    }));

  return { byCapability, frictionMatches, uncoveredCapabilities };
}

/**
 * Dedupe union of a project's primary platform keys and every named variant's
 * platform keys — the EFFECTIVE stack used to build ComposeInput.platformKeys
 * for element scoring. Order-preserving (primary first), but callers should
 * treat the result as a set.
 */
export function unionPlatformKeys(
  primary: string[],
  variants: { platformKeys: string[] }[],
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const key of [...primary, ...variants.flatMap((v) => v.platformKeys)]) {
    if (!seen.has(key)) {
      seen.add(key);
      result.push(key);
    }
  }
  return result;
}
