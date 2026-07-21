import type { LucideIcon } from "lucide-react";

/** Phase-0 placeholder for persona home pages; replaced by real experiences per phase. */
export function PersonaPlaceholder({
  icon: Icon,
  title,
  subtitle,
  items,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  items: string[];
}) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="rounded-xl bg-teal-500/10 p-2.5">
          <Icon className="h-6 w-6 text-teal-400" aria-hidden />
        </span>
        <div>
          <h1 className="font-serif text-2xl text-white">{title}</h1>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400"
          >
            {item}
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-600">Coming online</p>
          </div>
        ))}
      </div>
    </section>
  );
}
