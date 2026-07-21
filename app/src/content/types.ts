import { z } from "zod";

/**
 * Astra Velocity content contract.
 *
 * All library content (ontology + velocity packs) is authored as typed data under
 * src/content/data/, validated with these Zod schemas at seed time, and stored in
 * the versioned content_items table. Keys are stable kebab-case identifiers and are
 * the join surface between entities — never rename a published key.
 *
 * Content must be client-generic: insurance-native, vendor-flexible, no client names.
 */

// ---------- Shared vocabulary ----------

export const CAPABILITIES = [
  "classification",
  "catalog_metadata",
  "semantic_layer",
  "data_quality",
  "lineage",
  "access_policy",
  "stewardship_ops",
] as const;
export const CapabilitySchema = z.enum(CAPABILITIES);
export type Capability = z.infer<typeof CapabilitySchema>;

export const CAPABILITY_LABELS: Record<Capability, string> = {
  classification: "Classification",
  catalog_metadata: "Catalog & Metadata",
  semantic_layer: "Semantic Layer",
  data_quality: "Data Quality",
  lineage: "Lineage",
  access_policy: "Access & Policy",
  stewardship_ops: "Stewardship Ops",
};

export const SECTOR_KEYS = [
  "pc-personal",
  "pc-commercial",
  "specialty-es",
  "reinsurance",
  "life-annuities",
  "health-benefits",
  "surety",
  "investments",
  "brokerage-mga",
] as const;
export const SectorKeySchema = z.enum(SECTOR_KEYS);
export type SectorKey = z.infer<typeof SectorKeySchema>;

export const SCENARIO_KEYS = [
  "sensitive-data-unlock",
  "report-integrity",
  "financial-reconciliation",
  "operational-finops",
  "greenfield-platform",
  "regulatory-reporting",
  "claims-analytics",
  "actuarial-readiness",
  "ma-integration",
  "ai-ml-readiness",
] as const;
export const ScenarioKeySchema = z.enum(SCENARIO_KEYS);
export type ScenarioKey = z.infer<typeof ScenarioKeySchema>;

export const DATA_DOMAINS = [
  "party",
  "product",
  "policy",
  "coverage",
  "exposure",
  "premium",
  "claim",
  "reserve",
  "billing",
  "reinsurance-cession",
  "producer-distribution",
  "financials-gl",
  "employee-hr",
  "reference-regulatory",
] as const;
export const DataDomainSchema = z.enum(DATA_DOMAINS);
export type DataDomain = z.infer<typeof DataDomainSchema>;

const Key = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "keys are stable kebab-case identifiers");

/** 0 = not relevant … 3 = signature fit. Omitted keys default to 0. */
const AffinitySchema = z.number().int().min(0).max(3);

// ---------- Ontology ----------

export const ValueChainStageSchema = z.object({
  key: Key,
  name: z.string(),
  description: z.string(),
  dataDomains: z.array(DataDomainSchema).min(1),
  painPoints: z.array(z.string()).min(1),
});

export const SectorSchema = z.object({
  key: SectorKeySchema,
  name: z.string(),
  tagline: z.string(),
  narrative: z.string().describe("2-4 sentences on what data governance means here"),
  valueChain: z.array(ValueChainStageSchema).min(4),
  systemArchetypes: z.array(z.string()).min(3),
  distributionModel: z.string(),
  signaturePainPoints: z.array(z.string()).min(3),
  obligationKeys: z.array(Key).min(2),
  kpiKeys: z.array(Key).min(3),
});
export type Sector = z.infer<typeof SectorSchema>;

