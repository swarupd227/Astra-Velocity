import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { contentItems } from "@/db/schema";
import {
  BestPracticeSchema,
  DashboardSchema,
  ElementSchema,
  KpiSchema,
  ObligationSchema,
  PackSchema,
  ScenarioSchema,
  SectorSchema,
  type BestPractice,
  type ContentKind,
  type Dashboard,
  type Element,
  type Kpi,
  type Obligation,
  type Pack,
  type Scenario,
  type Sector,
} from "./types";

/**
 * Read-side access to published library content. Payloads are re-validated on
 * read so a bad row can never silently reach the UI or the recommendation
 * engine — it throws with the offending kind/key instead.
 */
async function loadPublished<T>(kind: ContentKind, parse: (raw: unknown) => T): Promise<T[]> {
  const rows = await db
    .select({ key: contentItems.key, payload: contentItems.payload })
    .from(contentItems)
    .where(and(eq(contentItems.kind, kind), eq(contentItems.status, "published")));
  return rows.map((row) => {
    try {
      return parse(row.payload);
    } catch (err) {
      throw new Error(`Invalid published content ${kind}/${row.key}: ${String(err)}`);
    }
  });
}

export const contentStore = {
  sectors: () => loadPublished<Sector>("sector", (raw) => SectorSchema.parse(raw)),
  scenarios: () => loadPublished<Scenario>("scenario", (raw) => ScenarioSchema.parse(raw)),
  obligations: () => loadPublished<Obligation>("obligation", (raw) => ObligationSchema.parse(raw)),
  kpis: () => loadPublished<Kpi>("kpi", (raw) => KpiSchema.parse(raw)),
  packs: () => loadPublished<Pack>("pack", (raw) => PackSchema.parse(raw)),
  elements: () => loadPublished<Element>("element", (raw) => ElementSchema.parse(raw)),
  bestPractices: () =>
    loadPublished<BestPractice>("best-practice", (raw) => BestPracticeSchema.parse(raw)),
  dashboards: () => loadPublished<Dashboard>("dashboard", (raw) => DashboardSchema.parse(raw)),
};
