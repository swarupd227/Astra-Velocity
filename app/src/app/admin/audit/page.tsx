import Link from "next/link";
import { redirect } from "next/navigation";
import { and, desc, like, lt, eq, isNotNull, type SQL } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { aiCalls, auditLog } from "@/db/schema";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";

export const metadata = { title: "Audit Center — Astra Velocity" };

const PAGE_SIZE = 100;
const ACTOR_TYPES = ["human", "agent", "system"] as const;
type ActorType = (typeof ACTOR_TYPES)[number];

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

function parseBefore(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

const STATUS_VARIANT: Record<string, "success" | "danger" | "highlight" | "default"> = {
  ok: "success",
  error: "danger",
  blocked: "danger",
  killed: "highlight",
};

const ACTOR_VARIANT: Record<ActorType, "accent" | "highlight" | "outline"> = {
  human: "accent",
  agent: "highlight",
  system: "outline",
};

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    actor?: string;
    prefix?: string;
    entity?: string;
    before?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "admin.audit")) {
    return (
      <AccessDenied
        title="Audit Center"
        message="The unified audit trail requires the admin.audit permission."
        role={session.user.role}
      />
    );
  }

  const sp = await searchParams;
  const tab = sp.tab === "ai" ? "ai" : "audit";

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-300"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="mt-1 font-display text-3xl text-slate-900 dark:text-white">Audit Center</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Append-only record of human, agent, and system actions, and the full trail of AI model
          calls. Newest first, {PAGE_SIZE} rows per page.
        </p>
      </header>

      <div className="flex gap-2">
        <TabLink href="/admin/audit" active={tab === "audit"}>
          Audit log
        </TabLink>
        <TabLink href="/admin/audit?tab=ai" active={tab === "ai"}>
          AI calls
        </TabLink>
      </div>

      {tab === "audit" ? <AuditTab sp={sp} /> : <AiCallsTab sp={sp} />}
    </div>
  );
}

function TabLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active
          ? "bg-teal-500/15 text-teal-700 dark:text-teal-300"
          : "border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600"
      }`}
    >
      {children}
    </Link>
  );
}

async function AuditTab({
  sp,
}: {
  sp: { actor?: string; prefix?: string; entity?: string; before?: string };
}) {
  const [actionRows, entityRows] = await Promise.all([
    db.selectDistinct({ action: auditLog.action }).from(auditLog),
    db
      .selectDistinct({ entityType: auditLog.entityType })
      .from(auditLog)
      .where(isNotNull(auditLog.entityType)),
  ]);

  const prefixes = [...new Set(actionRows.map((r) => r.action.split(".")[0]))].sort();
  const entityTypes = entityRows
    .map((r) => r.entityType)
    .filter((v): v is string => v !== null)
    .sort();

  const actor = pick(sp.actor, ACTOR_TYPES);
  const prefix = prefixes.includes(sp.prefix ?? "") ? sp.prefix : undefined;
  const entity = entityTypes.includes(sp.entity ?? "") ? sp.entity : undefined;
  const before = parseBefore(sp.before);

  const conditions: SQL[] = [];
  if (actor) conditions.push(eq(auditLog.actorType, actor));
  if (prefix) conditions.push(like(auditLog.action, `${prefix}%`));
  if (entity) conditions.push(eq(auditLog.entityType, entity));
  if (before) conditions.push(lt(auditLog.createdAt, before));

  const rows = await db
    .select()
    .from(auditLog)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE_SIZE);

  const filterState = { actor, prefix, entity };
  const loadMoreHref =
    rows.length === PAGE_SIZE
      ? `/admin/audit${buildQuery({
          ...filterState,
          before: rows[rows.length - 1].createdAt.toISOString(),
        })}`
      : null;

  return (
    <div className="space-y-4">
      <form method="get" action="/admin/audit" className="flex flex-wrap items-end gap-3">
        <FilterField label="Actor type">
          <Select name="actor" defaultValue={actor ?? ""} className="w-36">
            <option value="">All actors</option>
            {ACTOR_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Action prefix">
          <Select name="prefix" defaultValue={prefix ?? ""} className="w-40">
            <option value="">All actions</option>
            {prefixes.map((p) => (
              <option key={p} value={p}>
                {p}.*
              </option>
            ))}
          </Select>
        </FilterField>
        <FilterField label="Entity type">
          <Select name="entity" defaultValue={entity ?? ""} className="w-44">
            <option value="">All entities</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        </FilterField>
        <Button type="submit" variant="secondary" size="sm">
          Apply filters
        </Button>
        {(actor || prefix || entity || before) && (
          <Link href="/admin/audit" className="text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-300">
            Reset
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Actor</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Entity</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-xs text-slate-500">
                  No audit rows match the current filters.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const detail = row.detail ? JSON.stringify(row.detail) : "";
              return (
                <tr key={row.id} className="border-b border-slate-200/70 dark:border-slate-800/60 align-top last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    {dateFmt.format(row.createdAt)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={ACTOR_VARIANT[row.actorType]}>{row.actorType}</Badge>
                    {row.actorId && (
                      <p
                        className="mt-1 max-w-[160px] truncate font-mono text-[11px] text-slate-500"
                        title={row.actorId}
                      >
                        {row.actorId}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-teal-800 dark:text-teal-200">{row.action}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {row.entityType ?? "—"}
                    {row.entityId && (
                      <p
                        className="max-w-[160px] truncate font-mono text-[11px] text-slate-400 dark:text-slate-600"
                        title={row.entityId}
                      >
                        {row.entityId}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <p
                      className="max-w-[360px] truncate font-mono text-[11px] text-slate-500 dark:text-slate-400"
                      title={detail}
                    >
                      {detail || "—"}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loadMoreHref && (
        <div className="text-center">
          <Link
            href={loadMoreHref}
            className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
          >
            Load older entries
          </Link>
        </div>
      )}
    </div>
  );
}

async function AiCallsTab({ sp }: { sp: { before?: string } }) {
  const before = parseBefore(sp.before);

  const rows = await db
    .select()
    .from(aiCalls)
    .where(before ? lt(aiCalls.createdAt, before) : undefined)
    .orderBy(desc(aiCalls.createdAt))
    .limit(PAGE_SIZE);

  const loadMoreHref =
    rows.length === PAGE_SIZE
      ? `/admin/audit${buildQuery({
          tab: "ai",
          before: rows[rows.length - 1].createdAt.toISOString(),
        })}`
      : null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Timestamp</th>
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium">Provider / model</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Tok in</th>
              <th className="px-4 py-3 text-right font-medium">Tok out</th>
              <th className="px-4 py-3 text-right font-medium">Cost</th>
              <th className="px-4 py-3 text-right font-medium">Latency</th>
              <th className="px-4 py-3 text-right font-medium">Redactions</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-xs text-slate-500">
                  No AI calls recorded yet.
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const report = (row.redactionReport ?? {}) as Record<string, number>;
              const redactions = Object.values(report).reduce((a, b) => a + (Number(b) || 0), 0);
              return (
                <tr key={row.id} className="border-b border-slate-200/70 dark:border-slate-800/60 last:border-0">
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    {dateFmt.format(row.createdAt)}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-200">{row.feature}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {row.provider} / {row.model}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={STATUS_VARIANT[row.status] ?? "default"}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300">
                    {(row.inputTokens ?? 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300">
                    {(row.outputTokens ?? 0).toLocaleString("en-US")}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300">
                    ${Number(row.costUsd ?? 0).toFixed(4)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300">
                    {row.latencyMs ?? 0} ms
                  </td>
                  <td
                    className="px-4 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300"
                    title={redactions > 0 ? JSON.stringify(report) : undefined}
                  >
                    {redactions}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {loadMoreHref && (
        <div className="text-center">
          <Link
            href={loadMoreHref}
            className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500"
          >
            Load older entries
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
      {label}
      {children}
    </label>
  );
}
