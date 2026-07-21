import type {
  BestPractice,
  Capability,
  Dashboard,
  Element,
  ElementType,
  Obligation,
  Scenario,
  Sector,
} from "@/content/types";
import { CAPABILITIES, CAPABILITY_LABELS } from "@/content/types";

/**
 * Blueprint generator: turns a composed project (sector × scenario × selected
 * elements) into a client-ready engagement blueprint. Pure and deterministic —
 * the same inputs always produce the same document, so a saved project renders
 * an identical blueprint on every visit.
 */

export interface BlueprintInput {
  sector: Sector;
  scenario: Scenario;
  /** The elements selected in the Composer (already resolved from keys). */
  elements: Element[];
  /** Recommended dashboards for the pair, in rank order. */
  dashboards: Dashboard[];
  bestPractices: BestPractice[];
  obligations: Obligation[];
}

export type PhaseKey = "assessment" | "wave-1" | "wave-2" | "scale";

export interface BlueprintPhase {
  key: PhaseKey;
  name: string;
  /** Human window label, e.g. "Weeks 1–6". */
  window: string;
  weekStart: number;
  weekEnd: number;
  objectives: string[];
  /** Names of the selected elements deployed in this phase. */
  elementNames: string[];
}

export interface PodPair {
  consultingRole: string;
  clientRole: string;
  focus: string;
}

export interface PodModel {
  summary: string;
  pairs: PodPair[];
}

export interface TrainTheTrainerWave {
  wave: string;
  namedTraineeSlots: number;
  focus: string;
}

export interface TrainTheTrainerPlan {
  waves: TrainTheTrainerWave[];
  /** The gate every wave must pass before scope extends. */
  readinessDemonstration: string;
}

export interface ManifestEntry {
  elementKey: string;
  elementName: string;
  elementType: ElementType;
  packKey: string;
  /** Title of the first linked best practice — the element's rationale. */
  practiceTitle: string | null;
  soWhat: string;
}

export interface ManifestGroup {
  capability: Capability;
  label: string;
  entries: ManifestEntry[];
}

export interface Blueprint {
  executiveSummary: string[];
  phases: BlueprintPhase[];
  /** Metrics and training modules run across all phases, not inside one. */
  crossCuttingEnablement: { elementNames: string[]; note: string };
  podModel: PodModel;
  trainTheTrainer: TrainTheTrainerPlan;
  successMetrics: string[];
  risks: string[];
  dashboards: Dashboard[];
  /** Obligations the selected elements produce evidence for, resolved. */
  obligationsAddressed: Obligation[];
  /** Selected elements grouped by primary capability, with rationale. */
  manifest: ManifestGroup[];
}

/** Element types deployed during Phase 1 (standards & assessment). */
const ASSESSMENT_TYPES: ReadonlySet<ElementType> = new Set<ElementType>([
  "toolkit",
  "template",
  "guideline-standard",
  "best-practice-card",
]);

/** Element types that run across the whole engagement rather than one phase. */
const CROSS_CUTTING_TYPES: ReadonlySet<ElementType> = new Set<ElementType>([
  "metric-kpi",
  "training-module",
]);

const RISK_MITIGATIONS = [
  "mitigated by Phase 1 baselining with a named owner assigned before Wave 1 begins",
  "mitigated by pairing pods on live deliverables instead of classroom-only training",
  "mitigated by wave-gated readiness demonstrations before scope extends",
  "mitigated by weekly capability-coverage telemetry on the dashboard set",
  "mitigated by executive sponsor checkpoints at every phase boundary",
] as const;

function byName(a: Element, b: Element): number {
  return a.name.localeCompare(b.name) || a.key.localeCompare(b.key);
}

/** Capabilities the scenario concentrates on (emphasis ≥ 2), as labels. */
function emphasisLabels(scenario: Scenario): string[] {
  return CAPABILITIES.filter((cap) => (scenario.capabilityEmphasis[cap] ?? 0) >= 2).map(
    (cap) => CAPABILITY_LABELS[cap],
  );
}

