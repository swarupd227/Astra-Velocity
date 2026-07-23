import { describe, expect, it } from "vitest";
import type {
  BestPractice,
  Dashboard,
  Element,
  FrictionPattern,
  Obligation,
  Platform,
  PlatformCategory,
  PlatformKey,
  Scenario,
  Sector,
} from "@/content/types";
import {
  computeCoverage,
  computeRoleMap,
  recommendDashboards,
  recommendElements,
  scoreElement,
  unionPlatformKeys,
  type ComposeInput,
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
    platforms: [],
    frictionPatterns: [],
  };
}

const input: ComposeInput = {
  sector: "pc-personal",
  scenario: "report-integrity",
  platformKeys: [],
};

/** Self-contained platform fixture — uses real PlatformKey enum values, fabricated data. */
function makePlatform(
  key: PlatformKey,
  category: PlatformCategory,
  capabilityRoles: Platform["capabilityRoles"],
): Platform {
  return {
    key,
    name: key,
    vendor: "Vendor",
    category,
    tier: "anchor",
    summary: "s",
    capabilityRoles,
    nativeAi: { name: "AI", description: "d" },
    marketContext: "m",
  };
}

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

  it("zero sector affinity excludes an element even with strong scenario fit", () => {
    const lifeOnly = makeElement({
      key: "life-glossary",
      scenarioAffinity: { "report-integrity": 3 },
      sectorAffinity: { "life-annuities": 3 }, // not listed for pc-personal
    });
    const recs = recommendElements(input, ctx([lifeOnly]));
    expect(recs).toHaveLength(0);
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

describe("scoreElement — platform fit", () => {
  const platforms: Platform[] = [
    { ...makePlatform("snowflake", "warehouse-lakehouse", { data_quality: "enforces" }), name: "Snowflake" },
  ];

  it("an element with strong platformAffinity to a selected platform scores higher and carries a platform-fit reason", () => {
    const base = makeElement({
      key: "el",
      scenarioAffinity: { "report-integrity": 1 },
      sectorAffinity: { "pc-personal": 1 },
    });
    const withPlatform = makeElement({
      key: "el",
      scenarioAffinity: { "report-integrity": 1 },
      sectorAffinity: { "pc-personal": 1 },
      platformAffinity: { snowflake: 3 },
    });

    const baseResult = scoreElement(base, { ...input, platformKeys: [] }, sector, scenario, {
      platforms,
    });
    const fitResult = scoreElement(
      withPlatform,
      { ...input, platformKeys: ["snowflake"] },
      sector,
      scenario,
      { platforms },
    );

    expect(fitResult.score).toBeGreaterThan(baseResult.score);
    expect(fitResult.reasons.some((r) => r.includes("Snowflake"))).toBe(true);
  });

  it("an element with no platformAffinity field is unaffected by the selected platform stack (same score as before this change)", () => {
    // Fixture identical to the "obligation alignment" test's withObligation element,
    // minus platformAffinity — proves platform scoring adds nothing when absent.
    const el = makeElement({
      key: "with-ob",
      scenarioAffinity: { "report-integrity": 1 },
      sectorAffinity: { "pc-personal": 1 },
      obligationKeys: ["schedule-p"],
    });

    const withoutPlatformKeys = scoreElement(el, { ...input, platformKeys: [] }, sector, scenario, {
      platforms,
    });
    const withPlatformKeys = scoreElement(
      el,
      { ...input, platformKeys: ["snowflake"] },
      sector,
      scenario,
      { platforms },
    );

    expect(withPlatformKeys.score).toBe(withoutPlatformKeys.score);
    expect(withPlatformKeys.reasons).toEqual(withoutPlatformKeys.reasons);
  });
});

describe("computeRoleMap", () => {
  const platforms: Platform[] = [
    makePlatform("collibra", "catalog-governance", {
      catalog_metadata: "anchor",
      stewardship_ops: "supports",
    }),
    makePlatform("snowflake", "warehouse-lakehouse", { data_quality: "enforces" }),
    makePlatform("immuta", "access-policy", { access_policy: "anchor" }),
    makePlatform("bigid", "classification-discovery", {
      classification: "anchor",
      access_policy: "supports",
    }),
  ];

  const frictionPatterns: FrictionPattern[] = [
    {
      key: "catalog-warehouse-friction",
      capability: "catalog_metadata",
      involvedCategories: ["catalog-governance", "warehouse-lakehouse"],
      title: "Catalog vs warehouse drift",
      description: "d",
    },
    {
      key: "access-classification-friction",
      capability: "access_policy",
      involvedCategories: ["access-policy", "classification-discovery"],
      title: "Access policy needs classification first",
      description: "d",
    },
    {
      key: "bi-warehouse-friction",
      capability: "semantic_layer",
      involvedCategories: ["bi-consumption", "warehouse-lakehouse"],
      title: "BI semantics drift from warehouse",
      description: "d",
    },
  ];

  const roleMapInput = {
    platformKeys: ["collibra", "snowflake", "immuta", "bigid"] as PlatformKey[],
  };

  it("buckets anchor/supports/enforces correctly per capability", () => {
    const report = computeRoleMap(roleMapInput, { platforms, frictionPatterns });
    expect(report.byCapability.find((r) => r.capability === "catalog_metadata")?.anchors).toEqual([
      "collibra",
    ]);
    expect(
      report.byCapability.find((r) => r.capability === "stewardship_ops")?.supports,
    ).toEqual(["collibra"]);
    expect(report.byCapability.find((r) => r.capability === "data_quality")?.enforces).toEqual([
      "snowflake",
    ]);
    expect(report.byCapability.find((r) => r.capability === "access_policy")?.anchors).toEqual([
      "immuta",
    ]);
    expect(report.byCapability.find((r) => r.capability === "access_policy")?.supports).toEqual([
      "bigid",
    ]);
  });

  it("matches a friction pattern only when ALL its involved categories are present, not a subset", () => {
    const report = computeRoleMap(roleMapInput, { platforms, frictionPatterns });
    const matchedKeys = report.frictionMatches.map((m) => m.pattern.key);
    expect(matchedKeys).toContain("catalog-warehouse-friction");
    expect(matchedKeys).toContain("access-classification-friction");
    // bi-consumption is not represented in the selected stack — must not match.
    expect(matchedKeys).not.toContain("bi-warehouse-friction");
  });

  it("lists capabilities with zero role coverage as uncovered", () => {
    const report = computeRoleMap(roleMapInput, { platforms, frictionPatterns });
    expect(report.uncoveredCapabilities.sort()).toEqual(["lineage", "semantic_layer"].sort());
    expect(report.uncoveredCapabilities).not.toContain("catalog_metadata");
  });
});

describe("unionPlatformKeys", () => {
  it("dedupes across primary and multiple variants, order-independent", () => {
    const result = unionPlatformKeys(
      ["snowflake", "collibra"],
      [{ platformKeys: ["collibra", "immuta"] }, { platformKeys: ["snowflake", "bigid", "immuta"] }],
    );
    expect([...result].sort()).toEqual(["bigid", "collibra", "immuta", "snowflake"].sort());
  });
});
