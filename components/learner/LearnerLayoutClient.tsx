"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { LearnerShell } from "./learner-shell";

// ⚠️ للتطوير بس: اخليه false قبل ما ترفعي الكود
const SKIP_AUTH = false;

export function LearnerLayoutClient({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const allowed = SKIP_AUTH || (user && user.role === "learner");

  useEffect(() => {
    if (!allowed) router.replace("/login");
  }, [allowed, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 text-muted-foreground">
        جاري التحميل...
      </div>
    );
  }

  const fullName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") : "Mohammed Yasser";

  function handleLogout() {
    router.push("/login");
  }

  return (
    <LearnerShell
      userName={fullName}
      userEmail={user?.email}
      userAvatar="/images/Intern/char-boy-glasses.png"
      onLogout={handleLogout}
    >
      {children}
    </LearnerShell>
  );
}