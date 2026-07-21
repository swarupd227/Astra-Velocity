import type { Scenario } from "../types";

/**
 * Scenario library: the ten recurring situations in which an insurance
 * organization buys and applies data governance. Each scenario carries a
 * capability emphasis profile (0-3) and sector-specific flavor notes.
 */
export const SCENARIOS: Scenario[] = [
  // ------------------------------------------------------------------
  // 1. Sensitive Data Unlock
  // ------------------------------------------------------------------
  {
    key: "sensitive-data-unlock",
    name: "Sensitive Data Unlock",
    tagline: "Make NPPI, PHI, and HR data usable — with provable controls instead of blanket denial.",
    stakes:
      "Insurers hold some of the most sensitive data any industry carries — claims medical files, underwriting health evidence, employee records — and the default response is to lock entire datasets away. The cost is invisible but enormous: analytics programs stall, legitimate use cases queue for months behind manual access reviews, and shadow extracts proliferate precisely because the sanctioned path is too slow. The unlock is not looser control; it is classification and policy precise enough that field-level protection replaces dataset-level denial.",
    painPoints: [
      "Access requests for any dataset touching NPPI or PHI take weeks of manual legal and privacy review because nobody can say at column level what is actually sensitive.",
      "Whole domains — claims notes, underwriting evidence, HR data — are excluded from analytics wholesale, so the highest-value data is the least used.",
      "Shadow copies and email extracts bypass the sanctioned path, creating exactly the exposure the blanket denial was meant to prevent.",
      "Consent, retention, and permissible-purpose obligations are documented in policy PDFs, not enforced as machine-readable rules on the data itself.",
    ],
    stakeholders: [
      "Chief Data Officer",
      "Chief Privacy Officer / Privacy Counsel",
      "CISO and security engineering",
      "Analytics and data science leaders",
      "HR leadership (for employee-data use cases)",
      "Claims and underwriting operations",
    ],
    capabilityEmphasis: {
      classification: 3,
      access_policy: 3,
      catalog_metadata: 2,
      lineage: 1,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Access provisioning cycle time for sensitive datasets down from weeks to days, measured request-to-grant.",
      "Percentage of columns in priority domains carrying a verified sensitivity classification above 95%, up from single digits.",
      "Number of previously blocked analytics use cases unblocked per quarter, with privacy sign-off on record.",
      "Field-level masking or de-identification policies enforced in the platform (not in consumer SQL) for 100% of NPPI/PHI classes in scope.",
      "Shadow-extract findings in access audits trending to zero across two consecutive audit cycles.",
    ],
    sectorNotes: {
      "pc-personal":
        "The prize is claims free-text and telematics: FNOL narratives full of medical detail and third-party claimant NPPI that, once classified and masked, unlock severity modeling and fraud analytics the privacy office currently blocks.",
      "pc-commercial":
        "Workers' compensation is the epicenter — medical and indemnity data interleaved in claim files needs field-level treatment so loss-control and reserving analytics can run without opening the medical record.",
      "life-annuities":
        "Underwriting evidence (APS, labs, Rx histories) is maximally sensitive and essential to mortality experience studies; the unlock is de-identified study datasets with documented consent and retention lineage.",
      "health-benefits":
        "This is HIPAA minimum-necessary made operational: role-scoped, field-level PHI access replacing the dataset-level denials that force care-management and payment-integrity analytics into exception processes.",
      "brokerage-mga":
        "Client financials and benefits census data flow through email and shared drives across the placement cycle; classification plus policy brings that gray traffic onto a sanctioned, auditable path.",
      "investments":
        "The sensitive class is MNPI from private-credit deal flow rather than personal data — information barriers between private-side and public-side desks need the same classification-to-access chain.",
      "reinsurance":
        "Cedent claim bordereaux arrive carrying underlying claimant NPPI the reinsurer never contracted to see in the clear; ingestion-time classification and masking keeps the assumed book analyzable and the data-sharing agreements honest.",
    },
  },

  // ------------------------------------------------------------------
  // 2. Report Integrity
  // ------------------------------------------------------------------
  {
    key: "report-integrity",
    name: "Report Integrity",
    tagline: "One number, one definition, one lineage — so leadership stops caveating its own reports.",
    stakes:
      "When the same KPI appears with three values in three decks, the argument consumes the meeting and the decision waits. Report integrity is the discipline of certified metrics: governed definitions in a semantic layer, quality checks on report inputs, and lineage from the published number back to source transactions. It converts 'whose loss ratio is right?' from a recurring quarterly dispute into a resolved question with an owner — and it is usually the fastest route to visible executive sponsorship for governance.",
    painPoints: [
      "The same metric — loss ratio, retention, membership — is computed differently across BI workspaces, and each version has an executive sponsor.",
      "Report authors rebuild business logic in every dashboard because no certified semantic model exists to inherit from.",
      "A number challenged in a leadership meeting takes days of analyst archaeology to defend, and sometimes cannot be defended.",
      "Known input-quality issues reach published reports because nothing gates report refresh on data-quality checks.",
    ],
    stakeholders: [
      "CFO and FP&A leadership",
      "Business unit presidents and their chiefs of staff",
      "Head of BI / analytics engineering",
      "Chief Data Officer and data stewards",
      "Chief Actuary (where metrics are actuarial)",
    ],
    capabilityEmphasis: {
      semantic_layer: 3,
      lineage: 3,
      data_quality: 2,
      catalog_metadata: 2,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Number of certified metrics in the governed semantic layer, with 100% of the executive flash pack sourced from them.",
      "Metric-definition disputes escalated to the data office per quarter down 80% from baseline.",
      "Time to answer 'where did this number come from?' down from days to under one hour via lineage on demand.",
      "Zero uncaveated restatements of previously published executive-report figures over four consecutive quarters.",
      "Share of top-50 reports whose critical inputs carry passing DQ checks at refresh time, from unmeasured to above 95%.",
    ],
    sectorNotes: {
      "pc-personal":
        "This is the monthly flash pack under close-calendar pressure: written vs. earned premium, frequency/severity, and cat-loss figures that must tie to the ledger before the month-end meeting, every month.",
      "pc-commercial":
        "Segment profitability is the battleground — line-of-business and industry hierarchies drift between claims, policy, and finance, so 'combined ratio by segment' varies with the report author until the hierarchy is governed reference data.",
      "specialty-es":
        "Integrity means untangling underwriting-year, accident-year, and calendar-year views that management packs quietly conflate — each basis is legitimate, but only labeled and lineage-traced.",
      "life-annuities":
        "Reads as illustration and reserve reporting discipline under PBR: valuation outputs, assumption versions, and statutory exhibits must reconcile, and the actuarial-to-ledger spreadsheet chain is the integrity gap auditors flag.",
      "health-benefits":
        "Membership is the treacherous number — member months differ across MLR filings, statutory blanks, and management packs until a single governed definition exists, and MLR rebate liability rides on it.",
      "reinsurance":
        "Treaty-level and portfolio roll-ups must agree across currency, underwriting-year, and treaty-version handling; integrity means a technical result the CUO and CFO both sign without a bridging appendix.",
      "brokerage-mga":
        "Revenue integrity: booked commission versus carrier-confirmed commission, and a producer scorecard the sales floor trusts because splits and 'renewal vs. rewrite' are defined once.",
      "investments":
        "The daily NAV pack and the statutory investment exhibits must tell one story; integrity is an IBOR-ABOR bridge that is computed, not narrated.",
    },
  },

  // ------------------------------------------------------------------
  // 3. Financial Reconciliation
  // ------------------------------------------------------------------
  {
    key: "financial-reconciliation",
    name: "Financial Reconciliation",
    tagline: "Kill the spreadsheet bridges between operational systems and the ledger.",
    stakes:
      "Every insurer runs on reconciliations: policy-to-billing, claims-to-GL, cession statements to treaty terms, custodian to accounting book. When these run as spreadsheet bridges maintained by whoever inherited them, close cycles stretch, SOX walkthroughs find the same deficiencies annually, and material breaks hide in aging queues. Governing the reconciliation layer — defining the match keys, scoring the breaks, tracing the lineage — converts close-time heroics into an engineered, evidenced process.",
    painPoints: [
      "Subledger-to-GL reconciliations run in spreadsheets with hand-maintained mappings that break every reorganization and system release.",
      "Break resolution is undocumented: items are cleared by adjustment without root-cause categories, so the same breaks recur monthly.",
      "Close timelines absorb reconciliation slack — days of the calendar exist only because the matching is manual.",
      "Auditors sample the bridges every year and every year find the same control gaps, re-papered rather than engineered away.",
    ],
    stakeholders: [
      "Controller and financial close team",
      "SOX / internal control office",
      "Internal and external audit",
      "Operations finance (billing, claims finance, ceded accounting)",
      "Data engineering and platform teams",
    ],
    capabilityEmphasis: {
      data_quality: 3,
      lineage: 2,
      semantic_layer: 2,
      catalog_metadata: 1,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Close cycle time reduced by two or more business days, attributable to automated reconciliation steps.",
      "Unreconciled items older than 30 days down 90% by count and value from baseline.",
      "100% of in-scope reconciliations executed as governed, versioned rules with break root-cause categorization — zero spreadsheet bridges remaining in scope.",
      "SOX deficiencies attributable to reconciliation controls at zero in the next audit cycle.",
      "Break recurrence rate (same root cause reappearing within 90 days) cut by half.",
    ],
    sectorNotes: {
      "pc-personal":
        "Written-to-billed-to-collected premium across policy, billing, and GL — mid-term endorsements and non-pay cancellations are where the pennies hide and the flash gets caveated.",
      "pc-commercial":
        "Premium audit is the aggravator: payroll and receipts adjustments land months after expiration and reopen 'final' earned premium, so the reconciliation must be time-aware, not snapshot-based.",
      "reinsurance":
        "Cession statements against treaty terms — reinstatement premiums, profit commissions, and estimated-to-actual true-ups booked into closed underwriting years — is the reconciliation that defines the technical result.",
      "life-annuities":
        "The actuarial-to-ledger handoff: valuation-system reserve output to GL posting, plus suspense accounts where premium sits while new business pends — both chronic SOX walkthrough findings.",
      "health-benefits":
        "Claims-paid to GL to MLR schedule: the same claim dollars must land consistently in adjudication reporting, the ledger, and the MLR numerator, or rebate calculations inherit the discrepancy.",
      "investments":
        "The signature case: IBOR-to-ABOR-to-custodian three-way reconciliation, with break categorization by cause (pricing, corporate action, timing) instead of one undifferentiated queue.",
      "brokerage-mga":
        "Trust-account and carrier-statement reconciliation — fiduciary premium in, carrier remittance out, commission netted — where aging unallocated cash is the regulatory red flag.",
      "surety":
        "Salvage and recovery netting against paid losses, applied consistently between the claims system and Schedule P, so the loss ratio and the development triangle tell the same story.",
    },
  },

  // ------------------------------------------------------------------
  // 4. Operational FinOps
  // ------------------------------------------------------------------
  {
    key: "operational-finops",
    name: "Operational FinOps",
    tagline: "Make the data estate's cost allocable, challengeable, and worth it.",
    stakes:
      "Cloud data platforms turned infrastructure cost from a fixed line item into a live operational variable — and most insurers cannot say which business line, product, or report drives it. FinOps for the data estate is a governance problem wearing a finance costume: it requires an inventory of workloads and datasets (catalog), ownership and consumption metadata, and telemetry-grade lineage from spend back to the consuming use case. Without it, platform budgets get challenged as overhead; with it, cost conversations become value conversations.",
    painPoints: [
      "Cloud data spend grows quarter over quarter with no defensible allocation to business lines or use cases, so finance challenges the platform budget as undifferentiated overhead.",
      "Orphaned pipelines and abandoned datasets keep running because no inventory ties workloads to owners and consumers.",
      "The most expensive queries and refreshes serve reports nobody can name a consumer for.",
      "Chargeback attempts stall because tagging is inconsistent and nobody governs the tag taxonomy.",
    ],
    stakeholders: [
      "CIO / CTO and platform engineering",
      "CFO and technology finance",
      "FinOps practice lead",
      "Chief Data Officer and domain data owners",
      "Business line COOs receiving allocations",
    ],
    capabilityEmphasis: {
      catalog_metadata: 3,
      stewardship_ops: 2,
      lineage: 2,
      data_quality: 1,
    },
    successMetrics: [
      "Percentage of cloud data spend allocable to a named business line or product above 90%, from under a third.",
      "Decommissioned orphaned pipelines and datasets releasing at least 15% of baseline platform spend within two quarters.",
      "100% of production workloads carrying governed ownership and cost-center tags validated in CI.",
      "Unit cost per governed data product tracked and trending down quarter over quarter.",
      "Monthly showback reports accepted by business-line finance without dispute for three consecutive cycles.",
    ],
    sectorNotes: {
      "pc-personal":
        "Telematics and quote-flow data dominate the bill — high-volume streaming ingest and rating-model scoring whose cost should be priced into product economics, not absorbed as platform overhead.",
      "pc-commercial":
        "Cat modeling and exposure-accumulation runs are the spiky consumers; allocation turns 'the platform is expensive' into 'property underwriting consumed the capacity, priced accordingly.'",
      "reinsurance":
        "Event-response analytics after a cat and renewal-season portfolio runs create seasonal spend spikes that only workload-level attribution can defend to a cost-conscious CFO.",
      "life-annuities":
        "Valuation-grid compute for PBR stochastic runs and experience studies is the cost center; FinOps tells actuarial transformation what each nested-stochastic ambition actually costs.",
      "health-benefits":
        "Claims-line volume makes storage and refresh economics material fast; member-level analytics duplicated across care management, payment integrity, and actuarial is the usual 30% savings hiding in plain sight.",
      "investments":
        "Market-data licensing is the shadow bill: vendor feeds redistributed through the estate with no consumption metadata, risking both cost sprawl and licensing-compliance breaches.",
      "brokerage-mga":
        "Serial acquisitions leave parallel AMS extracts and duplicate integrations running long after migration; the catalog is the decommissioning checklist that finally retires them.",
    },
  },

  // ------------------------------------------------------------------
  // 5. Greenfield Platform
  // ------------------------------------------------------------------
  {
    key: "greenfield-platform",
    name: "Greenfield Platform Build",
    tagline: "Govern it right the first time — controls as day-one platform features, not a retrofit program.",
    stakes:
      "A new lakehouse, a core-system replacement, or a new venture's stack is the one moment governance is cheap: classification at ingest, policy-as-code in CI, catalog registration as a pipeline gate, and semantic definitions ahead of the first dashboard. Every insurer that skipped this is now funding a retrofit program at ten times the cost. The stakes are compounding — patterns set in the first six months become the platform's permanent culture.",
    painPoints: [
      "Delivery pressure front-loads pipelines and defers governance to 'phase two,' which arrives as a remediation program three years later.",
      "Early datasets land unclassified and unowned, and every subsequent dataset copies the pattern.",
      "Access is granted broadly 'for now' during build, and the temporary grants become the permanent access model.",
      "Migrated data inherits legacy quality debt silently because migration validation checked row counts, not meaning.",
    ],
    stakeholders: [
      "Platform / lakehouse program leadership",
      "Chief Data Officer and governance leads",
      "Enterprise and security architecture",
      "Migration and integration delivery teams",
      "Early-adopter business domains",
    ],
    capabilityEmphasis: {
      catalog_metadata: 3,
      access_policy: 2,
      classification: 2,
      semantic_layer: 2,
      data_quality: 2,
      lineage: 2,
      stewardship_ops: 1,
    },
    successMetrics: [
      "100% of onboarded datasets registered in the catalog with owner, classification, and steward at time of landing — enforced as a pipeline gate, not backfilled.",
      "Access policies expressed as code with CI validation for all landing and consumption zones before the first business user is onboarded.",
      "Migration reconciliation coverage: 100% of migrated critical data elements validated by rule, with defect rates published per source.",
      "Zero 'temporary' broad-access grants surviving past 90 days, verified by recurring entitlement review.",
      "Time to onboard each additional data product trending down release over release, evidencing the pattern library compounding.",
    ],
    sectorNotes: {
      "pc-personal":
        "Usually a policy/claims core replacement plus lakehouse: the discipline is making legacy-to-new mapping decisions governed artifacts, so the new core doesn't inherit thirty years of undocumented code values.",
      "pc-commercial":
        "The greenfield moment is the underwriting workbench and submission-AI stack — capture structured exposure and COPE data on day one and the whole downstream chain (pricing, accumulation, reserving) inherits clean inputs.",
      "specialty-es":
        "New-programs velocity is the tension: each new program wants to launch in weeks, so governance must ship as templates — pre-classified data contracts per line of business — or it will be bypassed program by program.",
      "life-annuities":
        "Typically an admin conversion feeding a new valuation data fabric; the non-negotiable is seriatim-level migration validation with lineage, because PBR will interrogate the converted in-force for decades.",
      "health-benefits":
        "A new adjudication platform or member data hub must be HIPAA-native from the first table: PHI classification, minimum-necessary access, and audit logging as landing-zone defaults, not later hardening.",
      "brokerage-mga":
        "Greenfield usually means a unified data layer over acquired AMS estates — the founding act is a mastered client and policy spine with survivorship rules agreed before the first migration, not after the third.",
      "investments":
        "A new investment data platform stands or falls on the security master: one governed instrument and issuer hierarchy from day one, or every downstream book re-fights the identifier wars.",
    },
  },

  // ------------------------------------------------------------------
  // 6. Regulatory Reporting
  // ------------------------------------------------------------------
  {
    key: "regulatory-reporting",
    name: "Regulatory Reporting Confidence",
    tagline: "Answer the examiner from lineage, not archaeology.",
    stakes:
      "Statutory blanks, Schedule P and D, MLR filings, market-conduct data calls, Solvency II QRTs, IFRS 17 disclosures — every one is a data product with a regulator as the consumer and a signature attesting to it. When production runs on spreadsheet assembly and tribal knowledge, each filing season is a fire drill and each exam request a scramble. Governance turns filings into traceable pipelines: governed inputs, tested transformations, and lineage that answers an examiner's 'show me how this cell was produced' in hours.",
    painPoints: [
      "Filing production depends on a handful of people who know where the spreadsheets are and which manual adjustments to reapply each cycle.",
      "Exam and audit data requests take weeks of reconstruction because no lineage connects filed figures to source transactions.",
      "The same underlying facts are restated differently across statutory, GAAP, and management bases with no controlled crosswalk.",
      "Late-breaking source-data corrections force refiling decisions with no impact analysis of what else the correction touched.",
    ],
    stakeholders: [
      "Chief Accounting Officer / statutory reporting team",
      "Appointed Actuary and valuation teams",
      "Regulatory affairs and compliance",
      "State DOI examiners and external auditors (as consumers)",
      "Data engineering owning reporting pipelines",
    ],
    capabilityEmphasis: {
      lineage: 3,
      data_quality: 2,
      semantic_layer: 2,
      catalog_metadata: 1,
      classification: 1,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Examiner and auditor data-request turnaround down from weeks to under five business days, with lineage evidence attached.",
      "Manual adjustments in filing production reduced 75% by count, with every survivor logged, justified, and owned.",
      "100% of in-scope filing line items traceable to governed source datasets through documented, tested transformations.",
      "Zero late filings and zero data-driven refilings across a full annual cycle.",
      "Filing production calendar compressed by at least 20%, releasing reporting-team capacity from assembly to review.",
    ],
    sectorNotes: {
      "pc-personal":
        "Schedule P is the crucible: accident-year triangles, net of salvage and reinsurance, that must tie to the ledger and to the actuarial opinion — plus market-conduct data calls arriving on DOI timelines, not yours.",
      "pc-commercial":
        "Adds the line-of-business mapping problem: claims, GL, and Schedule P hierarchies maintained in three places must produce one consistent statutory story across dozens of writing companies.",
      "specialty-es":
        "Surplus lines tax filings across stamping offices plus Lloyd's returns where syndicate capacity sits behind the book — two regulatory consumers with bordereaux-grade granularity expectations.",
      "reinsurance":
        "Assumed/ceded schedules, counterparty concentration disclosures, and Solvency II or IFRS 17 group reporting — all demanding contract-level granularity from a treaty-statement world.",
      "life-annuities":
        "PBR is the frontier: VM-20/VM-21 reserves require demonstrating input-data integrity as part of the valuation itself, and the VM-31 report is, in effect, a lineage document the appointed actuary signs.",
      "health-benefits":
        "MLR filings with rebate consequences: numerator classification (claims vs. quality improvement vs. admin) must be rule-governed, because a misclassification is not a typo, it is a liability.",
      "investments":
        "Schedule D at CUSIP level with NAIC designations, plus RBC asset charges — the filing where identifier hygiene and designation mappings either exist as governed reference data or become quarter-end triage.",
      "surety":
        "A small line with outsized reporting sensitivity: lumpy severity and salvage netting conventions make each Schedule P entry material, so the audit trail per figure matters more than volume.",
    },
  },

  // ------------------------------------------------------------------
  // 7. Claims Analytics
  // ------------------------------------------------------------------
  {
    key: "claims-analytics",
    name: "Claims Analytics Acceleration",
    tagline: "Turn the claims file — structured and free-text — into a decision asset.",
    stakes:
      "Claims is where an insurer's promises are kept and where most of its data value is buried: severity drivers, litigation propensity, fraud signals, leakage patterns, subrogation opportunities. The blockers are always the same — inconsistent intake coding, sensitive free-text nobody may touch, reserve histories that were never event-sourced, and 'claim count' meaning four different things. Governing the claims domain converts adjuster narrative and transaction history into modeling-grade inputs, and every point of loss-ratio improvement it enables is worth multiples of the program's cost.",
    painPoints: [
      "Loss-cause, injury, and litigation coding differ by intake channel and adjuster habit, degrading every frequency and severity analysis built on them.",
      "Claims free-text — the richest signal in the file — is off-limits to analytics because it is saturated with unclassified NPPI/PHI.",
      "Reserve and status changes are stored as snapshots, not events, so development behavior must be reconstructed rather than queried.",
      "Claim, claimant, feature, and transaction counts are conflated, so basic metrics disagree before modeling even starts.",
    ],
    stakeholders: [
      "Chief Claims Officer and claims operations",
      "Claims analytics / data science teams",
      "Reserving actuaries",
      "SIU and litigation management",
      "Privacy office (as gatekeeper turned partner)",
    ],
    capabilityEmphasis: {
      data_quality: 3,
      classification: 2,
      semantic_layer: 2,
      catalog_metadata: 2,
      lineage: 1,
    },
    successMetrics: [
      "Claims data-product onboarding for a new model down from months to weeks, measured request-to-training-data.",
      "Coding consistency: intake fields under governed valuelists with conformance above 95%, up from unmeasured.",
      "Free-text corpora classified and de-identified for analytics use, with privacy-approved access for 100% of active claims-model use cases.",
      "Model-input DQ checks running on every scoring and retraining feed, with breaks blocking promotion rather than surfacing post hoc.",
      "Measured leakage or severity findings from newly enabled analyses, reported in dollars per quarter to the claims committee.",
    ],
    sectorNotes: {
      "pc-personal":
        "Volume plays: FNOL-time severity triage, straight-through settlement of low-complexity claims, and fraud scoring — all gated on channel-consistent intake coding and de-identified narrative text.",
      "pc-commercial":
        "Long-tail focus: litigation propensity and attorney-involvement models on liability lines, and workers' comp medical-severity trajectories where PHI governance decides what modeling is even permissible.",
      "specialty-es":
        "Sparse-data discipline: with low frequency and high severity, a single miscoded large loss distorts the signal, so large-loss coding standards and manuscript-form coverage mapping carry the analytics.",
      "reinsurance":
        "The claims file is the cedent's, not yours: analytics run on advices and bordereaux, so cedent-feed quality scoring and consistent event coding are the enabling governance, not adjuster-level fields.",
      "life-annuities":
        "Claims analytics means mortality experience and claim-time fraud (death-master matching, contestability review) — plus surrender behavior as the 'claim-like' event actuaries most want modeled.",
      "health-benefits":
        "Payment integrity and utilization analytics at industrial scale: benefit-configuration consistency and provider identity resolution determine whether fraud-waste-abuse models see patterns or noise.",
      "surety":
        "Less frequency modeling than early warning: linking principal financial-surveillance data to default outcomes, and mining recovery histories to sharpen salvage assumptions in reserving.",
    },
  },

  // ------------------------------------------------------------------
  // 8. Actuarial Readiness
  // ------------------------------------------------------------------
  {
    key: "actuarial-readiness",
    name: "Actuarial Data Readiness",
    tagline: "Certified reserving and pricing inputs — ASOP 23 as a data product, not a disclaimer.",
    stakes:
      "Actuaries spend a third of every valuation cycle validating extracts instead of doing actuarial work, and ASOP 23's data-quality review lands on data the actuary neither controls nor can trace. Actuarial readiness means certified data products for reserving, pricing, and valuation: governed triangle definitions, quality rules aligned to actuarial standards, assumption sets managed as versioned data, and lineage the appointed actuary can cite in the opinion. The payoff is faster cycles, defensible opinions, and actuarial capacity returned to analysis.",
    painPoints: [
      "Every quarter begins with actuaries re-validating extracts because no upstream certification exists to rely on, and ASOP 23 reliance language papers over the gap.",
      "Triangle construction rules (paid vs. incurred, gross vs. net, salvage treatment) live in spreadsheet formulas with no governed definition.",
      "Assumption sets are versioned inside model files, so reproducing last year's valuation or unwinding an assumption change is archaeology.",
      "Late data corrections arrive after the actuarial close, forcing judgment overlays that must then be explained to auditors and regulators.",
    ],
    stakeholders: [
      "Chief Actuary and Appointed Actuary",
      "Reserving, pricing, and valuation teams",
      "Data engineering supporting actuarial platforms",
      "External auditors and consulting actuaries",
      "CFO (as consumer of reserve and pricing conclusions)",
    ],
    capabilityEmphasis: {
      data_quality: 3,
      lineage: 2,
      semantic_layer: 2,
      catalog_metadata: 2,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Actuarial data-validation effort down from weeks to days per cycle, measured in actuary-hours before methods work begins.",
      "100% of reserving and valuation critical data elements under named DQ rules mapped to ASOP 23 review criteria, with pass evidence archived per cycle.",
      "Triangle and extract definitions published as governed semantic assets, with zero private variant spreadsheets in the close path.",
      "Assumption sets managed as versioned, governed data with full reproduce-ability of any prior valuation run on demand.",
      "Data-related audit findings against the actuarial function at zero across two consecutive opinion cycles.",
    ],
    sectorNotes: {
      "pc-personal":
        "Reserving off high-volume triangles: the win is a certified reserving mart where paid/incurred/salvage treatments are governed once, ending the quarterly extract-rebuild ritual.",
      "pc-commercial":
        "Adds mapping fragility — line-of-business and segment hierarchies drifting between claims, GL, and Schedule P are the top source of triangle distortion and restated development factors.",
      "specialty-es":
        "Thin, volatile triangles make individual data errors material; readiness emphasizes large-loss data certification and exposure-basis governance for frequency-severity and exposure-based methods.",
      "reinsurance":
        "Assumed reserving on lagged cedent data: readiness means quality-scored cedent feeds actuaries can credibility-weight explicitly, instead of applying uniform skepticism to everything.",
      "life-annuities":
        "The deepest version: seriatim in-force integrity for VM-20/VM-21, assumption governance with experience-study lineage, and LDTI cohort data — where the VM-31 report effectively audits the data pipeline itself.",
      "health-benefits":
        "Completion-factor IBNR rests on received/processed/paid date integrity across adjudication migrations; readiness reconciles the actuarial and finance lag views into one governed lag dataset.",
      "surety":
        "Small-triangle discipline: with sparse defaults and lumpy severity, readiness centers on recovery-timing data and consistent salvage netting so the tail assumptions are evidence, not folklore.",
    },
  },

  // ------------------------------------------------------------------
  // 9. M&A Integration
  // ------------------------------------------------------------------
  {
    key: "ma-integration",
    name: "M&A / Portfolio Integration",
    tagline: "Two of everything, one deal thesis — make the combined book reportable before the synergy clock runs out.",
    stakes:
      "Every insurance acquisition lands the same morning-after problem: two policy systems, two charts of accounts, two definitions of premium, and a combined-entity report due before any system consolidates. Renewal-rights deals, book rolls, and MGA acquisitions repeat it in miniature. Governance is the integration's critical path: mapped and mastered parties, crosswalked products and codes, quality-scored migrated data, and a semantic layer that reports the combined book while the estates converge. Deals that skip this discover their synergy case was priced on data that doesn't add.",
    painPoints: [
      "Day-one combined reporting is produced by spreadsheet consolidation over unmapped charts of accounts and product hierarchies.",
      "The same insured, producer, or provider exists in both estates with no resolution, corrupting aggregation, clearance, and cross-sell from day one.",
      "Migration validates row counts, not meaning — code values translate silently wrong and surface later as reserve or commission errors.",
      "Retention of the acquired book is unmeasurable during the window it is most at risk because 'renewal' is defined differently in each estate.",
    ],
    stakeholders: [
      "Corporate development / integration management office",
      "CFO and controllership of both entities",
      "Chief Data Officer and integration architects",
      "Business line leaders owning the combined book",
      "Regulators approving or monitoring the transaction",
    ],
    capabilityEmphasis: {
      catalog_metadata: 3,
      semantic_layer: 2,
      lineage: 2,
      data_quality: 2,
      classification: 1,
      access_policy: 1,
      stewardship_ops: 1,
    },
    successMetrics: [
      "Combined-entity management reporting live on governed crosswalks within 90 days of close, replacing spreadsheet consolidation.",
      "Party-resolution coverage across both estates above 95% for insureds, producers, and counterparties in scope.",
      "100% of migrated critical data elements validated by mapped-meaning rules (not row counts), with defect rates published per source system.",
      "Acquired-book retention measurable weekly from week one, on a single governed definition of renewal.",
      "Integration synergy targets tracked on certified metrics, with zero restatements of synergy reporting to the board.",
    ],
    sectorNotes: {
      "pc-personal":
        "Usually a book roll or carrier acquisition where rate-filing and class-plan differences mean 'the same product' isn't — the crosswalk is actuarial work, not just IT mapping, and mis-mapped class codes reprice the book silently.",
      "pc-commercial":
        "Party resolution is the deal-killer: overlapping insureds and broker hierarchies across estates corrupt clearance and aggregate exposure from day one; the mastered-party spine is the first integration deliverable, not the last.",
      "specialty-es":
        "Acquisitions come with programs and binders attached: due diligence on bordereaux quality and coverage-taxonomy mapping decides whether the acquired portfolio can even be accumulated with the existing one.",
      "life-annuities":
        "Block acquisitions and reinsurance-driven transactions turn on seriatim data quality: the ceding company's conversion scars become your valuation problem, and PBR gives you no grace period for inherited data debt.",
      "health-benefits":
        "Provider-network and member overlap analysis gates the synergy case; two credentialing files and two member masters must resolve before network-adequacy filings for the combined entity are even possible.",
      "brokerage-mga":
        "The serial-acquirer's sector: every tuck-in adds an AMS with duplicate clients and divergent commission codes, so the roll-up's enterprise value literally depends on a repeatable book-onboarding governance pattern.",
      "investments":
        "Merging general accounts means merging security masters and accounting bases — duplicate instrument records and mismatched NAIC designations surface directly in the combined Schedule D.",
    },
  },

  // ------------------------------------------------------------------
  // 10. AI/ML Readiness
  // ------------------------------------------------------------------
  {
    key: "ai-ml-readiness",
    name: "AI/ML Readiness & Model Governance",
    tagline: "Ship models regulators will accept — with the data pedigree to prove every prediction's provenance.",
    stakes:
      "Insurance AI is now regulated in its own right: the NAIC model bulletin, state DOI scrutiny of rating and claims models, and the EU AI Act for cross-border groups all converge on the same demands — know your training data, prove it is fit and fair, control who builds on what, and explain any output on request. Data governance is the substrate: cataloged and classified training data, lineage from prediction back through features to sources, quality gates on model inputs, and access controls on sensitive attributes. Without it, every model is one data call away from a suspension.",
    painPoints: [
      "Nobody can fully enumerate what data trained the models in production, which is now a direct regulatory question with an attestation attached.",
      "Protected-class and proxy variables are not systematically flagged, so unfair-discrimination testing starts from an unknown feature inventory.",
      "Feature pipelines bypass the governed estate, so model inputs drift from certified sources without detection.",
      "Third-party data and models (scores, enrichment, foundation models) enter the stack with no vendor-data governance or contractual lineage.",
    ],
    stakeholders: [
      "Chief Data / Analytics Officer and ML engineering",
      "Model risk management and validation",
      "Compliance and regulatory affairs",
      "Chief Underwriting Officer and Chief Claims Officer (model owners)",
      "State DOIs and group supervisors (as examiners of AI programs)",
    ],
    capabilityEmphasis: {
      lineage: 3,
      classification: 2,
      data_quality: 2,
      access_policy: 2,
      catalog_metadata: 2,
      stewardship_ops: 1,
    },
    successMetrics: [
      "100% of production models with a complete, on-demand training-data inventory: datasets, versions, features, and source lineage.",
      "Sensitive and potential-proxy attributes flagged in the feature catalog for 100% of rating and claims models, feeding documented fairness testing each release.",
      "Model input feeds carrying automated DQ gates, with drift or quality breaches alerting before scoring impact rather than after.",
      "Regulatory AI inquiries answered within ten business days with evidence assembled from governed metadata, not reconstructed by hand.",
      "Time-to-production for a new governed model use case down 40%, because data discovery, approval, and access ride existing rails.",
    ],
    sectorNotes: {
      "pc-personal":
        "Ground zero for regulatory attention: rating and telematics models face unfair-discrimination testing, and credit-based and third-party scores need consent-and-provenance lineage a DOI data call can interrogate.",
      "pc-commercial":
        "Submission-AI and pricing-model governance: document-extraction models feeding underwriting decisions need extraction-accuracy telemetry, and ASOP 56 puts model-input data squarely in the actuary's professional scope.",
      "life-annuities":
        "Accelerated underwriting is the exposed flank — mortality models consuming Rx and lab data must prove both predictive validity and disparate-impact testing, with experience-study feedback loops regulators increasingly ask to see.",
      "health-benefits":
        "Care-management targeting and payment-integrity models operate on PHI under both HIPAA and emerging algorithmic-fairness scrutiny; de-identification pedigree and bias testing on clinical proxies are the gating evidence.",
      "reinsurance":
        "Model risk concentrates in cat models and cedent-data-driven pricing: governance means versioned event sets, documented model-blending judgments, and quality-scored cedent inputs behind every technical price.",
      "specialty-es":
        "Submission-triage and document-AI models run on unstructured broker data; readiness means the extraction layer is measured and versioned so 'the model read the schedule wrong' is detectable, not discovered at claim time.",
      "brokerage-mga":
        "Placement-recommendation and renewal-propensity models must navigate conflicted-advice optics: governed feature sets and decision logging are what separate 'analytics-assisted broking' from a market-conduct finding.",
      "investments":
        "Credit and valuation models for private assets need input pedigree — which financials, which vendor marks, which overrides — because model-driven valuations flow into statutory statements the CFO signs.",
    },
  },
];
