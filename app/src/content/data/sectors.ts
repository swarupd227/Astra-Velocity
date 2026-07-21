import type { Sector } from "../types";

/**
 * Sector ontology: nine insurance sectors, each modeled as a value chain of
 * stages with the data domains that flow through them and the governance pain
 * that accumulates there. Content is client-generic and insurance-native.
 */
export const SECTORS: Sector[] = [
  // ------------------------------------------------------------------
  // 1. Personal Lines P&C
  // ------------------------------------------------------------------
  {
    key: "pc-personal",
    name: "P&C — Personal Lines",
    tagline: "High-volume auto and home, priced by the model, judged by the month-end flash.",
    narrative:
      "Personal lines runs on volume: millions of policies, straight-through quoting, and rating models retrained on telematics and credit-based scores. Governance here means the rating and claims data feeding those models is classified, tested, and explainable — because a mispriced segment shows up in the loss ratio within two quarters and in a market-conduct exam within two years. The monthly flash pack, the Schedule P triangles, and every filed rate all trace back to the same premium and loss records, and they had better reconcile.",
    valueChain: [
      {
        key: "quote-bind",
        name: "Quote & Bind",
        description:
          "Digital and agent-assisted quoting, rating-engine execution, and bind — the widest data intake surface in the sector.",
        dataDomains: ["party", "product", "coverage", "premium", "producer-distribution"],
        painPoints: [
          "Third-party enrichment (MVRs, credit-based insurance scores, telematics consent) lands unclassified, so nobody can say which rating inputs are regulated NPPI.",
          "Quote records and bound-policy records disagree on coverage limits because the rating engine and policy admin keep separate product models.",
        ],
      },
      {
        key: "policy-admin",
        name: "Policy Administration",
        description:
          "Issuance, endorsements, renewals, and cancellations across the in-force book.",
        dataDomains: ["policy", "coverage", "premium", "party"],
        painPoints: [
          "Endorsement-effective vs. transaction-effective dates are conflated downstream, corrupting in-force counts and earned-premium calculations.",
          "Legacy policy admin migrations left dual policy-number schemes with no authoritative crosswalk.",
        ],
      },
      {
        key: "billing",
        name: "Billing & Payments",
        description:
          "Installment billing, agency vs. direct bill, payment plans, and cancellation for non-pay.",
        dataDomains: ["billing", "premium", "party", "producer-distribution"],
        painPoints: [
          "Written premium in the policy system and billed premium in the billing system diverge on mid-term endorsements, and the reconciliation is a spreadsheet.",
          "Payment card and bank data leaks into analytics extracts because billing feeds were never classified at column level.",
        ],
      },
      {
        key: "claims-fnol",
        name: "Claims — FNOL & Triage",
        description:
          "First notice of loss across call center, mobile, and telematics-triggered channels; segmentation and assignment.",
        dataDomains: ["claim", "party", "coverage", "policy"],
        painPoints: [
          "FNOL free-text carries medical detail, minors' data, and third-party claimant NPPI that no classifier has ever scanned.",
          "Loss-cause and injury coding at intake is inconsistent across channels, degrading every downstream frequency and severity analysis.",
        ],
      },
      {
        key: "claims-adjudication",
        name: "Claims — Adjudication & Settlement",
        description:
          "Coverage verification, reserving at the file level, litigation and SIU handling, payment and recovery.",
        dataDomains: ["claim", "reserve", "coverage", "party", "financials-gl"],
        painPoints: [
          "Case reserve changes are not event-sourced, so loss-development analysts reconstruct history from snapshots.",
          "Subrogation and salvage recoveries post to the GL on a different timing basis than the claims system, creating paid-loss breaks at close.",
        ],
      },
      {
        key: "reserving",
        name: "Actuarial Reserving",
        description:
          "Quarterly IBNR estimation, loss triangles by line and accident year, and ASOP 23-grade data review.",
        dataDomains: ["reserve", "claim", "premium", "exposure"],
        painPoints: [
          "Actuaries spend the first two weeks of every quarter re-validating extracts because there is no certified reserving data product.",
          "Triangle definitions (paid vs. incurred, gross vs. net of salvage) vary by spreadsheet lineage nobody can produce.",
        ],
      },
      {
        key: "reinsurance",
        name: "Ceded Reinsurance",
        description:
          "Cat treaty and quota-share cessions, event coding, and recoverables on large or catastrophe losses.",
        dataDomains: ["reinsurance-cession", "claim", "premium", "exposure"],
        painPoints: [
          "Catastrophe event codes are applied inconsistently at FNOL, so cat cessions and recoverables require manual re-tagging after every event.",
        ],
      },
      {
        key: "financial-reporting",
        name: "Financial & Statutory Reporting",
        description:
          "Monthly flash, statutory annual statement, Schedule P, and rate-filing support exhibits.",
        dataDomains: ["financials-gl", "premium", "reserve", "claim", "reference-regulatory"],
        painPoints: [
          "The flash pack, the statutory blanks, and the pricing datamart each compute earned premium slightly differently — and leadership sees all three.",
          "Close-calendar pressure means known data-quality breaks are waived rather than fixed, quarter after quarter.",
        ],
      },
    ],
    systemArchetypes: [
      "Policy administration (e.g. Guidewire PolicyCenter, Duck Creek Policy)",
      "Claims management (e.g. Guidewire ClaimCenter, Duck Creek Claims)",
      "Billing (e.g. Guidewire BillingCenter, Majesco Billing)",
      "Rating engine (e.g. Earnix, hyperexponential, homegrown rater)",
      "Telematics platform (e.g. Cambridge Mobile Telematics, Arity)",
      "Cloud analytics lakehouse (e.g. Snowflake, Databricks) with BI consumption (e.g. Power BI, Tableau)",
      "Statutory reporting suite (e.g. Workiva, Sapiens StatementPro)",
    ],
    distributionModel:
      "Direct-to-consumer digital plus captive and independent agents; heavy comparative-rater and aggregator traffic.",
    signaturePainPoints: [
      "Rating-model inputs (credit, telematics, third-party scores) lack classification and consent lineage, exposing the book to unfair-discrimination findings.",
      "Written, earned, and billed premium disagree across policy, billing, and finance systems, and the monthly flash absorbs the argument.",
      "Claims free-text is a lake of unclassified NPPI — medical, minors, third-party claimants — blocking analytics access wholesale.",
      "Loss triangles are rebuilt by hand each quarter because no reserving extract is certified or lineage-traceable.",
    ],
    obligationKeys: [
      "naic-model-audit-rule",
      "sox-icfr",
      "statutory-annual-statement",
      "schedule-p",
      "asop-23",
      "glba-nppi",
      "state-privacy-laws",
      "naic-ai-model-bulletin",
      "state-doi-market-conduct",
    ],
    kpiKeys: [
      "loss-ratio",
      "combined-ratio",
      "expense-ratio",
      "written-premium",
      "earned-premium",
      "policies-in-force",
      "retention-ratio",
      "quote-to-bind",
      "claims-frequency",
      "claims-severity",
      "loss-development-factor",
      "ibnr-adequacy",
    ],
  },

  // ------------------------------------------------------------------
  // 2. Commercial Lines P&C
  // ------------------------------------------------------------------
  {
    key: "pc-commercial",
    name: "P&C — Commercial Lines",
    tagline: "Submission-driven underwriting where exposure data quality is the price of admission.",
    narrative:
      "Commercial lines lives and dies on the submission: broker-supplied schedules of vehicles, locations, payrolls, and loss runs that arrive as spreadsheets and PDFs. Governance here means turning that unstructured intake into COPE-complete exposure records an underwriter can price and an actuary can trust — and keeping the audit trail from bound account to Schedule P intact. Workers' compensation adds medical data handling; multi-state placements add a lattice of DOI expectations.",
    valueChain: [
      {
        key: "submission-intake",
        name: "Submission & Clearance",
        description:
          "Broker submission intake, clearance against the in-force and prospect book, and appetite triage.",
        dataDomains: ["party", "exposure", "producer-distribution", "product"],
        painPoints: [
          "The same insured arrives under five name variants across brokers; clearance without party resolution means duplicated effort and channel conflict.",
          "Statement-of-values and loss-run attachments are ingested as blobs — exposure data is re-keyed manually or not captured at all.",
        ],
      },
      {
        key: "underwriting",
        name: "Underwriting & Pricing",
        description:
          "Risk assessment on COPE and payroll/receipts exposure, loss-rating on prior experience, terms and authority checks.",
        dataDomains: ["exposure", "coverage", "premium", "party", "reference-regulatory"],
        painPoints: [
          "COPE attributes (construction, occupancy, protection, exposure) are incomplete on a third of locations, forcing conservative pricing or silent guesswork.",
          "Underwriter modifications to model-suggested pricing are not captured as structured data, so pricing-adequacy studies can't separate model from judgment.",
        ],
      },
      {
        key: "policy-admin",
        name: "Policy Administration",
        description:
          "Issuance, endorsements, audits (payroll/receipts), renewals across multi-line, multi-state accounts.",
        dataDomains: ["policy", "coverage", "premium", "exposure"],
        painPoints: [
          "Premium audit adjustments arrive months after expiration and reopen earned-premium figures the business considered final.",
          "Multi-entity insured hierarchies (parent, subsidiaries, additional insureds) are flattened, breaking account-level profitability views.",
        ],
      },
      {
        key: "billing",
        name: "Billing & Collections",
        description:
          "Agency bill with commission netting, direct bill, premium finance, and audit-driven adjustments.",
        dataDomains: ["billing", "premium", "producer-distribution", "financials-gl"],
        painPoints: [
          "Agency-bill cash application depends on broker statements that don't match booked premium at line level, aging the receivables ledger.",
        ],
      },
      {
        key: "claims-management",
        name: "Claims Management",
        description:
          "FNOL through adjudication for property, liability, and workers' compensation, including litigation management and medical bill review.",
        dataDomains: ["claim", "reserve", "coverage", "party"],
        painPoints: [
          "Workers' comp files mix medical records and indemnity data with general claim data, and access controls are file-level, not field-level.",
          "Large-loss reserve changes are communicated by email before they hit the system, so actuarial and ceded-re see them late.",
        ],
      },
      {
        key: "reserving",
        name: "Actuarial Reserving",
        description:
          "IBNR by line and accident year, large-loss and cat load analysis, ASOP 23 data-quality review, Schedule P production support.",
        dataDomains: ["reserve", "claim", "premium", "exposure"],
        painPoints: [
          "Line-of-business mappings between the claims system, the GL, and Schedule P are maintained in three places and drift every reorganization.",
          "Reserving actuaries cannot trace a triangle cell back to claim transactions without IT intervention.",
        ],
      },
      {
        key: "ceded-reinsurance",
        name: "Ceded Reinsurance",
        description:
          "Per-risk and treaty cessions, facultative placements on large accounts, recoverables management.",
        dataDomains: ["reinsurance-cession", "claim", "premium", "exposure"],
        painPoints: [
          "Facultative certificates live in a document repository disconnected from the policies they protect; recoverables are discovered, not managed.",
        ],
      },
      {
        key: "financial-reporting",
        name: "Financial & Statutory Reporting",
        description:
          "Management P&L by segment, statutory blanks, Schedule P, and SOX-controlled close.",
        dataDomains: ["financials-gl", "premium", "reserve", "reference-regulatory"],
        painPoints: [
          "Segment reporting hierarchies are rebuilt in BI tools instead of governed as reference data, so 'profit by industry segment' varies by report author.",
        ],
      },
    ],
    systemArchetypes: [
      "Policy administration (e.g. Guidewire PolicyCenter, Duck Creek, Majesco)",
      "Claims management (e.g. Guidewire ClaimCenter, Origami Risk)",
      "Submission/underwriting workbench (e.g. Federato, Send, homegrown)",
      "Exposure management & cat modeling (e.g. Moody's RMS, Verisk Touchstone)",
      "Medical bill review & managed care (e.g. Mitchell, Enlyte) for workers' comp",
      "Cloud data platform (e.g. Snowflake, Databricks) with governed BI (e.g. Power BI)",
    ],
    distributionModel:
      "Independent retail brokers and wholesalers, with national broker relationships dominating large accounts.",
    signaturePainPoints: [
      "Submission data arrives as unstructured attachments; exposure completeness is a per-underwriter habit, not a measured standard.",
      "Insured-party resolution across brokers, subsidiaries, and additional insureds is unsolved, corrupting clearance, aggregation, and profitability views.",
      "Premium audit and late-arriving adjustments reopen 'final' earned premium, and downstream reports disagree on when.",
      "Workers' comp medical data demands field-level access control the estate can't express.",
    ],
    obligationKeys: [
      "naic-model-audit-rule",
      "sox-icfr",
      "statutory-annual-statement",
      "schedule-p",
      "asop-23",
      "asop-56",
      "glba-nppi",
      "state-doi-market-conduct",
      "ofac-sanctions",
      "naic-ai-model-bulletin",
    ],
    kpiKeys: [
      "loss-ratio",
      "combined-ratio",
      "lae-ratio",
      "written-premium",
      "earned-premium",
      "quote-to-bind",
      "stp-rate",
      "retention-ratio",
      "claims-severity",
      "loss-development-factor",
      "ibnr-adequacy",
      "net-retention",
    ],
  },

  // ------------------------------------------------------------------
  // 3. Specialty & Excess/Surplus
  // ------------------------------------------------------------------
  {
    key: "specialty-es",
    name: "Specialty & Excess/Surplus Lines",
    tagline: "Hard-to-place risk, freedom of rate and form — and none of the data discipline that admitted filing forces.",
    narrative:
      "E&S and specialty writers price risks the admitted market declines, on manuscript forms, often through wholesale channels and delegated authority. The freedom from filed rates and forms removes the discipline that admitted filings impose on data, so product, coverage, and exposure definitions proliferate per deal. Governance here means imposing enough semantic and quality structure to aggregate a book of one-off risks — for pricing, for cat accumulation, for surplus lines tax compliance, and for Lloyd's or reinsurer reporting where capacity demands it.",
    valueChain: [
      {
        key: "submission-triage",
        name: "Submission Triage & Appetite",
        description:
          "High-volume wholesale submission flow triaged against appetite, capacity, and sanctions screening.",
        dataDomains: ["party", "exposure", "producer-distribution", "reference-regulatory"],
        painPoints: [
          "Submission-to-quote ratios are unmanageable without structured triage data, yet 80% of the risk narrative lives in broker emails.",
          "Sanctions and denied-party screening runs on free-text insured names with no party-mastering behind it.",
        ],
      },
      {
        key: "underwriting-pricing",
        name: "Underwriting & Manuscript Pricing",
        description:
          "Bespoke rating on engineering, financial, or professional-liability exposure; manuscript form drafting; layer and attachment structuring.",
        dataDomains: ["exposure", "coverage", "premium", "product"],
        painPoints: [
          "Every manuscript form is a new coverage semantic; nothing maps bound terms to a governed coverage taxonomy, so accumulation by peril is an estimate.",
          "Rater spreadsheets are versioned per underwriter; the priced deal and the booked deal can differ silently.",
        ],
      },
      {
        key: "binding-issuance",
        name: "Binding & Issuance",
        description:
          "Binder issuance, policy issuance often weeks later, surplus lines affidavit and stamping-office filings.",
        dataDomains: ["policy", "coverage", "premium", "reference-regulatory"],
        painPoints: [
          "Bound-not-issued backlogs mean the system of record trails the risk actually on the books by 30-90 days.",
          "Surplus lines tax jurisdiction allocation (home-state rules, multi-state risks) is computed in spreadsheets with no audit trail.",
        ],
      },
      {
        key: "premium-tax-processing",
        name: "Premium Processing & Surplus Lines Tax",
        description:
          "Premium booking, surplus lines tax and stamping-fee calculation and remittance across jurisdictions.",
        dataDomains: ["premium", "billing", "reference-regulatory", "producer-distribution"],
        painPoints: [
          "Stamping-office rejections cycle back weeks later against records that have since been endorsed, creating unmatched tax positions.",
        ],
      },
      {
        key: "claims",
        name: "Claims & Litigation Management",
        description:
          "Low-frequency, high-severity claims with heavy coverage-counsel involvement and manuscript-form interpretation.",
        dataDomains: ["claim", "reserve", "coverage", "party"],
        painPoints: [
          "Coverage determinations hinge on manuscript wording that exists only as PDF; claims systems record the outcome but not the clause.",
          "Severity development on long-tail specialty lines is obscured by sparse data and inconsistent large-loss coding.",
        ],
      },
      {
        key: "reserving",
        name: "Actuarial Reserving",
        description:
          "IBNR on thin, volatile triangles; heavy reliance on exposure-based and frequency-severity methods; ASOP 23 scrutiny of sparse data.",
        dataDomains: ["reserve", "claim", "premium", "exposure"],
        painPoints: [
          "Thin triangles make every data error material; a single miscoded large loss moves the booked IBNR.",
        ],
      },
      {
        key: "outward-reinsurance",
        name: "Outward Reinsurance & Capacity",
        description:
          "Quota share, surplus, and fac placements backing the book; Lloyd's syndicate capacity and coverholder reporting where applicable.",
        dataDomains: ["reinsurance-cession", "premium", "claim", "exposure"],
        painPoints: [
          "Reinsurer and syndicate reporting demands bordereaux-grade detail the front-end systems never captured, so monthly bordereaux are reconstructed by hand.",
        ],
      },
      {
        key: "reporting",
        name: "Management & Regulatory Reporting",
        description:
          "Underwriting-year and accident-year views, Lloyd's returns where capacity is syndicate-backed, statutory reporting for the carrier stack.",
        dataDomains: ["financials-gl", "premium", "reserve", "reference-regulatory"],
        painPoints: [
          "Underwriting-year vs. accident-year vs. calendar-year results are conflated in management packs, and each audience believes a different number.",
        ],
      },
    ],
    systemArchetypes: [
      "Specialty policy administration (e.g. ICE InsureTech, Sequel/Verisk, Duck Creek)",
      "London-market placing and processing (e.g. PPL, Whitespace, Velonetic back-office)",
      "Underwriting workbench with document AI (e.g. Send, Cytora, hyperexponential)",
      "Cat and exposure accumulation (e.g. Moody's RMS, Verisk, JBA)",
      "Surplus lines tax engine (e.g. InsCipher, Zoomin/state stamping portals)",
      "Cloud analytics platform (e.g. Snowflake, Databricks)",
    ],
    distributionModel:
      "Wholesale brokers and MGAs/coverholders under delegated authority; London market broking for syndicate-backed capacity.",
    signaturePainPoints: [
      "Manuscript forms mean no two policies share coverage semantics; portfolio aggregation and peril accumulation rest on unmanaged mappings.",
      "Bound-not-issued lag leaves the system of record weeks behind the risk actually held.",
      "Bordereaux obligations to reinsurers, syndicates, and stamping offices are met by manual reconstruction every month.",
      "Underwriting-year, accident-year, and calendar-year results are conflated across management reporting.",
    ],
    obligationKeys: [
      "lloyds-minimum-standards",
      "statutory-annual-statement",
      "schedule-p",
      "asop-23",
      "sox-icfr",
      "ofac-sanctions",
      "state-doi-market-conduct",
      "naic-model-audit-rule",
    ],
    kpiKeys: [
      "quote-to-bind",
      "written-premium",
      "earned-premium",
      "loss-ratio",
      "combined-ratio",
      "claims-severity",
      "loss-development-factor",
      "cession-rate",
      "net-retention",
      "ibnr-adequacy",
    ],
  },

  // ------------------------------------------------------------------
  // 4. Reinsurance
  // ------------------------------------------------------------------
  {
    key: "reinsurance",
    name: "Reinsurance",
    tagline: "A business built on other people's data — treaties, cessions, and bordereaux you didn't create but must trust.",
    narrative:
      "A reinsurer's raw material is cedent data: bordereaux, treaty statements, and claims advices produced by someone else's systems to someone else's standards. Governance is therefore mostly inbound — validating, normalizing, and enriching ceded data well enough to price renewals, book technical results, estimate IBNR on assumed business, and collect recoverables. Aggregation control across treaties, layers, and retro programs is the solvency question; contract-data fidelity from the slip to the booked treaty is the audit question.",
    valueChain: [
      {
        key: "treaty-placement",
        name: "Treaty Placement & Contract Data",
        description:
          "Renewal negotiation, slip and wording capture, terms structuring (layers, reinstatements, exclusions) into the underwriting system.",
        dataDomains: ["product", "coverage", "party", "premium", "reference-regulatory"],
        painPoints: [
          "Slip terms are re-keyed into the technical system after inception; discrepancies surface only when a claim tests a reinstatement clause.",
          "Cedent hierarchies and broker chains are unmastered, so aggregate exposure to a group is assembled by hand at renewal.",
        ],
      },
      {
        key: "cession-processing",
        name: "Cession & Premium Accounting",
        description:
          "Booking of ceded premium, adjustments, reinstatement premiums, and profit commissions per treaty terms.",
        dataDomains: ["reinsurance-cession", "premium", "financials-gl", "party"],
        painPoints: [
          "Estimated vs. actual premium true-ups arrive quarters late and are booked against closed periods, distorting underwriting-year results.",
          "Profit-commission and sliding-scale calculations depend on cedent loss data whose quality nobody has scored.",
        ],
      },
      {
        key: "bordereaux-management",
        name: "Bordereaux Ingestion & Validation",
        description:
          "Receipt, validation, and normalization of premium and claims bordereaux across hundreds of cedent and coverholder formats.",
        dataDomains: ["reinsurance-cession", "premium", "claim", "exposure"],
        painPoints: [
          "Every cedent's bordereau is a bespoke schema; mapping maintenance consumes analyst capacity that should be doing portfolio analysis.",
          "Risk-level detail is missing or aggregated inconsistently, undermining exposure accumulation and event response.",
          "Late and resubmitted bordereaux overwrite prior versions with no versioning, destroying the audit trail regulators expect.",
        ],
      },
      {
        key: "claims-recovery",
        name: "Claims & Recoveries",
        description:
          "Claims advices, large-loss and event management, cash-call handling, and recoverables from retrocessionaires.",
        dataDomains: ["claim", "reinsurance-cession", "reserve", "financials-gl"],
        painPoints: [
          "Event coding (which losses belong to which catastrophe) differs by cedent, so event-level aggregation is a judgment exercise under time pressure.",
          "Recoverables aging is opaque because paid-claim data and retro contract terms live in disconnected systems.",
        ],
      },
      {
        key: "retrocession",
        name: "Retrocession & Capital Protection",
        description:
          "Outward retro programs, ILS and cat-bond structures, and collateral management protecting the assumed book.",
        dataDomains: ["reinsurance-cession", "exposure", "premium", "financials-gl"],
        painPoints: [
          "Net position after retro depends on stacking assumptions across programs that no single system can compute end-to-end.",
        ],
      },
      {
        key: "reserving-portfolio",
        name: "Assumed Reserving & Portfolio Analytics",
        description:
          "IBNR on assumed business from lagged cedent data, treaty-level and portfolio-level profitability, renewal pricing feedback.",
        dataDomains: ["reserve", "claim", "premium", "exposure"],
        painPoints: [
          "Reporting lag from cedents makes IBNR heavily judgment-driven; without data-quality scoring on cedent feeds, actuaries can't weight sources credibly.",
          "Treaty-level results and portfolio roll-ups disagree because currency, underwriting-year, and treaty-version handling differ by team.",
        ],
      },
      {
        key: "financial-regulatory-reporting",
        name: "Financial & Regulatory Reporting",
        description:
          "Technical account under multiple GAAPs, statutory schedules for assumed/ceded balances, Solvency II or equivalent group reporting, IFRS 17 measurement.",
        dataDomains: ["financials-gl", "reinsurance-cession", "reserve", "reference-regulatory"],
        painPoints: [
          "IFRS 17 cohort and coverage-unit requirements demand contract-level granularity that legacy treaty systems only hold at statement level.",
          "Counterparty credit exposure for regulatory schedules is assembled from unmastered cedent and retrocessionaire identifiers.",
        ],
      },
    ],
    systemArchetypes: [
      "Reinsurance administration (e.g. Sapiens ReinsurancePro, WTW Unify, SICS)",
      "Bordereaux management & delegated authority (e.g. VIPR, Quotech, DQPro)",
      "Cat modeling & accumulation (e.g. Moody's RMS, Verisk, in-house event sets)",
      "Actuarial reserving & pricing platforms (e.g. WTW ResQ, Milliman Arius, Psicle)",
      "Group finance & consolidation (e.g. SAP, Oracle, Tagetik for IFRS 17)",
      "Cloud data platform for cedent data normalization (e.g. Snowflake, Databricks)",
    ],
    distributionModel:
      "Broker-intermediated treaty and facultative placement (global reinsurance brokers), with some direct cedent relationships.",
    signaturePainPoints: [
      "Inbound data quality is the business model's soft underbelly: hundreds of cedent formats, no systematic quality scoring, and analyst hours burned on mapping.",
      "Contract-data fidelity from slip to system is unverified until a claim tests it.",
      "Event and peril aggregation across treaties, layers, and retro rests on inconsistent cedent event coding.",
      "IFRS 17 and group solvency reporting demand granularity the treaty-statement world never carried.",
    ],
    obligationKeys: [
      "statutory-annual-statement",
      "schedule-p",
      "sox-icfr",
      "naic-model-audit-rule",
      "asop-23",
      "solvency-ii",
      "ifrs-17-ldti",
      "lloyds-minimum-standards",
      "ofac-sanctions",
    ],
    kpiKeys: [
      "cession-rate",
      "net-retention",
      "combined-ratio",
      "loss-ratio",
      "written-premium",
      "earned-premium",
      "loss-development-factor",
      "ibnr-adequacy",
      "claims-severity",
    ],
  },

  // ------------------------------------------------------------------
  // 5. Life & Annuities
  // ------------------------------------------------------------------
  {
    key: "life-annuities",
    name: "Life & Annuities",
    tagline: "Fifty-year promises administered on forty-year-old systems, valued under PBR.",
    narrative:
      "Life and annuity carriers hold contracts that outlive the systems that issued them: multiple closed blocks, serial administration conversions, and a valuation function that must produce principle-based reserves from all of it. Governance here means seriatim in-force data that survives conversions intact, assumption and experience data with pedigree (mortality, lapse, policyholder behavior), and illustration and disclosure outputs that match what administration actually does. VM-20/VM-21 and LDTI have turned data lineage from a nicety into the valuation control itself.",
    valueChain: [
      {
        key: "illustration-quoting",
        name: "Illustration & Quoting",
        description:
          "Product illustration for life and annuity products, compliant with illustration actuarial standards and suitability rules.",
        dataDomains: ["product", "party", "premium", "coverage"],
        painPoints: [
          "Illustration engines and the policy admin system compute values from separately maintained product specifications, so illustrated and actual values drift.",
          "Suitability and best-interest documentation is scattered across distribution systems with no linkage to the issued contract.",
        ],
      },
      {
        key: "new-business-underwriting",
        name: "New Business & Underwriting",
        description:
          "Application intake, medical and financial underwriting including APS records and accelerated/algorithmic underwriting paths.",
        dataDomains: ["party", "product", "coverage", "premium"],
        painPoints: [
          "Attending physician statements, lab results, and Rx histories are among the most sensitive data the enterprise holds, and their retention and access rules are enforced unevenly.",
          "Accelerated-underwriting model inputs and overrides are not captured in a form that supports the mortality-experience studies that must eventually validate the program.",
        ],
      },
      {
        key: "issue-onboarding",
        name: "Policy Issue & Onboarding",
        description:
          "Contract issue, delivery requirements, replacement processing, and 1035 exchange handling.",
        dataDomains: ["policy", "party", "premium", "producer-distribution"],
        painPoints: [
          "Replacement and exchange indicators are inconsistently coded, corrupting both persistency analysis and market-conduct reporting.",
        ],
      },
      {
        key: "inforce-admin",
        name: "In-Force Administration",
        description:
          "Premium billing, policy loans, riders, beneficiary changes, and crediting-rate administration across open and closed blocks.",
        dataDomains: ["policy", "coverage", "premium", "billing", "party"],
        painPoints: [
          "Each administration-system conversion left seriatim fields mapped 'close enough'; valuation discovers the gaps decades later.",
          "Beneficiary and ownership data quality is poor precisely where it matters most — at claim time and in escheatment sweeps.",
          "Closed-block data sits on mainframe extracts only two people still know how to produce.",
        ],
      },
      {
        key: "claims-surrender",
        name: "Claims, Surrenders & Benefits",
        description:
          "Death claims with interest calculations, surrenders and partial withdrawals, annuitization, and unclaimed-property compliance.",
        dataDomains: ["claim", "policy", "party", "financials-gl"],
        painPoints: [
          "Death-master-file matching produces false positives and misses that both carry regulatory consequence, with match logic that is untested and unversioned.",
          "Surrender-activity data needed for behavior assumptions is aggregated before actuaries see it, losing the covariates that explain it.",
        ],
      },
      {
        key: "valuation-reserving",
        name: "Valuation & Reserving",
        description:
          "Statutory reserves under PBR (VM-20/VM-21), GAAP LDTI measurement, assumption governance, and experience studies.",
        dataDomains: ["reserve", "policy", "premium", "reference-regulatory"],
        painPoints: [
          "PBR requires demonstrating the integrity of seriatim inputs; today that demonstration is a quarter-end scramble of extract checksums.",
          "Assumption sets (mortality, lapse, expenses) are versioned in model files, not governed as data, so reproducing a prior valuation is archaeology.",
          "LDTI cohorting and retrospective unlocking demand historical data at granularity the admin systems purged years ago.",
        ],
      },
      {
        key: "reinsurance",
        name: "Reinsurance & Risk Transfer",
        description:
          "YRT and coinsurance treaties, block reinsurance transactions, and reserve financing structures.",
        dataDomains: ["reinsurance-cession", "policy", "reserve", "premium"],
        painPoints: [
          "Ceded seriatim files sent to reinsurers are built by hand-maintained extract jobs; a mapping error becomes a treaty dispute years later.",
        ],
      },
      {
        key: "financial-reporting",
        name: "Financial & Statutory Reporting",
        description:
          "Blue-book statutory reporting, GAAP/LDTI disclosures, embedded value or cash-flow testing support.",
        dataDomains: ["financials-gl", "reserve", "premium", "reference-regulatory"],
        painPoints: [
          "The actuarial-to-ledger handoff is a chain of spreadsheets between the valuation system and the GL that SOX walkthroughs flag every year.",
        ],
      },
    ],
    systemArchetypes: [
      "Policy administration, often multiple generations (e.g. FAST, ALIP, wmA, ingenium, legacy mainframe blocks)",
      "Actuarial modeling & valuation (e.g. Moody's AXIS, FIS Prophet, PolySystems)",
      "Illustration & new-business platforms (e.g. iPipeline, FireLight, Hexure)",
      "Underwriting evidence & automation (e.g. MIB, Milliman IntelliScript, Rx/lab data hubs)",
      "TPA administration for closed blocks (e.g. DXC, Concentrix)",
      "Cloud data platform feeding valuation and experience studies (e.g. Snowflake, Databricks)",
    ],
    distributionModel:
      "Career and independent agents, IMOs/BGAs, banks and broker-dealers for annuities, plus worksite and direct channels.",
    signaturePainPoints: [
      "Seriatim in-force data bears the scars of serial conversions, and PBR now requires proving its integrity every valuation cycle.",
      "Assumption and experience data lacks pedigree: model files, not governed datasets, hold the mortality and lapse assumptions auditors ask about.",
      "Underwriting medical data (APS, labs, Rx) is maximally sensitive and minimally classified.",
      "Closed blocks and TPA-administered business are governance blind spots with material reserve impact.",
    ],
    obligationKeys: [
      "pbr-vm-20",
      "ifrs-17-ldti",
      "naic-model-audit-rule",
      "sox-icfr",
      "statutory-annual-statement",
      "asop-23",
      "asop-56",
      "glba-nppi",
      "state-privacy-laws",
      "naic-ai-model-bulletin",
      "state-doi-market-conduct",
    ],
    kpiKeys: [
      "persistency",
      "surrender-rate",
      "policies-in-force",
      "written-premium",
      "expense-ratio",
      "close-cycle-time",
      "retention-ratio",
    ],
  },

  // ------------------------------------------------------------------
  // 6. Health & Benefits
  // ------------------------------------------------------------------
  {
    key: "health-benefits",
    name: "Health & Benefits",
    tagline: "Every record is PHI, every ratio is regulated, and the claims engine never sleeps.",
    narrative:
      "Health and group-benefits carriers process claims at a volume and regulatory intensity no other sector matches: HIPAA governs nearly every record, the medical loss ratio is a statutory formula with rebate consequences, and adjudication accuracy is measured continuously. Governance here means minimum-necessary access enforced at field level, provider and member data mastered well enough for network and payment integrity, and IBNR completion-factor data that finance and actuarial share without translation loss.",
    valueChain: [
      {
        key: "sales-quoting",
        name: "Sales, Quoting & Renewal Rating",
        description:
          "Group quoting on census data, renewal rating on experience, and individual/exchange enrollment where applicable.",
        dataDomains: ["party", "product", "premium", "producer-distribution"],
        painPoints: [
          "Broker-supplied census files carry PHI-adjacent data through email and shared drives before any control touches them.",
          "Experience-rating extracts for renewals are cut by hand and inconsistently lag-adjusted, making renewal pricing contestable.",
        ],
      },
      {
        key: "enrollment-eligibility",
        name: "Enrollment & Eligibility",
        description:
          "Member enrollment via EDI 834 feeds, eligibility maintenance, COBRA and life-event processing.",
        dataDomains: ["party", "policy", "coverage", "billing"],
        painPoints: [
          "834 feed errors from employers and exchanges create eligibility discrepancies that surface as claim denials and member abrasion.",
          "Dependent and coordination-of-benefits data is stale, driving payment errors that payment-integrity teams chase after the fact.",
        ],
      },
      {
        key: "provider-network",
        name: "Provider & Network Management",
        description:
          "Provider credentialing, contracting, fee schedules, and directory accuracy obligations.",
        dataDomains: ["party", "product", "reference-regulatory"],
        painPoints: [
          "Provider identity resolution across NPIs, tax IDs, and locations is unsolved, corrupting directories, claims routing, and network-adequacy filings.",
        ],
      },
      {
        key: "claims-adjudication",
        name: "Claims Adjudication",
        description:
          "Auto-adjudication of professional and facility claims, clinical editing, prior-auth linkage, and appeals.",
        dataDomains: ["claim", "coverage", "party", "billing"],
        painPoints: [
          "Auto-adjudication rates plateau because benefit-configuration data is inconsistent across plan variants nobody inventoried.",
          "Claim-line detail feeds analytics with clinical codes intact — PHI classification and masking downstream is partial at best.",
        ],
      },
      {
        key: "care-utilization",
        name: "Utilization & Care Management",
        description:
          "Prior authorization, case and disease management, and clinical-program targeting.",
        dataDomains: ["claim", "party", "coverage"],
        painPoints: [
          "Clinical program data (case notes, assessments) is the most sensitive PHI held and the least cataloged, blocking legitimate analytics wholesale.",
        ],
      },
      {
        key: "actuarial-reserving",
        name: "Actuarial — IBNR & Trend",
        description:
          "Completion-factor IBNR estimation, trend analysis, and rate-filing actuarial support.",
        dataDomains: ["reserve", "claim", "premium", "policy"],
        painPoints: [
          "Claims-lag triangles depend on received/processed/paid dates whose definitions shifted across adjudication-platform migrations.",
          "Actuarial and finance maintain parallel IBNR views that must be reconciled manually every close.",
        ],
      },
      {
        key: "financial-regulatory-reporting",
        name: "Financial & Regulatory Reporting",
        description:
          "MLR reporting and rebate calculation, statutory blanks, rate filings, and federal/state program reporting.",
        dataDomains: ["financials-gl", "premium", "claim", "reserve", "reference-regulatory"],
        painPoints: [
          "MLR numerator classification (claims vs. quality-improvement vs. admin expense) is spreadsheet-governed, and a misclassification changes rebate liability.",
          "The same 'membership' number differs across MLR filings, statutory blanks, and management reporting because member-month definitions were never unified.",
        ],
      },
    ],
    systemArchetypes: [
      "Core adjudication platform (e.g. Facets, QNXT, HealthEdge HealthRules)",
      "Enrollment & billing (e.g. Benefitfocus, bswift, platform-native modules)",
      "Care/utilization management (e.g. GuidingCare, ZeOmega Jiva)",
      "Provider data management & credentialing (e.g. symplr, Availity, HiLabs)",
      "Payment integrity & editing (e.g. Cotiviti, Lyric/ClaimsXten)",
      "Cloud analytics platform with PHI controls (e.g. Snowflake, Databricks with fine-grained masking)",
    ],
    distributionModel:
      "Group benefits brokers and consultants, direct employer sales, public and private exchanges, and government program channels.",
    signaturePainPoints: [
      "Minimum-necessary PHI access must be enforced at field level across thousands of consumers of claims data, and today it is enforced at dataset level or not at all.",
      "Provider and member identity resolution failures cascade into directory fines, payment errors, and network filings.",
      "MLR components are classified in spreadsheets although rebate liability rides on the classification.",
      "Actuarial and finance run parallel IBNR estimates from differently-defined lag data.",
    ],
    obligationKeys: [
      "hipaa-phi",
      "sox-icfr",
      "statutory-annual-statement",
      "naic-model-audit-rule",
      "state-privacy-laws",
      "asop-23",
      "state-doi-market-conduct",
      "naic-ai-model-bulletin",
    ],
    kpiKeys: [
      "medical-loss-ratio",
      "expense-ratio",
      "policies-in-force",
      "retention-ratio",
      "stp-rate",
      "claims-frequency",
      "ibnr-adequacy",
      "close-cycle-time",
    ],
  },

  // ------------------------------------------------------------------
  // 7. Surety
  // ------------------------------------------------------------------
  {
    key: "surety",
    name: "Surety",
    tagline: "Credit underwriting wearing an insurance policy — where the balance sheet is the exposure.",
    narrative:
      "Surety is closer to credit than to casualty: the underwriter extends the company's balance sheet behind a principal's obligation to an obligee, expecting zero losses and pricing for fee, not risk transfer. Governance here means financial-statement and work-in-progress data on principals that is current, comparable, and traceable — because aggregate exposure to a contractor group is the real underwriting question — and claims data that supports salvage and indemnity recovery, where surety earns back its losses.",
    valueChain: [
      {
        key: "prequalification",
        name: "Prequalification & Credit Analysis",
        description:
          "Analysis of principal financial statements, work-in-progress schedules, bank lines, and character/capacity/capital assessment.",
        dataDomains: ["party", "exposure", "financials-gl", "reference-regulatory"],
        painPoints: [
          "Contractor financials and WIP schedules arrive as accountant PDFs on inconsistent bases (percentage-of-completion vs. completed-contract) and are re-keyed into spreadsheets.",
          "Principal group hierarchies (joint ventures, related entities, indemnitors) are tracked informally, so true aggregate exposure is discovered, not managed.",
        ],
      },
      {
        key: "underwriting-lines",
        name: "Underwriting & Line Setting",
        description:
          "Single and aggregate line establishment, indemnity agreement structuring, and account-level authority management.",
        dataDomains: ["party", "exposure", "coverage", "producer-distribution"],
        painPoints: [
          "Approved lines live in underwriting files while bonded exposure lives in the issuance system; line utilization is computed on request, not continuously.",
        ],
      },
      {
        key: "bond-issuance",
        name: "Bond Issuance & Execution",
        description:
          "Bid, performance, payment, and commercial bond issuance, including agency-executed bonds under powers of attorney.",
        dataDomains: ["policy", "coverage", "premium", "producer-distribution"],
        painPoints: [
          "Agency-issued bonds under POA are reported in arrears; the carrier's recorded exposure trails actual executions by weeks.",
          "Obligee, project, and contract-value data is captured inconsistently, weakening both exposure aggregation and claims investigation later.",
        ],
      },
      {
        key: "account-monitoring",
        name: "Account Monitoring & Renewal",
        description:
          "Ongoing financial-statement updates, WIP tracking, project status monitoring, and early-warning surveillance.",
        dataDomains: ["party", "exposure", "financials-gl"],
        painPoints: [
          "Financial-statement refresh compliance is tracked in spreadsheets; stale financials behind active lines are found during losses, not before them.",
        ],
      },
      {
        key: "billing-premium",
        name: "Billing & Premium Processing",
        description:
          "Premium and fee billing, agency account current reconciliation, and renewal premium processing on term bonds.",
        dataDomains: ["billing", "premium", "producer-distribution", "financials-gl"],
        painPoints: [
          "Agency account currents net commission against premium across bond types with different rates, and mismatches age silently.",
        ],
      },
      {
        key: "claims-salvage",
        name: "Claims, Salvage & Recovery",
        description:
          "Default investigation, completion or financing decisions, payment-bond claims, and salvage/indemnity recovery.",
        dataDomains: ["claim", "reserve", "party", "financials-gl", "exposure"],
        painPoints: [
          "Claim files depend on underwriting-time data (indemnity agreements, financials, project records) scattered across repositories, slowing default response when days matter.",
          "Salvage and recovery accounting is netted inconsistently against paid losses, distorting both loss ratios and Schedule P development.",
        ],
      },
      {
        key: "reserving-reporting",
        name: "Reserving & Financial Reporting",
        description:
          "Case and IBNR reserving on low-frequency/high-severity defaults, statutory reporting, and Schedule P.",
        dataDomains: ["reserve", "claim", "premium", "financials-gl", "reference-regulatory"],
        painPoints: [
          "Sparse loss history plus lumpy severity makes each data error material to IBNR; recovery timing assumptions are undocumented.",
        ],
      },
    ],
    systemArchetypes: [
      "Surety processing platform (e.g. SuretyWave, Tinubu, A.i.M./homegrown bond systems)",
      "Agency issuance portals with power-of-attorney controls",
      "Financial-statement spreading & credit analysis (e.g. Moody's CreditLens-style spreading tools, spreadsheets)",
      "Document management for indemnity agreements and project records",
      "Core finance & statutory reporting stack shared with the P&C carrier",
      "Cloud data platform for exposure aggregation (e.g. Snowflake, Databricks)",
    ],
    distributionModel:
      "Specialist surety agents and brokers holding powers of attorney, plus national broker surety practices.",
    signaturePainPoints: [
      "Principal group hierarchies and indemnitor webs are informally tracked, so aggregate exposure — the central underwriting question — is assembled by hand.",
      "Contractor financials and WIP schedules are unstructured, inconsistently based, and re-keyed, making credit surveillance reactive.",
      "Agency-executed bonds under POA leave recorded exposure trailing reality.",
      "Salvage and recovery netting conventions distort loss ratios and development triangles.",
    ],
    obligationKeys: [
      "statutory-annual-statement",
      "schedule-p",
      "sox-icfr",
      "naic-model-audit-rule",
      "asop-23",
      "ofac-sanctions",
      "state-doi-market-conduct",
    ],
    kpiKeys: [
      "loss-ratio",
      "combined-ratio",
      "expense-ratio",
      "written-premium",
      "claims-severity",
      "net-retention",
      "ibnr-adequacy",
    ],
  },

  // ------------------------------------------------------------------
  // 8. Insurance Investments
  // ------------------------------------------------------------------
  {
    key: "investments",
    name: "Insurance Investments",
    tagline: "The other side of the balance sheet — where IBOR and ABOR must agree before Schedule D can file.",
    narrative:
      "The investment operation manages the general account that backs every insurance promise, under accounting rules (statutory, GAAP, sometimes IFRS) that differ from the asset manager's own books. Governance here is the discipline of positions, prices, and classifications: security master and issuer hierarchies mastered once, valuations sourced and challengeable, IBOR-to-ABOR reconciliation systematic rather than heroic, and Schedule D filing built on lineage instead of quarter-end triage. Growing private-credit and alternative allocations strain all of it.",
    valueChain: [
      {
        key: "trade-capture",
        name: "Trade Capture & Security Master",
        description:
          "Order execution capture, security setup and reference data, issuer and counterparty identification.",
        dataDomains: ["financials-gl", "reference-regulatory", "party", "product"],
        painPoints: [
          "Private placements and alternatives arrive without standard identifiers; manual security setup creates duplicates that haunt every downstream process.",
          "Issuer hierarchies for concentration limits are maintained separately by risk and compliance, and they disagree.",
        ],
      },
      {
        key: "settlement-custody",
        name: "Settlement & Custody Reconciliation",
        description:
          "Trade settlement, custodian position and cash reconciliation, corporate-action processing.",
        dataDomains: ["financials-gl", "party", "reference-regulatory"],
        painPoints: [
          "Custodian, IBOR, and accounting positions are reconciled pairwise in spreadsheets; breaks are cleared without root-cause categorization, so they recur.",
        ],
      },
      {
        key: "valuation-pricing",
        name: "Valuation & Pricing",
        description:
          "Daily pricing from vendor hierarchies, fair-value leveling, and challenge processes for hard-to-value assets.",
        dataDomains: ["financials-gl", "reference-regulatory", "product"],
        painPoints: [
          "Price-source hierarchy overrides are applied in the accounting system with free-text justifications, exactly where auditors look hardest.",
          "Level 2/3 fair-value classifications rest on vendor methodology data nobody has cataloged.",
        ],
      },
      {
        key: "investment-accounting",
        name: "Investment Accounting (IBOR/ABOR)",
        description:
          "Multi-basis accounting — statutory, GAAP, tax — amortization, impairment (CECL/OTTI), and the IBOR-to-ABOR bridge.",
        dataDomains: ["financials-gl", "reference-regulatory", "product"],
        painPoints: [
          "IBOR-ABOR breaks spike at month-end and are resolved by adjustment rather than lineage-traced root cause.",
          "Statutory vs. GAAP classification differences (NAIC designations, impairment timing) are maintained as analyst knowledge, not governed reference data.",
        ],
      },
      {
        key: "risk-alm-compliance",
        name: "Risk, ALM & Compliance Monitoring",
        description:
          "Asset-liability matching, guideline and regulatory-limit compliance, derivative and counterparty exposure monitoring.",
        dataDomains: ["financials-gl", "reference-regulatory", "party", "reserve"],
        painPoints: [
          "ALM depends on liability cash-flow feeds from actuarial models with no shared data contract; each side blames the other's granularity.",
          "Investment-guideline compliance checks run on positions that lag the trading book, so breaches are detected after the fact.",
        ],
      },
      {
        key: "regulatory-reporting",
        name: "Regulatory & Statutory Reporting",
        description:
          "Schedule D/BA/DB preparation, NAIC designations via SVO processes, RBC asset charges, and group solvency asset data.",
        dataDomains: ["financials-gl", "reference-regulatory", "reserve"],
        painPoints: [
          "Schedule D production is a quarter-end triage of designation mismatches, missing CUSIPs, and manual footnotes — repeated every quarter because nothing is fixed at source.",
          "RBC asset-charge inputs are assembled across systems with no single owner for the mapping rules.",
        ],
      },
    ],
    systemArchetypes: [
      "Investment accounting platform (e.g. Clearwater Analytics, SS&C PAM/CAMRA, SimCorp)",
      "Order management / IBOR (e.g. BlackRock Aladdin, Charles River, Bloomberg AIM)",
      "Custodian data feeds (e.g. BNY, State Street, Northern Trust)",
      "Market and reference data (e.g. Bloomberg, ICE, Refinitiv) with an EDM layer (e.g. GoldenSource, Markit EDM)",
      "Risk & ALM analytics (e.g. Moody's, FactSet, in-house ALM models)",
      "Statutory filing tools for Schedule D and RBC",
    ],
    distributionModel:
      "Internal investment management for the general account, often alongside external asset managers under IMAs with data-delivery obligations.",
    signaturePainPoints: [
      "Security master and issuer hierarchy fragmentation multiplies breaks across settlement, valuation, accounting, and compliance.",
      "IBOR-to-ABOR reconciliation is heroic rather than systematic, and break root causes are never categorized.",
      "Schedule D and RBC production is quarter-end triage on designation and identifier issues that are never fixed at source.",
      "Private credit and alternatives growth outpaces the reference-data and valuation governance built for public fixed income.",
    ],
    obligationKeys: [
      "schedule-d",
      "statutory-annual-statement",
      "sox-icfr",
      "naic-model-audit-rule",
      "solvency-ii",
      "ofac-sanctions",
    ],
    kpiKeys: [
      "ibor-abor-break-rate",
      "close-cycle-time",
      "expense-ratio",
    ],
  },

  // ------------------------------------------------------------------
  // 9. Brokerage & MGA
  // ------------------------------------------------------------------
  {
    key: "brokerage-mga",
    name: "Brokerage & MGA",
    tagline: "Distribution's data business: other people's paper, your commission ledger, everyone's bordereaux.",
    narrative:
      "Brokers and MGAs sit between insureds and capacity, and their economics are pure data: commissions and fees earned on placements recorded across AMS platforms, carrier statements, and — for MGAs — binder agreements with bordereaux obligations to the capacity behind them. Governance here means client and policy records reconciled across systems that were never designed to agree, commission accuracy defensible to both carriers and producers, fiduciary premium in trust accounts reconciled to the penny, and delegated-authority reporting that keeps the binder.",
    valueChain: [
      {
        key: "client-intake",
        name: "Client Intake & Needs Analysis",
        description:
          "Prospect and client onboarding, exposure gathering, and coverage-needs assessment across lines.",
        dataDomains: ["party", "exposure", "producer-distribution"],
        painPoints: [
          "Client records fragment across AMS, CRM, and producer spreadsheets; the 'single client view' every cross-sell strategy assumes does not exist.",
          "Collected client NPPI (financials, health data for benefits lines) flows through email with no classification or retention control.",
        ],
      },
      {
        key: "marketing-placement",
        name: "Marketing & Placement",
        description:
          "Submission preparation, market selection, quote comparison, and placement negotiation with carriers and wholesalers.",
        dataDomains: ["exposure", "coverage", "premium", "party", "producer-distribution"],
        painPoints: [
          "Quote and declination history is unstructured, so market-selection intelligence and carrier-relationship analytics are anecdotal.",
        ],
      },
      {
        key: "binding-issuance",
        name: "Binding & Policy Servicing",
        description:
          "Binder confirmation, policy checking against quoted terms, endorsements, and certificates of insurance.",
        dataDomains: ["policy", "coverage", "premium", "party"],
        painPoints: [
          "Policy-checking against quoted terms is manual and sampled; errors surface at claim time as E&O exposure.",
          "Certificate issuance runs on coverage data that lags endorsements, a chronic E&O and compliance risk.",
        ],
      },
      {
        key: "premium-accounting",
        name: "Premium Accounting & Trust",
        description:
          "Fiduciary premium collection, trust-account management, carrier remittance, and premium-finance coordination.",
        dataDomains: ["billing", "premium", "financials-gl", "party"],
        painPoints: [
          "Trust-account reconciliation across carriers, clients, and finance companies is spreadsheet-driven, and unallocated cash ages beyond regulatory comfort.",
        ],
      },
      {
        key: "commission-reconciliation",
        name: "Commission & Compensation",
        description:
          "Carrier commission statement reconciliation, producer compensation calculation, and contingent/profit-share tracking.",
        dataDomains: ["producer-distribution", "premium", "financials-gl", "policy"],
        painPoints: [
          "Carrier statements match booked revenue at only 80-90% at line level; the residue is written off or chased at high cost.",
          "Contingent commission calculations depend on carrier loss data the broker cannot independently verify.",
          "Producer comp disputes trace to policy-level splits recorded inconsistently at booking time.",
        ],
      },
      {
        key: "mga-underwriting-bordereaux",
        name: "MGA Underwriting & Bordereaux (delegated authority)",
        description:
          "Underwriting within binder authority, premium/claims bordereaux production to capacity providers, and binder compliance reporting.",
        dataDomains: ["policy", "premium", "claim", "reinsurance-cession", "coverage"],
        painPoints: [
          "Bordereaux to each capacity provider demand different schemas and validation rules; production is a monthly manual assembly with real breach-of-binder risk.",
          "Referral and authority-breach tracking is informal, precisely the evidence coverholder audits and Lloyd's minimum standards demand.",
        ],
      },
      {
        key: "renewal-retention",
        name: "Renewal & Retention Management",
        description:
          "Renewal orchestration, remarketing decisions, and book-of-business retention analytics.",
        dataDomains: ["policy", "premium", "party", "producer-distribution"],
        painPoints: [
          "Retention reporting differs by producer, branch, and finance because 'renewal' and 'rewrite' were never given governed definitions.",
        ],
      },
    ],
    systemArchetypes: [
      "Agency/broker management system (e.g. Applied Epic, Vertafore AMS360, Sapiens/others)",
      "MGA policy administration & rating (e.g. Instanda, Socotra, NetRate)",
      "Bordereaux production & DA reporting (e.g. VIPR, Quotech, spreadsheet estates)",
      "Commission & producer compensation engines (e.g. Varicent, homegrown)",
      "CRM and sales platforms (e.g. Salesforce with insurance overlays)",
      "Trust accounting & finance stack (e.g. Sage, NetSuite, GL modules of the AMS)",
    ],
    distributionModel:
      "Retail and wholesale broking plus MGA/coverholder delegated authority; producer networks and acquired books under serial M&A.",
    signaturePainPoints: [
      "Commission revenue is the business, and it reconciles to carrier statements at line level only 80-90% of the time.",
      "Serial agency acquisitions stack AMS platforms with duplicate clients, divergent codes, and no master data spine.",
      "Bordereaux and binder-compliance obligations to capacity providers are met by manual monthly assembly.",
      "Fiduciary trust accounting is spreadsheet-reconciled, with aging unallocated cash as the regulatory tell.",
    ],
    obligationKeys: [
      "state-doi-market-conduct",
      "glba-nppi",
      "state-privacy-laws",
      "ofac-sanctions",
      "lloyds-minimum-standards",
      "sox-icfr",
    ],
    kpiKeys: [
      "commission-accuracy",
      "written-premium",
      "retention-ratio",
      "quote-to-bind",
      "stp-rate",
      "policies-in-force",
      "close-cycle-time",
    ],
  },
];