function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function buildBlueprint(input: BlueprintInput): Blueprint {
  const { sector, scenario } = input;
  const elements = [...input.elements].sort(byName);

  // ---------- Phase assignment by element type ----------
  const assessmentElements = elements.filter((e) => ASSESSMENT_TYPES.has(e.type));
  const crossCuttingElements = elements.filter((e) => CROSS_CUTTING_TYPES.has(e.type));
  const waveElements = elements.filter(
    (e) => !ASSESSMENT_TYPES.has(e.type) && !CROSS_CUTTING_TYPES.has(e.type),
  );
  // Alternate wave assignment (sorted order) so both waves carry real weight.
  const wave1Elements = waveElements.filter((_, i) => i % 2 === 0);
  const wave2Elements = waveElements.filter((_, i) => i % 2 === 1);

  // ---------- Obligations addressed ----------
  const obligationsByKey = new Map(input.obligations.map((o) => [o.key, o]));
  const addressedKeys = new Set<string>();
  for (const el of elements) for (const key of el.obligationKeys ?? []) addressedKeys.add(key);
  const obligationsAddressed = [...addressedKeys]
    .map((key) => obligationsByKey.get(key))
    .filter((o): o is Obligation => Boolean(o))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ---------- Executive summary ----------
  const focusCaps = emphasisLabels(scenario);
  const sectorNote = scenario.sectorNotes?.[sector.key];
  const builtInDashboards = input.dashboards.filter((d) => d.builtIn);

  const executiveSummary = [
    `This blueprint composes a data governance engagement for ${sector.name} — ${sector.tagline.toLowerCase().replace(/\.$/, "")} — centered on the ${scenario.name} scenario. ${scenario.stakes} ${sector.narrative}`,
    `The engagement deploys ${elements.length} Velocity Pack element${elements.length === 1 ? "" : "s"} across three phases over 26 weeks, concentrating where the scenario concentrates: ${joinNatural(focusCaps.length > 0 ? focusCaps : ["foundational governance capabilities"])}. Phase 1 establishes standards and baselines the ecosystem; Phase 2 puts working assets into daily stewardship through two paired-delivery waves; Phase 3 transfers ownership and locks in the path to scale.${sectorNote ? ` ${sectorNote}` : ""}`,
    `${obligationsAddressed.length > 0 ? `The selected elements produce examiner-ready evidence for ${obligationsAddressed.length} regulatory obligation${obligationsAddressed.length === 1 ? "" : "s"}, including ${joinNatural(obligationsAddressed.slice(0, 3).map((o) => o.name))}. ` : ""}Every consulting seat is paired with a named client counterpart, and each wave closes with a readiness demonstration — so the capability, not just the deliverables, stays with the organization${builtInDashboards.length > 0 ? `, monitored live through ${builtInDashboards.length} in-platform dashboard${builtInDashboards.length === 1 ? "" : "s"}` : ""}.`,
  ];

  // ---------- Phases ----------
  const topObligations = sector.obligationKeys
    .map((key) => obligationsByKey.get(key))
    .filter((o): o is Obligation => Boolean(o))
    .slice(0, 2);

  const phases: BlueprintPhase[] = [
    {
      key: "assessment",
      name: "Phase 1 — Standards & Ecosystem Assessment",
      window: "Weeks 1–6",
      weekStart: 1,
      weekEnd: 6,
      objectives: [
        `Baseline current-state governance in ${sector.name} against the selected standards, templates, and toolkits.`,
        topObligations.length > 0
          ? `Map obligations — ${joinNatural(topObligations.map((o) => o.name))} — to owners and the evidence examiners actually ask for.`
          : "Map binding obligations to owners and the evidence examiners actually ask for.",
        `Assess the system ecosystem (${joinNatural(sector.systemArchetypes.slice(0, 3))}) and confirm pilot data domains.`,
        "Stand up the pod operating rhythm and name the Wave 1 trainees.",
      ],
      elementNames: assessmentElements.map((e) => e.name),
    },
    {
      key: "wave-1",
      name: "Phase 2 — Hands-On Enablement · Wave 1",
      window: "Weeks 5–16",
      weekStart: 5,
      weekEnd: 16,
      objectives: [
        "Deploy the first wave of working assets into daily stewardship on the pilot domains.",
        `Pair consultants with named client trainees on real ${scenario.name} deliverables — work done together, never handed over.`,
        focusCaps.length > 0
          ? `Prove coverage where the scenario concentrates: ${joinNatural(focusCaps)}.`
          : "Prove coverage on the scenario's priority capabilities.",
      ],
      elementNames: wave1Elements.map((e) => e.name),
    },
    {
      key: "wave-2",
      name: "Phase 2 — Hands-On Enablement · Wave 2",
      window: "Weeks 15–26",
      weekStart: 15,
      weekEnd: 26,
      objectives: [
        "Extend deployment to the second wave of assets and the remaining data domains.",
        "Shift asset ownership to client stewards; consultants move from driving to reviewing.",
        "Close the capability gaps surfaced by Wave 1 telemetry.",
      ],
      elementNames: wave2Elements.map((e) => e.name),
    },
    {
      key: "scale",
      name: "Phase 3 — Path to Scale",
      window: "Weeks 18–26",
      weekStart: 18,
      weekEnd: 26,
      objectives: [
        "Transition run-books, standards, and agent supervision to client-owned operation.",
        builtInDashboards.length > 0
          ? `Operationalize the dashboard set for ongoing telemetry (${builtInDashboards.length} live in-platform from day one).`
          : "Operationalize the dashboard set for ongoing telemetry.",
        "Certify trainees through final readiness demonstrations; trainees own onboarding of the next cohort.",
        "Agree the scale-out roadmap: next domains, next scenarios, and the funding case.",
      ],
      elementNames: [],
    },
  ];

  // ---------- Pod model ----------
  const podModel: PodModel = {
    summary:
      "Every consulting seat is paired with a named client counterpart. Work is done together in the pod — never produced in isolation and handed over.",
    pairs: [
      {
        consultingRole: "Governance Architect",
        clientRole: "Head of Data Governance",
        focus: `Operating model, standards adoption, and the ${scenario.name} decision cadence.`,
      },
      {
        consultingRole: "Semantic & Metadata Lead",
        clientRole: "Lead Data Steward",
        focus: "Business glossary, critical data elements, and catalog curation.",
      },
      {
        consultingRole: "Data Quality Engineer",
        clientRole: "Domain Data Steward",
        focus: `Rule deployment, exception triage, and remediation loops for ${sector.name} domains.`,
      },
      {
        consultingRole: "Analytics & Insights Lead",
        clientRole: "BI / Reporting Lead",
        focus: "Dashboard set, metric definitions, and telemetry-driven prioritization.",
      },
    ],
  };

  // ---------- Train the trainer ----------
  const trainTheTrainer: TrainTheTrainerPlan = {
    waves: [
      {
        wave: "Wave 1",
        namedTraineeSlots: 3,
        focus:
          wave1Elements.length > 0
            ? `Named trainees co-deliver ${joinNatural(wave1Elements.slice(0, 3).map((e) => e.name))} alongside the pod.`
            : "Named trainees co-deliver the Phase 1 standards and assessment assets alongside the pod.",
      },
      {
        wave: "Wave 2",
        namedTraineeSlots: 3,
        focus:
          wave2Elements.length > 0
            ? `A second trainee cohort takes the lead on ${joinNatural(wave2Elements.slice(0, 3).map((e) => e.name))}, with Wave 1 graduates assisting.`
            : "A second trainee cohort takes the lead on remaining assets, with Wave 1 graduates assisting.",
      },
    ],
    readinessDemonstration:
      "Each wave closes with a readiness demonstration: trainees run the deployed assets end-to-end on live data in front of their sponsor, without consultant intervention, before the next wave of scope opens.",
  };

  // ---------- Success metrics ----------
  const successMetrics = [
    ...scenario.successMetrics,
    ...crossCuttingElements
      .filter((e) => e.type === "metric-kpi")
      .map((e) => `Instrumented in-platform via ${e.name}.`),
  ];

  // ---------- Risks ----------
  const risks = scenario.painPoints
    .slice(0, 5)
    .map(
      (pain, i) =>
        `${pain.replace(/\.$/, "")} — ${RISK_MITIGATIONS[i % RISK_MITIGATIONS.length]}.`,
    );

  // ---------- Manifest (grouped by primary capability) ----------
  const practicesByKey = new Map(input.bestPractices.map((b) => [b.key, b]));
  const manifest: ManifestGroup[] = CAPABILITIES.map((capability) => ({
    capability,
    label: CAPABILITY_LABELS[capability],
    entries: elements
      .filter((e) => e.capabilities[0] === capability)
      .map((e) => ({
        elementKey: e.key,
        elementName: e.name,
        elementType: e.type,
        packKey: e.packKey,
        practiceTitle: practicesByKey.get(e.bestPracticeKeys[0])?.title ?? null,
        soWhat: e.soWhat,
      })),
  })).filter((group) => group.entries.length > 0);

  return {
    executiveSummary,
    phases,
    crossCuttingEnablement: {
      elementNames: crossCuttingElements.map((e) => e.name),
      note: "Metrics are instrumented from Phase 1; training modules run through both enablement waves — these assets span the engagement rather than one phase.",
    },
    podModel,
    trainTheTrainer,
    successMetrics,
    risks,
    dashboards: input.dashboards,
    obligationsAddressed,
    manifest,
  };
}
