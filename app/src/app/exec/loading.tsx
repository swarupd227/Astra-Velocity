import { SkeletonCard, SkeletonHeader, SkeletonStats } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonStats count={4} className="grid grid-cols-2 gap-4 xl:grid-cols-4" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={5} />
        ))}
      </div>
    </div>
  );
}
