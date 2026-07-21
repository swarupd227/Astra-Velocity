import { describe, expect, it } from "vitest";
import type {
  BestPractice,
  Dashboard,
  Element,
  ElementType,
  Obligation,
  Scenario,
  Sector,
} from "@/content/types";
import { buildBlueprint, type BlueprintInput } from "./blueprint";

// ---------- Fixtures (minimal but type-complete) ----------

const sector: Sector = {
  key: "pc-personal",
  name: "P&C Personal Lines",
  tagline: "High-volume, rate-regulated, direct and agency distribution.",
  narrative:
    "Governance here is about rating accuracy and claims trust. Every filing depends on clean exposure data.",
  valueChain: [
    {
      key: "quote-bind",
      name: "Quote & Bind",
      description: "Rating and issuance",
      dataDomains: ["policy"],
      painPoints: ["Rating data drift"],
    },
  ],
  systemArchetypes: ["Policy admin suite", "Claims platform", "Rating engine", "Data lake"],
  distributionModel: "Direct + captive agents",
  signaturePainPoints: ["Rate filing rework", "Claims leakage", "Report disputes"],
  obligationKeys: ["ob-naic-model", "ob-state-doi"],
  kpiKeys: ["kpi-loss-ratio", "kpi-retention", "kpi-quote-rate"],
};

const scenario: Scenario = {
  key: "report-integrity",
  name: "Report Integrity",
  tagline: "One number, one definition, everywhere.",
  stakes: "Executives distrust the numbers; every meeting starts with reconciliation.",
  painPoints: [
    "Three versions of loss ratio circulate monthly.",
    "No owner for the metrics catalog.",
    "Report lineage is undocumented.",
    "Fixes are manual and repeated.",
  ],
  stakeholders: ["CFO", "Chief Actuary", "Head of BI"],
  capabilityEmphasis: { semantic_layer: 3, data_quality: 2, lineage: 2 },
  successMetrics: [
    "Priority reports reconciled to a single definition",
    "Metric disputes down 80%",
    "Lineage documented for top 20 reports",
  ],
};

function makeElement(key: string, type: ElementType, name: string): Element {
  return {
    key,
    packKey: "vp-01",
    type,
    name,
    pitch: `${name} pitch`,
    description: `${name} description.`,
    soWhat: `${name} so-what.`,
    audience: ["Data steward"],
    capabilities: ["semantic_layer"],
    bestPracticeKeys: ["bp-single-definition"],
    obligationKeys: key === "el-glossary" ? ["ob-naic-model"] : undefined,
    sectorAffinity: { "pc-personal": 2 },
    scenarioAffinity: { "report-integrity": 3 },
    toolTags: ["catalog-suite"],
  };
}

const elements: Element[] = [
  makeElement("el-toolkit", "toolkit", "Assessment Toolkit"),
  makeElement("el-template", "template", "Charter Template"),
  makeElement("el-standard", "guideline-standard", "Naming Standard"),
  makeElement("el-glossary", "semantic-pack", "P&C Glossary Pack"),
  makeElement("el-cde", "cde-library", "CDE Library"),
  makeElement("el-dq", "dq-rule-library", "DQ Rule Library"),
  makeElement("el-agent", "agent", "Metadata Agent"),
  makeElement("el-playbook", "playbook-method", "Stewardship Playbook"),
  makeElement("el-kpi", "metric-kpi", "Governance KPI Set"),
  makeElement("el-training", "training-module", "Steward Training Module"),
];

const bestPractices: BestPractice[] = [
  {
    key: "bp-single-definition",
    title: "One metric, one owner, one definition",
    statement: "Every published metric has a single accountable definition.",
    whatGoodLooksLike: "Metric catalog with owners.",
    antiPattern: "Competing spreadsheet definitions.",
    evidence: "Dispute volume drops where adopted.",
    capabilities: ["semantic_layer"],
  },
];

const obligations: Obligation[] = [
  {
    key: "ob-naic-model",
    name: "NAIC Model Data Standard",
    authority: "NAIC",
    jurisdiction: "US",
    summary: "Model regulation on insurer data governance.",
    sectorKeys: ["pc-personal"],
    capabilities: ["catalog_metadata"],
    evidenceExpectations: ["Data inventory with owners"],
  },
  {
    key: "ob-unrelated",
    name: "Unrelated Regime",
    authority: "SEC",
    jurisdiction: "US",
    summary: "Not referenced by any selected element.",
    sectorKeys: ["investments"],
    capabilities: ["lineage"],
    evidenceExpectations: ["N/A"],
  },
];

