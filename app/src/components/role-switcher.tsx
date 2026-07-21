"use client";

import { useTransition } from "react";
import { UserRound } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";

export function RoleSwitcher({
  active,
  options,
  onSwitch,
}: {
  active: Role;
  options: Role[];
  onSwitch: (persona: Role) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">
      <UserRound className="h-4 w-4 text-teal-400" aria-hidden />
      <span className="sr-only">Viewing as</span>
      <select
        className="bg-transparent text-sm text-slate-200 outline-none disabled:opacity-50"
        value={active}
        disabled={pending}
        onChange={(e) => {
          const persona = e.target.value as Role;
          startTransition(() => onSwitch(persona));
        }}
      >
        {options.map((r) => (
          <option key={r} value={r} className="bg-slate-900">
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
    </label>
  );
}
