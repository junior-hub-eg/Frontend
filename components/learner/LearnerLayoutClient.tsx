"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHub, type Hub } from "@/lib/hub-api";
import { changeAvatar, refreshProfile } from "@/lib/auth/api-auth";
import { LearnerShell } from "./learner-shell";

// ⚠️ للتطوير بس: اخليه false قبل ما ترفعي الكود
const SKIP_AUTH = false;

export function LearnerLayoutClient({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  const allowed = SKIP_AUTH || (user && user.role === "learner");
  const [hub, setHub] = useState<Hub | null>(null);

  // The header shows the track in focus and the level in it, from the hub (nothing for a new student).
  useEffect(() => {
    if (!allowed) return;
    let active = true;
    getHub()
      .then((h) => active && setHub(h))
      .catch(() => {});
    // A session from before avatars were saved has none cached: load the profile once.
    void refreshProfile();
    return () => {
      active = false;
    };
  }, [allowed]);

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
      userPhotoUrl={user?.photoUrl}
      onChangeAvatar={user ? changeAvatar : undefined}
      levelLabel={hub?.courses.track ? (hub.courses.level ?? undefined) : undefined}
      trackLabel={hub?.courses.track?.name}
      onLogout={handleLogout}
    >
      {children}
    </LearnerShell>
  );
}