import { ShieldCheck } from "lucide-react";
import { ROLE_LABELS, type Role } from "@/lib/roles";

/** Polite permission-denied card (same pattern as the steward surface). */
export function AccessDenied({
  title,
  message,
  role,
}: {
  title: string;
  message: string;
  role: Role;
}) {
  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-10 text-center">
      <ShieldCheck className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
      <h1 className="mt-3 font-display text-2xl text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {message} Your current role ({ROLE_LABELS[role]}) does not carry that permission — switch
        persona in a demo workspace, or ask a platform administrator.
      </p>
    </section>
  );
}
