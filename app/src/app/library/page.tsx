import { contentStore } from "@/content/store";
import { LibraryBrowser } from "@/components/library/library-browser";
import { artifactSearchText, elementStat, resolveArtifact } from "@/components/library/artifact-stat";
import { getSectorScope, isInSectorScope } from "@/lib/workspace-scope";
import type { Artifact } from "@/content/types";

export const metadata = { title: "Velocity Pack Library — Astra Velocity" };

export default async function LibraryPage() {
  const [packs, allElements, platforms, scope] = await Promise.all([
    contentStore.packs(),
    contentStore.elements(),
    contentStore.platforms(),
    getSectorScope(),
  ]);

  // Workspace sector scope: hide elements pinned entirely to out-of-scope
  // sectors; broad elements (no sector pins) always stay.
  const elements = allElements.filter((el) => isInSectorScope(el.sectorAffinity, scope));

  // Concrete artifact stats ("24 terms", "18 rules · 3 critical") per element,
  // and the artifact's own kind (drives the Format filter — "governance-as-code"
  // examples are real but were invisible: their element TYPE is "template" or
  // "toolkit", not "code", so a type-only filter could never surface them).
  const stats: Record<string, string> = {};
  const artifactKinds: Record<string, Artifact["kind"]> = {};
  const artifactSearch: Record<string, string> = {};
  for (const el of elements) {
    const stat = elementStat(el);
    if (stat) stats[el.key] = stat;
    const artifact = resolveArtifact(el);
    if (artifact) {
      artifactKinds[el.key] = artifact.kind;
      artifactSearch[el.key] = artifactSearchText(artifact);
    }
  }

  return (
    <section>
      <h1 className="font-display text-3xl text-slate-900 dark:text-white">Velocity Pack Library</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Every reusable element across the 22 Velocity Packs — standards, templates, rule libraries, and agent co-workers. Open a card to work with the asset itself.
      </p>
      <div className="mt-6">
        <LibraryBrowser
          packs={packs}
          elements={elements}
          stats={stats}
          artifactKinds={artifactKinds}
          artifactSearch={artifactSearch}
          platforms={platforms}
        />
      </div>
    </section>
  );
}
