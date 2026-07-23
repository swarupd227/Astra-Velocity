"use client";

import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { SubmitButton } from "@/components/ui/action-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Hard-delete confirmation, stronger than ConfirmButton: shows what will be
 * destroyed, requires typing the exact name/slug/key before the destroy
 * button enables, and never auto-reverts — the danger panel stays open
 * until the user explicitly cancels or submits. Meant to be rendered inside
 * an ActionForm's <form> (the destroy button is a real submit button).
 */
export function TypeToConfirm({
  confirmText,
  consequences = [],
  triggerLabel,
  destroyLabel = "Delete permanently",
  description,
  triggerVariant = "danger",
  className,
}: {
  /** The exact string the user must type — e.g. a slug, email, or "kind/key". */
  confirmText: string;
  /** What this action destroys, shown as a bulleted warning list. */
  consequences?: string[];
  triggerLabel: React.ReactNode;
  destroyLabel?: string;
  description?: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const matches = typed.length > 0 && typed === confirmText;

  if (!open) {
    return (
      <Button type="button" variant={triggerVariant} className={className} onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
    );
  }

  return (
    <div
      className={
        "space-y-3 rounded-xl border-2 border-red-500/60 bg-red-500/5 dark:bg-red-500/10 p-4 " +
        (className ?? "")
      }
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-red-800 dark:text-red-200">
        <TriangleAlert className="h-4 w-4 shrink-0" /> This cannot be undone
      </p>
      {description && <p className="text-sm text-red-800/90 dark:text-red-200/90">{description}</p>}
      {consequences.length > 0 && (
        <ul className="list-inside list-disc space-y-1 text-sm text-red-700 dark:text-red-300">
          {consequences.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      <label className="block text-xs font-medium text-red-800 dark:text-red-200">
        Type <code className="rounded bg-red-500/15 px-1 py-0.5 font-mono">{confirmText}</code> to
        confirm
        <Input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="mt-1 border-red-400 focus:border-red-500 dark:border-red-800"
          aria-label={`Type ${confirmText} to confirm`}
        />
      </label>
      <div className="flex items-center gap-2">
        <SubmitButton variant="danger" disabled={!matches}>
          {destroyLabel}
        </SubmitButton>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setOpen(false);
            setTyped("");
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
