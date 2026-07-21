import type { ElementType } from "@/content/types";

/** Display labels for element types — shared by the browser (client) and detail page (server). */
export const TYPE_LABELS: Record<ElementType, string> = {
  "best-practice-card": "Best Practice Card",
  "guideline-standard": "Guideline / Standard",
  template: "Template",
  "semantic-pack": "Semantic Pack",
  "cde-library": "CDE Library",
  "dq-rule-library": "DQ Rule Library",
  agent: "Agent",
  "playbook-method": "Playbook / Method",
  toolkit: "Toolkit",
  "metric-kpi": "Metric / KPI",
  "training-module": "Training Module",
  "dashboard-blueprint": "Dashboard Blueprint",
};
