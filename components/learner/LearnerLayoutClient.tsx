"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { getHub, type Hub } from "@/lib/hub-api";
import { getTracks } from "@/lib/learning-api";
import { errorMessage } from "@/lib/api-client";
import { changeAvatar, refreshProfile, setGender } from "@/lib/auth/api-auth";
import { getToken } from "@/lib/auth/token";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { LearnerShell } from "./learner-shell";

/** LOCAL ONLY: NEXT_PUBLIC_SKIP_AUTH=true in .env.local skips the login check and the "needs a track" lock. Off by default and ignored in production. */
const SKIP_AUTH = process.env.NEXT_PUBLIC_SKIP_AUTH === "true" && process.env.NODE_ENV !== "production";

/** The only pages a student without a track can open: Find your track, the placement test and the AI interview. */
const ONBOARDING_PATHS = ["/learner/ai-interview", "/learner/courses", "/learner/courses/discovery"];
const isOnboarding = (path: string) => ONBOARDING_PATHS.includes(path) || path.startsWith("/learner/placement/");
/** Where a student without a track lands: Find your track, with its two ways in. */
const FIND_YOUR_TRACK = "/learner/courses";

/** A student needs the AI interview until they have a track in focus and their level in it. */
const needsInterview = (hub: Hub) => !hub.courses.track || !hub.courses.level;

type Access = { hub: Hub | null; needsInterview: boolean };

/**
 * Whether the student still needs the interview. From the hub; when the hub cannot be loaded, from the tracks the
 * student learns (GET /tracks also answers a student without a track), so a broken hub never opens the dashboard.
 */
async function loadAccess(): Promise<Access> {
  try {
    const hub = await getHub();
    return { hub, needsInterview: needsInterview(hub) };
  } catch (hubError) {
    const tracks = await getTracks().catch(() => {
      throw hubError;
    });
    return { hub: null, needsInterview: !tracks.some((t) => t.isLearning) };
  }
}

export function LearnerLayoutClient({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const pathname = usePathname();

  const allowed = SKIP_AUTH || (user && user.role === "learner");
  // The hub (when it loaded), whether the interview is still needed, and the page this was checked for.
  const [loaded, setLoaded] = useState<(Access & { path: string }) | null>(null);
  const [hubError, setHubError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const hasTrack = useRef(false);

  // Until the student has a track, the hub is loaded again on every page, so choosing one unlocks the dashboard.
  useEffect(() => {
    if (!allowed || hasTrack.current) return;
    let active = true;
    loadAccess()
      .then((access) => {
        if (!active) return;
        hasTrack.current = !access.needsInterview;
        setHubError(null);
        setLoaded({ ...access, path: pathname });
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
  const locked = !SKIP_AUTH && (loaded === null || loaded.needsInterview);
  const onboarding = isOnboarding(pathname);
  const checkedHere = loaded?.path === pathname;

  useEffect(() => {
    if (allowed && loaded?.needsInterview && checkedHere && !onboarding) router.replace(FIND_YOUR_TRACK);
  }, [allowed, loaded, checkedHere, onboarding, router]);

  // The first render while hydrating has no user yet (server snapshot): only a missing or expired token means
  // signed out. Otherwise /login would bounce a signed-in student to the dashboard on every reload.
  useEffect(() => {
    if (allowed) return;
    // A token without a cached profile (cleared storage): load it instead of signing out.
    if (getToken()) void refreshProfile().then((u) => u || router.replace("/login"));
    else router.replace("/login");
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
      userGender={user?.gender}
      onChangeAvatar={user ? changeAvatar : undefined}
      onSetGender={user ? setGender : undefined}
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