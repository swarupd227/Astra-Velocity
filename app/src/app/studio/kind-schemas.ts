import type { ZodType } from "zod";
import {
  BestPracticeSchema,
  DashboardSchema,
  ElementSchema,
  FrictionPatternSchema,
  KpiSchema,
  ObligationSchema,
  PackSchema,
  PlatformSchema,
  ScenarioSchema,
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

/** Display name from a payload: most kinds use `name`, best practices use `title`. */
export function payloadName(payload: unknown): string {
  if (payload && typeof payload === "object") {
    const p = payload as { name?: unknown; title?: unknown };
    if (typeof p.name === "string") return p.name;
    if (typeof p.title === "string") return p.title;
  }
  return "";
}
