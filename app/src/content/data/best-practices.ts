import type { BestPractice } from "../types";

/**
 * Astra Velocity — Best Practices library.
 *
 * These are the operating rules of agentic data governance in insurance:
 * quotable, enforceable, and each one tied to a specific failure mode it
 * prevents. Client-generic; outcomes are framed as designed/typical results
 * proven in regulated P&C and financial-services environments.
 */
export const BEST_PRACTICES: BestPractice[] = [
  {
    key: "classify-once-propagate-everywhere",
    title: "Sensitivity is decided once and propagated everywhere",
    statement:
      "A data element's sensitivity classification is decided once, at a single authoritative point in the catalog, and propagated automatically — via lineage and tag inheritance — to every downstream copy, extract, semantic model, and report. No consuming platform re-decides sensitivity.",
    whatGoodLooksLike:
      "One classification taxonomy, mastered in the catalog, drives Snowflake tags, lakehouse column masks, access-policy conditions, and BI-layer labels from the same source of truth. When a steward reclassifies a column, every derived asset inherits the change within the same day, and the propagation is itself logged and auditable.",
    antiPattern:
      "Four parallel sensitivity taxonomies — one in the scanner, one in the warehouse, one in the access tool, one in a spreadsheet — that disagree with each other, so access policy trusts none of them and every unlock request becomes a bespoke negotiation.",
    evidence:
      "Proven pattern in regulated P&C and financial-services environments. Typical result: sensitive-data access requests resolved in days instead of quarters, because the enforcement chain from discovery to policy is one chain, not four opinions.",
    capabilities: ["classification", "access_policy", "lineage", "catalog_metadata"],
    obligationKeys: ["glba-nppi", "state-privacy-laws", "hipaa-phi"],
    sectorNotes: {
      "health-benefits":
        "PHI demands an unbroken chain from discovery to enforcement: a diagnosis code classified once in the catalog must arrive pre-masked in every actuarial extract and care-management mart, or HIPAA minimum-necessary is being re-litigated per dataset.",
      "pc-personal":
        "Claims files carry medical records, litigation and SIU material, and financial data of claimants who are not customers — sensitivity the CRM-centric view of 'customer PII' misses entirely. The taxonomy must be decided at the claims domain, then propagated.",
      "life-annuities":
        "Underwriting files mix financial NPPI with medical evidence (APS, lab results) under different retention duties; one classification decision must carry both dimensions downstream rather than forcing each admin-system extract to re-derive them.",
    },
    platformNotes: {
      "idmc-cdgc":
        "CDGC classification propagates through CLAIRE-tuned associations to Snowflake object tags and Immuta attributes — one chain, no manual re-tagging.",
      snowflake:
        "Object tags set once at classification time drive Snowflake's native masking policies directly, so the warehouse enforces what the catalog decided rather than re-evaluating it.",
      databricks:
        "Unity Catalog tags set once at the catalog layer are the single source both Immuta-style and native access policies read from, so a reclassification in Unity Catalog is the only edit required.",
      bigid:
        "BigID's correlation engine assigns the sensitivity label once at the data-subject level and publishes it as the tag other tools read — it is the discovery source of truth, not a second opinion alongside the catalog's own scanner.",
      immuta:
        "Immuta never re-decides sensitivity; it subscribes to the classification tag from BigID or the catalog and turns it into enforced policy, so the propagation chain only breaks if the tag feed itself breaks.",
      "power-bi":
        "Sensitivity labels inherited from upstream tags carry through as Power BI data classification labels on certified datasets, so a masked column stays visibly and functionally masked at the report layer without a separate BI-side decision.",
    },
  },
  {
    key: "one-certified-definition-per-metric",
    title: "Every metric has exactly one certified definition — and it runs as code",
    statement:
      "Each business metric — earned premium, loss ratio, combined ratio, persistency — has exactly one certified definition, owned by a named business owner, expressed as executable semantic-layer code, and every certified report consumes that definition rather than re-deriving it.",
    whatGoodLooksLike:
      "'Loss ratio' resolves to one formula with explicit earned-vs-written basis, catastrophe treatment, and ALAE/ULAE handling, versioned in the semantic layer. Finance, actuarial, and the executive flash report all read the same certified measure, and any variant metric is visibly labeled as uncertified.",
    antiPattern:
      "Three departments present three loss ratios to the same executive meeting — each defensible, none reconciled — and the meeting is spent arguing about whose number is right instead of what to do about it.",
    evidence:
      "Proven in P&C finance and actuarial reporting environments. Typical result: metric disputes at leadership reviews drop to near zero, and reconciliation effort shifts from every close to a one-time certification exercise.",
    capabilities: ["semantic_layer", "catalog_metadata", "data_quality"],
    obligationKeys: ["sox-icfr", "statutory-annual-statement", "ifrs-17-ldti"],
    sectorNotes: {
      reinsurance:
        "Gross, ceded, and net views of the same treaty must be certified as three explicit measures of one definition family — not three independent numbers — or retro recoveries and net loss ratios will never tie.",
      "pc-commercial":
        "Earned premium on audit-adjusted and retrospectively rated policies is where definitions splinter fastest; the certified definition must state the audit and retro treatment explicitly.",
    },
    platformNotes: {
      "idmc-cdgc":
        "The certified definition lives as a business term with a linked technical association in CDGC's glossary, and every physical asset the term touches is discoverable from that one entry.",
      snowflake:
        "Cortex Analyst's semantic model is where the certified formula actually executes for AI-assisted queries, so the definition must be maintained there, not just documented in a glossary Cortex never reads.",
      databricks:
        "Unity Catalog metrics views (or a governed SQL view) express the certified formula once at the lakehouse layer, so every downstream notebook and job resolves the same number rather than re-deriving it.",
      bigid:
        "Not a semantic-layer platform — BigID's role here is limited to confirming which underlying fields the certified metric draws on carry the sensitivity labels its inventory expects.",
      immuta:
        "Immuta enforces access to the fields the metric is built from but does not participate in defining the metric itself — the certified formula must be resolved upstream of any policy Immuta applies.",
      "power-bi":
        "The formula is expressed once as a certified dataset measure and endorsed, so every report built on that dataset inherits the same calculation instead of a report author re-typing the DAX.",
    },
  },
  {
    key: "cde-anchored-quality",
    title: "Data quality is anchored to critical data elements, not sprayed across columns",
    statement:
      "Data quality rules attach to the registered critical data elements that materially drive financial statements, pricing, reserving, and regulatory filings — each CDE carrying a named owner, a materiality rationale, and control linkage — rather than being distributed evenly across every column that exists.",
    whatGoodLooksLike:
      "A CDE registry of hundreds, not tens of thousands, of elements — loss date, paid loss, case reserve, exposure base, line of business — each with rules whose thresholds are set by the downstream use (statutory filing vs. exploratory analytics), and a coverage report that says 'x% of CDEs feeding Schedule P are under active control'.",
    antiPattern:
      "Twelve thousand generic null-check rules producing a wall of red no one triages, while the loss-date field that drives reserve development triangles has no rule at all because rule-writing effort was spread by table, not by materiality.",
    evidence:
      "Proven in statutory and financial reporting data environments. Typical result: rule count falls by an order of magnitude while defect detection on filing-critical elements rises, and stewards can state coverage in a sentence an auditor accepts.",
    capabilities: ["data_quality", "catalog_metadata", "stewardship_ops"],
    obligationKeys: ["asop-23", "schedule-p", "naic-model-audit-rule", "sox-icfr"],
    sectorNotes: {
      "life-annuities":
        "PBR under VM-20 makes experience-study inputs (mortality, lapse, expense) first-class CDEs: quality on those elements is quality on the reserve itself.",
      surety:
        "Financial-statement data of principals — the core underwriting input — is externally sourced and refresh-dated; CDE controls here are freshness and completeness controls on someone else's books.",
    },
    platformNotes: {
      "idmc-cdgc":
        "CDEs register as a tagged subset of the catalog with CDQ rules bound directly to each registered element, so coverage reporting is a filtered view, not a separate exercise.",
      snowflake:
        "CDE-critical columns get flagged with a governance tag that Cortex-based monitoring and downstream masking policies both key off of, keeping the 'this column matters' signal in one place.",
      databricks:
        "Lakehouse Monitoring expectations attach to the CDE's table at the point it lands, so quality checks run as part of the same pipeline that produces the data rather than a bolted-on batch job.",
      bigid:
        "BigID's discovery inventory tells you where a CDE's values physically live and duplicate across the estate, which is the input CDE ownership decisions need before a rule gets written anywhere.",
      immuta:
        "CDE status has no direct policy meaning in Immuta by itself, but CDE tags are commonly reused as one of the attributes a purpose-based policy condition keys on.",
      "power-bi":
        "CDE-anchored measures get the certification badge in the dataset, so a report built on an uncertified, non-CDE-anchored figure is visibly distinguishable from one that isn't.",
    },
  },
  {
    key: "regulator-explainable-lineage",
    title: "Lineage is built to be explained to a regulator, not admired in a graph",
    statement:
      "Lineage exists to answer the examiner's question — 'show me how this filed number was produced, and who touched it' — in minutes. Build it source-to-consumption for regulated flows first, document manual stitches honestly where scanners cannot reach, and treat an unexplainable hop as a defect.",
    whatGoodLooksLike:
      "For every statutory and audited flow, a steward can walk from the filed figure back to source-system fields — through transformations, with the manual-stitch segments visibly flagged and evidenced — and export that walk as an audit artifact without a special project.",
    antiPattern:
      "A beautiful auto-generated lineage graph covering 40% of the estate, silent about which 40%, so when the examination letter arrives the team spends six weeks doing data archaeology by interview for exactly the flows the graph missed.",
    evidence:
      "Proven under audit and market-conduct examination conditions in regulated carriers. Typical result: regulator and audit data requests answered from the lineage record in hours, replacing multi-week reconstruction efforts each cycle.",
    capabilities: ["lineage", "catalog_metadata", "data_quality"],
    obligationKeys: [
      "naic-model-audit-rule",
      "sox-icfr",
      "statutory-annual-statement",
      "state-doi-market-conduct",
      "solvency-ii",
    ],
    sectorNotes: {
      reinsurance:
        "Lineage must survive the ceded boundary: from cedent bordereaux through transformation to the retro and net positions, including the spreadsheet stitches that dominate assumed books — documented, not hidden.",
      investments:
        "Schedule D calls for security-level traceability from custodian and pricing feeds to the filed schedule; a lineage gap here is a filing-quality issue, not a metadata gap.",
    },
    platformNotes: {
      "idmc-cdgc":
        "CDGC's lineage graph stitches across scanned sources and can carry manually-documented hops as first-class, visibly flagged segments — the honest 'we stitched this by hand' the practice requires.",
      snowflake:
        "Snowflake's query-level access history gives object-to-object lineage inside the warehouse for free, but it stops at the warehouse boundary — everything upstream needs a scanner or manual stitch to connect.",
      databricks:
        "Unity Catalog lineage is automatic and column-level for anything that runs as a notebook, job, or SQL statement inside the lakehouse — the strongest in-boundary lineage source in the stack, with the same boundary limitation as Snowflake.",
      bigid:
        "BigID contributes data-flow lineage in its own right — where a sensitive attribute correlates and propagates across systems — which is a useful cross-check against the catalog's structural lineage graph.",
      immuta:
        "Immuta is not a lineage source; its relevance here is that its policy audit log shows who accessed data along a traced flow, which is often the second half of what an examiner actually asks for.",
      "power-bi":
        "Power BI's dataset lineage view shows report-to-dataset-to-source dependencies within the Microsoft ecosystem, but calculated columns and report-level joins are exactly the report-edge gap the practice warns about.",
    },
  },
  {
    key: "agents-draft-stewards-decide",
    title: "Agents draft, stewards decide, everything is logged",
    statement:
      "AI agents produce drafts — candidate classifications, glossary terms, DQ rules, lineage stitches, triage recommendations — and a named human steward makes every accept/reject decision. No agent output reaches a system of record without a logged human decision, and the log links suggestion, decision, decider, and rationale.",
    whatGoodLooksLike:
      "Stewards work a review queue, not a blank page: agent suggestions arrive with confidence scores and evidence, acceptance rates are tracked per agent, and any regulator or auditor can replay exactly which human approved which governance artifact and when.",
    antiPattern:
      "Auto-accepted AI classifications flow straight into access enforcement; six months later nobody can say which policies rest on an unreviewed guess, and the AI-governance response to the regulator starts with an apology.",
    evidence:
      "Designed outcome consistent with supervised-AI operating models in regulated financial services: agent leverage measured in steward-hours saved, with a decision log that turns AI-governance questions into a lookup instead of an investigation.",
    capabilities: ["stewardship_ops", "classification", "data_quality", "catalog_metadata"],
    obligationKeys: ["naic-ai-model-bulletin", "eu-ai-act", "asop-56"],
    platformNotes: {
      "idmc-cdgc":
        "CLAIRE suggestions land in CDGC's review workflow with confidence scores attached, and nothing publishes to the glossary or catalog tags until a steward acts on the queue item.",
      snowflake:
        "Cortex-generated outputs (a governed AI function's answer, a Cortex Analyst response) are logged in query history like any other operation, but Snowflake itself has no steward-review queue — that has to be built at the application layer consuming Cortex.",
      databricks:
        "Databricks Assistant suggestions land as code or documentation a human reviews before merging, same as any pull request, but the accept/reject decision has to be captured deliberately since it isn't a native governance workflow.",
      bigid:
        "BigID's classification findings arrive scored by confidence and are meant to route to a human reviewer before a label is treated as final — auto-apply is a configuration choice, not the default.",
      immuta:
        "Immuta has no draft-suggestion surface of its own; the human-decides step here happens upstream, at whichever tool proposes the classification Immuta's policy will act on.",
      "power-bi":
        "Copilot-drafted report content is visibly distinct until a report author reviews and publishes it, and certification/endorsement remains a separate, explicit steward action Copilot cannot grant itself.",
    },
  },
  {
    key: "governance-as-code",
    title: "Governance definitions run as code, or they drift",
    statement:
      "Classifications, DQ rules, glossary structures, masking policies, and access conditions are expressed as declarative, versioned definitions validated in CI and deployed through pipelines — not hand-configured per environment. A definition that only exists as tool configuration is a definition that will drift.",
    whatGoodLooksLike:
      "A pull request changes a masking rule; CI validates it against the schema and policy tests; the change deploys identically to every environment; and the git history is the change-control evidence. Onboarding data product N+1 reuses the codified patterns of products 1..N.",
    antiPattern:
      "The same policy hand-entered slightly differently in dev, test, and prod across three tools; nobody can say which version is authoritative, and every new data product re-pays the full configuration cost of the first one.",
    evidence:
      "Proven engineering pattern applied to governance in regulated environments. Typical result: per-product governance cost declines with each onboarding as patterns compound, and configuration drift findings disappear from audits.",
    capabilities: ["access_policy", "data_quality", "classification", "semantic_layer"],
    obligationKeys: ["sox-icfr", "naic-model-audit-rule"],
    platformNotes: {
      "idmc-cdgc":
        "Classifications, glossary structures, and CDQ rules deploy through CDGC's REST APIs from a CI pipeline, so the same definition set that passed review is what actually lands in the tool, not a hand-re-entered copy.",
      snowflake:
        "Masking policies, row-access policies, and tags are DDL — version-controlled, code-reviewed, and applied via CI the same as a schema migration, which is the strongest governance-as-code fit of any platform in the stack.",
      databricks:
        "Unity Catalog grants, tags, and table constraints are managed as Terraform or Databricks CLI resources, so access and classification state is declared in code rather than clicked through the workspace UI.",
      bigid:
        "Classifier policies and scan configurations are managed through BigID's API, letting a pipeline deploy a tuned classification policy identically across environments instead of re-tuning per environment by hand.",
      immuta:
        "Immuta policies are authored as versioned policy-as-code definitions and deployed via API, which is the point of the platform — policy drift between dev, test, and prod is close to the failure mode Immuta was built to prevent.",
      "power-bi":
        "Certified dataset and endorsement state can be managed via the Power BI REST API and deployment pipelines, though report-level content still depends on authors following the pipeline rather than publishing ad hoc from Desktop.",
    },
  },
  {
    key: "govern-at-inception",
    title: "Govern data products at inception — retrofits cost five times more",
    statement:
      "Governance requirements — classification, CDE identification, contract definition, DQ thresholds, lineage registration — enter the data product's definition-of-done at design time. A product does not ship 'to be governed later'; later is where governance goes to die.",
    whatGoodLooksLike:
      "The product template carries governance scaffolding by default: new lakehouse schemas arrive with catalog registration, tag inheritance, and baseline rules pre-wired. Early-stage platforms are governed correctly the first time instead of becoming the next remediation program.",
    antiPattern:
      "A greenfield platform launches ungoverned 'to move fast'; two years on, retrofitting classification and lineage across hundreds of shipped tables costs a multiple of building it in — and the interim exposure was carried silently.",
    evidence:
      "Typical result observed across platform build-outs in regulated carriers: inception-time governance adds days to a product's build and saves steward-months of retrofit, with the gap widening as the platform scales.",
    capabilities: ["catalog_metadata", "classification", "data_quality", "lineage"],
  },
  {
    key: "lineage-effort-triage",
    title: "Spend lineage effort where the question will be asked",
    statement:
      "Lineage build effort is triaged by interrogation risk: regulated and audited flows get source-to-consumption depth including manual stitching; analytics convenience flows get scanner-only coverage; and the coverage map states explicitly which flows sit at which tier.",
    whatGoodLooksLike:
      "A published lineage coverage map, tiered by obligation: statutory, SOX, and privacy-relevant flows at evidence grade, the long tail at automated-scan grade, and a standing triage rule for where each new flow lands — so effort tracks risk instead of scanner convenience.",
    antiPattern:
      "The team pursues 100% automated lineage everywhere, exhausts the budget on flows nobody will ever be asked about, and still cannot answer the one Schedule P interrogation that mattered because it crossed a mainframe hop the scanner could not see.",
    evidence:
      "Proven triage method in complex carrier estates with mainframe and spreadsheet hops. Typical result: evidence-grade lineage on the flows regulators actually interrogate at a fraction of the cost of uniform coverage.",
    capabilities: ["lineage", "stewardship_ops"],
    obligationKeys: ["naic-model-audit-rule", "sox-icfr", "schedule-p"],
  },
  {
    key: "remediation-loop-not-dashboard",
    title: "A DQ breach opens a remediation loop, not a dashboard pixel",
    statement:
      "Every data quality rule breach routes to a named owner with severity, an SLA, and a resolution path that ends in root-cause fix or an explicit, logged risk acceptance. A rule whose breaches nobody triages is deleted or repaired — never left red.",
    whatGoodLooksLike:
      "Breach-to-triage and breach-to-resolution times are themselves measured; aging untriaged breaches escalate automatically; and the DQ dashboard shows a working queue trending down, with recurring root causes feeding upstream fixes rather than recurring tickets.",
    antiPattern:
      "The dashboard graveyard: 4,000 perpetually failing rules that everyone has learned to ignore, which is worse than no rules at all because it trains the organization that red means nothing.",
    evidence:
      "Proven operational pattern in carrier DQ programs. Typical result: sustained fall in repeat-breach rate and restored trust in the signal — a red rule once again means someone is acting.",
    capabilities: ["data_quality", "stewardship_ops"],
    obligationKeys: ["asop-23", "naic-model-audit-rule"],
  },
  {
    key: "purpose-based-access",
    title: "Access follows purpose, not org chart",
    statement:
      "Access to sensitive data is granted against a declared, reviewable purpose bound to classification-aware policy — masked, row-limited, or full, per purpose — rather than inherited from role or department. Purposes expire and are recertified; unused grants are revoked automatically.",
    whatGoodLooksLike:
      "An analyst requests claims data for a fraud-analytics purpose and receives, within a day, exactly the columns that purpose justifies — medical narrative masked, financials clear — with the grant, purpose, and expiry recorded for the next privacy audit.",
    antiPattern:
      "Department-level entitlements accreted over a decade mean the marketing team technically holds claimant medical data, and the sensitive-data unlock program stalls because nobody can enumerate — let alone defend — who can see what and why.",
    evidence:
      "Proven in privacy-constrained analytics programs in insurance and banking. Typical result: previously frozen sensitive datasets safely unlocked for analytics, with access reviews shrinking from a quarterly ordeal to a report.",
    capabilities: ["access_policy", "classification", "stewardship_ops"],
    obligationKeys: ["glba-nppi", "state-privacy-laws", "hipaa-phi"],
    sectorNotes: {
      "health-benefits":
        "Purpose is the regulatory native language here: HIPAA minimum-necessary is literally purpose-based access, so treatment, payment, and operations purposes map directly to policy conditions.",
      "pc-personal":
        "Claims and SIU purposes must be distinguishable from marketing and product purposes in policy, because the same claim record is lawful for one and radioactive for the other under state privacy laws.",
      "brokerage-mga":
        "Carrier data shared into a broker or MGA estate carries contractual as well as regulatory purpose limits; policy must encode the carrier agreement, not just the statute.",
    },
    platformNotes: {
      "idmc-cdgc":
        "CDGC can model the purpose taxonomy itself as governed reference data, so 'fraud-analytics purpose' is a stewarded, versioned value rather than a string baked into policy code.",
      snowflake:
        "Purpose-aware conditions express as row-access policies and conditional masking policies keyed on a session or role attribute carrying the declared purpose, enforced natively at query time.",
      databricks:
        "Unity Catalog row filters and column masks support the same attribute-based pattern, evaluated against a user or group attribute that encodes the declared purpose.",
      bigid:
        "BigID's role is upstream of enforcement: its sensitivity labels tell the policy which fields are in scope for masking under a given purpose, but it does not evaluate or grant the purpose itself.",
      immuta:
        "Purpose-based access is Immuta's signature capability — purposes are first-class policy objects with expiry and recertification built in, which is usually why Immuta gets selected over native RBAC alone.",
      "power-bi":
        "Row-level security roles can be mapped to declared purposes, but Power BI RLS is coarser than Immuta-style dynamic masking, so purpose granularity here typically rides on top of a policy decision made upstream in the warehouse.",
    },
  },
  {
    key: "agents-on-metadata-only",
    title: "Governance agents read metadata, never the sensitive payload",
    statement:
      "Governance agents operate on metadata, statistical profiles, lineage graphs, and rule telemetry — not on raw NPPI, PHI, or claim-file content. Where sampling is unavoidable for classification, it runs against masked or synthetic samples inside the governed boundary, and the agent's data diet is itself documented and auditable.",
    whatGoodLooksLike:
      "The agent architecture diagram shows exactly which stores each agent can read, none of which contain unmasked sensitive payloads; the privacy office signs off on the agent data-flow once, and every new agent inherits the boundary by design.",
    antiPattern:
      "An eager classification agent is pointed at raw claim files 'for accuracy', and the governance program becomes its own privacy incident — the AI that was supposed to reduce exposure created a new one.",
    evidence:
      "Designed outcome for supervised-agent architectures in privacy-regulated carriers: agent utility on classification and rule-drafting tasks retained while the sensitive-data attack surface of the governance platform itself stays near zero.",
    capabilities: ["classification", "access_policy", "stewardship_ops"],
    obligationKeys: ["glba-nppi", "hipaa-phi", "naic-ai-model-bulletin", "eu-ai-act"],
  },
  {
    key: "measured-leverage",
    title: "Agent leverage is measured, not asserted",
    statement:
      "Every governance agent carries an explicit leverage metric — steward-hours saved, suggestions accepted per hour of review, cycle-time reduction — computed from the decision log, reported per agent per period, and used to decide which agents scale, which get retuned, and which get retired.",
    whatGoodLooksLike:
      "A leverage dashboard shows, per agent: suggestion volume, acceptance rate, precision trend, and net steward-time saved after review cost. Program value claims cite these numbers; an agent whose acceptance rate decays gets benched, not defended.",
    antiPattern:
      "The program reports 'AI-enabled governance' in status decks while stewards privately spend longer correcting agent noise than the drafting saved — asserted leverage with negative measured leverage.",
    evidence:
      "Designed outcome of instrumented agent operations. Typical result: per-product governance effort visibly declines release over release, and the economics case for scaling is made from telemetry rather than anecdote.",
    capabilities: ["stewardship_ops", "data_quality", "catalog_metadata"],
    obligationKeys: ["naic-ai-model-bulletin", "asop-56"],
    platformNotes: {
      "idmc-cdgc":
        "CLAIRE suggestion and acceptance events are queryable through CDGC's audit and activity APIs, giving a direct feed for a per-agent leverage dashboard without a separate telemetry build.",
      snowflake:
        "Cortex function calls and query history are logged in Snowflake's account usage views, so leverage measurement can be computed as a scheduled query against native telemetry rather than a bolted-on log pipeline.",
      databricks:
        "Databricks Assistant usage and Lakehouse Monitoring alert-to-resolution timing are both available via system tables, making steward-time-saved a queryable metric rather than a manually reconstructed one.",
      bigid:
        "BigID's classification review workflow logs acceptance and rejection per finding, which is the raw input a leverage metric needs before it can be trusted as more than an assertion.",
      immuta:
        "Immuta's policy change and access-grant audit log supports measuring cycle-time reduction on access requests, one of the clearest leverage numbers a purpose-based-access rollout can point to.",
      "power-bi":
        "Usage metrics and Copilot interaction logs (where enabled) show how often AI-assisted content gets published versus discarded, a proxy for measuring whether Copilot leverage is real or just switched on.",
    },
  },
  {
    key: "named-trainees-demonstrated-readiness",
    title: "Enablement means named people demonstrating the work, not attendance sheets",
    statement:
      "Capability transfer is planned per named individual against a specific role — steward, product owner, platform engineer — and completed only when that person demonstrates the work end-to-end (classify a domain, certify a metric, run a remediation loop) under observation, with the demonstration recorded.",
    whatGoodLooksLike:
      "A readiness matrix lists each named trainee, the competency, the demonstration date, and the artifact produced; by exit, the client team has run a full governance cycle on a real product without partner hands on keyboard.",
    antiPattern:
      "Forty people attend six webinars, the partner rolls off, and within a quarter the governance rhythm stops — because attendance was measured and capability never was.",
    evidence:
      "Proven enablement pattern in side-by-side delivery models. Typical result: governance operations continue at the same cadence after partner exit, verified by the same telemetry that measured them during the engagement.",
    capabilities: ["stewardship_ops"],
  },
  {
    key: "pattern-reuse-economics",
    title: "The Nth data product must cost less to govern than the first",
    statement:
      "Every governed product contributes its patterns — codified rules, classifier tunings, contract templates, onboarding runbooks — back to a reusable library, and per-product governance cost is tracked so the declining curve is a managed commitment, not a hope.",
    whatGoodLooksLike:
      "Product onboarding starts from the pattern library, not a blank workshop; measured steward-weeks per product falls release over release; and the scale plan to a 150+ product portfolio is priced off the observed curve rather than the first product's cost.",
    antiPattern:
      "Each data product is governed as an artisanal one-off; product 40 costs what product 1 cost, the portfolio math requires a standing team nobody will fund, and the scale plan quietly dies in the budget cycle.",
    evidence:
      "Proven economics of governance-as-code plus agent assistance in multi-product portfolios. Typical result: material decline in steward-weeks per product across successive onboarding waves, making portfolio-scale targets financeable.",
    capabilities: ["stewardship_ops", "data_quality", "catalog_metadata", "semantic_layer"],
  },
  {
    key: "obligation-traceability",
    title: "Every control traces to an obligation; every obligation lands on a control",
    statement:
      "Each regulatory obligation is decomposed to the data controls that evidence it — and each governance control names the obligations it serves. The mapping is bidirectional and maintained: an unmapped control is a cost question, an unmapped obligation is an exposure.",
    whatGoodLooksLike:
      "An examiner asks how the carrier evidences ASOP 23 data quality for reserving; the answer is a generated report walking obligation → CDEs → rules → breach history → remediation log. New regulation triage starts by diffing against the existing control map.",
    antiPattern:
      "Compliance maintains an obligations register and data governance maintains a rule library, and the two have never met — so exam prep is a heroic quarterly cross-walk done in spreadsheets from memory.",
    evidence:
      "Proven in exam-facing carriers. Typical result: regulatory data requests answered from the traceability record in days, and new-obligation impact assessment reduced from a project to a query.",
    capabilities: ["catalog_metadata", "data_quality", "lineage", "access_policy"],
    obligationKeys: [
      "naic-model-audit-rule",
      "sox-icfr",
      "asop-23",
      "state-doi-market-conduct",
      "solvency-ii",
      "lloyds-minimum-standards",
    ],
    sectorNotes: {
      "specialty-es":
        "Surplus-lines and London-market business layers Lloyd's minimum standards over state surplus-lines rules; the control map must show which regime each control evidences, per flow.",
      "life-annuities":
        "PBR reporting under VM-20 and IFRS 17/LDTI transition both interrogate the same experience-data controls; one traceability map serves both rather than two parallel evidence efforts.",
    },
  },
  {
    key: "steward-as-supervisor",
    title: "The steward's job shifts from producing metadata to supervising its production",
    statement:
      "Redefine the steward role around judgment: reviewing agent drafts, deciding edge cases, owning remediation outcomes, and certifying definitions — with queues, SLAs, and tooling built for supervision. Stop staffing and measuring stewards as manual metadata typists.",
    whatGoodLooksLike:
      "A steward's day is a prioritized decision queue — classifications to confirm, rule breaches to adjudicate, definitions to certify — with drafting already done; role descriptions, capacity models, and performance measures all reflect decisions made, not fields filled.",
    antiPattern:
      "Agents are deployed but stewards are still measured on terms authored per week, so they ignore the review queue to keep hand-typing glossary entries — the org bought leverage and kept the old production line.",
    evidence:
      "Designed outcome of the supervised-agent operating model. Typical result: steward throughput per FTE rises severalfold on drafting-heavy work while decision quality is preserved by the human gate and its log.",
    capabilities: ["stewardship_ops", "catalog_metadata"],
    obligationKeys: ["naic-ai-model-bulletin"],
  },
  {
    key: "data-contracts-at-boundaries",
    title: "Every producer-consumer boundary carries an explicit data contract",
    statement:
      "Where data crosses a team, system, or company boundary — policy admin to warehouse, TPA to claims mart, cedent to reinsurer — the interface is governed by a versioned contract: schema, semantics, quality thresholds, freshness, and sensitivity handling. Breaking changes require a contract version, not an apology after the fact.",
    whatGoodLooksLike:
      "Contracts are machine-validated on every delivery: a TPA feed that violates its completeness threshold is quarantined at the boundary with an automatic producer notification — before, not after, it poisons the loss triangle.",
    antiPattern:
      "An upstream policy-admin release silently renames a field; the break is discovered three weeks later inside the actuarial close, and the post-mortem's only remedy is 'better communication'.",
    evidence:
      "Proven boundary-control pattern in multi-system carrier estates. Typical result: schema-break incidents caught at delivery time instead of at close, and inter-team data disputes resolved by reading the contract instead of escalating.",
    capabilities: ["data_quality", "catalog_metadata", "semantic_layer"],
    sectorNotes: {
      reinsurance:
        "The cedent bordereau is the contract surface: layer, treaty reference, and loss-detail standards belong in a validated contract, because chasing malformed bordereaux is the assumed book's single largest data cost.",
      "brokerage-mga":
        "MGAs live on carrier bordereaux obligations in both directions — binding-authority data standards downloaded from carriers, production data uploaded back — making contracts the survival mechanism, not a nicety.",
      "health-benefits":
        "834 enrollment and 837 claims feeds already have industry syntax; the contract adds the carrier's semantic and quality layer on top — eligibility timeliness, COB completeness — where the real breakage lives.",
    },
  },
  {
    key: "certified-data-products",
    title: "Certification is a visible gate with published criteria — and it can be lost",
    statement:
      "A data product is 'certified' only when it passes published, checkable criteria — owner named, CDEs registered and under control, contract published, lineage at required tier, sensitivity enforced — and certification is displayed at the point of consumption and revoked when criteria lapse.",
    whatGoodLooksLike:
      "Consumers see the certification mark and its date in the catalog and in BI tools; a lapsed DQ control automatically flips the product to 'certification at risk' with owner notification; executives can ask 'how many products are certified?' and get a number that means something.",
    antiPattern:
      "'Certified' is a badge applied once at launch and never re-checked, so consumers learn it is decorative — and revert to asking a person they trust which extract to use, which was the problem certification existed to solve.",
    evidence:
      "Proven trust mechanism in analytics estates. Typical result: consumption measurably migrates from ad-hoc extracts to certified products, and 'which number is right' escalations decline as the mark becomes load-bearing.",
    capabilities: ["catalog_metadata", "data_quality", "semantic_layer", "stewardship_ops"],
  },
  {
    key: "reference-data-stewarded",
    title: "Reference data is stewarded like master data, because every join depends on it",
    statement:
      "Line-of-business codes, state and jurisdiction codes, cause-of-loss codes, currency and treaty codes are owned, versioned, and distributed from a single stewarded source with effective dating. No consuming system maintains its own private copy of a code list.",
    whatGoodLooksLike:
      "One reference-data service with effective-dated values and change notifications; mappings between statutory line and internal product hierarchies are themselves versioned artifacts; a code change is one governed event, not forty silent divergences.",
    antiPattern:
      "Each warehouse and mart maintains its own hand-copied LOB table; two of them drift after an annual statement line change, and the premium reconciliation gap that follows takes a quarter to trace back to a code list.",
    evidence:
      "Proven pattern in multi-platform carrier estates. Typical result: reconciliation breaks attributable to reference-data drift approach zero, and regulatory line-of-business rollups become mechanical rather than forensic.",
    capabilities: ["catalog_metadata", "data_quality", "semantic_layer"],
    obligationKeys: ["statutory-annual-statement", "schedule-p"],
    sectorNotes: {
      investments:
        "Security identifiers and ratings sources (CUSIP/ISIN, NAIC designations) are the reference backbone of Schedule D; version and source-date them, or the filing inherits the vendor's silent restatements.",
      "specialty-es":
        "Non-admitted eligibility and surplus-lines tax rules vary by state and change midyear; effective-dated jurisdiction reference data is the difference between automated and hand-checked compliance.",
    },
  },
  {
    key: "party-resolution-first",
    title: "Resolve the party once, or every downstream count is wrong",
    statement:
      "Customer, claimant, provider, and producer identities are resolved through a governed party-matching capability — with survivorship rules, match-confidence thresholds, and steward review of low-confidence merges — before analytics and reporting consume them. Party resolution is an input control, not an analytics afterthought.",
    whatGoodLooksLike:
      "One governed party spine feeds exposure counts, claims frequency, producer rollups, and sanctions screening; merge and split decisions are logged and reversible; and 'how many customers do we have' has one answer with a stated confidence basis.",
    antiPattern:
      "Five systems hold five spellings of the same insured; the sanctions screen misses a match the OFAC examiner later finds, and the retention model double-counts the carrier's best customer as two mediocre ones.",
    evidence:
      "Proven in carrier MDM and screening programs. Typical result: duplicate-party rates fall to auditable residual levels, screening false-negative risk is materially reduced, and per-party analytics (lifetime value, cross-sell, leakage) become trustworthy.",
    capabilities: ["data_quality", "catalog_metadata", "stewardship_ops"],
    obligationKeys: ["ofac-sanctions", "glba-nppi"],
    sectorNotes: {
      "health-benefits":
        "Member-provider-subscriber resolution across enrollment, claims, and care systems is the integrity backbone: dependent mismatches and provider NPI duplicates directly distort utilization and COB recovery.",
      "brokerage-mga":
        "Producer hierarchies (individual, agency, aggregator) are party resolution's hardest case here; commission accuracy and appointment compliance both hang on one governed producer spine.",
    },
  },
  {
    key: "value-moments-visibility",
    title: "Governance earns its funding through visible value moments",
    statement:
      "The program is narrated through concrete, dated moments a business stakeholder felt — the first close without a caveat, the privacy unlock that shipped a stalled model, the exam answered in a day — captured with before/after evidence and attributed to the specific governance capability that produced them.",
    whatGoodLooksLike:
      "A running value ledger pairs each moment with its telemetry (cycle time, effort saved, risk retired) and its beneficiary by name and role; QBR content is drawn from the ledger, and the funding conversation cites felt outcomes, not maturity scores.",
    antiPattern:
      "The program reports capability maturity uplift 2.1 → 2.7 for two years; no business stakeholder can name a thing that got better, and the budget is halved at the next planning cycle — competence defunded for invisibility.",
    evidence:
      "Proven program-management pattern in multi-year governance investments. Typical result: sustained executive sponsorship through budget cycles, because the program's value is remembered in stories that carry numbers.",
    capabilities: ["stewardship_ops", "semantic_layer"],
  },
  {
    key: "duplicate-views-retired",
    title: "Certify the one, then retire the many",
    statement:
      "When a dataset or metric is certified, the redundant copies and shadow extracts it replaces are actively inventoried, deprecated with consumer migration support, and shut off — with retirement counted as a first-class program KPI alongside creation.",
    whatGoodLooksLike:
      "Every certification decision ships with a retirement list; usage telemetry identifies the shadow copies' consumers; deprecation warnings, migration help, then shutdown follow on a published schedule; storage, licence, and reconciliation costs visibly fall.",
    antiPattern:
      "The certified gold table becomes the 41st copy of policy data rather than the last one, adding to the sprawl it was meant to end — governance measured only on what it builds, never on what it removes.",
    evidence:
      "Proven consolidation discipline in carrier analytics estates. Typical result: measurable decommission counts, falling storage and reconciliation spend, and a consumption graph that converges on certified sources.",
    capabilities: ["catalog_metadata", "stewardship_ops", "semantic_layer"],
  },
  {
    key: "close-calendar-aware-controls",
    title: "Controls know the close calendar and tighten before it",
    statement:
      "Data quality and reconciliation controls on financial-reporting flows are scheduled against the close and filing calendar: critical-path feeds are checked before the close window opens, breach SLAs compress during close, and control results are published to the close team as a pre-close readiness signal.",
    whatGoodLooksLike:
      "On T-3 the close team sees a readiness board: every feed on the statutory and management close critical path, green or red, with owners on the reds — so close nights are spent closing, not discovering which input was broken since the 14th.",
    antiPattern:
      "A premium feed silently fails mid-month; the weekly DQ job that would catch it runs on Fridays; close starts Wednesday, and the accounting team finds the hole at 11pm by noticing the trial balance is implausible.",
    evidence:
      "Proven in carrier finance-close programs. Typical result: close-cycle days reduced and near-elimination of late-night data surprises, with control evidence generated as a by-product of the readiness board.",
    capabilities: ["data_quality", "stewardship_ops", "lineage"],
    obligationKeys: ["sox-icfr", "statutory-annual-statement", "ifrs-17-ldti", "naic-model-audit-rule"],
    sectorNotes: {
      "life-annuities":
        "IFRS 17 / LDTI cohorting makes the close data-hungrier than ever: the readiness board must cover assumption tables and cohort inputs, not just the GL feeds.",
      reinsurance:
        "The close depends on third parties: cedent statement arrival and booking-lag accruals belong on the readiness board with expected-by dates, because the biggest close risk is data that has not arrived yet.",
    },
  },
  {
    key: "bench-drifting-agents",
    title: "A drifting agent gets benched, not debated",
    statement:
      "Every production governance agent has monitored quality thresholds — acceptance rate, precision on sampled review, complaint rate — with a pre-agreed bench rule: when metrics breach threshold, the agent is automatically pulled from the queue for retuning and re-qualification. Benching is routine hygiene, not a program crisis.",
    whatGoodLooksLike:
      "Agent health is a standing dashboard; a benched agent's queue falls back to manual or a prior qualified version; retuning follows a documented re-qualification protocol with a sampled evaluation before return to service — the same discipline a model-risk team applies to pricing models.",
    antiPattern:
      "An agent's suggestion quality decays after an upstream schema change, stewards quietly stop trusting the whole queue, and by the time anyone investigates, the program's credibility — not just one agent — needs remediation.",
    evidence:
      "Designed outcome aligned with model-risk-management practice extended to governance agents. Typical result: steward trust in agent queues holds steady over time because quality failures are caught by telemetry, not by morale.",
    capabilities: ["stewardship_ops", "data_quality"],
    obligationKeys: ["naic-ai-model-bulletin", "eu-ai-act", "asop-56"],
  },
];
