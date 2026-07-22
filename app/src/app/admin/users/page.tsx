import Link from "next/link";
import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { hasPermission, ROLE_LABELS, ROLES } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Select } from "@/components/ui/input";
import { setUserActiveAction, updateUserRoleAction } from "./actions";
import { InviteUserForm } from "./invite-form";

export const metadata = { title: "Users & Roles — Astra Velocity" };

const ERROR_MESSAGES: Record<string, string> = {
  "self-demote": "You cannot remove your own platform administrator role.",
  "self-deactivate": "You cannot deactivate your own account.",
  "not-found": "That user no longer exists.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "admin.users")) {
    return (
      <AccessDenied
        title="Users & Roles"
        message="User administration requires the admin.users permission."
        role={session.user.role}
      />
    );
  }

  const { error } = await searchParams;
  const rows = await db.select().from(users).orderBy(asc(users.createdAt));

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-300"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="mt-1 font-display text-3xl text-white">Users & Roles</h1>
        <p className="mt-1 text-sm text-slate-400">
          Assign platform roles and manage account status. Every change is written to the audit
          trail; role changes take effect at the user&apos;s next sign-in.
        </p>
      </header>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <InviteUserForm />

      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Account</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const isSelf = u.id === session.user.id;
              return (
                <tr key={u.id} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-4 py-3 text-white">
                    {u.name}
                    {isSelf && (
                      <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                        you
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3">
                    <ActionForm
                      action={updateUserRoleAction}
                      success={`Role updated for ${u.email} — takes effect at next sign-in`}
                      error="Could not update the role — please try again."
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <Select
                        name="role"
                        defaultValue={u.role}
                        className="w-48"
                        aria-label={`Role for ${u.email}`}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {ROLE_LABELS[role]}
                          </option>
                        ))}
                      </Select>
                      <SubmitButton variant="secondary" size="sm" pendingLabel="Applying…">
                        Apply
                      </SubmitButton>
                    </ActionForm>
                  </td>
                  <td className="px-4 py-3">
                    {u.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="danger">Deactivated</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400 tabular-nums">
                    {dateFmt.format(u.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <ActionForm
                      action={setUserActiveAction}
                      success={
                        u.isActive
                          ? `Account deactivated for ${u.email} — audit history retained`
                          : `Account reactivated for ${u.email}`
                      }
                      error="Could not update the account status — please try again."
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="active" value={u.isActive ? "false" : "true"} />
                      {u.isActive ? (
                        <ConfirmButton
                          variant="ghost"
                          size="sm"
                          className="text-red-300"
                          prompt="Deactivate this account?"
                          confirmLabel="Deactivate"
                          disabled={isSelf}
                          title={isSelf ? "You cannot deactivate your own account" : undefined}
                        >
                          Deactivate
                        </ConfirmButton>
                      ) : (
                        <SubmitButton variant="ghost" size="sm" className="text-teal-300">
                          Reactivate
                        </SubmitButton>
                      )}
                    </ActionForm>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-600">
        Deactivated accounts cannot sign in; their audit history is retained.
      </p>
    </div>
  );
}
