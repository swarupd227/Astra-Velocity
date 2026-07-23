"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  CAPABILITIES,
  CAPABILITY_LABELS,
  PLATFORM_CATEGORY_LABELS,
  type CapabilityRole,
  type Platform,
} from "@/content/types";
import { Badge } from "@/components/ui/badge";

/**
 * Right-side slide-over surfacing one platform's full profile — capability
 * roles, native AI honesty, market context. Mirrors SectorContextDrawer's
 * mechanics exactly: backdrop, Escape, body-scroll-lock, X close, slides in
 * from the right. Purely presentational — open/close state lives in the
 * caller.
 */

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

export function PlatformInfoDrawer({
  open,
  onClose,
  platform,
}: {
  open: boolean;
  onClose: () => void;
  platform: Platform | null;
}) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !platform) return null;

  const roleRows = CAPABILITIES.map((cap) => ({
    capability: cap,
    role: platform.capabilityRoles[cap],
  })).filter((r): r is { capability: (typeof CAPABILITIES)[number]; role: CapabilityRole } =>
    Boolean(r.role),
  );

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${platform.name} platform profile`}
        className="drawer-in-right absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-300 dark:shadow-slate-950"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <span className="text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400">
              {platform.vendor} · {PLATFORM_CATEGORY_LABELS[platform.category]}
            </span>
            <h2 className="font-display text-xl text-slate-900 dark:text-white">{platform.name}</h2>
          </div>
          <button
            type="button"
            aria-label="Close platform profile"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={platform.tier === "anchor" ? "accent" : "outline"}>
              {platform.tier === "anchor" ? "Anchor (RFP-named)" : "Alternate"}
            </Badge>
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{platform.summary}</p>

          {/* Capability roles */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Capability roles
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {roleRows.map(({ capability, role }) => (
                <Badge key={capability} variant={ROLE_BADGE_VARIANT[role]}>
                  {CAPABILITY_LABELS[capability]} · {ROLE_LABEL[role]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Native AI */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Native AI — {platform.nativeAi.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {platform.nativeAi.description}
            </p>
          </div>

          {/* Market context */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Market context
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {platform.marketContext}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <Link
            href={`/platforms/${platform.key}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 dark:text-teal-300 transition hover:text-teal-600 dark:hover:text-teal-200"
          >
            View full platform reference <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
