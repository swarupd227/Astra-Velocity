import { contentStore } from "@/content/store";
import { LibraryBrowser } from "@/components/library/library-browser";
import { elementStat } from "@/components/library/artifact-stat";

export const metadata = { title: "Velocity Pack Library — Astra Velocity" };

export default async function LibraryPage() {
  const [packs, elements] = await Promise.all([contentStore.packs(), contentStore.elements()]);

  // Concrete artifact stats ("24 terms", "18 rules · 3 critical") per element,
  // computed here so the client browser never touches artifact payloads.
  const stats: Record<string, string> = {};
  for (const el of elements) {
    const stat = elementStat(el);
    if (stat) stats[el.key] = stat;
  }

  return (
    <section>
      <h1 className="font-display text-3xl text-white">Velocity Pack Library</h1>
      <p className="mt-1 text-sm text-slate-400">
        Every reusable element across the 22 Velocity Packs — standards, templates, rule libraries, and agent co-workers. Open a card to work with the asset itself.
      </p>
      <div className="mt-6">
        <LibraryBrowser packs={packs} elements={elements} stats={stats} />
      </div>
    </section>
  );
}
