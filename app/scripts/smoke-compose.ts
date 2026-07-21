import { contentBundle } from "../src/content/bundle";
import { recommendDashboards, recommendElements } from "../src/engine/recommend";

/** CLI smoke test: compose a project for a (sector, scenario) pair. */
const sector = (process.argv[2] ?? "pc-personal") as never;
const scenario = (process.argv[3] ?? "report-integrity") as never;

const ctx = {
  sectors: contentBundle.sectors,
  scenarios: contentBundle.scenarios,
  elements: contentBundle.elements,
  dashboards: contentBundle.dashboards,
  bestPractices: contentBundle.bestPractices,
  obligations: contentBundle.obligations,
};

const recs = recommendElements({ sector, scenario }, ctx);
const dashes = recommendDashboards({ sector, scenario }, ctx);

console.log(`\n=== ${sector} × ${scenario} — ${recs.length} elements, ${dashes.length} dashboards ===\n`);
for (const r of recs.slice(0, 12)) {
  console.log(`[${r.tier.toUpperCase().padEnd(11)}] ${String(r.score).padStart(2)}  ${r.element.name}  (${r.element.packKey})`);
  for (const reason of r.reasons.slice(0, 2)) console.log(`      · ${reason}`);
}
console.log("\nDashboards:");
for (const d of dashes.slice(0, 8)) {
  console.log(`  ${String(d.score).padStart(2)}  ${d.dashboard.name}${d.dashboard.builtIn ? "  [live in-app]" : ""}`);
}
