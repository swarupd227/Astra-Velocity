import { contentStore } from "@/content/store";
import { LibraryBrowser } from "@/components/library/library-browser";

export const metadata = { title: "Velocity Pack Library — Astra Velocity" };

export default async function LibraryPage() {
  const [packs, elements] = await Promise.all([contentStore.packs(), contentStore.elements()]);

  return (
    <section>
      <h1 className="font-display text-3xl text-white">Velocity Pack Library</h1>
      <p className="mt-1 text-sm text-slate-400">
        Every reusable element across the 22 Velocity Packs — standards, templates, rule libraries, and agent co-workers.
      </p>
      <div className="mt-6">
        <LibraryBrowser packs={packs} elements={elements} />
      </div>
    </section>
  );
}
