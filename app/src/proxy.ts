import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/health"];

/**
 * Session gate only (Next 16 proxy convention) — fine-grained permission checks
 * live server-side next to the data they protect (see lib/roles.ts).
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Cookie name depends on transport, not build mode: over HTTPS Auth.js uses
  // the __Secure- prefix, over plain HTTP (local Docker) it cannot. Check both
  // so a production image served on http://localhost keeps its session.
  const token =
    (await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName: "__Secure-authjs.session-token",
    })) ??
    (await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName: "authjs.session-token",
    }));

  if (!token) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    // A session cookie is present but did not decode to a token — it expired
    // or is invalid. Tell the login page so it can explain the bounce.
    const hadSession =
      req.cookies.has("__Secure-authjs.session-token") ||
      req.cookies.has("authjs.session-token");
    if (hadSession) login.searchParams.set("expired", "1");
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)$).*)"],
};
