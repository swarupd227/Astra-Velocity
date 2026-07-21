import { CAPABILITIES, CAPABILITY_LABELS, type Capability } from "@/content/types";

/**
 * Deterministic simulation engine for the live governance dashboards.
 *
 * Pure and seeded: the same seed string always produces byte-identical output.
 * No Date.now(), no Math.random() — a mulberry32 PRNG seeded from a string
 * hash (project id or workspace slug) drives every draw, so demo telemetry is
 * stable across renders and differs believably between workspaces.
 */

// ---------- PRNG ----------

/** xmur3-style string hash → 32-bit seed. */
export function hashSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 PRNG — small, fast, deterministic. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (rand: () => number, min: number, max: number) => min + rand() * (max - min);
const intBetween = (rand: () => number, min: number, max: number) =>
  Math.floor(between(rand, min, max + 1));
const pick = <T>(rand: () => number, arr: readonly T[]): T =>
  arr[Math.min(arr.length - 1, Math.floor(rand() * arr.length))];
const round1 = (n: number) => Math.round(n * 10) / 10;

// ---------- Plan timeline ----------

/** Plan quarters Q1-26 … Q4-28. */
export const PLAN_QUARTERS = [
  "Q1 26", "Q2 26", "Q3 26", "Q4 26",
  "Q1 27", "Q2 27", "Q3 27", "Q4 27",
  "Q1 28", "Q2 28", "Q3 28", "Q4 28",
] as const;

/** "Today" sits at index 5 (Q2-27): actuals through here, projections beyond. */
export const CURRENT_QUARTER_INDEX = 5;

// ---------- Output types ----------

export interface SimBurnUpPoint {
  label: string;
  actual: number | null;
  projected: number;
}

export interface SimProduct {
  key: string;
  name: string;
  wave: 1 | 2 | 3;
  domain: string;
  /** Composite Governance Performance Index, 0–100, one value per plan quarter. */
  gpiByQuarter: number[];
  currentGpi: number;
  previousGpi: number;
  atTarget: boolean;
}

export interface CapabilityCoverage {
  capability: Capability;
  label: string;
  coveredPct: number;
}

export interface SeverityCount {
  severity: "critical" | "serious" | "warning";
  count: number;
}

export interface CapabilityDq {
  capability: Capability;
  label: string;
  rules: number;
  executions: number;
  passRate: number;
  breaches: SeverityCount[];
}

export interface AgingBucket {
  bucket: string;
  count: number;
}

export interface ReportInputAtRisk {
  name: string;
  severity: "critical" | "serious" | "warning";
  openBreaches: number;
  daysOpen: number;
  owner: string;
}

export interface AgentLeverage {
  agentKey: string;
  agentName: string;
  capability: Capability;
  acceptanceRate: number;
  draftedMinutesPerItem: number;
  manualMinutesPerItem: number;
  itemsThisQuarter: number;
  leverageRatio: number;
}

export interface EconomicsPoint {
  label: string;
  /** Cumulative steward-weeks under the manual baseline. */
  baseline: number;
  /** Cumulative steward-weeks actually spent (null beyond current quarter). */
  actual: number | null;
  /** Projection of the velocity-pack curve (null before current quarter). */
  projected: number | null;
}

export interface SimResult {
  seedKey: string;
  quarters: readonly string[];
  currentQuarterIndex: number;
  portfolio: {
    products: SimProduct[];
    targetMaturityGpi: number;
    burnUp: SimBurnUpPoint[];
    burnUpTarget: number;
    atTargetNow: number;
    capabilityCoverage: CapabilityCoverage[];
  };
  dq: {
    byCapability: CapabilityDq[];
    severityTotals: SeverityCount[];
    ownerAging: AgingBucket[];
    reportInputsAtRisk: ReportInputAtRisk[];
    slaCompliancePct: number;
    medianTriageHours: number;
    medianResolveDays: number;
  };
  leverage: {
    agents: AgentLeverage[];
    overallAcceptanceRate: number;
    draftedShareOfDecisions: number;
  };
  value: {
    incidentsAvoided: number;
    accessCycleDaysTrend: number[];
    accessCycleDaysStart: number;
    accessCycleDaysNow: number;
    stewardWeeksSaved: number;
    economics: EconomicsPoint[];
  };
}

