"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Two-step destructive button: first click swaps to an inline
 * "Are you sure? Confirm / Cancel" state that auto-reverts after 3s.
 * No modal, no portal — it stays exactly where the action lives.
 *
 * Inside a form, leave `type` as "submit" and the Confirm click submits it.
 * Outside a form, pass `type="button"` and an `onConfirm` handler.
 */
export function ConfirmButton({
  children,
  confirmLabel = "Confirm",
  prompt = "Are you sure?",
  onConfirm,
  type = "submit",
  variant,
  size,
  className,
  disabled,
  title,
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  prompt?: string;
  onConfirm?: () => void;
  type?: "submit" | "button";
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  disabled?: boolean;
  title?: string;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), 3000);
    return () => window.clearTimeout(timer);
  }, [armed]);

  if (!armed) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={disabled}
        title={title}
        onClick={() => setArmed(true)}
      >
        {children}
      </Button>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">{prompt}</span>
      <Button
        type={type}
        variant="danger"
        size={size ?? "sm"}
        onClick={() => {
          setArmed(false);
          onConfirm?.();
        }}
      >
        {confirmLabel}
      </Button>
      <Button type="button" variant="ghost" size={size ?? "sm"} onClick={() => setArmed(false)}>
        Cancel
      </Button>
    </span>
  );
}
