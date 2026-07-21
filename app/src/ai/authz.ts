import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasPermission, type Permission } from "@/lib/roles";

/**
 * Route-handler guard for AI endpoints: session required, permission checked
 * server-side. Returns the user or a ready-to-send error response.
 */
export async function requireAiUser(
  permission: Permission = "ai.use",
): Promise<{ user: { id: string; role: string } } | { error: NextResponse }> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Sign in to use the copilot." }, { status: 401 }),
    };
  }
  if (!hasPermission(session.user.role, permission)) {
    return {
      error: NextResponse.json(
        { error: `Your role does not include ${permission}.` },
        { status: 403 },
      ),
    };
  }
  return { user: { id: session.user.id, role: session.user.role } };
}
