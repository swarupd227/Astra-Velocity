import { SkeletonCard, SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <SkeletonHeader />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <SkeletonTable rows={8} cols={4} />
        <SkeletonCard lines={6} />
      </div>
    </div>
  );
}
