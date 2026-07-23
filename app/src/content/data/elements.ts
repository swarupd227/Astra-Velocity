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
    platformAffinity: { "idmc-cdgc": 3, collibra: 3, atlan: 2, "power-bi": 2 },
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
    platformAffinity: { "idmc-cdgc": 3, collibra: 3, atlan: 2, "power-bi": 2 },
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
    platformAffinity: { "idmc-cdgc": 3, bigid: 2, snowflake: 2 },
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
    platformAffinity: { "idmc-cdgc": 3, bigid: 2, snowflake: 2 },
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
    platformAffinity: { "idmc-cdgc": 3, dbt: 2, icedq: 2, ataccama: 2 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "Authored as a CDQ rule with a Reference table threshold and severity binding, deployed as part of the mapping task that already touches the CDE.",
      },
      {
        platformKey: "dbt",
        note: "Expressed as a dbt test in the model YAML (`tests: - dbt_utils.expression_is_true: {arguments: {condition: 'earned_premium <= written_premium'}}`), surfaced as a failing build rather than a catalog breach.",
      },
      {
        platformKey: "icedq",
        note: "Written as a reconciliation rule comparing source and target aggregates across the ETL boundary — iceDQ's native comparison-rule idiom, run as part of the regression test suite.",
      },
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
    platformAffinity: { "idmc-cdgc": 3, collibra: 2, atlan: 2 },
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
    platformAffinity: { "idmc-cdgc": 2, dbt: 2, icedq: 2, ataccama: 2 },
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
    platformAffinity: { "idmc-cdgc": 3 },
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
    platformAffinity: { databricks: 3, "idmc-cdgc": 2, snowflake: 2 },
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
    platformAffinity: { bigid: 3, "idmc-cdgc": 2 },
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
    platformAffinity: { "idmc-cdgc": 3, collibra: 2 },
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

  // ───────────────────────── VP-03 Governance-as-Code Starter Repo ─────────────────────────
  {
    key: "gac-definition-schema",
    packKey: "vp-03",
    type: "template",
    name: "Governance Definition Schema",
    pitch: "One declarative schema for classifications, CDEs, DQ rules, access policy, and lineage targets.",
    description:
      "A versioned, declarative schema that expresses a governed data product as code: its classification chain, CDE registrations, DQ rules and thresholds, access policy intents, and lineage coverage targets in one reviewable definition set. Whether a classification originates from automated discovery, an agent draft, or manual steward entry, it lands in the same definition set — one source of truth, no drift between tools.",
    soWhat:
      "A data product's entire governance posture becomes a pull request a steward can read and a pipeline can deploy — the artifact that makes onboarding product 40 cheaper than product 4.",
    audience: ["Governance platform engineers", "Data stewards", "Data product teams"],
    capabilities: ["catalog_metadata", "classification", "data_quality", "access_policy"],
    bestPracticeKeys: ["governance-as-code", "classify-once-propagate-everywhere", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "sensitive-data-unlock": 2, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "ci-cd (Git-based pipeline, schema validation)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "policy-enforcement (Immuta, platform-native RBAC)",
    ],
    platformAffinity: { "idmc-cdgc": 3, databricks: 2, snowflake: 2 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "The schema compiles to CDGC objects — glossary term, CDE registration, and CDQ rule — created via CDGC's REST API, so the definition set and the catalog state are the same artifact.",
      },
      {
        platformKey: "snowflake",
        note: "Access-policy and classification intents in the schema compile to Snowflake tag assignments and masking-policy DDL, applied through the same migration tooling as any schema change.",
      },
      {
        platformKey: "databricks",
        note: "Compiles to Unity Catalog grant statements and tag assignments via the Databricks CLI/Terraform provider, keeping lakehouse governance state declared alongside the rest of the infrastructure-as-code.",
      },
    ],
  },
  {
    key: "gac-ci-pipeline",
    packKey: "vp-03",
    type: "toolkit",
    name: "Governance CI Pipeline",
    pitch: "Validate, review, deploy: governance definitions ship like software.",
    description:
      "The continuous-integration pipeline for the definition schema: syntax and referential validation, obligation and best-practice linting, mandatory human approval gates, and deployment jobs that push approved definitions into the catalog, warehouse tags, DQ engine, and access-policy layer. Every merge is an audit event with author, approver, and diff — the change record an examiner can replay.",
    soWhat:
      "Configuration drift becomes structurally difficult: nothing reaches production governance platforms except through a validated, approved, logged pipeline.",
    audience: ["Governance platform engineers", "Data office operations"],
    capabilities: ["stewardship_ops", "access_policy", "data_quality", "catalog_metadata"],
    bestPracticeKeys: ["governance-as-code", "steward-as-supervisor"],
    obligationKeys: ["sox-icfr"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "regulatory-reporting": 1, "report-integrity": 1 },
    toolTags: [
      "ci-cd (Git-based pipeline, policy validation)",
      "warehouse (Snowflake, Databricks)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 3, databricks: 2, snowflake: 2 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "The deployment job targets CDGC's catalog and CDQ APIs directly — a merged PR becomes a set of API calls that create or update glossary terms, CDE registrations, and rules.",
      },
      {
        platformKey: "snowflake",
        note: "The deployment job runs generated masking-policy and tag-assignment DDL against Snowflake through a database migration runner, with rollback handled the same as any schema migration.",
      },
      {
        platformKey: "databricks",
        note: "The deployment job applies Unity Catalog grant and tag changes through the Databricks CLI or Terraform provider, with plan/apply gating in CI mirroring the schema-change safeguards used elsewhere in the lakehouse.",
      },
    ],
  },
  {
    key: "gac-deployment-adapters",
    packKey: "vp-03",
    type: "toolkit",
    name: "Deployment Edge Adapters",
    pitch: "One definition set, many tools: market-stack variability absorbed at the deployment edge.",
    description:
      "Adapter modules that translate approved definitions into each platform's native form — catalog terms and CDE registrations via catalog APIs, tag and masking DDL on the warehouse, policy objects in the enforcement layer, rule configurations in the DQ engine. A product in a market running a different catalog or DQ tool runs the identical governance model with a different last mile.",
    soWhat:
      "Multi-market and multi-tool estates stop forcing a choice between tool standardization and governance consistency — the model is consistent, the tools stay local.",
    audience: ["Governance platform engineers", "Market data teams"],
    capabilities: ["catalog_metadata", "access_policy", "data_quality", "classification"],
    bestPracticeKeys: ["governance-as-code", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-commercial": 2,
      "specialty-es": 2,
      reinsurance: 2,
      "pc-personal": 1,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "ma-integration": 2, "greenfield-platform": 2, "regulatory-reporting": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "warehouse (Snowflake, Databricks)",
      "dq-engine (IceDQ, Informatica CDQ, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 3, databricks: 2, snowflake: 2, immuta: 1 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "The adapter's last mile calls the CDGC catalog and CDQ APIs; a market running Collibra or Atlan instead swaps this adapter without touching the definition schema itself.",
      },
      {
        platformKey: "immuta",
        note: "The adapter translates the definition set's access-policy intent into Immuta policy objects via its policy-as-code API — the same intent that, on a stack without Immuta, would compile straight to warehouse-native masking DDL.",
      },
      {
        platformKey: "snowflake",
        note: "Where no dedicated access-policy platform is present, the adapter compiles policy intent directly to Snowflake masking-policy and tag DDL, absorbing what Immuta would otherwise handle.",
      },
    ],
  },
  {
    key: "gac-onboarding-playbook",
    packKey: "vp-03",
    type: "playbook-method",
    name: "Product Onboarding as a Pull Request",
    pitch: "Scaffold a product's governance definition set at intake; onboard through the pipeline.",
    description:
      "The method for making the code substrate the default cheap path: at product intake, scaffold the definition set from the nearest archetype blueprint, express the target state per capability, and drive the five-stage governance cycle through pull requests — classification chain first, then CDEs and rules, then lineage targets, with the definition-of-done gate reading directly from merged, deployed definitions. Includes the intake checklist and the archetype-selection guide.",
    soWhat:
      "New platforms and new products get governed at inception at pull-request cost — instead of accruing governance debt that gets retrofitted at ten times the price.",
    audience: ["Data product teams", "Governance platform team", "Data stewards"],
    capabilities: ["stewardship_ops", "catalog_metadata"],
    bestPracticeKeys: ["govern-at-inception", "governance-as-code", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "health-benefits": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "ma-integration": 1, "ai-ml-readiness": 1 },
    toolTags: ["ci-cd (Git-based pipeline, policy validation)", "warehouse (Snowflake, Databricks)"],
    platformAffinity: { "idmc-cdgc": 2, databricks: 2, snowflake: 2 },
  },

  // ───────────────────────── VP-04 Governance Command Center ─────────────────────────
  {
    key: "steward-workbench-spec",
    packKey: "vp-04",
    type: "template",
    name: "Steward 'My Day' Workbench Specification",
    pitch: "The daily working surface where agent leverage is actually generated.",
    description:
      "A build-ready specification for the steward work queue: confidence-routed agent suggestions grouped by product and capability, one-click approve/edit/reject with rationale capture, a personal leverage counter, and a live audit tail. Low-confidence items route to a deeper-review lane; close-calendar context elevates items touching reporting tie-points. Designed to be implemented on the client's stack, not procured as a platform.",
    soWhat:
      "Stewards open one queue instead of five tool consoles — and the approve/edit/reject telemetry that prices the scale-out gets captured as a by-product of normal work.",
    audience: ["Data stewards", "Governance platform team", "UX engineers"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "agents-draft-stewards-decide", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "report-integrity": 2, "sensitive-data-unlock": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: [
      "workflow (steward queue, ITSM integration)",
      "bi (Power BI, Tableau)",
    ],
  },
  {
    key: "governance-telemetry-model",
    packKey: "vp-04",
    type: "guideline-standard",
    name: "Governance Telemetry Model",
    pitch: "Canonical events for suggestions, decisions, rule executions, and gate evidence.",
    description:
      "A canonical event model for governance operations: agent suggestion issued, steward decision taken, rule executed, breach opened and resolved, definition merged and deployed, gate evidence attached. Every metric the program reports — leverage ratios, acceptance rates, maturity scores — computes from these events, so value is measured by instrumentation rather than asserted in status decks.",
    soWhat:
      "Program leadership never argues about whether progress is real: the same events that run operations produce the numbers, and they cannot be massaged after the fact.",
    audience: ["Governance platform team", "Program leadership", "Data office operations"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["measured-leverage", "value-moments-visibility"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "report-integrity": 1, "greenfield-platform": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)", "bi (Power BI, Tableau)"],
  },
  {
    key: "unified-audit-log-standard",
    packKey: "vp-04",
    type: "guideline-standard",
    name: "Unified Human-and-Agent Audit Log Standard",
    pitch: "One audit trail spanning every human decision and every agent suggestion.",
    description:
      "The standard for a single audit log covering human and agent activity: what was suggested, by which agent at what confidence, who decided, what changed, and what deployed — retained and queryable to internal-audit evidence expectations. Includes the access pattern for audit and risk partners: read access to the log and lineage traces instead of a bespoke reporting surface.",
    soWhat:
      "Internal audit and examiners get evidence on demand — and the supervised-agent model becomes something a risk committee can approve because every action is replayable.",
    audience: ["Internal audit liaisons", "Risk partners", "Governance platform team"],
    capabilities: ["stewardship_ops", "access_policy"],
    bestPracticeKeys: ["agents-draft-stewards-decide", "regulator-explainable-lineage", "obligation-traceability"],
    obligationKeys: ["naic-model-audit-rule", "sox-icfr", "naic-ai-model-bulletin"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "ai-ml-readiness": 2, "sensitive-data-unlock": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)", "workflow (steward queue, ITSM integration)"],
  },
  {
    key: "command-center-rollout-playbook",
    packKey: "vp-04",
    type: "playbook-method",
    name: "Command Center Rollout Playbook",
    pitch: "Stand up the executive, data office, and steward surfaces in the right order.",
    description:
      "The sequenced method for standing up the three-surface console on client data: telemetry events first, the steward queue second (because it generates the telemetry), the data office operations view third, and the executive portfolio view last — so leadership's first look shows live numbers, not placeholders. Includes audience-by-audience question maps: what each surface must answer without a meeting.",
    soWhat:
      "The command center launches credible instead of cosmetic — leadership's first impression is real portfolio telemetry, which is what earns the program its standing weekly audience.",
    audience: ["Governance platform team", "Program leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["value-moments-visibility", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "report-integrity": 1, "operational-finops": 2, "greenfield-platform": 1 },
    toolTags: ["bi (Power BI, Tableau)", "workflow (steward queue, ITSM integration)"],
  },

  // ───────────────────────── VP-05 Scale Economics Model ─────────────────────────
  {
    key: "scale-economics-calculator",
    packKey: "vp-05",
    type: "toolkit",
    name: "Portfolio Scale Calculator",
    pitch: "Labor curve versus agentic curve, computed from measured actuals.",
    description:
      "An interactive model that projects the cost and timeline of governing a data product portfolio: archetype mix times measured per-product effort times steward leverage ratios times available capacity, producing labor-model and agentic-model curves, cost bands, and staffing shapes. Deliberately conservative: any capability whose agent acceptance rate stays low is costed at manual rates — the model carries no automation optimism it cannot evidence.",
    soWhat:
      "The scale decision becomes re-runnable arithmetic on the organization's own numbers — leadership can stress-test assumptions whenever they change, instead of re-commissioning a study.",
    audience: ["Data office leadership", "Finance partners", "Program leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["measured-leverage", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "greenfield-platform": 2, "ma-integration": 1 },
    toolTags: ["bi (Power BI, Tableau)", "spreadsheet-model (Excel, Google Sheets)"],
  },
  {
    key: "steward-leverage-ratio",
    packKey: "vp-05",
    type: "metric-kpi",
    name: "Steward Leverage Ratio",
    pitch: "Steward-minutes per artifact, manual baseline versus supervised-agentic — the number that prices the scale-out.",
    description:
      "The program's defining efficiency metric: instrumented steward-minutes per governance artifact (term, rule, classification, stitch) under the manual baseline versus the supervised-agentic model, computed per capability from the audit log. Published weekly, not quarterly, because it is the number every scale projection stands on.",
    soWhat:
      "The claim that agents make the portfolio affordable stops being a claim — it is a weekly published ratio anyone can interrogate, per capability, per product.",
    audience: ["Program leadership", "Data office leadership", "Finance partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["measured-leverage", "agents-draft-stewards-decide"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "ai-ml-readiness": 1, "greenfield-platform": 1 },
    toolTags: ["workflow (steward queue, audit log)", "bi (Power BI, Tableau)"],
  },
  {
    key: "time-to-governed",
    packKey: "vp-05",
    type: "metric-kpi",
    name: "Time-to-Governed per Product",
    pitch: "Elapsed weeks and effort-weeks from intake to definition-of-done, per archetype.",
    description:
      "Tracks each product's journey from intake to its governance definition-of-done in elapsed weeks and effort-weeks, segmented by archetype — and, critically, the delta between the first product of an archetype and the second, which is the compounding the code substrate exists to produce. A flat product-2-versus-product-1 curve is an early warning that patterns are not actually reusing.",
    soWhat:
      "Whoever funds the scale-out sees whether onboarding is genuinely getting cheaper — and pattern-reuse claims get falsified or proven within two waves.",
    audience: ["Program leadership", "Data office leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["pattern-reuse-economics", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "operational-finops": 1, "ma-integration": 1 },
    toolTags: ["workflow (steward queue, audit log)", "bi (Power BI, Tableau)"],
  },
  {
    key: "portfolio-archetype-method",
    packKey: "vp-05",
    type: "playbook-method",
    name: "Portfolio Archetype Segmentation Method",
    pitch: "Segment the portfolio by proven pattern, then let measured economics decide what scales next.",
    description:
      "The method for segmenting a data product portfolio into governance archetypes — sensitive-data, report-integrity, reconciliation, operational-data, new-platform — assigning per-archetype effort ranges from measured actuals, and sequencing waves by the combination of leverage ratio, business demand, and dependency readiness. Includes the dependency checklist that actually gates pace: access provisioning, scanner and connector coverage, source-system participation, approval throughput.",
    soWhat:
      "'What should we govern next' becomes a rankable, evidence-based decision instead of a stakeholder negotiation — and wave plans stop dying on unexamined dependencies.",
    audience: ["Data office leadership", "Program leadership", "Data product owners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["pattern-reuse-economics", "measured-leverage", "lineage-effort-triage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "operational-finops": 1, "report-integrity": 1 },
    toolTags: ["spreadsheet-model (Excel, Google Sheets)", "bi (Power BI, Tableau)"],
  },

  // ───────────────────────── VP-06 Capability Assessment Toolkit ─────────────────────────
  {
    key: "capability-scorecard-templates",
    packKey: "vp-06",
    type: "template",
    name: "Five-Capability Scorecard Templates",
    pitch: "Evidence-led scorecards for classification, catalog, semantic layer, quality, and lineage.",
    description:
      "Scorecard templates for the five governance capabilities, each built from evidence probes — configuration review, API-level metadata sampling, artifact inspection, structured practitioner sessions — rather than opinion surveys. Every scorecard carries the two lenses generic assessments miss: insurance-completeness (does the capability support actuarial DQ expectations, statutory integrity, NPPI handling?) and automation-readiness (what stands between this configuration and agentic operation?).",
    soWhat:
      "Leadership gets a defensible answer to 'is our tooling investment working and what do we fix first' in six weeks — comparable across capabilities and grounded in machine-checkable evidence.",
    audience: ["Assessment leads", "Data office leadership", "Enterprise architects"],
    capabilities: ["classification", "catalog_metadata", "semantic_layer", "data_quality", "lineage"],
    bestPracticeKeys: ["obligation-traceability", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "regulatory-reporting": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "classification (BigID, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 2, bigid: 1, snowflake: 1 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "The catalog and data-quality scorecards pull evidence directly from CDGC's metadata and CDQ APIs, so the automation-readiness lens scores CLAIRE suggestion volume against acceptance rate rather than against a claimed feature list.",
      },
      {
        platformKey: "bigid",
        note: "The classification scorecard scores against BigID's own confidence-threshold telemetry and correlation-engine coverage — the two numbers that actually predict whether classification will hold up under a privacy audit.",
      },
    ],
  },
  {
    key: "tool-role-mapping-canvas",
    packKey: "vp-06",
    type: "template",
    name: "Tool Role & Boundary Mapping Canvas",
    pitch: "Which tool anchors, supports, enforces, consumes — and where roles blur into friction.",
    description:
      "A mapping canvas that assigns each platform a role per capability — anchor, support, enforce, consume — and marks the friction watchpoints experience says to probe first: two engines both classifying with no propagation owner; the semantic layer contested across glossary, BI models, and warehouse logic; DQ rules duplicated across three execution points with orphaned alerts; lineage strong in the warehouse and weak at the source and report edges.",
    soWhat:
      "Tool overlap arguments become a completed canvas with named owners per handoff — the friction inventory that tells an architecture board exactly what to clarify first.",
    audience: ["Enterprise architects", "Assessment leads", "Platform owners"],
    capabilities: ["catalog_metadata", "classification", "data_quality", "lineage", "access_policy"],
    bestPracticeKeys: ["classify-once-propagate-everywhere", "one-certified-definition-per-metric"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "sensitive-data-unlock": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "warehouse (Snowflake, Databricks)",
    ],
    platformAffinity: { "idmc-cdgc": 2, snowflake: 2, databricks: 2, bigid: 1, immuta: 1, "power-bi": 1 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "Mapped as the catalog_metadata and data_quality anchor, with classification and semantic_layer marked supports — the canvas's first watchpoint is usually CLAIRE classification duplicating a BigID scan with no propagation owner named.",
      },
      {
        platformKey: "snowflake",
        note: "Mapped as the access_policy enforcement point regardless of which catalog anchors above it — the canvas exists precisely to stop this enforcement role from being assumed rather than assigned.",
      },
      {
        platformKey: "databricks",
        note: "Mapped as the lineage anchor and, when both a lakehouse and a warehouse sit in the stack, a second access_policy enforcement point — the canvas flags this as a watchpoint, not a redundancy to ignore.",
      },
      {
        platformKey: "power-bi",
        note: "Mapped as the semantic_layer anchor at the consumption edge — the canvas's job here is confirming Power BI's model logic reuses the certified glossary definition rather than re-deriving its own.",
      },
    ],
  },
  {
    key: "evidence-probe-checklists",
    packKey: "vp-06",
    type: "toolkit",
    name: "Evidence Probe Checklists",
    pitch: "The probes that turn an assessment from interviews into evidence.",
    description:
      "Structured probe checklists per capability: scan coverage against the priority estate, glossary association rates, native-AI suggestion telemetry and threshold behavior, DQ rule execution reality versus rule inventory, lineage scanner reach versus claimed coverage, and classification propagation end-to-end tests. Each probe specifies the API or configuration surface to sample and the artifact to capture as evidence.",
    soWhat:
      "Assessment findings survive challenge — every claim in the readout traces to a captured artifact, not to what a practitioner remembered in a workshop.",
    audience: ["Assessment leads", "Governance engineers"],
    capabilities: ["catalog_metadata", "data_quality", "lineage", "classification"],
    bestPracticeKeys: ["measured-leverage", "obligation-traceability"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 1, "regulatory-reporting": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 2, databricks: 1, bigid: 1 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "The native-AI probe samples CLAIRE's suggestion confidence distribution and acceptance rate directly from CDGC's audit API, rather than asking a practitioner to estimate it.",
      },
      {
        platformKey: "databricks",
        note: "The lineage probe compares Unity Catalog's automatically captured lineage graph against the claimed coverage map — automatic capture inside the lakehouse makes under-claiming as likely a finding as over-claiming.",
      },
      {
        platformKey: "bigid",
        note: "The classification probe runs BigID's correlation engine against a known test-subject sample and checks the match rate, rather than accepting classifier deployment as proof classification actually works.",
      },
    ],
  },
  {
    key: "native-ai-activation-review",
    packKey: "vp-06",
    type: "playbook-method",
    name: "Native AI Activation Review",
    pitch: "Find the platform intelligence already paid for but switched off.",
    description:
      "A method for assessing whether the in-scope platforms' native AI and automation — catalog auto-association, auto-classification, anomaly detection, native quality suggestions — is positioned, tuned, and actually used. Measures suggestion precision at current thresholds, maps the human-review workflow around each capability, and produces an activation plan: what is underused, what switching it on requires, and where an external agent layer genuinely adds beyond platform-native reach.",
    soWhat:
      "The organization stops buying automation it already owns — and the agent roadmap starts from platform-native-first, which is the version security and procurement approve fastest.",
    audience: ["Platform owners", "Assessment leads", "Governance platform team"],
    capabilities: ["catalog_metadata", "classification", "data_quality"],
    bestPracticeKeys: ["measured-leverage", "agents-draft-stewards-decide"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "health-benefits": 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 2, "greenfield-platform": 1, "operational-finops": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "classification (BigID, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 3, snowflake: 2, databricks: 2, bigid: 2, immuta: 1, "power-bi": 2 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "Reviews CLAIRE suggestion precision on classification and glossary association, and whether curation still starts from a blank form instead of a CLAIRE-suggested candidate.",
      },
      {
        platformKey: "snowflake",
        note: "Reviews Cortex Analyst adoption against the certified semantic model, and whether Cortex-governed AI functions actually enforce the same masking and RBAC as any query or are being bypassed by direct warehouse access.",
      },
      {
        platformKey: "databricks",
        note: "Reviews whether Unity Catalog's automatic lineage capture is genuinely relied on end-to-end, and whether Databricks Assistant's Lakehouse Monitoring anomaly signals route into the steward triage queue or get silently ignored.",
      },
      {
        platformKey: "bigid",
        note: "Reviews classifier confidence thresholds and correlation-engine coverage against the insurance NPPI taxonomy, since BigID's ML engine is the whole product to activate, not a bolt-on feature.",
      },
      {
        platformKey: "power-bi",
        note: "Reviews whether Copilot in Power BI is scoped to certified datasets only, since a Copilot summary over an uncertified dataset produces a fluent, wrong answer as easily as an uncertified manual report.",
      },
    ],
  },

  // ───────────────────────── VP-07 Standards Traceability & Playbook Refresh Kit ─────────────────────────
  {
    key: "standards-traceability-matrix",
    packKey: "vp-07",
    type: "template",
    name: "Standards Traceability Matrix",
    pitch: "Standard → intent → enforcing tool → adoption evidence, graded for action.",
    description:
      "A matrix template mapping every governance standard to what it requires, the problem it solves, the tool expected to enforce it, and the evidence of adoption — graded clarify / strengthen / simplify / complete, plus two grades most frameworks lack: automatable-as-written (can a pipeline or agent enforce it, or does ambiguity force human interpretation every time?) and insurance-complete (does it account for actuarial DQ expectations, statutory integrity, and NPPI handling?).",
    soWhat:
      "'Exists but does not solve' becomes visible per standard — and the pre-implementation fix list arrives prioritized by what actually gates delivery.",
    audience: ["Standards owners", "Governance council", "Assessment leads"],
    capabilities: ["stewardship_ops", "catalog_metadata"],
    bestPracticeKeys: ["governance-as-code", "obligation-traceability"],
    obligationKeys: ["naic-model-audit-rule", "asop-23"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "greenfield-platform": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["spreadsheet-model (Excel, Google Sheets)", "catalog-suite (Informatica CDGC, Collibra, Atlan)"],
  },
  {
    key: "standards-grading-method",
    packKey: "vp-07",
    type: "playbook-method",
    name: "Standards Grading Method",
    pitch: "A repeatable rubric for finding the standards that create non-compliance by design.",
    description:
      "The grading method behind the matrix, with the failure modes to test for: standards no tool can enforce as written; standards that solve an audit problem by creating a steward burden that guarantees non-compliance; standards that assume a central actor no operating model provides; standards stating intent without enforceable thresholds. Each finding ships with the proposed change, the evidence, and the why — candid by design.",
    soWhat:
      "Standards owners get findings they can act on rather than criticism — and the standards that would silently multiply cost across a hundred products get fixed before scale, not after.",
    audience: ["Standards owners", "Governance council"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["governance-as-code", "remediation-loop-not-dashboard"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      reinsurance: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 1, "greenfield-platform": 2, "report-integrity": 1 },
    toolTags: ["spreadsheet-model (Excel, Google Sheets)"],
  },
  {
    key: "playbook-refresh-loop",
    packKey: "vp-07",
    type: "playbook-method",
    name: "Playbook Refresh Loop",
    pitch: "Playbook updates proven in live products before they are ratified.",
    description:
      "The method that keeps a governance playbook alive: every proposed standards change is validated by applying it in a live data product, re-tested, and only then routed to the ratification body with its evidence attached. Standards a product cannot pass surface as standards findings, never silent waivers — which is how the playbook improves through application rather than through workshops.",
    soWhat:
      "The playbook stops drifting from reality: ratification bodies approve changes that already work, and delivery teams stop maintaining a private fork of 'how we actually do it.'",
    audience: ["Standards owners", "Governance council", "Data stewards"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["governance-as-code", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 1, "regulatory-reporting": 1 },
    toolTags: ["ci-cd (Git-based pipeline, docs-as-code)"],
  },
  {
    key: "obligation-crosswalk-register",
    packKey: "vp-07",
    type: "template",
    name: "Obligation Crosswalk Register",
    pitch: "Every governance standard traced to the regulatory obligation that justifies it.",
    description:
      "A register template that crosswalks internal standards to external obligations — model audit rule, SOX/ICFR, actuarial standards of practice, privacy statutes, AI bulletins — so each standard carries its regulatory 'why', and each obligation shows which standards and controls evidence it. Gaps read in both directions: standards without obligations (candidates for simplification) and obligations without standards (findings).",
    soWhat:
      "When an examiner asks 'show me how you comply,' the answer is a filtered register view — and internal debates about whether a standard is worth its burden get settled by what it traces to.",
    audience: ["Compliance partners", "Standards owners", "Internal audit liaisons"],
    capabilities: ["stewardship_ops", "access_policy"],
    bestPracticeKeys: ["obligation-traceability"],
    obligationKeys: ["naic-model-audit-rule", "sox-icfr", "glba-nppi", "asop-23", "state-doi-market-conduct"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      investments: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 3, "sensitive-data-unlock": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["spreadsheet-model (Excel, Google Sheets)", "catalog-suite (Informatica CDGC, Collibra, Atlan)"],
  },

  // ───────────────────────── VP-08 Governance Performance Index ─────────────────────────
  {
    key: "gpi-composite-score",
    packKey: "vp-08",
    type: "metric-kpi",
    name: "Governance Performance Index Score",
    pitch: "Target maturity as a number: 0-100, dimension-weighted, telemetry-computed.",
    description:
      "A composite 0-100 maturity score per data product across weighted dimensions — classification coverage, catalog curation, semantic certification, CDE control coverage, lineage explainability, stewardship operations — computed from live platform telemetry rather than self-assessment. Rolls up to a portfolio view and burns up toward the target-state goal, quarter by quarter.",
    soWhat:
      "'Target governance maturity' gets a measurable, non-negotiable meaning — leadership tracks one number per product, and gate reviews argue about evidence, not adjectives.",
    audience: ["Data office leadership", "Data product owners", "Program leadership"],
    capabilities: ["stewardship_ops", "data_quality", "catalog_metadata"],
    bestPracticeKeys: ["measured-leverage", "cde-anchored-quality"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "greenfield-platform": 2, "regulatory-reporting": 1 },
    toolTags: ["bi (Power BI, Tableau)", "warehouse (Snowflake, Databricks)"],
  },
  {
    key: "gpi-scoring-method",
    packKey: "vp-08",
    type: "playbook-method",
    name: "GPI Scoring & Calibration Method",
    pitch: "The dimensions, weights, telemetry inputs, and calibration discipline behind the index.",
    description:
      "The method for standing up the index credibly: dimension definitions and telemetry sources, weighting rationale by product archetype (a finance product weights lineage and reconciliation higher; a sensitive-data product weights classification and access), calibration against a scored reference set, and the anti-gaming rules — no dimension scores above zero without machine-verifiable evidence.",
    soWhat:
      "The index survives its first skeptical CFO review — because every point on every product traces to telemetry, and the weights have a written rationale per archetype.",
    audience: ["Governance platform team", "Data office leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["measured-leverage", "obligation-traceability"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 1, "greenfield-platform": 2, "operational-finops": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)", "bi (Power BI, Tableau)"],
  },
  {
    key: "governance-definition-of-done",
    packKey: "vp-08",
    type: "guideline-standard",
    name: "Governance Definition-of-Done",
    pitch: "The evidence checklist a product must pass to call itself governed.",
    description:
      "A per-product gate standard: GPI at or above threshold, 100% of identified CDEs with executing monitored controls, priority lineage rendering source-to-consumption, sensitive attributes classified with policy linkage, named trainees demonstrating a bounded governance task end-to-end, and the definition set merged and deployed through the pipeline. Gates are evidence checks — rules executing, lineage rendering, participation logged — not slide reviews.",
    soWhat:
      "Products stop being declared done by fatigue: the gate is the same for every product, and what passed it is inspectable a year later.",
    audience: ["Data product owners", "Data stewards", "Program leadership"],
    capabilities: ["stewardship_ops", "data_quality", "lineage", "classification"],
    bestPracticeKeys: ["cde-anchored-quality", "named-trainees-demonstrated-readiness", "regulator-explainable-lineage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 2, "sensitive-data-unlock": 1 },
    toolTags: ["workflow (steward queue, gate evidence pack)", "ci-cd (Git-based pipeline, policy validation)"],
  },
  {
    key: "agent-acceptance-rate",
    packKey: "vp-08",
    type: "metric-kpi",
    name: "Agent Suggestion Acceptance Rate",
    pitch: "Do stewards trust their agent co-workers — and should they?",
    description:
      "Per-agent approve/edit/reject rates from the audit log on a 30-day rolling window, with a published bench threshold: any agent whose acceptance rate drifts below it is pulled back to draft-only until retuned. Read alongside edit-distance on accepted suggestions, because a high acceptance rate with heavy edits is quiet rejection.",
    soWhat:
      "Automation stays a help, not a hazard: drifting agents get benched by a rule rather than discovered by an incident, and stewards see that the supervision they provide is real.",
    audience: ["Governance platform team", "Data stewards", "Risk partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["bench-drifting-agents", "agents-draft-stewards-decide", "measured-leverage"],
    obligationKeys: ["naic-ai-model-bulletin"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 2, "operational-finops": 1, "sensitive-data-unlock": 1 },
    toolTags: ["workflow (steward queue, audit log)", "bi (Power BI, Tableau)"],
  },

  // ───────────────────────── VP-09 Steward-as-Supervisor Enablement Kit ─────────────────────────
  {
    key: "tm-governance-foundations",
    packKey: "vp-09",
    type: "training-module",
    name: "Governance Foundations & Catalog Craft",
    pitch: "The operating context plus hands-on catalog and glossary curation in the live product.",
    description:
      "Combined foundation training: the organization's standards and playbook as currently ratified, roles and definitions-of-done, the operating cadence — then straight into hands-on catalog and glossary craft in a live data product: curation workflow, business-to-technical association, and working from agent-suggested candidates rather than blank templates. Trainees meet the agent co-workers in their first lab so supervision is learned as the normal way of working.",
    soWhat:
      "New stewards are productive in the real estate within their first week of training — and never learn the blank-template habit the agentic model replaces.",
    audience: ["Data stewards", "New governance practitioners"],
    capabilities: ["catalog_metadata", "semantic_layer", "stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "agents-draft-stewards-decide", "named-trainees-demonstrated-readiness"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 1, "sensitive-data-unlock": 1 },
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)"],
  },
  {
    key: "tm-cde-quality-classification",
    packKey: "vp-09",
    type: "training-module",
    name: "CDE, Quality & the Classification-to-Access Chain",
    pitch: "From CDE identification through agent-drafted rules to sensitivity and access — as labs, not lectures.",
    description:
      "Hands-on labs covering CDE identification and registration, reviewing and tuning agent-drafted DQ rules, deploying rules through the code pipeline with monitoring, and the full classification-to-access chain: discovery, catalog labels, platform tags, policy attributes — including insurance NPPI categories and their handling duties. Run inside the sensitive-data product wherever one is in flight, because that is where the chain is real.",
    soWhat:
      "Stewards leave able to take an attribute from 'discovered' to 'classified, controlled, and access-enforced' without an engineer — the end-to-end skill most programs never transfer.",
    audience: ["Data stewards", "DQ analysts", "Privacy partners"],
    capabilities: ["data_quality", "classification", "access_policy"],
    bestPracticeKeys: ["cde-anchored-quality", "classify-once-propagate-everywhere", "named-trainees-demonstrated-readiness"],
    obligationKeys: ["glba-nppi", "asop-23"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "report-integrity": 2, "actuarial-readiness": 1 },
    toolTags: [
      "classification (BigID, platform-native)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
    platformAffinity: { bigid: 2, immuta: 2, "idmc-cdgc": 1 },
    platformVariants: [
      {
        platformKey: "bigid",
        note: "The classification lab runs against BigID's classifier UI so trainees see real confidence scores and correlation-engine output, not a simulated screen.",
      },
      {
        platformKey: "immuta",
        note: "The access-enforcement lab has trainees author an actual Immuta purpose-based policy and watch it take effect across a connected warehouse in real time.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "The CDE-registration lab runs inside CDGC, so trainees register a CDE and watch its CDQ rule deploy through the same pipeline production rules use.",
      },
    ],
  },
  {
    key: "tm-lineage-governance-as-code",
    packKey: "vp-09",
    type: "training-module",
    name: "Lineage That Explains Itself & Governance-as-Code",
    pitch: "Gap triage, stitch documentation, and the pull-request workflow — taught on a real onboarding.",
    description:
      "Paired labs on the two most engineering-shaped steward skills: lineage (scanners and connectors, gap triage judgment, stitch documentation, building to regulator-explainability) and governance-as-code (the definition schema, the pull-request review workflow, CI checks, and onboarding a new product through the pipeline). Best taught on a live new-platform onboarding, where both skills are exercised for real.",
    soWhat:
      "Stewards can review a governance pull request the way an underwriter reviews a referral — with judgment, not just process — and lineage stops being a specialist black box.",
    audience: ["Data stewards", "Governance engineers", "Data product teams"],
    capabilities: ["lineage", "stewardship_ops", "catalog_metadata"],
    bestPracticeKeys: ["governance-as-code", "lineage-effort-triage", "regulator-explainable-lineage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "regulatory-reporting": 2, "financial-reconciliation": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "ci-cd (Git-based pipeline, policy validation)",
    ],
  },
  {
    key: "tm-agent-supervision-teach-forward",
    packKey: "vp-09",
    type: "training-module",
    name: "Supervising the Agents & Teaching It Forward",
    pitch: "The steward-as-supervisor discipline, then the practicum that certifies internal trainers.",
    description:
      "Scenario drills on the new core competency: reading confidence scores, exercising rejection judgment, tuning thresholds, reviewing the audit log, and recognizing agent drift before the bench rule fires. Concludes with the teach-forward practicum: trainees co-teach the earlier modules to the next cohort against a certification checklist, creating the internal teaching bench that carries the model to the rest of the portfolio.",
    soWhat:
      "Self-sufficiency becomes structural: the organization ends up with certified internal trainers and stewards who supervise agents as routinely as underwriters supervise delegated authority.",
    audience: ["Data stewards", "Enablement leads", "Governance platform team"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "bench-drifting-agents", "named-trainees-demonstrated-readiness"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 2, "operational-finops": 1, "sensitive-data-unlock": 1 },
    toolTags: ["workflow (steward queue, audit log)"],
  },
  {
    key: "readiness-demonstration-kit",
    packKey: "vp-09",
    type: "template",
    name: "Readiness Demonstration Kit",
    pitch: "Named trainees, participation expectations, and recorded demonstrations — transfer with evidence.",
    description:
      "Templates for making capability transfer verifiable: trainee role cards with hands-on participation expectations by role and week, readiness-demonstration checklists (a bounded governance task run end-to-end, including supervising agent suggestions, without vendor hands on keyboard), and the recording and sign-off format that turns each demonstration into transfer evidence.",
    soWhat:
      "Enablement stops failing quietly: exit gates read a register of named people with recorded demonstrations, not an attendance sheet — and vendors become a choice, not a dependency.",
    audience: ["Enablement leads", "Program leadership", "Data stewards"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["named-trainees-demonstrated-readiness", "steward-as-supervisor"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "greenfield-platform": 1, "report-integrity": 1, "operational-finops": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["workflow (training register, recorded demonstrations)"],
  },

  // ───────────────────────── VP-10 Lineage Gap Triage Method ─────────────────────────
  {
    key: "lineage-triage-decision-tree",
    packKey: "vp-10",
    type: "playbook-method",
    name: "Lineage Gap Triage Decision Tree",
    pitch: "Scanner-covered → connector-buildable → assisted stitch → documented manual — with cost thresholds.",
    description:
      "The four-way decision method for every lineage gap: covered by an existing scanner, buildable with a connector worth its cost, stitchable with agent assistance and human confirmation, or documented as a deliberate manual segment. Each branch carries cost/benefit thresholds tied to product criticality and obligation exposure — a Schedule P feeder clears a different bar than a departmental dashboard.",
    soWhat:
      "Lineage budgets go where regulators and reconciliations actually look — and the program can say, honestly and in writing, why any given segment is documented rather than automated.",
    audience: ["Lineage engineers", "Data stewards", "Data office leadership"],
    capabilities: ["lineage"],
    bestPracticeKeys: ["lineage-effort-triage", "regulator-explainable-lineage"],
    obligationKeys: ["naic-model-audit-rule", "schedule-p", "sox-icfr"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 2,
      reinsurance: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 3, "report-integrity": 2, "financial-reconciliation": 2 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "scanner-coverage-map",
    packKey: "vp-10",
    type: "template",
    name: "Scanner Coverage Map Template",
    pitch: "What the scanners actually reach, versus what the lineage story claims.",
    description:
      "A coverage-map template that plots scanner and connector reach against the priority data estate — source systems, pipelines, warehouse zones, semantic models, reports — distinguishing rendered lineage from claimed lineage. Populated per product at intake and maintained as scanners and connectors evolve, it is the honest input the triage decision tree consumes.",
    soWhat:
      "Lineage conversations start from a map instead of an assumption — and the gap between 'we have lineage' and 'we can trace this figure' is visible before an examiner finds it.",
    audience: ["Lineage engineers", "Assessment leads"],
    capabilities: ["lineage"],
    bestPracticeKeys: ["lineage-effort-triage", "regulator-explainable-lineage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "report-integrity": 2, "financial-reconciliation": 1 },
    effortSavedStewardWeeks: 0.5,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)"],
    platformAffinity: { "idmc-cdgc": 2, databricks: 3, bigid: 1 },
    platformVariants: [
      {
        platformKey: "databricks",
        note: "Unity Catalog lineage capture is automatic for anything running through the lakehouse, so the map marks that zone rendered by default and reserves manual documentation for what happens before ingestion and after export.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Scanner reach is plotted per connector configured in CDGC — the map's most common finding is a source system with no scanner connector at all, silently excluded from claimed coverage.",
      },
      {
        platformKey: "bigid",
        note: "Plots BigID's scan reach separately from the catalog's own scanner, since unstructured and free-text claims content is frequently covered by BigID and invisible to a catalog-only lineage story.",
      },
    ],
  },
  {
    key: "manual-stitch-documentation-standard",
    packKey: "vp-10",
    type: "guideline-standard",
    name: "Manual Stitch Documentation Standard",
    pitch: "Unscannable segments documented deliberately, to examiner-grade.",
    description:
      "The documentation standard for lineage segments that scanners and connectors cannot reach: what the segment connects, the transformation logic in plain language, the owner, the refresh trigger, and the review cadence — captured in the catalog alongside rendered lineage so a trace reads continuously to a reviewer. Manual is acceptable; undocumented is not.",
    soWhat:
      "Audit and exam responses stop hitting the cliff where rendered lineage ends — the trace continues in governed documentation, and 'we don't know what happens in that hop' disappears as an answer.",
    audience: ["Lineage engineers", "Data stewards", "Internal audit liaisons"],
    capabilities: ["lineage", "catalog_metadata"],
    bestPracticeKeys: ["regulator-explainable-lineage", "lineage-effort-triage"],
    obligationKeys: ["naic-model-audit-rule", "sox-icfr"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 2,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "financial-reconciliation": 2, "report-integrity": 1 },
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)"],
  },
  {
    key: "lineage-explainability-rate",
    packKey: "vp-10",
    type: "metric-kpi",
    name: "Lineage Explainability Rate",
    pitch: "Can a suspect number be traced on demand? Measured, sampled, published.",
    description:
      "The percentage of priority-report headline figures with a complete source-to-consumption trace (rendered or governed-manual), paired with a sampled time-to-diagnose drill: pick a figure, trace it, time it. The pairing matters — coverage without speed means the trace exists but nobody can use it under pressure.",
    soWhat:
      "Finance and audit get a standing answer to 'can you explain this number' — and diagnosing a suspect figure drops from days of archaeology to minutes of trace-following.",
    audience: ["Data office leadership", "Internal audit liaisons", "Finance data leads"],
    capabilities: ["lineage"],
    bestPracticeKeys: ["regulator-explainable-lineage", "measured-leverage"],
    kpiKeys: ["close-cycle-time"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 2,
    },
    scenarioAffinity: { "report-integrity": 3, "regulatory-reporting": 2, "financial-reconciliation": 2 },
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "bi (Power BI, Tableau)"],
  },

  // ───────────────────────── VP-11 Insurance NPPI/PII Playcard ─────────────────────────
  {
    key: "insurance-nppi-taxonomy",
    packKey: "vp-11",
    type: "guideline-standard",
    name: "Insurance NPPI Sensitivity Taxonomy",
    pitch: "Insurance NPPI is broader than PII — a taxonomy that knows it.",
    description:
      "A sensitivity taxonomy built for what insurers actually hold: claim files carrying medical records with statutory handling duties, litigation and SIU material, financial data of claimants who are not customers, adjuster and producer licensing and appointment records regulated by state insurance departments, producer compensation, and benefits data with EEO-protected attributes. Each category maps to handling duties, masking expectations, and access purposes.",
    soWhat:
      "Classification programs stop missing the categories that cause insurance privacy incidents — the ones a generic PII taxonomy has never heard of.",
    audience: ["Privacy partners", "Data stewards", "Security engineers"],
    capabilities: ["classification", "access_policy"],
    dataDomains: ["claim", "party", "employee-hr", "producer-distribution"],
    bestPracticeKeys: ["classify-once-propagate-everywhere", "purpose-based-access", "obligation-traceability"],
    obligationKeys: ["glba-nppi", "hipaa-phi", "state-privacy-laws", "state-doi-market-conduct"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 2, "claims-analytics": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: [
      "classification (BigID, platform-native)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },
  {
    key: "classification-to-access-chain",
    packKey: "vp-11",
    type: "playbook-method",
    name: "Classification-to-Access Chain Pattern",
    pitch: "One label chain from discovery to enforcement — sensitivity decided once, propagated everywhere.",
    description:
      "The end-to-end pattern for wiring sensitivity to enforcement: automated discovery proposes, stewards and privacy partners approve, and the approved label propagates as code to catalog annotations, warehouse tags and masking, and attribute-based access policies — replacing per-view provisioning with role-and-purpose policies. Includes the duplicate-view retirement step: once governed access exists, shadow copies are inventoried and retired against it.",
    soWhat:
      "Access provisioning for sensitive analytics drops from weeks to days, every access decision is replayable for audit, and each retired duplicate view is a future finding that never happens.",
    audience: ["Security engineers", "Privacy partners", "Data stewards", "HR analytics leads"],
    capabilities: ["classification", "access_policy"],
    dataDomains: ["employee-hr", "party", "claim"],
    bestPracticeKeys: ["classify-once-propagate-everywhere", "purpose-based-access", "duplicate-views-retired"],
    obligationKeys: ["glba-nppi", "state-privacy-laws"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 1 },
    toolTags: [
      "classification (BigID, platform-native)",
      "policy-enforcement (Immuta, platform-native RBAC)",
      "warehouse (Snowflake, Databricks)",
    ],
    platformAffinity: { bigid: 3, immuta: 3, "idmc-cdgc": 2, snowflake: 2, databricks: 1 },
    platformVariants: [
      {
        platformKey: "bigid",
        note: "Discovery and classification originate in BigID's ML classifiers; the propagation step exports confidence-scored labels via API rather than re-deriving them in the catalog.",
      },
      {
        platformKey: "immuta",
        note: "The approved label lands as an Immuta policy attribute so masking enforces dynamically across every connected warehouse, without a duplicated masked view per consumer.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "The approved label writes to a CDGC catalog annotation and CDE registration in the same API call, keeping the catalog and the enforcement layer's tag in lockstep.",
      },
      {
        platformKey: "snowflake",
        note: "Where no dedicated access-policy platform sits in the stack, the label compiles directly to a Snowflake object tag plus a masking-policy assignment keyed on that same tag.",
      },
    ],
  },
  {
    key: "metadata-only-agent-boundary",
    packKey: "vp-11",
    type: "best-practice-card",
    name: "Agents on Metadata, Never Bulk Records",
    pitch: "The architectural choice that makes agentic governance NPPI-safe by construction.",
    description:
      "The practice card for the model's load-bearing safety property: governance agents operate on metadata, profiling statistics, and configuration — never bulk records — so no agent can exfiltrate, memorize, or mishandle claimant medical content or policyholder financial data, by construction rather than by exception handling. Includes the review questions a privacy office should ask of any proposed agent, and the masked/synthetic data pattern for development environments.",
    soWhat:
      "The privacy office can approve AI-assisted governance on architecture rather than on trust — which is the difference between a two-week approval and a dead initiative.",
    audience: ["Privacy partners", "Security engineers", "Governance platform team"],
    capabilities: ["classification", "stewardship_ops"],
    bestPracticeKeys: ["agents-on-metadata-only", "agents-draft-stewards-decide"],
    obligationKeys: ["glba-nppi", "hipaa-phi", "naic-ai-model-bulletin"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "ai-ml-readiness": 2 },
    toolTags: ["agent-runtime (platform-native AI, hosted LLM in client boundary)"],
  },
  {
    key: "nppi-incident-protocol",
    packKey: "vp-11",
    type: "template",
    name: "NPPI Incident Protocol Template",
    pitch: "When sensitive data is mishandled, the first hour is scripted, not improvised.",
    description:
      "A ready-to-adapt incident protocol for NPPI exposure events in governance and delivery work: detection and containment steps, the notification decision tree against statutory and contractual duties, evidence preservation aligned to the audit log, and the post-incident feedback loop into classification and access policy. Scoped to the governance program's surface — catalogs, pipelines, agent operations, development environments.",
    soWhat:
      "An exposure event becomes a contained, documented incident with statutory notification decisions made on time — instead of an improvised scramble that compounds the breach.",
    audience: ["Privacy partners", "Security engineers", "Program leadership"],
    capabilities: ["access_policy", "stewardship_ops"],
    bestPracticeKeys: ["purpose-based-access", "obligation-traceability"],
    obligationKeys: ["glba-nppi", "state-privacy-laws", "hipaa-phi"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 0.5,
    toolTags: ["workflow (incident management, ITSM integration)"],
  },

  // ───────────────────────── VP-12 Data Contract Starter Pack ─────────────────────────
  {
    key: "data-contract-template",
    packKey: "vp-12",
    type: "template",
    name: "Data Contract Template",
    pitch: "Schema, semantics, quality thresholds, SLAs, and change control at every producer-consumer boundary.",
    description:
      "A versioned data contract template for producer-consumer boundaries: schema and semantic commitments (terms bound to the certified glossary), quality thresholds on the CDEs the consumer depends on, delivery SLAs, breaking-change and deprecation rules, and named owners on both sides. Written to be CI-checkable, so a contract violation fails a pipeline rather than surfacing in a month-end number.",
    soWhat:
      "Downstream teams stop discovering upstream changes in their reconciliations — boundary disputes become contract conversations with evidence and owners.",
    audience: ["Data product teams", "Data engineers", "Data stewards"],
    capabilities: ["data_quality", "semantic_layer", "catalog_metadata"],
    dataDomains: ["policy", "claim", "premium", "billing"],
    bestPracticeKeys: ["data-contracts-at-boundaries", "govern-at-inception", "cde-anchored-quality"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "financial-reconciliation": 2, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: [
      "ci-cd (Git-based pipeline, contract validation)",
      "warehouse (Snowflake, Databricks)",
    ],
    platformAffinity: { snowflake: 2, databricks: 2 },
    platformVariants: [
      {
        platformKey: "snowflake",
        note: "The contract's quality-threshold section compiles to a Snowflake-native check executed as part of the ingestion pipeline, failing the load rather than the report.",
      },
      {
        platformKey: "databricks",
        note: "CI validation runs against the Delta table schema before a job is promoted, so a breaking upstream schema change fails the pipeline instead of reaching a downstream notebook.",
      },
    ],
  },
  {
    key: "bordereaux-tpa-contract-exemplars",
    packKey: "vp-12",
    type: "template",
    name: "Bordereaux & TPA Feed Contract Exemplars",
    pitch: "Worked contracts for the boundaries where insurers bleed the most data quality.",
    description:
      "Filled-in contract exemplars for the industry's leakiest boundaries: delegated-authority premium and claims bordereaux (period completeness, risk-level detail, binder reference validity, currency and layer consistency) and TPA claim feeds (lifecycle status mapping, reserve and payment reconciliation, claimant data handling duties). Each exemplar encodes the checks that catch the classic failures — missing months, remapped codes, silently changed layouts.",
    soWhat:
      "Delegated and outsourced business stops being a quality blind spot — cedents, coverholders, and TPAs work to explicit, checkable data expectations, and month-one gaps surface in month one.",
    audience: ["Delegated authority teams", "Ceded reinsurance teams", "Claims operations", "Data stewards"],
    capabilities: ["data_quality", "catalog_metadata"],
    dataDomains: ["reinsurance-cession", "claim", "premium", "producer-distribution"],
    bestPracticeKeys: ["data-contracts-at-boundaries", "cde-anchored-quality"],
    obligationKeys: ["lloyds-minimum-standards"],
    kpiKeys: ["cession-rate", "net-retention"],
    sectorAffinity: { "specialty-es": 3, reinsurance: 3, "brokerage-mga": 3, "pc-commercial": 1 },
    scenarioAffinity: { "financial-reconciliation": 2, "regulatory-reporting": 2, "report-integrity": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "ci-cd (Git-based pipeline, contract validation)",
    ],
  },
  {
    key: "contract-enforcement-toolkit",
    packKey: "vp-12",
    type: "toolkit",
    name: "Contract Enforcement Toolkit",
    pitch: "Contracts that fail pipelines, not relationships.",
    description:
      "The enforcement wiring for data contracts: CI checks that validate schema and semantic commitments at build time, runtime validators that execute contract quality thresholds as DQ rules where the data lands, breach routing into the steward triage queue, and contract-version telemetry so both sides see compliance history. A contract without enforcement is a memo; this makes it a control.",
    soWhat:
      "Contract breaches surface as routed, owned breaches within the cycle they occur — not as quarter-end forensics — and producers see their own compliance record before consumers complain.",
    audience: ["Data engineers", "Governance platform team", "DQ analysts"],
    capabilities: ["data_quality", "stewardship_ops"],
    bestPracticeKeys: ["data-contracts-at-boundaries", "remediation-loop-not-dashboard", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      "specialty-es": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "financial-reconciliation": 2, "greenfield-platform": 2, "operational-finops": 1 },
    toolTags: [
      "ci-cd (Git-based pipeline, contract validation)",
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "workflow (steward queue, ITSM integration)",
    ],
    platformAffinity: { snowflake: 2, databricks: 2, "idmc-cdgc": 1 },
    platformVariants: [
      {
        platformKey: "snowflake",
        note: "Runtime validators execute as scheduled SQL tasks against Snowflake compiling contract thresholds into query assertions, with breach rows landing in a dedicated schema the steward queue reads from.",
      },
      {
        platformKey: "databricks",
        note: "Runtime validators run as Lakehouse Monitoring expectations attached to the contract's target tables, so a breach is a monitoring alert routed the same way as any other data-quality signal in the lakehouse.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Contract quality thresholds compile to CDQ rules bound to the CDEs the contract covers, so a contract breach and a standard DQ rule breach land in the same CDGC breach queue.",
      },
    ],
  },
  {
    key: "boundary-contract-adoption-card",
    packKey: "vp-12",
    type: "best-practice-card",
    name: "Contracts at Boundaries, Not Everywhere",
    pitch: "Contract the boundaries that carry money and obligation; skip the rest.",
    description:
      "The adoption practice card for data contracts: contract the boundaries where financial reconciliation, statutory reporting, or sensitive data crosses ownership lines first — bordereaux, TPA feeds, GL interfaces, source-to-product handoffs — and resist contracting every internal hop, which buries teams in ceremony and discredits the pattern. Includes the boundary-selection rubric and the sequencing that builds producer goodwill.",
    soWhat:
      "The contract program earns adoption by catching real failures at high-stakes boundaries — instead of dying under its own paperwork in month three.",
    audience: ["Data office leadership", "Data product teams"],
    capabilities: ["data_quality", "stewardship_ops"],
    bestPracticeKeys: ["data-contracts-at-boundaries", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      reinsurance: 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "financial-reconciliation": 2, "greenfield-platform": 1, "report-integrity": 1 },
    toolTags: ["ci-cd (Git-based pipeline, contract validation)"],
  },

  // ───────────────────────── VP-13 Insurance Data Product Blueprints ─────────────────────────
  {
    key: "policy-360-blueprint",
    packKey: "vp-13",
    type: "template",
    name: "Policy 360 Blueprint",
    pitch: "The governed policy master product: transactions, coverages, endorsements — one certified shape.",
    description:
      "A ready-to-adapt blueprint for a governed policy data product: the CDE set (policy identifiers, effective and expiration dates, transaction types and effective dates, coverage limits and deductibles, class and line codes), source contracts against policy administration feeds, quality gates on transaction-sequence integrity and premium tie-out, the sensitivity map for policyholder attributes, and the certification path to marketplace listing.",
    soWhat:
      "Every downstream product — claims, finance, actuarial, distribution — inherits one certified policy spine instead of rebuilding policy logic five different ways.",
    audience: ["Data product teams", "Data stewards", "Analytics leads"],
    capabilities: ["catalog_metadata", "data_quality", "semantic_layer"],
    dataDomains: ["policy", "coverage", "premium", "product"],
    bestPracticeKeys: ["certified-data-products", "cde-anchored-quality", "pattern-reuse-economics"],
    kpiKeys: ["policies-in-force", "written-premium", "retention-ratio"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 3, "life-annuities": 2, "specialty-es": 2 },
    scenarioAffinity: { "greenfield-platform": 2, "report-integrity": 2, "claims-analytics": 1 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "warehouse (Snowflake, Databricks)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },
  {
    key: "claims-360-blueprint",
    packKey: "vp-13",
    type: "template",
    name: "Claims 360 Blueprint",
    pitch: "FNOL to subrogation in one governed product, with the sensitivity map claims data demands.",
    description:
      "A blueprint for a governed claims data product spanning the full lifecycle — FNOL, investigation, reserving, payments, litigation, subrogation, salvage, recovery — with the CDE set (loss and report dates, reserve amounts by type, payment and recovery amounts, cause-of-loss and catastrophe codes, claim status), lifecycle date-sequence quality gates, and the sensitivity map claims uniquely requires: medical content, litigation and SIU flags, claimant financial data.",
    soWhat:
      "Claims analytics, actuarial triangles, and fraud models draw from one governed source with sensitivity handled at the product level — instead of each team re-extracting and re-exposing claim files.",
    audience: ["Claims analytics teams", "Actuarial analysts", "Data product teams", "SIU"],
    capabilities: ["catalog_metadata", "data_quality", "classification"],
    dataDomains: ["claim", "reserve", "party"],
    bestPracticeKeys: ["certified-data-products", "cde-anchored-quality", "classify-once-propagate-everywhere"],
    obligationKeys: ["schedule-p", "hipaa-phi", "glba-nppi"],
    kpiKeys: ["claims-frequency", "claims-severity", "loss-development-factor", "lae-ratio"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 3, "specialty-es": 2, "health-benefits": 1 },
    scenarioAffinity: { "claims-analytics": 3, "actuarial-readiness": 2, "sensitive-data-unlock": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "warehouse (Snowflake, Databricks)",
      "classification (BigID, platform-native)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },
  {
    key: "producer-360-blueprint",
    packKey: "vp-13",
    type: "template",
    name: "Producer 360 Blueprint",
    pitch: "Agency hierarchies, licensing, and commissions in one governed distribution product.",
    description:
      "A blueprint for a governed producer and distribution data product: agency and producer hierarchies with effective-dated relationships, licensing and appointment records (state DOI-regulated, and sensitive), commission structures and production credit, and book-of-business rollups. Quality gates cover hierarchy integrity, license-status currency, and commission tie-out to the GL — the checks that keep producer compensation out of dispute.",
    soWhat:
      "Distribution leadership sees production and compensation on numbers producers themselves accept, and appointment compliance stops depending on a spreadsheet someone maintains.",
    audience: ["Distribution analytics teams", "Producer compensation teams", "Data stewards"],
    capabilities: ["catalog_metadata", "data_quality"],
    dataDomains: ["producer-distribution", "party", "premium", "financials-gl"],
    bestPracticeKeys: ["certified-data-products", "party-resolution-first", "cde-anchored-quality"],
    obligationKeys: ["state-doi-market-conduct"],
    kpiKeys: ["commission-accuracy", "quote-to-bind", "written-premium"],
    sectorAffinity: { "pc-personal": 2, "pc-commercial": 2, "brokerage-mga": 3, "life-annuities": 2 },
    scenarioAffinity: { "operational-finops": 2, "report-integrity": 2, "financial-reconciliation": 1 },
    effortSavedStewardWeeks: 2.5,
    toolTags: [
      "warehouse (Snowflake, Databricks)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },
  {
    key: "party-360-blueprint",
    packKey: "vp-13",
    type: "template",
    name: "Party 360 Blueprint",
    pitch: "One resolved party across policy, claims, and billing — with roles, not duplicates.",
    description:
      "A blueprint for a governed party data product: resolved party identities across policy, claims, and billing systems with explicit role modeling (a person can be insured on one policy, claimant on another, and producer on a third), household and commercial hierarchy structures, and survivorship rules for the golden record. Built to consume the party resolution pack's match rules and to feed every 360 view, fraud signal, and DSAR response.",
    soWhat:
      "'How many customers do we have' gets one answer, cross-sell and fraud analytics see the whole relationship, and privacy requests find every record the first time.",
    audience: ["Data product teams", "MDM teams", "Fraud analytics", "Privacy partners"],
    capabilities: ["catalog_metadata", "data_quality", "classification"],
    dataDomains: ["party", "policy", "claim", "billing"],
    bestPracticeKeys: ["party-resolution-first", "certified-data-products", "duplicate-views-retired"],
    obligationKeys: ["state-privacy-laws", "ofac-sanctions"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "claims-analytics": 2, "ma-integration": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "mdm (Informatica MDM, platform-native entity resolution)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "finance-data-product-blueprint",
    packKey: "vp-13",
    type: "template",
    name: "Finance Data Product Blueprint",
    pitch: "Premium, loss, and expense reconciled to the GL — close-calendar aware by design.",
    description:
      "A blueprint for the governed finance data product: premium, loss, and expense flows reconciled to the general ledger with explicit tie-point CDEs, statutory-versus-GAAP basis handling, multi-source lineage across policy, claims, billing, and investment feeds, and controls scheduled against the close calendar so breaches surface before the close consumes the number, not after.",
    soWhat:
      "Closes get faster and quieter: reconciliations that were manual become executing controls, and audit questions get answered from the catalog and lineage rather than from spreadsheet archaeology.",
    audience: ["Finance data leads", "Controllers", "Internal audit liaisons", "Data product teams"],
    capabilities: ["data_quality", "lineage", "semantic_layer"],
    dataDomains: ["financials-gl", "premium", "claim", "reserve", "billing"],
    bestPracticeKeys: ["close-calendar-aware-controls", "regulator-explainable-lineage", "cde-anchored-quality"],
    obligationKeys: ["sox-icfr", "statutory-annual-statement", "naic-model-audit-rule"],
    kpiKeys: ["close-cycle-time", "expense-ratio", "combined-ratio"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 3,
      reinsurance: 1,
    },
    scenarioAffinity: { "financial-reconciliation": 3, "regulatory-reporting": 2, "report-integrity": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "warehouse (Snowflake, Databricks)",
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "bi (Power BI, Tableau)",
    ],
  },

  // ───────────────────────── VP-14 AI Governance & Model Risk Pack ─────────────────────────
  {
    key: "ai-model-inventory-template",
    packKey: "vp-14",
    type: "template",
    name: "AI & Model Inventory Template",
    pitch: "Every model and AI use case, with its data dependencies and risk tier, in one register.",
    description:
      "An inventory template for models and AI use cases — pricing and rating models, claims triage and severity models, fraud scores, underwriting assistants, marketing propensity models — capturing owner, purpose, risk tier, the data products and CDEs each depends on, and the governance evidence attached. Built to answer the questions AI bulletins and exam letters now ask: what AI do you run, on what data, governed how.",
    soWhat:
      "When the regulator's AI questionnaire arrives, the answer is a register export with evidence links — not a three-month discovery scramble across business lines.",
    audience: ["Model risk teams", "Actuarial leadership", "Compliance partners", "Data office leadership"],
    capabilities: ["catalog_metadata", "stewardship_ops"],
    dataDomains: ["policy", "claim", "party", "premium"],
    bestPracticeKeys: ["obligation-traceability", "govern-at-inception"],
    obligationKeys: ["naic-ai-model-bulletin", "eu-ai-act", "asop-56"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "ai-ml-readiness": 3, "regulatory-reporting": 2 },
    effortSavedStewardWeeks: 1.5,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "spreadsheet-model (Excel, Google Sheets)",
    ],
  },
  {
    key: "model-data-governance-standard",
    packKey: "vp-14",
    type: "guideline-standard",
    name: "Model Data Governance Standard",
    pitch: "Training data held to the same bar as reporting data: lineage, quality, documented judgment.",
    description:
      "A standard for the data side of model risk: training and scoring datasets registered with lineage to source, quality expectations on model-critical elements, classification review for protected and proxy attributes before features ship, and documentation of data judgments to actuarial-standard expectations — the reliance and limitation disclosures ASOP-grade work requires. Applies equally to vendor models, where the data questions are hardest to answer.",
    soWhat:
      "Model risk committees stop approving models whose data pedigree nobody can state — and adverse-action and bias questions get answered from documented lineage, not reconstruction.",
    audience: ["Model risk teams", "Data scientists", "Actuarial analysts", "Compliance partners"],
    capabilities: ["lineage", "data_quality", "classification"],
    dataDomains: ["policy", "claim", "party"],
    bestPracticeKeys: ["regulator-explainable-lineage", "obligation-traceability", "cde-anchored-quality"],
    obligationKeys: ["naic-ai-model-bulletin", "asop-56", "eu-ai-act", "asop-23"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "ai-ml-readiness": 3, "actuarial-readiness": 2, "regulatory-reporting": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "model-data-lineage-method",
    packKey: "vp-14",
    type: "playbook-method",
    name: "Feature-to-Source Lineage Method",
    pitch: "Trace any model feature back to its sources — for explainability that survives an exam.",
    description:
      "A method for establishing and maintaining lineage from model features back through feature engineering, training datasets, and source systems — including the transformation documentation for engineered features and the snapshot discipline that lets a historical scoring decision be reconstructed. Prioritized by model risk tier: rating and adverse-action-adjacent models first.",
    soWhat:
      "'Why did the model score this risk that way' becomes answerable at the data layer — the half of explainability most model-risk programs skip until an examiner asks.",
    audience: ["Data scientists", "Model risk teams", "Lineage engineers"],
    capabilities: ["lineage"],
    dataDomains: ["policy", "claim", "party", "exposure"],
    bestPracticeKeys: ["regulator-explainable-lineage", "lineage-effort-triage"],
    obligationKeys: ["naic-ai-model-bulletin", "eu-ai-act"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 2, "life-annuities": 2, "health-benefits": 1 },
    scenarioAffinity: { "ai-ml-readiness": 3, "actuarial-readiness": 1, "claims-analytics": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "ai-use-case-risk-triage",
    packKey: "vp-14",
    type: "toolkit",
    name: "AI Use-Case Risk Triage Kit",
    pitch: "Tier AI use cases at intake, before they ship — underwriting scrutiny for underwriting-grade stakes.",
    description:
      "An intake and triage kit for proposed AI use cases: a risk-tiering rubric weighing decision impact (rating, claims outcomes, marketing), data sensitivity, autonomy level, and regulatory exposure; tier-calibrated governance requirements from lightweight registration to full model-risk review; and the intake form that routes each use case accordingly. Calibrated so low-stakes uses move fast — the credibility condition for high-stakes uses accepting scrutiny.",
    soWhat:
      "AI adoption accelerates and stays defensible at once: the marketing chatbot ships in days, the claims-severity model gets the review its consequences demand, and nobody routes around governance.",
    audience: ["Data office leadership", "Model risk teams", "Innovation teams"],
    capabilities: ["stewardship_ops", "classification"],
    bestPracticeKeys: ["govern-at-inception", "obligation-traceability", "lineage-effort-triage"],
    obligationKeys: ["naic-ai-model-bulletin", "eu-ai-act"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 3, "sensitive-data-unlock": 1 },
    toolTags: ["workflow (intake form, ITSM integration)", "spreadsheet-model (Excel, Google Sheets)"],
  },

  // ───────────────────────── VP-15 Privacy, Consent & DSAR Pack ─────────────────────────
  {
    key: "privacy-obligation-matrix",
    packKey: "vp-15",
    type: "template",
    name: "Privacy Obligation Matrix",
    pitch: "GLBA, state privacy laws, and health-data duties mapped onto insurance data domains.",
    description:
      "A matrix template mapping privacy obligations — GLBA NPPI duties, state consumer privacy statutes with their insurance carve-outs and exceptions, health-data handling duties — onto insurance data domains and processing purposes. For each intersection: the handling duty, the classification labels that trigger it, retention and deletion expectations, and where statutory retention overrides deletion rights (claims files being the classic case).",
    soWhat:
      "Privacy counsel and data teams work from one shared map — and the recurring argument about whether a state privacy law even applies to a given dataset gets settled once, in writing.",
    audience: ["Privacy partners", "Compliance partners", "Data stewards"],
    capabilities: ["classification", "access_policy"],
    dataDomains: ["party", "claim", "policy", "employee-hr"],
    bestPracticeKeys: ["obligation-traceability", "purpose-based-access"],
    obligationKeys: ["glba-nppi", "state-privacy-laws", "hipaa-phi"],
    sectorAffinity: {
      "pc-personal": 3,
      "life-annuities": 2,
      "health-benefits": 3,
      "pc-commercial": 1,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "regulatory-reporting": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["spreadsheet-model (Excel, Google Sheets)", "classification (BigID, platform-native)"],
  },
  {
    key: "consent-purpose-data-model",
    packKey: "vp-15",
    type: "semantic-pack",
    name: "Consent & Purpose Data Model",
    pitch: "Consent, purpose, and restriction as governed data — not checkbox exhaust.",
    description:
      "A semantic model and attribute set for consent and processing purpose in insurance: consent type and scope, capture channel and timestamp, purpose taxonomy (underwriting, claims handling, marketing, analytics, compliance reporting), opt-out and restriction flags, and their propagation into purpose-based access policies. Models the insurance reality that much processing rests on contract necessity and legal obligation rather than consent — so the flags say what actually authorizes each use.",
    soWhat:
      "Marketing suppression, analytics eligibility, and access decisions all read from the same governed flags — instead of each system keeping its own version of what the customer agreed to.",
    audience: ["Privacy partners", "Marketing data teams", "Data stewards"],
    capabilities: ["semantic_layer", "classification", "access_policy"],
    dataDomains: ["party", "reference-regulatory"],
    bestPracticeKeys: ["purpose-based-access", "classify-once-propagate-everywhere"],
    obligationKeys: ["state-privacy-laws", "glba-nppi"],
    sectorAffinity: { "pc-personal": 3, "life-annuities": 2, "health-benefits": 2, "brokerage-mga": 1 },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 1.5,
    platformAffinity: { immuta: 3, "idmc-cdgc": 1 },
    platformVariants: [
      {
        platformKey: "immuta",
        note: "The purpose taxonomy loads directly as Immuta purpose definitions, so a 'claims handling' versus 'analytics' access decision reads the same governed attribute the semantic model defines.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Consent and purpose attributes register as CDEs in CDGC with their own quality dimensions (capture-channel completeness, timestamp validity), so consent data is governed to the same bar as any other critical element.",
      },
    ],
    toolTags: [
      "policy-enforcement (Immuta, platform-native RBAC)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },
  {
    key: "dsar-fulfillment-playbook",
    packKey: "vp-15",
    type: "playbook-method",
    name: "DSAR Fulfillment Playbook",
    pitch: "Find every record about an individual in days — using the catalog and party resolution, not tribal memory.",
    description:
      "A method for fulfilling data subject access and deletion requests in an insurer: resolve the requester through party resolution (they may be an insured, a claimant, and a beneficiary under different spellings), locate their data via classification labels and catalog coverage rather than system-by-system interviews, apply the deletion-versus-statutory-retention decision tree (open claims, litigation holds, statutory record retention), and assemble the response with an evidence trail.",
    soWhat:
      "DSAR cost per request drops and deadlines stop being missed — and the response is defensibly complete because it came from the catalog and the resolved party graph, not from whoever remembered which systems to check.",
    audience: ["Privacy operations", "Data stewards", "Legal partners"],
    capabilities: ["classification", "stewardship_ops", "catalog_metadata"],
    dataDomains: ["party", "claim", "policy", "billing"],
    bestPracticeKeys: ["party-resolution-first", "classify-once-propagate-everywhere", "obligation-traceability"],
    obligationKeys: ["state-privacy-laws", "glba-nppi"],
    sectorAffinity: { "pc-personal": 3, "life-annuities": 2, "health-benefits": 2, "pc-commercial": 1 },
    scenarioAffinity: { "sensitive-data-unlock": 3, "operational-finops": 1 },
    toolTags: [
      "classification (BigID, platform-native)",
      "mdm (Informatica MDM, platform-native entity resolution)",
      "workflow (privacy request tracking)",
    ],
  },
  {
    key: "purpose-based-access-standard",
    packKey: "vp-15",
    type: "guideline-standard",
    name: "Purpose-Based Access Standard",
    pitch: "Access by role and purpose, enforced as policy — per-view provisioning retired.",
    description:
      "The standard for purpose-based access control: access purposes modeled explicitly (compensation analytics versus workforce planning versus compliance reporting see different slices of the same dataset), row- and column-level policies derived from classification labels plus purpose, an exception path with expiry, and the decision log that lets any access grant be replayed for audit. The replacement for per-view provisioning and the hand-copied extract culture it breeds.",
    soWhat:
      "Sensitive analytics move from request-queue to governed self-service — access decisions become fast, consistent, and explainable to a privacy office in the same breath.",
    audience: ["Security engineers", "Privacy partners", "Analytics leads"],
    capabilities: ["access_policy", "classification"],
    dataDomains: ["employee-hr", "party", "claim"],
    bestPracticeKeys: ["purpose-based-access", "duplicate-views-retired"],
    obligationKeys: ["glba-nppi", "state-privacy-laws"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      investments: 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 1 },
    toolTags: [
      "policy-enforcement (Immuta, platform-native RBAC)",
      "warehouse (Snowflake, Databricks)",
    ],
    platformAffinity: { immuta: 3, snowflake: 2, databricks: 2 },
    platformVariants: [
      {
        platformKey: "immuta",
        note: "Purpose-based access is Immuta's signature capability here — purposes are authored once as attribute-and-purpose rules and enforced dynamically across every connected warehouse, without a duplicated masked view per consumer.",
      },
      {
        platformKey: "snowflake",
        note: "Without a dedicated access-policy platform, purpose-based logic compiles to conditional masking-policy DDL keyed off a session context variable carrying the declared purpose.",
      },
      {
        platformKey: "databricks",
        note: "Enforced through Unity Catalog row filters and column masks parameterized by a purpose attribute passed at query time, evaluated at the same layer that runs the compute.",
      },
    ],
  },

  // ───────────────────────── VP-16 Party & Master Data Resolution Pack ─────────────────────────
  {
    key: "party-resolution-playbook",
    packKey: "vp-16",
    type: "playbook-method",
    name: "Party Resolution Playbook",
    pitch: "Match, merge, and survivorship tuned for insurance party data — where SSNs are scarce and roles multiply.",
    description:
      "The end-to-end method for resolving party identities in an insurer: candidate generation and match scoring where reliable national identifiers are scarce, role-aware modeling (insured, claimant, beneficiary, provider, producer — often the same person), survivorship rules for the golden record, steward review queues for borderline matches, and the false-merge remediation path, because in claims data a wrong merge is worse than a missed one.",
    soWhat:
      "Every downstream ambition — 360 views, fraud networks, DSAR completeness, sanctions screening — stops being blocked by the same unresolved-party problem, solved once instead of per project.",
    audience: ["MDM teams", "Data stewards", "Fraud analytics", "Data product teams"],
    capabilities: ["data_quality", "catalog_metadata", "stewardship_ops"],
    dataDomains: ["party", "policy", "claim", "billing"],
    bestPracticeKeys: ["party-resolution-first", "agents-draft-stewards-decide"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "claims-analytics": 2, "ma-integration": 2 },
    toolTags: [
      "mdm (Informatica MDM, platform-native entity resolution)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "party-match-rule-library",
    packKey: "vp-16",
    type: "dq-rule-library",
    name: "Party Match Rule Library",
    pitch: "Deterministic and probabilistic match rules that know insurance data's quirks.",
    description:
      "A library of match rules tuned for insurance party data: deterministic rules on the identifiers that exist (policy-claimant linkage, license numbers, tax IDs where held), probabilistic rules handling nicknames, marriage-driven name changes, address churn between policy terms, household disambiguation (father and son, same name, same address), and commercial-name resolution across DBAs, legal names, and subsidiaries. Each rule carries precision/recall guidance and a steward-review threshold.",
    soWhat:
      "Match engines start from insurance-proven rules instead of generic name-address logic — cutting both the duplicate-party count and the false merges that corrupt claims history.",
    audience: ["MDM teams", "DQ analysts", "Data stewards"],
    capabilities: ["data_quality"],
    dataDomains: ["party"],
    bestPracticeKeys: ["party-resolution-first", "cde-anchored-quality"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "ma-integration": 2, "claims-analytics": 2, "sensitive-data-unlock": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "mdm (Informatica MDM, platform-native entity resolution)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
    platformAffinity: { "idmc-cdgc": 3, ataccama: 2 },
    platformVariants: [
      {
        platformKey: "idmc-cdgc",
        note: "Authored as CDQ match-and-merge rules with configurable weight-based scoring, running against the same profiling engine that drives CDGC's classification suggestions.",
      },
      {
        platformKey: "ataccama",
        note: "Expressed as Ataccama ONE matching rules within its MDM module, where the low-code rule builder is tuned for exactly this deterministic-plus-probabilistic pattern.",
      },
    ],
  },
  {
    key: "party-hierarchy-template",
    packKey: "vp-16",
    type: "template",
    name: "Party Hierarchy & Household Template",
    pitch: "Households, commercial trees, and agency structures modeled once, effective-dated.",
    description:
      "Reference structures for the hierarchies insurance analytics keeps rebuilding: personal-lines households (with the splits and re-formations real life produces), commercial ownership trees for account-level underwriting and aggregation, and agency/producer organizational structures — all effective-dated, because hierarchy-as-of-date is what reconciliation and exposure aggregation actually require.",
    soWhat:
      "Account rollups, household retention views, and exposure aggregations agree with each other — because they read one governed hierarchy instead of five hand-built ones.",
    audience: ["MDM teams", "Underwriting analytics", "Data product teams"],
    capabilities: ["catalog_metadata", "semantic_layer"],
    dataDomains: ["party", "producer-distribution", "exposure"],
    bestPracticeKeys: ["party-resolution-first", "one-certified-definition-per-metric"],
    kpiKeys: ["retention-ratio"],
    sectorAffinity: { "pc-personal": 2, "pc-commercial": 3, "brokerage-mga": 2, "life-annuities": 1 },
    scenarioAffinity: { "claims-analytics": 1, "ma-integration": 2, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: [
      "mdm (Informatica MDM, platform-native entity resolution)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "sanctions-screening-data-readiness",
    packKey: "vp-16",
    type: "guideline-standard",
    name: "Sanctions Screening Data Readiness Standard",
    pitch: "OFAC screening is only as good as the party data underneath it.",
    description:
      "The party data-quality prerequisites for effective sanctions screening: name-field completeness and normalization, date-of-birth and address capture standards, screening coverage across all party roles (claim payees and beneficiaries are the classic gap — screening insureds while paying unscreened payees), and the resolution linkage that prevents one sanctioned identity slipping through as three unmatched records.",
    soWhat:
      "Compliance stops discovering screening gaps in a regulator's findings letter — the payee who never got screened, the alias that never matched — because the data prerequisites are stated, measured, and enforced.",
    audience: ["Compliance partners", "Claims operations", "MDM teams"],
    capabilities: ["data_quality", "classification"],
    dataDomains: ["party", "claim", "billing"],
    bestPracticeKeys: ["party-resolution-first", "obligation-traceability", "cde-anchored-quality"],
    obligationKeys: ["ofac-sanctions"],
    sectorAffinity: {
      "pc-commercial": 2,
      "specialty-es": 2,
      "life-annuities": 2,
      reinsurance: 1,
      "pc-personal": 1,
      surety: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "financial-reconciliation": 1, "ma-integration": 1 },
    toolTags: [
      "mdm (Informatica MDM, platform-native entity resolution)",
      "screening (sanctions list vendors, platform-native)",
    ],
  },

  // ───────────────────────── VP-17 Insurance Reference Data Pack ─────────────────────────
  {
    key: "iso-code-sets",
    packKey: "vp-17",
    type: "semantic-pack",
    name: "ISO Class & Line-of-Business Code Sets",
    pitch: "Versioned ISO class codes and LOB mappings — with statutory line crosswalks.",
    description:
      "Curated, versioned reference sets for ISO general liability and property class codes, line-of-business codes, and their crosswalks to statutory annual-statement lines — with effective-dating, deprecation handling, and validity rules ready to drop into DQ engines. The code tables every rating, reporting, and reserving pipeline silently depends on, maintained as governed data instead of per-system copies.",
    soWhat:
      "Class-code validity checks and statutory line mappings agree across systems — closing the silent-fork problem that shows up as unexplainable differences between internal and statutory views.",
    audience: ["Reference data stewards", "Underwriting operations", "Statutory reporting teams"],
    capabilities: ["catalog_metadata", "data_quality", "semantic_layer"],
    dataDomains: ["reference-regulatory", "coverage", "policy"],
    bestPracticeKeys: ["reference-data-stewarded", "cde-anchored-quality"],
    obligationKeys: ["statutory-annual-statement"],
    kpiKeys: ["stp-rate"],
    sectorAffinity: { "pc-commercial": 3, "pc-personal": 2, "specialty-es": 2, surety: 1 },
    scenarioAffinity: { "regulatory-reporting": 2, "report-integrity": 2, "greenfield-platform": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "dq-engine (Informatica CDQ, platform-native)",
    ],
  },
  {
    key: "cause-of-loss-codes",
    packKey: "vp-17",
    type: "semantic-pack",
    name: "Cause-of-Loss Code Taxonomy",
    pitch: "One peril taxonomy mapped across claim systems — so loss analysis stops arguing about wind versus water.",
    description:
      "A cause-of-loss and peril taxonomy with mappings across common claim-system code sets, catastrophe-event association rules, and the hierarchy analytics needs (peril family, peril, sub-cause). Includes the ambiguity guidance adjusters actually face — wind versus water in a hurricane claim, theft versus mysterious disappearance — because inconsistent coding at FNOL is where loss-trend analysis goes wrong.",
    soWhat:
      "Loss triangles, cat analytics, and reinsurance recoveries slice by one peril taxonomy — and cross-system loss studies stop spending their first month reconciling code sets.",
    audience: ["Claims analytics teams", "Actuarial analysts", "Cat modeling teams", "Reference data stewards"],
    capabilities: ["semantic_layer", "catalog_metadata", "data_quality"],
    dataDomains: ["claim", "reference-regulatory"],
    bestPracticeKeys: ["reference-data-stewarded", "one-certified-definition-per-metric"],
    kpiKeys: ["claims-frequency", "claims-severity"],
    sectorAffinity: { "pc-personal": 3, "pc-commercial": 3, "specialty-es": 2, reinsurance: 2 },
    scenarioAffinity: { "claims-analytics": 3, "actuarial-readiness": 2, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "warehouse (Snowflake, Databricks)"],
  },
  {
    key: "jurisdiction-codes",
    packKey: "vp-17",
    type: "semantic-pack",
    name: "Jurisdiction & Regulatory Code Sets",
    pitch: "State, country, and regulatory jurisdiction codes with DOI reporting mappings.",
    description:
      "Versioned jurisdiction reference data: state and country codes, regulatory jurisdiction assignment rules (risk location versus policy issuance versus claim venue — which differ, and matter), DOI reporting mappings, and premium tax jurisdiction handling for multi-state risks. Includes validity rules for jurisdiction-dependent fields and the edge cases that break filings: territories, surplus-lines home-state rules, cross-border programs.",
    soWhat:
      "State-page reporting, premium tax, and market-conduct extracts stop failing on jurisdiction mismatches — the small code table behind a disproportionate share of filing rework.",
    audience: ["Statutory reporting teams", "Reference data stewards", "Compliance partners"],
    capabilities: ["catalog_metadata", "data_quality"],
    dataDomains: ["reference-regulatory", "policy", "premium"],
    bestPracticeKeys: ["reference-data-stewarded", "obligation-traceability"],
    obligationKeys: ["statutory-annual-statement", "state-doi-market-conduct"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "specialty-es": 2,
      "life-annuities": 2,
      surety: 1,
    },
    scenarioAffinity: { "regulatory-reporting": 3, "financial-reconciliation": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "dq-engine (Informatica CDQ, platform-native)"],
  },
  {
    key: "lloyds-risk-codes",
    packKey: "vp-17",
    type: "semantic-pack",
    name: "Lloyd's Risk Code & Class Sets",
    pitch: "Lloyd's risk codes and class-of-business mappings for syndicate and delegated reporting.",
    description:
      "Curated Lloyd's risk codes and class-of-business reference sets with mappings to internal line structures, validity rules for delegated-authority bordereaux coding, and the year-of-account dimension London-market reporting requires. Built for the carriers, syndicates, and coverholders whose regulatory and bordereaux reporting lives or dies on correct risk-code assignment.",
    soWhat:
      "Syndicate returns and coverholder bordereaux stop bouncing on risk-code errors — and London-market business reconciles to internal views without a quarterly mapping scramble.",
    audience: ["London market operations", "Delegated authority teams", "Reference data stewards"],
    capabilities: ["catalog_metadata", "data_quality"],
    dataDomains: ["reference-regulatory", "reinsurance-cession", "premium"],
    bestPracticeKeys: ["reference-data-stewarded", "obligation-traceability"],
    obligationKeys: ["lloyds-minimum-standards"],
    sectorAffinity: { "specialty-es": 3, reinsurance: 2, "brokerage-mga": 2 },
    scenarioAffinity: { "regulatory-reporting": 3, "financial-reconciliation": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "dq-engine (IceDQ, platform-native)"],
  },
  {
    key: "reference-data-stewardship-workflow",
    packKey: "vp-17",
    type: "playbook-method",
    name: "Reference Data Stewardship Workflow",
    pitch: "Owned, change-controlled, version-propagated — reference data governed like the dependency it is.",
    description:
      "The operating workflow that keeps reference code sets trustworthy: named ownership per code set, a change-request and approval path with impact analysis (which pipelines, rules, and reports consume this set), version propagation through the governance-as-code pipeline instead of emailed spreadsheets, and consumption telemetry that reveals which systems are still reading a deprecated version.",
    soWhat:
      "Code-set changes stop breaking downstream reporting by surprise — every change is impact-assessed, versioned, and propagated, and the deprecated-copy problem becomes visible instead of latent.",
    audience: ["Reference data stewards", "Governance platform team", "Data engineers"],
    capabilities: ["stewardship_ops", "catalog_metadata"],
    dataDomains: ["reference-regulatory"],
    bestPracticeKeys: ["reference-data-stewarded", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "regulatory-reporting": 2, "report-integrity": 2, "operational-finops": 1 },
    toolTags: [
      "ci-cd (Git-based pipeline, reference data versioning)",
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
    ],
  },

  // ───────────────────────── VP-18 Data Marketplace & Certification Pack ─────────────────────────
  {
    key: "certification-tier-standard",
    packKey: "vp-18",
    type: "guideline-standard",
    name: "Data Product Certification Tier Standard",
    pitch: "Bronze, silver, gold — certification tiers tied to governance evidence, not self-declaration.",
    description:
      "A tiered certification standard for marketplace listings: each tier defined by machine-verifiable evidence — maturity index threshold, CDE control coverage, lineage explainability, semantic certification, stewardship SLA — with tier badges surfaced wherever the product is consumed. Certification expires without re-evidence, because a certified product that quietly degraded is worse than an uncertified one.",
    soWhat:
      "Consumers can trust a badge instead of interviewing a producer — and 'certified' means something an auditor can verify, which is what makes the marketplace more than a catalog with marketing.",
    audience: ["Data office leadership", "Data product owners", "Data consumers"],
    capabilities: ["catalog_metadata", "stewardship_ops", "data_quality"],
    bestPracticeKeys: ["certified-data-products", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "greenfield-platform": 2, "ai-ml-readiness": 1 },
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "bi (Power BI, Tableau)"],
    platformAffinity: { "power-bi": 3, "idmc-cdgc": 2, snowflake: 1 },
    platformVariants: [
      {
        platformKey: "power-bi",
        note: "The tier badge surfaces as a Power BI certification/promotion label on the dataset, so 'is this number trustworthy' is answered at the point of consumption instead of requiring a trip back to the catalog.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Tier evidence — CDE control coverage, lineage explainability — is pulled from CDGC's own telemetry APIs rather than re-collected, so certification stays current without a manual audit pass.",
      },
      {
        platformKey: "snowflake",
        note: "For products consumed straight from the warehouse, the tier badge is expressed as an object tag surfaced through a metadata query any BI tool can read, not only Power BI.",
      },
    ],
  },
  {
    key: "certification-checklist-template",
    packKey: "vp-18",
    type: "template",
    name: "Certification Evidence Pack Template",
    pitch: "The evidence pack a product assembles once and keeps current — listing-ready.",
    description:
      "The template for a product's certification evidence pack: current maturity score with telemetry links, CDE register with executing controls, lineage coverage statement including documented manual segments, semantic bindings to certified definitions, access and sensitivity posture, steward contacts and SLA, and known limitations stated plainly. Most fields populate from telemetry; stewards write only the judgment sections.",
    soWhat:
      "Certification reviews take an afternoon instead of a quarter — and consumers reading a listing see honest limitations alongside the badge, which is what keeps trust after the first incident.",
    audience: ["Data product owners", "Data stewards"],
    capabilities: ["catalog_metadata", "stewardship_ops"],
    bestPracticeKeys: ["certified-data-products", "value-moments-visibility"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
    },
    scenarioAffinity: { "report-integrity": 2, "greenfield-platform": 1, "regulatory-reporting": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "workflow (evidence pack assembly)"],
    platformAffinity: { "power-bi": 2, "idmc-cdgc": 2 },
    platformVariants: [
      {
        platformKey: "power-bi",
        note: "The evidence pack's semantic-bindings section checks that every certified Power BI measure resolves to the certified glossary term, not a locally redefined one — the classic drift point between catalog and BI model.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Most fields — maturity score, CDE register, lineage coverage — populate directly from CDGC APIs; stewards write only the judgment sections, such as known limitations and steward contact.",
      },
    ],
  },
  {
    key: "duplicate-view-retirement-playbook",
    packKey: "vp-18",
    type: "playbook-method",
    name: "Duplicate View Retirement Playbook",
    pitch: "Inventory the shadow copies, migrate the consumers, retire the views — with proof.",
    description:
      "The method for retiring duplicate and shadow data views once a governed product exists: inventory duplicates via catalog scans and query-log analysis, rank by risk (sensitive-data copies first), migrate consumers with side-by-side reconciliation, then retire with access removal and an audit record. Includes the consumer-negotiation guidance, because every duplicate view has an owner who built it for a reason the governed product must now serve.",
    soWhat:
      "Each retired view is a privacy exposure and audit finding that never happens — and the governed product's consumption numbers become the visible proof the marketplace is working.",
    audience: ["Data stewards", "Security engineers", "Data product owners"],
    capabilities: ["stewardship_ops", "access_policy", "catalog_metadata"],
    dataDomains: ["employee-hr", "party", "claim"],
    bestPracticeKeys: ["duplicate-views-retired", "certified-data-products", "purpose-based-access"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "operational-finops": 1, "report-integrity": 1 },
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "warehouse (Snowflake, Databricks)",
    ],
  },
  {
    key: "marketplace-adoption-metrics",
    packKey: "vp-18",
    type: "metric-kpi",
    name: "Marketplace Adoption Metrics",
    pitch: "Is consumption actually shifting to certified products? Measured, not assumed.",
    description:
      "The adoption metric set for a data marketplace: certified product count by tier, share of analytical consumption flowing through certified products (from query and BI telemetry), duplicate views retired versus discovered, and time-from-listing-to-first-consumer. The consumption-share metric is the honest one — a marketplace full of certified products nobody queries is shelfware with badges.",
    soWhat:
      "Data office leadership sees whether the marketplace is changing behavior or just cataloging it — and can steer investment toward the products consumers actually pull.",
    audience: ["Data office leadership", "Data product owners"],
    capabilities: ["stewardship_ops", "catalog_metadata"],
    bestPracticeKeys: ["certified-data-products", "measured-leverage", "duplicate-views-retired"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "report-integrity": 1, "greenfield-platform": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)", "bi (Power BI, Tableau)"],
  },

  // ───────────────────────── VP-19 M&A / Book-Transfer Due Diligence Pack ─────────────────────────
  {
    key: "ma-data-due-diligence-toolkit",
    packKey: "vp-19",
    type: "toolkit",
    name: "M&A Data Due Diligence Toolkit",
    pitch: "Probe the target's data estate before the price is set, not after the close.",
    description:
      "Structured due-diligence probes for acquiring a book or company: data landscape and system inventory, reserve and loss-history data integrity sampling, policy and claims record completeness, reference-code divergence assessment, sensitive-data and privacy posture, and data-debt estimation expressed in remediation effort. Findings feed the deal model — data debt is a price and timeline factor, not a post-close surprise.",
    soWhat:
      "The integration team inherits a mapped estate with priced data debt — and deal leadership learns before signing whether the target's loss history can actually support the reserving story.",
    audience: ["Corporate development teams", "Integration leads", "Actuarial due diligence", "Data office leadership"],
    capabilities: ["catalog_metadata", "data_quality", "classification"],
    dataDomains: ["policy", "claim", "reserve", "party", "financials-gl"],
    bestPracticeKeys: ["obligation-traceability", "cde-anchored-quality", "govern-at-inception"],
    sectorAffinity: {
      "pc-commercial": 2,
      "pc-personal": 2,
      "specialty-es": 2,
      "life-annuities": 2,
      reinsurance: 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "ma-integration": 3, "actuarial-readiness": 1 },
    toolTags: [
      "classification (BigID, platform-native)",
      "spreadsheet-model (Excel, Google Sheets)",
    ],
  },
  {
    key: "book-transfer-mapping-playbook",
    packKey: "vp-19",
    type: "playbook-method",
    name: "Book Transfer Mapping Playbook",
    pitch: "Policy and claims conversion with semantic reconciliation — not just field mapping.",
    description:
      "The conversion method for transferring a book of business: semantic reconciliation before field mapping (the target's 'earned premium' and coverage structures may not mean yours), transaction-history conversion rules that preserve development history, code-set crosswalks through the reference data pack, in-flight claim handling, and the parallel-run reconciliation design that proves the converted book ties out before cutover.",
    soWhat:
      "The converted book reconciles at cutover and its history still supports actuarial development analysis — instead of becoming the 'pre-conversion data' asterisk that haunts reserve reviews for a decade.",
    audience: ["Integration leads", "Conversion teams", "Actuarial analysts", "Data stewards"],
    capabilities: ["semantic_layer", "data_quality", "lineage"],
    dataDomains: ["policy", "claim", "premium", "reserve"],
    bestPracticeKeys: ["one-certified-definition-per-metric", "cde-anchored-quality", "regulator-explainable-lineage"],
    obligationKeys: ["schedule-p", "statutory-annual-statement"],
    sectorAffinity: {
      "pc-commercial": 2,
      "pc-personal": 2,
      "life-annuities": 2,
      "specialty-es": 2,
      reinsurance: 1,
    },
    scenarioAffinity: { "ma-integration": 3, "financial-reconciliation": 2, "actuarial-readiness": 1 },
    toolTags: [
      "warehouse (Snowflake, Databricks)",
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
    ],
  },
  {
    key: "conversion-dq-rule-library",
    packKey: "vp-19",
    type: "dq-rule-library",
    name: "Conversion DQ Rule Library",
    pitch: "The reconciliation and integrity rules that prove a migration, ready to run.",
    description:
      "Pre-built quality rules for conversion and migration events: record-count and financial-balance reconciliation by cohort (premium, paid loss, case reserves tie out source-to-target), orphan detection (claims without policies, transactions without parents), coverage and code mapping validity against the crosswalks, date-integrity preservation, and duplicate-party detection across the merged estate. Runs during parallel-run and again post-cutover as regression evidence.",
    soWhat:
      "Cutover sign-off rests on executed rule evidence rather than sampled spot checks — and the finance restatement risk that follows sloppy conversions gets caught while the source system still exists.",
    audience: ["Conversion teams", "DQ analysts", "Finance data leads"],
    capabilities: ["data_quality"],
    dataDomains: ["policy", "claim", "premium", "reserve", "party"],
    bestPracticeKeys: ["cde-anchored-quality", "remediation-loop-not-dashboard"],
    obligationKeys: ["schedule-p", "sox-icfr"],
    sectorAffinity: {
      "pc-commercial": 2,
      "pc-personal": 2,
      "life-annuities": 2,
      "specialty-es": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "ma-integration": 3, "financial-reconciliation": 2 },
    effortSavedStewardWeeks: 3,
    toolTags: [
      "dq-engine (Informatica CDQ, IceDQ, platform-native)",
      "warehouse (Snowflake, Databricks)",
    ],
    platformAffinity: { "idmc-cdgc": 2, icedq: 3, snowflake: 1 },
    platformVariants: [
      {
        platformKey: "icedq",
        note: "Run as iceDQ source-to-target reconciliation test suites — count and balance comparisons by cohort — the exact ETL-testing pattern iceDQ was built for, executed on a schedule through cutover.",
      },
      {
        platformKey: "idmc-cdgc",
        note: "Authored as CDQ rules bound to the converted CDE set, so post-cutover regression runs land in the same rule inventory and breach queue as steady-state production quality checks.",
      },
    ],
  },
  {
    key: "book-transfer-cde-set",
    packKey: "vp-19",
    type: "cde-library",
    name: "Book Transfer Survival CDE Set",
    pitch: "The elements that must survive any migration intact — named before mapping starts.",
    description:
      "The CDE set that defines conversion success: in-force premium and policy counts by line and jurisdiction, open claim inventories with case reserves, paid and incurred loss history at the granularity reserving requires, accident-year and report-year assignments that keep Schedule P continuity, reinsurance attachment data, and the party identifiers that keep claim histories connected to the right insureds. Each element carries its target-state quality expectation and reconciliation tie-point.",
    soWhat:
      "Conversion scope negotiations start from a named list of what cannot be lossy — protecting the reserving, statutory, and reinsurance continuity that determines whether the acquisition's numbers hold up.",
    audience: ["Conversion teams", "Actuarial analysts", "Integration leads"],
    capabilities: ["catalog_metadata", "data_quality"],
    dataDomains: ["policy", "claim", "reserve", "premium", "reinsurance-cession", "party"],
    bestPracticeKeys: ["cde-anchored-quality", "obligation-traceability"],
    obligationKeys: ["schedule-p", "statutory-annual-statement", "asop-23"],
    kpiKeys: ["ibnr-adequacy", "loss-development-factor"],
    sectorAffinity: {
      "pc-commercial": 2,
      "pc-personal": 2,
      "life-annuities": 2,
      reinsurance: 2,
      "specialty-es": 1,
    },
    scenarioAffinity: { "ma-integration": 3, "actuarial-readiness": 2, "regulatory-reporting": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: [
      "catalog-suite (Informatica CDGC, Collibra, Atlan)",
      "spreadsheet-model (Excel, Google Sheets)",
    ],
    platformAffinity: { "idmc-cdgc": 3, bigid: 1, snowflake: 1 },
  },

  // ───────────────────────── VP-20 Operating Model & RACI Pack ─────────────────────────
  {
    key: "operating-model-blueprint",
    packKey: "vp-20",
    type: "template",
    name: "Hub-and-Spoke Operating Model Blueprint",
    pitch: "Centralize the machinery, federate the judgment — the model that scales without headcount scaling with it.",
    description:
      "A target operating model blueprint: a small, engineering-shaped central platform team owning the code substrate, agent workforce, standards, and maturity index; domain stewards federated in the business lines keeping approval, curation, and business meaning; connected through the steward-as-supervisor role. Includes the RACI across the governance lifecycle and the sequencing guidance: stand the model up product by product through live delivery, not by announcement.",
    soWhat:
      "Business lines keep control of what their metrics mean while paying for expensive machinery once — the structural answer to both the central-bottleneck failure and the every-line-rebuilds-governance failure.",
    audience: ["Data office leadership", "Business line leadership", "HR/organization design partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "pattern-reuse-economics", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "operational-finops": 1, "ma-integration": 1 },
    effortSavedStewardWeeks: 2,
    toolTags: ["workflow (org design templates)", "spreadsheet-model (Excel, Google Sheets)"],
  },
  {
    key: "steward-role-cards",
    packKey: "vp-20",
    type: "template",
    name: "Steward & Governance Role Cards",
    pitch: "Role definitions for the governance jobs that actually exist now — including agent supervisor.",
    description:
      "Role card templates for the operating model's key roles: domain steward / agent supervisor (curation, suggestion review, remediation ownership, semantic certification), data product owner (maturity accountability, definition-of-done sign-off), governance platform engineer (substrate, agents, index), and reference data steward. Each card states mandate, decision rights, required competencies — including the agent-supervision competency most role frameworks omit — and time expectations honest enough to staff against.",
    soWhat:
      "Role clarity stops being the gap every maturity assessment finds: people know what they decide, what they curate, and what the agents draft for them — and HR can actually recruit and grade against it.",
    audience: ["Data office leadership", "HR partners", "Data stewards"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "named-trainees-demonstrated-readiness"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "sensitive-data-unlock": 1, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["workflow (org design templates)"],
  },
  {
    key: "governance-council-charter",
    packKey: "vp-20",
    type: "template",
    name: "Governance Council Charter Template",
    pitch: "Ratification, arbitration, and prioritization — with instruments, not just a meeting.",
    description:
      "A charter template for the enterprise governance council: standards ratification cadence matched to delivery pace, arbitration protocol for cross-line conflicts (contested metric definitions being the recurring case), scale-out wave prioritization, and quarterly portfolio review against the maturity index. The charter's distinguishing feature is instruments: the council governs from the fix list, the index, and telemetry — not from status narratives.",
    soWhat:
      "The council stops being where decisions go to wait: ratification keeps pace with delivery, and 'whose loss ratio is right' gets an arbitration path instead of a quarterly argument.",
    audience: ["Governance council members", "Data office leadership", "Business line leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["one-certified-definition-per-metric", "steward-as-supervisor"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "regulatory-reporting": 1, "greenfield-platform": 1 },
    effortSavedStewardWeeks: 0.5,
    toolTags: ["workflow (council instruments, fix list)", "bi (Power BI, Tableau)"],
  },
  {
    key: "centralize-federate-decision-guide",
    packKey: "vp-20",
    type: "guideline-standard",
    name: "Centralize-versus-Federate Decision Guide",
    pitch: "A written rubric for the argument every operating model redesign has three times.",
    description:
      "A decision guide for the recurring boundary question: centralize what benefits from being built once (substrate, agents, standards, pattern library, index), federate what requires domain judgment (approval, curation, business meaning), and test every contested case against observed friction rather than org-chart preference. Includes the failure-mode catalog: the central team doing everyone's stewardship, the business line rebuilding the platform, the standard nobody can operate.",
    soWhat:
      "Operating model reviews converge in weeks instead of quarters, and the answer holds — because it is written down with its rationale, applied consistently as the estate grows.",
    audience: ["Data office leadership", "Enterprise architects", "Business line leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["pattern-reuse-economics", "steward-as-supervisor", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
      "health-benefits": 1,
    },
    scenarioAffinity: { "greenfield-platform": 2, "ma-integration": 1, "operational-finops": 1 },
    toolTags: ["workflow (org design templates)"],
  },

  // ───────────────────────── VP-21 Value & Adoption Tracking Pack ─────────────────────────
  {
    key: "value-moments-method",
    packKey: "vp-21",
    type: "playbook-method",
    name: "Value Moments Reporting Method",
    pitch: "Quarterly business outcomes in business-line language — the cadence that sustains funding.",
    description:
      "A quarterly reporting method that translates governance work into outcomes each business line can name: a report leadership stopped caveating, a sensitive dataset analytics can finally use, a reconciliation finance stopped doing by hand, an access request fulfilled in days. Each value moment is evidenced from telemetry, attributed to the capability that produced it, and told in the audience's vocabulary — never in governance jargon.",
    soWhat:
      "The program stays funded through year three because leadership can retell its wins without a translator — the political survival mechanism most governance programs never build.",
    audience: ["Program leadership", "Data office leadership", "Communications partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["value-moments-visibility", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "operational-finops": 1, "sensitive-data-unlock": 1 },
    toolTags: ["bi (Power BI, Tableau)", "workflow (value moment register)"],
  },
  {
    key: "business-outcome-ledger",
    packKey: "vp-21",
    type: "template",
    name: "Business Outcome Ledger",
    pitch: "Capability → operational outcome → business impact → who feels it, kept current per product.",
    description:
      "A ledger template that keeps the causal chain visible for every governed product: the capability delivered, the operational outcome it produced (incidents down, provisioning time down, reconciliation automated), the business impact in the line's own terms, and the named audience who feels it. Populated at each product's definition-of-done and updated as outcomes accrue — the source material for value moments and funding cases alike.",
    soWhat:
      "When budget season asks 'what did governance actually change,' the answer is a ledger of attributed, evidenced outcomes — not a maturity chart the CFO has learned to discount.",
    audience: ["Program leadership", "Data product owners", "Finance partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["value-moments-visibility", "obligation-traceability"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "report-integrity": 1, "operational-finops": 2, "financial-reconciliation": 1 },
    effortSavedStewardWeeks: 0.5,
    toolTags: ["spreadsheet-model (Excel, Google Sheets)", "bi (Power BI, Tableau)"],
  },
  {
    key: "adoption-leverage-metrics",
    packKey: "vp-21",
    type: "metric-kpi",
    name: "Adoption & Self-Sufficiency Metrics",
    pitch: "The 'you do' curve, measured: internally-performed share, active stewards, pattern reuse.",
    description:
      "The metric set that tracks whether the model is being adopted rather than merely delivered: internally-performed share of governance cycle work per product (with a target threshold by validation stage), weekly active stewards in the suggestion queue, pattern-reuse rate on new products, and trainee certification progression. Adoption metrics come from the same telemetry as operations — participation is measured, never surveyed.",
    soWhat:
      "Self-sufficiency claims become checkable: leadership sees whose hands are actually on the work, and a vendor-dependency problem shows up in the numbers quarters before it shows up in the budget.",
    audience: ["Program leadership", "Data office leadership", "Enablement leads"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["named-trainees-demonstrated-readiness", "measured-leverage", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
    },
    scenarioAffinity: { "operational-finops": 2, "greenfield-platform": 1, "ai-ml-readiness": 1 },
    toolTags: ["workflow (steward queue, audit log)", "bi (Power BI, Tableau)"],
  },
  {
    key: "leverage-instrumentation-standard",
    packKey: "vp-21",
    type: "guideline-standard",
    name: "Leverage Instrumentation Standard",
    pitch: "Every automation ships with an instrumented before/after in steward-minutes.",
    description:
      "The measurement discipline behind every efficiency claim: no automation ships without an instrumented manual baseline and a supervised-agentic actual, captured in steward-minutes per artifact from workflow telemetry — not estimated, not surveyed, not recalled. Defines the baseline-capture protocol, the artifact taxonomy being measured, and the publication cadence that keeps the numbers visible while they are still actionable.",
    soWhat:
      "The program's economics survive due diligence — every leverage number traces to captured telemetry, which is what lets a scale-out business case be signed rather than debated.",
    audience: ["Governance platform team", "Program leadership", "Finance partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["measured-leverage", "agents-draft-stewards-decide"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "operational-finops": 2, "ai-ml-readiness": 1, "greenfield-platform": 1 },
    toolTags: ["workflow (steward queue, audit log)", "warehouse (Snowflake, Databricks)"],
  },

  // ───────────────────────── VP-22 Governance Communications & Change Pack ─────────────────────────
  {
    key: "steward-community-playbook",
    packKey: "vp-22",
    type: "playbook-method",
    name: "Steward Community of Practice Playbook",
    pitch: "The community rhythm that turns isolated stewards into a self-improving practice.",
    description:
      "The operating playbook for a steward community of practice: a regular pattern-sharing forum where a steward demos a solved problem, office hours staffed by the platform team, a shared pattern library with named contributors, and recognition mechanics tied to measured outcomes (patterns reused, breaches resolved) rather than activity. Designed around the agentic model's social reality: stewards trust agents faster when they hear it from other stewards.",
    soWhat:
      "Stewardship stops being a lonely side-duty: practices spread peer-to-peer instead of by mandate, and the community becomes the early-warning channel for what is not working in the field.",
    audience: ["Data stewards", "Enablement leads", "Governance platform team"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "pattern-reuse-economics", "value-moments-visibility"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
    },
    scenarioAffinity: { "operational-finops": 1, "greenfield-platform": 1, "sensitive-data-unlock": 1 },
    toolTags: ["workflow (community forum, pattern library)"],
  },
  {
    key: "exec-narrative-templates",
    packKey: "vp-22",
    type: "template",
    name: "Executive Narrative Templates",
    pitch: "Funding cases and quarterly stories in business-line language, pre-structured.",
    description:
      "Narrative templates for the audiences that decide the program's fate: the funding case built on measured per-product economics and the labor-versus-agentic curve, the quarterly leadership update structured around value moments rather than milestones, and the business-line brief that translates governance into each line's stakes — pricing confidence for underwriting, close speed for finance, unblocked analytics for HR. Every template enforces the discipline of leading with the outcome, never the capability.",
    soWhat:
      "Program leaders stop improvising the story each quarter — and executives retell it accurately, which is how a governance program builds sponsors it never has to lobby.",
    audience: ["Program leadership", "Data office leadership", "Communications partners"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["value-moments-visibility", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "report-integrity": 1, "operational-finops": 1, "sensitive-data-unlock": 1 },
    effortSavedStewardWeeks: 0.5,
    toolTags: ["workflow (narrative templates)", "bi (Power BI, Tableau)"],
  },
  {
    key: "change-champion-toolkit",
    packKey: "vp-22",
    type: "toolkit",
    name: "Change Champion Toolkit",
    pitch: "Equip the believers, answer the skeptics — including 'will the agents replace me?'",
    description:
      "A toolkit for building a champion network through the governed estate: champion selection criteria (credible practitioners, not enthusiastic volunteers), a communications calendar keyed to delivery milestones, and the objection-handling guide for the questions that actually get asked — 'will the agents replace me' (honest answer: the job moves up a layer, and here is the leverage data), 'why is my view being retired,' 'who decided this definition.' Each answer comes with the evidence to show, not just the words to say.",
    soWhat:
      "Resistance gets met with credible peers carrying real answers — which converts the silent majority faster than any leadership memo, and surfaces genuine objections while they are still fixable.",
    audience: ["Change managers", "Enablement leads", "Data stewards"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["steward-as-supervisor", "agents-draft-stewards-decide", "value-moments-visibility"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 1, "greenfield-platform": 1, "ai-ml-readiness": 1 },
    toolTags: ["workflow (champion network, comms calendar)"],
  },
  {
    key: "outcomes-over-activity-card",
    packKey: "vp-22",
    type: "best-practice-card",
    name: "Report Outcomes, Never Activity",
    pitch: "The communications rule that keeps governance funded: outcomes each line can name.",
    description:
      "The practice card for the program's communication discipline: every report, update, and dashboard leads with a business outcome someone outside the data office would recognize — a trusted report, an unblocked dataset, a faster close — with the governance activity behind it available one click deeper, never on top. Includes the litmus test: if a business-line leader cannot retell the update in their own words, it was activity reporting wearing an outcome costume.",
    soWhat:
      "Governance programs fail politically before they fail technically; this rule is the vaccine — funding conversations start from outcomes the business already knows about.",
    audience: ["Program leadership", "Communications partners", "Data office leadership"],
    capabilities: ["stewardship_ops"],
    bestPracticeKeys: ["value-moments-visibility", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 1, "operational-finops": 1, "regulatory-reporting": 1 },
    toolTags: ["workflow (narrative templates)", "bi (Power BI, Tableau)"],
  },

  // ───────────────────────── Platform-Native Toolkit Elements (Anchor Deep-Dive) ─────────────────────────
  {
    key: "cdgc-scanner-claire-config-starter",
    packKey: "vp-03",
    type: "toolkit",
    name: "CDGC Scanner & CLAIRE Configuration Starter",
    pitch: "Get scanners connected and CLAIRE tuned before the first glossary term gets curated.",
    description:
      "A build-ready checklist for standing up Informatica CDGC as the estate's catalog of record: scanner connection setup per source type (policy admin, claims, warehouse, file-based bordereaux feeds), CLAIRE confidence-threshold tuning so auto-classification and auto-association suggestions arrive at a precision stewards will actually trust, bulk glossary term loading via the catalog API from a starter pack rather than the UI, and the curation workflow configuration that routes suggestions to the right steward queue by domain.",
    soWhat:
      "The weeks normally spent on scanner trial-and-error and default-threshold noise disappear before curation starts — stewards' first session is reviewing good suggestions, not tolerating bad ones.",
    audience: ["Governance platform engineers", "Catalog administrators", "Data stewards"],
    capabilities: ["catalog_metadata", "classification", "semantic_layer"],
    bestPracticeKeys: ["governance-as-code", "classify-once-propagate-everywhere", "measured-leverage"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      "specialty-es": 1,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "sensitive-data-unlock": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["catalog-suite (Informatica CDGC, Collibra, Atlan)", "classification (BigID, platform-native)"],
    platformAffinity: { "idmc-cdgc": 3 },
  },
  {
    key: "cdgc-cdq-rule-pattern",
    packKey: "vp-01",
    type: "dq-rule-library",
    name: "CDGC CDQ Rule Authoring Pattern",
    pitch: "A real CDQ rule definition — threshold, severity, and routing wired together — not a rule-editor tutorial.",
    description:
      "A concrete Informatica CDQ rule definition pattern for the earned-premium-versus-written-premium reconciliation check: expression, reference-table threshold binding, severity classification, and exception routing to the steward queue, expressed in the declarative form CDGC's rule engine actually consumes. Written to be copied and re-pointed at a different CDE rather than studied as documentation.",
    soWhat:
      "A steward or platform engineer authoring their tenth CDQ rule starts from a working pattern instead of the CDGC rule editor's blank form, cutting authoring time and rule-inconsistency defects at once.",
    audience: ["Governance platform engineers", "DQ analysts", "Data stewards"],
    capabilities: ["data_quality"],
    dataDomains: ["premium", "reserve"],
    bestPracticeKeys: ["cde-anchored-quality", "governance-as-code", "remediation-loop-not-dashboard"],
    obligationKeys: ["asop-23"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "specialty-es": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "financial-reconciliation": 2, "greenfield-platform": 1 },
    toolTags: ["dq-engine (Informatica CDQ, platform-native)"],
    platformAffinity: { "idmc-cdgc": 3 },
  },
  {
    key: "snowflake-tagging-taxonomy-starter",
    packKey: "vp-03",
    type: "template",
    name: "Snowflake Governance Tagging Taxonomy Starter",
    pitch: "The object tag hierarchy, masking pattern, and RBAC role tree that make Snowflake the enforcement layer, not a free-for-all warehouse.",
    description:
      "A starter template for Snowflake's native governance surface: a three-level object tag hierarchy (sensitivity, data domain, product) that every downstream masking policy and access grant keys off of, a masking-policy pattern showing conditional masking driven by role and purpose, and an RBAC role hierarchy starter separating functional roles from access roles the way Snowflake's own security guidance recommends. Designed to be the tag and role scaffolding a data product inherits at creation, not retrofitted after the fact.",
    soWhat:
      "New schemas launch already wired to the enforcement layer instead of accumulating ungoverned tables that get retrofitted with tags and masking a year later at five times the cost.",
    audience: ["Governance platform engineers", "Security engineers", "Data product teams"],
    capabilities: ["access_policy", "classification", "catalog_metadata"],
    bestPracticeKeys: ["classify-once-propagate-everywhere", "govern-at-inception", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "sensitive-data-unlock": 2, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["warehouse (Snowflake, Databricks)", "policy-enforcement (Immuta, platform-native RBAC)"],
    platformAffinity: { snowflake: 3, immuta: 1 },
  },
  {
    key: "cortex-semantic-views-starter",
    packKey: "vp-01",
    type: "semantic-pack",
    name: "Cortex-Governed Semantic Views Starter",
    pitch: "A semantic view Cortex Analyst can query in natural language without stepping around RBAC.",
    description:
      "A Snowflake semantic view DDL pattern that defines certified measures (written premium, earned premium, loss ratio) with their dimensions and joins, built so Cortex Analyst answers natural-language business questions against the certified definition instead of raw tables — and so the view's row-access and masking policies apply identically whether the query comes from a person, a BI tool, or a Cortex-governed AI function.",
    soWhat:
      "A Cortex Analyst answer stops being a fluent guess: it resolves to the one certified metric definition, masked and row-limited exactly as a manual query would be.",
    audience: ["Governance platform engineers", "Analytics leads", "Data product teams"],
    capabilities: ["semantic_layer", "access_policy"],
    dataDomains: ["premium", "claim", "policy"],
    bestPracticeKeys: ["one-certified-definition-per-metric", "governance-as-code"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
      investments: 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 3, "report-integrity": 2, "greenfield-platform": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)", "bi (Power BI, Tableau)"],
    platformAffinity: { snowflake: 3 },
  },
  {
    key: "unity-catalog-governance-starter",
    packKey: "vp-03",
    type: "toolkit",
    name: "Unity Catalog Governance Starter",
    pitch: "Catalog naming, lineage verification, and access-grant hierarchy — set once, inherited by every schema after.",
    description:
      "A build checklist for standing up Unity Catalog as the lakehouse's governance substrate: a three-level catalog/schema/table naming convention that encodes environment and domain, lineage verification steps that confirm automatic capture is actually rendering for a representative notebook-to-table chain before it's trusted, and an access-grant hierarchy pattern (catalog-level defaults, schema-level domain grants, table-level exceptions) that avoids the all-tables-open-by-default failure mode.",
    soWhat:
      "A new lakehouse workspace inherits governance instead of accumulating it later — the naming and grant patterns that make product 40 cheaper than product 4 are in place before product 1 ships.",
    audience: ["Governance platform engineers", "Data engineers", "Platform owners"],
    capabilities: ["catalog_metadata", "access_policy", "lineage"],
    bestPracticeKeys: ["govern-at-inception", "governance-as-code", "pattern-reuse-economics"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "greenfield-platform": 3, "ai-ml-readiness": 1, "report-integrity": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["warehouse (Snowflake, Databricks)"],
    platformAffinity: { databricks: 3 },
  },
  {
    key: "lakehouse-monitoring-dq-starter",
    packKey: "vp-01",
    type: "dq-rule-library",
    name: "Lakehouse Monitoring DQ Expectations Starter",
    pitch: "DQ expectations wired into the pipeline that produces the data, not a batch job bolted on after.",
    description:
      "A Databricks Lakehouse Monitoring / Delta Live Tables expectations pattern for a claims CDE table: completeness and validity expectations on loss date, report date, and reserve amount, with a quarantine action on critical failures and a monitored-metrics table that Databricks Assistant's anomaly detection reads from. Expressed as pipeline code so the check runs at the moment the table lands, not on a separate schedule.",
    soWhat:
      "Quality checks stop drifting out of sync with the pipeline that produces the data, and a breach is caught before a bad row reaches a downstream reserve calculation.",
    audience: ["Data engineers", "DQ analysts", "Governance platform engineers"],
    capabilities: ["data_quality"],
    dataDomains: ["claim", "reserve"],
    bestPracticeKeys: ["cde-anchored-quality", "governance-as-code", "remediation-loop-not-dashboard"],
    obligationKeys: ["asop-23"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "specialty-es": 1,
      reinsurance: 1,
    },
    scenarioAffinity: { "report-integrity": 2, "claims-analytics": 2, "greenfield-platform": 1 },
    toolTags: ["warehouse (Snowflake, Databricks)"],
    platformAffinity: { databricks: 3 },
  },
  {
    key: "bigid-classifier-tuning-starter",
    packKey: "vp-11",
    type: "toolkit",
    name: "BigID Classifier Tuning & Correlation Starter",
    pitch: "Classifier selection and threshold tuning for the categories a generic PII scan misses.",
    description:
      "A build checklist for tuning BigID against insurance-specific sensitive-data categories: classifier selection per data type (claims medical narrative, NPPI financial fields, producer license and appointment numbers, litigation and SIU flags), confidence-threshold tuning by category so low-signal free-text findings route to review instead of auto-publishing, correlation-engine subject-matching setup across policy, claims, and billing systems, and the validation sampling pass that confirms precision before findings feed the catalog.",
    soWhat:
      "Classification coverage on the categories that actually cause insurance privacy incidents — not generic PII — is live in weeks, and findings arrive at a confidence stewards can trust rather than a flood to sift through by hand.",
    audience: ["Privacy partners", "Security engineers", "Data stewards"],
    capabilities: ["classification"],
    dataDomains: ["claim", "party", "producer-distribution"],
    bestPracticeKeys: ["classify-once-propagate-everywhere", "agents-on-metadata-only", "measured-leverage"],
    obligationKeys: ["glba-nppi", "hipaa-phi"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
      "brokerage-mga": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 1.5,
    toolTags: ["classification (BigID, platform-native)"],
    platformAffinity: { bigid: 3 },
  },
  {
    key: "bigid-unstructured-claims-scan-playbook",
    packKey: "vp-11",
    type: "toolkit",
    name: "BigID Unstructured Claims Content Scan Playbook",
    pitch: "Adjuster notes and medical narrative are where a catalog scanner sees nothing and BigID earns its keep.",
    description:
      "The method for scanning the unstructured content a catalog's structured scanner never reaches: connector setup for claims-document repositories and imaging systems, entity-extraction model selection tuned for medical narrative and adjuster free-text notes, a sampling-based precision validation pass before findings are trusted at scale, and the routing rule that sends high-confidence sensitive findings to the steward review queue rather than auto-classifying documents wholesale.",
    soWhat:
      "The sensitivity map stops stopping at structured columns — the medical narrative and litigation notes that cause the real incidents get classified and routed instead of sitting invisible in a document store.",
    audience: ["Privacy partners", "Security engineers", "SIU", "Data stewards"],
    capabilities: ["classification", "stewardship_ops"],
    dataDomains: ["claim"],
    bestPracticeKeys: ["agents-on-metadata-only", "classify-once-propagate-everywhere", "agents-draft-stewards-decide"],
    obligationKeys: ["hipaa-phi", "glba-nppi"],
    sectorAffinity: {
      "pc-personal": 3,
      "pc-commercial": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "claims-analytics": 1 },
    toolTags: ["classification (BigID, platform-native)"],
    platformAffinity: { bigid: 3, "idmc-cdgc": 1 },
  },
  {
    key: "immuta-purpose-policy-starter",
    packKey: "vp-15",
    type: "template",
    name: "Immuta Purpose-Based Policy Starter",
    pitch: "Claims handling sees the medical narrative; analytics sees the aggregate. One policy pattern, not two extracts.",
    description:
      "A starter template for authoring Immuta purpose-based policies over insurance data: the purpose-definition pattern contrasting 'claims handling' against 'analytics' access, the attribute-tag mapping that pulls sensitivity labels from BigID or CDGC classification rather than re-deciding them in Immuta, a masking rule pattern per purpose (full access, aggregate-only, field-masked), and the exception-and-expiry pattern that keeps purpose grants from becoming permanent by default.",
    soWhat:
      "Purpose-based access moves from a described intent to an authored, testable policy in days, and every grant traces to a declared purpose an audit can replay.",
    audience: ["Security engineers", "Privacy partners", "Analytics leads"],
    capabilities: ["access_policy", "classification"],
    dataDomains: ["claim", "party"],
    bestPracticeKeys: ["purpose-based-access", "classify-once-propagate-everywhere"],
    obligationKeys: ["glba-nppi", "state-privacy-laws"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 2,
    },
    scenarioAffinity: { "sensitive-data-unlock": 3, "ai-ml-readiness": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["policy-enforcement (Immuta, platform-native RBAC)"],
    platformAffinity: { immuta: 3, bigid: 1 },
  },
  {
    key: "immuta-policy-testing-toolkit",
    packKey: "vp-03",
    type: "toolkit",
    name: "Immuta Policy Testing & Impact Analysis Toolkit",
    pitch: "See who a policy change actually affects before it ships, not after the help-desk ticket.",
    description:
      "A testing discipline for promoting Immuta policy-as-code changes: a dry-run impact-analysis step that lists every consumer whose access would change before a policy merges, a regression test suite that re-verifies existing purposes still resolve correctly after the change, and a staged rollout pattern by consumer group so a policy error affects a pilot population before the whole estate. Wired into the same CI gate the governance definition schema already uses.",
    soWhat:
      "Policy changes stop being a leap of faith: a steward sees the blast radius before approving, and staged rollout catches an authoring error against ten users instead of ten thousand.",
    audience: ["Security engineers", "Governance platform engineers", "Privacy partners"],
    capabilities: ["access_policy", "stewardship_ops"],
    bestPracticeKeys: ["governance-as-code", "purpose-based-access", "steward-as-supervisor"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      "health-benefits": 1,
    },
    scenarioAffinity: { "sensitive-data-unlock": 2, "greenfield-platform": 1 },
    toolTags: ["policy-enforcement (Immuta, platform-native RBAC)", "ci-cd (Git-based pipeline, policy validation)"],
    platformAffinity: { immuta: 3 },
  },
  {
    key: "power-bi-certification-rls-starter",
    packKey: "vp-18",
    type: "template",
    name: "Power BI Certified Dataset & RLS Starter",
    pitch: "The certification workflow and row-level security pattern that make a Power BI badge mean something.",
    description:
      "A starter template for Power BI's consumption-layer governance: certification workflow criteria tied to the marketplace certification tiers, a row-level security role pattern for insurance data (policy state, line of business, sensitivity tier) that maps cleanly onto upstream warehouse row-access policies rather than duplicating them, and a measure-certification checklist that ties every certified DAX measure back to its certified glossary definition before endorsement.",
    soWhat:
      "Certification stops being a badge applied once and forgotten: every certified dataset in Power BI carries RLS that matches upstream policy and measures that trace to one certified meaning.",
    audience: ["BI developers", "Data stewards", "Analytics leads"],
    capabilities: ["semantic_layer", "access_policy", "stewardship_ops"],
    bestPracticeKeys: ["certified-data-products", "one-certified-definition-per-metric", "purpose-based-access"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 2,
      investments: 1,
    },
    scenarioAffinity: { "report-integrity": 3, "greenfield-platform": 1 },
    effortSavedStewardWeeks: 1,
    toolTags: ["bi (Power BI, Tableau)"],
    platformAffinity: { "power-bi": 3, snowflake: 1 },
  },
  {
    key: "power-bi-copilot-guardrail-checklist",
    packKey: "vp-14",
    type: "toolkit",
    name: "Power BI Copilot Guardrail Checklist",
    pitch: "Copilot answers as well as the dataset it's pointed at — this is how you make sure that's the certified one.",
    description:
      "A guardrail checklist for enabling Copilot in Power BI without inheriting its honest limitation: scoping Copilot to certified datasets only, a measure-definition review pass before a dataset is exposed to Copilot (an ambiguous measure produces a fluent, wrong Copilot answer as easily as a human one), guardrail and content-scope configuration steps, and a Copilot usage-log monitoring pattern that flags questions answered against uncertified data.",
    soWhat:
      "AI-assisted reporting ships without becoming the fastest way to distribute a wrong number — Copilot's fluency stays confined to the definitions the organization actually certified.",
    audience: ["BI developers", "Governance platform team", "Model risk teams"],
    capabilities: ["semantic_layer", "stewardship_ops"],
    bestPracticeKeys: ["certified-data-products", "one-certified-definition-per-metric", "agents-draft-stewards-decide"],
    obligationKeys: ["naic-ai-model-bulletin"],
    sectorAffinity: {
      "pc-personal": 2,
      "pc-commercial": 2,
      "life-annuities": 1,
    },
    scenarioAffinity: { "ai-ml-readiness": 2, "report-integrity": 1 },
    toolTags: ["bi (Power BI, Tableau)"],
    platformAffinity: { "power-bi": 3 },
  },
];
