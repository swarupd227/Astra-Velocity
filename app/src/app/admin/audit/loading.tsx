import { Skeleton, SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader backLink />
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-40 rounded-lg" />
        ))}
      </div>
      <SkeletonTable rows={10} cols={5} />
    </div>
  );
}
