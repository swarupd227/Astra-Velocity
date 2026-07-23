import type { Platform } from "../types";

/**
 * Technology & Platform Stack — the third composition axis alongside Sector and
 * Scenario: which technology stack the client actually runs. The anchor six are
 * the named-technology evaluation criterion from a real RFP's vendor-profile
 * section; the alternates are market-realistic substitutes assessment teams
 * encounter in practice. Client-generic, vendor-honest — a platform's native AI
 * is described plainly, including where it is thin.
 */
export const PLATFORMS: Platform[] = [
  {
    key: "idmc-cdgc",
    name: "Informatica IDMC / CDGC",
    vendor: "Informatica",
    category: "catalog-governance",
    tier: "anchor",
    summary:
      "Informatica's Intelligent Data Management Cloud, anchored here by Cloud Data Governance & Catalog (CDGC): a unified metadata catalog, business glossary, data quality engine, and lineage graph over the estate, positioned as the system of record for what a data element is, who owns it, and how sensitive it is.",
    capabilityRoles: {
      catalog_metadata: "anchor",
      data_quality: "anchor",
      lineage: "anchor",
      classification: "supports",
      semantic_layer: "supports",
      stewardship_ops: "supports",
    },
    nativeAi: {
      name: "CLAIRE",
      description:
        "CLAIRE drives auto-classification of scanned columns against a sensitivity taxonomy, auto-association that links technical assets to glossary terms from name and profile similarity, and anomaly detection inside CDQ that flags statistical drift in a data quality metric before a rule threshold is breached. It is genuinely core to the product rather than a bolt-on — most CDGC classification and glossary curation starts from a CLAIRE suggestion, not a blank form.",
    },
    marketContext:
      "The default catalog-governance anchor in enterprise carriers already standardized on Informatica for ETL or MDM, and the RFP's named reference point for what a governance suite is expected to do end to end.",
  },
  {
    key: "snowflake",
    name: "Snowflake",
    vendor: "Snowflake",
    category: "warehouse-lakehouse",
    tier: "anchor",
    summary:
      "A cloud data warehouse whose governance surface centers on native role-based access control, dynamic data masking, and object tagging — the enforcement layer most estates end up depending on regardless of which catalog sits above it.",
    capabilityRoles: {
      access_policy: "enforces",
      data_quality: "supports",
      lineage: "supports",
      semantic_layer: "supports",
    },
    nativeAi: {
      name: "Cortex",
      description:
        "Cortex ships governed AI functions (SQL-callable LLM tasks that respect the same RBAC and masking policies as any query) and Cortex Analyst, a semantic-layer-aware natural-language interface that answers business questions against a defined semantic model rather than raw tables. Governance-relevant use is real but narrow: it strengthens enforcement and query-time semantics, it does not discover or classify data on its own.",
    },
    marketContext:
      "The default warehouse choice for carriers consolidating analytics off legacy platforms, and frequently the de facto access-policy enforcement point even when a dedicated access-policy tool is also in the stack.",
  },
  {
    key: "databricks",
    name: "Databricks",
    vendor: "Databricks",
    category: "warehouse-lakehouse",
    tier: "anchor",
    summary:
      "A unified lakehouse platform where Unity Catalog is both the governance and lineage substrate — automatically capturing table- and column-level lineage across notebooks, jobs, and SQL, and enforcing access at the same layer that runs the compute.",
    capabilityRoles: {
      lineage: "anchor",
      access_policy: "enforces",
      catalog_metadata: "supports",
      classification: "supports",
      data_quality: "supports",
    },
    nativeAi: {
      name: "Unity Catalog AI / Databricks Assistant",
      description:
        "Unity Catalog's built-in lineage capture is automatic and requires no separate scanning step for anything that runs through the lakehouse. Databricks Assistant adds AI-generated code, documentation, and Lakehouse Monitoring anomaly signals on data quality expectations. As with Snowflake, this is strong workspace-native automation, not a general-purpose classification or catalog-curation engine reaching outside the lakehouse.",
    },
    marketContext:
      "The default lakehouse anchor for carriers with heavier data-science and ML workloads, and typically the strongest lineage source in a stack once anything crosses into it — the friction is usually what happens before and after the lakehouse boundary.",
  },
  {
    key: "bigid",
    name: "BigID",
    vendor: "BigID",
    category: "classification-discovery",
    tier: "anchor",
    summary:
      "A dedicated sensitive-data discovery and classification platform: scans structured and unstructured stores across the estate, applies ML classifiers tuned to regulatory categories, and produces a data-risk inventory that other tools consume rather than duplicate.",
    capabilityRoles: {
      classification: "anchor",
      catalog_metadata: "supports",
      access_policy: "supports",
    },
    nativeAi: {
      name: "BigID's ML classification engine",
      description:
        "This is BigID's actual product, not a feature: a library of ML classifiers and NLP models trained to recognize NPPI, PHI, PCI, and custom categories (claims medical narrative, litigation flags, producer license numbers) across structured columns, free-text fields, and unstructured documents, with a correlation engine that clusters records by data subject even across systems that share no key. Confidence-scored findings feed a risk inventory that access-policy and catalog tools are meant to read from, not re-derive.",
    },
    marketContext:
      "Brought in specifically when classification-discovery accuracy at scale — especially over unstructured and free-text claims content — exceeds what a catalog suite's built-in scanner reliably covers.",
  },
  {
    key: "immuta",
    name: "Immuta",
    vendor: "Immuta",
    category: "access-policy",
    tier: "anchor",
    summary:
      "A dedicated data access control platform that separates policy definition from data location: attribute- and purpose-based rules are authored once and enforced dynamically across connected warehouses and lakehouses, without duplicating masked views per consumer.",
    capabilityRoles: {
      access_policy: "anchor",
      stewardship_ops: "supports",
    },
    nativeAi: {
      name: "Policy automation (not ML classification)",
      description:
        "Immuta's intelligence is attribute- and purpose-based policy automation — translating a declared policy ('mask claimant medical fields for any purpose other than claims handling') into enforced logic across every connected platform — not a machine-learning discovery or classification engine. Honestly stated: Immuta does not generate sensitivity labels itself. It consumes classification tags produced by BigID, a catalog's native classifier, or platform-native tags, and its policy quality is only as good as the labels it is fed.",
    },
    marketContext:
      "Chosen when access policy needs to be centralized across more than one warehouse or lakehouse, or when purpose-based (not just role-based) access is a stated requirement — most often paired with BigID or a catalog suite as its classification source.",
  },
  {
    key: "power-bi",
    name: "Power BI",
    vendor: "Microsoft",
    category: "bi-consumption",
    tier: "anchor",
    summary:
      "The BI and consumption layer where certified datasets, measures, and reports meet business users — the point of the estate where 'is this number trustworthy' is answered visually, by an endorsement badge, or not at all.",
    capabilityRoles: {
      semantic_layer: "anchor",
      stewardship_ops: "supports",
      access_policy: "supports",
    },
    nativeAi: {
      name: "Copilot in Power BI",
      description:
        "Copilot drafts report narratives, suggests visuals, and answers natural-language questions against a semantic model — but it answers only as well as the underlying certified dataset and measure definitions it's pointed at. It doesn't create or reconcile metric definitions; a Copilot summary over an uncertified, ambiguously defined dataset produces a fluent, wrong answer just as easily as a human would.",
    },
    marketContext:
      "The default consumption layer in Microsoft-standardized carriers, and the place where a semantic-layer definition fight becomes visible to executives — whichever platform's number Power BI happens to be querying looks 'official' by default.",
  },
  {
    key: "collibra",
    name: "Collibra",
    vendor: "Collibra",
    category: "catalog-governance",
    tier: "alternate",
    summary:
      "An enterprise catalog and governance platform built around a strong workflow engine — approvals, issue management, policy lifecycle — with the business glossary as its historical center of gravity.",
    capabilityRoles: {
      catalog_metadata: "anchor",
      stewardship_ops: "anchor",
      classification: "supports",
      semantic_layer: "supports",
      lineage: "supports",
    },
    nativeAi: {
      name: "Collibra AI",
      description:
        "Collibra AI covers Edge-based automated classification during ingestion and catalog AI search and summarization (asking the catalog a question in natural language and getting a synthesized answer with source links). Solid and genuinely used, but the workflow engine — not the AI — remains what most Collibra deployments are chosen for.",
    },
    marketContext:
      "Common as the enterprise-glossary-first choice — frequently the incumbent in an LMI or investments division, or wherever governance stewardship workflow maturity outranked catalog-scanning breadth in the original tool selection.",
  },
  {
    key: "atlan",
    name: "Atlan",
    vendor: "Atlan",
    category: "catalog-governance",
    tier: "alternate",
    summary:
      "A modern, API-first metadata catalog built around 'active metadata' — pushing catalog context into the tools engineers already use (Slack, the IDE, the BI tool) rather than pulling engineers into a separate governance console.",
    capabilityRoles: {
      catalog_metadata: "anchor",
      stewardship_ops: "supports",
      lineage: "supports",
      classification: "supports",
    },
    nativeAi: {
      name: "Atlan AI",
      description:
        "Atlan AI generates natural-language search over the catalog and auto-drafts asset descriptions from schema, sample data, and usage context — a real time-saver for the glossary-authoring backlog, though descriptions still need steward review before they're trusted as definitions rather than helpful guesses.",
    },
    marketContext:
      "Favored by modern, developer-adjacent data teams already running dbt and a cloud warehouse, where Slack-native approval workflows and column-level lineage matter more than a heavyweight governance-council workflow engine.",
  },
  {
    key: "icedq",
    name: "iceDQ",
    vendor: "Torana",
    category: "data-quality",
    tier: "alternate",
    summary:
      "A data quality and reconciliation testing platform with roots in ETL/migration testing — strong at record-count and financial-balance reconciliation, source-to-target comparison, and regression testing around data movement events.",
    capabilityRoles: {
      data_quality: "anchor",
    },
    nativeAi: {
      name: "Minimal — rule-based by design",
      description:
        "Honestly: iceDQ's automation is largely rule-based configuration rather than ML-driven suggestion — you write reconciliation and comparison rules against a test-authoring interface, and it executes and reports on them at scale. There's no native anomaly-detection or auto-classification layer of note. That makes it a good candidate for an external agent layer to add drafting leverage — an agent proposing candidate reconciliation rules from profiling output is pure upside on a platform that otherwise expects a human to write every rule by hand.",
    },
    marketContext:
      "Common in finance and actuarial reconciliation-heavy contexts — conversions, migrations, and month-end tie-out testing — where its ETL-testing heritage matches the job precisely.",
  },
  {
    key: "dbt",
    name: "dbt",
    vendor: "dbt Labs",
    category: "data-quality",
    tier: "alternate",
    summary:
      "The transformation-as-code layer where analytics engineering teams define models, tests, documentation, and — via the dbt Semantic Layer — governed metric definitions, all version-controlled and deployed through the same CI pipeline as application code.",
    capabilityRoles: {
      data_quality: "anchor",
      lineage: "supports",
      semantic_layer: "supports",
    },
    nativeAi: {
      name: "dbt Copilot",
      description:
        "Available in dbt Cloud, dbt Copilot generates draft models, tests, and documentation from source schemas and existing project context — a real accelerant for engineering-led teams, though it operates purely within the transformation-as-code layer: it has no visibility into governance concerns like sensitivity classification or access policy outside the warehouse it's compiling SQL against.",
    },
    marketContext:
      "The default choice for engineering-led, transformation-as-code teams where 'the DAG is the lineage graph' and dbt tests are already how the team thinks about data quality, independent of whether a separate catalog or DQ suite is also present.",
  },
  {
    key: "azure-purview",
    name: "Microsoft Purview",
    vendor: "Microsoft",
    category: "catalog-governance",
    tier: "alternate",
    summary:
      "Microsoft's unified data governance and catalog service for the Azure estate: automated scanning and classification across Azure and hybrid sources, with data map lineage and an information-protection layer shared with the rest of the Microsoft 365 compliance stack.",
    capabilityRoles: {
      catalog_metadata: "anchor",
      classification: "supports",
      lineage: "supports",
      access_policy: "supports",
    },
    nativeAi: {
      name: "Purview built-in classifiers + Copilot for Security",
      description:
        "Purview ships a large library of built-in sensitive information types and trainable ML classifiers that scan and label data automatically as part of the same scan job that populates the catalog — genuinely low-effort classification for anything living in Azure. Copilot for Security integration extends this into investigation and compliance workflows. Coverage strongest inside Azure-native services; non-Azure sources rely on the same scanning connectors as any other catalog tool.",
    },
    marketContext:
      "The natural choice for Azure-native shops, where classification and access-policy labels (via Microsoft Information Protection sensitivity labels) already need to be consistent with the Microsoft 365 compliance boundary the rest of the enterprise runs on.",
  },
  {
    key: "ataccama",
    name: "Ataccama ONE",
    vendor: "Ataccama",
    category: "data-quality",
    tier: "alternate",
    summary:
      "A unified data quality, MDM, and catalog platform built around a strong self-service DQ authoring experience — business users and stewards define and monitor rules through a low-code interface without waiting on a central engineering queue.",
    capabilityRoles: {
      data_quality: "anchor",
      classification: "supports",
      catalog_metadata: "supports",
    },
    nativeAi: {
      name: "AI-powered anomaly detection and rule suggestion",
      description:
        "Ataccama ONE profiles incoming data continuously and uses ML to flag statistical anomalies and suggest candidate DQ rules from observed patterns — a genuine self-service accelerant that reduces how much rule-writing a steward does from scratch, though like its peers it suggests rather than certifies: a human still confirms the rule belongs before it goes live.",
    },
    marketContext:
      "Common where self-service DQ and MDM heritage matters more than a heavyweight catalog governance workflow — often the choice of a data quality-first team that backed into catalog and MDM capability rather than starting from a governance-council mandate.",
  },
];
