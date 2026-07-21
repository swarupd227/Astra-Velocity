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
