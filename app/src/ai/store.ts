import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { aiCalls, aiSettings, promptTemplates } from "@/db/schema";

/**
 * AI persistence surface — the only module the gateway touches for settings,
 * templates, and the ai_calls audit trail. Kept thin and separate so tests can
 * mock one seam instead of the drizzle query builder.
 */

export interface AiCallRecord {
  feature: string;
  provider: string;
  model: string;
  promptTemplateKey?: string | null;
  promptTemplateVersion?: number | null;
  redactionReport?: Record<string, number> | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  costUsd?: string | null;
  latencyMs?: number | null;
  status: "ok" | "error" | "blocked" | "killed";
  errorDetail?: string | null;
  userId?: string | null;
  workspaceId?: string | null;
}

/** Read a runtime AI setting (routing, kill-switch, budget). Null when unset or DB unreachable. */
export async function getAiSetting(key: string): Promise<unknown> {
  try {
    const [row] = await db
      .select({ value: aiSettings.value })
      .from(aiSettings)
      .where(eq(aiSettings.key, key))
      .limit(1);
    return row?.value ?? null;
  } catch {
    // Settings reads degrade to defaults; the audit insert is the hard gate.
    return null;
  }
}

/** Latest active version of a prompt template, or null if never seeded. */
export async function getPromptTemplate(
  key: string,
): Promise<{ template: string; version: number } | null> {
  try {
    const [row] = await db
      .select({ template: promptTemplates.template, version: promptTemplates.version })
      .from(promptTemplates)
      .where(and(eq(promptTemplates.key, key), eq(promptTemplates.active, true)))
      .orderBy(desc(promptTemplates.version))
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

/**
 * Append the immutable audit row. Every model call — ok, killed, or errored —
 * lands here. Returns the row id so callers can surface it (e.g. as
 * `callId` in an API response) for traceability back to ai_calls.
 */
export async function recordAiCall(record: AiCallRecord): Promise<string | null> {
  const [row] = await db
    .insert(aiCalls)
    .values({
      feature: record.feature,
      provider: record.provider,
      model: record.model,
      promptTemplateKey: record.promptTemplateKey ?? null,
      promptTemplateVersion: record.promptTemplateVersion ?? null,
      redactionReport: record.redactionReport ?? null,
      inputTokens: record.inputTokens ?? null,
      outputTokens: record.outputTokens ?? null,
      costUsd: record.costUsd ?? null,
      latencyMs: record.latencyMs ?? null,
      status: record.status,
      errorDetail: record.errorDetail ?? null,
      userId: record.userId ?? null,
      workspaceId: record.workspaceId ?? null,
    })
    .returning({ id: aiCalls.id });
  return row?.id ?? null;
}
