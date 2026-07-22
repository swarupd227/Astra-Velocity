import { SkeletonCard, SkeletonHeader, SkeletonStats } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      <SkeletonStats count={5} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}
