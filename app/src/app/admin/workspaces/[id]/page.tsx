import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, count, eq } from "drizzle-orm";
import { ArrowLeft, Building2, UserMinus, UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import {
  aiCalls,
  aiSettings,
  projects,
  users,
  workspaceKind,
  workspaceMembers,
  workspaces,
} from "@/db/schema";
import { contentStore } from "@/content/store";
import { PLATFORM_KEYS, SECTOR_KEYS } from "@/content/types";
import { hasPermission } from "@/lib/roles";
import {
  parsePlatformScopeValue,
  parseScopeValue,
  platformScopeSettingKey,
  scopeSettingKey,
} from "@/lib/workspace-scope";
import { AccessDenied } from "@/components/access-denied";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input, Select } from "@/components/ui/input";
import { TypeToConfirm } from "@/components/ui/type-to-confirm";
import { saveWorkspaceScopeAction, savePlatformScopeAction } from "../../actions";
import {
  addWorkspaceMemberAction,
  deleteWorkspaceAction,
  removeWorkspaceMemberAction,
  setWorkspaceStatusAction,
  updateWorkspaceAction,
} from "../actions";

export const metadata = { title: "Workspace — Astra Velocity" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ERROR_MESSAGES: Record<string, string> = {
  "not-found": "That workspace no longer exists.",
  "invalid-email": "Enter a valid email address.",
  "no-such-user": "No account with that email — invite them via Users & Roles first.",
  "fk-blocked":
    "Can't delete — this workspace still has AI call history on record. That history is retained for audit/cost purposes and must exist independently of the workspace; it cannot currently be cleared from this screen.",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default async function AdminWorkspaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
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

  const { id } = await params;
  const { error } = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const workspace = await db.query.workspaces.findFirst({ where: eq(workspaces.id, id) });
  if (!workspace) notFound();

  const [members, projectRows, [projectCount], [aiCallCount], sectorScopeRow, platformScopeRow, sectors, platforms] =
    await Promise.all([
      db
        .select({ userId: users.id, name: users.name, email: users.email, joinedAt: workspaceMembers.createdAt })
        .from(workspaceMembers)
        .innerJoin(users, eq(workspaceMembers.userId, users.id))
        .where(eq(workspaceMembers.workspaceId, id))
        .orderBy(asc(workspaceMembers.createdAt)),
      db
        .select({ id: projects.id, name: projects.name, status: projects.status })
        .from(projects)
        .where(eq(projects.workspaceId, id))
        .orderBy(asc(projects.createdAt))
        .limit(50),
      db.select({ n: count() }).from(projects).where(eq(projects.workspaceId, id)),
      db.select({ n: count() }).from(aiCalls).where(eq(aiCalls.workspaceId, id)),
      db
        .select({ value: aiSettings.value })
        .from(aiSettings)
        .where(eq(aiSettings.key, scopeSettingKey(workspace.slug)))
        .limit(1),
      db
        .select({ value: aiSettings.value })
        .from(aiSettings)
        .where(eq(aiSettings.key, platformScopeSettingKey(workspace.slug)))
        .limit(1),
      contentStore.sectors(),
      contentStore.platforms(),
    ]);

  const sectorScope = parseScopeValue(sectorScopeRow[0]?.value);
  const platformScope = parsePlatformScopeValue(platformScopeRow[0]?.value);
  const orderedSectors = SECTOR_KEYS.map((key) => sectors.find((s) => s.key === key) ?? { key, name: key });
  const orderedPlatforms = PLATFORM_KEYS.map((key) => platforms.find((p) => p.key === key) ?? { key, name: key });

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin/workspaces"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-300"
        >
          <ArrowLeft className="h-3 w-3" /> Workspaces
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="flex items-center gap-2 font-display text-3xl text-slate-900 dark:text-white">
            <Building2 className="h-7 w-7 text-teal-600 dark:text-teal-400" /> {workspace.name}
          </h1>
          <Badge variant="outline">{workspace.kind}</Badge>
          <Badge variant={workspace.status === "active" ? "success" : "default"}>{workspace.status}</Badge>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">{workspace.slug}</p>
      </header>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {/* Rename / kind */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Details</h2>
            <ActionForm
              action={updateWorkspaceAction}
              success="Workspace updated"
              error="Could not update the workspace — please try again."
              className="mt-3 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
            >
              <input type="hidden" name="id" value={workspace.id} />
              <Input name="name" defaultValue={workspace.name} required minLength={2} maxLength={160} />
              <Select name="kind" defaultValue={workspace.kind}>
                {workspaceKind.enumValues.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </Select>
              <SubmitButton variant="secondary" pendingLabel="Saving…">
                Save
              </SubmitButton>
            </ActionForm>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Status</p>
                <p className="text-xs text-slate-500">
                  Archiving hides a workspace from active pickers without deleting anything.
                </p>
              </div>
              <ActionForm
                action={setWorkspaceStatusAction}
                success={workspace.status === "active" ? "Workspace archived" : "Workspace reactivated"}
                error="Could not update workspace status."
              >
                <input type="hidden" name="id" value={workspace.id} />
                <input
                  type="hidden"
                  name="status"
                  value={workspace.status === "active" ? "archived" : "active"}
                />
                {workspace.status === "active" ? (
                  <ConfirmButton variant="secondary" prompt="Archive this workspace?" confirmLabel="Archive">
                    Archive
                  </ConfirmButton>
                ) : (
                  <SubmitButton variant="secondary">Reactivate</SubmitButton>
                )}
              </ActionForm>
            </div>
          </section>

          {/* Members */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <div className="border-b border-slate-200 dark:border-slate-800 px-5 py-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Members <span className="font-normal text-slate-500">({members.length})</span>
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <ActionForm
                action={addWorkspaceMemberAction}
                success="Member added"
                error="Could not add that member."
                className="flex flex-wrap items-center gap-2"
              >
                <input type="hidden" name="workspaceId" value={workspace.id} />
                <Input
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="max-w-xs"
                />
                <SubmitButton variant="secondary" size="sm" pendingLabel="Adding…">
                  <UserPlus className="h-3.5 w-3.5" /> Add by email
                </SubmitButton>
              </ActionForm>
              <p className="text-xs text-slate-400 dark:text-slate-600">
                The user must already have an Astra Velocity account — invite them via Users & Roles first.
              </p>

              <ul className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {members.length === 0 && (
                  <li className="py-3 text-xs text-slate-500">No members yet.</li>
                )}
                {members.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div>
                      <p className="text-slate-900 dark:text-white">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                    <ActionForm
                      action={removeWorkspaceMemberAction}
                      success={`Removed ${m.email}`}
                      error="Could not remove that member."
                    >
                      <input type="hidden" name="workspaceId" value={workspace.id} />
                      <input type="hidden" name="userId" value={m.userId} />
                      <ConfirmButton
                        variant="ghost"
                        size="sm"
                        className="text-red-700 dark:text-red-300"
                        prompt="Remove this member?"
                        confirmLabel="Remove"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Remove
                      </ConfirmButton>
                    </ActionForm>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Default sector scope */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Default sector scope</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Narrows the landscape explorer, composer, scenario catalog, library, and command
              palette to the sectors this client operates in. All (or none) selected applies no
              restriction.
            </p>
            <ActionForm action={saveWorkspaceScopeAction} success="Sector scope saved" className="mt-3">
              <input type="hidden" name="slug" value={workspace.slug} />
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {orderedSectors.map((s) => (
                  <label key={s.key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="sectors"
                      value={s.key}
                      defaultChecked={sectorScope ? sectorScope.has(s.key) : true}
                      className="h-3.5 w-3.5 accent-teal-500"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
              <SubmitButton size="sm" variant="secondary" className="mt-3" pendingLabel="Saving…">
                Save sector scope
              </SubmitButton>
            </ActionForm>
          </section>

          {/* Default platform-stack scope */}
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Default technology &amp; platform stack scope
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Narrows which platforms are offered by default when composing a project in this
              workspace. All (or none) selected applies no restriction.
            </p>
            <ActionForm action={savePlatformScopeAction} success="Platform scope saved" className="mt-3">
              <input type="hidden" name="slug" value={workspace.slug} />
              <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
                {orderedPlatforms.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      name="platforms"
                      value={p.key}
                      defaultChecked={platformScope ? platformScope.has(p.key) : true}
                      className="h-3.5 w-3.5 accent-teal-500"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              <SubmitButton size="sm" variant="secondary" className="mt-3" pendingLabel="Saving…">
                Save platform scope
              </SubmitButton>
            </ActionForm>
          </section>

          {/* Danger zone */}
          <section className="rounded-2xl border border-red-500/30 bg-white dark:bg-slate-900/60 p-5">
            <h2 className="text-base font-semibold text-red-700 dark:text-red-300">Danger zone</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Permanently deletes this workspace. Its members and projects go with it; AI call
              history referencing it will block the delete until cleared.
            </p>
            <ActionForm
              action={deleteWorkspaceAction}
              error="Could not delete the workspace — please try again."
              className="mt-3"
            >
              <input type="hidden" name="id" value={workspace.id} />
              <TypeToConfirm
                confirmText={workspace.slug}
                triggerLabel="Permanently delete workspace"
                destroyLabel="Delete workspace permanently"
                description={`This deletes "${workspace.name}" and everything scoped to it. This cannot be undone.`}
                consequences={[
                  `${projectCount.n} project${projectCount.n === 1 ? "" : "s"} will be permanently deleted`,
                  `${members.length} membership${members.length === 1 ? "" : "s"} will be removed`,
                  ...(aiCallCount.n > 0
                    ? [
                        `${aiCallCount.n} AI call log entr${aiCallCount.n === 1 ? "y" : "ies"} reference this workspace — deletion will be blocked until that history is cleared`,
                      ]
                    : []),
                ]}
              />
            </ActionForm>
          </section>
        </div>

        {/* Projects */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
            <p className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">
              Projects <span className="font-normal text-slate-500">({projectCount.n})</span>
            </p>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {projectRows.length === 0 && (
                <li className="px-4 py-3 text-xs text-slate-500">No projects yet.</li>
              )}
              {projectRows.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs">
                  <span className="truncate text-slate-700 dark:text-slate-200">{p.name}</span>
                  <Badge variant="outline">{p.status}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Metadata</p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-600 dark:text-slate-300">{dateFmt.format(workspace.createdAt)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">Updated</dt>
                <dd className="text-slate-600 dark:text-slate-300">{dateFmt.format(workspace.updatedAt)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-slate-500">AI calls</dt>
                <dd className="text-slate-600 dark:text-slate-300 tabular-nums">{aiCallCount.n}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
