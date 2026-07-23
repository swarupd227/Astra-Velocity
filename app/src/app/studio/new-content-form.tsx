"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { AiEnhancePanel } from "@/components/studio/ai-enhance-panel";
import type { ContentKind } from "@/content/types";
import { createBlankDraftAction, type CreateBlankDraftState } from "./actions";
import { blankPayloadForKind, KIND_LABELS } from "./kind-schemas";

const initialState: CreateBlankDraftState = { ok: false };
const FREEFORM_KEY_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * "New content" entry point: kind + key, then a blank-but-schema-valid
 * draft. Sector/scenario/platform keys are fixed enums — offered as a
 * select of the values not already in use; every other kind takes a
 * freeform kebab-case key. AI Enhance sits beside the (hidden, but seeded
 * and previewed) payload: describe what you want instead of hand-editing
 * the TODO skeleton, then apply before creating.
 */
export function NewContentForm({
  kinds,
  enumOptions,
}: {
  kinds: readonly ContentKind[];
  enumOptions: Partial<Record<ContentKind, string[]>>;
}) {
  const [state, formAction, pending] = useActionState(createBlankDraftAction, initialState);
  const [kind, setKind] = useState<ContentKind>(kinds[0]);
  const [freeKey, setFreeKey] = useState("");
  const [enumKeySel, setEnumKeySel] = useState(() => enumOptions[kinds[0]]?.[0] ?? "");
  // An AI Enhance suggestion the author has applied, overriding the blank skeleton —
  // cleared whenever kind or key changes (handled inline in the change handlers below,
  // never via an effect, so applying it never cascades an extra render).
  const [payloadOverride, setPayloadOverride] = useState<unknown>(null);

  useEffect(() => {
    if (!state.ok && state.error) toast(state.error, "error");
  }, [state]);

  const availableEnumKeys = useMemo(() => enumOptions[kind], [enumOptions, kind]);
  const isEnumKind = availableEnumKeys !== undefined;
  const key = isEnumKind ? enumKeySel : freeKey.trim();
  const keyIsValid = isEnumKind ? Boolean(enumKeySel) : FREEFORM_KEY_PATTERN.test(key);

  // Seeded skeleton for the chosen kind+key; AI Enhance drafts a suggestion starting from
  // this instead of the author hand-editing the TODO placeholders.
  const blankSkeleton = useMemo(
    () => blankPayloadForKind(kind, key || "todo-key"),
    [kind, key],
  );
  const payload = payloadOverride ?? blankSkeleton;

  function handleKindChange(next: ContentKind) {
    setKind(next);
    setEnumKeySel(enumOptions[next]?.[0] ?? "");
    setFreeKey("");
    setPayloadOverride(null);
  }

  function handleFreeKeyChange(next: string) {
    setFreeKey(next);
    setPayloadOverride(null);
  }

  function handleEnumKeyChange(next: string) {
    setEnumKeySel(next);
    setPayloadOverride(null);
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        <FilePlus2 className="h-4 w-4 text-teal-600 dark:text-teal-400" /> New content
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Creates a blank draft (version 1) with a schema-valid starter shell — fill it in, then
        publish when ready.
      </p>

      {!state.ok && state.error && (
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr_auto]">
        <Select
          name="kind"
          value={kind}
          onChange={(e) => handleKindChange(e.target.value as ContentKind)}
        >
          {kinds.map((k) => (
            <option key={k} value={k}>
              {KIND_LABELS[k]}
            </option>
          ))}
        </Select>

        {isEnumKind ? (
          <Select
            name="key"
            value={enumKeySel}
            onChange={(e) => handleEnumKeyChange(e.target.value)}
            disabled={availableEnumKeys.length === 0}
          >
            {availableEnumKeys.length === 0 ? (
              <option value="">No available keys — all in use</option>
            ) : (
              availableEnumKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))
            )}
          </Select>
        ) : (
          <Input
            name="key"
            value={freeKey}
            onChange={(e) => handleFreeKeyChange(e.target.value)}
            placeholder="new-item-key"
            required
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            title="lowercase kebab-case"
          />
        )}

        <input type="hidden" name="payload" value={JSON.stringify(payload)} />

        <Button type="submit" disabled={pending || !keyIsValid}>
          {pending ? "Creating…" : `Create ${KIND_LABELS[kind]}`}
        </Button>
      </form>

      {keyIsValid ? (
        <div className="mt-4">
          <AiEnhancePanel
            kind={kind}
            kindLabel={KIND_LABELS[kind]}
            currentPayloadText={JSON.stringify(payload)}
            onApply={setPayloadOverride}
          />
        </div>
      ) : (
        <p className="mt-4 text-xs text-slate-400 dark:text-slate-600">
          Choose a kind and a valid key to enable AI Enhance for this draft.
        </p>
      )}
    </div>
  );
}