export const ScenarioSchema = z.object({
  key: ScenarioKeySchema,
  name: z.string(),
  tagline: z.string(),
  stakes: z.string().describe("why it matters, in business terms"),
  painPoints: z.array(z.string()).min(3),
  stakeholders: z.array(z.string()).min(3),
  capabilityEmphasis: z.partialRecord(CapabilitySchema, AffinitySchema),
  successMetrics: z.array(z.string()).min(3),
  /** Sector-specific flavor: how this scenario reads differently per sector. */
  sectorNotes: z.partialRecord(SectorKeySchema, z.string()).optional(),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const ObligationSchema = z.object({
  key: Key,
  name: z.string(),
  authority: z.string().describe("issuing body / regime, e.g. NAIC, SEC, state DOI"),
  jurisdiction: z.string(),
  summary: z.string(),
  sectorKeys: z.array(SectorKeySchema).min(1),
  capabilities: z.array(CapabilitySchema).min(1),
  evidenceExpectations: z
    .array(z.string())
    .min(1)
    .describe("what an examiner/auditor actually asks for"),
});
export type Obligation = z.infer<typeof ObligationSchema>;

export const KpiSchema = z.object({
  key: Key,
  name: z.string(),
  formula: z.string(),
  description: z.string(),
  sectorKeys: z.array(SectorKeySchema).min(1),
  dataDomains: z.array(DataDomainSchema).min(1),
  cdeHints: z.array(z.string()).min(1).describe("critical data elements the KPI depends on"),
});
export type Kpi = z.infer<typeof KpiSchema>;

// ---------- Velocity Packs ----------

export const PackSchema = z.object({
  key: Key.describe("vp-01 … vp-22"),
  code: z.string().regex(/^VP-\d{2}$/),
  name: z.string(),
  summary: z.string(),
  origin: z.enum(["proposal", "extended"]),
  soWhat: z.string().describe("one-sentence 'so what, for whom'"),
});
export type Pack = z.infer<typeof PackSchema>;

export const ELEMENT_TYPES = [
  "best-practice-card",
  "guideline-standard",
  "template",
  "semantic-pack",
  "cde-library",
  "dq-rule-library",
  "agent",
  "playbook-method",
  "toolkit",
  "metric-kpi",
  "training-module",
  "dashboard-blueprint",
] as const;
export const ElementTypeSchema = z.enum(ELEMENT_TYPES);
export type ElementType = z.infer<typeof ElementTypeSchema>;

export const AgentMetaSchema = z.object({
  drafts: z.string().describe("what the agent drafts"),
  humanDecides: z.string().describe("what the steward decides"),
  leverageMetric: z.string().describe("how its leverage is measured"),
  guardrails: z.array(z.string()).min(2),
});

/**
 * The artifact is the element's actual working content — what makes a library
 * card open into a real asset instead of a description. Library-type artifacts
 * ship as substantive starter samples of the full pack.
 */
export const ArtifactSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("glossary"),
    note: z.string().optional(),
    terms: z
      .array(
        z.object({
          term: z.string(),
          definition: z.string(),
          domain: DataDomainSchema.optional(),
          note: z.string().optional(),
        }),
      )
      .min(5),
  }),
  z.object({
    kind: z.literal("dq-rules"),
    note: z.string().optional(),
    rules: z
      .array(
        z.object({
          id: Key,
          name: z.string(),
          expression: z.string().describe("executable-style rule expression"),
          severity: z.enum(["critical", "serious", "warning"]),
          rationale: z.string(),
          obligationKey: Key.optional(),
        }),
      )
      .min(3),
  }),
  z.object({
    kind: z.literal("cde-set"),
    note: z.string().optional(),
    cdes: z
      .array(
        z.object({
          name: z.string(),
          domain: DataDomainSchema,
          definition: z.string(),
          qualityDimensions: z.array(z.string()).min(1),
          exampleIssue: z.string().optional(),
        }),
      )
      .min(3),
  }),
  z.object({
    kind: z.literal("checklist"),
    sections: z
      .array(z.object({ title: z.string(), items: z.array(z.string()).min(2) }))
      .min(1),
  }),
  z.object({
    kind: z.literal("template"),
    sections: z
      .array(
        z.object({
          title: z.string(),
          purpose: z.string(),
          fields: z.array(z.string()).optional(),
        }),
      )
      .min(2),
  }),
  z.object({
    kind: z.literal("code"),
    language: z.string(),
    description: z.string(),
    snippet: z.string().min(50),
  }),
  z.object({
    kind: z.literal("curriculum"),
    modules: z
      .array(
        z.object({
          code: z.string(),
          title: z.string(),
          format: z.string(),
          topics: z.array(z.string()).min(2),
        }),
      )
      .min(2),
  }),
  z.object({
    kind: z.literal("method"),
    steps: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          decisionRule: z.string().optional(),
        }),
      )
      .min(3),
  }),
  z.object({
    kind: z.literal("reference-data"),
    sets: z
      .array(
        z.object({
          name: z.string(),
          codes: z
            .array(
              z.object({
                code: z.string(),
                label: z.string(),
                note: z.string().optional(),
              }),
            )
            .min(4),
        }),
      )
      .min(1),
  }),
  z.object({
    kind: z.literal("metric-spec"),
    metrics: z
      .array(
        z.object({
          name: z.string(),
          definition: z.string(),
          formula: z.string(),
          target: z.string().optional(),
        }),
      )
      .min(2),
  }),
]);
export type Artifact = z.infer<typeof ArtifactSchema>;

