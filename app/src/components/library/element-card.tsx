"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAPABILITY_LABELS, type Element } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";

/**
 * One library element — the whole card opens the element's detail page, where
 * its working artifact renders in full. Agents keep the teal "digital
 * co-worker" accent; the stat chip surfaces concrete artifact contents
 * ("24 terms", "18 rules") computed server-side.
 */
export function ElementCard({
  element,
  typeLabel,
  stat,
}: {
  element: Element;
  typeLabel: string;
  stat?: string;
}) {
  const isAgent = element.type === "agent";

  return (
    <Link href={`/library/${element.key}`} className="group block h-full">
      <Card
        className={cn(
          "flex h-full flex-col transition group-hover:border-teal-500/60",
          isAgent && "border-teal-500/50 bg-teal-500/[0.04]",
        )}
      >
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isAgent ? "accent" : "default"}>
              {isAgent ? "Agent co-worker" : typeLabel}
            </Badge>
            {element.effortSavedStewardWeeks !== undefined && (
              <Badge variant="success">saves ~{element.effortSavedStewardWeeks} steward-weeks</Badge>
            )}
          </div>
          <CardTitle className="text-sm">{element.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">{element.pitch}</p>

          <div className="flex flex-wrap gap-1.5">
            {element.capabilities.map((c) => (
              <Badge key={c} variant="outline">
                {CAPABILITY_LABELS[c]}
              </Badge>
            ))}
          </div>

          {element.toolTags.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              {element.toolTags.map((t) => (
                <span key={t} className="text-[11px] text-slate-400 dark:text-slate-600">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 border-t border-slate-200/70 dark:border-slate-800/60 pt-3">
            {stat && (
              <span className="inline-flex items-center rounded-full bg-teal-500/15 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-300">
                {stat}
              </span>
            )}
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition group-hover:text-teal-600 dark:group-hover:text-teal-300">
              Open <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
