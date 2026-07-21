"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db/client";
import { aiSettings, auditLog } from "@/db/schema";
import { requirePermission } from "@/lib/require-permission";

/**
 * AI administration actions. Key conventions match the gateway EXACTLY:
 * routing.default / routing.<feature> hold {provider, model}; killswitch.all /
 * killswitch.<feature> hold a boolean. Every write is audited.
 */

const FeatureSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9][a-z0-9:._-]*$/, "invalid feature key");

const RoutingSchema = z.object({
  feature: FeatureSchema, // "default" or a feature key like "library-qa"
  provider: z.enum(["anthropic", "ollama", "mock"]),
  model: z.string().trim().min(1, "model is required").max(120),
});

async function upsertSetting(key: string, value: unknown, updatedBy: string): Promise<void> {
  await db
    .insert(aiSettings)
    .values({ key, value, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: aiSettings.key,
      set: { value, updatedBy, updatedAt: new Date() },
    });
}

/** Save routing.default or routing.<feature>. Audited as "admin.ai.routing". */
export async function saveRoutingAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.ai");
  const input = RoutingSchema.parse({
    feature: formData.get("feature"),
    provider: formData.get("provider"),
    model: formData.get("model"),
  });

  const key = `routing.${input.feature}`;
  const value = { provider: input.provider, model: input.model };
  await upsertSetting(key, value, admin.id);

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.ai.routing",
    entityType: "ai_setting",
    entityId: key,
    detail: value,
  });

  revalidatePath("/admin/ai");
}

const ApiKeySchema = z
  .string()
  .trim()
  .min(20, "that does not look like an API key")
  .max(300)
  .regex(/^[A-Za-z0-9_-]+$/, "unexpected characters in key");

/**
 * Store the Anthropic API key (encrypted at rest, masked in UI). The raw value
 * is never audited or logged — only the fact that it changed, and its last 4.
 */
export async function setAnthropicKeyAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.ai");
  const key = ApiKeySchema.parse(formData.get("apiKey"));

  const { setAnthropicApiKey } = await import("@/ai/secrets");
  await setAnthropicApiKey(key, admin.id);

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.ai.credential.set",
    entityType: "ai_setting",
    entityId: "secret.anthropic-api-key",
    detail: { provider: "anthropic", last4: key.slice(-4) },
  });

  revalidatePath("/admin/ai");
}

/** Remove the admin-stored key (env fallback, if any, then applies). */
export async function removeAnthropicKeyAction(): Promise<void> {
  const admin = await requirePermission("admin.ai");
  const { removeAnthropicApiKey } = await import("@/ai/secrets");
  await removeAnthropicApiKey();

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.ai.credential.remove",
    entityType: "ai_setting",
    entityId: "secret.anthropic-api-key",
    detail: { provider: "anthropic" },
  });

  revalidatePath("/admin/ai");
}

/**
 * Fire one minimal call through the gateway against the live provider and
 * report whether it stayed live or degraded to mock. Audited like any AI call.
 */
export async function testAnthropicAction(): Promise<void> {
  const admin = await requirePermission("admin.ai");
  const { callModel } = await import("@/ai/gateway");
  const reply = await callModel({
    feature: "admin-connection-test",
    system: "Reply with the single word OK.",
    user: "Connection test.",
    maxTokens: 16,
    userId: admin.id,
  });
  const live = reply.status === "ok" && !reply.degraded;
  revalidatePath(`/admin/ai`);
  const { redirect } = await import("next/navigation");
  redirect(`/admin/ai?test=${live ? "live" : "degraded"}`);
}

const KillSwitchSchema = z.object({
  scope: z.enum(["all", "library-qa", "copilot-compose"]),
  engaged: z.enum(["true", "false"]),
});

/** Engage or release a kill-switch. Audited as "admin.ai.killswitch". */
export async function setKillSwitchAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.ai");
  const input = KillSwitchSchema.parse({
    scope: formData.get("scope"),
    engaged: formData.get("engaged"),
  });

  const key = `killswitch.${input.scope}`;
  const engaged = input.engaged === "true";
  await upsertSetting(key, engaged, admin.id);

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.ai.killswitch",
    entityType: "ai_setting",
    entityId: key,
    detail: { engaged },
  });

  revalidatePath("/admin/ai");
}
