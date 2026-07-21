import type { Obligation } from "../types";

/**
 * Regulatory and professional obligations that bind insurance data.
 *
 * Client-generic. Each entry is framed for data governance: what the regime
 * demands OF data — the capabilities it stresses and the evidence an
 * examiner or auditor literally asks to see.
 */
export const OBLIGATIONS: Obligation[] = [
  {
    key: "naic-model-audit-rule",
    name: "NAIC Model Audit Rule (Annual Financial Reporting Model Regulation)",
    authority: "NAIC (adopted state-by-state)",
    jurisdiction: "US states (insurers above premium thresholds, e.g. $500M)",
    summary:
      "Requires larger insurers to maintain and attest to internal controls over statutory financial reporting, an audit committee, and an annual CPA audit. In data terms it demands that every figure in the statutory statement be traceable to controlled source data: documented report production processes, controlled spreadsheets and EUCs, and demonstrable data quality checks at each hand-off from admin systems to the general ledger to the blank. Adoption details vary by state, but the ICFR attestation is the common core.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
      "surety",
    ],
    capabilities: ["lineage", "data_quality", "catalog_metadata", "stewardship_ops", "access_policy"],
    evidenceExpectations: [
      "Walk through the lineage of a selected statutory statement line from the filed blank back through the GL to policy and claim source transactions",
      "Produce the control matrix for statutory reporting data flows, including key reconciliations and their sign-offs for the period",
      "Show the inventory of end-user computing tools (spreadsheets) used in statement preparation and the change/access controls around them",
      "Evidence that data quality exceptions found during close were logged, remediated, and re-tested before filing",
    ],
  },
  {
    key: "sox-icfr",
    name: "Sarbanes-Oxley Section 302/404 (ICFR)",
    authority: "SEC/PCAOB",
    jurisdiction: "US public companies (including public insurers and brokers)",
    summary:
      "Management must assess and certify internal control over financial reporting, and external auditors opine on it. For insurers this stresses the data supply chain behind GAAP financials: completeness and accuracy controls on policy, claim, and investment feeds into the ledger; IT general controls (access, change management) on actuarial and financial systems; and precise documentation of report logic so a control deficiency can be scoped to specific data elements. Weak lineage turns every restatement question into a fire drill.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
      "surety",
      "investments",
      "brokerage-mga",
    ],
    capabilities: ["lineage", "data_quality", "access_policy", "catalog_metadata", "stewardship_ops"],
    evidenceExpectations: [
      "Demonstrate the lineage of a key financial statement figure (e.g. net incurred losses) from source system to GL to 10-K, including every transformation",
      "Show completeness and accuracy (C&A) control evidence for interfaces feeding the ledger — record counts, hash totals, rejected-record handling",
      "Produce user access reviews and segregation-of-duties analysis for systems in scope for ICFR",
    ],
  },
  {
    key: "statutory-annual-statement",
    name: "Statutory Annual Statement (NAIC Blank)",
    authority: "NAIC / state insurance departments",
    jurisdiction: "US (all licensed insurers, filed per state of domicile)",
    summary:
      "The quarterly and annual statement blanks are the statutory system of record for solvency oversight: dozens of interlocking schedules and exhibits that must cross-foot, tie to the general ledger, and reconcile line-of-business detail to state pages. In data terms it demands a controlled mapping from every admin-system transaction to NAIC line of business and state, consistent as-of-date snapshotting, and cross-schedule consistency checks — the filing fails validation if Schedule P, the Underwriting & Investment Exhibit, and the state pages disagree.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
      "surety",
    ],
    capabilities: ["lineage", "data_quality", "semantic_layer", "catalog_metadata"],
    evidenceExpectations: [
      "Reconcile a selected exhibit line to the trial balance and to policy/claim subledger detail",
      "Show the mapping table from product/coverage codes to NAIC annual statement lines of business and who governs changes to it",
      "Explain and evidence how crosscheck failures from the NAIC filing validation were investigated and resolved",
    ],
  },
  {
    key: "schedule-p",
    name: "Schedule P (Loss and LAE Development)",
    authority: "NAIC / state insurance departments",
    jurisdiction: "US (P&C statutory filers)",
    summary:
      "Schedule P discloses ten years of loss and loss adjustment expense development by line of business, net and gross, on an accident-year basis. It is unforgiving of data defects: claims must carry stable accident dates, consistent line-of-business coding across a decade, correct gross/ceded splits, and unbroken linkage between payments, case reserves, and the triangles. A single miscoded reinsurance treaty or a claim reclassified between lines shows up as an unexplainable development anomaly that regulators and rating agencies will question.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety"],
    capabilities: ["lineage", "data_quality", "semantic_layer"],
    evidenceExpectations: [
      "Show how a Schedule P loss triangle cell ties to claim-level source data, including accident date, line of business, and ceded recoverable assignment",
      "Demonstrate consistency of line-of-business mapping across the ten development years, and document any remapping events",
      "Reconcile Schedule P Part 1 totals to the Underwriting & Investment Exhibit and the actuarial reserve analysis",
    ],
  },
  {
    key: "asop-23",
    name: "ASOP No. 23 — Data Quality",
    authority: "Actuarial Standards Board",
    jurisdiction: "US actuarial practice (all credentialed actuaries)",
    summary:
      "ASOP 23 requires actuaries to review data for reasonableness, consistency, and completeness before relying on it, to disclose the extent of that review, known limitations, and any unresolved defects, and to document reliance on data supplied by others. Operationally it demands that the organization can hand its actuaries profiled, documented data with known quality metrics — otherwise every reserve study and rate filing carries a data-caveat paragraph that weakens the opinion and invites regulator follow-up.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
      "surety",
    ],
    capabilities: ["data_quality", "catalog_metadata", "lineage", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the data-quality review documentation supporting the appointed actuary's reserve opinion, including tests performed and defects noted",
      "Show reconciliation of the actuarial extract to financial-statement control totals for the same valuation date",
      "Evidence how known data limitations disclosed in prior actuarial reports were tracked and remediated",
    ],
  },
  {
    key: "asop-56",
    name: "ASOP No. 56 — Modeling",
    authority: "Actuarial Standards Board",
    jurisdiction: "US actuarial practice (all credentialed actuaries)",
    summary:
      "ASOP 56 governs the design, use, and reliance on models — pricing, reserving, capital, and cat models alike. It demands understanding of model input data and its limitations, validation that output reasonably represents what is being modeled, and documented mitigation of model risk. For data governance that means a model inventory with documented input data dependencies, versioned assumption sets, and lineage from model inputs back to governed sources, so a model change or a data defect can be traced to its downstream effect on results.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
    ],
    capabilities: ["lineage", "catalog_metadata", "data_quality", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the model inventory entry for a selected model: purpose, owner, input data sources, and validation history",
      "Show lineage from a model's input datasets back to governed source systems, including the assumption set version used in the last production run",
      "Evidence the review performed on input data limitations and how they were communicated to users of the model output",
    ],
  },
  {
    key: "glba-nppi",
    name: "Gramm-Leach-Bliley Act — Nonpublic Personal Information",
    authority: "FTC / state insurance departments (via NAIC privacy and safeguards models)",
    jurisdiction: "US (financial institutions, including insurers and producers)",
    summary:
      "GLBA's privacy and safeguards rules — implemented for insurers largely through state adoption of NAIC models such as the Insurance Data Security Model Law (MDL-668) — require protection of nonpublic personal information, privacy notices, sharing limits, and a written information security program. The data demand is foundational: you cannot protect NPI you have not found. It stresses discovery and classification of NPI across systems, access controls proportionate to sensitivity, third-party data sharing inventories, and breach investigation readiness. State adoption of the models varies, so applicable specifics are jurisdiction-dependent.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "life-annuities",
      "health-benefits",
      "brokerage-mga",
    ],
    capabilities: ["classification", "access_policy", "catalog_metadata", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the inventory of systems and datasets containing NPI, with classification labels and data owners",
      "Show access certification records demonstrating least-privilege access to NPI datasets",
      "Demonstrate the register of third parties receiving NPI and the contractual safeguards attached to each sharing arrangement",
    ],
  },
  {
    key: "state-privacy-laws",
    name: "State Consumer Privacy Laws (CCPA/CPRA and successors)",
    authority: "State attorneys general / state privacy agencies",
    jurisdiction: "US states with comprehensive privacy statutes (California, Colorado, Virginia, and others)",
    summary:
      "Comprehensive state privacy laws grant consumers rights to access, delete, and correct personal information and to opt out of certain sharing, with insurance-specific interplay: GLBA-covered data is often exempt, but employee, claimant, and marketing data frequently is not — an entity/data-level distinction that varies by state. Fulfilling a rights request within statutory deadlines demands a personal-data inventory keyed to individuals, retention rules that can actually be executed, and lineage showing everywhere a person's data has propagated, including analytics copies and vendor extracts.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "life-annuities",
      "health-benefits",
      "brokerage-mga",
    ],
    capabilities: ["classification", "access_policy", "lineage", "catalog_metadata", "stewardship_ops"],
    evidenceExpectations: [
      "Demonstrate end-to-end fulfillment of a consumer access or deletion request, including identification of every system holding that individual's data",
      "Show the data map distinguishing GLBA-exempt data from in-scope personal information, by system and processing purpose",
      "Produce records of retention schedules applied to personal data and evidence of defensible disposal",
    ],
  },
  {
    key: "hipaa-phi",
    name: "HIPAA Privacy and Security Rules — Protected Health Information",
    authority: "HHS Office for Civil Rights",
    jurisdiction: "US (covered entities — health plans — and their business associates)",
    summary:
      "HIPAA binds health plans (and business associates) to safeguard PHI: minimum-necessary use, access controls and audit logging, business associate agreements, and breach notification. Note the scope nuance: health insurers are covered entities, while life and P&C carriers holding health information generally are not, though state laws may still apply. The data demand is precise PHI discovery and classification, de-identification standards (safe harbor or expert determination) for analytics use, and provable audit trails of who accessed which member's records.",
    sectorKeys: ["health-benefits"],
    capabilities: ["classification", "access_policy", "catalog_metadata", "lineage", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the PHI data inventory and risk analysis covering all systems that create, receive, maintain, or transmit PHI",
      "Show access audit logs for a selected member's records and the review process for anomalous access",
      "Demonstrate the de-identification method applied to PHI used in analytics datasets and its documentation",
      "Produce the business associate agreement register mapped to actual PHI data flows",
    ],
  },
  {
    key: "naic-ai-model-bulletin",
    name: "NAIC Model Bulletin on the Use of AI Systems by Insurers",
    authority: "NAIC (adopted state-by-state via department bulletins)",
    jurisdiction: "US states that have adopted the bulletin",
    summary:
      "The 2023 model bulletin expects insurers using AI — including third-party models — to run a written AIS program with governance, risk management, and internal controls proportionate to the risk of unfair discrimination and other adverse consumer outcomes. The data demands are concrete: an inventory of AI systems and the data used to train and run them, documentation of data lineage and quality for model inputs, testing for unfairly discriminatory outcomes, and vendor due diligence records. Regulators may ask for all of this in market conduct exams; adoption and emphasis vary by state.",
    sectorKeys: ["pc-personal", "pc-commercial", "life-annuities", "health-benefits", "specialty-es"],
    capabilities: ["catalog_metadata", "lineage", "data_quality", "classification", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the AI system inventory, including third-party models, with intended use, owner, and consumer-impact classification",
      "Show the lineage and quality documentation for the training and scoring data behind a model used in underwriting or claims",
      "Evidence outcome testing performed for unfair discrimination and how findings were governed and remediated",
    ],
  },
  {
    key: "eu-ai-act",
    name: "EU Artificial Intelligence Act",
    authority: "EU (European Commission / national market surveillance authorities)",
    jurisdiction: "European Union (extraterritorial reach where AI outputs are used in the EU)",
    summary:
      "The AI Act explicitly classifies AI used for risk assessment and pricing in life and health insurance as high-risk, triggering obligations around data and data governance (Article 10): training, validation, and test data must be relevant, sufficiently representative, and to the best extent possible free of errors, with documented data governance practices, bias examination, and technical documentation kept for regulators. For insurers this means provable dataset provenance, documented data quality criteria for model data, and logs sufficient to reconstruct how a system produced its outputs. Obligations phase in through 2026-2027 and apply per the deployer/provider role.",
    sectorKeys: ["life-annuities", "health-benefits", "pc-personal", "pc-commercial"],
    capabilities: ["catalog_metadata", "data_quality", "lineage", "classification", "stewardship_ops"],
    evidenceExpectations: [
      "Produce technical documentation for a high-risk AI system including the description of training/validation/test datasets and their provenance",
      "Show the documented data governance measures applied to model data: collection, labeling, cleaning, bias examination, and gap mitigation",
      "Demonstrate logging capability sufficient to trace a specific automated risk-assessment output back to its inputs and model version",
    ],
  },
  {
    key: "ifrs-17-ldti",
    name: "IFRS 17 / US GAAP LDTI (Long-Duration Targeted Improvements)",
    authority: "IASB / FASB",
    jurisdiction: "IFRS-reporting jurisdictions worldwide; US GAAP filers for LDTI",
    summary:
      "IFRS 17 and LDTI both force insurance accounting down to granular, cohort-level data: IFRS 17 requires grouping contracts by portfolio, annual cohort, and profitability, tracking the contractual service margin over decades; LDTI requires annually reviewed cash-flow assumptions and disaggregated rollforward disclosures. Both regimes demand policy-level data retained and reconcilable over the full contract lifetime, controlled linkage between actuarial engines and the ledger, and lineage from disclosure rollforwards back to assumption sets and source cash flows. Which regime applies is jurisdiction- and filer-specific.",
    sectorKeys: ["life-annuities", "health-benefits", "reinsurance", "pc-commercial", "specialty-es"],
    capabilities: ["lineage", "data_quality", "semantic_layer", "catalog_metadata"],
    evidenceExpectations: [
      "Demonstrate the lineage of a CSM or liability rollforward disclosure back to cohort-level actuarial output and source cash flows",
      "Show how contracts are assigned to portfolios and annual cohorts, and the controls preventing reassignment after initial recognition",
      "Reconcile the actuarial subledger to the general ledger for a reporting period, with documented treatment of differences",
    ],
  },
  {
    key: "solvency-ii",
    name: "Solvency II (including Pillar 3 reporting)",
    authority: "EU / EIOPA (national supervisors; parallel UK regime under the PRA)",
    jurisdiction: "European Economic Area (UK operates a divergent post-Brexit version)",
    summary:
      "Solvency II sets the canonical bar for insurance data quality: data used in technical provisions and internal models must be demonstrably accurate, complete, and appropriate, backed by a data directory, documented data quality policy, and audit trail. Pillar 3 quantitative reporting templates (QRTs) demand governed, validated submissions on tight deadlines with full traceability to source. Supervisors expect a living data quality framework — profiling results, issue logs, materiality assessments — not a one-time attestation. UK specifics now differ under the PRA's reformed regime.",
    sectorKeys: ["pc-commercial", "specialty-es", "reinsurance", "life-annuities", "investments"],
    capabilities: ["data_quality", "catalog_metadata", "lineage", "stewardship_ops", "semantic_layer"],
    evidenceExpectations: [
      "Produce the data directory covering all data used in the internal model or technical provisions, with accuracy/completeness/appropriateness assessments",
      "Show the data quality issue log, materiality assessment, and remediation status for data feeding the SCR calculation",
      "Demonstrate lineage from a selected QRT cell back through transformations to source systems",
    ],
  },
  {
    key: "pbr-vm-20",
    name: "Principle-Based Reserving (Valuation Manual VM-20/VM-31)",
    authority: "NAIC / state insurance departments",
    jurisdiction: "US (life insurers subject to the Valuation Manual)",
    summary:
      "PBR replaces formulaic life reserves with modeled reserves driven by company experience, which converts reserve adequacy into a data problem: credible, well-governed mortality, lapse, and expense experience data; seriatim in-force files feeding valuation models; and VM-31 reports documenting data sources, limitations, and validations. VM-G adds explicit governance duties for boards and senior management over the PBR process. Experience data also flows to regulator-mandated experience reporting, so inconsistencies between valuation data and experience submissions are visible to supervisors.",
    sectorKeys: ["life-annuities"],
    capabilities: ["data_quality", "lineage", "catalog_metadata", "stewardship_ops"],
    evidenceExpectations: [
      "Produce the VM-31 PBR Actuarial Report sections documenting data sources, data limitations, and validation of the in-force extract",
      "Reconcile the seriatim valuation in-force file to admin-system policy counts and face amounts for the valuation date",
      "Show governance evidence (per VM-G) that senior management reviewed the adequacy of PBR data quality controls",
    ],
  },
  {
    key: "lloyds-minimum-standards",
    name: "Lloyd's Minimum Standards and Delegated Data Requirements",
    authority: "Corporation of Lloyd's (Lloyd's of London market oversight)",
    jurisdiction: "Lloyd's market (managing agents, syndicates, coverholders worldwide)",
    summary:
      "Lloyd's oversees syndicates against minimum standards spanning underwriting, claims, exposure management, and data — including mandated data standards (Coverholder Reporting Standards, the Core Data Record under Blueprint Two) for risk, premium, and claims data flowing through delegated authority chains. For managing agents the data demand is aggregating consistent bordereau-level data from many coverholders and TPAs, validating it against required field standards, and evidencing exposure data quality for catastrophe modeling and Realistic Disaster Scenario returns to Lloyd's.",
    sectorKeys: ["specialty-es", "reinsurance", "brokerage-mga"],
    capabilities: ["data_quality", "catalog_metadata", "semantic_layer", "stewardship_ops", "lineage"],
    evidenceExpectations: [
      "Show validation results of coverholder bordereaux against required data standards, and the escalation trail for persistent breaches",
      "Demonstrate how delegated-authority premium and claims data aggregates into syndicate-level regulatory returns",
      "Produce exposure data quality evidence supporting catastrophe model inputs and RDS submissions",
    ],
  },
  {
    key: "state-doi-market-conduct",
    name: "State Market Conduct Examinations and MCAS",
    authority: "State insurance departments",
    jurisdiction: "US states (licensed insurers, per-state examination authority)",
    summary:
      "State DOIs examine how insurers treat policyholders — underwriting, rating, claims handling, complaints, producer licensing — using the NAIC Market Regulation Handbook, and require annual Market Conduct Annual Statement (MCAS) submissions of standardized ratios. Exams are executed as data requests: full policy and claims listings for the exam period from which examiners sample files. The data demand is the ability to produce complete, accurate populations quickly, with consistent timestamps (claim reported/closed dates, cancellation notices) that survive scrutiny — data defects read as conduct violations.",
    sectorKeys: ["pc-personal", "pc-commercial", "life-annuities", "health-benefits"],
    capabilities: ["data_quality", "catalog_metadata", "lineage", "stewardship_ops", "access_policy"],
    evidenceExpectations: [
      "Produce complete claim and policy population extracts for the examination period, with documented completeness assurance",
      "Reconcile MCAS submission counts (e.g. claims closed without payment) to source-system data",
      "Show timestamp integrity for regulated intervals — claim acknowledgment, payment, and cancellation notice dates — for sampled files",
    ],
  },
  {
    key: "ofac-sanctions",
    name: "OFAC Sanctions Compliance",
    authority: "US Treasury, Office of Foreign Assets Control",
    jurisdiction: "US persons and entities globally (parallel regimes: UN, EU, UK OFSI)",
    summary:
      "OFAC prohibits transacting with sanctioned persons, entities, vessels, and jurisdictions — for insurers that means screening policyholders, insureds, beneficiaries, claim payees, brokers, and reinsurers at issuance, renewal, endorsement, and claim payment. The data demand is unglamorous and hard: clean, standardized party name and address data good enough for fuzzy matching without drowning in false positives, a defensible record of every screening decision, and party master data that links all roles a counterparty plays so a match is caught regardless of entry point.",
    sectorKeys: [
      "pc-personal",
      "pc-commercial",
      "specialty-es",
      "reinsurance",
      "life-annuities",
      "health-benefits",
      "surety",
      "investments",
      "brokerage-mga",
    ],
    capabilities: ["data_quality", "classification", "stewardship_ops", "access_policy"],
    evidenceExpectations: [
      "Demonstrate that all party roles (insured, beneficiary, payee, broker, reinsurer) are screened, with coverage evidence by transaction type",
      "Produce the audit trail for a sample of screening alerts: match details, disposition rationale, and approver",
      "Show data quality controls on party name/address fields that feed the screening engine, and false-positive rate monitoring",
    ],
  },
  {
    key: "schedule-d",
    name: "Schedule D (Invested Assets)",
    authority: "NAIC / state insurance departments",
    jurisdiction: "US (statutory filers; NAIC SVO designation framework)",
    summary:
      "Schedule D discloses every bond and stock an insurer holds at CUSIP-level detail — acquisitions, disposals, NAIC designations, fair values, book/adjusted carrying values — and drives risk-based capital charges. The data demand is security-master discipline: accurate identifiers, current SVO designations, clean linkage between the investment accounting system, custodian records, and the statement, and documented pricing sources. A stale designation or a custodian reconciliation break flows directly into misstated RBC.",
    sectorKeys: ["investments", "life-annuities", "pc-personal", "pc-commercial", "health-benefits", "reinsurance"],
    capabilities: ["data_quality", "lineage", "catalog_metadata", "semantic_layer"],
    evidenceExpectations: [
      "Reconcile Schedule D holdings to custodian statements and the investment accounting book of record as of the statement date",
      "Show the process and evidence for keeping NAIC SVO designations current, including handling of designation changes during the period",
      "Demonstrate the pricing-source hierarchy and documentation for fair values reported on Schedule D",
    ],
  },
];
