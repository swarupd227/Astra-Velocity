import type { Element } from "../types";

/**
 * Velocity Pack elements — 3-5 per pack, client-generic and insurance-native.
 * Keys are stable kebab-case identifiers; never rename a published key.
 */
export const ELEMENTS: Element[] = [
  // ───────────────────────── VP-01 Insurance Governance Semantic Pack ─────────────────────────
  {
    key: "pc-glossary-starter",
    packKey: "vp-01",
    type: "semantic-pack",
    name: "P&C Glossary Starter",
    pitch: "Roughly 200 curated P&C business terms so stewards curate from 70%, not from zero.",
    description:
      "A starter business glossary of ~200 property & casualty terms with definitions, business-to-technical association hints, and steward curation notes. Covers the vocabulary that trips up every warehouse build: written vs. earned vs. in-force premium; incurred vs. paid vs. case vs. IBNR losses; policy transaction types (new, renewal, endorsement, cancellation, reinstatement); and the claim lifecycle from FNOL through investigation, reserving, payment, subrogation, and salvage. Terms load in bulk via catalog APIs and arrive pre-linked to CDE candidates and KPI definitions.",
    soWhat:
      "Weeks of glossary authoring removed per data product, and 'whose definition of earned premium is right' stops being a recurring meeting for analytics leads and stewards.",
    audience: ["Data stewards", "Data product owners", "Analytics leads"],
    capabilities: ["semantic_layer", "catalog_metadata"],
    dataDomains: ["policy", "premium", "claim", "reserve", "coverage"],
    bestPracticeKeys: [
      "one-certified-definition-per-metric",
      "pattern-reuse-economics",
      "steward-as-supervisor",
    ],
    kpiKeys: ["written-premium", "earned-premium", "loss-ratio", "policies-in-force"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 3, "specialty-es": 2, reinsurance: 1 },
    scenarioAffinity: { "report-integrity": 3, "claims-analytics": 2, "greenfield-platform": 2 },
    effortSavedStewardWeeks: 4,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "bi (Power BI, Tableau)",
    ],
  },
  {
    key: "life-glossary-starter",
    packKey: "vp-01",
    type: "semantic-pack",
    name: "Life & Annuities Glossary Starter",
    pitch: "Life and annuity vocabulary from persistency to reserve basis, ready to curate.",
    description:
      "A starter glossary for life and annuity carriers: persistency, lapse and surrender, cash surrender value, account vs. cash value, premium modes, reserve bases (statutory, GAAP, principle-based), cohort and measurement-model terms for IFRS 17 / LDTI, and rider and living-benefit vocabulary. Each term carries the statutory-vs-GAAP distinction where the two diverge, because that divergence is where life reporting arguments start.",
    soWhat:
      "Actuarial and finance teams stop re-litigating measurement vocabulary product by product; regulatory reporting teams inherit definitions already aligned to their filing basis.",
    audience: ["Data stewards", "Actuarial analysts", "Finance data leads"],
    capabilities: ["semantic_layer", "catalog_metadata"],
    dataDomains: ["policy", "premium", "reserve", "product", "financials-gl"],
    bestPracticeKeys: ["one-certified-definition-per-metric", "pattern-reuse-economics"],
    obligationKeys: ["ifrs-17-ldti", "pbr-vm-20", "statutory-annual-statement"],
    kpiKeys: ["persistency", "surrender-rate"],
    sectorAffinity: { "life-annuities": 3, "health-benefits": 1 },
    scenarioAffinity: { "report-integrity": 3, "regulatory-reporting": 2, "actuarial-readiness": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)"],
  },
  {
    key: "policy-claims-cde-set",
    packKey: "vp-01",
    type: "cde-library",
    name: "Policy & Claims CDE Starter Set",
    pitch: "The critical data elements of policy and claims domains, pre-identified with owners and quality dimensions.",
    description:
      "A starter catalog of critical data elements across policy, claims, premium, and loss domains: policy effective/expiration dates, transaction effective dates, line and class codes, coverage limits and deductibles, loss date and report date, reserve amounts by type, payment and recovery amounts, and catastrophe codes. Each CDE ships with a definition, candidate owner role, applicable quality dimensions, and the obligations and KPIs that depend on it — so quality rules attach to elements that provably matter.",
    soWhat:
      "CDE identification per product drops from a workshop series to a review pass, and every DQ rule written afterward is anchored to an element with a named reason to exist.",
    audience: ["Data stewards", "DQ analysts", "Data product owners"],
    capabilities: ["catalog_metadata", "data_quality", "semantic_layer"],
    dataDomains: ["policy", "claim", "premium", "reserve", "coverage"],
    bestPracticeKeys: ["cde-anchored-quality", "obligation-traceability"],
    obligationKeys: ["asop-23", "naic-model-audit-rule", "schedule-p"],
    kpiKeys: ["loss-ratio", "earned-premium", "claims-frequency", "claims-severity"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 3, "specialty-es": 2, reinsurance: 2 },
    scenarioAffinity: { "report-integrity": 3, "actuarial-readiness": 3, "regulatory-reporting": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
  },
  {
    key: "cope-exposure-cde-set",
    packKey: "vp-01",
    type: "cde-library",
    name: "COPE & Exposure CDE Set",
    pitch: "The property and liability exposure attributes that decide whether a policy binds untouched.",
    description:
      "Critical data elements for property COPE attributes (construction class, occupancy, protection class, exposure values) and liability exposure data (payroll, sales, vehicle counts, class codes) — the fields that drive straight-through processing, catastrophe modeling, and reinsurance submissions. Each element carries completeness and validity expectations at quote time, because STP is a data-quality problem wearing a business costume.",
    soWhat:
      "Underwriting operations can trace bind-without-touch rates to specific attribute quality, and cat modelers stop rebuilding exposure hygiene checks per study.",
    audience: ["Underwriting data leads", "Cat modeling teams", "Data stewards"],
    capabilities: ["data_quality", "catalog_metadata"],
    dataDomains: ["exposure", "coverage", "policy"],
    bestPracticeKeys: ["cde-anchored-quality", "govern-at-inception"],
    kpiKeys: ["stp-rate", "quote-to-bind"],
    sectorAffinity: { "pc-commercial": 3, "pc-personal": 2, "specialty-es": 2, reinsurance: 2 },
    scenarioAffinity: { "greenfield-platform": 2, "actuarial-readiness": 2, "operational-finops": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
  },
  {
    key: "insurance-dq-rule-library",
    packKey: "vp-01",
    type: "dq-rule-library",
    name: "Insurance DQ Rule Library",
    pitch: "Pre-built quality rules mapped to insurance obligations, not abstract completeness checks.",
    description:
      "A library of CDE-anchored data quality rules built from insurance obligations: earned-premium reconciliation against written premium and unearned reserve movement; reserve consistency across case, IBNR, and total incurred; ISO class-code and line-of-business validity; COPE attribute completeness at bind; bordereaux completeness and balance checks for delegated business; and claim-lifecycle date-sequence validation (loss date before report date before close date). Each rule carries the obligation and KPI it protects, a suggested threshold, and a remediation routing pattern.",
    soWhat:
      "The most immature capability in most estates — quality — starts from proven insurance rules instead of blank rule editors, and every breach lands in an owned remediation loop rather than a dashboard graveyard.",
    audience: ["DQ analysts", "Data stewards", "Actuarial data teams"],
    capabilities: ["data_quality"],
    dataDomains: ["premium", "reserve", "claim", "policy", "reinsurance-cession"],
    bestPracticeKeys: [
      "cde-anchored-quality",
      "remediation-loop-not-dashboard",
      "obligation-traceability",
    ],
    obligationKeys: ["asop-23", "schedule-p", "statutory-annual-statement", "sox-icfr"],
    kpiKeys: ["earned-premium", "loss-ratio", "ibnr-adequacy"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 3,
      "specialty-es": 2,
      reinsurance: 2,
      "life-annuities": 1,
    },
    scenarioAffinity: { "report-integrity": 3, "actuarial-readiness": 3, "financial-reconciliation": 2 },
    effortSavedStewardWeeks: 5,
    toolTags: [
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "warehouse (Snowflake, Databricks)",
    ],
  },

  // ───────────────────────── VP-02 Governance Agent Pack ─────────────────────────
  {
    key: "glossary-scout",
    packKey: "vp-02",
    type: "agent",
    name: "Glossary Scout",
    pitch: "Drafts glossary term candidates and business-to-technical associations from scan metadata.",
    description:
      "An agent co-worker that mines catalog scan metadata, column profiling, and existing documentation to draft glossary term candidates and propose business-to-technical associations — pre-seeded with insurance vocabulary so it recognizes that 'wrtn_prem_amt' belongs to written premium, not a new term. Candidates arrive in the steward queue with confidence scores and evidence links; nothing publishes without approval.",
    soWhat:
      "Stewards curate eight scored candidates over coffee instead of authoring terms from a blank template — catalog coverage grows at agent speed while meaning stays under human control.",
    audience: ["Data stewards", "Catalog administrators"],
    capabilities: ["catalog_metadata", "semantic_layer"],
    dataDomains: ["policy", "claim", "premium", "party"],
    bestPracticeKeys: ["agents-draft-stewards-decide", "measured-leverage", "agents-on-metadata-only"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
      "health-benefits": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 2, "ai-ml-readiness": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "agent-runtime (platform-native AI, hosted LLM in client boundary)",
    ],
    agentMeta: {
      drafts:
        "Glossary term candidates, definitions, and business-to-technical association proposals from scan metadata and profiling output.",
      humanDecides:
        "Whether each term and association is approved, edited, or rejected; which definition is certified when candidates conflict.",
      leverageMetric:
        "Steward-minutes per accepted glossary term versus the manual authoring baseline, from the audit log.",
      guardrails: [
        "operates on metadata and profiling output only, never bulk records",
        "suggestions below confidence threshold routed to deeper review",
        "no direct write to the production glossary — all publishes pass through steward approval",
        "benched to draft-only if acceptance rate drops below threshold",
      ],
    },
  },
  {
    key: "rule-smith",
    packKey: "vp-02",
    type: "agent",
    name: "Rule Smith",
    pitch: "Drafts CDE-anchored data quality rules from profiling output and standards.",
    description:
      "An agent co-worker that reads column profiles, CDE definitions, and governance standards, then drafts candidate data quality rules — completeness on COPE fields, reconciliation tie-points on premium, validity against reference code sets — expressed in the governance-as-code schema so an approved rule deploys without transcription. Drafts cite the profiling evidence and the obligation each rule protects.",
    soWhat:
      "The rule backlog that stalls most DQ programs converts to a review queue; stewards approve executable rules instead of writing requirements documents that never become controls.",
    audience: ["DQ analysts", "Data stewards"],
    capabilities: ["data_quality"],
    dataDomains: ["premium", "claim", "reserve", "exposure", "billing"],
    bestPracticeKeys: [
      "agents-draft-stewards-decide",
      "cde-anchored-quality",
      "governance-as-code",
      "measured-leverage",
    ],
    obligationKeys: ["asop-23"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "actuarial-readiness": 2, "financial-reconciliation": 2 },
    toolTags: [
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "agent-runtime (platform-native AI, hosted LLM in client boundary)",
    ],
    agentMeta: {
      drafts:
        "CDE-anchored DQ rule candidates with thresholds, expressed as deployable governance-as-code definitions, with profiling evidence attached.",
      humanDecides:
        "Rule approval, threshold tuning, and whether a breach pattern warrants a rule at all versus a one-time cleanup.",
      leverageMetric:
        "Steward-minutes per deployed rule versus manual authoring baseline; share of deployed rules originating as agent drafts.",
      guardrails: [
        "operates on metadata and profiling output only, never bulk records",
        "drafted rules deploy only through the CI pipeline after steward approval",
        "suggestions below confidence threshold routed to deeper review",
        "benched to draft-only if acceptance rate drops below threshold",
      ],
    },
  },
  {
    key: "triage-marshal",
    packKey: "vp-02",
    type: "agent",
    name: "Triage Marshal",
    pitch: "Distills alert floods into short, owned queues of genuine breaches.",
    description:
      "An agent co-worker that consumes raw DQ alerts and monitoring signals, deduplicates and clusters them, separates genuine breaches from noise and known conditions, and proposes an owner and priority for each — turning forty raw alerts into three owned items on a steward's morning queue. Close-calendar awareness raises priority on breaches touching reporting-period tie-points.",
    soWhat:
      "Remediation becomes a working loop instead of an inbox: stewards spend their day on the three breaches that matter, and finance stops discovering quality issues in the close.",
    audience: ["Data stewards", "Data office operations", "FinOps analysts"],
    capabilities: ["data_quality", "stewardship_ops"],
    dataDomains: ["premium", "claim", "billing", "financials-gl"],
    bestPracticeKeys: [
      "remediation-loop-not-dashboard",
      "agents-draft-stewards-decide",
      "close-calendar-aware-controls",
    ],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      "health-benefits": 1,
    },
    scenarioAffinity: { "operational-finops": 2, "report-integrity": 2, "financial-reconciliation": 2 },
    toolTags: [
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "workflow (steward queue, ITSM integration)",
    ],
    agentMeta: {
      drafts:
        "Prioritized breach queues: deduplicated alert clusters with proposed owner, priority, and suggested remediation route.",
      humanDecides:
        "Ownership assignment, priority overrides, and whether a clustered condition is accepted risk or a breach to work.",
      leverageMetric:
        "Alert-to-owned-item compression ratio and steward-minutes per resolved breach versus the manual triage baseline.",
      guardrails: [
        "operates on alert metadata and rule telemetry only, never bulk records",
        "cannot close or suppress an alert — only propose; stewards disposition every item",
        "benched to draft-only if acceptance rate drops below threshold",
      ],
    },
  },
  {
    key: "lineage-tracer",
    packKey: "vp-02",
    type: "agent",
    name: "Lineage Tracer",
    pitch: "Maps scanner coverage, quantifies gaps, and proposes stitch candidates.",
    description:
      "An agent co-worker that runs coverage analysis across lineage scanners, quantifies the stitching burden for each gap, and drafts stitch proposals — matching source and target columns by name, profile, and transformation evidence — for human confirmation. Works the Lineage Gap Triage Method: it recommends which gaps are connector-buildable, which merit an assisted stitch, and which should be documented as deliberate manual segments.",
    soWhat:
      "Source-to-consumption lineage on priority reports becomes achievable at sane cost, and 'time to diagnose a suspect number' drops from days of archaeology to minutes of trace-following.",
    audience: ["Lineage engineers", "Data stewards", "Internal audit liaisons"],
    capabilities: ["lineage"],
    dataDomains: ["financials-gl", "premium", "claim", "policy"],
    bestPracticeKeys: [
      "lineage-effort-triage",
      "regulator-explainable-lineage",
      "agents-draft-stewards-decide",
    ],
    obligationKeys: ["naic-model-audit-rule", "sox-icfr"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 2,
      reinsurance: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "regulatory-reporting": 2, "financial-reconciliation": 2 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "warehouse (Snowflake, Databricks)",
    ],
    agentMeta: {
      drafts:
        "Scanner coverage maps, gap inventories with stitch-cost estimates, and column-level stitch proposals with matching evidence.",
      humanDecides:
        "Whether each stitch proposal is correct, which gaps justify connector investment, and which segments are documented as manual.",
      leverageMetric:
        "Engineer-hours per stitched lineage segment versus manual stitching baseline; coverage percentage gained per sprint.",
      guardrails: [
        "operates on metadata, scanner output, and transformation code only, never bulk records",
        "stitch proposals below confidence threshold routed to deeper review",
        "every accepted stitch is tagged agent-assisted in the audit trail for examiner transparency",
        "benched to draft-only if acceptance rate drops below threshold",
      ],
    },
  },
  {
    key: "cde-classifier",
    packKey: "vp-02",
    type: "agent",
    name: "CDE Classifier",
    pitch: "Proposes CDE candidacy and the sensitive-attribute map for each product.",
    description:
      "An agent co-worker that evaluates columns against CDE criteria — obligation dependency, KPI dependency, reconciliation role — and drafts the CDE candidacy list per product, alongside a sensitivity classification map tuned to insurance NPPI categories: claims medical content, litigation and SIU flags, claimant financial data, licensing and appointment records. Proposed classifications are expressed in the governance-as-code schema so approval propagates to catalog labels, platform tags, and access policy attributes in one chain.",
    soWhat:
      "Sensitivity is decided once and propagated everywhere; the classification backlog that blocks sensitive-data unlock becomes a scored review queue rather than a discovery project.",
    audience: ["Data stewards", "Privacy partners", "Security engineers"],
    capabilities: ["classification", "catalog_metadata", "access_policy"],
    dataDomains: ["party", "claim", "employee-hr", "policy"],
    bestPracticeKeys: [
      "classify-once-propagate-everywhere",
      "agents-draft-stewards-decide",
      "agents-on-metadata-only",
    ],
    obligationKeys: ["glba-nppi", "state-privacy-laws", "hipaa-phi"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "specialty-es": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 2, "greenfield-platform": 1 },
    toolTags: [
      "classification (BigID, platform-native)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
    agentMeta: {
      drafts:
        "CDE candidacy lists with justification, and sensitive-attribute classification maps aligned to the insurance NPPI taxonomy.",
      humanDecides:
        "Final CDE designation, classification approval, and the access-policy consequences of each sensitivity label.",
      leverageMetric:
        "Steward-minutes per classified attribute versus manual review baseline; classification coverage of in-scope estate over time.",
      guardrails: [
        "operates on metadata and profiling output only, never bulk records",
        "sensitivity proposals never auto-apply to access policy — privacy partner approval is a hard gate",
        "suggestions below confidence threshold routed to deeper review",
        "benched to draft-only if acceptance rate drops below threshold",
      ],
    },
  },
  {
    key: "alignment-auditor",
    packKey: "vp-02",
    type: "agent",
    name: "Alignment Auditor",
    pitch: "Continuously scans for drift between governance standards and deployed configuration.",
    description:
      "An agent co-worker that compares governance standards and approved definitions against deployed reality — tags on the warehouse, policies in the enforcement layer, rules in the DQ engine, terms in the catalog — and reports drift with evidence: where implementation has quietly departed from the playbook, where an approved definition never deployed, where a manual change bypassed the pipeline. Doubles as an assessment accelerator, producing standards-vs-configuration findings machine-checked rather than interview-recalled.",
    soWhat:
      "Configuration drift surfaces in days instead of during an exam; standards owners see where the playbook is honored, ignored, or unenforceable — with evidence attached.",
    audience: ["Governance platform team", "Standards owners", "Internal audit liaisons"],
    capabilities: ["stewardship_ops", "access_policy", "data_quality", "catalog_metadata"],
    bestPracticeKeys: ["governance-as-code", "agents-draft-stewards-decide", "obligation-traceability"],
    obligationKeys: ["sox-icfr", "naic-model-audit-rule"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "greenfield-platform": 2, "report-integrity": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "ci-cd (Git-based pipeline, policy validation)",
    ],
    agentMeta: {
      drafts:
        "Drift reports: standards-vs-configuration deltas with evidence links, severity, and proposed remediation routing.",
      humanDecides:
        "Whether each delta is a violation to remediate, an approved exception to record, or a standards gap to escalate.",
      leverageMetric:
        "Drift findings surfaced per cycle versus manual audit sampling baseline; mean time from drift to detection.",
      guardrails: [
        "read-only against all governed platforms — reports drift, never corrects it autonomously",
        "operates on configuration and metadata only, never bulk records",
        "benched to draft-only if finding precision drops below threshold",
      ],
    },
  },
];
