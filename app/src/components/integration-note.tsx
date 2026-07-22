import { ArrowRight, Workflow } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Slim annotation band that positions Astra Velocity as a complement to the
 * client's existing data stack: what composes here deploys into the tools
 * they already run. Optionally renders an "integration chain" of chips joined
 * by arrows, e.g. BigID discovery → your catalog (CDGC/Collibra) →
 * warehouse tags (Snowflake) → policy engine (Immuta).
 */
export function IntegrationNote({
  title,
  body,
  chain,
  className,
}: {
  title: string;
  body: React.ReactNode;
  /** Optional chain of stages rendered as chips joined by arrows. */
  chain?: string[];
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "rounded-r-xl border-l-2 border-teal-500 bg-teal-500/[0.06] dark:bg-teal-500/[0.09] px-4 py-3.5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Workflow className="mt-0.5 h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-300">
            {title}
          </p>
          <div className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</div>
          {chain && chain.length > 0 && (
            <p className="mt-2.5 flex flex-wrap items-center gap-y-1.5">
              {chain.map((step, i) => (
                <span key={step} className="flex items-center">
                  <span className="rounded-full border border-teal-500/30 bg-white/80 dark:bg-slate-950/50 px-2.5 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                    {step}
                  </span>
                  {i < chain.length - 1 && (
                    <ArrowRight
                      className="mx-1 h-3 w-3 shrink-0 text-teal-600/70 dark:text-teal-400/70"
                      aria-hidden
                    />
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
