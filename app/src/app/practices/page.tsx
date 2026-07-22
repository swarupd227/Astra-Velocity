import { contentStore } from "@/content/store";
import { PracticesHub } from "@/components/practices/practices-hub";
import { getSectorScope } from "@/lib/workspace-scope";

export const metadata = { title: "Best Practices Hub — Astra Velocity" };

export default async function PracticesPage() {
  const [practices, allSectors, elements, obligations, scope] = await Promise.all([
    contentStore.bestPractices(),
    contentStore.sectors(),
    contentStore.elements(),
    contentStore.obligations(),
    getSectorScope(),
  ]);

  // Workspace sector scope: the sector-note selector only offers in-scope sectors.
  const sectors = allSectors.filter((s) => scope.has(s.key));

  return (
    <section>
      <h1 className="font-display text-3xl text-slate-900 dark:text-white">Best Practices Hub</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        The canon of insurance data governance practice — every rule of operation, its anti-pattern, and the library elements that put it to work.
      </p>
      <div className="mt-6">
        <PracticesHub
          practices={practices}
          sectors={sectors.map((s) => ({ key: s.key, name: s.name }))}
          elements={elements.map((el) => ({
            key: el.key,
            name: el.name,
            bestPracticeKeys: el.bestPracticeKeys,
          }))}
          obligations={obligations.map((o) => ({ key: o.key, name: o.name }))}
        />
      </div>
    </section>
  );
}
