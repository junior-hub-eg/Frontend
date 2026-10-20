"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHub, type Hub } from "@/lib/hub-api";
import { changeAvatar, refreshProfile } from "@/lib/auth/api-auth";
import { LoaderCircle } from "lucide-react";
import { LearnerShell } from "./learner-shell";

// ⚠️ للتطوير بس: اخليه false قبل ما ترفعي الكود
const SKIP_AUTH = false;

/** The only pages a student without a track can open. */
const ONBOARDING_PATHS = ["/learner/courses", "/learner/courses/discovery"];

export function LearnerLayoutClient({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const pathname = usePathname();

  const allowed = SKIP_AUTH || (user && user.role === "learner");
  // The hub, and the page it was loaded for. It carries the track in focus (none for a new student).
  const [loaded, setLoaded] = useState<{ hub: Hub; path: string } | null>(null);
  const [hubFailed, setHubFailed] = useState(false);
  const hasTrack = useRef(false);

  // Until the student has a track, the hub is loaded again on every page, so choosing one unlocks the dashboard.
  useEffect(() => {
    if (!allowed || hasTrack.current) return;
    let active = true;
    getHub()
      .then((hub) => {
        if (!active) return;
        hasTrack.current = hub.courses.track !== null;
        setLoaded({ hub, path: pathname });
      })
      .catch(() => active && setHubFailed(true));
    return () => {
      active = false;
    };
  }, [allowed, pathname]);

  // A session from before avatars were saved has none cached: load the profile once.
  useEffect(() => {
    if (allowed) void refreshProfile();
  }, [allowed]);

  const hub = loaded?.hub ?? null;
  // A new student starts with Find your track and the AI interview; the rest of the dashboard opens once they
  // have a track. Without the API (hubFailed) nothing is locked.
  const locked = !hubFailed && (loaded === null || hub?.courses.track === null);
  const onboarding = ONBOARDING_PATHS.includes(pathname);
  const checkedHere = loaded?.path === pathname;

  useEffect(() => {
    if (allowed && loaded && !loaded.hub.courses.track && checkedHere && !onboarding) router.replace("/learner/courses");
  }, [allowed, loaded, checkedHere, onboarding, router]);

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

  // Clears the token (and its cookie, which the proxy reads) before leaving; otherwise /login sends the student back.
  function handleLogout() {
    logout();
    router.replace("/login");
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
      navLocked={locked}
    >
      {locked && !onboarding ? (
        <div className="grid flex-1 place-items-center p-10" role="status" aria-label="Loading">
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ) : (
        children
      )}
    </LearnerShell>
  );
}