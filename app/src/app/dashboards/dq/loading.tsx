import { SkeletonCard, SkeletonHeader, SkeletonStats } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader backLink />
      <SkeletonStats />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={6} />
        ))}
      </div>
    </div>
  );
}
