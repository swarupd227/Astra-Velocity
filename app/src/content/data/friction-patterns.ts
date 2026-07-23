import type { FrictionPattern } from "../types";

/**
 * Friction patterns — the recurring seams that appear once a real, multi-platform
 * stack is selected. Matched against a client's stack by platform-category overlap,
 * not exact platform pairs: these are patterns of tool combination, not call-outs of
 * a specific vendor pairing.
 */
export const FRICTION_PATTERNS: FrictionPattern[] = [
  {
    key: "classification-overlap",
    capability: "classification",
    involvedCategories: ["classification-discovery", "catalog-governance", "warehouse-lakehouse"],
    title: "Two engines, one column, no agreed winner",
    description:
      "A dedicated classification-discovery platform and a catalog suite's built-in classifier both scan the same estate and both propose a sensitivity label for the same column — sometimes agreeing, sometimes not. Without a declared winner and a propagation owner, whichever tool's tag happened to write last becomes the de facto answer, and access policy inherits a label nobody actually adjudicated.",
  },
  {
    key: "semantic-layer-contested",
    capability: "semantic_layer",
    involvedCategories: ["warehouse-lakehouse", "bi-consumption", "catalog-governance"],
    title: "One metric, three homes, three answers",
    description:
      "'Loss ratio' can be legitimately defined in the warehouse's semantic layer, in the BI tool's semantic model, and in the catalog's business glossary — and each home is a reasonable place to certify it. When no single home is declared authoritative, all three definitions drift independently, and the executive who asks 'what's our loss ratio' gets a different number depending on which tool answered.",
  },
  {
    key: "dq-duplicated",
    capability: "data_quality",
    involvedCategories: ["catalog-governance", "data-quality", "warehouse-lakehouse"],
    title: "The same check, written three times, drifting three ways",
    description:
      "A completeness or reconciliation check on earned premium gets authored once in the catalog suite's DQ engine, again as a dbt test in the transformation layer, and a third time as hard-coded logic inside a report. Each copy is edited independently when a threshold changes, so the three checks silently diverge — and a breach caught in one layer says nothing about whether the other two would catch it too.",
  },
  {
    key: "lineage-edge-gaps",
    capability: "lineage",
    involvedCategories: ["warehouse-lakehouse", "catalog-governance", "bi-consumption"],
    title: "Strong in the middle, blind at both ends",
    description:
      "Lineage inside a modern warehouse or lakehouse is often excellent — automatically captured, column-level, low effort. That strength masks the two places it usually fails: the true source system feeding the platform (a mainframe extract, a vendor file, a spreadsheet stitch) and the report or BI layer consuming it, where calculated fields and report-level joins routinely fall outside any scanner's reach.",
  },
  {
    key: "access-policy-fragmentation",
    capability: "access_policy",
    involvedCategories: ["access-policy", "warehouse-lakehouse"],
    title: "No dedicated policy layer means enforcement splits by platform",
    description:
      "When the stack has no dedicated access-policy platform, enforcement defaults to whatever RBAC and masking each warehouse or lakehouse ships natively — competent within one platform, but with no shared purpose-based layer spanning them. The same analyst can hold consistent-looking role grants in two platforms that actually enforce different masking rules for the same sensitivity label, and nobody owns reconciling the difference.",
  },
  {
    key: "catalog-of-catalogs",
    capability: "catalog_metadata",
    involvedCategories: ["catalog-governance", "warehouse-lakehouse"],
    title: "Two catalogs, both claiming system-of-record",
    description:
      "The real tension isn't category overlap in the abstract — it's two catalog-governance platforms in the same stack (an enterprise suite alongside a lighter, engineering-adjacent catalog, or a cloud-native catalog layered over an incumbent) with no designated anchor between them. Both scan the estate, both hold a glossary, and both are technically capable of being 'the' system of record — so stewards curate in whichever one they opened first, and the two definitions of the same term slowly stop matching.",
  },
  {
    key: "stewardship-workflow-gap",
    capability: "stewardship_ops",
    involvedCategories: ["data-quality", "catalog-governance"],
    title: "A DQ-heavy stack with nowhere for the review queue to live",
    description:
      "A stack built around a data-quality or reconciliation-testing platform and a transformation-as-code layer can be excellent at detecting breaches and running rules, but neither tool is built as a stewardship workflow engine. Without a catalog anchor carrying real approval and review-queue capability, breach triage, classification confirmation, and glossary curation end up in spreadsheets or ad hoc tickets — the checks run, but nobody's queue is the queue.",
  },
  {
    key: "native-ai-underutilization",
    capability: "classification",
    involvedCategories: ["catalog-governance", "classification-discovery", "warehouse-lakehouse"],
    title: "The AI everyone already paid for, still switched off",
    description:
      "Most platforms in a modern stack ship native AI — auto-classification, auto-association, anomaly detection, rule suggestion — that arrives configured to defaults and is never tuned, or is tuned once at go-live and never revisited as the estate grows. An assessment that assumes this AI is active and effective, rather than testing suggestion precision and review-workflow adoption directly, routinely overstates the automation the client already owns and understates the activation work actually required.",
  },
];
