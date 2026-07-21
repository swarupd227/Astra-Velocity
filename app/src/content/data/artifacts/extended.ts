import type { Artifact } from "../../types";

/** Artifacts for extended packs VP-12..VP-22, keyed by element key. */
export const EXTENDED_ARTIFACTS: Record<string, Artifact> = {
  // ───────────────────────── VP-12 Data Contract Starter Pack ─────────────────────────

  "data-contract-template": {
    kind: "code",
    language: "yaml",
    description:
      "Versioned data contract for a producer-consumer boundary, ready to adapt: policy transaction feed from policy administration to the finance data product. CI-checkable structure — schema, semantics, quality thresholds, freshness SLA, sensitivity handling, and change control.",
    snippet: `# Data Contract — Policy Transaction Feed
# Boundary: policy administration (producer) -> finance data product (consumer)
contract:
  id: dc-policy-txn-finance
  version: 2.1.0            # semver; MAJOR = breaking schema/semantic change
  status: active
  producer:
    system: policy-admin-core
    owner: policy-platform-team
    steward: policy-domain-steward
  consumer:
    product: finance-data-product
    owner: finance-data-lead
    escalation: data-governance-council

schema:
  entity: policy_transaction
  grain: one row per policy transaction (new business, endorsement, cancellation, reinstatement, renewal, audit)
  fields:
    - name: policy_number
      type: string
      constraints: [not_null, "matches ^[A-Z]{2}[0-9]{8}$"]
      semantic: glossary:policy-number          # bound to certified glossary term
    - name: transaction_type
      type: string
      constraints: [not_null, "in_reference_set(policy-transaction-types@>=3.0)"]
    - name: transaction_effective_date
      type: date
      constraints: [not_null, ">= policy_effective_date"]
    - name: accounting_date
      type: date
      constraints: [not_null]
    - name: written_premium_amount
      type: decimal(15,2)
      semantic: glossary:written-premium
      constraints: [not_null]
    - name: annual_statement_line
      type: string
      constraints: ["in_reference_set(naic-asl-codes@>=2026.1)"]
    - name: risk_state
      type: string
      constraints: [not_null, "in_reference_set(us-jurisdictions@>=2026.1)"]
    - name: insured_party_id
      type: string
      constraints: [not_null]
      sensitivity: indirect-identifier

quality:
  thresholds:                       # breach -> pipeline fails / breach routed, per severity
    - rule: completeness(written_premium_amount) >= 99.9%
      severity: critical            # blocks publication
    - rule: referential(policy_number in policy_master) >= 99.95%
      severity: critical
    - rule: sum(written_premium_amount) by accounting_month
      reconciles_to: gl_account_40100 within 0.05%
      severity: critical
    - rule: completeness(annual_statement_line) >= 99.5%
      severity: serious             # publishes with routed breach
  breach_routing: steward-triage-queue

sla:
  delivery: daily by 06:00 America/New_York
  freshness: max 26h from source commit
  completeness_window: all transactions with accounting_date <= T-1
  late_delivery_notice: 60 minutes, to consumer escalation channel

sensitivity:
  classification: confidential-npi        # contains indirect identifiers (NPPI-adjacent)
  handling:
    - insured_party_id delivered pseudonymized outside claims/finance purposes
    - no direct identifiers (name, address, TIN) cross this boundary
  purpose_scope: [financial-reporting, statutory-reporting, reconciliation]

change_control:
  breaking_changes:                       # require MAJOR version + consumer sign-off
    - field removal or rename
    - type narrowing, grain change
    - semantic rebinding of any glossary-bound field
  notice_period: 60 days for breaking, 10 days for additive
  deprecation: old MAJOR supported in parallel for one full close cycle
  validation: contract linted + schema-diffed in CI on every producer release`,
  },

  "bordereaux-tpa-contract-exemplars": {
    kind: "code",
    language: "yaml",
    description:
      "Filled-in contract exemplar for a delegated-authority premium bordereau from a coverholder, plus the TPA claim-feed clauses that differ. Encodes the checks that catch missing months, remapped codes, and silently changed layouts.",
    snippet: `# Data Contract Exemplar — Coverholder Premium Bordereau
contract:
  id: dc-bdx-prem-coverholder
  version: 1.4.0
  producer: { party: coverholder, binder_ref_required: true }
  consumer: { team: delegated-authority-ops, steward: da-data-steward }

schema:
  entity: premium_bordereau_row
  grain: one row per risk per bordereau period
  fields:
    - { name: binder_reference,  type: string, constraints: [not_null, "exists_in(active_binder_register)"] }
    - { name: umr,               type: string, constraints: [not_null, "matches ^B[0-9]{4}[A-Z0-9]+$"] }  # Unique Market Reference
    - { name: bordereau_period,  type: yyyymm, constraints: [not_null] }
    - { name: risk_inception,    type: date,   constraints: [not_null, within_binder_period] }
    - { name: lloyds_risk_code,  type: string, constraints: ["in_reference_set(lloyds-risk-codes@current-yoa)"] }
    - { name: year_of_account,   type: yyyy,   constraints: [not_null, "= binder year of account"] }
    - { name: gross_premium,     type: decimal(15,2), constraints: [not_null] }
    - { name: premium_ccy,       type: string, constraints: ["in_reference_set(iso-4217)"] }
    - { name: commission_pct,    type: decimal(5,2),  constraints: ["<= binder max commission"] }

quality:
  thresholds:
    - rule: period_continuity           # the classic failure: missing months
      check: every yyyymm since binder inception present or explicitly nil-return
      severity: critical
    - rule: layout_fingerprint          # silently changed layouts
      check: column set + order hash matches contracted layout
      severity: critical
    - rule: currency_consistency
      check: premium_ccy constant per risk across periods unless endorsed
      severity: serious
    - rule: risk_level_detail
      check: rows_per_period >= declared_risk_count * 0.98
      severity: serious

sla: { delivery: monthly by working-day 10, nil_returns: required }

# ── TPA Claim Feed: clauses that differ ─────────────────────────────
tpa_claim_feed_overrides:
  schema_additions:
    - { name: claim_status,        constraints: ["in_reference_set(tpa-status-map@>=2.0)"] }  # lifecycle mapping owned by contract, not TPA
    - { name: paid_indemnity_itd,  type: decimal(15,2) }
    - { name: case_reserve,        type: decimal(15,2) }
    - { name: claimant_data_scope: "claimant PII limited to handling purposes; medical content flagged" }
  quality_additions:
    - rule: status_regression_check   # closed claims re-opening without transaction
      severity: serious
    - rule: financial_reconciliation
      check: sum(paid_indemnity_itd) movement = sum(payment transactions) per period
      severity: critical
  sla: { delivery: weekly, reconciliation_statement: monthly }`,
  },

  "contract-enforcement-toolkit": {
    kind: "method",
    steps: [
      {
        name: "Register the contract as code",
        description:
          "Store every contract in version control next to the producer's pipeline code; register it in the catalog with producer, consumer, and steward identities so both sides see the same artifact.",
        decisionRule: "A contract not in version control and not catalog-registered is a draft, not a control.",
      },
      {
        name: "Wire CI validation at build time",
        description:
          "On every producer release, lint the contract, schema-diff the release against the contracted schema, and verify glossary bindings still resolve. Breaking diffs fail the build unless a MAJOR version bump with consumer sign-off accompanies them.",
        decisionRule: "Field removal, rename, type narrowing, or grain change = breaking; additive nullable fields = non-breaking.",
      },
      {
        name: "Deploy runtime validators where the data lands",
        description:
          "Compile the contract's quality thresholds into DQ rules that execute in the landing zone on every delivery — completeness, referential integrity, reconciliation tie-outs, layout fingerprint.",
        decisionRule: "Critical-severity breach blocks publication to consumers; serious-severity publishes with a routed breach.",
      },
      {
        name: "Route breaches to owned queues",
        description:
          "Every threshold breach creates a triage item assigned to the producer-side steward with the consumer on notice, carrying the rule, the failing sample, and the contract clause it violates.",
        decisionRule: "No breach closes without a disposition: fixed, threshold renegotiated (new contract version), or accepted with expiry date.",
      },
      {
        name: "Publish compliance telemetry to both sides",
        description:
          "Maintain a per-contract scorecard — delivery punctuality, threshold pass rate, open breaches by age — visible to producer and consumer alike, so producers see their record before consumers complain.",
        decisionRule: "Three consecutive periods below the contracted pass rate triggers governance-council escalation, not another email thread.",
      },
    ],
  },

  "boundary-contract-adoption-card": {
    kind: "checklist",
    sections: [
      {
        title: "Boundary selection rubric — contract it if any apply",
        items: [
          "Money crosses the boundary: the feed lands in financial reconciliation, GL posting, or statutory reporting (bordereaux, TPA feeds, billing-to-GL, premium tie-outs).",
          "Obligation crosses the boundary: the data feeds a filed number, a regulator-visible report, or an examiner evidence request.",
          "Sensitive data crosses ownership lines: NPPI, health content, or claimant financial data moves between teams with different access postures.",
          "Ownership genuinely changes: producer and consumer report to different leadership and have disputed a break in the last four quarters.",
          "An external party produces the data: coverholder, TPA, broker, or vendor feed where you cannot fix the source yourself.",
        ],
      },
      {
        title: "Skip it — do not contract",
        items: [
          "Internal hops inside one team's pipeline where a single owner can fix both sides.",
          "Exploratory or sandbox datasets with no downstream financial or regulatory consumer.",
          "Boundaries already covered end-to-end by a certified data product's own quality gates.",
        ],
      },
      {
        title: "Sequencing for adoption",
        items: [
          "Start with one boundary that broke a real number in the last two quarters — the contract's first catch is the program's credibility.",
          "Draft the first contract with the producer, not at them; the producer names the thresholds they can actually meet today.",
          "Enforce softly for one cycle (routed breaches, no blocking), then turn on blocking for critical rules.",
          "Publish the first prevented incident as a value moment before proposing the next three boundaries.",
          "Cap the first year's portfolio: better ten enforced contracts than sixty signed memos.",
        ],
      },
    ],
  },

  // ───────────────────────── VP-13 Insurance Data Product Blueprints ─────────────────────────

  "policy-360-blueprint": {
    kind: "template",
    sections: [
      {
        title: "Scope & grain",
        purpose:
          "Fix what the product covers before modeling: all in-force and expired policies across admin systems, transaction-level grain with policy- and coverage-level rollups.",
        fields: [
          "In-scope lines of business and admin systems",
          "Grain statement: policy_transaction (atomic), policy_term, policy_current_view",
          "History depth (minimum: full development history for open statutory years)",
          "Out-of-scope declarations (e.g., quotes, unbound submissions)",
        ],
      },
      {
        title: "Source contracts",
        purpose:
          "Name every producing system and bind each feed to a data contract with thresholds the product's gates enforce.",
        fields: [
          "Policy admin feed(s) with contract IDs and versions",
          "Rating/quote system linkage (bound business only)",
          "Billing linkage for premium tie-out",
          "Reference data dependencies: transaction types, LOB codes, jurisdiction codes",
        ],
      },
      {
        title: "CDE families",
        purpose:
          "Anchor quality on the elements downstream money and filings depend on.",
        fields: [
          "Identity: policy_number, term_id, insured_party_id, producer_id",
          "Dates: effective, expiration, transaction_effective, accounting",
          "Financial: written_premium, earned_premium (derived), coverage limits, deductibles",
          "Classification: transaction_type, LOB/class codes, annual_statement_line, risk_state",
        ],
      },
      {
        title: "Quality gates",
        purpose:
          "The executing controls that certification requires — not aspirations.",
        fields: [
          "Transaction-sequence integrity: no gaps, no out-of-order effective dating, cancellations reference existing terms",
          "Premium tie-out: written premium by month reconciles to GL and to billing within tolerance",
          "Referential: every transaction resolves to a policy master row; every policy to a resolved insured party",
          "Reference validity: class/LOB/jurisdiction codes valid as of transaction date",
        ],
      },
      {
        title: "Semantic model",
        purpose:
          "Bind product measures to certified glossary definitions so every consumer inherits one meaning.",
        fields: [
          "Certified measures: policies in force, written premium, earned premium, retention ratio",
          "Glossary bindings with version references",
          "Known divergences from legacy reports, with reconciliation notes",
        ],
      },
      {
        title: "Access model & sensitivity map",
        purpose:
          "Classify once at the product level; derive access from purpose.",
        fields: [
          "Policyholder attributes classified (NPPI, indirect identifiers)",
          "Purpose-based views: pricing analytics (pseudonymized), finance (aggregated), servicing (full)",
          "Row/column policy references and exception path",
        ],
      },
      {
        title: "Dashboards & certification path",
        purpose:
          "The consumption surfaces shipped with the product and the evidence needed for marketplace listing.",
        fields: [
          "Shipped dashboards: policy movement, premium flow, product quality panel",
          "Certification target tier and evidence checklist reference",
          "Steward, SLA, and breach-routing assignments",
        ],
      },
    ],
  },

  "claims-360-blueprint": {
    kind: "cde-set",
    note: "The CDE spine of the governed claims product, FNOL through recovery. Starter set — extend per line of business.",
    cdes: [
      {
        name: "claim_number",
        domain: "claim",
        definition: "Unique claim identifier assigned at FNOL; stable across system migrations via crosswalk.",
        qualityDimensions: ["uniqueness", "completeness", "referential integrity to policy"],
        exampleIssue: "TPA-originated claims re-keyed on import create duplicate claim histories.",
      },
      {
        name: "loss_date",
        domain: "claim",
        definition: "Date the loss event occurred (occurrence basis) or claim made (claims-made basis), per policy trigger.",
        qualityDimensions: ["completeness", "validity (within policy period)", "consistency with report_date"],
        exampleIssue: "Loss date defaulted to report date at FNOL corrupts accident-year triangles.",
      },
      {
        name: "report_date",
        domain: "claim",
        definition: "Date the insurer first received notice of the claim; anchors report-year development and late-reporting analysis.",
        qualityDimensions: ["completeness", "validity (>= loss_date)"],
      },
      {
        name: "claim_status",
        domain: "claim",
        definition: "Lifecycle state (open, closed, reopened, closed-no-payment) with effective-dated transitions.",
        qualityDimensions: ["validity (allowed transitions)", "timeliness of status updates"],
        exampleIssue: "Reopened claims coded as new claims inflate frequency and break severity trends.",
      },
      {
        name: "cause_of_loss_code",
        domain: "claim",
        definition: "Peril classification from the governed cause-of-loss taxonomy, assigned at FNOL and confirmable at closure.",
        qualityDimensions: ["validity (taxonomy membership)", "accuracy vs. adjuster narrative"],
        exampleIssue: "Wind-versus-water miscoding in hurricane claims distorts cat recoveries and reinsurance allocation.",
      },
      {
        name: "catastrophe_event_code",
        domain: "claim",
        definition: "Industry or internal catastrophe event identifier linking the claim to a declared cat event.",
        qualityDimensions: ["completeness for cat-window claims", "referential integrity to event register"],
      },
      {
        name: "case_reserve_amount",
        domain: "reserve",
        definition: "Adjuster-set estimate of unpaid indemnity on the claim, by reserve type (indemnity, expense), as of valuation date.",
        qualityDimensions: ["completeness", "timeliness of revisions", "reconciliation to reserve transactions"],
        exampleIssue: "Stale case reserves on long-open litigated claims understate incurred and distort LDFs.",
      },
      {
        name: "paid_loss_amount",
        domain: "claim",
        definition: "Cumulative indemnity payments net of voids/stops, by payment type, reconcilable to the payment ledger.",
        qualityDimensions: ["accuracy (ties to payment ledger)", "completeness"],
      },
      {
        name: "recovery_amount",
        domain: "claim",
        definition: "Cumulative subrogation, salvage, and deductible recoveries; signed convention documented.",
        qualityDimensions: ["completeness", "consistency of sign convention"],
        exampleIssue: "Recoveries netted into paid loss in one system and held separately in another break net/gross reporting.",
      },
      {
        name: "claimant_party_id",
        domain: "party",
        definition: "Resolved party identifier for the claimant, linked through party resolution; supports role modeling (claimant may also be insured).",
        qualityDimensions: ["referential integrity", "resolution accuracy (no false merges)"],
      },
      {
        name: "litigation_flag",
        domain: "claim",
        definition: "Indicator that the claim is in litigation, with counsel-assignment date; drives sensitivity handling and reserve review triggers.",
        qualityDimensions: ["timeliness", "completeness"],
      },
      {
        name: "medical_content_flag",
        domain: "claim",
        definition: "Sensitivity marker: claim file contains medical records or health information; propagates restricted handling to every extract.",
        qualityDimensions: ["completeness (classification coverage)", "accuracy"],
        exampleIssue: "Unflagged medical content copied into an analytics extract becomes a privacy incident, not a data-quality note.",
      },
    ],
  },

  "producer-360-blueprint": {
    kind: "template",
    sections: [
      {
        title: "Scope & hierarchy grain",
        purpose:
          "Cover the full distribution structure: individual producers, agencies, branches, and national accounts, with effective-dated relationships.",
        fields: [
          "In-scope channels (independent agency, captive, broker, MGA, direct)",
          "Hierarchy grain: producer -> agency -> parent org, effective-dated",
          "History rules for moves, mergers, and terminations (book-of-business follows which node)",
        ],
      },
      {
        title: "Sources & contracts",
        purpose: "Bind producer management, licensing, commission, and policy admin feeds to contracts.",
        fields: [
          "Producer/agency management system feed",
          "Licensing & appointment feed (state DOI data, NIPR-sourced where used)",
          "Commission system feed with GL linkage",
          "Policy admin production feed (written/issued business by producer code)",
        ],
      },
      {
        title: "CDE families",
        purpose: "The elements compensation disputes and appointment compliance hang on.",
        fields: [
          "Identity: producer_id, NPN (National Producer Number), agency_id, producer codes per admin system",
          "Licensing: license state, line authority, license status, expiration date",
          "Appointment: carrier appointment status and effective dates by state",
          "Compensation: commission schedule id, rate, production credit, paid commission",
        ],
      },
      {
        title: "Quality gates",
        purpose: "Executing controls on hierarchy, licensing currency, and money.",
        fields: [
          "Hierarchy integrity: no orphan producers, no cyclic reporting lines, effective-date continuity",
          "License-status currency: no production credited to expired/lapsed licenses or missing appointments",
          "Commission tie-out: paid commission reconciles to GL and to schedule-computed expectation within tolerance",
          "Producer-code crosswalk completeness across admin systems",
        ],
      },
      {
        title: "Semantic model",
        purpose: "One certified definition for production and compensation measures.",
        fields: [
          "Certified measures: written premium by producer, book-of-business rollup, commission expense, quote-to-bind",
          "Attribution rules: split business, servicing vs. writing producer, house accounts",
        ],
      },
      {
        title: "Access model",
        purpose: "Producer compensation is sensitive; competitors' books are confidential to each other.",
        fields: [
          "Row-level security: producers/agencies see own book only",
          "Compensation attributes restricted to comp team and leadership purposes",
          "Regulator-extract view for appointment compliance",
        ],
      },
      {
        title: "Dashboards",
        purpose: "The consumption surfaces distribution leadership actually uses.",
        fields: [
          "Production leaderboard with certified attribution",
          "Appointment compliance panel (expiring licenses, unappointed production)",
          "Commission reconciliation status",
        ],
      },
    ],
  },

  "party-360-blueprint": {
    kind: "template",
    sections: [
      {
        title: "Scope & identity model",
        purpose:
          "One resolved party across policy, claims, billing, and distribution — persons and organizations, with roles not duplicates.",
        fields: [
          "Party types: person, organization, household, trust/estate",
          "Role model: insured, claimant, beneficiary, payee, producer, provider, guarantor — many roles per party",
          "Golden-record identifier strategy and source-key crosswalk",
        ],
      },
      {
        title: "Sources & resolution inputs",
        purpose: "Every system contributing party records, feeding the resolution engine under contract.",
        fields: [
          "Policy admin, claims, billing, producer management, CRM feeds",
          "Match-rule library reference (VP-16) and survivorship configuration",
          "Steward review queue integration for borderline matches",
        ],
      },
      {
        title: "CDE families",
        purpose: "The attributes resolution quality and downstream trust depend on.",
        fields: [
          "Names (legal, DBA, aliases), normalized addresses, DOB, TIN where held",
          "Contact points with capture channel and verification status",
          "Role assignments with effective dates and source references",
          "Household / commercial hierarchy membership",
        ],
      },
      {
        title: "Semantic model",
        purpose: "Make 'customer' mean one thing.",
        fields: [
          "Certified definitions: customer count, active relationship, household",
          "Relationship-depth measures (products per household, cross-line presence)",
        ],
      },
      {
        title: "Access model & sensitivity",
        purpose: "Party is the most identifier-dense product in the estate; purpose-based access is mandatory.",
        fields: [
          "Direct identifiers restricted; pseudonymized analytical view as default",
          "DSAR-support view: full record location map per party for privacy operations",
          "Sanctions-screening view: normalized names, DOB, address for all payee/beneficiary roles",
        ],
      },
      {
        title: "Quality gates & dashboards",
        purpose: "Resolution quality made visible and enforced.",
        fields: [
          "Duplicate-party rate by segment; false-merge incident count (target: zero in claims)",
          "Resolution coverage: share of transactions linked to a golden record",
          "Dashboards: resolution quality panel, role-overlap explorer, DSAR readiness",
        ],
      },
    ],
  },

  "finance-data-product-blueprint": {
    kind: "template",
    sections: [
      {
        title: "Scope & bases",
        purpose:
          "Premium, loss, expense, and investment flows reconciled to the GL, with statutory and GAAP bases handled explicitly, close-calendar aware by design.",
        fields: [
          "In-scope flows: written/earned premium, paid/incurred loss, LAE, commissions, operating expense, investment income",
          "Basis handling: statutory vs. GAAP mappings, with basis as an explicit dimension",
          "Close-calendar registration: which controls run at T-3, T-1, day 1, day 5",
        ],
      },
      {
        title: "Sources & tie-points",
        purpose: "Every upstream feed named, contracted, and tied to a GL anchor.",
        fields: [
          "Policy admin, claims, billing, reinsurance, and investment accounting feeds with contract IDs",
          "Tie-point CDE register: subledger totals to GL accounts (premium receivable, loss reserves, commission payable)",
          "Intercompany and pooling eliminations, where applicable",
        ],
      },
      {
        title: "CDE families",
        purpose: "The elements the close, the audit, and the statement depend on.",
        fields: [
          "GL: account, cost center, legal entity, accounting period, posting amount",
          "Insurance: written/earned premium, paid loss, case reserves, IBNR allocation, ceded amounts",
          "Alignment keys: annual_statement_line, state, line of business, accident year",
        ],
      },
      {
        title: "Controls & quality gates",
        purpose: "Reconciliations as executing controls, scheduled against the close.",
        fields: [
          "Subledger-to-GL tie-outs per flow, per period, within stated tolerance",
          "Movement analytics: period-over-period variance beyond threshold routes to review before the number publishes",
          "Basis reconciliation: stat-to-GAAP walk balances by construction",
          "Late-adjustment tracking with lineage to originating entry",
        ],
      },
      {
        title: "Lineage & audit evidence",
        purpose: "Answer audit and exam questions from lineage, not spreadsheet archaeology.",
        fields: [
          "Column-level lineage from statement cells back to source feeds for filed numbers",
          "Documented manual segments (journal entries, true-ups) with owners",
          "Evidence pack generation: control run history per close",
        ],
      },
      {
        title: "Access model & dashboards",
        purpose: "Close visibility without spreadsheet exports.",
        fields: [
          "Purpose views: close operations, FP&A, audit (read-only with evidence trail)",
          "Dashboards: close-readiness panel, tie-out status board, breach aging",
        ],
      },
    ],
  },

  // ───────────────────────── VP-14 AI Governance & Model Risk Pack ─────────────────────────

  "ai-model-inventory-template": {
    kind: "template",
    sections: [
      {
        title: "Identification & ownership",
        purpose: "One row per model or AI use case — including vendor models and embedded AI — with accountable humans.",
        fields: [
          "Inventory ID and model/use-case name",
          "Business owner, technical owner, model risk reviewer",
          "Vendor/third-party flag with vendor name and contract reference",
          "Status: proposed / in development / in production / retired",
        ],
      },
      {
        title: "Purpose & decision impact",
        purpose: "What the model does and what happens to a consumer because of it — the regulator's first question.",
        fields: [
          "Use-case description in plain language",
          "Decision type: rating/pricing, underwriting eligibility, claims triage, fraud, reserving support, marketing, servicing",
          "Consumer impact: adverse-action potential (yes/no, basis), human-in-the-loop point",
          "Autonomy level: advisory / decision-support / automated with override / fully automated",
        ],
      },
      {
        title: "Risk tier & regulatory mapping",
        purpose: "Tier drives governance depth; map each entry to the obligations that reach it.",
        fields: [
          "Risk tier (from the triage rubric) with rationale",
          "Applicable regimes: NAIC AI Model Bulletin adoption states, EU AI Act classification (if EU exposure), state DOI filings",
          "ASOP applicability (ASOP 56 model governance, ASOP 23 data quality) for actuarial models",
        ],
      },
      {
        title: "Data dependencies",
        purpose: "The data half of model risk: what the model trains and scores on, governed how.",
        fields: [
          "Training datasets with lineage references and refresh cadence",
          "Scoring inputs: data products and CDEs consumed, with contract/quality references",
          "Protected-class and proxy-attribute review status and date",
          "External data sources and their vendor due-diligence status",
        ],
      },
      {
        title: "Governance evidence",
        purpose: "Links, not narratives — what an examiner can open.",
        fields: [
          "Model documentation / model card link",
          "Validation report and date; next review due",
          "Bias/fairness testing evidence where applicable",
          "Monitoring: drift metrics, performance thresholds, escalation path",
        ],
      },
    ],
  },

  "model-data-governance-standard": {
    kind: "checklist",
    sections: [
      {
        title: "Training data registration",
        items: [
          "Every training and validation dataset is registered in the catalog with owner, snapshot date, and lineage to source systems.",
          "Training snapshots are immutable and reproducible: the exact dataset behind any production model version can be re-materialized.",
          "External and vendor-supplied data carries documented provenance and permitted-use terms.",
          "Dataset refresh cadence is stated, and retraining events reference the new snapshot ID.",
        ],
      },
      {
        title: "Quality expectations on model-critical elements",
        items: [
          "Model-critical input elements are identified and held to stated quality thresholds, measured before training and monitored in scoring.",
          "Known data limitations (coverage gaps, era effects, system-migration seams in history) are documented as reliance-and-limitation disclosures, ASOP 23-style.",
          "Missing-value and outlier treatment is documented per element, not left inside pipeline code.",
        ],
      },
      {
        title: "Protected and proxy attribute review",
        items: [
          "Features are screened for protected classes and plausible proxies (e.g., territory granularity, credit-adjacent variables) before shipping, with the screening record retained.",
          "Adverse-action-adjacent models document how each feature can be explained in a consumer-facing reason.",
          "Any feature rejected on proxy grounds is recorded with rationale — the negative record is exam evidence too.",
        ],
      },
      {
        title: "Vendor model data duties",
        items: [
          "Vendor models are held to the same registration bar: what data the vendor trained on (to the extent contractually obtainable), what data we send it, and what comes back.",
          "Data sent to vendor models passes sensitivity screening; NPPI/health content requires an approved purpose and contract clause.",
          "Vendor model changes (versions, retraining) trigger re-review of the data dependencies, not just performance.",
        ],
      },
      {
        title: "Documentation & exam readiness",
        items: [
          "Each in-scope model has a current model card covering data pedigree, judgments, and limitations in language a non-builder can read.",
          "The inventory, lineage, and evidence links can produce an AI-questionnaire response without new discovery work.",
          "Data-side findings from validation reviews carry owners and due dates in the same remediation loop as DQ breaches.",
        ],
      },
    ],
  },

  "model-data-lineage-method": {
    kind: "method",
    steps: [
      {
        name: "Prioritize by model risk tier",
        description:
          "Order the lineage effort by consequence: rating and adverse-action-adjacent models first, then claims outcome models, then advisory analytics. Do not attempt uniform depth across the whole model estate.",
        decisionRule: "Tier 1 (rating/adverse-action): column-level lineage required. Tier 3 (advisory): dataset-level lineage suffices.",
      },
      {
        name: "Map features to engineered sources",
        description:
          "For each production feature, document the feature-engineering transformation (aggregations, windows, encodings) from its immediate inputs, in the feature store or an equivalent registry — the transformation is part of the lineage, not an implementation detail.",
      },
      {
        name: "Trace inputs to source systems",
        description:
          "Connect each feature input through the data products and pipelines back to originating systems, reusing catalog lineage where it exists and documenting manual segments where it does not.",
        decisionRule: "A documented manual segment with an owner counts as lineage; an undocumented hop does not.",
      },
      {
        name: "Establish snapshot discipline",
        description:
          "Version training datasets and score-time feature values so any historical decision can be reconstructed: which model version, which feature values, from which data as of when.",
        decisionRule: "If a scored decision from 18 months ago cannot be reproduced to the feature-value level for a Tier 1 model, the snapshot discipline has failed — treat as a finding.",
      },
      {
        name: "Bind lineage to explainability answers",
        description:
          "For each Tier 1 model, pre-draft the answer to 'where does this feature come from and how good is that data' using the lineage plus quality telemetry — the exam answer is assembled before the exam.",
      },
      {
        name: "Maintain under change",
        description:
          "Re-verify lineage on feature changes, source migrations, and model retraining; lineage staleness is tracked as a metric per model.",
        decisionRule: "A Tier 1 model with lineage unverified for two retraining cycles is escalated to model risk.",
      },
    ],
  },

  "ai-use-case-risk-triage": {
    kind: "method",
    steps: [
      {
        name: "Intake with a structured form",
        description:
          "Every proposed AI use case enters through one intake form: purpose, decision affected, data consumed, autonomy level, consumer exposure, jurisdictions. No parallel doors.",
      },
      {
        name: "Score decision impact",
        description:
          "Rate what the model can do to a policyholder or claimant: rating and eligibility decisions, claim outcome or settlement influence, marketing targeting, internal productivity only.",
        decisionRule:
          "Impact HIGH if the output can change price, coverage, claim outcome, or trigger adverse action; MEDIUM if it prioritizes or routes human work on such decisions; LOW if internal-only.",
      },
      {
        name: "Score data sensitivity",
        description:
          "Rate the inputs: NPPI, health content, protected-class-adjacent attributes, external consumer data — versus operational or fully aggregated data.",
        decisionRule: "Any health content or protected-class-adjacent feature sets sensitivity HIGH regardless of volume.",
      },
      {
        name: "Score autonomy and reach",
        description:
          "Rate how directly outputs act: fully automated actions, human-approves-suggestion, advisory only — and the volume of decisions per period.",
        decisionRule: "Automated action without human review raises the tier one level from the impact score.",
      },
      {
        name: "Assign tier and governance track",
        description:
          "Combine scores into a tier: Tier 1 (full model-risk review, inventory entry, lineage to column level, bias testing, DOI-filing check), Tier 2 (inventory entry, data governance standard, annual review), Tier 3 (registration only, spot audits).",
        decisionRule:
          "Highest individual score sets the floor: any single HIGH means at least Tier 2; impact HIGH always means Tier 1.",
      },
      {
        name: "Route fast lanes honestly",
        description:
          "Tier 3 use cases get approval within days on registration alone — the visible speed that keeps high-stakes teams from routing around the process. Audit a sample of Tier 3 self-declarations each quarter.",
        decisionRule: "A Tier 3 use case found consuming sensitive data on audit is re-tiered and the intake gap fixed — not punished into hiding.",
      },
    ],
  },

  // ───────────────────────── VP-15 Privacy, Consent & DSAR Pack ─────────────────────────

  "privacy-obligation-matrix": {
    kind: "template",
    sections: [
      {
        title: "Obligation register",
        purpose:
          "One row per privacy regime in scope, stated the way counsel signed off on it — the matrix's authority column.",
        fields: [
          "Regime: GLBA privacy/safeguards, state consumer privacy statutes (with insurance/GLBA exemption analysis), NAIC Insurance Information and Privacy Protection Act states, HIPAA (where health lines apply), state insurance data security laws",
          "Applicability ruling per regime: applies / exempt / partially applies, with counsel sign-off date",
          "Consumer rights in scope: access, deletion, correction, opt-out",
        ],
      },
      {
        title: "Domain intersection grid",
        purpose:
          "The working core: obligations mapped onto insurance data domains and processing purposes, so a dataset's duties can be read off, not argued out.",
        fields: [
          "Rows: party, policy, claim, billing, employee-hr domains (by sensitivity class)",
          "Columns: processing purposes (underwriting, claims handling, marketing, analytics, compliance reporting)",
          "Cell content: handling duty + triggering classification labels + authorizing basis",
        ],
      },
      {
        title: "Retention vs. deletion resolution",
        purpose:
          "Where deletion rights meet statutory retention — decided once, in writing.",
        fields: [
          "Statutory retention schedule per record class (claim files, policy records, licensing records) with citations",
          "Deletion-request decision tree reference: open claim, litigation hold, statutory period running, then delete/anonymize",
          "Anonymization standard for records past retention but needed for analytics",
        ],
      },
      {
        title: "Classification triggers & propagation",
        purpose: "Bind the matrix to enforcement: labels, not memos, trigger duties.",
        fields: [
          "Label taxonomy: NPPI, health-content, biometric, minor's data, employee data",
          "Label-to-policy mapping: which access policies and handling rules each label activates",
          "Coverage metric: share of in-scope datasets carrying current labels",
        ],
      },
    ],
  },

  "consent-purpose-data-model": {
    kind: "glossary",
    note: "Core terms of the consent-and-purpose semantic model. Each term becomes a governed attribute, not a checkbox.",
    terms: [
      {
        term: "Processing purpose",
        definition:
          "The governed reason a data use is authorized, from a closed taxonomy: underwriting, claims handling, fraud investigation, marketing, analytics, compliance reporting, servicing. Every access policy and extract cites exactly one or more purposes.",
        domain: "reference-regulatory",
      },
      {
        term: "Authorizing basis",
        definition:
          "What legally authorizes a processing purpose for a data subject: contract necessity (policy administration, claims), legal obligation (statutory reporting, sanctions screening), consent (marketing beyond the relationship), or legitimate operations. Insurance processing mostly rests on the first two — the model records which, so consent flags are not overloaded.",
        domain: "reference-regulatory",
        note: "The most common modeling error is treating everything as consent-based; claims handling does not stop because a claimant never ticked a box.",
      },
      {
        term: "Consent record",
        definition:
          "An affirmative grant by a party for a specific purpose: party ID, purpose, scope, capture channel, capture timestamp, expiry or review date, and verbatim-source reference.",
        domain: "party",
      },
      {
        term: "Opt-out flag",
        definition:
          "A party-level restriction against a purpose (e.g., marketing, data sharing with affiliates/non-affiliates under GLBA), effective-dated, with the channel it arrived through. Propagates to every system reading the party product within the stated SLA.",
        domain: "party",
      },
      {
        term: "Restriction flag",
        definition:
          "A processing limitation narrower than opt-out: litigation hold, regulator inquiry freeze, sensitive-claim handling restriction, or a state-law limited-use requirement. Overrides purpose eligibility while active.",
        domain: "party",
      },
      {
        term: "Capture channel",
        definition:
          "Where a consent or preference originated: application form, portal, agent, call center (with call reference), paper. Determines evidentiary weight and dispute handling.",
        domain: "party",
      },
      {
        term: "Purpose eligibility",
        definition:
          "The computed answer to 'may this record be used for this purpose now' — derived from authorizing basis, consent records, opt-out and restriction flags. Systems read the computed flag; none re-derive it locally.",
        domain: "reference-regulatory",
        note: "This is the propagation contract: marketing suppression, analytics inclusion, and access decisions all read the same computation.",
      },
      {
        term: "Preference conflict",
        definition:
          "Two live signals disagree (opt-in via portal after an opt-out by phone). Resolution rule: most recent authenticated signal wins per purpose; conflicts are logged for steward review rather than silently overwritten.",
        domain: "party",
      },
    ],
  },

  "dsar-fulfillment-playbook": {
    kind: "method",
    steps: [
      {
        name: "Verify and resolve the requester",
        description:
          "Authenticate the requester per the verification standard, then resolve them through party resolution — the same individual may exist as insured, claimant, and beneficiary under different spellings, addresses, and system keys. The resolved party graph, not the request letter, defines the search scope.",
        decisionRule: "If resolution confidence is below the steward-review threshold, a steward confirms the identity cluster before any data is gathered — over-disclosure to a wrong match is the worst failure mode.",
      },
      {
        name: "Locate data by classification and catalog",
        description:
          "Query the catalog for every dataset carrying personal-data labels that references the resolved party IDs, including archives, extracts, and vendor-shared datasets — not system-by-system interviews.",
        decisionRule: "Systems outside catalog coverage go on an exception list reviewed by privacy operations; an empty exception list is the program's target state.",
      },
      {
        name: "Apply the right-versus-retention decision tree",
        description:
          "For deletion requests, walk each located record class through: open claim or active policy (retain — contract necessity), litigation hold (retain — legal), statutory retention period running (retain with citation), otherwise delete or anonymize per standard.",
        decisionRule: "Claims files are the classic retain: deletion rights yield to statutory claim-record retention and fraud-investigation needs — record the citation per record class, not a blanket 'insurance exemption'.",
      },
      {
        name: "Assemble the response",
        description:
          "Compile disclosures in consumer-readable form: categories held, purposes, sources, sharing, and the record extract where access was requested; for deletions, the action taken per record class with the retention basis where retained.",
      },
      {
        name: "Execute and verify deletions",
        description:
          "Perform approved deletions/anonymizations through governed jobs (not manual UI deletes), then verify by re-running the location query and confirming zero in-scope hits outside retained classes.",
      },
      {
        name: "Close with an evidence trail",
        description:
          "Store the request, identity verification, search scope, decision-tree outcomes, response, and verification results as one evidence package with timestamps against the statutory clock.",
        decisionRule: "Any request that cannot show its search scope came from the catalog is audited — 'we asked around' is not defensible completeness.",
      },
    ],
  },

  "purpose-based-access-standard": {
    kind: "checklist",
    sections: [
      {
        title: "Purpose modeling",
        items: [
          "Access purposes are drawn from the governed purpose taxonomy — no free-text purposes on access requests.",
          "Each purpose maps to a defined data slice: the columns, rows, and granularity that purpose legitimately needs (compensation analytics ≠ workforce planning ≠ compliance reporting).",
          "Purpose definitions are reviewed with privacy and the business owner annually and on regulation change.",
        ],
      },
      {
        title: "Policy derivation",
        items: [
          "Row- and column-level policies are derived from classification labels plus purpose — never hand-built per view or per requester.",
          "Direct identifiers default to masked/pseudonymized; unmasking requires a purpose that names it and a role authorized for it.",
          "Policy changes deploy through the governance-as-code pipeline with review, not through console edits.",
        ],
      },
      {
        title: "Exception path",
        items: [
          "Exceptions carry a named approver, a stated purpose, and a hard expiry — no standing exceptions.",
          "Expired exceptions revoke automatically; renewal requires re-justification, not a ticket comment.",
          "Exception volume per dataset is reported monthly; a dataset living on exceptions gets its purpose model fixed.",
        ],
      },
      {
        title: "Decision log & replay",
        items: [
          "Every grant, denial, and exception is logged with the policy version that produced it.",
          "Any historical access decision can be replayed: who could see what, under which policy, on a given date.",
          "The decision log is queryable by privacy and audit without engineering help.",
        ],
      },
      {
        title: "Retirement of the old pattern",
        items: [
          "Per-view provisioning is frozen: no new bespoke views once a purpose-based policy covers the dataset.",
          "Existing bespoke views are inventoried and scheduled for retirement (see duplicate-view retirement playbook).",
          "Hand-copied extracts are treated as policy violations once a governed access path exists for the purpose.",
        ],
      },
    ],
  },

  // ───────────────────────── VP-16 Party & Master Data Resolution Pack ─────────────────────────

  "party-resolution-playbook": {
    kind: "method",
    steps: [
      {
        name: "Profile and normalize sources",
        description:
          "Profile every contributing system's party data: name formats, address quality, identifier availability (TINs are scarce, license numbers partial), and role context. Normalize names, addresses (postal standardization), and dates before any matching.",
      },
      {
        name: "Generate candidates cheaply",
        description:
          "Block on stable keys — normalized surname + DOB, address cluster, policy/claim linkage, phone/email — to produce candidate pairs without comparing everyone to everyone.",
        decisionRule: "Blocking must be recall-safe: measure missed-match rate on a labeled sample before trusting any blocking scheme.",
      },
      {
        name: "Score with deterministic rules first",
        description:
          "Apply deterministic matches where they exist: same TIN, same license number (producers), policy-claimant linkage (the claimant on a policy's claim is linked to that policy's party context). Deterministic matches auto-link.",
        decisionRule: "A deterministic rule that ever produces a false positive is demoted to probabilistic — determinism is earned, not declared.",
      },
      {
        name: "Score probabilistically with insurance-aware features",
        description:
          "Score remaining candidates on weighted features: name similarity with nickname and transliteration handling, marriage-driven surname change patterns, address churn across policy terms, household disambiguation (same name, same address, different DOB), and commercial DBA/legal-name/subsidiary resolution.",
        decisionRule:
          "Three bands by score: auto-link above the high threshold, steward review in the middle band, auto-reject below. Thresholds are tuned per segment (personal vs. commercial) against a labeled sample.",
      },
      {
        name: "Route borderline matches to steward review",
        description:
          "Middle-band pairs queue for steward decision with the evidence displayed: matching features, conflicting features, roles involved, and the financial/claims context. Steward decisions feed back as labeled training data.",
        decisionRule: "In claims contexts, bias toward NOT merging: a false merge corrupts claim history and payment records; a missed match is recoverable.",
      },
      {
        name: "Apply survivorship to build the golden record",
        description:
          "Construct the golden record attribute-by-attribute using survivorship rules: most recent verified value for contact points, most authoritative source per attribute (licensing system for license data, claims for claimant contact), full history retained.",
      },
      {
        name: "Handle false merges as incidents",
        description:
          "Maintain an unmerge path that restores pre-merge lineage and re-points downstream references; treat every false merge as an incident with rule-tuning follow-up, not a quiet fix.",
        decisionRule: "Unmerge must be possible for any merge, indefinitely — if a merge cannot be reversed, it should not have been automatic.",
      },
    ],
  },

  "party-match-rule-library": {
    kind: "dq-rules",
    note: "Starter match-rule set for insurance party resolution. Precision/recall guidance assumes tuning against a labeled sample per book.",
    rules: [
      {
        id: "match-tin-exact",
        name: "Deterministic: exact TIN match",
        expression: "normalize(tin_a) = normalize(tin_b) AND tin_type_a = tin_type_b -> AUTO_LINK",
        severity: "critical",
        rationale:
          "Where tax identifiers exist, an exact match is near-conclusive for the same legal person/entity. Guard: exclude known placeholder TINs (all-zeros, sequential test values) which otherwise create mega-merges.",
      },
      {
        id: "match-producer-license",
        name: "Deterministic: producer license/NPN match",
        expression: "npn_a = npn_b OR (license_state_a = license_state_b AND license_no_a = license_no_b) -> AUTO_LINK",
        severity: "critical",
        rationale: "National Producer Numbers are unique per producer; the reliable spine for distribution-party resolution.",
      },
      {
        id: "match-policy-claimant-context",
        name: "Deterministic context: claimant on own policy",
        expression:
          "claim.policy_number = policy.policy_number AND name_similarity(claimant, insured) >= 0.95 -> AUTO_LINK(role: insured+claimant)",
        severity: "critical",
        rationale:
          "First-party claims link claimant and insured through the policy key itself — the highest-value cross-system join in personal lines.",
      },
      {
        id: "match-name-dob-address",
        name: "Probabilistic: name + DOB + address cluster",
        expression:
          "score = 0.4*name_sim + 0.35*dob_match + 0.25*address_cluster_match; score >= 0.92 -> AUTO_LINK; 0.75-0.92 -> REVIEW",
        severity: "serious",
        rationale:
          "The workhorse person rule. name_sim must use nickname tables (Bill/William) and transliteration; DOB exact-match dominates because names and addresses churn but birthdates do not.",
      },
      {
        id: "match-surname-change",
        name: "Probabilistic: surname change with stable identifiers",
        expression:
          "given_name_sim >= 0.9 AND dob_match AND (shared_address_history OR shared_policy_history) AND surname_differs -> REVIEW",
        severity: "serious",
        rationale:
          "Marriage/divorce surname changes across policy terms are a top missed-match cause in personal lines; never auto-link on it, always queue with the address/policy history shown.",
      },
      {
        id: "match-household-disambiguation",
        name: "Guard: same name, same address, different person",
        expression:
          "name_sim >= 0.95 AND same_address AND (dob_differs OR suffix_differs(Jr/Sr/III)) -> BLOCK_MERGE + REVIEW",
        severity: "critical",
        rationale:
          "Father and son at one address is the classic false-merge generator; a merge here mixes claim and credit-relevant histories of two people. DOB or suffix difference vetoes the merge regardless of score.",
      },
      {
        id: "match-commercial-name-resolution",
        name: "Probabilistic: commercial DBA / legal-name resolution",
        expression:
          "legalname_sim(normalized: strip suffixes LLC/Inc/Corp, expand &) >= 0.88 AND (same_fein OR same_address OR shared_officer) -> REVIEW; same_fein alone -> AUTO_LINK",
        severity: "serious",
        rationale:
          "Commercial parties surface as DBAs, legal names, and subsidiaries; FEIN is decisive where held, otherwise name normalization plus a corroborating signal queues for steward judgment with the hierarchy in view.",
      },
      {
        id: "match-address-churn-window",
        name: "Probabilistic: address churn tolerance",
        expression:
          "name_sim >= 0.93 AND dob_match AND address_differs AND term_gap <= 24 months -> REVIEW (show address timeline)",
        severity: "warning",
        rationale:
          "Policyholders move between terms; a strict same-address requirement suppresses recall. The 24-month window bounds the churn assumption; the steward sees the address timeline to confirm.",
      },
    ],
  },

  "party-hierarchy-template": {
    kind: "template",
    sections: [
      {
        title: "Household structure (personal lines)",
        purpose:
          "Model the household as an effective-dated grouping of resolved persons — built for splits, re-formations, and multi-generation addresses, not a static address rollup.",
        fields: [
          "household_id, formation_date, dissolution_date",
          "Membership: party_id, role_in_household (named insured, spouse/partner, dependent, other resident), effective from/to",
          "Split handling: divorce/dissolution creates successor households; policies and claims keep their historical household linkage",
          "Address-only cohabitants excluded rule (roommates ≠ household unless jointly insured)",
        ],
      },
      {
        title: "Commercial ownership tree",
        purpose:
          "Ownership and control hierarchy for account-level underwriting and exposure aggregation.",
        fields: [
          "org_party_id, parent_org_party_id, ownership_pct, control_flag, effective from/to",
          "Legal name, DBAs, FEIN per node; domicile jurisdiction",
          "Ultimate-parent computation rule and as-of-date queries",
          "Aggregation views: total insured value and limits by ultimate parent (accumulation control)",
        ],
      },
      {
        title: "Agency / producer structure",
        purpose:
          "Distribution hierarchy for production rollup and compensation, effective-dated because books move.",
        fields: [
          "producer_id -> branch -> agency -> parent organization, effective from/to",
          "Book-of-business transfer records: which node inherits production history on moves/mergers",
          "Appointment relationships per carrier and state",
        ],
      },
      {
        title: "Hierarchy governance",
        purpose: "Keep the one governed hierarchy the one everyone reads.",
        fields: [
          "Named steward per hierarchy type; change-request path with impact preview",
          "As-of-date query contract: every consumer must state the as-of date (reconciliation and exposure aggregation depend on it)",
          "Quality gates: no cycles, no orphan nodes, effective-date continuity, ultimate-parent computable for every node",
        ],
      },
    ],
  },

  "sanctions-screening-data-readiness": {
    kind: "dq-rules",
    note: "The party-data prerequisites that determine whether OFAC/sanctions screening can actually work. Run these before blaming the screening engine.",
    rules: [
      {
        id: "screen-name-completeness",
        name: "Name-field completeness and structure",
        expression:
          "completeness(full_name) = 100% AND parsed(given, surname) OR flagged(single-token/organization) for all screenable parties",
        severity: "critical",
        rationale:
          "Screening engines match on names; blank, single-character, or 'UNKNOWN' names silently pass. Structure (person vs. organization parsing) drives which matching algorithm applies.",
      },
      {
        id: "screen-name-normalization",
        name: "Name normalization applied pre-screening",
        expression:
          "screening input = normalized(name): trimmed, casefolded, diacritics preserved-and-folded variants both submitted, titles/suffixes stripped",
        severity: "serious",
        rationale:
          "SDN list matching degrades sharply on unnormalized input; submitting both diacritic-preserved and folded forms closes the transliteration gap.",
      },
      {
        id: "screen-dob-capture",
        name: "Date-of-birth capture for persons",
        expression: "completeness(dob) >= 95% for person parties in payee/beneficiary roles; placeholder DOBs (1900-01-01) counted as missing",
        severity: "serious",
        rationale:
          "DOB is the primary disambiguator between a true SDN hit and a common-name false positive; missing DOBs turn screening into an alert flood that gets tuned into blindness.",
      },
      {
        id: "screen-role-coverage",
        name: "Screening coverage across all party roles",
        expression:
          "screened_roles ⊇ {insured, claimant, payee, beneficiary, premium payer, third-party vendor}; coverage(payee ∪ beneficiary) = 100%",
        severity: "critical",
        rationale:
          "The classic gap: insureds screened at issuance while claim payees and beneficiaries — where money actually leaves — are never screened. Payment-time roles are the non-negotiable set.",
      },
      {
        id: "screen-resolution-linkage",
        name: "Resolved-party linkage before screening",
        expression: "every screenable record carries golden_party_id; alias set of the golden record submitted together",
        severity: "serious",
        rationale:
          "One sanctioned identity split across three unmatched records defeats screening; resolution linkage lets one hit propagate holds to every role and account of the same party.",
      },
      {
        id: "screen-address-country",
        name: "Address and country completeness",
        expression: "completeness(country) = 100%, completeness(structured address) >= 90% for screenable parties",
        severity: "serious",
        rationale: "Country enables comprehensive-sanctions program checks (not just list matching); structured addresses cut false positives on common names.",
      },
      {
        id: "screen-rescreen-trigger",
        name: "Re-screening on data change",
        expression: "name/address/beneficiary change on any party -> re-screen within 24h; list update -> full portfolio re-screen per program SLA",
        severity: "critical",
        rationale:
          "Screening once at onboarding is not a control; the beneficiary added by endorsement last month is exactly who the list update was about.",
      },
    ],
  },

  // ───────────────────────── VP-17 Insurance Reference Data Pack ─────────────────────────

  "iso-code-sets": {
    kind: "reference-data",
    sets: [
      {
        name: "NAIC Annual Statement Lines of Business (P&C) — starter sample",
        codes: [
          { code: "1", label: "Fire" },
          { code: "2", label: "Allied lines" },
          { code: "4", label: "Homeowners multiple peril" },
          { code: "5", label: "Commercial multiple peril", note: "Reported split: non-liability (5.1) and liability (5.2) portions" },
          { code: "9", label: "Inland marine" },
          { code: "11", label: "Medical professional liability" },
          { code: "16", label: "Workers' compensation" },
          { code: "17", label: "Other liability", note: "Occurrence and claims-made reported separately" },
          { code: "18", label: "Products liability" },
          { code: "19", label: "Private passenger auto liability", note: "Commercial auto liability reported on its own sublines" },
          { code: "21", label: "Auto physical damage" },
          { code: "24", label: "Surety" },
        ],
      },
      {
        name: "General liability class codes (ISO-style) — starter sample",
        codes: [
          { code: "91340", label: "Carpentry — interior" },
          { code: "91342", label: "Carpentry — shop only" },
          { code: "91580", label: "Contractors — executive supervisors or executive superintendents" },
          { code: "92478", label: "Electrical work — within buildings" },
          { code: "98305", label: "Painting — exterior — buildings or structures" },
          { code: "98482", label: "Plumbing — residential or domestic" },
          { code: "98483", label: "Plumbing — commercial and industrial" },
        ],
      },
      {
        name: "NCCI workers' compensation class codes — starter sample",
        codes: [
          { code: "5403", label: "Carpentry — NOC" },
          { code: "5645", label: "Carpentry — detached one- or two-family dwellings" },
          { code: "5183", label: "Plumbing NOC & drivers" },
          { code: "5190", label: "Electrical wiring — within buildings & drivers" },
          { code: "7219", label: "Trucking NOC — all employees & drivers" },
          { code: "8017", label: "Store — retail NOC" },
          { code: "8742", label: "Salespersons or collectors — outside" },
          { code: "8810", label: "Clerical office employees NOC" },
          { code: "9082", label: "Restaurant NOC" },
        ],
      },
    ],
  },

  "cause-of-loss-codes": {
    kind: "reference-data",
    sets: [
      {
        name: "Peril family codes (governed taxonomy, level 1) — starter sample",
        codes: [
          { code: "FIRE", label: "Fire and smoke" },
          { code: "WIND", label: "Windstorm and hail", note: "Includes hurricane, tornado, straight-line wind; hail split at level 2" },
          { code: "WATR", label: "Water damage", note: "Weather vs. non-weather split at level 2 — the wind-vs-water boundary drives cat allocation and flood exclusions" },
          { code: "THFT", label: "Theft and burglary" },
          { code: "VMM", label: "Vandalism and malicious mischief" },
          { code: "COLL", label: "Collision (auto)" },
          { code: "COMP", label: "Comprehensive / other-than-collision (auto)" },
          { code: "LIAB", label: "Liability — bodily injury / property damage" },
          { code: "CAT-EQ", label: "Earthquake" },
          { code: "FRZE", label: "Freezing of plumbing/HVAC systems" },
        ],
      },
      {
        name: "Water-loss sub-causes (level 2 under WATR) — starter sample",
        codes: [
          { code: "WATR-WD", label: "Wind-driven rain through storm-created opening", note: "Wind peril for cat association; the hurricane adjudication line" },
          { code: "WATR-SURF", label: "Surface water / flood", note: "Typically excluded under HO; NFIP or flood policy peril" },
          { code: "WATR-PLMB", label: "Sudden plumbing discharge (non-weather)" },
          { code: "WATR-SEEP", label: "Long-term seepage or leakage", note: "Maintenance exclusion territory; coding it as sudden discharge is the classic miscode" },
          { code: "WATR-SEW", label: "Sewer or drain backup", note: "Endorsement-dependent coverage" },
          { code: "WATR-ICE", label: "Ice dam / roof melt intrusion" },
        ],
      },
      {
        name: "Catastrophe association codes — starter sample",
        codes: [
          { code: "CAT-PCS", label: "PCS-designated catastrophe event", note: "Carry the PCS serial number on the claim for industry alignment" },
          { code: "CAT-INT", label: "Internally declared event (below industry threshold)" },
          { code: "CAT-NONE", label: "Not catastrophe-associated" },
          { code: "CAT-PEND", label: "Association pending event window closure", note: "Must resolve to a terminal code before quarter close" },
        ],
      },
    ],
  },

  "jurisdiction-codes": {
    kind: "reference-data",
    sets: [
      {
        name: "US state / jurisdiction codes (USPS + NAIC state code) — starter sample",
        codes: [
          { code: "AL / 01", label: "Alabama" },
          { code: "AK / 02", label: "Alaska" },
          { code: "AZ / 03", label: "Arizona" },
          { code: "AR / 04", label: "Arkansas" },
          { code: "CA / 05", label: "California" },
          { code: "CO / 06", label: "Colorado" },
          { code: "CT / 07", label: "Connecticut" },
          { code: "FL / 10", label: "Florida" },
          { code: "NY / 32", label: "New York", note: "NAIC state codes run alphabetically; verify against the current NAIC listing before filing use" },
          { code: "TX / 43", label: "Texas" },
        ],
      },
      {
        name: "US territories and non-state jurisdictions — starter sample",
        codes: [
          { code: "DC", label: "District of Columbia" },
          { code: "PR", label: "Puerto Rico" },
          { code: "VI", label: "U.S. Virgin Islands" },
          { code: "GU", label: "Guam" },
          { code: "AS", label: "American Samoa" },
        ],
      },
      {
        name: "Jurisdiction assignment rules (which jurisdiction applies)",
        codes: [
          { code: "RISK-LOC", label: "Risk location state", note: "Property placement, most premium tax, statutory state pages" },
          { code: "ISSUE-ST", label: "Policy issuance state", note: "Form/rate filing compliance for the issuing state" },
          { code: "CLAIM-VEN", label: "Claim venue jurisdiction", note: "Claims-handling and litigation rules; differs from risk location for mobile exposures" },
          { code: "SL-HOME", label: "Surplus lines home state", note: "NRRA: the insured's home state alone taxes and regulates the surplus lines placement" },
          { code: "EMP-ST", label: "Employment state", note: "Workers' compensation extraterritorial rules" },
        ],
      },
      {
        name: "Country codes (ISO 3166-1 alpha-2) — starter sample",
        codes: [
          { code: "US", label: "United States" },
          { code: "CA", label: "Canada" },
          { code: "GB", label: "United Kingdom" },
          { code: "BM", label: "Bermuda", note: "Major reinsurance domicile" },
          { code: "DE", label: "Germany" },
          { code: "JP", label: "Japan" },
        ],
      },
    ],
  },

  "lloyds-risk-codes": {
    kind: "reference-data",
    sets: [
      {
        name: "Lloyd's risk codes — starter sample",
        codes: [
          { code: "CY", label: "Cyber security data and privacy breach", note: "Non-physical-damage cyber" },
          { code: "CZ", label: "Cyber security property damage", note: "Cyber with resultant physical damage" },
          { code: "TO", label: "Terrorism", note: "Standalone terrorism business" },
          { code: "B", label: "Livestock and bloodstock" },
          { code: "AG", label: "Agriculture and hail", note: "Crop/agriculture business" },
          { code: "W", label: "War (marine)", note: "Marine war risks" },
        ],
      },
      {
        name: "Structural dimensions for London-market reporting",
        codes: [
          { code: "YOA", label: "Year of account", note: "The underwriting year the risk attaches to; every bordereau row and syndicate return carries it" },
          { code: "UMR", label: "Unique Market Reference", note: "Contract identifier format B[broker number][reference]; joins slip, bordereaux, and settlement data" },
          { code: "COB", label: "Class of business grouping", note: "Internal grouping (property, casualty, marine, energy, aviation, specialty, reinsurance) crosswalked to risk codes" },
          { code: "SYND", label: "Syndicate number", note: "Reporting entity for returns and coming-into-line" },
        ],
      },
    ],
  },

  "reference-data-stewardship-workflow": {
    kind: "method",
    steps: [
      {
        name: "Assign ownership per code set",
        description:
          "Every governed code set gets a named reference data steward and an authority statement: which external body (ISO, NAIC, NCCI, Lloyd's, internal) is the source of truth and on what cadence it changes.",
        decisionRule: "A code set nobody owns is not governed — it is a copy waiting to diverge.",
      },
      {
        name: "Version every set",
        description:
          "Publish code sets as immutable versions (e.g., naic-asl-codes@2026.1) with effective dates, additions, deprecations, and label changes explicit in the version diff. Consumers pin or float-with-notice; nothing reads 'latest' silently.",
      },
      {
        name: "Run changes through impact analysis",
        description:
          "A change request lists the delta; the catalog answers who consumes the set — pipelines, DQ rules, crosswalks, reports. Impacted owners get notice with the diff and the activation date before approval.",
        decisionRule: "A change touching a statutory-reporting consumer requires that consumer's acknowledgment, not just notification.",
      },
      {
        name: "Propagate through the pipeline, not email",
        description:
          "Approved versions publish through the governance-as-code pipeline to every registered consumption point — DQ engines, semantic layer, warehouse reference schemas. Emailed spreadsheets are retired as a distribution channel.",
      },
      {
        name: "Monitor consumption telemetry",
        description:
          "Track which systems read which version. Deprecated-version consumers surface on a dashboard with the deprecation clock; unregistered copies found by scanning become onboarding candidates or retirement targets.",
        decisionRule: "A consumer still on a deprecated version at end-of-support becomes a routed breach to its owner — visible, not latent.",
      },
      {
        name: "Reconcile against the external authority",
        description:
          "On the authority's publication cycle, diff the governed set against the source (new ISO codes, NAIC changes, annual Lloyd's risk code list) and open change requests for the deltas — the steward's calendar, not an annual surprise.",
      },
    ],
  },

  // ───────────────────────── VP-18 Data Marketplace & Certification Pack ─────────────────────────

  "certification-tier-standard": {
    kind: "checklist",
    sections: [
      {
        title: "Bronze — listed and honest",
        items: [
          "Registered in the catalog with named owner, steward, and description a consumer can evaluate.",
          "Schema documented; refresh cadence and known limitations stated on the listing.",
          "Sensitivity classification complete; access path defined (even if manual).",
          "A contactable steward answers consumer questions within the stated SLA.",
        ],
      },
      {
        title: "Silver — controlled and measured",
        items: [
          "All Bronze criteria, verified from telemetry rather than self-declaration.",
          "CDEs identified with executing quality controls; pass rates published on the listing.",
          "Source feeds under data contract; breach routing live with visible breach-aging.",
          "Dataset-level lineage to source systems established; manual segments documented with owners.",
          "Maturity index score at or above the Silver threshold, refreshed automatically.",
        ],
      },
      {
        title: "Gold — certified for filed and high-stakes use",
        items: [
          "All Silver criteria, plus semantic certification: measures bound to certified glossary definitions, one definition per metric.",
          "Column-level lineage for elements feeding filed or regulator-visible numbers.",
          "Purpose-based access policies enforced; decision log replayable for audit.",
          "Reconciliation controls to authoritative anchors (GL, statutory lines) where financial data is carried.",
          "Consumer evidence: at least one production consumer through a full cycle without an unresolved critical breach.",
        ],
      },
      {
        title: "Expiry and demotion — what keeps the badge honest",
        items: [
          "Certification auto-expires without re-evidence: Gold quarterly, Silver semi-annually, Bronze annually.",
          "Sustained control failure (critical breach unresolved past SLA) demotes the tier automatically; the listing shows the demotion and reason.",
          "Tier changes are events consumers subscribe to — a demotion notifies every downstream consumer, not just the owner.",
          "No grandfathering: threshold changes re-evaluate the whole portfolio on the next cycle.",
        ],
      },
    ],
  },

  "certification-checklist-template": {
    kind: "template",
    sections: [
      {
        title: "Product identity & scope",
        purpose: "What this product is, who answers for it, and what it does not cover.",
        fields: [
          "Product name, marketplace listing ID, target certification tier",
          "Owner, steward(s), SLA commitments",
          "Scope statement and explicit exclusions",
        ],
      },
      {
        title: "Maturity & telemetry snapshot",
        purpose: "The auto-populated evidence core — scores, not narratives.",
        fields: [
          "Current maturity index score with dimension breakdown (link)",
          "Control pass rates, breach counts and aging, delivery punctuality (trailing 90 days)",
          "Consumption telemetry: active consumers, query volume trend",
        ],
      },
      {
        title: "CDE register & controls",
        purpose: "The named elements and the controls executing on them.",
        fields: [
          "CDE list with quality dimensions and thresholds",
          "Control-to-CDE mapping with rule IDs and last-run evidence",
          "Open remediation items with owners and due dates",
        ],
      },
      {
        title: "Lineage coverage statement",
        purpose: "How far lineage reaches, and where it is manual — stated plainly.",
        fields: [
          "Lineage depth achieved (dataset/column) per source path",
          "Documented manual segments with owners",
          "Filed-number paths and their lineage evidence links",
        ],
      },
      {
        title: "Semantic bindings",
        purpose: "Which measures carry certified meanings.",
        fields: [
          "Measure-to-glossary bindings with definition versions",
          "Known divergences from legacy reports and their reconciliation notes",
        ],
      },
      {
        title: "Access & sensitivity posture",
        purpose: "Who can see what, on what basis.",
        fields: [
          "Classification labels present; sensitivity map",
          "Purpose-based policies in force; exception count and expiry status",
          "DSAR/audit support: decision-log replay availability",
        ],
      },
      {
        title: "Known limitations (steward-written)",
        purpose:
          "The judgment section: what a consumer should know before relying on this product — the honesty that keeps trust after the first incident.",
        fields: [
          "Data limitations and era effects (migrations, coding changes)",
          "Fitness boundaries: uses this product does and does not support",
          "Steward attestation with date",
        ],
      },
    ],
  },

  "duplicate-view-retirement-playbook": {
    kind: "method",
    steps: [
      {
        name: "Inventory the duplicates",
        description:
          "Find the shadow estate: catalog scans for near-duplicate schemas, warehouse query-log analysis for views reading the same sources as the governed product, and BI-layer extract audits. Record owner, consumers, refresh mechanism, and last-used date for each.",
      },
      {
        name: "Rank by risk, not convenience",
        description:
          "Order retirement by exposure: sensitive-data copies first (NPPI/health content outside purpose-based control), then filed-number feeders, then high-consumption analytics views, then dormant copies.",
        decisionRule: "A dormant view containing sensitive data outranks an active view containing none — the audit finding is the copy's existence, not its traffic.",
      },
      {
        name: "Negotiate the gap list per view",
        description:
          "Every duplicate exists for a reason. Sit with the owner and enumerate what the view provides that the governed product does not — columns, grain, latency, filters. The gap list becomes product backlog or a documented fitness boundary; the owner becomes a consumer, not a casualty.",
        decisionRule: "If the governed product cannot serve a legitimate gap within an agreed window, the view stays with an expiry and the product roadmap carries the gap — silent coexistence is the failure mode.",
      },
      {
        name: "Migrate consumers with side-by-side reconciliation",
        description:
          "Repoint each consumer to the governed product with a reconciliation period: both paths produce the numbers, differences are explained (often the governed definition is the change), sign-off recorded per consumer.",
      },
      {
        name: "Retire with proof",
        description:
          "Freeze writes, revoke access, archive per retention policy, and record the retirement: view identity, consumers migrated, reconciliation evidence, access-removal confirmation. This record is the audit answer to 'where else does this data live'.",
      },
      {
        name: "Prevent regrowth",
        description:
          "Feed retirement telemetry to the marketplace metrics (retired vs. discovered), and alert on new near-duplicate schemas appearing in scanned zones — the shadow estate regrows wherever the governed product stops serving needs.",
        decisionRule: "A new duplicate of a certified product triggers a product-gap review before an enforcement conversation.",
      },
    ],
  },

  "marketplace-adoption-metrics": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Certified product count by tier",
        definition:
          "Number of marketplace listings holding current (unexpired) certification, broken out Bronze/Silver/Gold. Expired or demoted certifications drop out on the day of the event.",
        formula: "count(listings where certification_status = current) group by tier",
        target: "Portfolio plan per wave; trend up with zero net Gold demotions per quarter",
      },
      {
        name: "Certified consumption share",
        definition:
          "Share of analytical consumption flowing through certified products, measured from warehouse query logs and BI telemetry — the honest metric: a marketplace nobody queries is shelfware with badges.",
        formula: "queries_touching_certified_products / total_analytical_queries (weighted by query count; report compute-weighted variant alongside)",
        target: ">= 60% by end of scale-out year 2; never reported without the denominator",
      },
      {
        name: "Duplicate views retired vs. discovered",
        definition:
          "Cumulative shadow views retired with proof, against the running count discovered by scanning — the pair shows whether the estate is shrinking or the flashlight just got better.",
        formula: "retired_views_cumulative and discovered_views_cumulative, plotted together; net = discovered - retired",
        target: "Net trending down two consecutive quarters; sensitive-data copies at zero known outstanding",
      },
      {
        name: "Time from listing to first consumer",
        definition:
          "Median days between a product's marketplace listing and its first sustained production consumer (excluding the producing team) — measures whether the marketplace matches supply to real demand.",
        formula: "median(first_sustained_consumption_date - listing_date) over trailing two quarters",
        target: "< 30 days median; investigate any listing unconsumed at 90 days for demand or fitness failure",
      },
      {
        name: "Certification evidence freshness",
        definition:
          "Share of certified listings whose telemetry-backed evidence is within its tier's refresh window — the guard against badge rot.",
        formula: "listings_with_current_evidence / certified_listings",
        target: "100%; anything less auto-demotes on the next cycle",
      },
    ],
  },

  // ───────────────────────── VP-19 M&A / Book-Transfer Due Diligence Pack ─────────────────────────

  "ma-data-due-diligence-toolkit": {
    kind: "checklist",
    sections: [
      {
        title: "Data landscape & system inventory",
        items: [
          "Inventory every system holding policy, claims, billing, party, and financial data — including retired systems still holding statutory history and the spreadsheets that bridge them.",
          "Map which systems are contracted for transition services vs. cut off at close; identify data that exists only in a system the seller keeps.",
          "Assess reference-code divergence: line/class code schemes, transaction types, cause-of-loss codes vs. your own — the crosswalk effort is a timeline driver.",
          "Identify third-party dependencies: TPAs, MGAs, coverholders, and their feed formats and contract terms on data return.",
        ],
      },
      {
        title: "Loss history & reserve data integrity",
        items: [
          "Sample claims end-to-end: does transaction history reconstruct paid and incurred development, or only current balances survive? Balances-only history cannot support reserving.",
          "Verify accident-year and report-year assignments are populated and consistent — Schedule P continuity depends on them.",
          "Test whether historical case-reserve changes are dated transactions or overwritten fields; overwritten reserves mean development history is unrecoverable.",
          "Reconcile the target's claim data to their filed Schedule P for two prior years; unexplained gaps are a pricing conversation, not a post-close surprise.",
        ],
      },
      {
        title: "Policy & premium record completeness",
        items: [
          "Reconcile in-force counts and written premium by line and state to the target's statutory filings.",
          "Sample policy records for reconstructability: can coverage, limits, endorsement history, and rating basis be reproduced for an in-force policy?",
          "Verify effective/expiration date integrity and transaction sequencing on a sample; broken sequences predict conversion cost.",
        ],
      },
      {
        title: "Party, sensitive data & privacy posture",
        items: [
          "Assess party data quality: duplicate rates, identifier completeness — a mostly-unresolved party estate adds a resolution project to the integration.",
          "Inventory sensitive data locations (NPPI, health content) and compare the target's classification and access posture to your obligations; the gap is remediation scope.",
          "Review the target's consent/opt-out records and outstanding privacy requests: obligations transfer with the data.",
          "Check cross-border data locations and any contractual data-use restrictions that survive the transaction.",
        ],
      },
      {
        title: "Data-debt estimation for the deal model",
        items: [
          "Convert findings into remediation effort classes: crosswalk build, history reconstruction, party resolution, sensitive-data remediation, contract renegotiation.",
          "State which debts block Day-1 operations vs. degrade analytics vs. carry regulatory exposure — three different discount conversations.",
          "Deliver a data-debt schedule to the deal team with effort ranges and the integration-timeline dependencies, before price is set.",
        ],
      },
    ],
  },

  "book-transfer-mapping-playbook": {
    kind: "method",
    steps: [
      {
        name: "Reconcile semantics before fields",
        description:
          "Before any field mapping, reconcile meanings: the target's 'earned premium', coverage structures, transaction types, and status codes against your certified definitions. Every divergence gets a documented decision — adopt, translate, or carry both with lineage.",
        decisionRule: "No field mapping starts on an entity whose core measures are semantically unreconciled — mapped fields with unmapped meanings is how conversions pass testing and fail reconciliation.",
      },
      {
        name: "Build code-set crosswalks as governed artifacts",
        description:
          "Create versioned crosswalks (their class/line/cause codes to yours) through the reference data pack, with unmapped-code handling rules and steward sign-off — not a spreadsheet in the conversion folder.",
        decisionRule: "Every source code maps to exactly one target code or an explicit 'hold' bucket with an owner; silent many-to-one collapses are recorded and approved, because they are irreversible.",
      },
      {
        name: "Design transaction-history conversion",
        description:
          "Convert transactions, not balances: preserve dated premium and loss transactions so development history, accident-year assignment, and Schedule P continuity survive. Where source history is balance-only, document the reconstruction method and its limits.",
        decisionRule: "Open statutory years require transaction-level history; older closed years may convert as opening balances with the cut documented as an era boundary.",
      },
      {
        name: "Handle in-flight claims explicitly",
        description:
          "Define cutover rules for open claims: reserve positions carried at conversion date, payment continuity across systems, adjuster notes and litigation-hold preservation, and the claim-number crosswalk that keeps the file findable under both identities.",
      },
      {
        name: "Run parallel with designed reconciliation",
        description:
          "Operate source and target in parallel for defined cycles, running the conversion DQ rule library: counts, financial balances by cohort, orphan checks, code-mapping validity. Differences are dispositioned — conversion defect, semantic decision, or source defect — never waved through.",
        decisionRule: "Cutover sign-off requires all critical reconciliation rules green for the agreed consecutive cycles, with every accepted difference documented and owned.",
      },
      {
        name: "Cut over with an era boundary record",
        description:
          "At cutover, record the era boundary: conversion date, crosswalk versions, accepted differences, and reconstruction limitations — the metadata that lets actuaries and auditors interpret pre-conversion history correctly for the next decade.",
      },
    ],
  },

  "conversion-dq-rule-library": {
    kind: "dq-rules",
    note: "Runs during parallel-run and again post-cutover as regression evidence. Cohort = line of business x state x accident year unless stated.",
    rules: [
      {
        id: "conv-record-count-cohort",
        name: "Record-count reconciliation by cohort",
        expression: "count(target.policies) = count(source.policies) per cohort; same for claims, transactions; variance = 0",
        severity: "critical",
        rationale: "The floor: every record accounted for, in the right cohort — count matches at total level can hide cohort-level misassignment.",
      },
      {
        id: "conv-financial-balance",
        name: "Financial balance tie-out by cohort",
        expression:
          "sum(written_premium), sum(paid_loss), sum(case_reserves) : target = source per cohort within 0.01% or explained-difference register",
        severity: "critical",
        rationale:
          "Premium and loss totals must tie source-to-target before anyone trusts the converted book; unexplained financial drift at conversion becomes a restatement risk after it.",
      },
      {
        id: "conv-orphan-claims",
        name: "Orphan detection: claims without policies",
        expression: "count(claims where policy_number not in target.policy_master) = 0",
        severity: "critical",
        rationale: "Conversion sequencing errors strand claims; an orphaned open claim is unpayable and unreportable.",
      },
      {
        id: "conv-orphan-transactions",
        name: "Orphan detection: transactions without parents",
        expression: "count(transactions where parent_entity_id unresolved) = 0 for premium and loss transactions",
        severity: "critical",
        rationale: "Parentless transactions corrupt both balances and development history silently.",
      },
      {
        id: "conv-code-mapping-validity",
        name: "Code mapping validity against crosswalks",
        expression:
          "every mapped code value ∈ crosswalk@pinned_version; count(values in hold-bucket) reported and trending to 0",
        severity: "serious",
        rationale: "Unmapped or drifted codes are how the target's history stops being sliceable by line and peril after conversion.",
      },
      {
        id: "conv-date-integrity",
        name: "Date-integrity preservation",
        expression:
          "loss_date, report_date, effective/expiration dates: target = source exactly; accident_year(target) = accident_year(source); no date defaulted to conversion date",
        severity: "critical",
        rationale:
          "Dates defaulted at load time destroy accident-year continuity — the classic conversion defect that surfaces years later in Schedule P and triangle work.",
      },
      {
        id: "conv-status-inventory",
        name: "Open-claim inventory preservation",
        expression: "count(open claims) and sum(case_reserves on open claims): target = source at cutover date, per line",
        severity: "critical",
        rationale: "The open inventory is the operational handoff; a claim converted as closed stops being worked.",
      },
      {
        id: "conv-duplicate-party",
        name: "Duplicate-party detection across merged estate",
        expression: "match-rule library run across (acquired ∪ existing) parties; new auto-link and review-band volumes within planned range",
        severity: "serious",
        rationale:
          "The acquired book's parties overlap yours — insureds, claimants, producers. Unresolved overlap doubles customers and splits claim histories; unplanned merge volume signals match-rule miscalibration on the new book.",
      },
      {
        id: "conv-regression-postcutover",
        name: "Post-cutover regression run",
        expression: "full rule set re-executed at cutover+30d and cutover+90d against frozen source extract; zero new criticals",
        severity: "serious",
        rationale: "Late-arriving defects (delayed feeds, in-flight transactions) surface in the weeks after cutover; the frozen source extract keeps the evidence base comparable.",
      },
    ],
  },

  "book-transfer-cde-set": {
    kind: "cde-set",
    note: "The elements that must survive any migration intact — named before mapping starts. Each carries its reconciliation tie-point.",
    cdes: [
      {
        name: "in_force_premium_by_cohort",
        domain: "premium",
        definition:
          "Written and in-force premium by line of business, state, and term — the top-line the deal was priced on. Tie-point: target's statutory filings and your post-close statement.",
        qualityDimensions: ["accuracy (ties to filings)", "completeness by cohort"],
        exampleIssue: "Premium converted at policy level but re-allocated across states changes state-page reporting the quarter after close.",
      },
      {
        name: "policy_count_in_force",
        domain: "policy",
        definition: "In-force policy inventory by line and state at conversion date. Tie-point: source system close report and statutory exhibits.",
        qualityDimensions: ["completeness", "accuracy"],
      },
      {
        name: "open_claim_inventory",
        domain: "claim",
        definition:
          "Every open claim with current status, assigned handler mapping, and litigation flags at cutover. Tie-point: source open-claim listing signed by claims leadership.",
        qualityDimensions: ["completeness", "status accuracy"],
        exampleIssue: "Claims in 'reopened' status mapped to 'closed' fall out of workflow and breach fair-claims-handling timelines.",
      },
      {
        name: "case_reserves_by_claim",
        domain: "reserve",
        definition: "Case reserves by claim and reserve type at cutover date. Tie-point: source reserve listing; GL loss-reserve accounts post-close.",
        qualityDimensions: ["accuracy (ties to GL)", "completeness"],
      },
      {
        name: "paid_incurred_loss_history",
        domain: "claim",
        definition:
          "Transaction-level paid and incurred loss history at the granularity reserving requires (claim, transaction date, amount, type). Tie-point: rebuilt development triangles match the target's actuarial workpapers for open years.",
        qualityDimensions: ["completeness (transaction-level, not balances)", "date integrity"],
        exampleIssue: "Balance-only history converts cleanly, reconciles at totals, and quietly makes future loss development analysis impossible.",
      },
      {
        name: "accident_year_report_year_assignment",
        domain: "claim",
        definition:
          "Accident-year and report-year assignment on every loss transaction, preserving Schedule P continuity across the conversion. Tie-point: Schedule P as filed by the target for open years.",
        qualityDimensions: ["accuracy", "consistency with loss_date/report_date"],
      },
      {
        name: "reinsurance_attachment_data",
        domain: "reinsurance-cession",
        definition:
          "Treaty and facultative attachment: which cessions apply to which policies/claims, layer terms, and reinstatement status — recoveries depend on reconstructing this post-close. Tie-point: ceded balances in the target's statements.",
        qualityDimensions: ["completeness", "referential integrity to policies and claims"],
        exampleIssue: "Claims converted without cession linkage make existing recoverables uncollectible-by-ignorance.",
      },
      {
        name: "insured_party_linkage",
        domain: "party",
        definition:
          "The party identifiers keeping claim and policy histories connected to the right insureds through conversion and resolution against your estate. Tie-point: sampled claim files trace to the correct converted party.",
        qualityDimensions: ["referential integrity", "resolution accuracy (no false merges into existing estate)"],
      },
      {
        name: "billing_receivable_balances",
        domain: "billing",
        definition: "Open receivable and unearned premium positions per policy at cutover. Tie-point: GL premium receivable and UPR accounts.",
        qualityDimensions: ["accuracy (ties to GL)", "completeness"],
      },
    ],
  },

  // ───────────────────────── VP-20 Operating Model & RACI Pack ─────────────────────────

  "operating-model-blueprint": {
    kind: "template",
    sections: [
      {
        title: "Model overview & principles",
        purpose:
          "The one-page shape: a small engineering-shaped hub owning shared machinery; domain stewards federated in the lines owning judgment; connected by the steward-as-supervisor role.",
        fields: [
          "Hub mandate: code substrate, agent workforce, standards, pattern library, maturity index",
          "Spoke mandate: approval, curation, business meaning, remediation ownership",
          "Operating principles: centralize what is built once, federate what requires domain judgment; scale by pattern reuse, not headcount",
        ],
      },
      {
        title: "Structure & roles",
        purpose: "Who exists in the model and where they sit.",
        fields: [
          "Hub: platform lead, governance engineers, agent-ops, enablement lead",
          "Spokes per line: domain stewards (agent supervisors), data product owners, reference data stewards",
          "Council: cross-line ratification and arbitration body (see charter template)",
          "Reporting lines and dotted lines, stated honestly",
        ],
      },
      {
        title: "RACI — governance lifecycle x roles",
        purpose:
          "The decision grid: for each lifecycle stage, who is Responsible, Accountable, Consulted, Informed.",
        fields: [
          "Standards & patterns: hub R/A, stewards C, council ratifies",
          "Product onboarding & contracts: product owner A, hub R (machinery), producing team R (feed), steward C",
          "Definition certification: steward R, business owner A, council arbitrates conflicts",
          "Suggestion review & curation: steward A/R, agents draft, hub I",
          "Breach remediation: steward A, producing team R, consumer I",
          "Access & purpose approvals: steward R, privacy A on sensitive classes",
          "Maturity scoring & reporting: hub R/A (telemetry), stewards I, council I",
        ],
      },
      {
        title: "Interaction cadences",
        purpose: "The rhythms that make the model real.",
        fields: [
          "Daily: steward queues worked; breach routing live",
          "Weekly: hub-spoke office hours; pattern intake",
          "Monthly: product portfolio review against index",
          "Quarterly: council ratification + wave prioritization + value moments",
        ],
      },
      {
        title: "Sequencing & scale-out",
        purpose: "Stand the model up product by product through live delivery, not by announcement.",
        fields: [
          "Wave 1: one line, two products, named stewards supervised in live delivery",
          "Readiness gates per wave: trained stewards demonstrated on real queues, patterns documented, index live",
          "Anti-patterns to watch: hub doing spoke stewardship 'temporarily'; spoke rebuilding hub machinery; standards published without an operating product",
        ],
      },
    ],
  },

  "steward-role-cards": {
    kind: "template",
    sections: [
      {
        title: "Role card: Domain Steward / Agent Supervisor",
        purpose: "The pivotal role: owns business meaning and supervises the agent workforce for a domain.",
        fields: [
          "Mandate: curate metadata and definitions, review agent suggestions, own breach remediation, certify semantics for the domain",
          "Decision rights: approve/reject suggestions; certify definitions (with business owner); accept/renegotiate quality thresholds; disposition breaches",
          "Competencies: domain fluency (the insurance line's data), quality-rule literacy, agent supervision — calibrating trust in drafts, spotting systematic drift, feeding corrections back",
          "Time expectation: 0.5-1.0 FTE during product onboarding; 0.2-0.4 FTE steady-state per product family — staff against it honestly",
          "Success measures: queue latency, suggestion acceptance quality (not acceptance rate alone), breach aging, definitions certified",
        ],
      },
      {
        title: "Role card: Data Product Owner",
        purpose: "Accountable for a product's fitness, maturity, and consumers.",
        fields: [
          "Mandate: product roadmap, definition-of-done sign-off, maturity accountability, consumer relationship",
          "Decision rights: scope and fitness boundaries; certification submission; gap-list prioritization from retirement negotiations",
          "Competencies: product management on data, consumer discovery, reading telemetry",
          "Time expectation: 0.3-0.5 FTE per active product",
          "Success measures: certification tier held, consumption share, consumer satisfaction, time-to-first-consumer",
        ],
      },
      {
        title: "Role card: Governance Platform Engineer",
        purpose: "Builds and runs the shared machinery the stewards work in.",
        fields: [
          "Mandate: code substrate, pipelines, agent workforce operation, maturity index, telemetry",
          "Decision rights: technical standards; agent guardrail configuration; pipeline promotion",
          "Competencies: data engineering, CI/CD, agent operations (prompted workflows, guardrails, evaluation), platform SRE habits",
          "Time expectation: full-time hub role",
          "Success measures: substrate reliability, steward-minutes saved per artifact (measured), agent suggestion precision trends",
        ],
      },
      {
        title: "Role card: Reference Data Steward",
        purpose: "Owns the code sets everything else silently depends on.",
        fields: [
          "Mandate: governed code sets versioned, reconciled to external authorities, propagated; impact analysis on change",
          "Decision rights: version approval; deprecation schedules; crosswalk sign-off",
          "Competencies: the external authorities' publication cycles (ISO, NAIC, NCCI, Lloyd's), versioning discipline, consumer analysis",
          "Time expectation: 0.2-0.3 FTE steady-state across sets, spiking at authority publication cycles",
          "Success measures: zero unplanned breaking changes downstream, deprecated-version consumer count trending to zero",
        ],
      },
    ],
  },

  "governance-council-charter": {
    kind: "template",
    sections: [
      {
        title: "Purpose & scope",
        purpose: "What the council exists to do — and the instruments it governs from.",
        fields: [
          "Mandate: ratify standards, arbitrate cross-line conflicts, prioritize scale-out waves, review portfolio health",
          "Instruments: the fix list, the maturity index, breach and adoption telemetry, the value-moment register — decisions cite instruments, not status narratives",
          "Out of scope: operational decisions owned by stewards and product owners (the council does not approve individual suggestions or breaches)",
        ],
      },
      {
        title: "Membership & quorum",
        purpose: "Small enough to decide, senior enough to stick.",
        fields: [
          "Voting: data office lead (chair), one accountable leader per business line, finance, risk/compliance",
          "Standing non-voting: platform lead, privacy, enablement",
          "Quorum and delegation rules (a named delegate carries the vote, not an empty chair)",
        ],
      },
      {
        title: "Ratification protocol",
        purpose: "Keep standards approval moving at delivery pace.",
        fields: [
          "Cadence: ratification agenda every meeting; async ratification path for non-contested items with objection window",
          "Entry criteria: a standard arrives with an operating example, not a concept",
          "Clock: items unratified after two cycles escalate to the chair with a decide-by date",
        ],
      },
      {
        title: "Arbitration protocol",
        purpose: "The path for 'whose loss ratio is right' — decided once, recorded, binding.",
        fields: [
          "Trigger: contested metric definition or cross-line boundary dispute a steward pair cannot resolve",
          "Process: each side states its definition, use cases, and evidence; council rules for one certified definition, may grant documented local variants with distinct names",
          "Record: ruling, rationale, and effective date published to the glossary; re-litigation requires new evidence",
        ],
      },
      {
        title: "Portfolio & wave review",
        purpose: "Quarterly steering from the index, not anecdotes.",
        fields: [
          "Quarterly: maturity index movement per product, breach aging trends, adoption metrics, value moments",
          "Wave prioritization criteria: obligation pressure, consumer demand, pattern-reuse leverage, steward readiness",
          "Demotion/attention list: products degrading two consecutive quarters get named remediation owners",
        ],
      },
    ],
  },

  "centralize-federate-decision-guide": {
    kind: "method",
    steps: [
      {
        name: "State the contested capability precisely",
        description:
          "Name the specific capability under dispute — not 'data quality' but 'authoring DQ rules for claims CDEs' vs. 'operating the DQ engine'. Most centralize-federate arguments dissolve when the capability is split into build, operate, and judge.",
        decisionRule: "If the item cannot be stated as a single decision or work product, split it before proceeding.",
      },
      {
        name: "Apply the build-once test",
        description:
          "Centralize when the capability benefits from being built once and reused: platform substrate, agent workforce, pipelines, standards, pattern library, the maturity index, reference data machinery.",
        decisionRule: "Would a second copy diverge without adding domain insight? If yes, centralize.",
      },
      {
        name: "Apply the domain-judgment test",
        description:
          "Federate when correctness depends on domain knowledge the center cannot hold: definition approval, suggestion curation, threshold acceptance, remediation ownership, business meaning.",
        decisionRule: "Would the center need to ask the line to decide well? If yes, federate the decision and centralize only the machinery that carries it.",
      },
      {
        name: "Test contested cases against observed friction",
        description:
          "For cases both tests claim, look at evidence, not org-chart preference: where are the queues, the rework, the escalations in the last two quarters? Pilot the split both ways on one product if friction data is thin.",
        decisionRule: "Choose the allocation that removes the measured bottleneck; revisit only on new friction evidence, not on reorganization energy.",
      },
      {
        name: "Check against the failure-mode catalog",
        description:
          "Before finalizing, test the allocation against the known failures: the central team doing everyone's stewardship (spoke atrophy), the business line rebuilding the platform (shadow hub), the standard nobody can operate (ivory ratification), the federated definition that quietly forks (glossary drift).",
      },
      {
        name: "Write the ruling down with rationale",
        description:
          "Record the allocation, the tests applied, and the rationale in the operating model register. The written record is what makes the answer hold when the argument returns — and it returns.",
        decisionRule: "An allocation without a written rationale is re-arguable by default; with one, re-argument requires new evidence.",
      },
    ],
  },

  // ───────────────────────── VP-21 Value & Adoption Tracking Pack ─────────────────────────

  "value-moments-method": {
    kind: "method",
    steps: [
      {
        name: "Harvest candidates from telemetry, continuously",
        description:
          "Scan the quarter's telemetry for outcome signals: a report re-certified and its caveat removed, a sensitive dataset's first governed consumers, a reconciliation control replacing manual work, access-provisioning latency dropping. Candidates are logged in the value-moment register as they occur, not reconstructed at quarter end.",
      },
      {
        name: "Verify the evidence chain",
        description:
          "For each candidate, bind the claim to telemetry: before/after measurements, the capability that produced the change, dates, and the consuming team. No moment ships on anecdote alone.",
        decisionRule: "If the before-state was never measured, the moment is reported as qualitative and flagged — and the instrumentation gap goes to the platform backlog.",
      },
      {
        name: "Attribute honestly",
        description:
          "Name the capability and the people: the steward who curated it, the producing team that fixed the feed, the platform machinery involved. Shared credit is accurate credit — and it recruits the next line.",
        decisionRule: "Never attribute to 'the governance program' what a named line's steward did; the line retelling its own win is the adoption mechanism.",
      },
      {
        name: "Translate into the audience's vocabulary",
        description:
          "Write each moment in the consuming line's language: 'the month-end producer commission file no longer needs manual correction' — never 'DQ rule coverage increased'. One sentence of outcome, one of evidence, one of who feels it.",
        decisionRule: "Litmus test: could the business-line leader retell it in their own words without notes? If not, rewrite.",
      },
      {
        name: "Publish on a fixed quarterly rhythm",
        description:
          "Deliver the quarter's moments as a short leadership update — three to six moments, each a paragraph — plus the running register for anyone who wants depth. Rhythm matters: the update leadership expects is the update that sustains funding.",
      },
      {
        name: "Feed the funding narrative",
        description:
          "Roll moments into the business outcome ledger and the executive narrative templates; the funding case is assembled from accumulated moments, not written fresh under budget pressure.",
      },
    ],
  },

  "business-outcome-ledger": {
    kind: "template",
    sections: [
      {
        title: "Ledger entry — identity",
        purpose: "One row per outcome, tied to the product and capability that produced it.",
        fields: [
          "Outcome ID, date recognized, status (accruing / realized / superseded)",
          "Data product and capability delivered (e.g., claims-360 quality gates, purpose-based access on HR data)",
          "Best-practice linkage (which practice this outcome evidences)",
        ],
      },
      {
        title: "Causal chain",
        purpose: "The four-link chain kept explicit: capability -> operational outcome -> business impact -> who feels it.",
        fields: [
          "Operational outcome with before/after measure (incidents/quarter, provisioning days, manual hours per close)",
          "Business impact in the line's own terms (close day achieved, report caveat removed, analytics unblocked, dispute rate down)",
          "Named audience: the team/leader who would confirm this outcome if asked directly",
          "Evidence links: telemetry snapshots, control run history, tickets closed",
        ],
      },
      {
        title: "Valuation (where honest)",
        purpose: "Quantify only what the measurement supports; label estimates as estimates.",
        fields: [
          "Effort valuation: steward/analyst hours saved x loaded rate (from measured baselines only)",
          "Risk valuation: exposure class reduced (qualitative unless an incident-cost basis exists)",
          "Explicitly-not-valued flag for outcomes that matter but resist numbers — kept visible, not inflated",
        ],
      },
      {
        title: "Lifecycle & review",
        purpose: "Outcomes accrue and decay; the ledger stays current per product.",
        fields: [
          "Populated at each product's definition-of-done; reviewed quarterly with the value-moments cycle",
          "Superseded/regressed outcomes marked, not deleted — regression is information",
          "Roll-up views: by line, by capability, by quarter — the funding case's source table",
        ],
      },
    ],
  },

  "adoption-leverage-metrics": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Internally-performed share",
        definition:
          "Share of governance-cycle work items on a product completed by client-side stewards and engineers rather than external/vendor staff, from workflow assignment telemetry — the self-sufficiency curve, measured not surveyed.",
        formula: "internally_completed_work_items / total_completed_work_items, per product per month",
        target: ">= 40% by validation stage, >= 70% two quarters post-handoff, >= 90% steady state",
      },
      {
        name: "Weekly active stewards",
        definition:
          "Distinct stewards taking at least one substantive queue action (suggestion decision, breach disposition, certification) per week — participation measured from the audit log, never from attendance.",
        formula: "count(distinct steward_id with substantive_action in week)",
        target: "Every named steward active in >= 3 of any 4 rolling weeks; inactivity flags a staffing or adoption problem, not a person",
      },
      {
        name: "Pattern-reuse rate",
        definition:
          "Share of new product onboarding work drawing on existing patterns (contracts, rule sets, blueprints) versus built novel — the economics of the hub model showing up in delivery.",
        formula: "pattern_derived_artifacts / total_artifacts, per new product onboarding",
        target: ">= 60% by the third product in a family; each wave's rate above the last",
      },
      {
        name: "Trainee certification progression",
        definition:
          "Named trainees advancing through demonstrated-readiness gates (observed, supervised, independent) on real queue work — the handoff evidence, per person per competency.",
        formula: "trainees_at_gate(independent) / named_trainees, per competency area",
        target: "Two independents per critical competency before any handoff milestone; zero competencies with a single point of readiness",
      },
      {
        name: "Suggestion queue latency",
        definition:
          "Median time from agent suggestion to steward decision — the leading indicator of whether the supervision model is staffed and working.",
        formula: "median(decision_ts - suggestion_ts) per domain per week",
        target: "< 3 business days median; > 10 days for two weeks triggers staffing review",
      },
    ],
  },

  "leverage-instrumentation-standard": {
    kind: "method",
    steps: [
      {
        name: "Define the artifact taxonomy being measured",
        description:
          "Fix the unit list before measuring: glossary definition curated, DQ rule authored and validated, CDE onboarded with controls, contract established, breach dispositioned, dataset classified. Leverage claims are per artifact class, never blended.",
        decisionRule: "If two artifact classes have materially different effort profiles, split them — blended averages are how numbers stop being believed.",
      },
      {
        name: "Capture the manual baseline before automating",
        description:
          "Instrument the current manual process for each artifact class: steward-minutes per artifact from workflow timestamps across a representative sample (multiple stewards, multiple weeks) — captured from telemetry, not estimated, surveyed, or recalled.",
        decisionRule: "No automation ships for an artifact class without a captured baseline; a lost baseline cannot be reconstructed honestly afterward.",
      },
      {
        name: "Measure the supervised-agentic actual the same way",
        description:
          "After the agent workflow ships, measure steward-minutes per artifact with identical instrumentation — including review and correction time, which is the honest cost of supervision.",
        decisionRule: "Review time counts fully; a 'saved' hour that moved into correction queues is not saved.",
      },
      {
        name: "Publish the ratio with its conditions",
        description:
          "Report leverage as baseline-minutes : supervised-minutes per artifact class, with sample sizes, period, and the conditions under which it holds (suggestion precision, queue health). Publish on a monthly cadence while the numbers are actionable.",
      },
      {
        name: "Re-baseline on process change",
        description:
          "Any material change to the artifact class, the agent workflow, or the review protocol invalidates the comparison; re-baseline rather than letting the ratio drift into fiction.",
        decisionRule: "A leverage number older than two process changes is retired from reporting, not asterisked.",
      },
      {
        name: "Feed the economics into the scale-out case",
        description:
          "Roll measured per-artifact economics into wave planning and the funding narrative: projected steward-effort at scale uses measured ratios only — which is what lets the business case be signed rather than debated.",
      },
    ],
  },

  // ───────────────────────── VP-22 Governance Communications & Change Pack ─────────────────────────

  "steward-community-playbook": {
    kind: "method",
    steps: [
      {
        name: "Charter the community around practice, not attendance",
        description:
          "Stand up the steward community with a stated purpose — spreading working patterns peer-to-peer — and membership defined by role, not invitation. The community is part of the operating model, on work time, not a lunch club.",
      },
      {
        name: "Run the pattern-sharing forum on a fixed rhythm",
        description:
          "A recurring session (bi-weekly to monthly) where one steward demos a solved problem from their real queue: the bordereaux check that caught a missing month, the match-rule tuning that cut false merges. Demo from the actual tooling, fifteen minutes, discussion after.",
        decisionRule: "The platform team presents at most one slot in three — the forum's credibility is stewards hearing stewards, which is also how trust in agents actually propagates.",
      },
      {
        name: "Staff office hours from the hub",
        description:
          "Weekly drop-in hours with platform engineers and enablement: stuck queue items, rule questions, tooling friction. Friction observed here feeds the platform backlog directly — office hours are a sensing mechanism, not just support.",
      },
      {
        name: "Curate the shared pattern library with named contributors",
        description:
          "Every reusable solution enters the pattern library with its contributor's name attached and the context it worked in. Contribution is part of the steward role expectation, and reuse telemetry shows whose patterns spread.",
      },
      {
        name: "Recognize measured outcomes, not activity",
        description:
          "Recognition mechanics tied to telemetry: patterns reused by others, breaches resolved ahead of SLA, definitions certified and adopted — surfaced quarterly, tied into the value-moments update where leadership sees names.",
        decisionRule: "Never rank stewards on raw activity counts (suggestions processed, items closed) — that manufactures throughput theater; recognize reuse and outcome signals instead.",
      },
      {
        name: "Use the community as the early-warning channel",
        description:
          "Instrument the community's complaints: recurring friction themes, guardrail workarounds, agent-drift observations. A quarterly 'what is not working' synthesis goes to the platform team and council — unfiltered, attributed only with consent.",
      },
    ],
  },

  "exec-narrative-templates": {
    kind: "template",
    sections: [
      {
        title: "Funding case narrative",
        purpose:
          "The renewal/scale-out case, built on measured economics — structured so a CFO can interrogate it and a sponsor can retell it.",
        fields: [
          "Opening: three business outcomes from the ledger, in line language, one paragraph",
          "Economics: measured per-product cost using captured leverage ratios; labor-only counterfactual alongside",
          "The curve: cost-per-product by wave (measured to date, projected from measured ratios only)",
          "Ask and commitment: wave scope, readiness gates, the self-sufficiency trajectory with its measured baseline",
          "Risk paragraph: what was promised last cycle vs. delivered — credibility is the currency",
        ],
      },
      {
        title: "Quarterly leadership update",
        purpose: "Value moments first, portfolio health second, asks last — never a milestone list.",
        fields: [
          "Three to six value moments (one paragraph each: outcome, evidence, who feels it)",
          "Portfolio panel: maturity movement, certification changes, breach aging — one page, from the index",
          "Adoption panel: internally-performed share, active stewards, pattern reuse",
          "Decisions needed from leadership, each with options and a recommendation",
        ],
      },
      {
        title: "Business-line brief",
        purpose: "The same program translated into one line's stakes — underwriting hears pricing confidence, finance hears close speed.",
        fields: [
          "This line's stakes: the two or three numbers/reports the line lives by and their current data risk",
          "What changed for this line this quarter (from the ledger, this line's rows only)",
          "What is coming and what it asks of the line (steward time, definition decisions)",
          "One ask, stated plainly",
        ],
      },
      {
        title: "Narrative discipline rules",
        purpose: "The enforcement layer that keeps every template honest.",
        fields: [
          "Lead with the outcome; capability and activity live one click deeper, never on top",
          "Every number traces to telemetry or the ledger; estimates labeled as estimates",
          "No governance jargon in the top layer (no 'metadata coverage', no 'stewardship maturity' — say what changed for whom)",
          "The retell test before sending: can the audience repeat it accurately without the deck?",
        ],
      },
    ],
  },

  "change-champion-toolkit": {
    kind: "curriculum",
    modules: [
      {
        code: "CC-01",
        title: "Selecting and chartering champions",
        format: "Workshop (half day) + selection worksheet",
        topics: [
          "Selection criteria: credible practitioners with peer respect, not enthusiastic volunteers — the skeptic who converted beats the cheerleader",
          "Coverage mapping: one champion per line/site where the estate is changing; gaps named, not papered over",
          "The champion charter: what champions do (translate, listen, escalate) and do not do (enforce, sell, spin)",
          "Time commitment and manager agreement — unfunded champions quietly resign",
        ],
      },
      {
        code: "CC-02",
        title: "Objection handling with evidence",
        format: "Interactive session (2 hours) + objection-response cards",
        topics: [
          "'Will the agents replace me?' — the honest answer: the job moves up a layer (curation, supervision, judgment), shown with the leverage data and the steward role card, plus what is genuinely uncertain",
          "'Why is my view being retired?' — the risk ranking behind retirement, the gap-list negotiation the owner is entitled to, and what the governed product owes them",
          "'Who decided this definition?' — the certification and arbitration record, and the path to contest it with evidence",
          "Escalating what cannot be answered: capturing the objection verbatim for the platform team instead of improvising",
        ],
      },
      {
        code: "CC-03",
        title: "Running the communications calendar",
        format: "Self-paced kit + monthly champion sync",
        topics: [
          "Keying communications to delivery milestones: nothing announces before it works for someone real",
          "Message sequencing per audience: affected stewards first, their leaders second, broadcast last",
          "Using value moments as the content spine — champions retell outcomes, not plans",
          "Feedback capture: what champions hear goes into the early-warning synthesis, attributed only with consent",
        ],
      },
      {
        code: "CC-04",
        title: "Sustaining the network",
        format: "Quarterly champion forum",
        topics: [
          "Rotating membership without losing memory: overlap terms, exit interviews",
          "Measuring the network: objection themes trending down, adoption metrics in champion-covered vs. uncovered areas",
          "Recognition tied to the value-moments cycle — champions named where leadership looks",
          "Retiring the network gracefully as behaviors become defaults — champions are scaffolding, not structure",
        ],
      },
    ],
  },

  "outcomes-over-activity-card": {
    kind: "checklist",
    sections: [
      {
        title: "Before any update, report, or dashboard ships",
        items: [
          "The top line states a business outcome someone outside the data office would recognize: a trusted report, an unblocked dataset, a faster close, a dispute that did not happen.",
          "The governance activity behind it (rules deployed, datasets classified, definitions curated) is one click deeper — available, never on top.",
          "Every outcome names who feels it: a team, a leader, a process — not 'the enterprise'.",
          "Each claim carries its evidence link: telemetry, the outcome ledger, or a control run — no adjective-only claims ('significantly improved').",
        ],
      },
      {
        title: "The litmus tests",
        items: [
          "Retell test: a business-line leader could repeat the update accurately in their own words. If not, it was activity reporting wearing an outcome costume.",
          "So-what test: for each item, the sentence 'which means that…' can be completed with something a P&L owner cares about.",
          "Vocabulary test: zero governance jargon in the top layer — no 'metadata coverage', 'stewardship maturity', or 'lineage completeness' above the fold.",
          "Absence test: if this item were deleted, would any business audience notice? Padding dilutes the wins that matter.",
        ],
      },
      {
        title: "The standing disciplines",
        items: [
          "Activity metrics are allowed exactly one home: the operational appendix stewards and engineers use — they never headline.",
          "Bad news follows the same rule: report the outcome regression plainly, with the remediation owner — credibility compounds faster than good news.",
          "Keep the cadence fixed; a quarterly rhythm leadership can expect beats a heroic annual deck.",
          "Archive every update: the accumulated outcome trail is the funding case, pre-written.",
        ],
      },
    ],
  },
};
