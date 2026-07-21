"use client";

import { CAPABILITY_LABELS, type Element } from "@/content/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * One library element. Agents get a distinct "digital co-worker" treatment:
 * teal border accent plus the drafts / human-decides / leverage contract.
 */
export function ElementCard({ element, typeLabel }: { element: Element; typeLabel: string }) {
  const isAgent = element.type === "agent";

  return (
    <Card className={isAgent ? "border-teal-500/50 bg-teal-500/[0.04]" : undefined}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isAgent ? "accent" : "default"}>{isAgent ? "Agent co-worker" : typeLabel}</Badge>
          {element.effortSavedStewardWeeks !== undefined && (
            <Badge variant="success">saves ~{element.effortSavedStewardWeeks} steward-weeks</Badge>
          )}
        </div>
        <CardTitle className="text-sm">{element.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-slate-400">{element.pitch}</p>

        <div className="flex flex-wrap gap-1.5">
          {element.capabilities.map((c) => (
            <Badge key={c} variant="outline">
              {CAPABILITY_LABELS[c]}
            </Badge>
          ))}
        </div>

        <p className="text-xs italic text-slate-500">{element.soWhat}</p>

        {isAgent && element.agentMeta && (
          <div className="space-y-2 rounded-xl border border-teal-500/30 bg-slate-950/60 p-3">
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-teal-300">Drafts: </span>
              {element.agentMeta.drafts}
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-teal-300">You decide: </span>
              {element.agentMeta.humanDecides}
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-semibold text-teal-300">Measured by: </span>
              {element.agentMeta.leverageMetric}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {element.agentMeta.guardrails.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}

        {element.toolTags.length > 0 && (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {element.toolTags.map((t) => (
              <span key={t} className="text-[11px] text-slate-600">
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
