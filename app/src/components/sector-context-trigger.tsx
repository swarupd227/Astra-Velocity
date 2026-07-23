"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import { SectorContextDrawer, type SectorContextData } from "@/components/sector-context-drawer";

/**
 * Small client wrapper owning the sector context drawer's open/close state.
 * Reused both in the composer's sector cards (before a sector is picked) and
 * the composer's composition header (after sector + scenario are chosen) —
 * each instance is self-contained, so multiple can sit on the page at once.
 */
export function SectorContextTrigger({
  data,
  label = "Business context",
  className,
}: {
  data: SectorContextData;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // Cards this sits inside also carry a select action — never let the
          // trigger fall through to that.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white"
        }
      >
        <Building2 className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>
      <SectorContextDrawer open={open} onClose={() => setOpen(false)} data={data} />
    </>
  );
}
