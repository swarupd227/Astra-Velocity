"use client";

import { useActionState, useEffect } from "react";
import { KeyRound, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
import { inviteUserAction, type InviteUserState } from "./actions";

const initialState: InviteUserState = { ok: false };

/**
 * Invite/create user form. The generated temporary password is shown exactly
 * once in the success banner — it cannot be retrieved afterwards.
 */
export function InviteUserForm() {
  const [state, formAction, pending] = useActionState(inviteUserAction, initialState);

  // Toast when the action settles; the banner below carries the one-time password.
  useEffect(() => {
    if (state.ok && state.email) {
      toast(`Account created for ${state.email} — logged to audit trail`, "success");
    } else if (!state.ok && state.error) {
      toast(state.error, "error");
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-white">
        <UserPlus className="h-4 w-4 text-teal-400" /> Invite a user
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Creates the account with a generated temporary password. Share it through a secure channel
        and ask the user to change it at first sign-in.
      </p>

      {state.ok && state.tempPassword && (
        <div className="mt-3 rounded-xl border border-teal-500/40 bg-teal-500/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-teal-300">
            <KeyRound className="h-4 w-4" /> Account created for {state.email}
          </p>
          <p className="mt-1 text-slate-300">
            Temporary password (shown once, not retrievable later):{" "}
            <code className="rounded bg-slate-950 px-2 py-0.5 font-mono text-teal-200">
              {state.tempPassword}
            </code>
          </p>
        </div>
      )}
      {!state.ok && state.error && (
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_200px_auto]">
        <Input name="name" placeholder="Full name" required minLength={2} maxLength={120} />
        <Input name="email" type="email" placeholder="name@company.com" required />
        <Select name="role" defaultValue="pursuit_lead">
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create user"}
        </Button>
      </form>
    </div>
  );
}
