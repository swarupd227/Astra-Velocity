import type { ZodType } from "zod";
import {
  BestPracticeSchema,
  CAPABILITIES,
  DashboardSchema,
  DATA_DOMAINS,
  ELEMENT_TYPES,
  ElementSchema,
  FrictionPatternSchema,
  KpiSchema,
  ObligationSchema,
  PackSchema,
  PLATFORM_CATEGORIES,
  PlatformSchema,
  ScenarioSchema,
  SECTOR_KEYS,
  SectorSchema,
  type ContentKind,
} from "@/content/types";

/** Map each content kind to the Zod schema its payload must satisfy. */
export const KIND_SCHEMAS: Record<ContentKind, ZodType> = {
  sector: SectorSchema,
  scenario: ScenarioSchema,
  obligation: ObligationSchema,
  kpi: KpiSchema,
  pack: PackSchema,
  element: ElementSchema,
  "best-practice": BestPracticeSchema,
  dashboard: DashboardSchema,
  platform: PlatformSchema,
  "friction-pattern": FrictionPatternSchema,
};

export const KIND_LABELS: Record<ContentKind, string> = {
  sector: "Sector",
  scenario: "Scenario",
  obligation: "Obligation",
  kpi: "KPI",
  pack: "Velocity Pack",
  element: "Element",
  "best-practice": "Best Practice",
  dashboard: "Dashboard",
  platform: "Platform",
  "friction-pattern": "Friction Pattern",
};

const TODO = "TODO — replace before publishing";

/**
 * A minimal-but-schema-valid starter shell for a brand-new draft of a kind —
 * satisfies every required field/min-length so the author starts from a
 * realistic skeleton instead of `{}`. Cross-reference fields (obligationKeys,
 * packKey, bestPracticeKeys, …) get obviously-fake placeholder keys the
 * author must replace; they pass Zod's kebab-case shape check but won't
 * resolve to anything real until edited.
 */
export function blankPayloadForKind(kind: ContentKind, key: string): unknown {
  switch (kind) {
    case "sector":
      return {
        key,
        name: TODO,
        tagline: TODO,
        narrative: TODO,
        valueChain: Array.from({ length: 4 }, (_, i) => ({
          key: `stage-${i + 1}`,
          name: TODO,
          description: TODO,
          dataDomains: [DATA_DOMAINS[0]],
          painPoints: [TODO],
        })),
        systemArchetypes: [TODO, TODO, TODO],
        distributionModel: TODO,
        signaturePainPoints: [TODO, TODO, TODO],
        obligationKeys: ["replace-with-real-obligation-1", "replace-with-real-obligation-2"],
        kpiKeys: [
          "replace-with-real-kpi-1",
          "replace-with-real-kpi-2",
          "replace-with-real-kpi-3",
        ],
      };
    case "scenario":
      return {
        key,
        name: TODO,
        tagline: TODO,
        stakes: TODO,
        painPoints: [TODO, TODO, TODO],
        stakeholders: [TODO, TODO, TODO],
        capabilityEmphasis: {},
        successMetrics: [TODO, TODO, TODO],
      };
    case "obligation":
      return {
        key,
        name: TODO,
        authority: TODO,
        jurisdiction: TODO,
        summary: TODO,
        sectorKeys: [SECTOR_KEYS[0]],
        capabilities: [CAPABILITIES[0]],
        evidenceExpectations: [TODO],
      };
    case "kpi":
      return {
        key,
        name: TODO,
        formula: TODO,
        description: TODO,
        sectorKeys: [SECTOR_KEYS[0]],
        dataDomains: [DATA_DOMAINS[0]],
        cdeHints: [TODO],
      };
    case "pack":
      return {
        key,
        code: "VP-00",
        name: TODO,
        summary: TODO,
        origin: "extended",
        soWhat: TODO,
      };
    case "element":
      return {
        key,
        packKey: "replace-with-real-pack-key",
        type: ELEMENT_TYPES[0],
        name: TODO,
        pitch: TODO,
        description: TODO,
        soWhat: TODO,
        audience: [TODO],
        capabilities: [CAPABILITIES[0]],
        bestPracticeKeys: ["replace-with-real-best-practice-key"],
        sectorAffinity: {},
        scenarioAffinity: {},
        toolTags: [TODO],
      };
    case "best-practice":
      return {
        key,
        title: TODO,
        statement: TODO,
        whatGoodLooksLike: TODO,
        antiPattern: TODO,
        evidence: TODO,
        capabilities: [CAPABILITIES[0]],
      };
    case "dashboard":
      return {
        key,
        name: TODO,
        category: "governance",
        audience: [TODO],
        questionsAnswered: [TODO, TODO, TODO],
        kpis: [TODO, TODO, TODO],
        requiredInputs: [TODO, TODO],
        targetStack: [TODO],
        sectorAffinity: {},
        scenarioAffinity: {},
        builtIn: false,
      };
    case "platform":
      return {
        key,
        name: TODO,
        vendor: TODO,
        category: PLATFORM_CATEGORIES[0],
        tier: "alternate",
        summary: TODO,
        capabilityRoles: {},
        nativeAi: { name: TODO, description: TODO },
        marketContext: TODO,
      };
    case "friction-pattern":
      return {
        key,
        capability: CAPABILITIES[0],
        involvedCategories: [PLATFORM_CATEGORIES[0], PLATFORM_CATEGORIES[1]],
        title: TODO,
        description: TODO,
      };
  }
}

/** Display name from a payload: most kinds use `name`, best practices use `title`. */
export function payloadName(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const p = payload as { name?: unknown; title?: unknown };
    if (typeof p.name === "string") return p.name;
    if (typeof p.title === "string") return p.title;
  }
  return "";
}
