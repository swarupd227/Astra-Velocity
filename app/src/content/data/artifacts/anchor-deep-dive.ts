import type { Artifact } from "../../types";

/**
 * Artifacts for the platform-native toolkit elements added in the anchor-six
 * deep-dive pass (see elements.ts, "Platform-Native Toolkit Elements" section).
 * Keyed by element key, merged into ARTIFACTS via index.ts.
 */
export const ANCHOR_DEEP_DIVE_ARTIFACTS: Record<string, Artifact> = {
  // ───────────────────────── IDMC / CDGC ─────────────────────────

  "cdgc-scanner-claire-config-starter": {
    kind: "checklist",
    sections: [
      {
        title: "Scanner connection setup by source type",
        items: [
          "Policy administration systems: register the JDBC/API connector, scope the scan to production schemas only, and exclude staging tables that would double-count assets.",
          "Claims systems: connect both the structured claims database and any document/imaging repository separately — they use different connector types and different scan cadences.",
          "Warehouse and lakehouse targets: register Snowflake/Databricks as scan sources so physical assets there resolve to the same catalog entries as their source-system origin.",
          "Bordereaux and file-based feeds: configure the file-drop connector with a naming-pattern rule so recurring monthly files register as one versioned asset, not one new asset per drop.",
          "Run a scan-coverage smoke test against a known table in each source type before declaring the connector production-ready.",
        ],
      },
      {
        title: "CLAIRE confidence threshold tuning",
        items: [
          "Start classification auto-publish thresholds high (90%+) for the first two weeks; auto-publishing at a low threshold before stewards trust the queue burns credibility fast.",
          "Set the auto-association threshold separately from the classification threshold — association errors are more visible and costly to unwind than a missed classification suggestion.",
          "Sample 20 CLAIRE suggestions per capability per week during ramp-up and log precision by hand until the acceptance-rate telemetry itself is trusted.",
          "Document the threshold-change log — every adjustment, its rationale, and its effect on suggestion volume — so a drift in suggestion quality is diagnosable later.",
        ],
      },
      {
        title: "Bulk glossary term loading via API",
        items: [
          "Load the starter glossary pack (see the Insurance Governance Semantic Pack) via CDGC's bulk import API rather than the UI form — hundreds of terms by hand is a multi-week detour the API avoids entirely.",
          "Pre-map each imported term to its candidate CDE and business-to-technical association before import, so CLAIRE's association engine has a seeded starting point instead of a cold start.",
          "Validate the import against the referential-integrity checks (domain assignment, owner role assignment) before publishing — a bulk load with broken references creates cleanup work larger than typing terms individually.",
        ],
      },
      {
        title: "Curation workflow & routing setup",
        items: [
          "Configure steward queues by domain (policy, claims, premium, party) so suggestions route to the steward with the actual authority to decide, not a single central inbox.",
          "Set the deeper-review routing rule for any suggestion below the confidence threshold, so low-confidence items never silently disappear into the same queue as high-confidence ones.",
          "Wire the audit event feed (suggestion issued, decision taken) into the governance telemetry model from day one — retrofitting instrumentation after go-live loses the ramp-up data that matters most for threshold tuning.",
        ],
      },
    ],
  },

  "cdgc-cdq-rule-pattern": {
    kind: "code",
    language: "yaml",
    description:
      "A working Informatica CDQ rule definition for the earned-premium reconciliation check — expression, reference-table threshold, severity, and exception routing — in the declarative form the CDQ rule engine consumes. Copy and re-point at a different CDE rather than authoring from the rule editor's blank form.",
    snippet: `# cdq/rules/earned-premium-reconciliation.yaml
ruleId: RULE-PREM-001
name: Earned Premium Reconciliation
description: >
  Earned premium must equal written premium less the unearned premium
  reserve movement for the same accounting period and segment.
scope:
  asset: warehouse.fact_premium_transaction
  cdeRef: cde.earned_premium

expression: >
  ABS(earned_premium - (written_premium - uep_movement)) <= tolerance

parameters:
  tolerance: 0.01               # 1% of written premium
  toleranceSource: reference.rule_tolerance_table   # stewarded, not hardcoded

severity: critical
scorecard: financial-reporting-integrity
schedule: on-load               # runs inside the mapping task that lands the CDE

onBreach:
  route: steward-queue
  owner: role:finance-data-steward
  escalation:
    afterHours: 24
    to: role:controller
  auditEvent: cdq.rule.breach

obligationRef: asop-23
kpiRef: earned-premium`,
  },

  // ───────────────────────── Snowflake ─────────────────────────

  "snowflake-tagging-taxonomy-starter": {
    kind: "template",
    sections: [
      {
        title: "Object tag hierarchy",
        purpose:
          "Fix the three tags every masking policy and access grant will key off of, before the first schema is created.",
        fields: [
          "SENSITIVITY tag: values public / internal / restricted / nppi-financial / nppi-medical, applied at column level",
          "DOMAIN tag: values matching the content data-domain vocabulary (policy, claim, premium, party, ...), applied at table level",
          "PRODUCT tag: the certified data product a table belongs to, applied at table level, empty only for pre-certification staging assets",
          "Tag-assignment ownership: which role may set each tag, and the review gate before a RESTRICTED value is applied",
        ],
      },
      {
        title: "Masking policy pattern",
        purpose:
          "One conditional masking policy per sensitivity tier, parameterized by role and purpose rather than one policy per column.",
        fields: [
          "mask_nppi_financial: full mask unless CURRENT_ROLE() IN approved roles AND purpose context = approved purpose",
          "mask_nppi_medical: full mask by default; unmask only for role:claims-adjuster with purpose = claims-handling",
          "Tag-based policy assignment: ALTER TAG ... SET MASKING POLICY, so a new column tagged nppi-medical inherits masking automatically",
          "Unmask audit: query_history sampling to confirm unmask events correlate with an approved purpose context, not just an approved role",
        ],
      },
      {
        title: "RBAC role hierarchy starter",
        purpose:
          "Separate functional roles (what a person's job is) from access roles (what data they can see) so the two can evolve independently.",
        fields: [
          "Functional roles: analyst, steward, engineer, auditor — granted to users directly",
          "Access roles: one per sensitivity tier plus domain (e.g. access_claim_restricted), granted to functional roles, never to users directly",
          "Grant chain: access role -> functional role -> user, so a sensitivity-tier change is one role-grant edit, not N user-grant edits",
          "Break-glass role: time-boxed, logged, requiring a second approver — for the rare full-access exception",
        ],
      },
      {
        title: "Rollout sequencing",
        purpose: "The order that gets a new schema governed at creation instead of retrofitted.",
        fields: [
          "Week 1: tag taxonomy and RBAC role hierarchy created in a shared governance database, referenced (not recreated) by every product schema",
          "Per-product: apply DOMAIN and PRODUCT tags at table creation via the deployment pipeline, not manually after load",
          "Per-column: apply SENSITIVITY tags from the classification-to-access chain's propagated labels, not a manual second pass",
          "Quarterly: audit for untagged tables and columns with a scheduled query against ACCOUNT_USAGE.TAG_REFERENCES",
        ],
      },
    ],
  },

  "cortex-semantic-views-starter": {
    kind: "code",
    language: "sql",
    description:
      "A Snowflake semantic view DDL pattern defining certified premium and loss-ratio measures so Cortex Analyst resolves natural-language questions to the certified definition — and inherits the same row-access and masking policies as any manual query.",
    snippet: `-- semantic_views/policy_premium_summary.sql
create or replace semantic view governed.policy_premium_summary
  tables (
    fact_premium as warehouse.fact_premium_transaction
      primary key (premium_transaction_id)
      with synonyms ('premium', 'premium transactions'),
    fact_claim as warehouse.fact_claim_transaction
      primary key (claim_transaction_id)
  )
  relationships (
    fact_premium (policy_id) references dim_policy (policy_id),
    fact_claim (policy_id) references dim_policy (policy_id)
  )
  facts (
    fact_premium.written_amt as written_premium
      comment = 'Certified written premium per the Insurance Governance Semantic Pack',
    fact_premium.earned_amt as earned_premium
      comment = 'Certified earned premium; earned = written - UEP movement',
    fact_claim.incurred_amt as incurred_loss
  )
  metrics (
    fact_premium.loss_ratio as
      sum(fact_claim.incurred_amt) / nullif(sum(fact_premium.earned_amt), 0)
      comment = 'Certified loss ratio, calendar-year basis'
  )
  comment = 'Cortex Analyst reads this view for premium and loss-ratio questions. '
            'Row access policy rap_policy_line_of_business and masking policy '
            'mask_nppi_financial both apply unchanged to Cortex-issued queries — '
            'the view adds no separate access surface.';

-- Governance objects the view inherits rather than redefines:
--   row access policy:  rap_policy_line_of_business   (already on fact_premium)
--   masking policy:     mask_nppi_financial            (already on dim_party columns)`,
  },

  // ───────────────────────── Databricks ─────────────────────────

  "unity-catalog-governance-starter": {
    kind: "checklist",
    sections: [
      {
        title: "Catalog & schema naming convention",
        items: [
          "Top-level catalog per environment: prod_governed, stg_governed, dev_sandbox — never mix environments inside one catalog.",
          "Schema per data domain, matching the content data-domain vocabulary: claim, policy, premium, party, reference.",
          "Table prefix by layer: raw_, cleansed_, and a certified product's tables carry no prefix, signaling 'this is the product', not a staging artifact.",
          "Reserve a sandbox catalog per team for exploratory work explicitly excluded from certification and marketplace listing.",
        ],
      },
      {
        title: "Lineage capture verification steps",
        items: [
          "Pick one representative notebook-to-table chain per domain and confirm Unity Catalog renders it end-to-end before trusting automatic capture generally.",
          "Verify column-level lineage renders through at least one non-trivial transformation (a join plus an aggregation), not just a straight column copy.",
          "Check lineage capture across a scheduled job, not only interactive notebook runs — job-triggered writes are the common gap.",
          "Document any ingestion path that runs outside Unity Catalog's reach (external writes via a non-Databricks client) as a manual-stitch segment, not a silent gap.",
        ],
      },
      {
        title: "Access-grant hierarchy pattern",
        items: [
          "Set catalog-level default grants to deny-by-default; nothing is readable estate-wide without an explicit schema- or table-level grant.",
          "Grant at schema level by domain ownership (e.g. claims-analytics group gets USAGE + SELECT on the claim schema), reserving table-level grants for genuine exceptions.",
          "Route every table-level exception grant through the same approval path as a schema-level grant — an exception that skips review is how sprawl starts.",
          "Review the grant hierarchy quarterly against actual query activity in system tables to catch grants nobody is using.",
        ],
      },
      {
        title: "Thirty-day rollout sequencing",
        items: [
          "Week 1: naming convention and catalog/schema scaffolding created before any product team's first table.",
          "Week 2: default deny-by-default grants applied; domain-level access roles created and mapped to existing groups.",
          "Week 3: lineage verification run against the first live pipeline; gaps documented as manual-stitch segments.",
          "Week 4: first product's tables register against the scaffolding, proving the pattern before a second product repeats it.",
        ],
      },
    ],
  },

  "lakehouse-monitoring-dq-starter": {
    kind: "code",
    language: "python",
    description:
      "A Delta Live Tables expectations pattern for a claims CDE table: completeness and validity checks on loss date, report date, and reserve amount, with a quarantine action on critical failures and a monitored-metrics feed for Databricks Assistant's anomaly detection.",
    snippet: `# pipelines/claims_cde_expectations.py
import dlt

@dlt.table(
    name="claims.fact_claim_cde",
    comment="Claim CDE spine with DQ expectations enforced at load time.",
)
@dlt.expect_or_drop("loss_date_not_null", "loss_date IS NOT NULL")
@dlt.expect_or_drop("report_after_loss", "report_date >= loss_date")
@dlt.expect_or_quarantine("reserve_amount_valid", "case_reserve_amt >= 0")
def claims_cde():
    return (
        dlt.read_stream("claims.raw_claim_transactions")
        .select(
            "claim_number",
            "loss_date",
            "report_date",
            "case_reserve_amt",
            "claim_status",
        )
    )

# Lakehouse Monitoring config: the metrics table Databricks Assistant's
# anomaly detection reads from — daily expectation pass-rate, trended by
# claim status so a status-specific regression doesn't hide in the average.
dq_monitor_config = {
    "table_name": "claims.fact_claim_cde",
    "profile_type": "TimeSeries",
    "timestamp_col": "report_date",
    "granularities": ["1 day"],
    "slicing_exprs": ["claim_status"],
}`,
  },

  // ───────────────────────── BigID ─────────────────────────

  "bigid-classifier-tuning-starter": {
    kind: "checklist",
    sections: [
      {
        title: "Classifier selection by insurance data type",
        items: [
          "Claims medical narrative and adjuster free-text notes: enable the NLP-based medical-entity classifier, not just structured-field pattern matching.",
          "NPPI financial fields (bank account, payment card, tax ID): enable the structured financial-identifier classifier set at the column level.",
          "Producer license and appointment numbers: build a custom classifier from the state-DOI license-number pattern set, since this category is insurance-specific and absent from BigID's out-of-box library.",
          "Litigation and SIU flags: enable the custom-category classifier keyed on the internal flag taxonomy, tuned against a labeled sample from claims operations.",
        ],
      },
      {
        title: "Confidence threshold tuning",
        items: [
          "Set structured-field classifiers (bank account, tax ID) to a high auto-publish threshold — these have low false-positive risk and stewards will distrust the queue if obvious findings sit unpublished.",
          "Set free-text/NLP classifiers (medical narrative, litigation flags) to route to review below a materially higher threshold — free-text findings carry more ambiguity and a wrong auto-publish here is costlier.",
          "Re-tune thresholds after the first 500 reviewed findings per category rather than leaving initial defaults in place indefinitely.",
        ],
      },
      {
        title: "Correlation-engine subject-matching setup",
        items: [
          "Connect policy, claims, and billing systems as correlation sources so a data subject's records cluster across systems that share no common key.",
          "Configure match confidence tiers (high/medium/low) and route only high-confidence subject clusters to automatic propagation; medium and low route to steward review.",
          "Validate the correlation engine against a known test set of insureds with intentionally varied name spellings and address changes before trusting cluster output at scale.",
        ],
      },
      {
        title: "Precision validation before catalog handoff",
        items: [
          "Sample 50 findings per classifier category and confirm precision meets the program's stated bar before findings propagate to the catalog and access-policy layer.",
          "Log the validation sample and result as evidence — this is the artifact an assessment or privacy audit will ask for first.",
        ],
      },
    ],
  },

  "bigid-unstructured-claims-scan-playbook": {
    kind: "method",
    steps: [
      {
        name: "Connect the document repositories",
        description:
          "Register claims-document repositories and imaging systems as BigID scan sources separately from the structured claims database — these use different connector types, refresh differently, and are frequently invisible to a catalog's own scanner.",
        decisionRule:
          "If a repository holds adjuster notes, medical records, or scanned correspondence, connect it — a structured-only scan scope leaves the highest-risk content unclassified.",
      },
      {
        name: "Select and tune entity-extraction models",
        description:
          "Enable the NLP entity-extraction models tuned for medical narrative and free-text adjuster notes, and configure extraction to flag both named-entity categories (diagnosis codes, provider names) and context-dependent categories (litigation references, SIU indicators).",
        decisionRule:
          "If a category's extraction precision on the sampling pass is below the program's stated bar, narrow the model's scope rather than lowering the confidence threshold — precision on unstructured content degrades faster than on structured fields.",
      },
      {
        name: "Run the sampling precision pass",
        description:
          "Sample a representative set of scanned documents per content type and manually verify extraction findings before trusting the classifier at scale — unstructured content has a materially higher false-positive rate than structured columns.",
        decisionRule:
          "Do not enable auto-propagation to the catalog for any content type until the sampling pass clears the same precision bar structured classifiers were held to.",
      },
      {
        name: "Route findings to steward review",
        description:
          "Send high-confidence sensitive findings to the steward review queue with the source document reference and extraction evidence attached, rather than auto-classifying documents wholesale.",
        decisionRule:
          "Findings touching litigation or SIU material always route to review regardless of confidence score — the cost of a wrong auto-classification here is materially higher than the review effort saved.",
      },
    ],
  },

  // ───────────────────────── Immuta ─────────────────────────

  "immuta-purpose-policy-starter": {
    kind: "template",
    sections: [
      {
        title: "Purpose definitions",
        purpose: "Model the purposes access decisions actually need to distinguish, before writing a single policy rule.",
        fields: [
          "claims-handling: full access to claim content including medical narrative, scoped to assigned adjusters and claim status = open",
          "analytics: aggregate or de-identified access only — medical narrative masked, financial fields banded, no row-level claimant identity",
          "siu-investigation: full access including litigation flags, scoped to named SIU roles with time-boxed grants",
          "compliance-reporting: field-level access limited to what the specific regulatory filing requires, not full claim content",
        ],
      },
      {
        title: "Attribute-tag mapping from classification",
        purpose: "Pull sensitivity attributes from the existing classification source rather than re-deciding them in Immuta.",
        fields: [
          "nppi-financial tag sourced from BigID classification findings, subscribed via API, never manually re-tagged in Immuta",
          "nppi-medical tag sourced from BigID's unstructured-content classifier for claim narrative fields",
          "domain and product tags sourced from CDGC catalog metadata for schema and table-level context",
          "Tag-refresh cadence: policy evaluation must use the latest propagated tag, not a stale cached value",
        ],
      },
      {
        title: "Masking rule pattern per purpose",
        purpose: "State exactly what each purpose sees, field by field, not as a general access level.",
        fields: [
          "claims-handling: nppi-medical unmasked, nppi-financial unmasked, litigation flags masked unless siu-investigation also granted",
          "analytics: nppi-medical fully masked, nppi-financial banded (range only), litigation flags fully masked",
          "siu-investigation: all fields unmasked including litigation flags, restricted to named roles",
          "compliance-reporting: only the specific fields named in the filing's data dependency, all else masked",
        ],
      },
      {
        title: "Exception & expiry pattern",
        purpose: "Keep purpose grants from quietly becoming permanent role entitlements.",
        fields: [
          "Default grant expiry: 90 days, renewable only through explicit recertification, not automatic rollover",
          "Exception grants (access beyond the standard purpose scope) require a named second approver and a stated business reason logged with the grant",
          "Automated revocation on role change: a user moved off the claims-handling team loses the claims-handling purpose grant on the next sync, not on manual cleanup",
        ],
      },
    ],
  },

  "immuta-policy-testing-toolkit": {
    kind: "checklist",
    sections: [
      {
        title: "Dry-run impact analysis before merge",
        items: [
          "Run the proposed policy change against the current user and group population and produce a diff: who gains access, who loses access, and to which fields.",
          "Flag any consumer losing access to a field they've queried in the last 30 days as a required reviewer on the change, not just an informational note.",
          "Attach the impact-analysis diff to the pull request as required review evidence before a steward can approve.",
        ],
      },
      {
        title: "Regression test suite for existing purposes",
        items: [
          "Maintain a test suite of representative query scenarios per existing purpose (claims-handling, analytics, siu-investigation) and re-run it against every proposed policy change.",
          "Fail the build if any existing purpose's expected masking behavior changes as a side effect of an unrelated policy edit.",
          "Version the test suite alongside the policy definitions so a new purpose ships with its own regression cases from day one.",
        ],
      },
      {
        title: "Staged rollout by consumer group",
        items: [
          "Promote a new or changed policy to a pilot consumer group first, monitor query behavior and access-denial rates for one cycle, then promote estate-wide.",
          "Set a rollback trigger: an unexpected spike in access-denial errors during the pilot window reverts automatically rather than waiting for a support ticket.",
          "Record the staged-rollout outcome as evidence in the same audit log the definition-of-done gate reads from.",
        ],
      },
    ],
  },

  // ───────────────────────── Power BI ─────────────────────────

  "power-bi-certification-rls-starter": {
    kind: "template",
    sections: [
      {
        title: "Certification workflow criteria",
        purpose: "State exactly what a dataset must clear before it can carry the certified badge, tied to the marketplace tier standard.",
        fields: [
          "Dataset owner named and reachable, matching the catalog's registered product owner",
          "Every measure resolves to a certified glossary term, with no locally redefined DAX for an already-certified metric",
          "Row-level security roles verified against upstream warehouse row-access policy, not authored independently",
          "Refresh schedule and data-quality gate status pulled from platform telemetry, not self-attested",
        ],
      },
      {
        title: "RLS role pattern for insurance data",
        purpose: "A role structure that maps cleanly onto the upstream warehouse policy instead of duplicating access logic in Power BI.",
        fields: [
          "Role by line of business: rls_pc_personal, rls_pc_commercial, rls_specialty_es — mapped from the same domain tag the warehouse uses",
          "Role by sensitivity tier: rls_restricted_view for users cleared to see unmasked NPPI fields, default role otherwise masked",
          "DAX filter pattern: USERPRINCIPALNAME() joined to a role-membership table synced from the same identity source the warehouse RBAC uses — never a separately maintained list",
          "Testing checklist: view-as-role validation for each role before publishing, confirming filtered results match the upstream policy's expected scope",
        ],
      },
      {
        title: "Measure-certification checklist",
        purpose: "Tie every certified measure back to one glossary definition before endorsement.",
        fields: [
          "Measure name matches the certified glossary term exactly, not a locally shortened or renamed variant",
          "DAX formula reviewed against the glossary's stated formula (earned-vs-written basis, LAE treatment, etc.) by the metric's named business owner",
          "Certification badge applied only after the measure passes a side-by-side reconciliation against the semantic-layer source",
          "Re-certification trigger: any edit to the DAX formula automatically reverts certification status pending re-review",
        ],
      },
    ],
  },

  "power-bi-copilot-guardrail-checklist": {
    kind: "checklist",
    sections: [
      {
        title: "Scope Copilot to certified datasets",
        items: [
          "Enable Copilot only on workspaces containing certified datasets; leave sandbox and pre-certification workspaces out of Copilot's scope entirely.",
          "Confirm Copilot's data source list matches the certified-dataset inventory before rollout, not after the first user complaint about a wrong answer.",
        ],
      },
      {
        title: "Measure-definition review before exposure",
        items: [
          "Review every measure in a dataset for ambiguous or missing definitions before that dataset is exposed to Copilot — an ambiguous measure produces a fluent, wrong Copilot answer as easily as a human one.",
          "Reject Copilot exposure for any dataset carrying an uncertified or provisional measure until the measure is certified.",
        ],
      },
      {
        title: "Guardrail configuration steps",
        items: [
          "Configure content-scope restrictions so Copilot cannot synthesize answers by joining across datasets outside the certified product's defined scope.",
          "Set response-sourcing so every Copilot answer surfaces which certified measure and dataset it drew from, not just the number.",
        ],
      },
      {
        title: "Usage-log monitoring",
        items: [
          "Review the Copilot interaction log on a standing cadence for questions answered against a dataset outside the certified scope.",
          "Route any flagged uncertified-source answer to the governance platform team as a scope-configuration defect, not a one-off to ignore.",
        ],
      },
    ],
  },
};
