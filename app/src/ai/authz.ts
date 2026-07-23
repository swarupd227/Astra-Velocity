import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasPermission, type Permission } from "@/lib/roles";

/**
 * Route-handler guard for AI endpoints: session required, permission(s)
 * checked server-side. Pass a single permission or an array when a route
 * requires more than one (e.g. studio-enhance needs both library.author AND
 * ai.use). Returns the user or a ready-to-send error response.
 */
export async function requireAiUser(
  permission: Permission | Permission[] = "ai.use",
): Promise<{ user: { id: string; role: string } } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sign in to use the copilot." }, { status: 401 }),
    };
  }
  const required = Array.isArray(permission) ? permission : [permission];
  const missing = required.filter((p) => !hasPermission(session.user.role, p));
  if (missing.length > 0) {
    return {
      error: NextResponse.json(
        { error: `Your role does not include ${missing.join(", ")}.` },
        { status: 403 },
      ),
    };
  }
  return { user: { id: session.user.id, role: session.user.role } };
}
