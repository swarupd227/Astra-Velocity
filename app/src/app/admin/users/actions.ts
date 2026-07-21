"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { auditLog, users } from "@/db/schema";
import { ROLES } from "@/lib/roles";
import { requirePermission } from "@/lib/require-permission";

/**
 * User administration actions. Every action re-checks session + RBAC
 * ("admin.users") server-side and appends an audit_log row. Guard rails:
 * an administrator can never deactivate or demote their own account.
 */

const RoleSchema = z.enum(ROLES);
const UserIdSchema = z.string().uuid();

/** Change a user's platform role. Audited as "admin.user.role". */
export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.users");
  const userId = UserIdSchema.parse(formData.get("userId"));
  const role = RoleSchema.parse(formData.get("role"));

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) redirect("/admin/users?error=not-found");

  if (target.id === admin.id && role !== "platform_admin") {
    redirect("/admin/users?error=self-demote");
  }
  if (target.role === role) {
    revalidatePath("/admin/users");
    return; // no-op — nothing to change, nothing to audit
  }

  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, target.id));
  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.user.role",
    entityType: "user",
    entityId: target.id,
    detail: { email: target.email, from: target.role, to: role },
  });

  revalidatePath("/admin/users");
}

/** Deactivate or reactivate an account. Audited as "admin.user.deactivate" / "admin.user.reactivate". */
export async function setUserActiveAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("admin.users");
  const userId = UserIdSchema.parse(formData.get("userId"));
  const nextActive = z.enum(["true", "false"]).parse(formData.get("active")) === "true";

  const target = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!target) redirect("/admin/users?error=not-found");

  if (target.id === admin.id && !nextActive) {
    redirect("/admin/users?error=self-deactivate");
  }
  if (target.isActive === nextActive) {
    revalidatePath("/admin/users");
    return;
  }

  await db
    .update(users)
    .set({ isActive: nextActive, updatedAt: new Date() })
    .where(eq(users.id, target.id));
  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: nextActive ? "admin.user.reactivate" : "admin.user.deactivate",
    entityType: "user",
    entityId: target.id,
    detail: { email: target.email, role: target.role },
  });

  revalidatePath("/admin/users");
}

export interface InviteUserState {
  ok: boolean;
  error?: string;
  email?: string;
  tempPassword?: string;
}

const InviteSchema = z.object({
  name: z.string().trim().min(2, "Name is required (2+ characters)").max(120),
  email: z.string().trim().toLowerCase().email("A valid email address is required"),
  role: RoleSchema,
});

/**
 * Create a user with a generated temporary password. The password is hashed
 * with bcryptjs (cost 12, same as the seed pipeline) and returned exactly once
 * for the success banner — it is never stored or logged in clear text.
 */
export async function inviteUserAction(
  _prev: InviteUserState,
  formData: FormData,
): Promise<InviteUserState> {
  const admin = await requirePermission("admin.users");

  const parsed = InviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const { name, email, role } = parsed.data;

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    return { ok: false, error: "A user with this email address already exists." };
  }

  const tempPassword = `Av!${randomBytes(9).toString("base64url")}`;
  const passwordHash = await hash(tempPassword, 12);

  const [created] = await db
    .insert(users)
    .values({ name, email, role, passwordHash })
    .returning({ id: users.id });

  await db.insert(auditLog).values({
    actorType: "human",
    actorId: admin.id,
    action: "admin.user.create",
    entityType: "user",
    entityId: created.id,
    detail: { email, role },
  });

  revalidatePath("/admin/users");
  return { ok: true, email, tempPassword };
}
