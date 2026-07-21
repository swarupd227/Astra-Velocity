import type { Kpi } from "../types";

/**
 * Insurance KPIs as data-governance artifacts.
 *
 * Client-generic. Each entry names the correct formula, why the metric breaks
 * when governance is weak, and the critical data elements (CDEs) it depends on.
 */
export const KPIS: Kpi[] = [
  {
    key: "loss-ratio",
    name: "Loss Ratio",
    formula: "incurred losses ÷ earned premium",
    description:
      "The core measure of underwriting profitability: how much of each premium dollar is consumed by losses. It goes wrong quietly when governance is weak — claims miscoded to the wrong line of business, case reserves double-counted with paid amounts, ceded recoveries applied inconsistently between numerator and denominator, or earned premium computed on a different as-of basis than incurred losses. A loss ratio that moves because of data drift rather than experience misleads pricing, reserving, and reinsurance decisions simultaneously.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety"],
    dataDomains: ["claim", "reserve", "premium", "policy"],
    cdeHints: [
      "paid loss by claim and transaction date",
      "case reserve balances as of the evaluation date",
      "IBNR allocation by line of business",
      "earned premium by line/segment",
      "gross vs net (ceded) basis flags",
      "line-of-business and accident-date coding on claims",
    ],
  },
  {
    key: "combined-ratio",
    name: "Combined Ratio",
    formula: "(incurred losses + LAE) ÷ earned premium + underwriting expenses ÷ written premium (trade basis; statutory basis divides expenses by earned premium)",
    description:
      "The headline P&C profitability metric — under 100% means underwriting profit. Because it stitches together claims, premium, and expense data from different systems, it is a lineage stress test: the loss component and expense component are often computed on different premium bases, and inconsistent treatment (trade vs statutory) or misallocated expenses make the published figure irreproducible. When examiners or rating agencies ask how a reported combined ratio ties from source to statement, weak lineage turns a one-day answer into a multi-week reconstruction.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety"],
    dataDomains: ["claim", "reserve", "premium", "financials-gl", "policy"],
    cdeHints: [
      "incurred loss and LAE by segment",
      "earned and written premium by segment",
      "underwriting expense allocations from the GL",
      "expense basis flag (trade vs statutory)",
      "segment/line-of-business hierarchy mappings",
    ],
  },
  {
    key: "expense-ratio",
    name: "Expense Ratio",
    formula: "underwriting expenses ÷ net written premium (trade basis) or ÷ net earned premium (statutory basis)",
    description:
      "Measures the cost of acquiring and administering business. Its accuracy hinges on expense allocation rules that live in the general ledger — commission accruals, cost-center-to-line-of-business mappings, and the split between underwriting and loss adjustment expense. When allocation keys are undocumented or maintained in ungoverned spreadsheets, the ratio shifts between periods for reasons no one can explain, and expense reduction programs get credited or blamed incorrectly.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety", "brokerage-mga"],
    dataDomains: ["financials-gl", "premium", "producer-distribution"],
    cdeHints: [
      "underwriting expense by GL account and cost center",
      "commission and brokerage expense accruals",
      "cost allocation keys to line of business",
      "net written and net earned premium",
    ],
  },
  {
    key: "lae-ratio",
    name: "LAE Ratio",
    formula: "loss adjustment expenses (DCC + A&O) ÷ earned premium",
    description:
      "Tracks the cost of settling claims — defense and cost containment plus adjusting and other expenses — relative to premium. It corrupts easily because LAE classification is judgment-heavy: legal invoices coded as loss instead of DCC, TPA fees allocated inconsistently across claims, or allocated vs unallocated splits differing between the claims system and the ledger. Misclassified LAE distorts both this ratio and Schedule P, where DCC development is separately triangulated.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance"],
    dataDomains: ["claim", "premium", "financials-gl"],
    cdeHints: [
      "DCC payments by claim",
      "A&O expense allocations",
      "loss vs expense classification codes on claim transactions",
      "TPA fee assignments to claims",
      "earned premium by line",
    ],
  },
  {
    key: "written-premium",
    name: "Written Premium",
    formula: "sum of premium transactions (new, renewal, endorsement, audit, cancellation) booked in the period, gross or net of cessions",
    description:
      "The top-line production measure. It is a transactional sum, so its integrity depends entirely on transaction hygiene: endorsements and cancellations posted with wrong effective dates, premium audits booked late, flat cancellations netted incorrectly, or duplicate bookings during system migrations all inflate or deflate the figure. Because written premium feeds earned premium, unearned reserves, commissions, and premium taxes, one ungoverned transaction type propagates error into four downstream statements.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety", "brokerage-mga", "life-annuities", "health-benefits"],
    dataDomains: ["premium", "policy", "reinsurance-cession"],
    cdeHints: [
      "premium transaction amount and type (new/renewal/endorsement/audit/cancel)",
      "transaction booking date vs effective date",
      "policy and term identifiers",
      "ceded premium by treaty/facultative placement",
      "currency and gross/net basis flags",
    ],
  },
  {
    key: "earned-premium",
    name: "Earned Premium",
    formula: "written premium − change in unearned premium reserve (i.e. premium earned pro-rata or per the earning pattern over the coverage period)",
    description:
      "The denominator of nearly every profitability ratio, so an earning error taints the whole KPI stack. Earning depends on accurate policy effective and expiration dates and the right earning basis — pro-rata for most lines, but exposure-based curves for lines like warranty or credit. Weak governance shows up as premium earned past cancellation dates, endorsements earned from the wrong date, or mid-term date corrections that silently restate prior-period earnings without an audit trail.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety", "life-annuities", "health-benefits"],
    dataDomains: ["premium", "policy", "financials-gl"],
    cdeHints: [
      "policy effective/expiration dates",
      "written premium by transaction type",
      "earning pattern/basis",
      "cancellation and endorsement transactions",
      "unearned premium reserve balances",
    ],
  },
  {
    key: "policies-in-force",
    name: "Policies In Force (PIF)",
    formula: "count of active policies as of a point in time (status = in force, effective date ≤ as-of date < expiration/termination date)",
    description:
      "The simplest-sounding metric in insurance and one of the most disputed, because 'a policy' is a semantic-layer question: master policies vs certificates, multi-vehicle policies vs vehicles, reinstatements, and pending-cancel statuses all change the count. When definitions are ungoverned, marketing, finance, and operations report different PIF numbers from different systems, and growth targets get managed against a figure no two departments can reconcile.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "life-annuities", "health-benefits", "surety"],
    dataDomains: ["policy", "product", "party"],
    cdeHints: [
      "policy status and status effective date",
      "policy effective/expiration dates",
      "counting unit definition (policy vs certificate vs exposure unit)",
      "reinstatement and pending-cancellation flags",
    ],
  },
  {
    key: "retention-ratio",
    name: "Retention Ratio",
    formula: "policies renewed ÷ policies eligible for renewal (count basis) or renewal premium retained ÷ expiring premium (premium basis)",
    description:
      "Measures how much of the book survives renewal — a leading indicator of both franchise health and pricing adequacy. It goes wrong when the denominator is dirty: policies rewritten under new numbers counted as lost business, mid-term cancellations left in the eligible base, non-renewals initiated by the carrier mixed with customer defections, or agency book rolls misclassified. Without governed renewal linkage between old and new policy terms, retention is systematically understated and the business chases a churn problem it does not have.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "brokerage-mga", "health-benefits"],
    dataDomains: ["policy", "premium", "party", "producer-distribution"],
    cdeHints: [
      "renewal linkage between expiring and renewing policy terms",
      "policy termination reason codes",
      "eligible-for-renewal population definition",
      "expiring vs renewal premium",
      "rewrite/re-book indicators",
    ],
  },
  {
    key: "quote-to-bind",
    name: "Quote-to-Bind Ratio",
    formula: "policies bound ÷ quotes issued (in period, by segment)",
    description:
      "The conversion measure of the sales funnel and a key read on price competitiveness. It is distorted by duplicate quotes for the same risk (multiple raters, comparative platforms, agent re-quotes), inconsistent quote-status definitions, and broken linkage between the quote and the eventually bound policy. Without party and submission resolution across quoting systems, the denominator inflates and conversion looks artificially weak — driving unnecessary rate or commission actions.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "brokerage-mga", "life-annuities"],
    dataDomains: ["policy", "product", "party", "producer-distribution"],
    cdeHints: [
      "quote identifier and status lifecycle",
      "quote-to-policy linkage keys",
      "duplicate-submission resolution (same risk, multiple quotes)",
      "producer/channel attribution on quotes",
      "quote and bind timestamps",
    ],
  },
  {
    key: "stp-rate",
    name: "Straight-Through Processing Rate",
    formula: "transactions completed with zero manual touches ÷ total transactions (by transaction type)",
    description:
      "Measures automation leverage in new business, endorsements, or claims intake. The metric is only as honest as the touch telemetry: if manual interventions are not logged consistently across systems, or if 'touch' is defined differently by workflow, STP is overstated and headcount planning is wrong. Root-cause analysis of STP fallout is itself a data governance exercise — most fallout traces to missing or failed-validation data elements on the inbound transaction.",
    sectorKeys: ["pc-personal", "pc-commercial", "life-annuities", "health-benefits", "brokerage-mga"],
    dataDomains: ["policy", "claim", "billing", "product"],
    cdeHints: [
      "transaction type and completion status",
      "manual-touch/intervention event logs",
      "validation failure reason codes",
      "workflow queue and reassignment history",
    ],
  },
  {
    key: "loss-development-factor",
    name: "Loss Development Factor (LDF)",
    formula: "cumulative losses at development age n+1 ÷ cumulative losses at development age n (age-to-age factor)",
    description:
      "The building block of triangle-based reserving: how losses for an accident period grow as claims mature. LDFs are exquisitely sensitive to data instability — a change in case reserving philosophy, claims reclassified between lines, late-processed transactions landing in the wrong evaluation snapshot, or a book acquired mid-triangle all masquerade as development pattern shifts. Without immutable, consistently snapshotted evaluation-date data, actuaries select factors off noise and reserves inherit the error.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety"],
    dataDomains: ["claim", "reserve", "policy"],
    cdeHints: [
      "cumulative paid and incurred losses by accident period and evaluation date",
      "accident/occurrence date on claims",
      "consistent line-of-business coding across the triangle history",
      "evaluation-date snapshot integrity (no restated history)",
      "large-loss and catastrophe flags",
    ],
  },
  {
    key: "ibnr-adequacy",
    name: "IBNR Adequacy",
    formula: "held IBNR ÷ actuarially indicated IBNR; monitored via actual vs expected emergence of reported losses",
    description:
      "Tests whether the reserve for incurred-but-not-reported losses is sufficient — the difference between a stable balance sheet and adverse development. Weak governance undermines it from two directions: the indicated IBNR rests on triangles corrupted by coding drift, and the actual-vs-expected monitoring breaks when claim report dates are backdated, batch-loaded, or missing. If earned exposure data lags or premium is misallocated, the expected-emergence baseline itself is wrong, and management learns about reserve inadequacy from the auditors instead of the dashboard.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "surety", "health-benefits"],
    dataDomains: ["reserve", "claim", "premium", "financials-gl"],
    cdeHints: [
      "held IBNR by line and accident period",
      "claim report date and accident date",
      "actual reported loss emergence by period",
      "earned premium/exposure by accident period",
      "reserve study indicated ranges and selections",
    ],
  },
  {
    key: "cession-rate",
    name: "Cession Rate",
    formula: "ceded written premium ÷ gross written premium",
    description:
      "Shows how much of the book is passed to reinsurers — a lever of capital management and net volatility. It misstates when treaty terms are captured inconsistently (subject premium bases, line-of-business inuring order), facultative placements are recorded outside the cession system, or gross premium is restated without recomputing cessions. Because ceded premium drives ceding commission income and reinsurance recoverables, a cession-coding error flows straight into both the income statement and counterparty credit exposure.",
    sectorKeys: ["pc-commercial", "specialty-es", "reinsurance", "pc-personal", "surety", "life-annuities"],
    dataDomains: ["reinsurance-cession", "premium", "policy"],
    cdeHints: [
      "ceded premium by treaty and facultative certificate",
      "gross written premium (subject premium basis)",
      "treaty terms: cession percentage, limits, inuring order",
      "policy-to-treaty attachment mapping",
    ],
  },
  {
    key: "net-retention",
    name: "Net Retention",
    formula: "gross exposure or premium per risk − ceded amounts = net amount retained per risk/event (monitored against board-approved retention limits)",
    description:
      "The amount of loss the company keeps on any one risk or event after all reinsurance — the number the board actually set an appetite for. It fails when exposure data is fragmented: the same insured written by two underwriting teams without party resolution, facultative certificates not linked to the underlying policy, or treaty exhaustion not tracked in real time. The failure mode is discovered at claim time, when a 'fully protected' large loss turns out to be net because the cession was never booked.",
    sectorKeys: ["pc-commercial", "specialty-es", "reinsurance", "surety"],
    dataDomains: ["reinsurance-cession", "exposure", "policy", "party", "coverage"],
    cdeHints: [
      "gross line/limit per risk",
      "ceded amounts by layer and reinsurer",
      "party resolution across policies (single-insured aggregation)",
      "treaty capacity and exhaustion tracking",
      "event/peril aggregation keys for accumulation",
    ],
  },
  {
    key: "medical-loss-ratio",
    name: "Medical Loss Ratio (MLR)",
    formula: "(incurred medical claims + quality improvement expenses) ÷ (premium revenue − taxes and regulatory fees), per ACA rebate formula with credibility adjustment",
    description:
      "A regulatory ratio with teeth: ACA rules require 80% (individual/small group) or 85% (large group) MLR, with rebates owed to policyholders when the ratio falls short — so the classification of every expense as claims, quality improvement, or administration is a compliance decision, not an accounting preference. Weak governance over expense categorization, claims run-out completion, or market-segment assignment of premium produces misfiled MLR reports, miscalculated rebates, and CMS or state DOI scrutiny. US-specific; state programs layer additional MLR rules.",
    sectorKeys: ["health-benefits"],
    dataDomains: ["claim", "premium", "financials-gl", "policy", "reference-regulatory"],
    cdeHints: [
      "incurred medical claims with run-out/completion estimates",
      "quality improvement expense classification",
      "premium by ACA market segment (individual/small/large group) and state",
      "taxes and regulatory fees deducted from revenue",
      "member months by segment",
    ],
  },
  {
    key: "persistency",
    name: "Persistency Rate",
    formula: "policies (or premium) remaining in force at period end ÷ policies in force at period start, by policy duration cohort (e.g. 13-month persistency)",
    description:
      "The life-insurance analogue of retention: whether policies stay on the books long enough to recover acquisition costs and validate pricing lapse assumptions. It is corrupted by inconsistent status coding — lapses vs surrenders vs conversions vs reinstatements — and by broken duration cohorting when issue dates are corrected without recomputing cohort membership. Since persistency experience feeds PBR lapse assumptions and embedded value, ungoverned status data quietly propagates into reserves and product profitability.",
    sectorKeys: ["life-annuities", "health-benefits"],
    dataDomains: ["policy", "premium", "product", "party"],
    cdeHints: [
      "policy status and status change reason (lapse/surrender/conversion/reinstatement)",
      "issue date and duration cohort assignment",
      "premium mode and paid-to date",
      "face amount/annualized premium in force",
    ],
  },
  {
    key: "surrender-rate",
    name: "Surrender Rate",
    formula: "surrendered policies (or surrendered account value) ÷ average policies (or account value) in force over the period",
    description:
      "A liquidity and behavior metric for life and annuity books — surging surrenders in a rising-rate environment can stress liquidity and invalidate profitability assumptions. It misreports when partial withdrawals are conflated with full surrenders, surrender-charge-period data is wrong, or 1035 exchanges are not distinguished from ordinary surrenders. Because surrender experience calibrates dynamic-lapse assumptions in valuation and hedging models, data defects here compound into asset-liability management error.",
    sectorKeys: ["life-annuities"],
    dataDomains: ["policy", "premium", "product", "financials-gl"],
    cdeHints: [
      "surrender transaction type (full/partial/1035 exchange)",
      "account value at surrender and average in-force account value",
      "surrender charge schedule and remaining charge period",
      "policy duration at surrender",
      "distribution channel and product cohort",
    ],
  },
  {
    key: "ibor-abor-break-rate",
    name: "IBOR/ABOR Break Rate",
    formula: "positions with unreconciled differences between the investment book of record and the accounting book of record ÷ total positions (by break age and materiality)",
    description:
      "Measures agreement between the front-office investment book of record and the accounting book of record that feeds statutory and GAAP statements. Breaks arise from timing differences, corporate actions applied in one book but not the other, security-master mismatches, and pricing-source divergence. When breaks age without governed ownership and root-cause coding, Schedule D accuracy, RBC, and investment income are all suspect — and quarter-end becomes a manual reconciliation scramble.",
    sectorKeys: ["investments", "life-annuities", "pc-commercial", "pc-personal", "reinsurance"],
    dataDomains: ["financials-gl", "reference-regulatory", "product"],
    cdeHints: [
      "security identifiers (CUSIP/ISIN) on both books",
      "position quantity and book value per book of record",
      "pricing source and price per book",
      "corporate action processing status",
      "break age, owner, and root-cause code",
    ],
  },
  {
    key: "commission-accuracy",
    name: "Commission Accuracy",
    formula: "commission payments matching the contracted schedule ÷ total commission payments (or: absolute commission variance ÷ total commission paid)",
    description:
      "Whether producers are paid exactly what their agreements say — a metric that sits on top of the messiest data in distribution. It fails when producer hierarchies are stale (payments routed to a departed agent's code), commission schedules are versioned in spreadsheets, policy-to-producer attribution is wrong at endorsement, or overrides and contingent bonuses are computed off ungoverned production data. The cost is double: leakage from overpayment and channel attrition from underpayment disputes that take weeks to research.",
    sectorKeys: ["brokerage-mga", "pc-personal", "pc-commercial", "life-annuities", "health-benefits", "specialty-es"],
    dataDomains: ["producer-distribution", "premium", "policy", "party", "financials-gl"],
    cdeHints: [
      "producer code and hierarchy (agent → agency → master) with effective dates",
      "commission schedule/rate version applicable to the transaction",
      "policy-to-producer attribution per transaction",
      "commissionable premium basis",
      "license and appointment status at time of sale",
    ],
  },
  {
    key: "close-cycle-time",
    name: "Financial Close Cycle Time",
    formula: "business days from period end to close milestone (subledger close, GL close, reporting/filing submission)",
    description:
      "How long it takes to produce trustworthy financials — the operational bellwether of finance data health. Long or volatile closes are almost always a data governance symptom: late-arriving feeds, manual reconciliations between admin systems and the ledger, unowned suspense accounts, and spreadsheet-based adjustments that must be rebuilt every quarter. Every day shaved off the close is a day earned for analysis, and every close that slips risks statutory filing deadlines.",
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
    dataDomains: ["financials-gl", "premium", "claim", "billing"],
    cdeHints: [
      "close milestone completion timestamps by task",
      "interface/feed arrival times vs schedule",
      "reconciliation break counts and aging at close",
      "manual journal entry volume and reason codes",
      "suspense account balances at close",
    ],
  },
  {
    key: "claims-frequency",
    name: "Claims Frequency",
    formula: "claim counts ÷ earned exposure units (e.g. claims per 100 car-years, per policy-year)",
    description:
      "How often losses occur per unit of exposure — half of the pure-premium decomposition that drives pricing. It corrupts on both ends: claim counts inflate when reopened claims, claimant-level records, or coverage-level features are counted inconsistently as 'claims,' and the exposure denominator breaks when exposure bases are miscoded or earned exposure is not maintained at the same granularity as claims. Frequency trends built on unstable count definitions send rate indications in the wrong direction.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "health-benefits", "reinsurance"],
    dataDomains: ["claim", "exposure", "policy", "coverage"],
    cdeHints: [
      "claim count definition (claim vs claimant vs coverage feature)",
      "reopened and reclassified claim handling",
      "earned exposure units by base (car-years, payroll, TIV, member months)",
      "accident date and coverage mapping",
      "zero-payment/CWP claim treatment in counts",
    ],
  },
  {
    key: "claims-severity",
    name: "Claims Severity",
    formula: "incurred losses ÷ claim counts (average cost per claim, on a consistent count and evaluation basis)",
    description:
      "The average cost of a claim — the other half of pure premium and the metric most sensitive to definitional drift, since it inherits every defect of both incurred losses and claim counts. Severity trends distort when large losses are not flagged and capped consistently, LAE is sometimes included and sometimes not, count definitions shift, or salvage and subrogation recoveries post to different periods than the loss. Governance failures here masquerade as social inflation or benefit-trend signals and trigger mispriced rate actions.",
    sectorKeys: ["pc-personal", "pc-commercial", "specialty-es", "reinsurance", "health-benefits"],
    dataDomains: ["claim", "reserve", "coverage", "policy"],
    cdeHints: [
      "incurred loss per claim (paid + case, consistent LAE treatment)",
      "claim count basis consistent with the frequency metric",
      "large-loss flags and capping thresholds",
      "salvage and subrogation recovery transactions",
      "evaluation date consistency between numerator and denominator",
    ],
  },
];
