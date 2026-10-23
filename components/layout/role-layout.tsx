"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { useT } from "@/lib/i18n/client";

/** LOCAL ONLY: same switch as proxy.ts. Ignored in production builds. */
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

/**
 * Client-side belt-and-suspenders on top of proxy.ts's cookie-based guard:
 * covers the case where the mock session cookie is missing/stale but the
 * localStorage session isn't (dev-only edge case with the mock auth layer).
 */
const noopSubscribe = () => () => {};

export function RoleLayout({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const t = useT();
  const { user } = useAuth();
  const router = useRouter();
  // The signed-in user is only known after hydration (the server render has none), so redirect only then.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    if (SKIP_AUTH || !hydrated) return;
    if (!user || user.role !== role) {
      router.replace("/login");
    }
  }, [hydrated, user, role, router]);

  if (!SKIP_AUTH && (!user || user.role !== role)) {
    return <div className="flex flex-1 items-center justify-center p-10 text-muted-foreground">{t("Loading...")}</div>;
  }

  return <AppShell role={role}>{children}</AppShell>;
}