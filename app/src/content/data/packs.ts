import type { Pack } from "../types";

/**
 * Velocity Pack catalog — 22 packs.
 * vp-01 … vp-11 originate from the founding proposal; vp-12 … vp-22 extend the
 * library. Client-generic, insurance-native, vendor-flexible.
 */
export const PACKS: Pack[] = [
  {
    key: "vp-01",
    code: "VP-01",
    name: "Insurance Governance Semantic Pack",
    summary:
      "Starter glossaries, CDE catalogs, and a data quality rule library built from insurance semantics rather than generic governance boilerplate: premium and loss vocabulary, policy and claims critical data elements, COPE and exposure attributes, and rules anchored to actuarial and statutory obligations. Stewards curate from roughly 70% complete instead of authoring from zero.",
    origin: "proposal",
    soWhat:
      "Removes weeks of glossary, CDE, and rule authoring per data product — the difference between a governance program that starts producing in week one and one that spends a quarter defining terms.",
  },
  {
    key: "vp-02",
    code: "VP-02",
    name: "Governance Agent Pack",
    summary:
      "Six delivery-ready agent co-workers that draft the high-volume, judgment-light governance work — term candidates, DQ rules, alert triage, lineage stitching, CDE and sensitivity classification, standards drift detection — with confidence scoring, steward review queues, and audit logging built in. Agents operate on metadata and profiling output only, and every suggestion lands in a human decision queue.",
    origin: "proposal",
    soWhat:
      "The steward leverage engine: measured 3-4x reduction in steward-minutes per governance artifact is what makes a 100+ product portfolio affordable without a standing army of stewards.",
  },
  {
    key: "vp-03",
    code: "VP-03",
    name: "Governance-as-Code Starter Repo",
    summary:
      "A declarative definition schema and CI pipeline that treats classifications, CDEs, DQ rules, access policies, and lineage targets as versioned, validated, deployable code. Deployment adapters absorb tool variability at the edge, so different markets run the identical model with a different last mile.",
    origin: "proposal",
    soWhat:
      "Turns data product onboarding into a pull request — the compounding mechanism behind a declining per-product governance cost, felt by whoever funds the scale-out.",
  },
  {
    key: "vp-04",
    code: "VP-04",
    name: "Governance Command Center",
    summary:
      "Specifications and standards for a three-surface governance console: an executive portfolio view, a data office operations view, and a steward work queue with confidence-routed agent suggestions and a live audit tail. Built on a canonical telemetry model so progress is emitted by the platform, not compiled into status decks.",
    origin: "proposal",
    soWhat:
      "Leadership sees portfolio progress without asking, stewards see their day without hunting, and auditors read the log without meetings.",
  },
  {
    key: "vp-05",
    code: "VP-05",
    name: "Scale Economics Model",
    summary:
      "An interactive scale model and the metrics behind it: portfolio archetypes times measured per-product effort times steward leverage ratios times available capacity, producing labor-model versus agentic-model curves, cost bands, and staffing shapes. Populated with measured actuals from delivered products, not industry benchmarks.",
    origin: "proposal",
    soWhat:
      "Answers the CFO question — what will governing the portfolio cost and when will it be done — with the organization's own measured economics, which is the difference between a funded scale plan and a filed one.",
  },
  {
    key: "vp-06",
    code: "VP-06",
    name: "Capability Assessment Toolkit",
    summary:
      "Scorecard templates, tool role-mapping canvases, and evidence-probe checklists for assessing classification, catalog, semantic layer, data quality, and lineage capabilities — with two lenses generic assessments miss: an insurance lens (does the ecosystem support a regulated insurer's obligations?) and an automation-readiness lens (what stands between today's configuration and agentic operation?).",
    origin: "proposal",
    soWhat:
      "A six-week, evidence-led assessment that is a machine rather than a promise — comparable across capabilities and defensible in front of leadership.",
  },
  {
    key: "vp-07",
    code: "VP-07",
    name: "Standards Traceability & Playbook Refresh Kit",
    summary:
      "A traceability matrix mapping each governance standard to its intent, enforcing tool, and adoption evidence, graded clarify / strengthen / simplify / complete — plus two grades most frameworks lack: automatable-as-written and insurance-complete. Playbook updates are validated by applying them in live products before ratification.",
    origin: "proposal",
    soWhat:
      "The playbook improves through application instead of workshops — standards owners get a prioritized, evidence-backed fix list instead of an opinion survey.",
  },
  {
    key: "vp-08",
    code: "VP-08",
    name: "Governance Performance Index",
    summary:
      "A composite 0-100, dimension-weighted maturity score per data product, computed from live platform telemetry rather than self-assessment, with a governance definition-of-done and per-agent acceptance-rate tracking. Gives 'target maturity' a measurable meaning and gates product completion on evidence.",
    origin: "proposal",
    soWhat:
      "Leadership gets a single defensible number per product per quarter, and 'done' stops being negotiable at the gate review.",
  },
  {
    key: "vp-09",
    code: "VP-09",
    name: "Steward-as-Supervisor Enablement Kit",
    summary:
      "A hands-on curriculum, delivered in-flight inside live products, that teaches the new stewardship job: curating from agent-drafted candidates, reviewing code-based definitions, supervising agent suggestions, and teaching the model forward. Includes trainee role cards, participation expectations, and recorded readiness-demonstration checklists.",
    origin: "proposal",
    soWhat:
      "Capability transfer with evidence — named people who demonstrably run the model without the vendor, which is what makes self-sufficiency real rather than asserted.",
  },
  {
    key: "vp-10",
    code: "VP-10",
    name: "Lineage Gap Triage Method",
    summary:
      "An honest, repeatable decision method for source-to-consumption lineage: scanner-covered, connector-buildable, agent-assisted stitch, or deliberately documented manual stitch — each with cost/benefit thresholds tied to product criticality. Includes coverage-map templates and a stitch-documentation standard.",
    origin: "proposal",
    soWhat:
      "Lineage effort is spent only where it pays, and unscannable segments are documented deliberately instead of discovered during a regulatory exam.",
  },
  {
    key: "vp-11",
    code: "VP-11",
    name: "Insurance NPPI/PII Playcard for AI-Assisted Delivery",
    summary:
      "A security and privacy operating pattern for running AI-assisted governance in an insurer: an insurance-specific sensitivity taxonomy (claims medical and litigation material, claimant financial data, licensing and appointment records), a single classification-to-access chain, agents restricted to metadata and profiling output, and an incident protocol aligned to insurer confidentiality duties.",
    origin: "proposal",
    soWhat:
      "AI-assisted delivery a privacy office can actually approve — sensitive-data use cases unblock instead of stalling in review.",
  },
  {
    key: "vp-12",
    code: "VP-12",
    name: "Data Contract Starter Pack",
    summary:
      "Data contract templates and enforcement tooling for producer-consumer boundaries: schema, semantics, quality thresholds, delivery SLAs, and change control expressed as versioned agreements — with insurance-specific exemplars for delegated-authority bordereaux and TPA claim feeds, the boundaries where insurers bleed the most quality.",
    origin: "extended",
    soWhat:
      "Boundary disputes become contract conversations with evidence — consuming teams stop discovering breaking changes in month-end numbers.",
  },
  {
    key: "vp-13",
    code: "VP-13",
    name: "Insurance Data Product Blueprints",
    summary:
      "Ready-to-adapt blueprints for the data products every insurer eventually builds: Policy 360, Claims 360, Producer 360, Party 360, and the finance data product. Each blueprint specifies the CDE set, source contracts, quality gates, sensitivity map, and certification path — so product teams start from a proven shape.",
    origin: "extended",
    soWhat:
      "The first design workshop is replaced by a review of a working blueprint — product teams ship governed products in weeks, not quarters.",
  },
  {
    key: "vp-14",
    code: "VP-14",
    name: "AI Governance & Model Risk Pack",
    summary:
      "Templates and methods for governing the data side of AI and model risk: a model and AI use-case inventory with data dependencies and risk tiers, training-data lineage and documentation standards, and a risk-triage intake for AI use cases in underwriting, claims, and marketing — mapped to emerging AI regulatory expectations.",
    origin: "extended",
    soWhat:
      "When a regulator or model risk committee asks 'what data trained this model and can you prove it,' the answer comes from lineage, not archaeology.",
  },
  {
    key: "vp-15",
    code: "VP-15",
    name: "Privacy, Consent & DSAR Pack",
    summary:
      "Privacy obligations mapped to insurance data domains, a consent-and-purpose data model, a DSAR fulfillment playbook that leans on the catalog and party resolution to find an individual's data across policy, claims, and billing, and a purpose-based access standard that replaces per-view provisioning.",
    origin: "extended",
    soWhat:
      "Privacy requests get answered in days from the catalog instead of weeks of system-by-system searching — and access decisions become explainable to a privacy office.",
  },
  {
    key: "vp-16",
    code: "VP-16",
    name: "Party & Master Data Resolution Pack",
    summary:
      "Match, merge, and survivorship methods tuned for insurance party data — insureds, claimants, providers, producers — where SSNs are scarce, households matter, and commercial names hide behind DBAs. Includes a match-rule library, hierarchy templates, and the party data-quality prerequisites for sanctions screening.",
    origin: "extended",
    soWhat:
      "One resolved party across policy, claims, and billing is the precondition for every 360 view, fraud signal, and DSAR — resolve party first and the rest of the roadmap gets cheaper.",
  },
  {
    key: "vp-17",
    code: "VP-17",
    name: "Insurance Reference Data Pack",
    summary:
      "Curated, versioned reference code sets that insurance analytics quietly depends on — ISO class and line-of-business codes, cause-of-loss taxonomies, jurisdiction codes, Lloyd's risk codes — plus the stewardship workflow that keeps them owned, change-controlled, and propagated instead of forked per system.",
    origin: "extended",
    soWhat:
      "Cross-system reporting stops breaking on silently divergent code tables — a top-five root cause of 'whose number is right' escalations.",
  },
  {
    key: "vp-18",
    code: "VP-18",
    name: "Data Marketplace & Certification Pack",
    summary:
      "Certification tiers tied to governance evidence, listing and evidence-pack templates, and a duplicate-view retirement playbook — the machinery for a data marketplace where certified products are the easy path and shadow copies get inventoried and retired.",
    origin: "extended",
    soWhat:
      "Consumers reach for the certified product because it is the fastest option, and every retired duplicate view is an audit finding that never happens.",
  },
  {
    key: "vp-19",
    code: "VP-19",
    name: "M&A / Book-Transfer Due Diligence Pack",
    summary:
      "Data due diligence probes for acquiring a book or company, a conversion mapping method with semantic reconciliation, a conversion DQ rule library (financial balance reconciliation, orphan claims, coverage mapping validity), and the CDE set that must survive any migration — in-force premium, open reserves, loss history continuity.",
    origin: "extended",
    soWhat:
      "The acquired book's loss history still supports reserving and Schedule P after conversion — the failure mode that otherwise surfaces two years later as an actuarial restatement.",
  },
  {
    key: "vp-20",
    code: "VP-20",
    name: "Operating Model & RACI Pack",
    summary:
      "A hub-and-spoke operating model blueprint — centralize the platform, code substrate, agents, and standards; federate judgment, domain meaning, and approval to business-line stewards — with role cards (including the agent-supervisor competency), a governance council charter, and a centralize-versus-federate decision guide.",
    origin: "extended",
    soWhat:
      "Business lines keep control of their own meaning while paying for expensive machinery once — the split that lets the estate grow without stewardship headcount growing with it.",
  },
  {
    key: "vp-21",
    code: "VP-21",
    name: "Value & Adoption Tracking Pack",
    summary:
      "The instrumentation and cadence that keep a governance program funded: a business-outcome ledger tracing capability to outcome to who feels it, adoption and leverage metrics emitted by the platform, a leverage-instrumentation standard (before/after steward-minutes, measured not asserted), and a quarterly value-moments reporting method.",
    origin: "extended",
    soWhat:
      "Governance stays a portfolio of nameable business outcomes rather than a compliance line item — which is what sustains multi-year funding.",
  },
  {
    key: "vp-22",
    code: "VP-22",
    name: "Governance Communications & Change Pack",
    summary:
      "The change-management side of agentic governance: a steward community-of-practice playbook, executive narrative templates in business-line language, and a change-champion toolkit that handles the real objections — including 'will the agents replace me' — with the honest answer: the job moves up a layer.",
    origin: "extended",
    soWhat:
      "Steward communities adopt the model instead of quietly resisting it — the political failure mode that kills more governance programs than any technical gap.",
  },
];
