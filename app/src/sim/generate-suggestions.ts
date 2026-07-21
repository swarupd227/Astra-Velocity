import { hashSeed, mulberry32 } from "./engine";

/**
 * Deterministic agent-suggestion drafting. Pure: given the same seed key the
 * same drafts come out in the same order, so "Run agents" is reproducible in a
 * demo. The server action layers DB state on top (pending cap, dedupe).
 */

export type SuggestionKind =
  | "glossary-term"
  | "dq-rule"
  | "classification"
  | "lineage-stitch"
  | "triage"
  | "drift-flag";

export interface SuggestionDraft {
  agentKey: string;
  kind: SuggestionKind;
  title: string;
  payload: Record<string, unknown>;
  /** 0.55 – 0.98 */
  confidence: number;
}

interface AgentTemplate {
  agentKey: string;
  kind: SuggestionKind;
  items: Array<{ title: string; payload: Record<string, unknown> }>;
}

const OWNERS = ["M. Osei", "T. Nguyen", "R. Castillo", "J. Whitfield", "A. Kaplan", "S. Iyer"];

const TEMPLATES: AgentTemplate[] = [
  {
    agentKey: "glossary-scout",
    kind: "glossary-term",
    items: [
      {
        title: "Glossary term: Incurred But Not Reported (IBNR)",
        payload: {
          term: "Incurred But Not Reported (IBNR)",
          definition:
            "Reserve estimate for claims where the loss event has occurred but no claim has yet been reported to the carrier, including provision for future development on known claims.",
          domain: "reserve",
          evidence: "Matched columns ibnr_amt, ibnr_rsv_amt across 4 actuarial marts.",
        },
      },
      {
        title: "Glossary term: Written Premium",
        payload: {
          term: "Written Premium",
          definition:
            "Total premium on policies issued during a period, before adjusting for the portion not yet earned; the top-line production measure for underwriting.",
          domain: "premium",
          evidence: "wrtn_prem_amt profiled in 11 tables; 3 conflicting local definitions found.",
        },
      },
      {
        title: "Glossary term: Combined Ratio",
        payload: {
          term: "Combined Ratio",
          definition:
            "Loss ratio plus expense ratio; underwriting profitability measure where a value below 100% indicates an underwriting profit.",
          domain: "financials-gl",
          evidence: "Derived measure in 6 executive reports with 2 divergent formulas.",
        },
      },
      {
        title: "Glossary term: Cession",
        payload: {
          term: "Cession",
          definition:
            "The portion of risk a ceding insurer transfers to a reinsurer under a treaty or facultative agreement, with its associated premium.",
          domain: "reinsurance-cession",
          evidence: "ceded_prem_amt and cession_pct linked across treaty register and GL feed.",
        },
      },
      {
        title: "Glossary term: Earned Premium",
        payload: {
          term: "Earned Premium",
          definition:
            "The portion of written premium allocable to the expired portion of the policy term — the revenue measure that pairs with incurred losses.",
          domain: "premium",
          evidence: "ernd_prem_amt reconciles to GL 4010 within 0.3% for 8 of 9 months profiled.",
        },
      },
      {
        title: "Glossary term: Subrogation",
        payload: {
          term: "Subrogation",
          definition:
            "The carrier's right to recover claim payments from a third party responsible for the loss; recoveries offset incurred losses.",
          domain: "claim",
          evidence: "subro_rcvry_amt present in claims core and recovery ledger with matching profile.",
        },
      },
      {
        title: "Glossary association: wrtn_prem_amt → Written Premium",
        payload: {
          term: "Written Premium",
          association: "PL_PREM.wrtn_prem_amt",
          definition: "Business-to-technical association proposal from scan metadata.",
          domain: "premium",
          evidence: "Name, profile shape, and lineage proximity all match the certified term.",
        },
      },
      {
        title: "Glossary term: Policy In Force (PIF)",
        payload: {
          term: "Policy In Force (PIF)",
          definition:
            "Count of active policies at a point in time; the base denominator for retention and growth measures.",
          domain: "policy",
          evidence: "pif_cnt appears in 5 distribution dashboards with consistent grain.",
        },
      },
    ],
  },
  {
    agentKey: "rule-smith",
    kind: "dq-rule",
    items: [
      {
        title: "DQ rule: earned premium reconciles to GL",
        payload: {
          ruleKey: "earned_premium_reconciliation",
          expression: "|sum(earned_premium) - GL_4010.balance| < 0.5%",
          capability: "data_quality",
          severity: "critical",
          obligation: "SOX ICFR tie-point",
          evidence: "Historical drift 0.2–0.4% except month-end batch reruns.",
        },
      },
      {
        title: "DQ rule: COPE completeness on property book",
        payload: {
          ruleKey: "cope_completeness_property",
          expression: "completeness(construction, occupancy, protection, exposure) >= 98% per location",
          capability: "data_quality",
          severity: "serious",
          obligation: "Cat model input standard",
          evidence: "Profiling shows protection_class null on 3.1% of program-business locations.",
        },
      },
      {
        title: "DQ rule: paid never exceeds incurred",
        payload: {
          ruleKey: "paid_lte_incurred",
          expression: "sum(paid_loss) <= sum(incurred_loss) per claim",
          capability: "data_quality",
          severity: "critical",
          obligation: "Schedule P integrity",
          evidence: "42 historical violations, all traced to reopened-claim resequencing.",
        },
      },
      {
        title: "DQ rule: cession percentage bounds",
        payload: {
          ruleKey: "cession_pct_bounds",
          expression: "0 <= cession_pct <= 1 and sum(cession_pct) per risk <= 1",
          capability: "data_quality",
          severity: "serious",
          obligation: "Treaty compliance",
          evidence: "Over-cession detected on 2 facultative certificates in profiling window.",
        },
      },
      {
        title: "DQ rule: NAIC state code validity",
        payload: {
          ruleKey: "state_code_validity",
          expression: "risk_state in reference('naic_state_codes')",
          capability: "data_quality",
          severity: "warning",
          obligation: "Statutory page-level reporting",
          evidence: "0.4% of rows carry retired or free-typed state codes.",
        },
      },
      {
        title: "DQ rule: reserve rollforward continuity",
        payload: {
          ruleKey: "reserve_rollforward_continuity",
          expression: "opening_reserve + strengthening - releases - paid = closing_reserve ± 0.1%",
          capability: "data_quality",
          severity: "critical",
          obligation: "ASOP 23 data quality",
          evidence: "Quarterly rollforward breaks concentrated in casualty re-openings.",
        },
      },
      {
        title: "DQ rule: producer license active at bind",
        payload: {
          ruleKey: "producer_license_at_bind",
          expression: "exists(license where status='active' and bind_date between eff and exp)",
          capability: "data_quality",
          severity: "serious",
          obligation: "State DOI market conduct",
          evidence: "17 binds in profile window with lapsed appointment records.",
        },
      },
      {
        title: "DQ rule: claim closure requires financial zeroing",
        payload: {
          ruleKey: "closed_claim_zero_outstanding",
          expression: "status='closed' implies outstanding_reserve = 0",
          capability: "data_quality",
          severity: "warning",
          obligation: "Claims leakage control",
          evidence: "0.8% of closed claims carry residual reserve under $50.",
        },
      },
    ],
  },
  {
    agentKey: "cde-classifier",
    kind: "classification",
    items: [
      {
        title: "Classify: claimant SSN as NPPI-Restricted",
        payload: {
          attribute: "CLM_PARTY.claimant_ssn",
          dataset: "Claims Core — Property",
          chain: ["NPPI", "Government ID", "Restricted"],
          cdeCandidate: false,
          rationale: "Direct identifier under GLBA; masking policy propagates to 3 downstream marts.",
        },
      },
      {
        title: "Classify: claim medical narrative as PHI-Restricted",
        payload: {
          attribute: "CLM_NOTES.medical_narrative",
          dataset: "Claims Litigation Tracker",
          chain: ["PHI", "Medical Content", "Restricted"],
          cdeCandidate: false,
          rationale: "Injury-claim medical content; HIPAA-adjacent handling per privacy standard.",
        },
      },
      {
        title: "CDE candidacy: earned_premium_amt",
        payload: {
          attribute: "PREM_LEDGER.earned_premium_amt",
          dataset: "Earned Premium Ledger",
          chain: ["Financial", "Reporting-Critical", "Internal"],
          cdeCandidate: true,
          rationale: "Feeds combined ratio, statutory Page 14, and GL tie-point 4010 — three obligation paths.",
        },
      },
      {
        title: "Classify: SIU referral flag as Investigative-Restricted",
        payload: {
          attribute: "CLM_CORE.siu_referral_flag",
          dataset: "SIU Case Ledger",
          chain: ["Investigative", "SIU", "Restricted"],
          cdeCandidate: false,
          rationale: "Fraud-investigation marker; disclosure risk in broad analytics access.",
        },
      },
      {
        title: "CDE candidacy: ibnr_reserve_amt",
        payload: {
          attribute: "ACT_EST.ibnr_reserve_amt",
          dataset: "Actuarial Central Estimate Mart",
          chain: ["Financial", "Reporting-Critical", "Internal"],
          cdeCandidate: true,
          rationale: "Direct input to Schedule P and the actuarial opinion; ASOP 23 evidence chain.",
        },
      },
      {
        title: "Classify: bank account for claim payments as NPPI-Restricted",
        payload: {
          attribute: "CLM_PAY.payee_bank_account",
          dataset: "Claims Core — Property",
          chain: ["NPPI", "Financial Account", "Restricted"],
          cdeCandidate: false,
          rationale: "Claimant financial data; tokenization proposed at ingestion.",
        },
      },
      {
        title: "Classify: producer license number as Licensing-Confidential",
        payload: {
          attribute: "PRODUCER.license_no",
          dataset: "Producer Hierarchy & Appointments",
          chain: ["Licensing", "Regulated Credential", "Confidential"],
          cdeCandidate: false,
          rationale: "Appointment and licensing record; state DOI examination surface.",
        },
      },
    ],
  },
  {
    agentKey: "lineage-tracer",
    kind: "lineage-stitch",
    items: [
      {
        title: "Stitch: policy admin extract → premium staging",
        payload: {
          source: "PAS_EXTRACT.policy_premium_daily",
          target: "STG_PREM.premium_txn",
          method: "column-name + profile match (14/14 columns)",
          coverageGain: "Closes gap on earned premium by state trace",
          evidence: "Transformation script premium_load.py references both endpoints.",
        },
      },
      {
        title: "Stitch: claims core → Schedule P triangle feed",
        payload: {
          source: "CLM_CORE.loss_financials",
          target: "STAT_FEED.schedule_p_triangles",
          method: "transformation-evidence match (dbt model stat_triangles)",
          coverageGain: "Completes source-to-filing trace for Schedule P",
          evidence: "Column-level map confirmed for paid, case, and IBNR components.",
        },
      },
      {
        title: "Stitch: GL journal → tie-point reconciliation mart",
        payload: {
          source: "GL.journal_lines[account=4010]",
          target: "RECON.gl_tiepoint_4010",
          method: "profile + aggregation-shape match",
          coverageGain: "Evidence-grade walk for the premium reconciliation control",
          evidence: "Monthly totals equal within rounding across 12 profiled periods.",
        },
      },
      {
        title: "Document manual segment: bordereaux spreadsheet intake",
        payload: {
          source: "MGA bordereaux workbooks (email intake)",
          target: "STG_BORD.program_premium",
          method: "documented manual segment (not connector-buildable)",
          coverageGain: "Marks deliberate manual hop with owner and refresh cadence",
          evidence: "Intake macro versioned; steward attestation quarterly.",
        },
      },
      {
        title: "Stitch: reinsurance register → ceded premium ledger",
        payload: {
          source: "RI_REG.treaty_cessions",
          target: "LEDGER.ceded_premium",
          method: "column-name + treaty-id join evidence",
          coverageGain: "Extends trace on ceded premium bordereaux report input",
          evidence: "treaty_id foreign-key relationship verified in scanner output.",
        },
      },
      {
        title: "Stitch: rate engine output → underwriting decision log",
        payload: {
          source: "RATER.quote_factors",
          target: "UW_LOG.decision_snapshot",
          method: "profile match (11/13 columns, 2 renamed)",
          coverageGain: "Explains filed-rate factors behind underwriting decisions",
          evidence: "Rename map recovered from rater release notes v14.2.",
        },
      },
    ],
  },
  {
    agentKey: "triage-marshal",
    kind: "triage",
    items: [
      {
        title: "Triage bundle: premium reconciliation drift (month-end)",
        payload: {
          alerts: [
            { alert: "earned_premium_reconciliation breach 0.62%", severity: "critical" },
            { alert: "GL 4010 late journal batch", severity: "warning" },
            { alert: "premium staging row-count dip 1.8%", severity: "warning" },
          ],
          proposedOwner: OWNERS[0],
          priority: "P1 — close-critical",
          dueInDays: 2,
          rationale: "Three alerts cluster on one late GL batch; close calendar hits in 4 days.",
        },
      },
      {
        title: "Triage bundle: COPE completeness slide — program business",
        payload: {
          alerts: [
            { alert: "cope_completeness_property below 98% (96.4%)", severity: "serious" },
            { alert: "new MGA feed missing protection_class", severity: "serious" },
          ],
          proposedOwner: OWNERS[2],
          priority: "P2",
          dueInDays: 5,
          rationale: "Single upstream cause: new bordereaux template dropped a column.",
        },
      },
      {
        title: "Triage bundle: orphan claims without policy match",
        payload: {
          alerts: [
            { alert: "claim_policy_match failures: 214 claims", severity: "serious" },
            { alert: "policy endorsement stream 6h delay", severity: "warning" },
          ],
          proposedOwner: OWNERS[1],
          priority: "P2",
          dueInDays: 3,
          rationale: "Latency-induced; expected to self-heal — verify then close with evidence.",
        },
      },
      {
        title: "Triage bundle: reserve rollforward break — casualty",
        payload: {
          alerts: [
            { alert: "reserve_rollforward_continuity breach $184K", severity: "critical" },
            { alert: "reopened-claim resequencing spike", severity: "warning" },
          ],
          proposedOwner: OWNERS[4],
          priority: "P1 — filing-critical",
          dueInDays: 2,
          rationale: "Feeds Schedule P; actuarial sign-off blocked until resolved.",
        },
      },
      {
        title: "Triage bundle: producer appointment lapses",
        payload: {
          alerts: [
            { alert: "producer_license_at_bind: 9 new violations", severity: "serious" },
            { alert: "licensing feed stale 3 days", severity: "warning" },
          ],
          proposedOwner: OWNERS[5],
          priority: "P3",
          dueInDays: 7,
          rationale: "Stale feed likely explains most; re-run after refresh, escalate residue.",
        },
      },
      {
        title: "Triage bundle: escheatment watchlist duplicates",
        payload: {
          alerts: [
            { alert: "duplicate unclaimed-funds candidates: 61", severity: "warning" },
            { alert: "party golden-record merge backlog", severity: "warning" },
          ],
          proposedOwner: OWNERS[3],
          priority: "P3",
          dueInDays: 10,
          rationale: "Noise from pending party merges; bundle for weekly stewardship session.",
        },
      },
    ],
  },
  {
    agentKey: "alignment-auditor",
    kind: "drift-flag",
    items: [
      {
        title: "Drift: masking policy absent on claims mart clone",
        payload: {
          standard: "NPPI columns masked in all non-privileged schemas",
          deployed: "CLM_MART_DEV clone exposes claimant_ssn unmasked",
          severity: "critical",
          evidence: "Warehouse tag scan 2026-07 vs. policy repo v3.2",
          proposedRoute: "Security engineering — revoke clone grants, re-tag",
        },
      },
      {
        title: "Drift: approved DQ threshold never deployed",
        payload: {
          standard: "cession_pct_bounds severity=serious, threshold approved Q1",
          deployed: "Rule running at draft threshold (warning) in DQ engine",
          severity: "serious",
          evidence: "Approved definition set v41 vs. engine config export",
          proposedRoute: "DQ platform — redeploy from governance-as-code pipeline",
        },
      },
      {
        title: "Drift: glossary term certified but catalog label stale",
        payload: {
          standard: "Earned Premium certified definition v4",
          deployed: "Catalog still shows v2 wording on 3 assets",
          severity: "warning",
          evidence: "Catalog API diff against certified glossary export",
          proposedRoute: "Catalog admin — re-sync publication job",
        },
      },
      {
        title: "Drift: manual change bypassed policy pipeline",
        payload: {
          standard: "Access policies deploy only via CI pipeline",
          deployed: "Direct grant on RESERVE_MART to analytics role, no PR trail",
          severity: "serious",
          evidence: "Warehouse grant audit vs. pipeline deployment log",
          proposedRoute: "Governance platform — revert grant, open exception review",
        },
      },
      {
        title: "Drift: retired rule still executing",
        payload: {
          standard: "legacy_state_code_check retired in definition set v39",
          deployed: "Rule still scheduled nightly, generating untriaged alerts",
          severity: "warning",
          evidence: "Definition set diff vs. scheduler export",
          proposedRoute: "DQ platform — deschedule, archive alert history",
        },
      },
    ],
  },
];