export const ElementSchema = z.object({
  artifact: ArtifactSchema.optional(),
  key: Key,
  packKey: Key,
  type: ElementTypeSchema,
  name: z.string(),
  pitch: z.string().describe("one-line pitch"),
  description: z.string().describe("2-5 sentences, insurance-native, concrete"),
  soWhat: z.string().describe("outcome + who feels it"),
  audience: z.array(z.string()).min(1),
  capabilities: z.array(CapabilitySchema).min(1),
  dataDomains: z.array(DataDomainSchema).optional(),
  bestPracticeKeys: z
    .array(Key)
    .min(1)
    .describe("every element is justified by at least one best practice"),
  obligationKeys: z.array(Key).optional(),
  kpiKeys: z.array(Key).optional(),
  sectorAffinity: z.partialRecord(SectorKeySchema, AffinitySchema),
  scenarioAffinity: z.partialRecord(ScenarioKeySchema, AffinitySchema),
  effortSavedStewardWeeks: z.number().min(0).optional(),
  toolTags: z
    .array(z.string())
    .describe("vendor-generic capability tags with named examples, e.g. 'catalog-suite (Informatica CDGC, Collibra, Atlan)'"),
  agentMeta: AgentMetaSchema.optional(),
});
export type Element = z.infer<typeof ElementSchema>;

// ---------- Best Practices ----------

export const BestPracticeSchema = z.object({
  key: Key,
  title: z.string().describe("memorable, quotable formulation"),
  statement: z.string().describe("the practice, stated as a rule of operation"),
  whatGoodLooksLike: z.string(),
  antiPattern: z.string().describe("the failure mode this practice prevents"),
  evidence: z.string().describe("outcome framing: what measurably improves, where proven"),
  capabilities: z.array(CapabilitySchema).min(1),
  obligationKeys: z.array(Key).optional(),
  sectorNotes: z.partialRecord(SectorKeySchema, z.string()).optional(),
});
export type BestPractice = z.infer<typeof BestPracticeSchema>;

// ---------- Dashboard blueprints ----------

export const DashboardSchema = z.object({
  key: Key,
  name: z.string(),
  category: z.enum(["governance", "business"]),
  audience: z.array(z.string()).min(1),
  questionsAnswered: z.array(z.string()).min(3),
  kpis: z.array(z.string()).min(3).describe("panels/measures shown"),
  requiredInputs: z
    .array(z.string())
    .min(2)
    .describe("CDEs / telemetry the dashboard needs"),
  targetStack: z.array(z.string()).min(1),
  sectorAffinity: z.partialRecord(SectorKeySchema, AffinitySchema),
  scenarioAffinity: z.partialRecord(ScenarioKeySchema, AffinitySchema),
  builtIn: z.boolean().describe("true = rendered live in-app on simulated telemetry"),
});
export type Dashboard = z.infer<typeof DashboardSchema>;

// ---------- Bundle (what the seed pipeline validates) ----------

export const ContentBundleSchema = z.object({
  sectors: z.array(SectorSchema).length(SECTOR_KEYS.length),
  scenarios: z.array(ScenarioSchema).length(SCENARIO_KEYS.length),
  obligations: z.array(ObligationSchema).min(10),
  kpis: z.array(KpiSchema).min(15),
  packs: z.array(PackSchema).min(20),
  elements: z.array(ElementSchema).min(60),
  bestPractices: z.array(BestPracticeSchema).min(20),
  dashboards: z.array(DashboardSchema).min(12),
});
export type ContentBundle = z.infer<typeof ContentBundleSchema>;

export const CONTENT_KINDS = [
  "sector",
  "scenario",
  "obligation",
  "kpi",
  "pack",
  "element",
  "best-practice",
  "dashboard",
] as const;
export type ContentKind = (typeof CONTENT_KINDS)[number];

