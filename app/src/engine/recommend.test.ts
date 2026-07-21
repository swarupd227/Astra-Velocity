import { describe, expect, it } from "vitest";
import type {
  BestPractice,
  Dashboard,
  Element,
  Obligation,
  Scenario,
  Sector,
} from "@/content/types";
import {
  computeCoverage,
  recommendDashboards,
  recommendElements,
  type EngineContext,
} from "./recommend";

const sector: Sector = {
  key: "pc-personal",
  name: "P&C Personal Lines",
  tagline: "t",
  narrative: "n",
  valueChain: [
    {
      key: "claims-fnol",
      name: "Claims FNOL",
      description: "d",
      dataDomains: ["claim"],
      painPoints: ["p"],
    },
    { key: "a", name: "A", description: "d", dataDomains: ["policy"], painPoints: ["p"] },
    { key: "b", name: "B", description: "d", dataDomains: ["premium"], painPoints: ["p"] },
    { key: "c", name: "C", description: "d", dataDomains: ["billing"], painPoints: ["p"] },
  ],
  systemArchetypes: ["x", "y", "z"],
  distributionModel: "direct",
  signaturePainPoints: ["p1", "p2", "p3"],
  obligationKeys: ["glba-nppi", "schedule-p"],
  kpiKeys: ["loss-ratio", "combined-ratio", "retention-ratio"],
};

const scenario: Scenario = {
  key: "report-integrity",
  name: "Report Integrity",
  tagline: "t",
  stakes: "s",
  painPoints: ["p1", "p2", "p3"],
  stakeholders: ["s1", "s2", "s3"],
  capabilityEmphasis: { data_quality: 3, lineage: 3, semantic_layer: 2 },
  successMetrics: ["m1", "m2", "m3"],
};

const practice: BestPractice = {
  key: "cde-anchored-quality",
  title: "Quality controls anchor to the elements that matter",
  statement: "s",
  whatGoodLooksLike: "w",
  antiPattern: "a",
  evidence: "e",
  capabilities: ["data_quality"],
};

const obligation: Obligation = {
  key: "schedule-p",
  name: "Schedule P",
  authority: "NAIC",
  jurisdiction: "US",
  summary: "s",
  sectorKeys: ["pc-personal"],
  capabilities: ["data_quality", "lineage"],
  evidenceExpectations: ["tie triangles to source"],
};

function makeElement(overrides: Partial<Element>): Element {
  return {
    key: "el",
    packKey: "vp-01",
    type: "dq-rule-library",
    name: "Element",
    pitch: "p",
    description: "d",
    soWhat: "s",
    audience: ["steward"],
    capabilities: ["data_quality"],
    bestPracticeKeys: ["cde-anchored-quality"],
    sectorAffinity: {},
    scenarioAffinity: {},
    toolTags: [],
    ...overrides,
  };
}

const dashboards: Dashboard[] = [
  {
    key: "dq-health",
    name: "DQ Health",
    category: "governance",
    audience: ["steward"],
    questionsAnswered: ["q1", "q2", "q3"],
    kpis: ["k1", "k2", "k3"],
    requiredInputs: ["i1", "i2"],
    targetStack: ["In-app (live)"],
    sectorAffinity: {},
    scenarioAffinity: { "report-integrity": 3 },
    builtIn: true,
  },
  {
    key: "member-integrity",
    name: "Member Integrity",
    category: "business",
    audience: ["ops"],
    questionsAnswered: ["q1", "q2", "q3"],
    kpis: ["k1", "k2", "k3"],
    requiredInputs: ["i1", "i2"],
    targetStack: ["Power BI"],
    sectorAffinity: { "health-benefits": 3 },
    scenarioAffinity: {},
    builtIn: false,
  },
];

function ctx(elements: Element[]): EngineContext {
  return {
    sectors: [sector],
    scenarios: [scenario],
    elements,
    dashboards,
    bestPractices: [practice],
    obligations: [obligation],
  };
}

const input = { sector: "pc-personal", scenario: "report-integrity" } as const;

