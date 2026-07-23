import Link from "next/link";
import { redirect } from "next/navigation";
import { asc, count } from "drizzle-orm";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { projects, workspaceKind, workspaceMembers, workspaces } from "@/db/schema";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { Badge } from "@/components/ui/badge";
import { NewWorkspaceForm } from "./new-workspace-form";

export const metadata = { title: "Workspaces — Astra Velocity" };

const ERROR_MESSAGES: Record<string, string> = {
  "not-found": "That workspace no longer exists.",
};

export default async function AdminWorkspacesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "admin.platform")) {
    return (
      <AccessDenied
        title="Workspaces"
        message="Workspace administration requires the admin.platform permission."
        role={session.user.role}
      />
    );
  }

  const { error } = await searchParams;

  const [rows, memberCounts, projectCounts] = await Promise.all([
    db.select().from(workspaces).orderBy(asc(workspaces.createdAt)),
    db
      .select({ workspaceId: workspaceMembers.workspaceId, n: count() })
      .from(workspaceMembers)
      .groupBy(workspaceMembers.workspaceId),
    db
      .select({ workspaceId: projects.workspaceId, n: count() })
      .from(projects)
      .groupBy(projects.workspaceId),
  ]);

  const memberCountByWs = new Map(memberCounts.map((r) => [r.workspaceId, r.n]));
  const projectCountByWs = new Map(projectCounts.map((r) => [r.workspaceId, r.n]));

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-300"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="mt-1 flex items-center gap-3 font-display text-3xl text-slate-900 dark:text-white">
          <Building2 className="h-7 w-7 text-teal-600 dark:text-teal-400" /> Workspaces
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Pursuit, engagement, and demo workspaces — membership, status, and default scoping.
          Every change is audit-logged.
        </p>
      </header>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <NewWorkspaceForm kinds={workspaceKind.enumValues} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Kind</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Members</th>
              <th className="px-4 py-3 text-right font-medium">Projects</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-500">
                  No workspaces yet.
                </td>
              </tr>
            )}
            {rows.map((ws) => (
              <tr
                key={ws.id}
                className="border-b border-slate-200/70 dark:border-slate-800/60 last:border-0 hover:bg-slate-200/40 dark:hover:bg-slate-800/30"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/workspaces/${ws.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-teal-700 dark:hover:text-teal-300"
                  >
                    {ws.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{ws.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{ws.kind}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ws.status === "active" ? "success" : "default"}>{ws.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                  {memberCountByWs.get(ws.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300 tabular-nums">
                  {projectCountByWs.get(ws.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/workspaces/${ws.id}`}
                    className="inline-flex items-center gap-1 text-xs text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200"
                  >
                    Manage <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
