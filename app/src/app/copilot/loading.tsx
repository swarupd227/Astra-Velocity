import { Skeleton, SkeletonCard, SkeletonHeader } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader />
      <SkeletonCard lines={8} />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
