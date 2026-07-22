"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { isNextRedirect, toast } from "@/components/ui/toaster";

/**
 * Client form wrapper around an unchanged server action: on settle it fires a
 * success or error toast. Server pages can render this directly and pass the
 * action reference through as a prop — no changes to the actions themselves.
 */
export function ActionForm({
  action,
  success,
  error = "Something went wrong — please try again.",
  ...formProps
}: {
  action: (formData: FormData) => Promise<void>;
  /** Toast on success; omit for redirect-driven flows that surface their own banner. */
  success?: string;
  error?: string;
} & Omit<React.FormHTMLAttributes<HTMLFormElement>, "action">) {
  return (
    <form
      {...formProps}
      action={async (formData: FormData) => {
        try {
          await action(formData);
          if (success) toast(success, "success");
        } catch (err) {
          if (isNextRedirect(err)) throw err;
          toast(error, "error");
        }
      }}
    />
  );
}

/** Submit button that disables itself and swaps its label while the form is pending. */
export function SubmitButton({
  pendingLabel,
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
