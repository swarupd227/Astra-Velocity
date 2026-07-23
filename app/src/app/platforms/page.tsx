import Link from "next/link";
import { contentStore } from "@/content/store";
import { PLATFORM_CATEGORIES, PLATFORM_CATEGORY_LABELS } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Technology & Platform Stack — Astra Velocity" };

/**
 * Reference grid of the 12 platforms in the Technology & Platform Stack axis,
 * grouped by category. Not a sidebar destination — reachable via the platform
 * info drawer's "View full platform reference" link and via ⌘K, same
 * treatment as /explore.
 */
export default async function PlatformsPage() {
  const platforms = await contentStore.platforms();

  const grouped = PLATFORM_CATEGORIES.map((category) => ({
    category,
    items: platforms.filter((p) => p.category === category),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl text-slate-900 dark:text-white">
          Technology &amp; Platform Stack
        </h1>
        <p className="mt-1 max-w-2xl text-slate-500 dark:text-slate-400">
          The 12 platforms Astra Velocity composes against — the RFP&apos;s named anchor six plus
          market-realistic alternates, grouped by the role they play in a governance stack.
        </p>
      </header>

      {grouped.map(({ category, items }) => (
        <section key={category}>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
            {PLATFORM_CATEGORY_LABELS[category]}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((platform) => (
              <Link key={platform.key} href={`/platforms/${platform.key}`} className="group block h-full">
                <Card className="flex h-full flex-col transition group-hover:border-teal-500/60">
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={platform.tier === "anchor" ? "accent" : "outline"}>
                        {platform.tier === "anchor" ? "Anchor" : "Alternate"}
                      </Badge>
                      <span className="text-xs text-slate-500">{platform.vendor}</span>
                    </div>
                    <CardTitle className="text-base">{platform.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                      {platform.summary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
