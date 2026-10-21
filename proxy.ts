import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/lib/types";
import { ROLE_HOME, ROLE_PATH_PREFIX } from "@/lib/constants";
import { TOKEN_COOKIE, decodeToken, isTokenExpired } from "@/lib/auth/token";

/**
 * Route guard by role prefix (/learner, /guardian, /mentor, /admin).
 *
 * Reads the backend JWT from the `jh_token` cookie (written by
 * lib/auth/token.ts on login) and checks its expiry and role claim. The
 * signature is NOT verified here — this is only routing UX; every API call
 * is still authorised by the .NET backend, which does verify it.
 */
/**
 * LOCAL ONLY: set NEXT_PUBLIC_SKIP_AUTH=true in .env.local to open the learner pages without a backend or login.
 * It is ignored in production builds and is off by default, so there is nothing to revert before pushing.
 */
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

export function proxy(request: NextRequest) {
  if (SKIP_AUTH) return NextResponse.next();

  const { pathname } = request.nextUrl;

  const session = readSessionCookie(request);

  const roleEntry = (Object.entries(ROLE_PATH_PREFIX) as [UserRole, string][]).find(
    ([, prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (roleEntry) {
    const [requiredRole] = roleEntry;
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (session.role !== requiredRole) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
    }
  }

  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
  }

  return NextResponse.next();
}

/** Backend role claim → frontend role: students, and mentors who monitor squads (21 Oct 2026). */
const BACKEND_ROLE: Record<string, UserRole> = { Student: "learner", Mentor: "mentor" };

function readSessionCookie(request: NextRequest): { id: string; role: UserRole } | null {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  const claims = decodeToken(token);
  if (!claims?.sub || isTokenExpired(claims)) return null;
  const role = claims.role ? BACKEND_ROLE[claims.role] : undefined;
  return role ? { id: claims.sub, role } : null;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
