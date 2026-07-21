import Link from "next/link";
import { redirect } from "next/navigation";
import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { LibraryBig } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { contentItems } from "@/db/schema";
import { CONTENT_KINDS, type ContentKind } from "@/content/types";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { KIND_LABELS, payloadName } from "./kind-schemas";

export const metadata = { title: "Library Studio — Astra Velocity" };

const STATUSES = ["draft", "published", "deprecated"] as const;
type ContentStatus = (typeof STATUSES)[number];

const STATUS_VARIANT: Record<ContentStatus, "highlight" | "success" | "default"> = {
  draft: "highlight",
  published: "success",
  deprecated: "default",
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function pick<T extends string>(value: string | undefined, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

const ERROR_MESSAGES: Record<string, string> = {
  "not-found": "That content item no longer exists.",
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; status?: string; q?: string; error?: string }>;
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

  const sp = await searchParams;
  const kind = pick(sp.kind, CONTENT_KINDS);
  const status = pick(sp.status, STATUSES);
  const q = (sp.q ?? "").trim().slice(0, 120);

  const conditions: SQL[] = [];
  if (kind) conditions.push(eq(contentItems.kind, kind));
  if (status) conditions.push(eq(contentItems.status, status));
  if (q) {
    const pattern = `%${q}%`;
    const nameMatch = or(
      ilike(contentItems.key, pattern),
      sql`${contentItems.payload}->>'name' ilike ${pattern}`,
      sql`${contentItems.payload}->>'title' ilike ${pattern}`,
    );
    if (nameMatch) conditions.push(nameMatch);
  }

  const [matrix, recent, rows] = await Promise.all([
    db
      .select({ kind: contentItems.kind, status: contentItems.status, n: count() })
      .from(contentItems)
      .groupBy(contentItems.kind, contentItems.status),
    db
      .select({
        id: contentItems.id,
        kind: contentItems.kind,
        key: contentItems.key,
        version: contentItems.version,
        status: contentItems.status,
        updatedAt: contentItems.updatedAt,
      })
      .from(contentItems)
      .orderBy(desc(contentItems.updatedAt))
      .limit(8),
    db
      .select({
        id: contentItems.id,
        kind: contentItems.kind,
        key: contentItems.key,
        version: contentItems.version,
        status: contentItems.status,
        payload: contentItems.payload,
        updatedAt: contentItems.updatedAt,
      })
      .from(contentItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(contentItems.updatedAt))
      .limit(100),
  ]);

  const cell = new Map<string, number>();
  for (const m of matrix) cell.set(`${m.kind}:${m.status}`, m.n);
  const kindTotals = new Map<ContentKind, number>();
  for (const m of matrix) {
    kindTotals.set(m.kind, (kindTotals.get(m.kind) ?? 0) + m.n);
  }
  const draftCount = matrix.filter((m) => m.status === "draft").reduce((a, m) => a + m.n, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="flex items-center gap-3 font-display text-3xl text-white">
          <LibraryBig className="h-7 w-7 text-teal-400" /> Library Studio
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          The governed content library: every item is versioned, schema-validated, and audited.
          Published versions are immutable — changes flow through draft revisions.
        </p>
      </header>

      {sp.error && ERROR_MESSAGES[sp.error] && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          {ERROR_MESSAGES[sp.error]}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        {/* Counts by kind and status */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <p className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
            Content by kind and status
            {draftCount > 0 && (
              <span className="ml-2 text-xs font-normal text-amber-300">
                {draftCount} draft{draftCount === 1 ? "" : "s"} in progress
              </span>
            )}
          </p>
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2 font-medium">Kind</th>
                <th className="px-4 py-2 text-right font-medium">Draft</th>
                <th className="px-4 py-2 text-right font-medium">Published</th>
                <th className="px-4 py-2 text-right font-medium">Deprecated</th>
                <th className="px-4 py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {CONTENT_KINDS.map((k) => (
                <tr key={k} className="border-b border-slate-800/60 last:border-0">
                  <td className="px-4 py-2 text-slate-200">{KIND_LABELS[k]}</td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {cell.get(`${k}:draft`) ?? 0}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {cell.get(`${k}:published`) ?? 0}
                  </td>
                  <td className="px-4 py-2 text-right text-slate-300">
                    {cell.get(`${k}:deprecated`) ?? 0}
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-white">
                    {kindTotals.get(k) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent updates */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60">
          <p className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
            Recent updates
          </p>
          <ul className="divide-y divide-slate-800/60">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/studio/${r.id}`}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-800/40"
                >
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  <span className="truncate font-mono text-xs text-slate-300">
                    {r.kind}/{r.key}
                  </span>
                  <span className="ml-auto whitespace-nowrap text-[11px] text-slate-500 tabular-nums">
                    v{r.version} · {dateFmt.format(r.updatedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Browser */}
      <section>
        <h2 className="text-lg font-semibold text-white">Content browser</h2>
        <form method="get" action="/studio" className="mt-3 flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Kind
            <Select name="kind" defaultValue={kind ?? ""} className="w-44">
              <option value="">All kinds</option>
              {CONTENT_KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABELS[k]}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Status
            <Select name="status" defaultValue={status ?? ""} className="w-40">
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-400">
            Search key or name
            <Input name="q" defaultValue={q} placeholder="e.g. claims, cde, reserve" className="w-64" />
          </label>
          <Button type="submit" variant="secondary" size="sm">
            Apply
          </Button>
          {(kind || status || q) && (
            <Link href="/studio" className="text-xs text-slate-500 hover:text-teal-300">
              Reset
            </Link>
          )}
        </form>

        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Kind</th>
                <th className="px-4 py-3 font-medium">Key</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-500">
                    No content items match the current filters.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/30">
                  <td className="px-4 py-2.5">
                    <Badge variant="outline">{KIND_LABELS[r.kind]}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Link
                      href={`/studio/${r.id}`}
                      className="font-mono text-xs text-teal-300 hover:text-teal-200"
                    >
                      {r.key}
                    </Link>
                  </td>
                  <td className="max-w-[280px] truncate px-4 py-2.5 text-slate-200">
                    {payloadName(r.payload) || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300 tabular-nums">
                    v{r.version}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-400 tabular-nums">
                    {dateFmt.format(r.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Showing up to 100 items, most recently updated first. Narrow with the filters above.
        </p>
      </section>
    </div>
  );
}