export interface SimOptions {
  /** Burn-up goal: products at target maturity by the final plan quarter. */
  target?: number;
  /**
   * When a composed project exists, pass the sum of its selected elements'
   * effortSavedStewardWeeks; the sim uses it verbatim instead of a drawn value.
   */
  stewardWeeksSaved?: number | null;
}

// ---------- Name pools (insurance-flavored, client-generic) ----------

const PRODUCT_POOL: ReadonlyArray<readonly [string, string]> = [
  ["Policy Master — Personal Auto", "policy"],
  ["Claims Core — Property", "claim"],
  ["Earned Premium Ledger", "premium"],
  ["Loss Reserving Triangles", "reserve"],
  ["Reinsurance Cession Register", "reinsurance-cession"],
  ["Producer Hierarchy & Appointments", "producer-distribution"],
  ["Billing & Receivables Mart", "billing"],
  ["Exposure Schedule — Commercial Property", "exposure"],
  ["Party & Household Golden Record", "party"],
  ["Schedule P Statutory Feed", "reserve"],
  ["Catastrophe Exposure Aggregates", "exposure"],
  ["GL Tie-Point Reconciliation Mart", "financials-gl"],
  ["Rate Filing Workbench", "product"],
  ["SIU Case Ledger", "claim"],
  ["Claims Litigation Tracker", "claim"],
  ["Premium Audit Results", "premium"],
  ["Statutory Annual Statement Inputs", "financials-gl"],
  ["Actuarial Central Estimate Mart", "reserve"],
  ["Underwriting Decision Log", "policy"],
  ["Policy Endorsement Stream", "policy"],
  ["FNOL Intake Events", "claim"],
  ["Subrogation Recovery Ledger", "claim"],
  ["Treaty Terms Register", "reinsurance-cession"],
  ["Bordereaux Intake — Program Business", "premium"],
  ["Group Benefits Census", "party"],
  ["Annuity Valuation Extract", "policy"],
  ["Investment Holdings Snapshot", "financials-gl"],
  ["Agency Commission Accruals", "producer-distribution"],
  ["Escheatment Watchlist", "billing"],
  ["Surety Bond Obligations Register", "exposure"],
];

const OWNER_POOL = [
  "M. Osei", "T. Nguyen", "R. Castillo", "J. Whitfield",
  "A. Kaplan", "S. Iyer", "L. Moreau", "D. Okafor",
] as const;

const REPORT_INPUT_POOL = [
  "Earned premium by state",
  "Schedule P triangle feed",
  "COPE completeness — property book",
  "Paid vs. incurred reconciliation",
  "Ceded premium bordereaux",
  "IBNR feed — casualty lines",
  "Statutory Page 14 inputs",
  "Loss ratio by program",
  "NPPI exposure register",
  "Agency commission accruals",
  "Cat model exposure extract",
  "Unearned premium reserve rollforward",
] as const;

const AGENT_POOL: ReadonlyArray<{ key: string; name: string; capability: Capability }> = [
  { key: "glossary-scout", name: "Glossary Scout", capability: "catalog_metadata" },
  { key: "rule-smith", name: "Rule Smith", capability: "data_quality" },
  { key: "triage-marshal", name: "Triage Marshal", capability: "stewardship_ops" },
  { key: "lineage-tracer", name: "Lineage Tracer", capability: "lineage" },
  { key: "cde-classifier", name: "CDE Classifier", capability: "classification" },
  { key: "alignment-auditor", name: "Alignment Auditor", capability: "access_policy" },
];

// ---------- Simulation ----------

const TARGET_MATURITY_GPI = 80;