export const SUGGESTION_KIND_LABELS: Record<SuggestionKind, string> = {
  "glossary-term": "Glossary term",
  "dq-rule": "DQ rule",
  classification: "Classification",
  "lineage-stitch": "Lineage stitch",
  triage: "Breach triage",
  "drift-flag": "Drift flag",
};

export const AGENT_KIND: Record<string, SuggestionKind> = Object.fromEntries(
  TEMPLATES.map((t) => [t.agentKey, t.kind]),
);

/**
 * Draw 15–25 suggestion drafts deterministically for a seed key. Rotates
 * through the six agents, never repeats an item within a run, and spreads
 * confidence across 0.55–0.98.
 */
export function draftSuggestions(seedKey: string): SuggestionDraft[] {
  const rand = mulberry32(hashSeed(`suggest:${seedKey}`));
  const count = 15 + Math.floor(rand() * 11); // 15–25

  // Per-agent deterministic shuffle of items.
  const decks = TEMPLATES.map((t) => {
    const items = [...t.items];
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return { ...t, items };
  });

  const drafts: SuggestionDraft[] = [];
  let agentIdx = Math.floor(rand() * decks.length);
  let guard = 0;
  while (drafts.length < count && guard < 200) {
    guard++;
    const deck = decks[agentIdx % decks.length];
    agentIdx += 1 + (rand() < 0.3 ? 1 : 0); // occasionally skip an agent
    const item = deck.items.pop();
    if (!item) continue;
    const confidence = Math.round((0.55 + rand() * 0.43) * 1000) / 1000;
    drafts.push({
      agentKey: deck.agentKey,
      kind: deck.kind,
      title: item.title,
      payload: item.payload,
      confidence: Math.min(0.98, confidence),
    });
  }
  return drafts;
}
