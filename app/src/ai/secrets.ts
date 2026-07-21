import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { aiSettings } from "@/db/schema";
import { env } from "@/lib/env";

/**
 * Provider credentials managed from Admin › AI.
 *
 * Keys are encrypted at rest with AES-256-GCM using a key derived from
 * AUTH_SECRET, stored in ai_settings, and masked everywhere in the UI (only
 * the last 4 characters are kept in the clear for display). The environment
 * variable remains a fallback so container-injected secrets keep working.
 * The raw key value is never audited, logged, or returned to the client.
 */

const SETTING_KEY = "secret.anthropic-api-key";

interface StoredSecret {
  v: 1;
  iv: string;
  ct: string;
  tag: string;
  last4: string;
}

function deriveKey(): Buffer {
  return createHash("sha256").update(`${env.AUTH_SECRET}:ai-secrets-v1`).digest();
}

function encrypt(plain: string): StoredSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString("base64"),
    ct: ct.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    last4: plain.slice(-4),
  };
}

function decrypt(stored: StoredSecret): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveKey(),
    Buffer.from(stored.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(stored.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(stored.ct, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

async function readStored(): Promise<StoredSecret | null> {
  try {
    const row = await db.query.aiSettings.findFirst({ where: eq(aiSettings.key, SETTING_KEY) });
    const value = row?.value as StoredSecret | undefined;
    return value && value.v === 1 && value.ct ? value : null;
  } catch {
    // DB unavailable (or mocked away in tests): the env fallback still applies,
    // and the gateway's own mock fallback covers the rest.
    return null;
  }
}

export async function setAnthropicApiKey(raw: string, updatedBy: string): Promise<void> {
  const value = encrypt(raw.trim());
  await db
    .insert(aiSettings)
    .values({ key: SETTING_KEY, value, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: aiSettings.key,
      set: { value, updatedBy, updatedAt: new Date() },
    });
}

export async function removeAnthropicApiKey(): Promise<void> {
  await db.delete(aiSettings).where(eq(aiSettings.key, SETTING_KEY));
}

/** Admin-stored key first; environment variable as fallback; "" when neither. */
export async function getAnthropicApiKey(): Promise<string> {
  const stored = await readStored();
  if (stored) {
    try {
      return decrypt(stored);
    } catch {
      // AUTH_SECRET rotated since the key was saved — treat as unconfigured.
      return env.ANTHROPIC_API_KEY;
    }
  }
  return env.ANTHROPIC_API_KEY;
}

export interface AnthropicKeyStatus {
  source: "admin" | "env" | "none";
  last4?: string;
}

export async function anthropicKeyStatus(): Promise<AnthropicKeyStatus> {
  const stored = await readStored();
  if (stored) return { source: "admin", last4: stored.last4 };
  if (env.ANTHROPIC_API_KEY) return { source: "env", last4: env.ANTHROPIC_API_KEY.slice(-4) };
  return { source: "none" };
}
