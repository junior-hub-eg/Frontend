"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHub, type Hub } from "@/lib/hub-api";
import { errorMessage } from "@/lib/api-client";
import { changeAvatar, refreshProfile } from "@/lib/auth/api-auth";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { LearnerShell } from "./learner-shell";

// ⚠️ للتطوير بس: اخليه false قبل ما ترفعي الكود
const SKIP_AUTH = false;

/** The only pages a student without a track can open: Find your track (the interview's start) and the interview. */
const ONBOARDING_PATHS = ["/learner/courses", "/learner/courses/discovery"];
const INTERVIEW_START = "/learner/courses";

/** A student needs the AI interview until they have a track in focus and their level in it. */
const needsInterview = (hub: Hub) => !hub.courses.track || !hub.courses.level;

export function LearnerLayoutClient({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const pathname = usePathname();

  const allowed = SKIP_AUTH || (user && user.role === "learner");
  // The hub, and the page it was loaded for. It carries the track in focus (none for a new student).
  const [loaded, setLoaded] = useState<{ hub: Hub; path: string } | null>(null);
  const [hubError, setHubError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const hasTrack = useRef(false);

  // Until the student has a track, the hub is loaded again on every page, so choosing one unlocks the dashboard.
  useEffect(() => {
    if (!allowed || hasTrack.current) return;
    let active = true;
    getHub()
      .then((hub) => {
        if (!active) return;
        hasTrack.current = !needsInterview(hub);
        setHubError(null);
        setLoaded({ hub, path: pathname });
      })
      .catch((e) => active && setHubError(errorMessage(e, "We couldn't load your dashboard. Please try again.")));
    return () => {
      active = false;
    };
  }, [allowed, pathname, attempt]);

  // A session from before avatars were saved has none cached: load the profile once.
  useEffect(() => {
    if (allowed) void refreshProfile();
  }, [allowed]);

  const hub = loaded?.hub ?? null;
  // A new student starts with Find your track and the AI interview; the rest of the dashboard opens once they
  // have a track and a level. Until the hub answers, nothing opens either.
  const locked = loaded === null || needsInterview(loaded.hub);
  const onboarding = ONBOARDING_PATHS.includes(pathname);
  const checkedHere = loaded?.path === pathname;

  useEffect(() => {
    if (allowed && loaded && needsInterview(loaded.hub) && checkedHere && !onboarding) router.replace(INTERVIEW_START);
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
      {locked && !onboarding && hubError ? (
        <div className="grid flex-1 place-items-center p-10">
          <div role="alert" className="flex max-w-sm flex-col items-center gap-4 text-center text-[#14365a]">
            <p className="font-semibold">{hubError}</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="flex items-center gap-1.5 rounded-full bg-[#12939b] px-5 py-2 text-sm font-bold text-white hover:bg-[#0f7a81]"
            >
              <RotateCcw className="size-4" /> Try again
            </button>
          </div>
        </div>
      ) : locked && !onboarding ? (
        <div className="grid flex-1 place-items-center p-10" role="status" aria-label="Loading">
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ) : (
        children
      )}
    </LearnerShell>
  );
}