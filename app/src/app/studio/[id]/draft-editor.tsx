"use client";

import { useActionState, useEffect } from "react";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { saveDraftAction, type SaveDraftState } from "../actions";

const initialState: SaveDraftState = { ok: false };

/**
 * Inline JSON editor for draft revisions. Save validates the payload against
 * the Zod schema for the item's kind server-side; issues are listed here.
 */
export function DraftEditor({
  id,
  kindLabel,
  initialPayload,
}: {
  id: string;
  kindLabel: string;
  initialPayload: string;
}) {
  const [state, formAction, pending] = useActionState(saveDraftAction, initialState);

  // Toast when a save settles; the inline blocks below carry the details.
  useEffect(() => {
    if (state.ok && state.savedAt) {
      toast("Draft saved and validated — logged to audit trail", "success");
    } else if (!state.ok && state.errors && state.errors.length > 0) {
      toast("Validation failed — nothing was saved", "error");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Textarea
        name="payload"
        rows={26}
        defaultValue={initialPayload}
        spellCheck={false}
        className="font-mono text-xs leading-relaxed"
        aria-label="Draft payload JSON"
      />

      {state.errors && state.errors.length > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
            <TriangleAlert className="h-4 w-4" /> Validation failed — nothing was saved
          </p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-red-700 dark:text-red-200">
            {state.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {state.ok && state.savedAt && (
        <div className="flex items-center gap-2 rounded-xl border border-teal-500/40 bg-teal-500/10 p-3 text-sm text-teal-700 dark:text-teal-300">
          <CircleCheck className="h-4 w-4" /> Draft saved and validated against the {kindLabel}{" "}
          schema.
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Validating…" : "Validate & save draft"}
        </Button>
        <p className="text-xs text-slate-500">
          The payload must satisfy the {kindLabel} schema; the item key cannot change.
        </p>
      </div>
    </form>
  );
}
