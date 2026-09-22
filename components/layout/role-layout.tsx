"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { useAuth } from "@/lib/auth/auth-context";
import { AppShell } from "@/components/layout/app-shell";

/**
 * Client-side belt-and-suspenders on top of proxy.ts's cookie-based guard:
 * covers the case where the mock session cookie is missing/stale but the
 * localStorage session isn't (dev-only edge case with the mock auth layer).
 */
export function RoleLayout({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== role) {
      router.replace("/login");
    }
  }, [user, role, router]);

  if (!user || user.role !== role) {
    return <div className="flex flex-1 items-center justify-center p-10 text-muted-foreground">جاري التحميل...</div>;
  }

  return <AppShell role={role}>{children}</AppShell>;
}