function simulatePortfolio(rand: () => number, target: number): SimResult["portfolio"] {
  const n = intBetween(rand, 18, 30);
  const nQ = PLAN_QUARTERS.length;

  // Shuffle the pool deterministically, take n products.
  const pool = [...PRODUCT_POOL];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const products: SimProduct[] = pool.slice(0, n).map(([name, domain], idx) => {
    const wave = (idx < n / 3 ? 1 : idx < (2 * n) / 3 ? 2 : 3) as 1 | 2 | 3;
    const startQuarter = (wave - 1) * 2 + intBetween(rand, 0, 1);
    let gpi = between(rand, 6, 26);
    const pace = between(rand, 7, 16) - (wave - 1) * 1.6;
    const gpiByQuarter: number[] = [];
    for (let q = 0; q < nQ; q++) {
      if (q < startQuarter) {
        gpiByQuarter.push(round1(Math.min(gpi, 8)));
        continue;
      }
      const roll = rand();
      let delta: number;
      if (roll < 0.14) delta = between(rand, -0.5, 1); // plateau
      else if (roll < 0.22) delta = between(rand, -6, -2); // regression (lapsed control, re-cert)
      else delta = between(rand, pace * 0.6, pace * 1.4);
      gpi = Math.max(0, Math.min(100, gpi + delta));
      gpiByQuarter.push(round1(gpi));
    }
    const currentGpi = gpiByQuarter[CURRENT_QUARTER_INDEX];
    return {
      key: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      name,
      wave,
      domain,
      gpiByQuarter,
      currentGpi,
      previousGpi: gpiByQuarter[CURRENT_QUARTER_INDEX - 1],
      atTarget: currentGpi >= TARGET_MATURITY_GPI,
    };
  });

  // Burn-up: portfolio-wide count of products at target maturity per quarter,
  // an S-ish plan curve reaching the configured target by the final quarter.
  const burnUp: SimBurnUpPoint[] = PLAN_QUARTERS.map((label, i) => {
    const t = (i + 1) / nQ;
    const projected = Math.round(target * Math.pow(t, 1.6));
    return { label, projected, actual: null };
  });
  let actual = Math.max(2, Math.round(burnUp[0].projected * between(rand, 0.7, 1.1)));
  for (let i = 0; i <= CURRENT_QUARTER_INDEX; i++) {
    const plan = burnUp[i].projected;
    const gain = Math.max(0, Math.round((plan - actual) * between(rand, 0.55, 1.25)));
    actual = Math.min(target, actual + gain + intBetween(rand, 0, 2));
    burnUp[i].actual = actual;
  }
  // Re-anchor the projection so it continues from the last actual to target.
  const lastActual = burnUp[CURRENT_QUARTER_INDEX].actual ?? 0;
  for (let i = CURRENT_QUARTER_INDEX; i < nQ; i++) {
    const t = (i - CURRENT_QUARTER_INDEX) / (nQ - 1 - CURRENT_QUARTER_INDEX);
    burnUp[i].projected = Math.round(lastActual + (target - lastActual) * Math.pow(t, 1.15));
  }

  const capabilityCoverage: CapabilityCoverage[] = CAPABILITIES.map((capability) => ({
    capability,
    label: CAPABILITY_LABELS[capability],
    coveredPct: intBetween(rand, 34, 96),
  }));

  return {
    products,
    targetMaturityGpi: TARGET_MATURITY_GPI,
    burnUp,
    burnUpTarget: target,
    atTargetNow: products.filter((p) => p.atTarget).length,
    capabilityCoverage,
  };
}

function simulateDq(rand: () => number): SimResult["dq"] {
  const byCapability: CapabilityDq[] = CAPABILITIES.map((capability) => {
    const rules = intBetween(rand, 18, 140);
    return {
      capability,
      label: CAPABILITY_LABELS[capability],
      rules,
      executions: rules * intBetween(rand, 180, 620),
      passRate: round1(between(rand, 93.5, 99.8)),
      breaches: [
        { severity: "critical", count: intBetween(rand, 0, 4) },
        { severity: "serious", count: intBetween(rand, 1, 9) },
        { severity: "warning", count: intBetween(rand, 3, 18) },
      ],
    };
  });

  const severityTotals: SeverityCount[] = (["critical", "serious", "warning"] as const).map(
    (severity) => ({
      severity,
      count: byCapability.reduce(
        (sum, c) => sum + (c.breaches.find((b) => b.severity === severity)?.count ?? 0),
        0,
      ),
    }),
  );

  const ownerAging: AgingBucket[] = [
    { bucket: "0–3 days", count: intBetween(rand, 6, 18) },
    { bucket: "4–7 days", count: intBetween(rand, 4, 12) },
    { bucket: "8–14 days", count: intBetween(rand, 2, 8) },
    { bucket: "15+ days", count: intBetween(rand, 0, 5) },
  ];

  const riskCount = intBetween(rand, 5, 8);
  const inputs = [...REPORT_INPUT_POOL];
  for (let i = inputs.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [inputs[i], inputs[j]] = [inputs[j], inputs[i]];
  }
  const reportInputsAtRisk: ReportInputAtRisk[] = inputs
    .slice(0, riskCount)
    .map((name) => {
      const roll = rand();
      const severity = roll < 0.2 ? "critical" : roll < 0.55 ? "serious" : "warning";
      return {
        name,
        severity: severity as ReportInputAtRisk["severity"],
        openBreaches: intBetween(rand, 1, 6),
        daysOpen: intBetween(rand, 1, 21),
        owner: pick(rand, OWNER_POOL),
      };
    })
    .sort((a, b) => b.daysOpen - a.daysOpen);

  return {
    byCapability,
    severityTotals,
    ownerAging,
    reportInputsAtRisk,
    slaCompliancePct: round1(between(rand, 82, 97)),
    medianTriageHours: round1(between(rand, 3, 18)),
    medianResolveDays: round1(between(rand, 2, 9)),
  };
}

