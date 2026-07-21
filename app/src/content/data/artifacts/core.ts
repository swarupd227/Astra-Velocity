import type { Artifact } from "../../types";

/** Artifacts for proposal-origin packs VP-01..VP-11, keyed by element key. */
export const CORE_ARTIFACTS: Record<string, Artifact> = {
  // ───────────────────────── VP-01 Insurance Governance Semantic Pack ─────────────────────────

  "pc-glossary-starter": {
    kind: "glossary",
    note: "Starter sample of the full ~200-term pack. Definitions are certification candidates: stewards confirm, adapt basis notes, and publish.",
    terms: [
      {
        term: "Written Premium",
        definition:
          "Premium booked when a policy transaction (new business, renewal, endorsement, cancellation, audit) is processed, for the full term of the transaction. Direct written premium excludes reinsurance; net written premium deducts ceded premium.",
        domain: "premium",
        note: "Booked at transaction effective date, not billed or collected date — the classic warehouse mistake.",
      },
      {
        term: "Earned Premium",
        definition:
          "The portion of written premium attributable to expired coverage, recognized ratably over the policy term (daily pro-rata unless the exposure basis dictates otherwise, e.g. audit-rated workers' compensation).",
        domain: "premium",
        note: "Earned = written − change in unearned premium reserve. The reconciliation tie-point every finance product must pass.",
      },
      {
        term: "Unearned Premium Reserve (UEP)",
        definition:
          "The liability for the unexpired portion of in-force policies: premium written but not yet earned. Rolls forward as UEP(end) = UEP(begin) + written − earned.",
        domain: "premium",
      },
      {
        term: "In-Force Premium",
        definition:
          "The annualized premium of all policies active at a point in time. A stock measure — distinct from written premium (transaction flow) and earned premium (recognized flow).",
        domain: "policy",
      },
      {
        term: "Policy Transaction Type",
        definition:
          "The classification of a policy administration event: new business, renewal, endorsement, cancellation, reinstatement, non-renewal, or audit. Each carries its own premium and effective-dating behavior.",
        domain: "policy",
      },
      {
        term: "Endorsement",
        definition:
          "A mid-term change to policy terms — coverage, limit, deductible, exposure, or named insured — with its own transaction effective date and a premium delta that earns over the remaining term.",
        domain: "policy",
      },
      {
        term: "Cancellation (Flat / Pro-Rata / Short-Rate)",
        definition:
          "Termination of coverage before expiration. Flat cancellation voids from inception with full premium return; pro-rata returns premium proportional to unexpired term; short-rate applies a penalty factor to the return.",
        domain: "policy",
        note: "Return-premium method drives the earned premium reversal — model it explicitly.",
      },
      {
        term: "FNOL (First Notice of Loss)",
        definition:
          "The initial report of a claim event to the carrier, opening the claim record. FNOL date is the report date; it is distinct from — and never earlier than — the loss (occurrence) date.",
        domain: "claim",
      },
      {
        term: "Loss Date vs. Report Date",
        definition:
          "Loss date is when the insured event occurred; report date is when the carrier learned of it. The gap between them is the reporting lag that IBNR exists to cover, and the axis split behind accident-year versus report-year analysis.",
        domain: "claim",
      },
      {
        term: "Paid Loss",
        definition:
          "Cumulative indemnity amounts actually disbursed on a claim, net of recoveries received. Excludes loss adjustment expense unless explicitly stated as paid loss + LAE.",
        domain: "claim",
      },
      {
        term: "Case Reserve",
        definition:
          "The adjuster's estimate of remaining unpaid loss on a known, open claim. Set claim by claim; revised as the claim develops.",
        domain: "reserve",
      },
      {
        term: "IBNR (Incurred But Not Reported)",
        definition:
          "The actuarial bulk reserve for claims that have occurred but are not yet reported, plus expected development on known claims (IBNER). Estimated at the segment level, not the claim level.",
        domain: "reserve",
        note: "Pure IBNR vs. IBNER distinction matters for triangle construction — confirm which the source system stores.",
      },
      {
        term: "Incurred Loss",
        definition:
          "Paid loss plus outstanding case reserves (case incurred), or paid plus case plus IBNR (ultimate incurred) — always state which. Mixing the two bases in one metric is a leading cause of loss-ratio disputes.",
        domain: "claim",
      },
      {
        term: "LAE (ALAE / ULAE)",
        definition:
          "Loss adjustment expense: the cost of settling claims. Allocated LAE (ALAE) attaches to specific claims (defense counsel, experts); unallocated LAE (ULAE) covers claim operations that cannot be assigned to a single claim.",
        domain: "claim",
      },
      {
        term: "Subrogation",
        definition:
          "The carrier's right to recover paid losses from a responsible third party. Subrogation recoveries reduce net paid loss and are tracked as recovery transactions, not negative payments.",
        domain: "claim",
      },
      {
        term: "Salvage",
        definition:
          "Recovery realized from taking title to damaged property (e.g. a totaled vehicle) and selling it. Like subrogation, a recovery transaction that offsets paid loss.",
        domain: "claim",
      },
      {
        term: "Loss Ratio",
        definition:
          "Incurred loss (state the basis: with or without LAE, with or without IBNR) divided by earned premium for the same segment and period. Accident-year and calendar-year loss ratios answer different questions.",
        domain: "financials-gl",
      },
      {
        term: "Combined Ratio",
        definition:
          "Loss ratio plus expense ratio. Under 100% indicates underwriting profit before investment income. Trade basis divides expenses by written premium; statutory basis by earned.",
        domain: "financials-gl",
      },
      {
        term: "Accident Year",
        definition:
          "A grouping of loss experience by the year the loss occurred, regardless of when reported or paid. The standard axis for development triangles and Schedule P.",
        domain: "reference-regulatory",
      },
      {
        term: "Loss Development Factor (LDF)",
        definition:
          "The ratio of losses at one evaluation age to the same cohort at an earlier age, used to project reported or paid losses to ultimate. Derived from development triangles by accident year.",
        domain: "reserve",
      },
      {
        term: "COPE",
        definition:
          "Construction, Occupancy, Protection, Exposure — the four property attribute families that drive underwriting acceptance, pricing, and catastrophe modeling for property risks.",
        domain: "exposure",
      },
      {
        term: "Catastrophe Code",
        definition:
          "The event identifier (industry PCS/ISO serial number or carrier-internal code) tagged on claims arising from a declared catastrophe, enabling event-level loss aggregation and reinsurance recovery.",
        domain: "claim",
      },
      {
        term: "Deductible vs. Self-Insured Retention",
        definition:
          "Both shift first-dollar loss to the insured, but a deductible is subtracted from a covered loss the carrier adjusts, while an SIR requires the insured to fund and manage losses below the retention before the policy responds.",
        domain: "coverage",
      },
      {
        term: "Per-Occurrence vs. Aggregate Limit",
        definition:
          "The per-occurrence limit caps recovery for a single event; the aggregate limit caps total recovery across all occurrences in the policy period. Erosion tracking requires both.",
        domain: "coverage",
      },
    ],
  },

  "life-glossary-starter": {
    kind: "glossary",
    note: "Starter sample of the full ~200-term pack. Statutory-vs-GAAP basis notes are attached where the two diverge — that divergence is where reporting arguments start.",
    terms: [
      {
        term: "Persistency",
        definition:
          "The proportion of policies (or premium, or face amount — state the basis) remaining in force over a measurement period. The complement of the lapse rate; typically measured by policy duration cohort.",
        domain: "policy",
      },
      {
        term: "Lapse",
        definition:
          "Termination of a policy for non-payment of premium, typically after the grace period expires without value-supported continuation (e.g. automatic premium loan or extended term insurance).",
        domain: "policy",
      },
      {
        term: "Surrender",
        definition:
          "Voluntary termination initiated by the policyholder in exchange for the cash surrender value. Distinct from lapse: surrender is an elected transaction with a payout; lapse is a default.",
        domain: "policy",
      },
      {
        term: "Cash Surrender Value",
        definition:
          "The amount payable on surrender: account or cash value less surrender charges and any outstanding policy loans plus loan interest.",
        domain: "policy",
      },
      {
        term: "Account Value vs. Cash Value",
        definition:
          "Account value is the accumulated fund before surrender charges (universal life, deferred annuities); cash value commonly denotes the guaranteed value in traditional whole life. Systems that conflate the two misstate surrender exposure.",
        domain: "policy",
      },
      {
        term: "Premium Mode",
        definition:
          "The contractual payment frequency — annual, semi-annual, quarterly, monthly — with modal loadings applied to non-annual modes. Modalized versus annualized premium is a recurring reconciliation gap.",
        domain: "premium",
      },
      {
        term: "Annualized Premium",
        definition:
          "Modal premium multiplied by mode frequency, the standard basis for production reporting and persistency measurement. Distinct from collected premium in any period.",
        domain: "premium",
      },
      {
        term: "Statutory Reserve",
        definition:
          "The policy liability computed under statutory valuation law (CRVM/net premium approaches, or VM-20 principle-based reserves for life products in scope), reported in the statutory annual statement.",
        domain: "reserve",
        note: "Statutory basis: conservative, solvency-oriented. Will not tie to GAAP/LDTI reserves — and should not.",
      },
      {
        term: "GAAP Reserve (LDTI)",
        definition:
          "The liability for future policy benefits under US GAAP as amended by LDTI: net premium ratio cohorts with annual assumption updates and discount-rate remeasurement through OCI for traditional long-duration contracts.",
        domain: "reserve",
        note: "Cohort granularity (issue-year groupings) is a data requirement, not an actuarial preference.",
      },
      {
        term: "Principle-Based Reserving (VM-20)",
        definition:
          "The NAIC Valuation Manual framework computing life reserves as the greater of a net premium reserve floor and modeled deterministic/stochastic reserves, with company experience feeding assumptions subject to credibility standards.",
        domain: "reserve",
      },
      {
        term: "IFRS 17 Measurement Model",
        definition:
          "The general measurement model: fulfilment cash flows (probability-weighted, discounted, with a risk adjustment) plus a contractual service margin (CSM) that defers unearned profit and amortizes over coverage units, at annual-cohort granularity.",
        domain: "reserve",
      },
      {
        term: "Contractual Service Margin (CSM)",
        definition:
          "The IFRS 17 liability component representing unearned profit, released to revenue as services are provided. Onerous contracts carry no CSM; losses recognize immediately.",
        domain: "reserve",
      },
      {
        term: "Net Amount at Risk",
        definition:
          "Death benefit minus the reserve or account value backing the policy — the carrier's true mortality exposure, and the base for cost-of-insurance charges in universal life.",
        domain: "coverage",
      },
      {
        term: "Rider",
        definition:
          "An attached provision modifying base coverage — waiver of premium, accidental death benefit, accelerated death benefit, guaranteed insurability. Riders carry their own premiums, values, and reserve treatment.",
        domain: "product",
      },
      {
        term: "Living Benefit (GMxB)",
        definition:
          "Guaranteed minimum benefits on annuities — withdrawal (GMWB), income (GMIB), accumulation (GMAB), death (GMDB) — whose guarantees create embedded derivative or market-risk-benefit measurement under GAAP and stochastic reserve demands under statutory rules.",
        domain: "product",
      },
      {
        term: "General Account vs. Separate Account",
        definition:
          "General account assets back guaranteed obligations and belong to the insurer; separate account assets back variable products and are insulated for the policyholder's benefit. The split drives both statement presentation and investment data lineage.",
        domain: "financials-gl",
      },
      {
        term: "Policy Loan",
        definition:
          "A loan against cash value, accruing interest and reducing death benefit and surrender proceeds until repaid. An admitted asset statutorily — and a frequent source of value-reconciliation breaks.",
        domain: "billing",
      },
      {
        term: "Paid-Up Additions",
        definition:
          "Additional fully paid insurance purchased with participating policy dividends, increasing both death benefit and cash value. Carried as distinct coverage layers in administration systems.",
        domain: "product",
      },
      {
        term: "Annuitization",
        definition:
          "Conversion of an annuity's accumulated value into a stream of guaranteed income payments, moving the contract from accumulation to payout status — a status change that reclassifies reserves and revenue.",
        domain: "policy",
      },
      {
        term: "Mortality Table",
        definition:
          "The table of death rates by age, sex, and risk class used in pricing and valuation (e.g. 2017 CSO for statutory valuation of life products). Valuation table and pricing assumptions are deliberately different objects.",
        domain: "reference-regulatory",
      },
    ],
  },

  "policy-claims-cde-set": {
    kind: "cde-set",
    note: "Starter sample of the full CDE library. Each element carries the quality dimensions its consumers actually depend on — attach rules only to these.",
    cdes: [
      {
        name: "policy_number",
        domain: "policy",
        definition:
          "The unique carrier-assigned identifier of a policy contract, stable across terms and transactions within an administration system.",
        qualityDimensions: ["uniqueness", "completeness", "consistency across systems"],
        exampleIssue:
          "Renewal re-keys the policy under a new number in the new admin platform; retention and loss-ratio-by-policy analyses silently break.",
      },
      {
        name: "policy_effective_date",
        domain: "policy",
        definition: "The date coverage under the policy term begins, per the declarations.",
        qualityDimensions: ["completeness", "validity (≤ expiration date)", "accuracy"],
        exampleIssue:
          "Backdated endorsements posted with the batch date instead of the true effective date distort earned premium in the transition month.",
      },
      {
        name: "policy_expiration_date",
        domain: "policy",
        definition: "The date coverage under the policy term ends, per the declarations.",
        qualityDimensions: ["completeness", "validity (≥ effective date)"],
        exampleIssue:
          "Six-month auto policies loaded with a twelve-month default expiration over-earn premium by half.",
      },
      {
        name: "transaction_effective_date",
        domain: "policy",
        definition:
          "The date a policy transaction (endorsement, cancellation, audit) takes economic effect — the date premium recognition keys from, distinct from the processing date.",
        qualityDimensions: ["completeness", "validity (within policy term)", "timeliness"],
        exampleIssue:
          "Out-of-sequence endorsements processed against the wrong in-force image produce premium deltas that never tie to the GL.",
      },
      {
        name: "line_of_business_code",
        domain: "product",
        definition:
          "The carrier's product-line classification of the policy or coverage, mapped to the NAIC annual statement line of business for statutory reporting.",
        qualityDimensions: ["validity against reference set", "consistency with annual statement line mapping"],
        exampleIssue:
          "A new cyber product coded to 'other liability — occurrence' when filed as claims-made misstates two Schedule P parts at once.",
      },
      {
        name: "annual_statement_line",
        domain: "reference-regulatory",
        definition:
          "The NAIC statutory annual statement line of business to which premium and loss for this record aggregates (e.g. line 19.2 other private passenger auto liability).",
        qualityDimensions: ["validity", "completeness", "consistency with LOB mapping"],
        exampleIssue:
          "Unmapped LOB codes default to line 34 'aggregate write-ins,' drawing a DOI analyst inquiry.",
      },
      {
        name: "coverage_limit",
        domain: "coverage",
        definition:
          "The maximum amount payable under a coverage, stored with its limit basis (per occurrence, per claim, aggregate) and currency.",
        qualityDimensions: ["completeness", "accuracy", "validity (basis code present)"],
        exampleIssue:
          "Split limits stored as a single CSL figure overstate exposure in reinsurance submissions.",
      },
      {
        name: "deductible_amount",
        domain: "coverage",
        definition: "The insured-retained amount per the coverage terms, with its basis (per occurrence, per claim, percentage).",
        qualityDimensions: ["completeness", "validity (basis code present)"],
        exampleIssue:
          "Percentage wind deductibles loaded as flat dollar amounts understate hurricane net exposure in cat models.",
      },
      {
        name: "written_premium_amount",
        domain: "premium",
        definition:
          "The premium booked for a policy transaction, signed (negative for cancellations and return premium), at transaction level.",
        qualityDimensions: ["accuracy", "completeness", "reconciliation to GL"],
        exampleIssue:
          "Return premium posted as positive amounts inflates written premium and breaks the UEP rollforward.",
      },
      {
        name: "loss_date",
        domain: "claim",
        definition: "The date the insured event occurred (occurrence date). The accident-year assignment key.",
        qualityDimensions: ["completeness", "validity (≤ report date)", "accuracy"],
        exampleIssue:
          "FNOL intake defaulting loss date to the report date shifts late-reported losses into the wrong accident year and distorts development factors.",
      },
      {
        name: "report_date",
        domain: "claim",
        definition: "The date the carrier first received notice of the claim (FNOL date).",
        qualityDimensions: ["completeness", "validity (≥ loss date, ≤ close date)"],
        exampleIssue:
          "Report dates backfilled from system migration load dates make reporting-lag studies unusable for IBNR calibration.",
      },
      {
        name: "case_reserve_amount",
        domain: "reserve",
        definition:
          "The adjuster-set estimate of unpaid loss on an open claim, by coverage, as of the evaluation date. Outstanding case = case incurred − paid.",
        qualityDimensions: ["accuracy", "timeliness of revision", "non-negativity"],
        exampleIssue:
          "Reserves left at FNOL formula defaults months into litigation understate case incurred and leak into IBNR as adverse development.",
      },
      {
        name: "paid_loss_amount",
        domain: "claim",
        definition:
          "Cumulative indemnity payments on the claim, gross of recoveries, with subrogation and salvage tracked as separate recovery transactions.",
        qualityDimensions: ["accuracy", "reconciliation to claim check register", "completeness"],
        exampleIssue:
          "Recoveries netted into paid loss at some TPAs but not others makes gross/net triangles inconsistent across the book.",
      },
      {
        name: "catastrophe_code",
        domain: "claim",
        definition:
          "The catastrophe event identifier (PCS serial or internal code) tagged on qualifying claims, enabling event-level aggregation and reinsurance recovery.",
        qualityDimensions: ["completeness on qualifying claims", "validity against event register", "timeliness"],
        exampleIssue:
          "Late cat-coding of hurricane claims delays cat-treaty recovery notices past the reinsurer's reporting deadline.",
      },
      {
        name: "claim_status",
        domain: "claim",
        definition:
          "The lifecycle state of the claim (open, closed, reopened, closed-without-payment), with status effective dates preserved as history.",
        qualityDimensions: ["validity of lifecycle transitions", "history completeness"],
        exampleIssue:
          "Reopens overwriting the original close date destroy closure-rate metrics and reopen-frequency studies.",
      },
    ],
  },

  "cope-exposure-cde-set": {
    kind: "cde-set",
    note: "Completeness and validity expectations apply at quote time — bind-without-touch rates trace directly to these attributes.",
    cdes: [
      {
        name: "construction_class",
        domain: "exposure",
        definition:
          "The building's construction classification (ISO classes 1-6: frame, joisted masonry, non-combustible, masonry non-combustible, modified fire resistive, fire resistive).",
        qualityDimensions: ["completeness at quote", "validity against ISO class set", "accuracy vs. inspection"],
        exampleIssue:
          "Defaulting unknown construction to frame (class 1) overprices masonry risks and drives adverse selection on the book.",
      },
      {
        name: "occupancy_code",
        domain: "exposure",
        definition:
          "The occupancy classification of the insured premises, mapped to the rating bureau occupancy scheme in use.",
        qualityDimensions: ["completeness", "validity", "consistency with class_code"],
        exampleIssue:
          "Restaurant occupancy coded as retail hides the cooking exposure that drives the fire rate.",
      },
      {
        name: "protection_class",
        domain: "exposure",
        definition:
          "The ISO Public Protection Classification (1-10) of the responding fire district for the location, with 10 meaning effectively unprotected.",
        qualityDimensions: ["completeness", "validity (1-10)", "currency against PPC updates"],
        exampleIssue:
          "Stale protection classes after fire-district regrades leave the book mispriced until the next full re-rate.",
      },
      {
        name: "year_built",
        domain: "exposure",
        definition: "The original construction year of the building, with major renovation years captured separately.",
        qualityDimensions: ["completeness", "reasonableness (1700-current year)"],
        exampleIssue:
          "Placeholder 1900 values concentrate suspiciously in one agency's submissions — an STP fraud signal, not a data quirk.",
      },
      {
        name: "building_replacement_cost",
        domain: "exposure",
        definition:
          "The estimated cost to rebuild the structure at current prices — the insured-value basis for property rating and the TIV input to catastrophe models.",
        qualityDimensions: ["completeness", "reasonableness vs. valuation service", "currency"],
        exampleIssue:
          "Replacement costs not trended since issuance leave the portfolio 20% underinsured after two years of construction inflation.",
      },
      {
        name: "location_geocode",
        domain: "exposure",
        definition:
          "Latitude/longitude of the insured location with geocoding resolution level (rooftop, street, ZIP centroid).",
        qualityDimensions: ["completeness", "resolution level captured", "accuracy"],
        exampleIssue:
          "ZIP-centroid geocodes in a coastal county shift modeled hurricane surge loss by multiples versus rooftop resolution.",
      },
      {
        name: "sprinkler_flag",
        domain: "exposure",
        definition:
          "Whether the premises are protected by an automatic sprinkler system, with extent (full/partial) and standard where known.",
        qualityDimensions: ["completeness", "accuracy vs. inspection"],
        exampleIssue:
          "Unverified 'yes' answers from submissions collapse under inspection sampling, forcing mid-term re-rates that agents escalate.",
      },
      {
        name: "payroll_amount",
        domain: "exposure",
        definition:
          "Estimated annual payroll by workers' compensation class code — the WC exposure base, trued up at premium audit.",
        qualityDimensions: ["completeness by class", "reasonableness vs. industry", "audit variance tracking"],
        exampleIssue:
          "Payroll concentrated in the governing class with zero in known secondary classes signals class-code gaming that audit will unwind as additional premium disputes.",
      },
      {
        name: "sales_amount",
        domain: "exposure",
        definition:
          "Estimated annual gross sales for the insured operations — the general liability exposure base for sales-rated classifications.",
        qualityDimensions: ["completeness", "reasonableness", "audit variance tracking"],
        exampleIssue:
          "Sales bases entered in thousands by one channel and units by another make GL rate monitoring meaningless until normalized.",
      },
      {
        name: "vehicle_count",
        domain: "exposure",
        definition:
          "The number of scheduled power units by vehicle type on a commercial auto policy, reconciled to the scheduled vehicle list.",
        qualityDimensions: ["consistency with vehicle schedule", "completeness"],
        exampleIssue:
          "Header vehicle counts drifting from the schedule after mid-term additions understate fleet exposure in the cat and reinsurance data calls.",
      },
      {
        name: "class_code",
        domain: "exposure",
        definition:
          "The rating classification code (WC class, GL class, ISO auto class) assigned to the exposure, valid for the state and effective period.",
        qualityDimensions: ["validity against bureau tables", "state-effective-date validity", "consistency with occupancy"],
        exampleIssue:
          "Retired bureau class codes surviving in renewal downloads fail statistical reporting edits months later.",
      },
    ],
  },

  "insurance-dq-rule-library": {
    kind: "dq-rules",
    note: "Starter sample of the full rule library. Expressions are engine-neutral pseudo-SQL; thresholds are starting points to calibrate against two closed periods before enforcement.",
    rules: [
      {
        id: "earned-premium-reconciliation",
        name: "Earned premium ties to GL earned premium account",
        expression:
          "abs(sum(earned_premium) - gl_4010_balance) / nullif(gl_4010_balance, 0) <= 0.005 group by entity, period",
        severity: "critical",
        rationale:
          "Earned premium is the denominator of every loss ratio and a statutory statement line. A tie-out breach here invalidates downstream reporting before anyone reads it.",
        obligationKey: "sox-icfr",
      },
      {
        id: "uep-rollforward-balance",
        name: "Unearned premium rollforward balances",
        expression:
          "abs(uep_begin + written_premium - earned_premium - uep_end) <= 100 group by entity, lob, period",
        severity: "critical",
        rationale:
          "UEP(end) = UEP(begin) + written − earned is an identity, not an estimate. Any residual is a booking error, a missing transaction feed, or an earning-engine defect.",
        obligationKey: "statutory-annual-statement",
      },
      {
        id: "incurred-composition-consistency",
        name: "Incurred loss equals paid plus case plus IBNR",
        expression:
          "abs(incurred_loss - (paid_loss + case_reserve + ibnr_reserve)) <= 1 group by segment, accident_year, evaluation_date",
        severity: "critical",
        rationale:
          "Actuarial triangles and Schedule P both decompose incurred into paid, case, and IBNR. If the components do not sum, the reserve study and the statement are reading different books.",
        obligationKey: "asop-23",
      },
      {
        id: "claim-date-sequence",
        name: "Claim lifecycle dates in sequence",
        expression:
          "loss_date <= report_date and report_date <= coalesce(close_date, current_date) and loss_date >= policy_effective_date - interval '60' day",
        severity: "serious",
        rationale:
          "Date-sequence violations corrupt accident-year assignment, reporting-lag studies, and IBNR calibration. The 60-day tolerance before policy effective date flags miskeys while allowing legitimate prior-term tail claims routed for review.",
        obligationKey: "asop-23",
      },
      {
        id: "policy-term-validity",
        name: "Policy effective date precedes expiration date",
        expression:
          "policy_effective_date < policy_expiration_date and datediff(day, policy_effective_date, policy_expiration_date) between 1 and 1830",
        severity: "serious",
        rationale:
          "Inverted or implausible terms (over five years for standard P&C) break earning calculations and in-force counts. Usually a migration or default-date artifact.",
      },
      {
        id: "asl-mapping-completeness",
        name: "Every premium record maps to an annual statement line",
        expression:
          "count(records where annual_statement_line is null or annual_statement_line not in ref_naic_asl) = 0",
        severity: "critical",
        rationale:
          "Unmapped premium aggregates into write-in lines on the statutory statement, drawing DOI analyst inquiry and misstating by-line exhibits.",
        obligationKey: "statutory-annual-statement",
      },
      {
        id: "schedule-p-net-gross-consistency",
        name: "Schedule P net losses do not exceed gross",
        expression:
          "sum(gross_incurred_loss) - sum(ceded_incurred_loss) = sum(net_incurred_loss) and sum(ceded_incurred_loss) >= 0 group by schedule_p_line, accident_year",
        severity: "critical",
        rationale:
          "Net exceeding gross, or negative cessions outside commutation events, indicates the ceded feed and the direct feed disagree — the classic Schedule P restatement trigger.",
        obligationKey: "schedule-p",
      },
      {
        id: "case-reserve-nonnegative",
        name: "Outstanding case reserves are non-negative",
        expression:
          "count(claims where case_reserve_amount < 0 and recovery_type is null) = 0",
        severity: "serious",
        rationale:
          "Negative case reserves outside recovery accounting mean payments posted without reserve takedown — reserve run-off reports will show phantom redundancy.",
        obligationKey: "asop-23",
      },
      {
        id: "cope-completeness-at-bind",
        name: "COPE attributes complete at property bind",
        expression:
          "count(bound_locations where construction_class is null or occupancy_code is null or protection_class is null or building_replacement_cost is null) / count(bound_locations) <= 0.02",
        severity: "warning",
        rationale:
          "Every COPE gap at bind is a manual touch later — in cat modeling, reinsurance submissions, or premium audit. The 2% tolerance covers legitimate binder-stage placeholders.",
      },
      {
        id: "class-code-reference-validity",
        name: "Rating class codes valid for state and period",
        expression:
          "count(exposures where (class_code, state, rate_effective_date) not in ref_bureau_class_codes_effective) = 0",
        severity: "serious",
        rationale:
          "Retired or out-of-state class codes fail bureau statistical reporting edits and misprice the exposure. Validate against the effective-dated reference table, not the current snapshot.",
      },
      {
        id: "cat-code-timeliness",
        name: "Catastrophe coding applied within 5 days of event mapping",
        expression:
          "count(claims where loss_date between event.start and event.end and loss_state in event.states and peril = event.peril and catastrophe_code is null and days_since(report_date) > 5) = 0",
        severity: "warning",
        rationale:
          "Late cat-coding delays event-level aggregation and reinsurance recovery notices; treaty reporting clauses put deadlines on both.",
      },
      {
        id: "nppi-column-classification-coverage",
        name: "NPPI-bearing columns carry approved sensitivity classification",
        expression:
          "count(columns where nppi_scan_hit = true and classification_status != 'approved') = 0 scope: claim, party, employee-hr schemas",
        severity: "critical",
        rationale:
          "A scanner hit without an approved classification is unprotected NPPI: no masking policy, no purpose restriction, no audit answer. This rule is the gate on every sensitive-data unlock.",
        obligationKey: "glba-nppi",
      },
      {
        id: "claimant-medical-masking-enforced",
        name: "Claim medical content masked outside claims-handling purpose",
        expression:
          "count(access_events where column_tag = 'nppi-medical' and access_purpose not in ('claims-handling','siu','litigation') and masking_applied = false) = 0",
        severity: "critical",
        rationale:
          "Claim files carry medical records with statutory handling duties; any unmasked access outside permitted purposes is a reportable-event candidate, not a quality warning.",
        obligationKey: "hipaa-phi",
      },
      {
        id: "bordereau-period-completeness",
        name: "Delegated bordereaux received for every open binder-month",
        expression:
          "count(binder_months where binder_status = 'active' and bordereau_received = false and days_past_due > 10) = 0",
        severity: "serious",
        rationale:
          "A missing bordereau month is invisible premium and loss — the delegated-authority failure mode examiners and reinsurers both probe first.",
        obligationKey: "naic-model-audit-rule",
      },
    ],
  },

  // ───────────────────────── VP-03 Governance-as-Code Starter Repo ─────────────────────────

  "gac-definition-schema": {
    kind: "code",
    language: "yaml",
    description:
      "A complete governed data product definition in the declarative schema — an employee-HR analytics product showing the classification chain, CDE registrations, DQ rules, purpose-based access policy, and the approval block the CI pipeline enforces. One definition set, deployed to catalog, warehouse, DQ engine, and policy layer by the edge adapters.",
    snippet: `# governance/products/employee-hr-analytics.yaml
apiVersion: governance/v1
kind: DataProduct
metadata:
  key: employee-hr-analytics
  name: Employee & HR Analytics
  owner: role:hr-data-product-owner
  steward: role:hr-data-steward
  archetype: sensitive-data
  domains: [employee-hr]

classification:
  taxonomy: insurance-nppi/v2
  labels:
    - column: employee.national_id
      category: nppi-government-id
      basis: glba-nppi
    - column: employee.compensation_annual
      category: nppi-financial
      basis: glba-nppi
    - column: employee.ethnicity_code
      category: eeo-protected
      basis: state-privacy-laws
    - column: benefits.claim_diagnosis_code
      category: nppi-medical
      basis: hipaa-phi
  propagation: [catalog-annotation, warehouse-tag, policy-attribute]

cdes:
  - name: employee_id
    dimensions: [uniqueness, completeness]
  - name: employment_status
    dimensions: [validity, timeliness]
  - name: compensation_annual
    dimensions: [accuracy, reconciliation-to-payroll-gl]

quality:
  rules:
    - id: employee-id-unique
      expression: "count(*) = count(distinct employee_id)"
      severity: critical
      onBreach: route:steward-queue
    - id: comp-ties-to-payroll-gl
      expression: "abs(sum(compensation_annual)/12 - gl_payroll_monthly) / gl_payroll_monthly <= 0.01"
      severity: critical
      onBreach: route:finance-triage
    - id: eeo-fields-null-outside-hr
      expression: "masked(ethnicity_code) = true for purpose != 'eeo-reporting'"
      severity: critical
      onBreach: page:privacy-office

access:
  model: purpose-based
  policies:
    - purpose: workforce-planning
      grants: [aggregate-only]
      masking: {national_id: full, compensation_annual: band, ethnicity_code: deny}
    - purpose: eeo-reporting
      grants: [row-level]
      masking: {national_id: full}
      approvers: [role:privacy-partner]

approval:
  required: [role:hr-data-steward, role:privacy-partner]
  merged_by: null   # set by CI on merge; never hand-edited
  audit_event: definition.merged`,
  },

  "gac-ci-pipeline": {
    kind: "code",
    language: "yaml",
    description:
      "The governance CI pipeline definition: validation, obligation linting, human approval gates, deployment via edge adapters, and the audit event every merge emits. Nothing reaches a production governance platform except through this path.",
    snippet: `# .ci/governance-pipeline.yaml
name: governance-definitions
on:
  pull_request: {paths: ["governance/**"]}
  merge: {branch: main, paths: ["governance/**"]}

stages:
  validate:
    - schema-check: {schema: governance/v1, fail_on: error}
    - referential-check:      # every key must resolve
        verify: [cde-names-exist, obligation-keys-known, role-refs-resolve, taxonomy-categories-valid]
    - lint-obligations:       # sensitive categories demand policy + masking
        rules:
          - "classification.category startsWith 'nppi-' requires access.masking entry"
          - "severity: critical requires onBreach route"
          - "archetype: sensitive-data requires approver role:privacy-partner"

  approve:                    # human gates — CI verifies, never substitutes
    required_reviews:
      - role: data-steward          # semantics and CDE scope
      - role: privacy-partner       # when classification diff is non-empty
        condition: diff.touches("classification") or diff.touches("access")
    block_merge_until: all_required_reviews_approved

  deploy:                     # edge adapters translate to each platform's native form
    - adapter: catalog        # terms, CDE registrations, annotations
      target: catalog-suite
    - adapter: warehouse-tags # tag + masking DDL, idempotent
      target: warehouse
    - adapter: dq-engine      # rule configs with thresholds and routing
      target: dq-engine
    - adapter: policy-layer   # purpose-based access policies
      target: policy-enforcement
    rollback: previous_merged_revision on any adapter failure

  audit:
    emit:
      event: definition.merged
      fields: [product_key, revision, author, approvers, diff_summary, deployed_targets]
    retention: 7y             # examiner-replayable change record`,
  },

  "gac-deployment-adapters": {
    kind: "method",
    steps: [
      {
        name: "Inventory the target stack per market",
        description:
          "For each market or business unit, record which platform anchors each capability — catalog, warehouse tagging, DQ execution, policy enforcement — and its API surface and auth model. The adapter layer exists precisely because this inventory differs by market.",
        decisionRule:
          "If two platforms both claim the same capability in one market, resolve the anchor/support roles before wiring an adapter — adapters deploy to anchors only.",
      },
      {
        name: "Map schema constructs to native forms",
        description:
          "For each adapter, write the translation table: classification label → catalog annotation type and warehouse tag DDL; CDE registration → catalog CDE object; DQ rule → engine rule config with threshold and schedule; access policy → policy object or masking rule. Where a platform cannot represent a construct, the adapter must fail loudly, not approximate silently.",
        decisionRule:
          "Any construct the platform cannot represent natively is either escalated as a platform gap or handled by a documented compensating control — never dropped.",
      },
      {
        name: "Make every adapter idempotent and diff-aware",
        description:
          "Adapters apply the delta between the merged definition set and current platform state, and re-running them converges rather than duplicates. This is what allows drift detection to reuse the same comparison logic in reverse.",
        decisionRule:
          "If an adapter cannot compute current platform state via API, it is not production-ready — deployment without readback is how drift starts.",
      },
      {
        name: "Certify each adapter against the reference product",
        description:
          "Run the adapter against a reference definition set in a non-production tenant and verify each construct landed correctly via API readback. Certification is per adapter version per platform version.",
        decisionRule:
          "An adapter is certified when readback matches the definition set exactly for every construct type it claims to support.",
      },
      {
        name: "Onboard new markets by adapter, not by re-modeling",
        description:
          "A market running a different catalog or DQ engine gets a new last-mile adapter; the governance model, definitions, and pipeline stay identical. Adapter build effort is the honest price of tool diversity — measure it and let it inform tool consolidation decisions.",
        decisionRule:
          "If adapter maintenance for a platform exceeds the cost of migrating that market to a certified platform, surface the trade-off to the architecture board with numbers.",
      },
    ],
  },

  "gac-onboarding-playbook": {
    kind: "method",
    steps: [
      {
        name: "Intake: classify the product and pick its archetype",
        description:
          "At intake, capture the product's domains, consumers, obligations, and sensitivity profile, then select the nearest archetype blueprint — sensitive-data, report-integrity, reconciliation, operational-data, or new-platform. The archetype decides the scaffold, the default rule set, and the gate weights.",
        decisionRule:
          "If a product matches two archetypes, choose the one with the stricter gate — it is cheaper to relax later than to retrofit.",
      },
      {
        name: "Scaffold the definition set from the archetype",
        description:
          "Generate the product's governance definition set from the archetype template: classification chain stubs, candidate CDEs from the domain library, default DQ rules with unset thresholds, and access-policy skeletons. The scaffold is a pull request on day one, not a document.",
      },
      {
        name: "PR wave 1 — classification chain",
        description:
          "First merge: sensitivity labels for every scanner hit and known-sensitive attribute, with privacy-partner review. Classification goes first because access policy and DQ scope both hang off it.",
        decisionRule:
          "Do not open wave 2 while any nppi-category column is unclassified — sequencing is the control.",
      },
      {
        name: "PR wave 2 — CDEs and quality rules",
        description:
          "Second merge set: confirm CDE candidacy, set rule thresholds calibrated against two closed periods of profiling, and wire breach routing to the steward queue. Rules deploy monitoring-only first, enforcing after one clean cycle.",
        decisionRule:
          "A rule graduates from monitoring to enforcing after one full cycle with a false-positive rate below the agreed threshold.",
      },
      {
        name: "PR wave 3 — lineage targets and access policies",
        description:
          "Third merge set: declare priority lineage coverage targets (which reports must trace source-to-consumption), register manual-stitch segments, and activate purpose-based access policies replacing any per-view grants.",
      },
      {
        name: "Gate: definition-of-done reads from the repo",
        description:
          "The governance definition-of-done evaluates merged, deployed definitions and their telemetry — rules executing, lineage rendering, classifications propagated — not slideware. Passing the gate lists the product in the marketplace as governed.",
        decisionRule:
          "Every gate criterion must be machine-checkable from the definition set or platform telemetry; anything requiring a meeting to verify is not a gate criterion.",
      },
    ],
  },

  // ───────────────────────── VP-04 Governance Command Center ─────────────────────────

  "steward-workbench-spec": {
    kind: "template",
    sections: [
      {
        title: "Queue surface",
        purpose:
          "The single daily entry point: agent suggestions and breach items, confidence-routed and grouped, so a steward opens one queue instead of five tool consoles.",
        fields: [
          "Item card: suggestion type, source agent, confidence score, product, capability",
          "Grouping: by data product, then capability; close-calendar items pinned to top",
          "Routing lanes: fast-lane (high confidence), deep-review (below threshold), breach triage",
          "Bulk actions: approve-all within a group only when every item exceeds fast-lane threshold",
        ],
      },
      {
        title: "Decision interaction",
        purpose:
          "One-click approve / edit / reject with the evidence needed to decide, capturing the rationale telemetry that prices the scale-out.",
        fields: [
          "Evidence panel: profiling stats, scan hits, matching glossary/CDE context, obligation links",
          "Actions: approve, edit-then-approve (diff captured), reject (reason code mandatory)",
          "Reject reason codes: wrong-association, wrong-definition, duplicate, out-of-scope, needs-sme",
          "Edit-distance capture on accepted-with-edits items",
        ],
      },
      {
        title: "Leverage counter",
        purpose:
          "The steward's personal view of measured leverage — minutes saved versus manual baseline — making the supervision model's value visible to the person doing it.",
        fields: [
          "Artifacts decided today / this week, by type",
          "Steward-minutes per artifact vs. manual baseline",
          "Personal acceptance-rate trend by agent",
        ],
      },
      {
        title: "Audit tail",
        purpose:
          "The live, scrollable record of every decision — the same events the unified audit log stores, visible where the work happens.",
        fields: [
          "Event stream: suggestion issued → decision taken → deployment result",
          "Filters: agent, product, decision, date range",
          "Deep link to the unified audit log record",
        ],
      },
      {
        title: "Close-calendar context",
        purpose:
          "Reporting-period awareness so tie-point breaches outrank routine curation in the days before a close.",
        fields: [
          "Close calendar feed (entity, period, key dates)",
          "Elevation rule: breach touches a reconciliation tie-point AND close is within N days",
          "Visual: elevated items badged with the close date they threaten",
        ],
      },
    ],
  },

  "governance-telemetry-model": {
    kind: "reference-data",
    sets: [
      {
        name: "Suggestion & decision events",
        codes: [
          {
            code: "agent.suggestion.issued",
            label: "Agent issued a suggestion",
            note: "Payload: agent, suggestion type, product, confidence, evidence refs.",
          },
          {
            code: "agent.suggestion.routed",
            label: "Suggestion routed to a queue lane",
            note: "fast-lane | deep-review, with threshold in force at routing time.",
          },
          {
            code: "steward.decision.approved",
            label: "Steward approved a suggestion",
            note: "Decision latency and steward-minutes captured.",
          },
          {
            code: "steward.decision.edited",
            label: "Steward approved with edits",
            note: "Diff and edit-distance captured — heavy edits are quiet rejection.",
          },
          {
            code: "steward.decision.rejected",
            label: "Steward rejected a suggestion",
            note: "Reason code mandatory; feeds agent retuning and bench rule.",
          },
        ],
      },
      {
        name: "Rule & remediation events",
        codes: [
          {
            code: "rule.execution.completed",
            label: "DQ rule executed",
            note: "Payload: rule id, records evaluated, pass rate, threshold, duration.",
          },
          {
            code: "breach.opened",
            label: "Breach opened from a rule failure",
            note: "Severity, CDE, obligation link, proposed owner.",
          },
          {
            code: "breach.assigned",
            label: "Breach assigned to an owner",
            note: "Assignment latency is a stewardship-ops health metric.",
          },
          {
            code: "breach.resolved",
            label: "Breach resolved with disposition",
            note: "Disposition: remediated | accepted-risk | false-positive; time-to-resolve captured.",
          },
        ],
      },
      {
        name: "Definition & gate events",
        codes: [
          {
            code: "definition.merged",
            label: "Governance definition set merged",
            note: "Author, approvers, diff summary — the examiner-replayable change record.",
          },
          {
            code: "definition.deployed",
            label: "Definitions deployed via edge adapters",
            note: "Per-target result; failures trigger rollback event.",
          },
          {
            code: "drift.detected",
            label: "Standards-vs-configuration drift detected",
            note: "Source: alignment scan; severity and evidence refs attached.",
          },
          {
            code: "gate.evidence.attached",
            label: "Definition-of-done evidence attached",
            note: "Machine-checkable artifact linked to a gate criterion.",
          },
          {
            code: "gate.passed",
            label: "Product passed its governance gate",
            note: "GPI at gate time recorded; product listed as governed.",
          },
        ],
      },
    ],
  },

  "unified-audit-log-standard": {
    kind: "code",
    language: "json",
    description:
      "The canonical audit record shape, shown as a linked pair: an agent suggestion and the steward decision that dispositioned it. One log spans human and agent activity; audit and risk partners get read access to this log and lineage traces instead of a bespoke reporting surface. Retention: 7 years, append-only, queryable.",
    snippet: `[
  {
    "event_id": "evt-2026-07-14-000482913",
    "event_type": "agent.suggestion.issued",
    "occurred_at": "2026-07-14T13:02:11Z",
    "actor": {"kind": "agent", "id": "rule-smith", "version": "1.8.2"},
    "subject": {
      "product": "claims-360",
      "capability": "data_quality",
      "artifact_type": "dq-rule",
      "artifact_ref": "draft/claim-date-sequence-cl360"
    },
    "detail": {
      "confidence": 0.91,
      "routed_lane": "fast-lane",
      "evidence": [
        "profile/claims_core.report_date/2026-07-13",
        "cde/loss_date", "obligation/asop-23"
      ]
    },
    "integrity": {"sequence": 482913, "prev_hash": "d41d8c…", "hash": "9b1f22…"}
  },
  {
    "event_id": "evt-2026-07-14-000483067",
    "event_type": "steward.decision.edited",
    "occurred_at": "2026-07-14T13:09:47Z",
    "actor": {"kind": "human", "id": "steward:mreyes", "role": "claims-data-steward"},
    "subject": {"suggestion_ref": "evt-2026-07-14-000482913"},
    "detail": {
      "decision": "approved-with-edits",
      "edit_summary": "tolerance on loss_date vs policy_effective_date widened to 60d for tail claims",
      "edit_distance": 0.12,
      "steward_seconds": 264,
      "deployment": {"event": "definition.merged", "revision": "cl360@r141"}
    },
    "integrity": {"sequence": 483067, "prev_hash": "9b1f22…", "hash": "77aa04…"}
  }
]`,
  },

  "command-center-rollout-playbook": {
    kind: "method",
    steps: [
      {
        name: "Wire telemetry before any surface",
        description:
          "Implement the canonical event model first — suggestion, decision, rule, breach, definition, and gate events flowing to the warehouse. No dashboard exists yet; this stage is invisible and non-negotiable, because every later surface computes from these events.",
        decisionRule:
          "Do not begin surface build until a week of events replays cleanly and event counts reconcile with source platforms.",
      },
      {
        name: "Stand up the steward queue second",
        description:
          "The steward 'my day' workbench goes live next because it generates the decision telemetry everything else reports. Run it with two pilot products and real agent suggestions; tune fast-lane thresholds on observed acceptance.",
        decisionRule:
          "The queue is ready to scale when pilot stewards work from it daily without reverting to native tool consoles.",
      },
      {
        name: "Add the data office operations view",
        description:
          "Third surface: queue depths, breach aging, acceptance rates by agent, deployment activity, and drift findings — the daily management view. Every panel must answer a question the data office currently answers by asking someone.",
      },
      {
        name: "Launch the executive portfolio view last",
        description:
          "Only when telemetry has weeks of live history does the executive surface launch: GPI burn-up by product, leverage ratio trend, time-to-governed by wave, value moments. Leadership's first look shows live numbers, which is what earns the standing weekly audience.",
        decisionRule:
          "Launch when every executive panel renders from live telemetry — a single mocked number postpones the launch, it does not decorate it.",
      },
      {
        name: "Map each surface to the questions it must answer",
        description:
          "Maintain the audience-by-audience question map: steward (what do I decide next), data office (where is the bottleneck), executive (is the portfolio getting cheaper and safer). A panel that answers no mapped question gets removed at the monthly review.",
      },
    ],
  },

  // ───────────────────────── VP-05 Scale Economics Model ─────────────────────────

  "scale-economics-calculator": {
    kind: "method",
    steps: [
      {
        name: "Segment the portfolio by archetype",
        description:
          "Classify every candidate data product into the governance archetypes (sensitive-data, report-integrity, reconciliation, operational-data, new-platform) and count them. The archetype mix is the demand side of the model.",
      },
      {
        name: "Load measured per-product effort",
        description:
          "Pull actual effort-weeks per archetype from completed products' telemetry — not estimates. First-of-archetype and second-of-archetype are loaded separately to capture the reuse curve.",
        decisionRule:
          "Where fewer than two products of an archetype have completed, use the range from the nearest archetype and flag the projection as low-confidence.",
      },
      {
        name: "Apply capability-level leverage ratios",
        description:
          "For each capability, apply the measured steward leverage ratio (manual baseline ÷ supervised-agentic actual) from the audit log. This converts manual effort curves into agentic ones per capability, not as a blanket discount.",
        decisionRule:
          "Any capability with agent acceptance below the bench threshold is costed at manual rates — the model carries no automation optimism it cannot evidence.",
      },
      {
        name: "Constrain by available capacity",
        description:
          "Overlay actual steward, engineer, and privacy-partner capacity, including approval throughput (reviews per week), which is the binding constraint more often than build effort. Output: feasible wave schedule, not just total cost.",
      },
      {
        name: "Produce both curves with cost bands",
        description:
          "Emit the labor-model curve and the agentic-model curve — cumulative cost and elapsed time versus products governed — with bands from the effort ranges. The gap between the curves, priced, is the scale-out business case.",
      },
      {
        name: "Re-run on every telemetry refresh",
        description:
          "The model is arithmetic on live actuals: re-run it monthly and whenever a wave completes. Assumption changes are visible as curve shifts leadership can interrogate, instead of a re-commissioned study.",
        decisionRule:
          "If the agentic curve's advantage shrinks two refreshes in a row, investigate leverage-ratio decay before approving the next wave.",
      },
    ],
  },

  "steward-leverage-ratio": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Steward Leverage Ratio (per capability)",
        definition:
          "Instrumented steward-minutes per governance artifact (term, rule, classification, stitch) under the manual baseline, divided by steward-minutes per artifact under the supervised-agentic model — computed per capability from audit-log events.",
        formula:
          "baseline_minutes_per_artifact(capability) / agentic_minutes_per_artifact(capability), where agentic includes review, edit, and rework time",
        target: ">= 4.0 sustained per capability before that capability's leverage is priced into a scale wave",
      },
      {
        name: "Manual Baseline (per artifact type)",
        definition:
          "The measured steward-minutes to author an artifact of each type without agent drafting, sampled from pre-agentic periods or control tasks — refreshed quarterly so the denominator stays honest.",
        formula:
          "median(steward_minutes | artifact created manually, by artifact_type), trimmed of the top and bottom decile",
        target: "Refreshed every quarter; stale baselines older than two quarters invalidate the ratio",
      },
      {
        name: "Effective Leverage (acceptance-adjusted)",
        definition:
          "Leverage discounted by rejection and rework: rejected suggestions consume review minutes and produce nothing, so effective leverage is what the scale model may use.",
        formula:
          "leverage_ratio * accepted_artifacts / (accepted_artifacts + rejected_suggestions * review_cost_factor)",
        target: "Published weekly alongside the headline ratio; the scale calculator consumes this number, not the headline",
      },
    ],
  },

  "time-to-governed": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Time-to-Governed (elapsed)",
        definition:
          "Calendar weeks from product intake to passing the governance definition-of-done gate, segmented by archetype.",
        formula:
          "gate.passed.date - intake.date, in weeks, reported as median and P80 per archetype",
        target: "Within the archetype's published range; P80 breaches trigger a dependency review",
      },
      {
        name: "Time-to-Governed (effort)",
        definition:
          "Total effort-weeks (steward + engineer + partner review) booked against the product from intake to gate, from telemetry, not timesheets alone.",
        formula:
          "sum(effort_weeks by role) per product, from decision latency, deployment, and review events",
        target: "Declines wave over wave within each archetype",
      },
      {
        name: "Archetype Reuse Delta",
        definition:
          "The ratio of the second (and Nth) product's time-to-governed to the first product of the same archetype — the compounding the code substrate exists to produce.",
        formula:
          "ttg(product_n, archetype) / ttg(product_1, archetype), elapsed and effort variants",
        target:
          "<= 0.6 by the second product of an archetype; a flat curve is an early warning that patterns are not actually reusing",
      },
    ],
  },

  "portfolio-archetype-method": {
    kind: "method",
    steps: [
      {
        name: "Inventory candidate products",
        description:
          "List every data product and product-shaped asset in scope with its domains, consumers, obligations, and sensitivity profile — including the shadow assets (departmental marts, spreadsheet feeds) that will either be governed or retired.",
      },
      {
        name: "Assign each product an archetype",
        description:
          "Classify into: sensitive-data (classification and access dominate), report-integrity (certified metrics and lineage dominate), reconciliation (tie-points and close-calendar controls dominate), operational-data (contracts and monitoring dominate), new-platform (govern-at-inception on a greenfield build).",
        decisionRule:
          "Assign by the dominant risk, not the loudest stakeholder; a product with NPPI and a statutory feed is sensitive-data first — access failures are irreversible, report errors are correctable.",
      },
      {
        name: "Attach measured effort ranges",
        description:
          "Give each archetype an effort range from measured actuals (first-of-type versus repeat), and each product a demand score from business pull: blocked use cases, obligation deadlines, incident history.",
      },
      {
        name: "Run the dependency checklist per candidate wave",
        description:
          "For each product in a proposed wave, verify the dependencies that actually gate pace: access provisioning lead times, scanner and connector coverage of its sources, source-system team participation, and steward/privacy approval throughput.",
        decisionRule:
          "A product with an unmet hard dependency moves to a later wave regardless of demand score — wave plans die on unexamined dependencies, not on effort estimates.",
      },
      {
        name: "Sequence waves by leverage × demand × readiness",
        description:
          "Rank products by the combination of archetype leverage ratio (where agents help most), demand score, and dependency readiness. Publish the ranking with its inputs so 'what should we govern next' is a rankable decision, not a negotiation.",
      },
      {
        name: "Re-segment after every wave",
        description:
          "Completed waves update the effort ranges and leverage ratios; re-run the ranking. Products whose archetype was misjudged get reclassified with the reason recorded — the taxonomy is a working tool, not a report annex.",
      },
    ],
  },

  // ───────────────────────── VP-06 Capability Assessment Toolkit ─────────────────────────

  "capability-scorecard-templates": {
    kind: "template",
    sections: [
      {
        title: "Classification & Sensitivity scorecard",
        purpose:
          "Score discovery coverage, precision, and the classification-to-enforcement chain — with the insurance-completeness lens (does the taxonomy know claims medical, SIU, licensing data?) and the automation-readiness lens.",
        fields: [
          "Scan coverage of in-scope estate (% schemas, evidence: scanner config + coverage export)",
          "Classification precision on sampled hits (evidence: sampled adjudication sheet)",
          "Insurance NPPI categories present in taxonomy (checklist against reference taxonomy)",
          "Propagation: label → catalog → warehouse tag → policy attribute (evidence: end-to-end test capture)",
          "Automation-readiness: can proposals flow to a steward queue with confidence scores?",
        ],
      },
      {
        title: "Catalog & Metadata scorecard",
        purpose:
          "Score inventory coverage, curation depth, and ownership reality — whether the catalog describes the estate or a memory of it.",
        fields: [
          "Estate coverage: sources registered vs. priority source list",
          "Curation: % assets with owner, description, and steward-reviewed metadata",
          "Business-to-technical association rate on priority assets",
          "Staleness: median days since last scan per source",
          "Automation-readiness: native suggestion features on, tuned, and used?",
        ],
      },
      {
        title: "Semantic Layer scorecard",
        purpose:
          "Score whether certified definitions exist, are singular, and are consumed — the one-certified-definition-per-metric test.",
        fields: [
          "Certified definition coverage of headline KPIs (loss ratio, combined ratio, persistency…)",
          "Duplicate-definition count per metric across glossary, BI models, warehouse views",
          "Consumption: % priority reports binding to certified definitions",
          "Statutory/GAAP basis annotations present where bases diverge",
        ],
      },
      {
        title: "Data Quality scorecard",
        purpose:
          "Score rule reality versus rule inventory, CDE anchoring, and whether breaches land in an owned loop — the insurance lens asks for actuarial (ASOP 23) and statutory tie-point coverage.",
        fields: [
          "CDE coverage: % identified CDEs with executing, monitored rules",
          "Rule execution reality: rules executed in last cycle vs. rules defined",
          "Reconciliation tie-points covered (earned premium, UEP rollforward, incurred composition)",
          "Breach disposition: % breaches resolved with disposition inside SLA",
          "Automation-readiness: rules expressible as code, deployable via pipeline?",
        ],
      },
      {
        title: "Lineage scorecard",
        purpose:
          "Score rendered reach against claimed reach and explainability under pressure — the regulator-explainable test, not the demo test.",
        fields: [
          "Scanner coverage vs. priority estate map",
          "Priority reports with complete source-to-consumption trace (rendered or governed-manual)",
          "Manual segment documentation compliance",
          "Time-to-diagnose drill result (sampled suspect figure, minutes)",
          "Automation-readiness: gap inventory feasible from scanner APIs?",
        ],
      },
      {
        title: "Scoring & evidence rules",
        purpose:
          "Keep the scorecards evidence-led and comparable: every score cites a captured artifact, every lens is scored 0-4 against written anchors.",
        fields: [
          "Score anchors 0-4 per line item (written, capability-specific)",
          "Evidence register: artifact per scored line, captured during the probe",
          "No self-assessment inputs — configuration, API samples, and artifacts only",
          "Cross-capability comparability check at readout",
        ],
      },
    ],
  },

  "tool-role-mapping-canvas": {
    kind: "template",
    sections: [
      {
        title: "Role assignment grid",
        purpose:
          "One row per capability, one column per platform: assign each platform anchor / support / enforce / consume for that capability, and force a single anchor per capability.",
        fields: [
          "Capability (classification, catalog, semantic, quality, lineage, access, stewardship)",
          "Platform × role assignment (anchor | support | enforce | consume | none)",
          "Anchor conflicts flagged (two anchors = unresolved ownership)",
          "Propagation owner per capability (who moves metadata between platforms)",
        ],
      },
      {
        title: "Handoff inventory",
        purpose:
          "Every place a governance object crosses platforms — label to tag, term to BI model, rule to engine — with a named owner and mechanism, because unowned handoffs are where consistency dies.",
        fields: [
          "Handoff: source platform → target platform, object type",
          "Mechanism (API sync, pipeline adapter, manual export, none)",
          "Owner (named role)",
          "Frequency and last-verified date",
        ],
      },
      {
        title: "Friction watchpoints",
        purpose:
          "The overlap patterns experience says to probe first — pre-listed so the assessment does not rediscover them slowly.",
        fields: [
          "Two engines classifying with no propagation owner (which wins?)",
          "Semantic layer contested across glossary, BI models, warehouse views",
          "DQ rules duplicated across execution points; orphaned alert streams",
          "Lineage strong in warehouse, weak at source and report edges",
          "Access policy split between platform RBAC and enforcement layer",
        ],
      },
      {
        title: "Resolution actions",
        purpose:
          "Turn each identified friction into a decision for the architecture board: clarify the anchor, name the propagation owner, or retire the overlap.",
        fields: [
          "Friction item → proposed resolution (anchor decision | owner assignment | retirement)",
          "Decision owner and forum",
          "Target date and verification evidence",
        ],
      },
    ],
  },

  "evidence-probe-checklists": {
    kind: "checklist",
    sections: [
      {
        title: "Classification probes",
        items: [
          "Export scanner scope configuration; diff against the priority estate list — capture the gap list",
          "Sample 50 classification hits across claim, party, and employee-hr schemas; adjudicate precision with the privacy partner",
          "Run one end-to-end propagation test: approve a label, verify catalog annotation, warehouse tag, and policy attribute within the SLA",
          "Capture threshold configuration and the review workflow for auto-classification suggestions",
        ],
      },
      {
        title: "Catalog & glossary probes",
        items: [
          "Pull asset counts by source via API; reconcile against the source inventory — claimed vs. registered",
          "Compute business-term association rate on the top 20 priority datasets",
          "Sample 25 glossary terms for owner, definition quality, and last-review date",
          "Capture native AI suggestion telemetry: suggestions issued, accepted, rejected in the last 90 days",
        ],
      },
      {
        title: "Data quality probes",
        items: [
          "Export the rule inventory and the last cycle's execution log; compute rules-executing / rules-defined",
          "Verify each identified CDE has at least one executing rule; list uncovered CDEs",
          "Trace three recent breaches end-to-end: detection → routing → owner → disposition, with timestamps",
          "Check reconciliation tie-point rules exist for earned premium, UEP rollforward, and incurred composition",
        ],
      },
      {
        title: "Lineage probes",
        items: [
          "Export scanner/connector coverage; plot against the priority estate map — rendered vs. claimed",
          "Pick two headline figures from priority reports; trace source-to-consumption, timing each trace",
          "Inspect five manual segments against the documentation standard (connects, logic, owner, refresh, review)",
          "Verify report-edge and source-edge lineage, not just warehouse-internal hops",
        ],
      },
      {
        title: "Access & policy probes",
        items: [
          "Sample access policies for sensitive datasets: purpose-based or per-view grants?",
          "Test masking enforcement with a non-privileged account against nppi-tagged columns",
          "Count duplicate/shadow views of sensitive data pending retirement",
          "Capture the access-request audit trail for two recent sensitive-data grants",
        ],
      },
    ],
  },

  "native-ai-activation-review": {
    kind: "method",
    steps: [
      {
        name: "Inventory native AI features per platform",
        description:
          "List every AI/automation capability already licensed in the estate — catalog auto-association and term suggestion, auto-classification, anomaly detection, native quality-rule suggestions — with its current state: off, on-default, or tuned.",
      },
      {
        name: "Measure suggestion precision at current thresholds",
        description:
          "For each active feature, pull 90 days of suggestion telemetry and sample-adjudicate precision. Features with no telemetry are scored 'on but unobserved' — indistinguishable from off, for value purposes.",
        decisionRule:
          "A feature counts as activated only if suggestions flow to a human review workflow with recorded decisions.",
      },
      {
        name: "Map the human workflow around each feature",
        description:
          "Document who reviews each feature's output, in what queue, at what cadence. Most 'AI disappointment' findings are workflow gaps: suggestions land in a tab nobody owns.",
      },
      {
        name: "Produce the activation plan",
        description:
          "For each underused feature: what turning it on properly requires (threshold tuning, queue wiring, steward training), expected artifact volume, and the leverage estimate. Sequence by effort-to-value.",
        decisionRule:
          "Platform-native activation precedes any external agent build for the same job — it is the version security and procurement approve fastest.",
      },
      {
        name: "Define the external-agent boundary",
        description:
          "Name where an external agent layer genuinely adds beyond native reach: cross-platform reasoning (stitch proposals across scanners), insurance-tuned drafting (pre-seeded vocabulary), and drift detection across tools. Everything else defaults to native.",
        decisionRule:
          "An external agent is justified when the job requires context spanning platforms or insurance semantics the native feature cannot hold — not when native is merely untuned.",
      },
    ],
  },

  // ───────────────────────── VP-07 Standards Traceability & Playbook Refresh Kit ─────────────────────────

  "standards-traceability-matrix": {
    kind: "template",
    sections: [
      {
        title: "Standard identity",
        purpose: "Anchor each row to one standard as ratified, so grading targets the text, not folklore about it.",
        fields: [
          "Standard ID and title",
          "Ratified version and date; owner",
          "Requirement summary (what it demands, in one sentence)",
          "Problem it solves (the risk or failure the standard exists to prevent)",
        ],
      },
      {
        title: "Enforcement mapping",
        purpose:
          "Name the tool or process expected to enforce the standard, and what enforcement actually looks like today.",
        fields: [
          "Enforcing tool/process (catalog, DQ engine, policy layer, CI pipeline, manual review)",
          "Enforcement mechanism (blocking control | monitored | manual attestation | none)",
          "Adoption evidence (artifact reference: config export, telemetry, review record)",
        ],
      },
      {
        title: "Grading",
        purpose:
          "Grade each standard for action, including the two lenses generic frameworks lack.",
        fields: [
          "Action grade: clarify | strengthen | simplify | complete",
          "Automatable-as-written (yes / no / with-changes): can a pipeline or agent enforce it, or does ambiguity force human interpretation every time?",
          "Insurance-complete (yes / no / partial): does it account for actuarial DQ expectations (ASOP 23), statutory integrity, NPPI handling?",
          "Evidence for the grade (cite the observed gap)",
        ],
      },
      {
        title: "Disposition",
        purpose: "Convert grades into a prioritized fix list gated on what actually blocks delivery.",
        fields: [
          "Proposed change and rationale",
          "Priority (gates-delivery | pre-scale | opportunistic)",
          "Route (standards council | playbook refresh loop | retire)",
          "Status and target date",
        ],
      },
    ],
  },

  "standards-grading-method": {
    kind: "method",
    steps: [
      {
        name: "Read the standard as an enforcement problem",
        description:
          "For each standard, ask: could a pipeline, agent, or control enforce this exactly as written? Extract every term that requires interpretation ('appropriate', 'timely', 'critical') — each one is a place enforcement will diverge by team.",
        decisionRule:
          "If two reasonable stewards could comply differently in good faith, grade clarify.",
      },
      {
        name: "Test for burden-shaped non-compliance",
        description:
          "Identify standards that solve an audit problem by creating a steward burden that guarantees non-compliance — e.g. 'all data assets shall have complete metadata' across an estate of thousands with no prioritization. These standards produce waivers, not governance.",
        decisionRule:
          "If full compliance costs more steward capacity than the organization possesses, grade simplify — scope it to priority assets with a defensible boundary.",
      },
      {
        name: "Test for the phantom central actor",
        description:
          "Flag standards that assume an actor the operating model does not provide ('the enterprise data owner shall approve…' where no such role is staffed). A standard addressed to nobody is enforced by nobody.",
        decisionRule:
          "If the responsible role is unstaffed or ambiguous across federated teams, grade clarify with a named-role proposal.",
      },
      {
        name: "Test intent-without-threshold",
        description:
          "Find standards stating direction without an enforceable threshold ('data quality shall be monitored' — at what coverage, severity routing, and SLA?). Propose the specific threshold that makes the standard checkable.",
        decisionRule:
          "If compliance cannot be computed from telemetry, grade strengthen and draft the threshold.",
      },
      {
        name: "Check insurance-completeness",
        description:
          "Verify the standard set covers what insurance operations actually require: actuarial data quality expectations (ASOP 23), statutory reporting integrity and tie-outs, NPPI categories beyond generic PII, delegated-authority data (bordereaux), and close-calendar sensitivity. Missing coverage is graded complete.",
      },
      {
        name: "Package findings as proposals, not criticism",
        description:
          "Each finding ships as: the observed text, the failure mode it produces, the evidence, and the proposed rewrite — routed to the refresh loop for validation in a live product before ratification. Candid by design; actionable by construction.",
      },
    ],
  },

  "playbook-refresh-loop": {
    kind: "method",
    steps: [
      {
        name: "Capture change candidates at the point of friction",
        description:
          "Every time a delivery team works around a standard, waives it, or maintains a private 'how we actually do it,' that instance is logged as a refresh candidate with its context — the raw material of playbook improvement.",
      },
      {
        name: "Draft the change against the traceability matrix",
        description:
          "Each candidate becomes a proposed edit to a specific standard, graded through the standards grading method, with the obligation crosswalk checked so a simplification never silently drops a regulatory 'why'.",
        decisionRule:
          "A proposal that weakens a control traced to an obligation requires the compliance partner as co-author, not just reviewer.",
      },
      {
        name: "Validate in a live product",
        description:
          "Apply the proposed standard in at least one in-flight data product: implement it as the product's working rule, run a full cycle, and capture the evidence — effort, compliance rate, breach behavior.",
        decisionRule:
          "A change no live product can pass is returned to drafting; a standard the pilot product cannot pass surfaces as a standards finding, never a silent waiver.",
      },
      {
        name: "Ratify with evidence attached",
        description:
          "Route the validated change to the ratification body with its pilot evidence. The body approves changes that already work, which converts ratification from debate to review.",
      },
      {
        name: "Version, publish, and propagate",
        description:
          "Merge the ratified change into the versioned playbook (docs-as-code), update the traceability matrix row, and propagate to affected definition sets through the normal pipeline. Delivery teams learn of changes as diffs, not memos.",
      },
    ],
  },

  "obligation-crosswalk-register": {
    kind: "template",
    sections: [
      {
        title: "Obligation entries",
        purpose:
          "One row per external obligation the governance program answers to, stated in examiner's terms.",
        fields: [
          "Obligation key and name (e.g. NAIC Model Audit Rule, SOX/ICFR, ASOP 23, GLBA NPPI safeguards, state privacy acts, NAIC AI bulletin)",
          "Authority and jurisdiction",
          "What an examiner actually asks for (evidence expectations)",
          "Applicable sectors and entities",
        ],
      },
      {
        title: "Standard-to-obligation crosswalk",
        purpose:
          "The mapping that gives every internal standard its regulatory 'why' — and shows every obligation which standards and controls evidence it.",
        fields: [
          "Standard ID ↔ obligation key (many-to-many)",
          "Contribution type (directly required | supports evidence | risk-reduction)",
          "Enforcing control and its telemetry reference",
          "Evidence artifact available on demand (yes/no + location)",
        ],
      },
      {
        title: "Gap views",
        purpose:
          "The two directions the register must read: standards without obligations, obligations without standards.",
        fields: [
          "Standards tracing to no obligation → simplification candidates (burden with no regulatory why)",
          "Obligations with no supporting standard/control → findings, with owner and due date",
          "Obligations supported only by manual attestation → automation candidates",
        ],
      },
      {
        title: "Examiner response pack",
        purpose:
          "Pre-assembled filtered views so 'show me how you comply' is an export, not a project.",
        fields: [
          "Per-obligation view: standards, controls, telemetry, evidence links",
          "Change history of the crosswalk itself (versioned)",
          "Named responder per obligation",
        ],
      },
    ],
  },

  // ───────────────────────── VP-08 Governance Performance Index ─────────────────────────

  "gpi-composite-score": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Governance Performance Index (GPI)",
        definition:
          "Composite 0-100 maturity score per data product: the weighted sum of six dimension scores, each computed from live platform telemetry — no self-assessment inputs. Portfolio GPI is the product-weighted rollup.",
        formula:
          "GPI = Σ (dimension_score_i × weight_i) × 100, weights per archetype, Σ weight_i = 1",
        target: ">= 80 to pass the governance gate; portfolio trend published quarterly as a burn-up",
      },
      {
        name: "Classification coverage dimension",
        definition:
          "Share of scanner-identified sensitive columns with approved classification propagated to enforcement.",
        formula: "approved_and_propagated_columns / scanner_flagged_columns",
        target: "1.0 for sensitive-data archetype products (hard floor, weight-independent)",
      },
      {
        name: "CDE control coverage dimension",
        definition:
          "Share of identified CDEs with executing, monitored quality rules whose breaches route to an owner.",
        formula: "cdes_with_executing_routed_rules / identified_cdes",
        target: ">= 0.95 at gate",
      },
      {
        name: "Lineage explainability dimension",
        definition:
          "Share of the product's priority consumption points with complete source-to-consumption trace, rendered or governed-manual.",
        formula: "traceable_priority_outputs / priority_outputs",
        target: ">= 0.9 at gate for report-integrity and reconciliation archetypes",
      },
      {
        name: "Semantic certification dimension",
        definition:
          "Share of the product's published metrics bound to a single certified definition.",
        formula: "metrics_bound_to_certified_definition / published_metrics",
        target: ">= 0.9 at gate; duplicate definitions count against the numerator",
      },
      {
        name: "Stewardship operations dimension",
        definition:
          "Operational health: breach disposition inside SLA, decision latency on agent suggestions, and audit-log completeness for the product.",
        formula:
          "mean(breaches_dispositioned_in_sla_rate, suggestion_decision_in_sla_rate, audit_completeness_rate)",
        target: ">= 0.85 sustained over the trailing 60 days",
      },
    ],
  },

  "gpi-scoring-method": {
    kind: "method",
    steps: [
      {
        name: "Define dimensions and bind each to telemetry",
        description:
          "Fix the six dimensions (classification coverage, catalog curation, semantic certification, CDE control coverage, lineage explainability, stewardship operations) and bind each to its computing events and platform APIs. A dimension without a telemetry source does not enter the index.",
        decisionRule:
          "No dimension scores above zero without machine-verifiable evidence — the anti-gaming rule that makes the index survive audit.",
      },
      {
        name: "Set weights per archetype with written rationale",
        description:
          "Weight dimensions by archetype: a finance/reconciliation product weights lineage and CDE controls higher; a sensitive-data product weights classification and access. Each weight vector carries a written rationale reviewed by the data office.",
        decisionRule:
          "Weights change only at quarter boundaries, with the rationale diff published — mid-quarter weight changes look like score management because they are.",
      },
      {
        name: "Calibrate against a scored reference set",
        description:
          "Hand-score five products of known maturity with an expert panel, then tune dimension anchors until computed GPI ranks them the way the panel does. Calibration disagreements are anchor defects to fix, not panel opinions to average away.",
      },
      {
        name: "Publish with drill-through, not just the number",
        description:
          "Every published GPI links each dimension score to the telemetry that produced it. The first skeptical CFO review is won by drilling from 82 to the exact rules executing and traces rendering behind it.",
      },
      {
        name: "Re-baseline on telemetry changes",
        description:
          "When a new telemetry source or dimension anchor lands, recompute history under the new basis and publish both series across the transition quarter — a silent basis change destroys the index's credibility permanently.",
      },
    ],
  },

  "governance-definition-of-done": {
    kind: "checklist",
    sections: [
      {
        title: "Index and controls",
        items: [
          "GPI at or above the archetype gate threshold, computed from live telemetry",
          "100% of identified CDEs have executing, monitored quality rules",
          "Every rule breach routes to a named owner with disposition tracked in the steward queue",
          "Reconciliation tie-point rules (where the archetype demands them) enforcing, not monitoring-only",
        ],
      },
      {
        title: "Lineage and semantics",
        items: [
          "Priority consumption points trace source-to-consumption — rendered, or manual segments documented to standard",
          "Time-to-diagnose drill completed on one sampled figure, result within target",
          "Published metrics bound to one certified definition each; duplicates retired or scheduled for retirement",
          "Statutory/GAAP basis annotations present wherever the bases diverge",
        ],
      },
      {
        title: "Classification and access",
        items: [
          "All scanner-flagged sensitive attributes carry approved classifications propagated to enforcement",
          "Purpose-based access policies active; per-view grants retired or on a dated retirement list",
          "Masking verified by test against nppi-tagged columns with a non-privileged account",
        ],
      },
      {
        title: "People and pipeline",
        items: [
          "Named trainees have demonstrated a bounded governance task end-to-end on this product, recorded and signed off",
          "The product's definition set is merged and deployed through the CI pipeline — no out-of-band configuration",
          "Audit log replays the product's governance history: suggestions, decisions, deployments, gate evidence",
          "Gate review conducted on evidence links only — no slideware accepted as evidence",
        ],
      },
    ],
  },

  "agent-acceptance-rate": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Agent Suggestion Acceptance Rate",
        definition:
          "Per agent, the share of suggestions approved (with or without edits) by stewards over a 30-day rolling window, from audit-log decision events.",
        formula:
          "(approved + approved_with_edits) / (approved + approved_with_edits + rejected), per agent, 30-day rolling",
        target: ">= 0.70; below 0.60 triggers the bench rule — agent pulled to draft-only until retuned",
      },
      {
        name: "Edit Distance on Accepted Suggestions",
        definition:
          "Mean normalized edit distance between the agent's draft and the approved artifact — the quiet-rejection detector: a high acceptance rate with heavy edits means the drafts are not actually usable.",
        formula: "mean(normalized_edit_distance | decision = approved_with_edits), per agent, 30-day rolling",
        target: "<= 0.25; above 0.40 counts as effective rejection in the bench evaluation",
      },
      {
        name: "Bench-Adjusted Acceptance",
        definition:
          "The acceptance rate with heavily-edited approvals reclassified as rejections — the number the bench rule actually evaluates.",
        formula:
          "(approved + approved_with_edits[edit_distance <= 0.40]) / all_decisions, per agent, 30-day rolling",
        target: ">= 0.65 to stay in active duty; evaluated weekly, bench events logged to the audit trail",
      },
    ],
  },

  // ───────────────────────── VP-09 Steward-as-Supervisor Enablement Kit ─────────────────────────

  "tm-governance-foundations": {
    kind: "curriculum",
    modules: [
      {
        code: "GF-1",
        title: "The operating model you are joining",
        format: "Half-day workshop + reference pack",
        topics: [
          "The ratified standards and playbook: what they demand and why each standard exists",
          "Roles and definitions-of-done: steward, product owner, privacy partner, platform team",
          "The operating cadence: queues, waves, gates, and the close calendar",
          "Where the obligations live: MAR, SOX/ICFR, ASOP 23, NPPI — in steward terms",
        ],
      },
      {
        code: "GF-2",
        title: "Catalog craft in the live estate",
        format: "Hands-on lab (live catalog, pilot product)",
        topics: [
          "Curation workflow: scan results to reviewed, owned, described assets",
          "Business-to-technical association on real policy and claims tables",
          "Writing definitions that certify: single-basis, testable, insurance-correct",
          "Staleness hygiene: what a well-tended catalog looks like after 90 days",
        ],
      },
      {
        code: "GF-3",
        title: "Working from agent drafts",
        format: "Hands-on lab (steward queue, live suggestions)",
        topics: [
          "Meet the agent co-workers: what each drafts and what stays human",
          "The queue as the day's driver: fast-lane, deep-review, breach triage",
          "First supervised decisions: approve, edit, reject with reason codes",
          "Why blank-template authoring is the anti-pattern this model retires",
        ],
      },
    ],
  },

  "tm-cde-quality-classification": {
    kind: "curriculum",
    modules: [
      {
        code: "CQ-1",
        title: "CDE identification and registration",
        format: "Hands-on lab (live product)",
        topics: [
          "CDE criteria in practice: obligation dependency, KPI dependency, reconciliation role",
          "Registering CDEs with quality dimensions that consumers actually depend on",
          "Reviewing agent-proposed CDE candidacy lists: what the classifier sees and misses",
        ],
      },
      {
        code: "CQ-2",
        title: "Quality rules from draft to deployed control",
        format: "Hands-on lab (DQ engine + pipeline)",
        topics: [
          "Reviewing and tuning agent-drafted rules against profiling evidence",
          "Thresholds: calibrating against closed periods before enforcement",
          "Deploying through the code pipeline; monitoring-only to enforcing graduation",
          "Breach routing: from rule failure to owned queue item",
        ],
      },
      {
        code: "CQ-3",
        title: "The classification-to-access chain",
        format: "Hands-on lab (run inside the sensitive-data product in flight)",
        topics: [
          "Insurance NPPI categories: claims medical, SIU/litigation, claimant financial, licensing, EEO-protected",
          "Discovery → steward/privacy approval → catalog label → warehouse tag → policy attribute",
          "Masking verification with a non-privileged account",
          "Handling duties per category: who may see what, for which purpose",
        ],
      },
      {
        code: "CQ-4",
        title: "Capstone: attribute to enforced control",
        format: "Assessed practicum",
        topics: [
          "Take one attribute from 'discovered' to 'classified, controlled, access-enforced' without engineer assistance",
          "Evidence capture for the readiness register",
        ],
      },
    ],
  },

  "tm-lineage-governance-as-code": {
    kind: "curriculum",
    modules: [
      {
        code: "LG-1",
        title: "Lineage that explains itself",
        format: "Hands-on lab (live scanners + priority report)",
        topics: [
          "Scanners and connectors: what renders automatically and where it stops",
          "Gap triage judgment: scanner-covered, connector-buildable, assisted stitch, documented manual",
          "Stitch review: confirming agent-proposed column matches against transformation evidence",
          "Manual segment documentation to the examiner-grade standard",
        ],
      },
      {
        code: "LG-2",
        title: "Governance-as-code fundamentals",
        format: "Hands-on lab (repo + pipeline)",
        topics: [
          "Reading a product definition set: classification chain, CDEs, rules, access, approvals",
          "The pull-request review: what a steward approves and what CI already verified",
          "CI checks as colleagues: schema, referential, obligation linting",
        ],
      },
      {
        code: "LG-3",
        title: "Onboarding a product through the pipeline",
        format: "Assessed practicum (live new-platform onboarding)",
        topics: [
          "Scaffold from archetype; drive PR waves 1-3 (classification, CDEs+rules, lineage+access)",
          "Reviewing a governance PR the way an underwriter reviews a referral — judgment, not process",
          "Gate evidence: reading definition-of-done from merged, deployed definitions",
        ],
      },
    ],
  },

  "tm-agent-supervision-teach-forward": {
    kind: "curriculum",
    modules: [
      {
        code: "AS-1",
        title: "The supervision discipline",
        format: "Scenario drills (simulated queue)",
        topics: [
          "Reading confidence scores: what 0.9 does and does not mean",
          "Rejection judgment: reason codes that retune agents vs. rejections that teach nothing",
          "Threshold tuning: fast-lane boundaries and their acceptance consequences",
          "Audit-log review as a habit: replaying your own week's decisions",
        ],
      },
      {
        code: "AS-2",
        title: "Recognizing drift before the bench rule fires",
        format: "Scenario drills (seeded drift cases)",
        topics: [
          "Drift signatures: rising edit distance, category-specific error clusters, stale vocabulary",
          "When to escalate: retune request vs. bench recommendation",
          "The bench rule mechanics: what benching changes and how an agent returns",
        ],
      },
      {
        code: "AS-3",
        title: "Teach-forward practicum",
        format: "Co-teaching practicum with certification checklist",
        topics: [
          "Co-teach GF and CQ modules to the next cohort under observation",
          "Certification checklist: content accuracy, lab facilitation, assessment judgment",
          "Building the internal teaching bench that carries the model portfolio-wide",
        ],
      },
    ],
  },

  "readiness-demonstration-kit": {
    kind: "template",
    sections: [
      {
        title: "Trainee role card",
        purpose:
          "One card per named trainee: who they are, what role they are training into, and the hands-on participation expected by week — participation is scheduled work, not shadowing.",
        fields: [
          "Trainee name, home team, target role (steward | governance engineer | privacy liaison)",
          "Participation plan by week: labs, live queue shifts, PR reviews, breach triage rotations",
          "Prerequisite modules and completion status",
          "Named mentor and escalation contact",
        ],
      },
      {
        title: "Readiness demonstration checklist",
        purpose:
          "The bounded governance task each trainee must run end-to-end — including supervising agent suggestions — without vendor hands on keyboard.",
        fields: [
          "Task definition (e.g. classify and control one attribute; onboard one dataset's CDEs and rules; triage one day's queue)",
          "Success criteria, machine-checkable where possible",
          "Agent-supervision component: decisions taken, reason codes used, audit trail produced",
          "Allowed assistance (questions permitted; keyboard intervention fails the demonstration)",
        ],
      },
      {
        title: "Recording and sign-off",
        purpose:
          "The format that turns each demonstration into transfer evidence an exit gate can read.",
        fields: [
          "Recording reference (screen capture or observed-session log)",
          "Assessor name and role; date; pass / retry with gap noted",
          "Evidence links: artifacts produced, audit-log event range",
          "Register entry: trainee → demonstrated capability → date → evidence",
        ],
      },
      {
        title: "Transfer register",
        purpose:
          "The living register exit gates read: named people with recorded demonstrations, by capability — the artifact that makes vendors a choice, not a dependency.",
        fields: [
          "Capability × named ready practitioners (minimum bench depth per capability)",
          "Demonstrations scheduled vs. completed, by wave",
          "Gaps flagged where bench depth < minimum",
        ],
      },
    ],
  },

  // ───────────────────────── VP-10 Lineage Gap Triage Method ─────────────────────────

  "lineage-triage-decision-tree": {
    kind: "method",
    steps: [
      {
        name: "Establish the gap inventory",
        description:
          "From the scanner coverage map, list every hop on priority traces that does not render: source-to-staging jumps, hand-coded transformations, spreadsheet interludes, report-edge bindings. Each gap gets its criticality context: which reports, reconciliations, and obligations flow through it.",
      },
      {
        name: "Branch 1 — scanner-covered",
        description:
          "Check whether an existing scanner can reach the gap with configuration work only (scope extension, credential grant, version upgrade). Cheapest branch; take it whenever true.",
        decisionRule: "If configuration alone renders the hop, schedule it in the current sprint — no business case needed.",
      },
      {
        name: "Branch 2 — connector-buildable",
        description:
          "For gaps a scanner cannot reach, estimate connector build and maintenance cost against the criticality of what flows through the hop. A Schedule P feeder clears a different bar than a departmental dashboard.",
        decisionRule:
          "Build the connector when the hop carries statutory reporting, ICFR-relevant reconciliation, or three or more priority traces; otherwise fall through.",
      },
      {
        name: "Branch 3 — assisted stitch",
        description:
          "For unscannable but stable hops, use agent-proposed column-level stitches — matched by name, profile, and transformation evidence — confirmed by a human and tagged agent-assisted in the audit trail.",
        decisionRule:
          "Stitch when the hop is stable (change frequency < quarterly) and evidence supports column-level matching; volatile hops fall through to documentation.",
      },
      {
        name: "Branch 4 — documented manual segment",
        description:
          "Remaining gaps become deliberate manual segments documented to the standard: what the segment connects, plain-language transformation logic, owner, refresh trigger, review cadence — captured in the catalog so the trace reads continuously.",
        decisionRule:
          "Manual is acceptable; undocumented is not. Every branch-4 decision records why automation was declined, in writing.",
      },
      {
        name: "Re-triage on change signals",
        description:
          "Re-run the tree for a segment when its change signals fire: source migration, new scanner capability, gap promoted onto a priority trace, or a manual segment's review finding drift. Triage is a standing loop, not a one-time sort.",
      },
    ],
  },

  "scanner-coverage-map": {
    kind: "template",
    sections: [
      {
        title: "Estate inventory row",
        purpose:
          "One row per node on the priority estate: source systems, pipelines, staging zones, warehouse layers, semantic models, reports — the denominator honesty starts with.",
        fields: [
          "Node ID, name, type (source | pipeline | staging | warehouse | semantic | report)",
          "Product(s) and priority traces the node participates in",
          "Technology and version (drives scanner compatibility)",
        ],
      },
      {
        title: "Coverage status",
        purpose:
          "The rendered-versus-claimed distinction, per node and per edge, that keeps the map honest.",
        fields: [
          "Scanner/connector assigned (or none)",
          "Status: rendered | partial (column-level gaps) | claimed-unverified | not-covered",
          "Last successful scan date; scan cadence",
          "Edge coverage to adjacent nodes (the hops, not just the boxes)",
        ],
      },
      {
        title: "Gap register",
        purpose: "The honest input the triage decision tree consumes.",
        fields: [
          "Gap ID, connecting nodes, and what flows through it (reports, reconciliations, obligations)",
          "Triage branch assigned (scanner-config | connector | stitch | manual) and date",
          "Estimated effort and criticality tier",
          "Owner and target sprint/wave",
        ],
      },
      {
        title: "Maintenance protocol",
        purpose: "Keeps the map current as scanners, connectors, and the estate evolve.",
        fields: [
          "Update triggers: new source onboarded, scanner upgrade, migration event",
          "Review cadence per product (at intake, then quarterly)",
          "Delta log: coverage gained/lost per period — feeds the explainability rate",
        ],
      },
    ],
  },

  "manual-stitch-documentation-standard": {
    kind: "template",
    sections: [
      {
        title: "Segment identification",
        purpose:
          "Name exactly what the manual segment connects so the trace reads continuously where rendering stops.",
        fields: [
          "Segment ID; upstream node/columns; downstream node/columns",
          "Products and priority traces the segment participates in",
          "Why automated lineage was declined (triage branch-4 rationale, dated)",
        ],
      },
      {
        title: "Transformation logic",
        purpose:
          "The plain-language account of what happens across the hop — written for a reviewer who was not in the room, because that is who reads it.",
        fields: [
          "Transformation narrative (plain language, no tool jargon)",
          "Business rules applied (filters, mappings, allocations) with their owners",
          "Reference to code/spreadsheet/job where the logic physically lives",
          "Known exclusions and edge cases",
        ],
      },
      {
        title: "Ownership and refresh",
        purpose: "A manual segment without an owner and a refresh trigger is undocumented with extra steps.",
        fields: [
          "Named owner (role, not person, plus current holder)",
          "Refresh trigger: what change events require re-documentation",
          "Review cadence (quarterly for statutory-trace segments; semi-annual otherwise)",
          "Last review date and reviewer",
        ],
      },
      {
        title: "Catalog registration",
        purpose:
          "The segment lives in the catalog alongside rendered lineage, so an examiner's trace never hits a cliff.",
        fields: [
          "Catalog object reference linking upstream and downstream nodes",
          "Continuity check: trace renders end-to-end with the manual segment inline",
          "Evidence pack link for audit/exam response",
        ],
      },
    ],
  },

  "lineage-explainability-rate": {
    kind: "metric-spec",
    metrics: [
      {
        name: "Lineage Explainability Rate",
        definition:
          "The share of priority-report headline figures with a complete source-to-consumption trace, where 'complete' means every hop is rendered lineage or a governed manual segment documented to standard.",
        formula:
          "figures_with_complete_trace / priority_report_headline_figures, assessed per product and rolled up",
        target: ">= 90% for statutory and ICFR-relevant reports; >= 75% portfolio-wide by end of the program's second wave",
      },
      {
        name: "Time-to-Diagnose (sampled drill)",
        definition:
          "Minutes for a practitioner to trace a randomly sampled suspect figure from report to sources using only the catalog and lineage surfaces — the speed half of the pairing, because coverage without speed means the trace exists but nobody can use it under pressure.",
        formula:
          "median(minutes to complete trace | monthly sample of 3 figures per priority product, timed, observed)",
        target: "<= 30 minutes; > 2 hours on any statutory-trace figure is a finding regardless of the coverage number",
      },
      {
        name: "Governed-Manual Share",
        definition:
          "The share of complete traces that depend on at least one manual segment — a cost and fragility signal, not a failure: rising share on stable traces is fine, rising share on volatile traces predicts explainability decay.",
        formula: "traces_containing_manual_segments / complete_traces",
        target: "Monitored with trend; manual segments on volatile hops flagged for re-triage",
      },
    ],
  },

  // ───────────────────────── VP-11 Insurance NPPI/PII Playcard ─────────────────────────

  "insurance-nppi-taxonomy": {
    kind: "reference-data",
    sets: [
      {
        name: "Insurance NPPI sensitivity categories",
        codes: [
          {
            code: "nppi-medical",
            label: "Claims medical content",
            note: "Diagnosis/treatment records in claim files (injury, disability, bodily-injury liability). Statutory handling duties; masked outside claims-handling, SIU, and litigation purposes.",
          },
          {
            code: "nppi-siu-litigation",
            label: "SIU and litigation material",
            note: "Fraud investigation flags, referral narratives, counsel work product. Access restricted to SIU/legal purpose; existence of the flag is itself sensitive.",
          },
          {
            code: "nppi-claimant-financial",
            label: "Claimant financial data",
            note: "Bank details, wage records, settlement amounts of claimants — who are often not customers, so consent-based framings do not fit. GLBA-safeguard treatment regardless.",
          },
          {
            code: "nppi-government-id",
            label: "Government identifiers",
            note: "SSN/TIN, driver's license numbers (rating and claims), passport IDs. Full masking by default; last-4 display only with purpose approval.",
          },
          {
            code: "nppi-financial-account",
            label: "Policyholder financial accounts",
            note: "Premium payment instruments, EFT details, policy loan balances. Classic GLBA NPPI.",
          },
          {
            code: "nppi-licensing",
            label: "Producer and adjuster licensing records",
            note: "License numbers, appointment records, CE status, disciplinary history — regulated by state DOIs and personal to the license holder.",
          },
          {
            code: "nppi-producer-comp",
            label: "Producer compensation",
            note: "Commission statements, production credit, bonus arrangements. Commercially and personally sensitive; row-level access by hierarchy position.",
          },
          {
            code: "eeo-protected",
            label: "EEO-protected workforce attributes",
            note: "Ethnicity, gender, disability, veteran status in HR and benefits data. Aggregate-only outside the EEO-reporting purpose.",
          },
          {
            code: "nppi-health-benefits",
            label: "Group benefits health data",
            note: "Enrollment and claims data in benefits administration that may carry PHI where the carrier acts in a HIPAA-covered capacity.",
          },
        ],
      },
      {
        name: "Access purpose codes",
        codes: [
          {
            code: "claims-handling",
            label: "Claims adjudication and payment",
            note: "Unmasked medical and financial access limited to assigned-claim scope.",
          },
          {
            code: "siu",
            label: "Special investigations",
            note: "Full claim-file access including flags; every access logged and reviewable.",
          },
          {
            code: "litigation",
            label: "Litigation support",
            note: "Matter-scoped access; legal hold interplay documented.",
          },
          {
            code: "actuarial-analytics",
            label: "Actuarial and analytics use",
            note: "De-identified or masked by default; re-identification requires privacy-partner approval.",
          },
          {
            code: "eeo-reporting",
            label: "EEO and regulatory workforce reporting",
            note: "The only purpose with row-level EEO-attribute access; approver: privacy partner.",
          },
          {
            code: "producer-management",
            label: "Distribution and licensing management",
            note: "Licensing and appointment records; compensation visibility scoped by hierarchy.",
          },
        ],
      },
    ],
  },

  "classification-to-access-chain": {
    kind: "method",
    steps: [
      {
        name: "Discover and propose",
        description:
          "Automated scanners (and the CDE Classifier agent) sweep in-scope schemas and propose sensitivity labels from the insurance NPPI taxonomy, with evidence: pattern hits, column profiles, and context (a 'diagnosis_code' in a claims schema is not the one in a product table).",
        decisionRule:
          "Proposals are drafts. Nothing propagates on a scanner's say-so — a hit without approval protects nothing and blocks nothing.",
      },
      {
        name: "Approve with the right pair of eyes",
        description:
          "Stewards adjudicate proposals; privacy partners co-approve every nppi-* and eeo-protected label and its access-policy consequences. Approval happens once, in the definition set, not per tool.",
        decisionRule:
          "Privacy-partner approval is a hard gate for sensitive categories — steward approval alone deploys nothing sensitive.",
      },
      {
        name: "Propagate as code",
        description:
          "The approved label deploys through the pipeline to every enforcement point in one chain: catalog annotation (people), warehouse tags and masking DDL (platform), and attribute-based access policy (enforcement layer). One approval, three surfaces, zero drift.",
      },
      {
        name: "Replace per-view provisioning with purpose-based policy",
        description:
          "Access requests stop being 'grant me view X' and become 'role R, purpose P' evaluated against policy attributes. Provisioning drops from weeks of view engineering to policy evaluation; every decision is replayable for audit.",
        decisionRule:
          "A new per-view grant on sensitive data after the policy layer is live requires a written exception — it is the chain regressing.",
      },
      {
        name: "Verify enforcement, not configuration",
        description:
          "Test masking and row policies with a non-privileged account per purpose profile. Configuration says what should happen; the test says what does. Capture the test as gate evidence.",
      },
      {
        name: "Retire duplicate views against governed access",
        description:
          "Inventory the shadow copies and bespoke views that grew up around slow provisioning; migrate consumers to governed access and retire the copies on a dated list. Each retired view is a future audit finding that never happens.",
        decisionRule:
          "Retirement is complete when the view is gone, not when consumers are notified — track deletion, not communication.",
      },
    ],
  },

  "metadata-only-agent-boundary": {
    kind: "checklist",
    sections: [
      {
        title: "Architectural boundary — verify by construction",
        items: [
          "Agent service accounts hold no SELECT on record-bearing tables in claim, party, billing, or employee-hr schemas — metadata catalogs, profiling outputs, and configuration APIs only",
          "Profiling outputs consumed by agents are statistical (counts, distributions, patterns) with small-cell suppression: no value lists over sensitive columns",
          "No agent prompt or context window is constructed from bulk record data; context builders read metadata stores exclusively",
          "Agent runtime operates inside the client boundary (platform-native AI or hosted LLM within the tenant); no NPPI-adjacent metadata leaves the boundary",
          "Egress rules on agent runtimes block record-store endpoints at the network layer — the boundary holds even if a credential is misconfigured",
        ],
      },
      {
        title: "Privacy office review questions for any proposed agent",
        items: [
          "What exact inputs does the agent read, and can each be produced without record access?",
          "What is the blast radius if the agent's account is compromised — what could that credential reach?",
          "Where does inference run, and does any input or output cross the client boundary?",
          "What does the agent retain between tasks, and who can inspect that memory?",
          "How is the metadata-only claim tested — is there a standing probe, or only an architecture diagram?",
          "What is the bench procedure if the agent drifts, and who can invoke it?",
        ],
      },
      {
        title: "Development and test environments",
        items: [
          "Development uses masked or synthetic data generated to schema and distribution, never production extracts",
          "Synthetic claim files include synthetic medical and SIU content so classification logic is testable without real NPPI",
          "Promotion gates verify no production connection strings or credentials exist in dev agent configurations",
          "Any exception granting an agent record-level access (none expected) is time-boxed, logged, and privacy-partner approved in writing",
        ],
      },
    ],
  },

  "nppi-incident-protocol": {
    kind: "template",
    sections: [
      {
        title: "Detection and classification",
        purpose:
          "Recognize an NPPI exposure event on the governance program's own surface — catalogs, pipelines, agent operations, dev environments — and size it fast.",
        fields: [
          "Detection source (access-log anomaly, masking-test failure, drift finding, report, agent-boundary probe)",
          "Data categories involved (from the NPPI taxonomy) and estimated subject count",
          "Exposure vector: unmasked access | mis-scoped grant | duplicate view | dev-data leak | agent-boundary breach",
          "Severity tier and on-call roles engaged (privacy partner, security, program lead)",
        ],
      },
      {
        title: "Containment (first hour)",
        purpose: "Scripted first moves so the first hour is execution, not improvisation.",
        fields: [
          "Revoke or suspend the offending grant/policy/view (command reference per platform)",
          "Snapshot access logs before any remediation changes them",
          "Freeze affected pipeline or agent (bench procedure reference)",
          "Open the incident record with timestamped actions log",
        ],
      },
      {
        title: "Notification decision tree",
        purpose:
          "Statutory and contractual notification duties evaluated deliberately, on time, with counsel — not guessed at under pressure.",
        fields: [
          "State breach-notification statute check (subjects' states of residence drive the clock)",
          "GLBA safeguards / regulator notice evaluation with counsel",
          "HIPAA breach assessment where benefits/medical data is in scope",
          "Contractual duties: reinsurers, TPAs, delegated partners with notice clauses",
          "Decision log: notify / not notify, basis, decider, timestamp",
        ],
      },
      {
        title: "Evidence preservation",
        purpose: "Align incident evidence to the unified audit log so the record is complete and tamper-evident.",
        fields: [
          "Audit-log event range preserved (sequence numbers, hashes)",
          "Access-log extracts, policy states before/after, affected object inventory",
          "Chain of custody for extracts shared with counsel or regulators",
        ],
      },
      {
        title: "Post-incident feedback loop",
        purpose:
          "The incident improves the controls that missed it — classification, policy, and monitoring — through the normal pipeline.",
        fields: [
          "Root cause mapped to the chain stage that failed (discovery, approval, propagation, enforcement, retirement)",
          "Definition-set changes raised as PRs (new labels, tightened policies, new probes)",
          "Detection gap: what standing test would have caught this earlier — implemented, not recommended",
          "Close-out review with privacy office; lessons registered in the playbook refresh loop",
        ],
      },
    ],
  },
};
