import Link from "next/link";
import { redirect } from "next/navigation";
import { avg, count, gte, sql, sum } from "drizzle-orm";
import { ArrowLeft, Eraser, FileCheck2, KeyRound, ShieldCheck, Siren } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { aiCalls, aiSettings } from "@/db/schema";
import { DEFAULT_ROUTING, type AiRouting } from "@/ai/gateway";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input, Select } from "@/components/ui/input";
import { anthropicKeyStatus } from "@/ai/secrets";
import {
  removeAnthropicKeyAction,
  saveRoutingAction,
  setAnthropicKeyAction,
  setKillSwitchAction,
  testAnthropicAction,
} from "./actions";

export const metadata = { title: "AI Administration — Astra Velocity" };

const PROVIDERS = ["anthropic", "ollama", "mock"] as const;
const KILL_SWITCH_SCOPES = ["all", "library-qa", "copilot-compose"] as const;
const ALWAYS_ON_FEATURES = ["library-qa", "copilot-compose"];

function parseRouting(value: unknown): AiRouting | null {
  if (!value || typeof value !== "object") return null;
  const v = value as { provider?: unknown; model?: unknown };
  if (
    (v.provider === "anthropic" || v.provider === "ollama" || v.provider === "mock") &&
    typeof v.model === "string" &&
    v.model.length > 0
  ) {
    return { provider: v.provider, model: v.model };
  }
  return null;
}

function isSwitchOn(value: unknown): boolean {
  return value === true || value === "true";
}

const num = (v: string | number | null | undefined) => Number(v ?? 0);
const fmtInt = (v: string | number | null | undefined) => num(v).toLocaleString("en-US");
const fmtUsd = (v: string | number | null | undefined) => `$${num(v).toFixed(4)}`;
const fmtMs = (v: string | number | null | undefined) => `${Math.round(num(v))} ms`;
const fmtPct = (part: string | number | null | undefined, total: number) =>
  total > 0 ? `${Math.round((num(part) / total) * 100)}%` : "—";

interface UsageRow {
  calls: number;
  inputTokens: string | null;
  outputTokens: string | null;
  costUsd: string | null;
  avgLatency: string | null;
  mockCalls: number;
}