function simulateLeverage(rand: () => number): SimResult["leverage"] {
  const agents: AgentLeverage[] = AGENT_POOL.map((a) => {
    const drafted = round1(between(rand, 4, 12));
    const manual = round1(between(rand, 25, 90));
    return {
      agentKey: a.key,
      agentName: a.name,
      capability: a.capability,
      acceptanceRate: round1(between(rand, 55, 95)) / 100,
      draftedMinutesPerItem: drafted,
      manualMinutesPerItem: manual,
      itemsThisQuarter: intBetween(rand, 24, 160),
      leverageRatio: round1(manual / drafted),
    };
  });
  const overall =
    agents.reduce((s, a) => s + a.acceptanceRate * a.itemsThisQuarter, 0) /
    agents.reduce((s, a) => s + a.itemsThisQuarter, 0);
  return {
    agents,
    overallAcceptanceRate: Math.round(overall * 1000) / 1000,
    draftedShareOfDecisions: round1(between(rand, 52, 84)) / 100,
  };
}

function simulateValue(
  rand: () => number,
  stewardWeeksSaved: number | null | undefined,
): SimResult["value"] {
  const nQ = PLAN_QUARTERS.length;

  // Access-provisioning cycle time: declining from weeks toward days.
  const start = between(rand, 19, 28);
  const floorDays = between(rand, 3, 6);
  const accessCycleDaysTrend: number[] = [];
  let cycle = start;
  for (let q = 0; q < nQ; q++) {
    accessCycleDaysTrend.push(round1(Math.max(floorDays, cycle)));
    cycle -= between(rand, 0.8, 3.2);
  }

  // Two-curve economics: cumulative steward-weeks, manual baseline vs. actuals.
  const baselinePerQuarter = between(rand, 26, 38);
  const economics: EconomicsPoint[] = [];
  let baseline = 0;
  let spent = 0;
  let velocityFactor = between(rand, 0.82, 0.92);
  const spentByQuarter: number[] = [];
  for (let q = 0; q < nQ; q++) {
    baseline += baselinePerQuarter;
    spent += baselinePerQuarter * velocityFactor;
    velocityFactor = Math.max(0.34, velocityFactor - between(rand, 0.03, 0.07));
    spentByQuarter.push(spent);
    economics.push({
      label: PLAN_QUARTERS[q],
      baseline: Math.round(baseline),
      actual: q <= CURRENT_QUARTER_INDEX ? Math.round(spent) : null,
      projected: q >= CURRENT_QUARTER_INDEX ? Math.round(spent) : null,
    });
  }

  const drawnSaved = Math.round(
    (economics[CURRENT_QUARTER_INDEX].baseline - spentByQuarter[CURRENT_QUARTER_INDEX]),
  );

  return {
    incidentsAvoided: intBetween(rand, 12, 40),
    accessCycleDaysTrend,
    accessCycleDaysStart: accessCycleDaysTrend[0],
    accessCycleDaysNow: accessCycleDaysTrend[CURRENT_QUARTER_INDEX],
    stewardWeeksSaved:
      stewardWeeksSaved != null && stewardWeeksSaved > 0
        ? Math.round(stewardWeeksSaved)
        : drawnSaved,
    economics,
  };
}

/** Run the full simulation for a seed key (project id or workspace slug). */
export function simulate(seedKey: string, opts: SimOptions = {}): SimResult {
  const target = opts.target ?? 150;
  const rand = mulberry32(hashSeed(seedKey));
  return {
    seedKey,
    quarters: PLAN_QUARTERS,
    currentQuarterIndex: CURRENT_QUARTER_INDEX,
    portfolio: simulatePortfolio(rand, target),
    dq: simulateDq(rand),
    leverage: simulateLeverage(rand),
    value: simulateValue(rand, opts.stewardWeeksSaved),
  };
}
