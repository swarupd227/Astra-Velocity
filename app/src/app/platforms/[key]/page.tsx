import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { contentStore } from "@/content/store";
import {
  CAPABILITIES,
  CAPABILITY_LABELS,
  PLATFORM_CATEGORY_LABELS,
  type CapabilityRole,
} from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_BADGE_VARIANT: Record<CapabilityRole, "accent" | "outline" | "success"> = {
  anchor: "accent",
  supports: "outline",
  enforces: "success",
};

const ROLE_LABEL: Record<CapabilityRole, string> = {
  anchor: "Anchor",
  supports: "Supports",
  enforces: "Enforces",
};

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const platforms = await contentStore.platforms();
  const platform = platforms.find((p) => p.key === key);
  return {
    title: platform ? `${platform.name} — Astra Velocity` : "Platform — Astra Velocity",
  };
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const [platforms, bestPractices, elements] = await Promise.all([
    contentStore.platforms(),
    contentStore.bestPractices(),
    contentStore.elements(),
  ]);

  const platform = platforms.find((p) => p.key === key);
  if (!platform) notFound();

  const roleRows = CAPABILITIES.map((cap) => ({
    capability: cap,
    role: platform.capabilityRoles[cap],
  })).filter((r): r is { capability: (typeof CAPABILITIES)[number]; role: CapabilityRole } =>
    Boolean(r.role),
  );

  const usedByPractices = bestPractices.filter((bp) => bp.platformNotes?.[platform.key]);
  const usedByElements = elements.filter(
    (el) =>
      (el.platformAffinity?.[platform.key] ?? 0) > 0 ||
      (el.platformVariants ?? []).some((v) => v.platformKey === platform.key),
  );

  return (
    <div className="space-y-6">
      <Link
        href="/platforms"
        className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Technology &amp; Platform Stack
      </Link>

      <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={platform.tier === "anchor" ? "accent" : "outline"}>
            {platform.tier === "anchor" ? "Anchor (RFP-named)" : "Alternate"}
          </Badge>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {platform.vendor} · {PLATFORM_CATEGORY_LABELS[platform.category]}
          </span>
        </div>
        <h1 className="mt-3 font-display text-3xl text-slate-900 dark:text-white">{platform.name}</h1>
        <p className="mt-1 max-w-3xl text-slate-500 dark:text-slate-400">{platform.summary}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Capability roles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {roleRows.map(({ capability, role }) => (
                  <Badge key={capability} variant={ROLE_BADGE_VARIANT[role]}>
                    {CAPABILITY_LABELS[capability]} · {ROLE_LABEL[role]}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Native AI — {platform.nativeAi.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {platform.nativeAi.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Market context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {platform.marketContext}
              </p>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-20">
          {usedByPractices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Best practices on {platform.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {usedByPractices.map((bp) => (
                  <Link
                    key={bp.key}
                    href="/practices"
                    className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3 transition hover:border-teal-500/50"
                  >
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{bp.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bp.statement}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {usedByElements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Library elements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {usedByElements.map((el) => (
                  <Link
                    key={el.key}
                    href={`/library/${el.key}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 p-3 text-sm text-slate-600 dark:text-slate-300 transition hover:border-teal-500/50"
                  >
                    <span className="truncate">{el.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
