import type { Artifact } from "../../types";

/**
 * Artifacts for the governance-as-code expansion pass: closing the code-artifact
 * gap on BigID, Immuta, Power BI, and dbt (see elements.ts, "Governance-as-Code
 * Expansion" section). Keyed by element key, merged into ARTIFACTS via index.ts.
 */
export const GAC_EXPANSION_ARTIFACTS: Record<string, Artifact> = {
  // ───────────────────────── BigID ─────────────────────────

  "bigid-classifier-correlation-policy-as-code": {
    kind: "code",
    language: "yaml",
    description:
      "A BigID policy definition covering classifier assignment across NPPI-financial, claims-medical-narrative, and producer-license categories, correlation-engine subject matching across policy/claims/producer-licensing sources, and the attribute-mapping block that propagates confidence-gated findings to the catalog and to Immuta as attributes. Deployed identically across environments via the policy API rather than re-tuned by hand per environment.",
    snippet: `# bigid/policies/claims-nppi-classification-policy.yaml
policyId: POLICY-CLASS-CLAIMS-001
name: Claims & Producer Sensitive-Data Classification Policy
description: >
  Classifier assignment and correlation configuration for claims, party, and
  producer-distribution sources, with confidence-gated propagation to the
  catalog and to Immuta as attributes.

dataSourceScope:
  - source: claims-db-prod
    type: structured
    connector: jdbc-oracle
  - source: claims-documents-repo
    type: unstructured
    connector: file-share
  - source: producer-licensing-db
    type: structured
    connector: jdbc-postgres

classifiers:
  - classifierId: bigid.financial.nppi.bank-account
    category: nppi-financial
    scope: [claims-db-prod, producer-licensing-db]
    confidenceThreshold: 0.92
    autoPublish: true

  - classifierId: bigid.financial.nppi.tax-id
    category: nppi-financial
    scope: [claims-db-prod]
    confidenceThreshold: 0.92
    autoPublish: true

  - classifierId: bigid.nlp.medical-narrative
    category: nppi-medical
    scope: [claims-documents-repo]
    confidenceThreshold: 0.85
    autoPublish: false
    routeTo: steward-review-queue

  - classifierId: custom.producer-license-number
    category: producer-license
    scope: [producer-licensing-db]
    pattern: state-doi-license-format
    confidenceThreshold: 0.9
    autoPublish: false
    routeTo: steward-review-queue

correlationEngine:
  subjectMatchKey: party_id
  sources: [claims-db-prod, producer-licensing-db]
  matchConfidenceTiers:
    high: 0.95
    medium: 0.8
    low: 0.6
  autoPropagateTier: high

attributeMapping:
  onFinding:
    - condition: category == nppi-financial
      catalogTag: SENSITIVITY.nppi-financial
      immutaAttribute: nppi_financial=true
    - condition: category == nppi-medical
      catalogTag: SENSITIVITY.nppi-medical
      immutaAttribute: nppi_medical=true
    - condition: category == producer-license
      catalogTag: DOMAIN.producer-distribution
      immutaAttribute: producer_license=true

propagation:
  schedule: on-finding-publish
  downstream:
    - system: idmc-cdgc
      api: catalog.tags.apply
    - system: immuta
      api: dataSourceAttributes.set
  auditEvent: bigid.classification.propagated`,
  },

  // ───────────────────────── Immuta ─────────────────────────

  "immuta-purpose-policy-as-code": {
    kind: "code",
    language: "yaml",
    description:
      "An Immuta policy definition contrasting the claims-handling and analytics purposes over claimant medical-narrative and financial fields: attribute-based masking and row-filter rules keyed off purpose, an explicit data-source scope, and a regression test block. The attributeReferences block consumes nppi-medical and nppi-financial tags propagated from BigID/catalog classification — this policy declares no sensitivity labels of its own.",
    snippet: `# immuta/policies/claims-medical-purpose-policy.yaml
policyId: POLICY-PURPOSE-CLAIMS-001
name: Claims Medical Narrative Purpose-Based Masking Policy
type: attribute-based
description: >
  Masks claimant medical narrative and financial fields unless the querying
  purpose is claims-handling. Consumes sensitivity tags propagated from
  BigID/catalog classification rather than generating its own — this policy
  references tags, it does not define them.

dataSourceScope:
  - connection: snowflake-prod
    schema: claims
    table: fact_claim_narrative

policyType: masking

conditions:
  purpose:
    allowed: [claims-handling]
    deniedDefault: analytics

attributeReferences:
  # Tags subscribed from BigID classification findings / catalog
  # propagation — never manually re-tagged inside Immuta.
  - attribute: nppi_medical
    source: bigid
    appliesToColumns: [diagnosis_narrative, adjuster_notes, provider_notes]
  - attribute: nppi_financial
    source: bigid
    appliesToColumns: [claimant_bank_account, claimant_tax_id]

rules:
  - action: mask
    maskType: null
    columns: [diagnosis_narrative, adjuster_notes, provider_notes]
    when:
      attribute: nppi_medical
      purposeNotIn: [claims-handling, siu-investigation]

  - action: mask
    maskType: hash
    columns: [claimant_bank_account, claimant_tax_id]
    when:
      attribute: nppi_financial
      purposeNotIn: [claims-handling]

  - action: rowFilter
    condition: "claim_status = 'open'"
    when:
      purpose: claims-handling
      role: assigned-adjuster

exceptions:
  - purpose: siu-investigation
    columns: [diagnosis_narrative, adjuster_notes, provider_notes, litigation_flag]
    approvers: 2
    expiryDays: 90

testSuite:
  regressionCases:
    - purpose: analytics
      expect: diagnosis_narrative == null
    - purpose: claims-handling
      role: assigned-adjuster
      expect: diagnosis_narrative != null

deployment:
  pipeline: immuta-policy-ci
  onMerge: dry-run-impact-analysis
  auditEvent: immuta.policy.deployed`,
  },

  // ───────────────────────── Power BI ─────────────────────────

  "power-bi-deployment-pipeline-certification-as-code": {
    kind: "code",
    language: "yaml",
    description:
      "A Power BI deployment pipeline definition: dev/test/prod stages, a test-stage gate requiring every measure to match the certified glossary and RLS roles to reconcile against the upstream warehouse row-access policy, and a prod-stage gate requiring a logged governance sign-off before certification and endorsement are applied on promotion. RLS role filters map to the warehouse's own domain tag rather than a separately maintained list.",
    snippet: `# powerbi/pipelines/claims-analytics-deployment-pipeline.yaml
pipelineId: PIPELINE-CLAIMS-ANALYTICS-001
name: Claims Analytics Certified Dataset Deployment Pipeline
description: >
  Promotes the Claims Analytics dataset from dev to prod, gated on
  certified-glossary measure matching, RLS validation against the upstream
  warehouse row-access policy, and governance sign-off before certification.

stages:
  - name: dev
    workspace: ws-claims-analytics-dev
    autoPublish: onCommit
    certificationAllowed: false

  - name: test
    workspace: ws-claims-analytics-test
    promotionFrom: dev
    gate:
      - check: measure-glossary-match
        source: certified-glossary-api
        requireAllMeasuresCertified: true
      - check: rls-role-validation
        compareAgainst: warehouse.row_access_policy.rap_policy_line_of_business
      - check: refresh-success-rate
        minPercent: 98

  - name: prod
    workspace: ws-claims-analytics-prod
    promotionFrom: test
    gate:
      - check: governance-sign-off
        approver: role:data-governance-lead
        evidence: signoff-ticket-id
      - check: dq-scorecard-status
        source: cdgc-cdq-scorecard
        minScore: 95
    onPromote:
      certifyDataset: true
      endorsement: certified

rls:
  roles:
    - name: rls_pc_personal
      filterExpression: '[line_of_business] = "pc-personal"'
      mappedFrom: warehouse.dim_policy.line_of_business
    - name: rls_pc_commercial
      filterExpression: '[line_of_business] = "pc-commercial"'
      mappedFrom: warehouse.dim_policy.line_of_business
    - name: rls_restricted_view
      filterExpression: "TRUE()"
      appliesTo: role:cleared-nppi-viewer
      default: false
  membershipSource: identity.role_membership_table

measures:
  - name: earned_premium
    glossaryRef: kpi.earned-premium
    certifiedFormula: "SUM(fact_premium[earned_amt])"
    certificationStatus: certified
    recertifyOnFormulaChange: true

auditEvent: powerbi.pipeline.stage.promoted`,
  },

  // ───────────────────────── dbt ─────────────────────────

  "dbt-tests-contracts-as-code": {
    kind: "code",
    language: "yaml",
    description:
      "A dbt schema.yml pattern for the certified premium and claim fact models: an enforced contract that turns column names and types into a breaking-change boundary for downstream consumers, plus column-level data_tests — not_null, accepted_values, a relationships test back to the policy dimension, and a custom earned-premium-reconciliation test expressing the same tolerance check the CDGC CDQ rule enforces elsewhere in the estate.",
    snippet: `# models/claims/schema.yml
version: 2

models:
  - name: fact_premium_transaction
    description: >
      Certified premium transaction fact table. Contract enforced — this
      model's public interface (column names, types) is a breaking-change
      boundary for downstream consumers, including the Power BI certified
      dataset and the Cortex semantic view.
    config:
      contract:
        enforced: true
    columns:
      - name: premium_transaction_id
        data_type: string
        data_tests:
          - unique
          - not_null

      - name: policy_id
        data_type: string
        data_tests:
          - not_null
          - relationships:
              to: ref('dim_policy')
              field: policy_id

      - name: written_premium
        data_type: numeric(18,2)
        data_tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0

      - name: earned_premium
        data_type: numeric(18,2)
        data_tests:
          - not_null
          - earned_premium_reconciliation:
              written_column: written_premium
              uep_movement_column: uep_movement
              tolerance: 0.01

      - name: transaction_type
        data_type: string
        data_tests:
          - accepted_values:
              values: ['new_business', 'renewal', 'endorsement', 'cancellation']

      - name: uep_movement
        data_type: numeric(18,2)
        data_tests:
          - not_null

  - name: fact_claim_transaction
    description: Certified claim transaction fact table. Contract enforced.
    config:
      contract:
        enforced: true
    columns:
      - name: claim_transaction_id
        data_type: string
        data_tests:
          - unique
          - not_null
      - name: policy_id
        data_type: string
        data_tests:
          - relationships:
              to: ref('dim_policy')
              field: policy_id
      - name: incurred_amt
        data_type: numeric(18,2)
        data_tests:
          - not_null`,
  },
};
