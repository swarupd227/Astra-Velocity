"use client";

import { useActionState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { createWorkspaceAction, type CreateWorkspaceState } from "./actions";

const initialState: CreateWorkspaceState = { ok: false };

export function NewWorkspaceForm({ kinds }: { kinds: readonly string[] }) {
  const [state, formAction, pending] = useActionState(createWorkspaceAction, initialState);

  useEffect(() => {
    if (!state.ok && state.error) toast(state.error, "error");
  }, [state]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
      <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
        <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" /> New workspace
      </h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Slugs are permanent join keys — kebab-case, lowercase, no spaces.
      </p>

      {!state.ok && state.error && (
        <div className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_160px_auto]">
        <Input name="name" placeholder="Workspace name" required minLength={2} maxLength={160} />
        <Input
          name="slug"
          placeholder="workspace-slug"
          required
          pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          title="lowercase kebab-case"
        />
        <Select name="kind" defaultValue={kinds[0]}>
          {kinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create"}
        </Button>
      </form>
    </div>
  );
}
