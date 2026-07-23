import { contentStore } from "@/content/store";
import { PLATFORM_CATEGORY_LABELS } from "@/content/types";
import type { NavGroup } from "@/lib/nav";
import { getSectorScope, isInSectorScope } from "@/lib/workspace-scope";
import { TYPE_LABELS } from "@/components/library/type-labels";
import type { SearchRow } from "@/components/command-palette";

/**
 * Compact searchable index for the command palette, built server-side in the
 * app shell. Nav rows come from the caller already filtered by persona and
 * real-role permissions; content rows all sit behind library.read, which every
 * role carries. Row order fixes group order in the palette.
 */
export async function buildSearchIndex(nav: NavGroup[]): Promise<SearchRow[]> {
  const [elements, packs, bestPractices, obligations, kpis, sectors, scenarios, dashboards, platforms, scope] =
    await Promise.all([
      contentStore.elements(),
      contentStore.packs(),
      contentStore.bestPractices(),
      contentStore.obligations(),
      contentStore.kpis(),
      contentStore.sectors(),
      contentStore.scenarios(),
      contentStore.dashboards(),
      contentStore.platforms(),
      getSectorScope(),
    ]);

  // Workspace sector scope: out-of-scope sectors and sector-pinned elements
  // never surface in the palette. Scenarios are sector-agnostic and stay.
  const scopedSectors = sectors.filter((s) => scope.has(s.key));
  const scopedElements = elements.filter((el) => isInSectorScope(el.sectorAffinity, scope));

  const packByKey = new Map(packs.map((p) => [p.key, p]));
  const rows: SearchRow[] = [];

  for (const group of nav) {
    for (const item of group.items) {
      rows.push({ label: item.label, sublabel: group.title, href: item.href, group: "Navigate" });
    }
  }

  for (const el of scopedElements) {
    const pack = packByKey.get(el.packKey);
    rows.push({
      label: el.name,
      sublabel: [pack?.code, TYPE_LABELS[el.type]].filter(Boolean).join(" · "),
      href: `/library/${el.key}`,
      group: "Library elements",
    });
  }

  for (const bp of bestPractices) {
    rows.push({
      label: bp.title,
      sublabel: bp.statement,
      href: "/practices",
      group: "Best practices",
    });
  }

  // "Landscape" is no longer a sidebar destination (surfaced instead as a
  // drawer from the composer's sector step), but /explore stays reachable as
  // a full deep-linkable reference — these rows are how power users still
  // find it from the palette.
  for (const o of obligations) {
    rows.push({
      label: o.name,
      sublabel: `${o.authority} · ${o.jurisdiction}`,
      href: "/explore",
      group: "Obligations",
    });
  }

  for (const kpi of kpis) {
    rows.push({ label: kpi.name, sublabel: kpi.formula, href: "/explore", group: "KPIs" });
  }

  for (const s of scopedSectors) {
    rows.push({
      label: `Sector reference: ${s.name}`,
      sublabel: s.tagline,
      href: `/explore?sector=${s.key}`,
      group: "Sector reference",
    });
  }

  for (const sc of scenarios) {
    rows.push({ label: sc.name, sublabel: sc.tagline, href: "/scenarios", group: "Scenarios" });
  }

  for (const d of dashboards) {
    rows.push({
      label: d.name,
      sublabel: `Dashboard blueprint · ${d.audience[0] ?? ""}`,
      href: "/dashboards",
      group: "Dashboards",
    });
  }

  // Platforms are not sector-scoped — all 12 stay searchable regardless of
  // workspace sector scope, and /platforms is a reference route reachable
  // only via the palette and the platform info drawer (not sidebar nav).
  for (const p of platforms) {
    rows.push({
      label: p.name,
      sublabel: `${PLATFORM_CATEGORY_LABELS[p.category]} · ${p.tier}`,
      href: `/platforms/${p.key}`,
      group: "Platforms",
    });
  }

  return rows;
}
