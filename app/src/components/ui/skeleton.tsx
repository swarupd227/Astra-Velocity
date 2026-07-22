import { cn } from "@/lib/cn";

/**
 * Shared loading-skeleton primitives. Every route's loading.tsx composes these
 * so streams-in states share one pulse rhythm and the dark slate/teal surface
 * language (rounded-2xl, border-slate-200 dark:border-slate-800, bg-white dark:bg-slate-900/60).
 */

/** Base pulsing bar — size it with width/height utilities. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800/70", className)} />;
}

/** Page header: optional back-link stub, display title, subtitle line. */
export function SkeletonHeader({ backLink = false }: { backLink?: boolean }) {
  return (
    <div className="space-y-2">
      {backLink && <Skeleton className="h-3 w-16" />}
      <Skeleton className="h-8 w-64 max-w-full" />
      <Skeleton className="h-4 w-full max-w-xl" />
    </div>
  );
}

/** Row of stat tiles. Override the grid via className when a route needs more columns. */
export function SkeletonStats({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-3">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="mt-2 h-3 w-24 max-w-full" />
        </div>
      ))}
    </div>
  );
}

/** Card-shaped placeholder: title bar plus a few body lines. */
export function SkeletonCard({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5", className)}>
      <Skeleton className="h-4 w-2/5" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-3/5" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

/** Table-shaped placeholder: header strip plus striped rows. */
export function SkeletonTable({
  rows = 6,
  cols = 5,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60",
        className,
      )}
    >
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <Skeleton className="h-3 w-48 max-w-full" />
      </div>
      <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className={c === 0 ? "h-3 w-1/4" : "h-3 flex-1"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
