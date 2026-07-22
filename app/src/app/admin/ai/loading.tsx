import {
  SkeletonCard,
  SkeletonHeader,
  SkeletonStats,
  SkeletonTable,
} from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader backLink />
      <SkeletonStats count={3} className="grid gap-3 sm:grid-cols-3" />
      <SkeletonTable rows={5} cols={5} />
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={2} />
        ))}
      </div>
    </div>
  );
}
