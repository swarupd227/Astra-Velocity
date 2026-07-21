import { ContentBundleSchema, type ContentBundle } from "./types";
import { SECTORS } from "./data/sectors";
import { SCENARIOS } from "./data/scenarios";
import { OBLIGATIONS } from "./data/obligations";
import { KPIS } from "./data/kpis";
import { PACKS } from "./data/packs";
import { ELEMENTS } from "./data/elements";
import { BEST_PRACTICES } from "./data/best-practices";
import { DASHBOARDS } from "./data/dashboards";

/**
 * The authored content bundle, shape-validated at import time. Referential
 * integrity (cross-entity keys) is enforced separately by checkBundleIntegrity —
 * the seed pipeline refuses to load a bundle with dangling references.
 */
export const contentBundle: ContentBundle = ContentBundleSchema.parse({
  sectors: SECTORS,
  scenarios: SCENARIOS,
  obligations: OBLIGATIONS,
  kpis: KPIS,
  packs: PACKS,
  elements: ELEMENTS,
  bestPractices: BEST_PRACTICES,
  dashboards: DASHBOARDS,
});
