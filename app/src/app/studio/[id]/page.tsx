import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeft, FilePlus2, Rocket, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { contentItems } from "@/db/schema";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { createDraftAction, discardDraftAction, publishDraftAction } from "../actions";
import { KIND_LABELS, payloadName } from "../kind-schemas";
import { DraftEditor } from "./draft-editor";

export const metadata = { title: "Content Item — Astra Velocity" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_VARIANT = {
  draft: "highlight",
  published: "success",
  deprecated: "default",
} as const;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const ERROR_MESSAGES: Record<string, string> = {
  "not-a-draft": "That action applies to draft versions only.",
  "invalid-payload":
    "This draft does not satisfy its content schema — fix the payload and save before publishing.",
};

export default async function StudioItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "library.author")) {
    return (
      <AccessDenied
        title="Library Studio"
        message="Authoring and publishing governed library content requires the library.author permission."
        role={session.user.role}
      />
    );
  }

  const { id } = await params;
  const { error } = await searchParams;
  if (!UUID_RE.test(id)) notFound();

  const item = await db.query.contentItems.findFirst({ where: eq(contentItems.id, id) });
  if (!item) notFound();

  const versions = await db
    .select({
      id: contentItems.id,
      version: contentItems.version,
      status: contentItems.status,
      updatedAt: contentItems.updatedAt,
      createdBy: contentItems.createdBy,
    })
    .from(contentItems)
    .where(and(eq(contentItems.kind, item.kind), eq(contentItems.key, item.key)))
    .orderBy(desc(contentItems.version));

  const existingDraft = versions.find((v) => v.status === "draft");
  const canPublish = hasPermission(session.user.role, "library.publish");
  const name = payloadName(item.payload) || item.key;
  const payloadJson = JSON.stringify(item.payload, null, 2);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/studio"
          className="inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Studio
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl text-white">{name}</h1>
          <Badge variant="outline">{KIND_LABELS[item.kind]}</Badge>
          <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
          <span className="text-sm text-slate-500 tabular-nums">v{item.version}</span>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500">
          {item.kind}/{item.key}
        </p>
      </header>

      {error && ERROR_MESSAGES[error] && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          {ERROR_MESSAGES[error]}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Payload */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <p className="text-sm font-semibold text-white">
                {item.status === "draft" ? "Draft payload — editable" : "Payload — read only"}
              </p>
              {item.status !== "draft" && (
                <p className="text-xs text-slate-500">
                  {item.status === "published"
                    ? "Published versions are immutable; edit via a draft revision."
                    : "Deprecated versions are retained for history."}
                </p>
              )}
            </div>
            <div className="p-4">
              {item.status === "draft" ? (
                <DraftEditor
                  id={item.id}
                  kindLabel={KIND_LABELS[item.kind]}
                  initialPayload={payloadJson}
                />
              ) : (
                <pre className="max-h-[560px] overflow-auto rounded-xl bg-slate-950/70 p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {payloadJson}
                </pre>
              )}
            </div>
          </section>

          {/* Lifecycle actions */}
          <section className="flex flex-wrap items-center gap-3">
            {item.status === "published" &&
              (existingDraft ? (
                <Link
                  href={`/studio/${existingDraft.id}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
                >
                  <FilePlus2 className="h-4 w-4" /> Open draft revision (v{existingDraft.version})
                </Link>
              ) : (
                <ActionForm
                  action={createDraftAction}
                  success="Draft revision created — you are now editing the new version"
                  error="Could not create a draft revision — please try again."
                >
                  <input type="hidden" name="id" value={item.id} />
                  <SubmitButton variant="secondary" pendingLabel="Creating…">
                    <FilePlus2 className="h-4 w-4" /> Create draft revision
                  </SubmitButton>
                </ActionForm>
              ))}

            {item.status === "draft" && (
              <>
                {canPublish ? (
                  <ActionForm
                    action={publishDraftAction}
                    success="Draft published — the previous version was deprecated"
                    error="Could not publish the draft — please try again."
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton pendingLabel="Publishing…">
                      <Rocket className="h-4 w-4" /> Publish draft
                    </SubmitButton>
                  </ActionForm>
                ) : (
                  <p className="text-xs text-slate-500">
                    Publishing requires the library.publish permission.
                  </p>
                )}
                <ActionForm
                  action={discardDraftAction}
                  success="Draft discarded — logged to audit trail"
                  error="Could not discard the draft — please try again."
                >
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    variant="ghost"
                    className="text-red-300"
                    prompt="Discard this draft?"
                    confirmLabel="Discard"
                  >
                    <Trash2 className="h-4 w-4" /> Discard draft
                  </ConfirmButton>
                </ActionForm>
              </>
            )}
          </section>

          {item.status === "draft" && (
            <p className="text-xs text-slate-600">
              Publishing marks this version published and deprecates the currently-published
              version of {item.kind}/{item.key} in a single transaction. Both steps are audited.
            </p>
          )}
        </div>

        {/* Metadata + versions */}
        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm font-semibold text-white">Metadata</p>
            <dl className="mt-3 space-y-2 text-xs">
              <MetaRow label="Created by" value={item.createdBy} mono />
              <MetaRow label="Created" value={dateFmt.format(item.createdAt)} />
              <MetaRow label="Updated" value={dateFmt.format(item.updatedAt)} />
              <MetaRow label="Checksum" value={item.checksum.slice(0, 16) + "…"} mono title={item.checksum} />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/60">
            <p className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
              Versions of {item.key}
            </p>
            <ul className="divide-y divide-slate-800/60">
              {versions.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/studio/${v.id}`}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs hover:bg-slate-800/40 ${
                      v.id === item.id ? "bg-slate-800/40" : ""
                    }`}
                  >
                    <span className="font-mono text-slate-300 tabular-nums">v{v.version}</span>
                    <Badge variant={STATUS_VARIANT[v.status]}>{v.status}</Badge>
                    <span className="ml-auto text-[11px] text-slate-500 tabular-nums">
                      {dateFmt.format(v.updatedAt)}
                    </span>
                    {v.id === item.id && <span className="text-[11px] text-teal-300">viewing</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetaRow({
  label,
  value,
  mono,
  title,
}: {
  label: string;
  value: string;
  mono?: boolean;
  title?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd
        className={`truncate text-right text-slate-300 ${mono ? "font-mono" : ""}`}
        title={title}
      >
        {value}
      </dd>
    </div>
  );
}
