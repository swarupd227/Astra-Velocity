import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users, workspaces } from "./core";
import { projects } from "./projects";

/**
 * AI layer persistence: full-fidelity audit of every model call, versioned
 * prompt templates, runtime AI settings (routing, kill-switches, budgets),
 * and the agent suggestion queue with its human-decision trail.
 */

export const aiCallStatus = pgEnum("ai_call_status", ["ok", "error", "blocked", "killed"]);

export const aiCalls = pgTable(
  "ai_calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    feature: text("feature").notNull(), // copilot | library-qa | agent:<key> | draft:<kind>
    provider: text("provider").notNull(), // anthropic | ollama | azure-openai
    model: text("model").notNull(),
    promptTemplateKey: text("prompt_template_key"),
    promptTemplateVersion: integer("prompt_template_version"),
    /** Counts by PII type — never raw values (see guardrails/redact.ts). */
    redactionReport: jsonb("redaction_report"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
    latencyMs: integer("latency_ms"),
    status: aiCallStatus("status").notNull(),
    errorDetail: text("error_detail"),
    userId: uuid("user_id").references(() => users.id),
    workspaceId: uuid("workspace_id").references(() => workspaces.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("ai_calls_feature_idx").on(t.feature), index("ai_calls_created_idx").on(t.createdAt)],
);

export const promptTemplates = pgTable(
  "prompt_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    version: integer("version").notNull().default(1),
    description: text("description"),
    /** System prompt template; {{variables}} interpolated by the gateway. */
    template: text("template").notNull(),
    active: jsonb("active").$type<boolean>().notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("prompt_templates_key_version_idx").on(t.key, t.version)],
);

/** Runtime AI configuration: model routing, kill-switches, budgets. Key-value. */
export const aiSettings = pgTable("ai_settings", {
  key: text("key").primaryKey(), // e.g. routing.copilot, killswitch.library-qa, budget.workspace-default
  value: jsonb("value").notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const suggestionStatus = pgEnum("suggestion_status", [
  "pending",
  "approved",
  "edited",
  "rejected",
]);

/**
 * Agent co-worker suggestion queue. Agents draft; stewards decide; every
 * decision is recorded here AND in audit_log. Confidence routes review depth.
 */
export const agentSuggestions = pgTable(
  "agent_suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentKey: text("agent_key").notNull(), // glossary-scout | rule-smith | ...
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(), // glossary-term | dq-rule | classification | lineage-stitch | triage | drift-flag
    title: text("title").notNull(),
    payload: jsonb("payload").notNull(),
    confidence: numeric("confidence", { precision: 4, scale: 3 }).notNull(), // 0.000-1.000
    status: suggestionStatus("status").notNull().default("pending"),
    decidedBy: uuid("decided_by").references(() => users.id),
    decisionNote: text("decision_note"),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("agent_suggestions_status_idx").on(t.status),
    index("agent_suggestions_agent_idx").on(t.agentKey),
    index("agent_suggestions_workspace_idx").on(t.workspaceId),
  ],
);