describe("recommendElements", () => {
  it("scores signature-fit elements as core and irrelevant ones drop out", () => {
    const signature = makeElement({
      key: "signature",
      scenarioAffinity: { "report-integrity": 3 },
      sectorAffinity: { "pc-personal": 3 },
      obligationKeys: ["schedule-p"],
    });
    const unrelated = makeElement({
      key: "unrelated",
      capabilities: ["access_policy"],
      scenarioAffinity: {},
      sectorAffinity: {},
    });

    const recs = recommendElements(input, ctx([signature, unrelated]));
    expect(recs.map((r) => r.element.key)).toEqual(["signature"]);
    expect(recs[0].tier).toBe("core");
  });

  it("every recommendation carries a best-practice rationale", () => {
    const el = makeElement({
      key: "el1",
      scenarioAffinity: { "report-integrity": 2 },
      sectorAffinity: { "pc-personal": 1 },
    });
    const [rec] = recommendElements(input, ctx([el]));
    expect(rec.bestPractices[0].key).toBe("cde-anchored-quality");
    expect(rec.reasons.some((r) => r.includes(practice.title))).toBe(true);
  });

  it("obligation alignment adds score and an evidence reason", () => {
    const withObligation = makeElement({
      key: "with-ob",
      scenarioAffinity: { "report-integrity": 1 },
      sectorAffinity: { "pc-personal": 1 },
      obligationKeys: ["schedule-p"],
    });
    const withoutObligation = makeElement({
      key: "without-ob",
      scenarioAffinity: { "report-integrity": 1 },
      sectorAffinity: { "pc-personal": 1 },
    });
    const recs = recommendElements(input, ctx([withObligation, withoutObligation]));
    const withOb = recs.find((r) => r.element.key === "with-ob")!;
    const withoutOb = recs.find((r) => r.element.key === "without-ob")!;
    expect(withOb.score).toBeGreaterThan(withoutOb.score);
    expect(withOb.reasons.some((r) => r.includes("Schedule P"))).toBe(true);
  });

  it("deterministic ordering: score desc, then name", () => {
    const a = makeElement({ key: "a", name: "Alpha", scenarioAffinity: { "report-integrity": 1 }, sectorAffinity: { "pc-personal": 1 } });
    const b = makeElement({ key: "b", name: "Beta", scenarioAffinity: { "report-integrity": 1 }, sectorAffinity: { "pc-personal": 1 } });
    const recs = recommendElements(input, ctx([b, a]));
    expect(recs.map((r) => r.element.name)).toEqual(["Alpha", "Beta"]);
  });
});

describe("recommendDashboards", () => {
  it("governance dashboards ride along; unfit business dashboards drop", () => {
    const recs = recommendDashboards(input, ctx([]));
    expect(recs.map((r) => r.dashboard.key)).toContain("dq-health");
    expect(recs.map((r) => r.dashboard.key)).not.toContain("member-integrity");
  });
});

describe("computeCoverage", () => {
  it("reports gaps for emphasized-but-uncovered capabilities", () => {
    const dq = makeElement({ key: "dq", capabilities: ["data_quality"] });
    const report = computeCoverage([dq], scenario);
    expect(report.gaps).toContain("lineage");
    expect(report.gaps).not.toContain("data_quality");
    expect(report.overall).toBeGreaterThan(0);
    expect(report.overall).toBeLessThan(100);
  });

  it("full coverage when emphasized capabilities have depth", () => {
    const els = [
      makeElement({ key: "d1", capabilities: ["data_quality"] }),
      makeElement({ key: "d2", capabilities: ["data_quality"] }),
      makeElement({ key: "l1", capabilities: ["lineage"] }),
      makeElement({ key: "l2", capabilities: ["lineage"] }),
      makeElement({ key: "s1", capabilities: ["semantic_layer"] }),
      makeElement({ key: "s2", capabilities: ["semantic_layer"] }),
    ];
    const report = computeCoverage(els, scenario);
    expect(report.overall).toBe(100);
    expect(report.gaps).toEqual([]);
  });
});
