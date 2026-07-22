import { SkeletonCard, SkeletonHeader, SkeletonTable } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <SkeletonHeader backLink />
      <SkeletonCard lines={2} />
      <SkeletonTable rows={7} cols={6} />
    </div>
  );
}