const dashboards: Dashboard[] = [
  {
    key: "dash-dq",
    name: "DQ Command Center",
    category: "governance",
    audience: ["CDO"],
    questionsAnswered: ["Where are the exceptions?", "Who owns them?", "Is it improving?"],
    kpis: ["Exception count", "Time to resolve", "Coverage"],
    requiredInputs: ["DQ telemetry", "CDE registry"],
    targetStack: ["In-app"],
    sectorAffinity: { "pc-personal": 2 },
    scenarioAffinity: { "report-integrity": 3 },
    builtIn: true,
  },
];

const input: BlueprintInput = {
  sector,
  scenario,
  elements,
  dashboards,
  bestPractices,
  obligations,
};

// ---------- Tests ----------

describe("buildBlueprint", () => {
  it("is deterministic for identical input", () => {
    expect(buildBlueprint(input)).toEqual(buildBlueprint(input));
  });

  it("lays out the four phases with the mandated week windows", () => {
    const { phases } = buildBlueprint(input);
    expect(phases.map((p) => [p.key, p.weekStart, p.weekEnd])).toEqual([
      ["assessment", 1, 6],
      ["wave-1", 5, 16],
      ["wave-2", 15, 26],
      ["scale", 18, 26],
    ]);
    expect(phases[0].name).toContain("Standards & Ecosystem Assessment");
    expect(phases[3].name).toContain("Path to Scale");
    for (const phase of phases) expect(phase.objectives.length).toBeGreaterThanOrEqual(3);
  });

  it("assigns elements to phases by type", () => {
    const bp = buildBlueprint(input);
    const assessment = bp.phases.find((p) => p.key === "assessment")!;
    expect(assessment.elementNames.sort()).toEqual([
      "Assessment Toolkit",
      "Charter Template",
      "Naming Standard",
    ]);

    const waveNames = [
      ...bp.phases.find((p) => p.key === "wave-1")!.elementNames,
      ...bp.phases.find((p) => p.key === "wave-2")!.elementNames,
    ].sort();
    expect(waveNames).toEqual([
      "CDE Library",
      "DQ Rule Library",
      "Metadata Agent",
      "P&C Glossary Pack",
      "Stewardship Playbook",
    ]);

    expect(bp.crossCuttingEnablement.elementNames.sort()).toEqual([
      "Governance KPI Set",
      "Steward Training Module",
    ]);
  });

  it("resolves only the obligations the selected elements reference", () => {
    const bp = buildBlueprint(input);
    expect(bp.obligationsAddressed.map((o) => o.key)).toEqual(["ob-naic-model"]);
  });

  it("combines scenario success metrics with metric-kpi element instrumentation", () => {
    const bp = buildBlueprint(input);
    for (const metric of scenario.successMetrics) {
      expect(bp.successMetrics).toContain(metric);
    }
    expect(bp.successMetrics.some((m) => m.includes("Governance KPI Set"))).toBe(true);
  });

  it("templates 3-5 risks from scenario pain points", () => {
    const bp = buildBlueprint(input);
    expect(bp.risks.length).toBeGreaterThanOrEqual(3);
    expect(bp.risks.length).toBeLessThanOrEqual(5);
    expect(bp.risks[0]).toContain("Three versions of loss ratio circulate monthly");
    expect(bp.risks[0]).toContain("mitigated by");
  });

  it("carries pod pairs, train-the-trainer waves, and the readiness gate", () => {
    const bp = buildBlueprint(input);
    expect(bp.podModel.pairs.length).toBeGreaterThanOrEqual(3);
    expect(bp.trainTheTrainer.waves).toHaveLength(2);
    for (const wave of bp.trainTheTrainer.waves) {
      expect(wave.namedTraineeSlots).toBeGreaterThan(0);
    }
    expect(bp.trainTheTrainer.readinessDemonstration).toMatch(/readiness demonstration/i);
  });

  it("groups the manifest by capability with best-practice rationale", () => {
    const bp = buildBlueprint(input);
    expect(bp.manifest).toHaveLength(1);
    expect(bp.manifest[0].capability).toBe("semantic_layer");
    expect(bp.manifest[0].entries).toHaveLength(elements.length);
    expect(bp.manifest[0].entries[0].practiceTitle).toBe(
      "One metric, one owner, one definition",
    );
  });

  it("writes an executive summary referencing sector, scenario, and element count", () => {
    const bp = buildBlueprint(input);
    expect(bp.executiveSummary.length).toBeGreaterThanOrEqual(2);
    const joined = bp.executiveSummary.join(" ");
    expect(joined).toContain(sector.name);
    expect(joined).toContain(scenario.name);
    expect(joined).toContain(`${elements.length} Velocity Pack elements`);
  });

  it("passes the recommended dashboards through untouched", () => {
    const bp = buildBlueprint(input);
    expect(bp.dashboards).toEqual(dashboards);
  });
});
