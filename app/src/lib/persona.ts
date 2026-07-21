"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { auditLog } from "@/db/schema";
import { assumablePersonas, ROLE_HOMES, ROLES, type Role } from "@/lib/roles";

const PERSONA_COOKIE = "astra-persona";

/** The persona currently shaping the UI — defaults to the user's own role. */
export async function getActivePersona(): Promise<Role | null> {
  const session = await auth();
  if (!session?.user) return null;
  const store = await cookies();
  const value = store.get(PERSONA_COOKIE)?.value as Role | undefined;
  if (value && ROLES.includes(value) && assumablePersonas(session.user.role).includes(value)) {
    return value;
  }
  return session.user.role;
}

/** Switch persona (role switcher). Validated against RBAC, audit-logged. */
export async function switchPersona(persona: Role): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const allowed = assumablePersonas(session.user.role);
  if (!allowed.includes(persona)) {
    throw new Error(`Role ${session.user.role} cannot assume persona ${persona}`);
  }

  const store = await cookies();
  store.set(PERSONA_COOKIE, persona, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: session.user.id,
    action: "persona.switch",
    entityType: "user",
    entityId: session.user.id,
    detail: { from: session.user.role, to: persona },
  });

  redirect(ROLE_HOMES[persona] ?? "/");
}
