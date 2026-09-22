import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { UserRole } from "@/lib/types";
import { ROLE_HOME, ROLE_PATH_PREFIX } from "@/lib/constants";

/**
 * Route guard by role prefix (/learner, /guardian, /mentor, /admin).
 *
 * Reads the mock session cookie set by lib/auth/mock-auth.ts. This is NOT a
 * real auth check (the cookie is unsigned and client-writable) — it only
 * exists so role-based routing can be exercised end-to-end before the real
 * JWT + Roles auth (PRD §9 / Sprint 1 backend deliverable) exists. Replace
 * the cookie read below with real session/JWT verification once that API
 * ships, per the Data Security guidance for Proxy in the Next.js docs.
 */
export function proxy(request: NextRequest) {
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

function readSessionCookie(request: NextRequest): { id: string; role: UserRole } | null {
  const raw = request.cookies.get("jh_session")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
