import { auth } from "@/auth";
import { hasPermission, type Permission, type Role } from "@/lib/roles";

/**
 * Server-side permission gate for server actions. Pages render a polite denial
 * card instead; actions throw, because reaching them without the permission
 * means the UI was bypassed.
 */
export interface ActorSession {
  id: string;
  role: Role;
}

export async function requirePermission(permission: Permission): Promise<ActorSession> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (!hasPermission(session.user.role, permission)) {
    throw new Error(`Role ${session.user.role} does not carry the ${permission} permission`);
  }
  return { id: session.user.id, role: session.user.role };
}
