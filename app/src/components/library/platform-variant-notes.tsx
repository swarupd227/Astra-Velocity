"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PlatformVariantNote {
  platformKey: string;
  platformName: string;
  note: string;
}

/**
 * Small tabbed/segmented block of "on this platform, it looks like…" notes —
 * sits near (not inside) the artifact viewer on an element's detail page.
 */
export function PlatformVariantNotes({ variants }: { variants: PlatformVariantNote[] }) {
  const [active, setActive] = useState(0);
  if (variants.length === 0) return null;
  const current = variants[active];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">On your platform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-3">
          {variants.map((v, i) => (
            <button
              key={v.platformKey}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                active === i
                  ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60"
              }`}
            >
              {v.platformName}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">On {current.platformName}: </span>
          {current.note}
        </p>
      </CardContent>
    </Card>
  );
}
