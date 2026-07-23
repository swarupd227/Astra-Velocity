"use client";

import { useMemo, useState } from "react";
import { Info, Plus, X } from "lucide-react";
import {
  PLATFORM_CATEGORIES,
  PLATFORM_CATEGORY_LABELS,
  type Platform,
  type PlatformKey,
} from "@/content/types";
import type { ProjectPlatformVariant } from "@/db/schema/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlatformInfoDrawer } from "@/components/platform-info-drawer";

export interface PlatformStackValue {
  platformKeys: string[];
  variants: ProjectPlatformVariant[];
}

const MAX_VARIANTS = 4;

function PlatformChip({
  platform,
  selected,
  onToggle,
  onInfo,
}: {
  platform: Platform;
  selected: boolean;
  onToggle: () => void;
  onInfo: () => void;
}) {
  return (
    <span
      className={`group inline-flex items-center gap-1.5 rounded-full border pl-3 pr-1.5 py-1.5 text-xs font-medium transition ${
        selected
          ? "border-teal-500/60 bg-teal-500/10 text-teal-700 dark:text-teal-300"
          : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
      }`}
    >
      <button type="button" onClick={onToggle} aria-pressed={selected} className="inline-flex items-center gap-1.5">
        {platform.name}
        {platform.tier === "anchor" && (
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            anchor
          </span>
        )}
      </button>
      <button
        type="button"
        aria-label={`About ${platform.name}`}
        onClick={onInfo}
        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-300/60 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-slate-700/60 dark:hover:text-white"
      >
        <Info className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}

/** Grouped chip multi-select — reused for the primary stack and every variant row. */
function PlatformChipSelect({
  platforms,
  selectedKeys,
  onToggle,
  onInfo,
}: {
  platforms: Platform[];
  selectedKeys: Set<string>;
  onToggle: (key: PlatformKey) => void;
  onInfo: (platform: Platform) => void;
}) {
  const grouped = useMemo(() => {
    return PLATFORM_CATEGORIES.map((category) => ({
      category,
      items: platforms.filter((p) => p.category === category),
    })).filter((g) => g.items.length > 0);
  }, [platforms]);

  return (
    <div className="space-y-3">
      {grouped.map(({ category, items }) => (
        <div key={category}>
          <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {PLATFORM_CATEGORY_LABELS[category]}
          </h4>
          <div className="flex flex-wrap gap-2">
            {items.map((platform) => (
              <PlatformChip
                key={platform.key}
                platform={platform}
                selected={selectedKeys.has(platform.key)}
                onToggle={() => onToggle(platform.key)}
                onInfo={() => onInfo(platform)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Technology & Platform Stack picker — the composer's third composition axis.
 * Fully controlled: the parent (Composer) owns { platformKeys, variants } and
 * receives every change via onChange. Chips are grouped by category; each
 * chip carries a subtle "anchor" badge for the RFP-named six and an info
 * affordance opening the platform detail drawer. "Add a market variant"
 * duplicates the current primary selection into an independent, labeled row
 * (capped at 4).
 */
export function PlatformStackPicker({
  platforms,
  value,
  onChange,
}: {
  platforms: Platform[];
  value: PlatformStackValue;
  onChange: (value: PlatformStackValue) => void;
}) {
  const [infoPlatform, setInfoPlatform] = useState<Platform | null>(null);

  const primarySelected = useMemo(() => new Set(value.platformKeys), [value.platformKeys]);

  const togglePrimary = (key: PlatformKey) => {
    const next = primarySelected.has(key)
      ? value.platformKeys.filter((k) => k !== key)
      : [...value.platformKeys, key];
    onChange({ ...value, platformKeys: next });
  };

  const addVariant = () => {
    if (value.variants.length >= MAX_VARIANTS) return;
    onChange({
      ...value,
      variants: [...value.variants, { label: "", platformKeys: [...value.platformKeys] }],
    });
  };

  const removeVariant = (index: number) => {
    onChange({ ...value, variants: value.variants.filter((_, i) => i !== index) });
  };

  const updateVariantLabel = (index: number, label: string) => {
    onChange({
      ...value,
      variants: value.variants.map((v, i) => (i === index ? { ...v, label } : v)),
    });
  };

  const toggleVariantPlatform = (index: number, key: PlatformKey) => {
    onChange({
      ...value,
      variants: value.variants.map((v, i) => {
        if (i !== index) return v;
        const has = v.platformKeys.includes(key);
        return {
          ...v,
          platformKeys: has ? v.platformKeys.filter((k) => k !== key) : [...v.platformKeys, key],
        };
      }),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Technology & Platform Stack</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Select the client&apos;s actual stack — element recommendations and the role map below react
          immediately. The RFP&apos;s named six are preselected as anchors.
        </p>
      </div>

      <PlatformChipSelect
        platforms={platforms}
        selectedKeys={primarySelected}
        onToggle={togglePrimary}
        onInfo={setInfoPlatform}
      />

      {value.variants.length > 0 && (
        <div className="space-y-3">
          {value.variants.map((variant, index) => {
            const selected = new Set(variant.platformKeys);
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Input
                    value={variant.label}
                    onChange={(e) => updateVariantLabel(index, e.target.value)}
                    placeholder="e.g. LMI"
                    aria-label={`Market variant ${index + 1} label`}
                    className="max-w-xs"
                  />
                  <Badge variant="outline">market variant</Badge>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    aria-label="Remove market variant"
                    className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 dark:text-slate-400 transition hover:bg-slate-200/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
                <PlatformChipSelect
                  platforms={platforms}
                  selectedKeys={selected}
                  onToggle={(key) => toggleVariantPlatform(index, key)}
                  onInfo={setInfoPlatform}
                />
              </div>
            );
          })}
        </div>
      )}

      {value.variants.length < MAX_VARIANTS && (
        <Button type="button" variant="secondary" size="sm" onClick={addVariant}>
          <Plus className="h-3.5 w-3.5" /> Add a market variant
        </Button>
      )}

      <PlatformInfoDrawer
        open={infoPlatform !== null}
        onClose={() => setInfoPlatform(null)}
        platform={infoPlatform}
      />
    </div>
  );
}