export default async function AdminAiPage({
  searchParams,
}: {
  searchParams: Promise<{ test?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const sp = await searchParams;

  if (!hasPermission(session.user.role, "admin.ai")) {
    return (
      <AccessDenied
        title="AI Administration"
        message="Model routing, kill-switches, and cost telemetry require the admin.ai permission."
        role={session.user.role}
      />
    );
  }

  const keyStatus = await anthropicKeyStatus();

  const since30d = new Date();
  since30d.setDate(since30d.getDate() - 30);
  const usageColumns = {
    calls: count(),
    inputTokens: sum(aiCalls.inputTokens),
    outputTokens: sum(aiCalls.outputTokens),
    costUsd: sum(aiCalls.costUsd),
    avgLatency: avg(aiCalls.latencyMs),
    mockCalls: count(sql`case when ${aiCalls.provider} = 'mock' then 1 end`),
  };

  const [settingsRows, observedFeatures, [totals], byFeature, byProvider] = await Promise.all([
    db.select().from(aiSettings),
    db.selectDistinct({ feature: aiCalls.feature }).from(aiCalls),
    db.select(usageColumns).from(aiCalls).where(gte(aiCalls.createdAt, since30d)),
    db
      .select({ feature: aiCalls.feature, ...usageColumns })
      .from(aiCalls)
      .where(gte(aiCalls.createdAt, since30d))
      .groupBy(aiCalls.feature)
      .orderBy(aiCalls.feature),
    db
      .select({ provider: aiCalls.provider, ...usageColumns })
      .from(aiCalls)
      .where(gte(aiCalls.createdAt, since30d))
      .groupBy(aiCalls.provider)
      .orderBy(aiCalls.provider),
  ]);

  const settings = new Map(settingsRows.map((row) => [row.key, row.value]));
  const defaultRouting = parseRouting(settings.get("routing.default")) ?? DEFAULT_ROUTING;

  const features = [
    ...new Set([
      ...ALWAYS_ON_FEATURES,
      ...observedFeatures.map((row) => row.feature),
      ...settingsRows
        .filter((row) => row.key.startsWith("routing.") && row.key !== "routing.default")
        .map((row) => row.key.slice("routing.".length)),
    ]),
  ].sort();

  return (
    <div className="space-y-8">
      <header>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-teal-600 dark:hover:text-teal-300"
        >
          <ArrowLeft className="h-3 w-3" /> Admin
        </Link>
        <h1 className="mt-1 font-display text-3xl text-slate-900 dark:text-white">AI Administration</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Every model call flows through one gateway: routing and kill-switches below take effect
          on the next call, and every change here lands in the audit trail.
        </p>
      </header>

      {/* Guardrail posture — structural, not configurable */}
      <div className="grid gap-3 sm:grid-cols-3">
        <GuardrailTile
          icon={<Eraser className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
          title="Redaction — always on"
          text="PII/NPPI is scrubbed before any prompt leaves the boundary; only counts are recorded."
        />
        <GuardrailTile
          icon={<ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
          title="Containment — always on"
          text="User and retrieved content is wrapped as untrusted data; injected instructions are inert."
        />
        <GuardrailTile
          icon={<FileCheck2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
          title="Audit — always on"
          text="Every call — served, degraded, killed, or errored — writes an ai_calls row. No exceptions."
        />
      </div>

      {/* Provider credentials */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <KeyRound className="h-4 w-4 text-teal-600 dark:text-teal-400" /> Provider credentials
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The Anthropic key is encrypted at rest, shown only by its last 4 characters, and never
          logged. An environment-supplied key acts as fallback. Saving takes effect on the next
          call — no restart required.
        </p>

        {sp.test === "live" && (
          <div className="mt-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            Connection test passed — the gateway reached Anthropic and AI is live.
          </div>
        )}
        {sp.test === "degraded" && (
          <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
            Connection test degraded to the mock provider — check that the key is valid and the
            routing provider is set to anthropic.
          </div>
        )}

        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_320px]">
          <ActionForm
            action={setAnthropicKeyAction}
            success="API key saved — takes effect on the next call"
            error="Could not save the key — check its format and try again."
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
                Anthropic API key
              </span>
              <Input
                name="apiKey"
                type="password"
                required
                minLength={20}
                autoComplete="off"
                placeholder="sk-ant-…"
              />
            </label>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Stored AES-256-GCM encrypted in ai_settings; audit records the change, never the
                value.
              </p>
              <SubmitButton pendingLabel="Saving…">Save key</SubmitButton>
            </div>
          </ActionForm>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Status</p>
            <p className="mt-2 text-sm">
              {keyStatus.source === "none" ? (
                <Badge variant="highlight">Not configured — mock fallback active</Badge>
              ) : (
                <Badge variant="success">
                  Configured via {keyStatus.source === "admin" ? "Admin" : "environment"} · ends
                  ····{keyStatus.last4}
                </Badge>
              )}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionForm
                action={testAnthropicAction}
                error="Connection test failed — please try again."
              >
                <SubmitButton variant="secondary" size="sm" pendingLabel="Testing…">
                  Test connection
                </SubmitButton>
              </ActionForm>
              {keyStatus.source === "admin" && (
                <ActionForm
                  action={removeAnthropicKeyAction}
                  success="Anthropic key removed — environment fallback now applies"
                  error="Could not remove the key — please try again."
                >
                  <ConfirmButton
                    variant="danger"
                    size="sm"
                    prompt="Remove the stored key?"
                    confirmLabel="Remove"
                  >
                    Remove key
                  </ConfirmButton>
                </ActionForm>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Routing */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Model routing</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Features without an override inherit <code className="font-mono text-xs text-teal-700 dark:text-teal-300">routing.default</code>.
          Providers that are unavailable at call time fall back to the mock provider with a visible
          degraded flag.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              <RoutingRow feature="default" label="Default (routing.default)" routing={defaultRouting} hasOverride />
              {features.map((feature) => {
                const override = parseRouting(settings.get(`routing.${feature}`));
                return (
                  <RoutingRow
                    key={feature}
                    feature={feature}
                    label={feature}
                    routing={override ?? { provider: defaultRouting.provider, model: "" }}
                    hasOverride={override !== null}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kill-switches */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Kill-switches</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Engaging a switch pauses AI assistance for that scope immediately; manual workflows remain
          available and every refused call is still audited.
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {KILL_SWITCH_SCOPES.map((scope) => {
            const engaged = isSwitchOn(settings.get(`killswitch.${scope}`));
            return (
              <div
                key={scope}
                className={`rounded-2xl border p-4 ${
                  engaged ? "border-red-500/50 bg-red-500/5" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Siren className={`h-4 w-4 ${engaged ? "text-red-600 dark:text-red-400" : "text-slate-500"}`} />
                  <p className="font-mono text-xs text-slate-600 dark:text-slate-300">killswitch.{scope}</p>
                  {engaged ? (
                    <Badge variant="danger">Engaged</Badge>
                  ) : (
                    <Badge variant="success">Released</Badge>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {scope === "all"
                    ? "Pauses every AI feature platform-wide."
                    : `Pauses the ${scope} feature only.`}
                </p>
                <ActionForm
                  action={setKillSwitchAction}
                  success={
                    engaged
                      ? `Kill-switch released for ${scope} — AI resumes on the next call`
                      : `Kill-switch engaged for ${scope} — AI assistance is paused`
                  }
                  error="Could not update the kill-switch — please try again."
                  className="mt-3"
                >
                  <input type="hidden" name="scope" value={scope} />
                  <input type="hidden" name="engaged" value={engaged ? "false" : "true"} />
                  {engaged ? (
                    <SubmitButton size="sm" variant="secondary" pendingLabel="Releasing…">
                      Release
                    </SubmitButton>
                  ) : (
                    <ConfirmButton
                      size="sm"
                      variant="danger"
                      prompt={`Pause AI for ${scope}?`}
                      confirmLabel="Engage"
                    >
                      Engage
                    </ConfirmButton>
                  )}
                </ActionForm>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cost & usage */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Cost & usage — last 30 days</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <UsageTile label="Calls" value={fmtInt(totals?.calls)} />
          <UsageTile label="Tokens in" value={fmtInt(totals?.inputTokens)} />
          <UsageTile label="Tokens out" value={fmtInt(totals?.outputTokens)} />
          <UsageTile label="Cost (USD)" value={fmtUsd(totals?.costUsd)} />
          <UsageTile label="Avg latency" value={fmtMs(totals?.avgLatency)} />
          <UsageTile
            label="Degraded / mock share"
            value={fmtPct(totals?.mockCalls, totals?.calls ?? 0)}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <UsageTable title="By feature" nameHeader="Feature" rows={byFeature.map((r) => ({ name: r.feature, ...r }))} />
          <UsageTable title="By provider" nameHeader="Provider" rows={byProvider.map((r) => ({ name: r.provider, ...r }))} />
        </div>
      </section>
    </div>
  );
}

function RoutingRow({
  feature,
  label,
  routing,
  hasOverride,
}: {
  feature: string;
  label: string;
  routing: AiRouting | { provider: string; model: string };
  hasOverride: boolean;
}) {
  const isDefault = feature === "default";
  return (
    <tr className="border-b border-slate-200/70 dark:border-slate-800/60 last:border-0">
      <td className="px-4 py-3">
        <span className={`font-mono text-xs ${isDefault ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-slate-200"}`}>
          {label}
        </span>
      </td>
      <td className="px-4 py-3">
        <Select
          name="provider"
          form={`routing-${feature}`}
          defaultValue={routing.provider}
          className="w-36"
          aria-label={`Provider for ${label}`}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </td>
      <td className="px-4 py-3">
        <Input
          name="model"
          form={`routing-${feature}`}
          defaultValue={routing.model}
          placeholder={isDefault ? "model id" : "model id (saving sets an override)"}
          required
          maxLength={120}
          className="w-64 font-mono text-xs"
          aria-label={`Model for ${label}`}
        />
      </td>
      <td className="px-4 py-3">
        {isDefault ? (
          <Badge variant="accent">Platform default</Badge>
        ) : hasOverride ? (
          <Badge variant="highlight">Override set</Badge>
        ) : (
          <Badge variant="outline">Inherits default</Badge>
        )}
      </td>
      <td className="px-4 py-3">
        <ActionForm
          id={`routing-${feature}`}
          action={saveRoutingAction}
          success={`Routing saved for ${label} — takes effect on the next call`}
          error="Could not save routing — a model id is required."
        >
          <input type="hidden" name="feature" value={feature} />
          <SubmitButton variant="secondary" size="sm" pendingLabel="Saving…">
            Save
          </SubmitButton>
        </ActionForm>
      </td>
    </tr>
  );
}

function GuardrailTile({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      </div>
      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{text}</p>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-600">
        Structural, not configurable
      </p>
    </div>
  );
}

function UsageTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-4 py-3">
      <p className="text-lg font-semibold leading-tight text-slate-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function UsageTable({
  title,
  nameHeader,
  rows,
}: {
  title: string;
  nameHeader: string;
  rows: (UsageRow & { name: string })[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
      <p className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2 font-medium">{nameHeader}</th>
              <th className="px-4 py-2 text-right font-medium">Calls</th>
              <th className="px-4 py-2 text-right font-medium">Tok in</th>
              <th className="px-4 py-2 text-right font-medium">Tok out</th>
              <th className="px-4 py-2 text-right font-medium">Cost</th>
              <th className="px-4 py-2 text-right font-medium">Avg ms</th>
              <th className="px-4 py-2 text-right font-medium">Mock</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-4 text-center text-xs text-slate-500">
                  No AI calls in the last 30 days.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-slate-200/70 dark:border-slate-800/60 last:border-0">
                <td className="px-4 py-2 font-mono text-xs text-slate-700 dark:text-slate-200">{r.name}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtInt(r.calls)}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtInt(r.inputTokens)}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtInt(r.outputTokens)}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtUsd(r.costUsd)}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtMs(r.avgLatency)}</td>
                <td className="px-4 py-2 text-right text-slate-600 dark:text-slate-300">{fmtPct(r.mockCalls, r.calls)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
