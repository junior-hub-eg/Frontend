"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, LoaderCircle, PenTool, Plus, Sparkles } from "lucide-react";
import { getTrack, getTrackLessons, lessonPath, selectTrack, type LessonSummary, type TrackDetail } from "@/lib/learning-api";

/** The API has no chips/objectives yet, so they live here per track code. */
const EXTRA: Record<string, { chips: string[]; objectives: string[] }> = {
  UIUX: {
    chips: ["User research", "Wireframes", "Interface design"],
    objectives: ["Understand user needs", "Organize clear layouts", "Explain design decisions"],
  },
  FRONTEND: {
    chips: ["HTML & CSS", "JavaScript", "React"],
    objectives: ["Structure semantic pages", "Style responsive layouts", "Build interactive components"],
  },
  BACKEND: {
    chips: ["APIs", "Databases", "Authentication"],
    objectives: ["Design clean endpoints", "Model and query data", "Secure your services"],
  },
  MOBILE: {
    chips: ["Layouts", "Navigation", "State"],
    objectives: ["Build mobile screens", "Handle navigation", "Manage app state"],
  },
  DATA: {
    chips: ["Python", "Analysis", "Visualization"],
    objectives: ["Clean and explore data", "Find patterns", "Present clear insights"],
  },
  AI: {
    chips: ["Machine learning", "Datasets", "Models"],
    objectives: ["Understand core algorithms", "Prepare datasets", "Evaluate model results"],
  },
  TESTING: {
    chips: ["Test cases", "Bug reports", "Automation"],
    objectives: ["Write clear test cases", "Report issues well", "Automate repeated checks"],
  },
};

const FALLBACK = {
  chips: ["Fundamentals", "Practice", "Projects"],
  objectives: ["Learn the basics", "Practice with examples", "Build a small project"],
};

type State =
  | { kind: "loading" }
  | { kind: "ready"; track: TrackDetail; lessons: LessonSummary[]; nextId: string | null; offline: boolean };

export const NAMES: Record<string, string> = {
  UIUX: "UI/UX Design",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  MOBILE: "Mobile Development",
  DATA: "Data Science",
  AI: "AI",
  TESTING: "Quality Assurance",
};

export const toCode = (slug: string) => slug.replace(/[^a-z0-9]/gi, "").toUpperCase();

/** Demo content used when the API can't be reached (e.g. no login on localhost). */
function offlineTrack(slug: string): TrackDetail {
  const code = toCode(slug);
  const name = NAMES[code] ?? slug;
  return {
    code,
    name,
    shortDescription:
      code === "UIUX"
        ? "Explore how research, structure, visual hierarchy, and thoughtful interaction come together in digital products."
        : `Explore the core ideas and skills of the ${name} track step by step.`,
    iconKey: code.toLowerCase(),
    hasLessons: true,
    isLearning: false,
    videos: [],
    quiz: { unlocked: false, passed: false, questions: [] },
  };
}

export const offlineLessons = (name: string): LessonSummary[] =>
  [
    { id: "1", title: `${name} Foundations`, concept: `Meet the essential ideas and vocabulary used throughout the ${name} track.`, status: "Done" },
    { id: "2", title: `Plan Your First ${name} Project`, concept: "Turn a simple idea into a clear plan before you start building.", status: "NotStarted" },
    { id: "3", title: `Build with ${name}`, concept: "Apply the core concepts in a guided practical activity.", status: "NotStarted" },
  ].map((l) => ({
    ...l,
    level: "Beginner" as const,
    durationSeconds: 0,
    hasSchoolLink: false,
    status: l.status as LessonSummary["status"],
  }));

const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const box = "rounded-[1em] border border-[#e3ebf3] bg-white";

export default function TrackDetailPage({ slug }: { slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Local no-login mode: skip the API entirely so a 401 can't send you to /login.
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      const track = offlineTrack(slug);
      setState({ kind: "ready", track, lessons: offlineLessons(track.name), nextId: null, offline: true });
      return;
    }

    Promise.all([getTrack(slug).catch(() => null), getTrackLessons(slug).catch(() => null)]).then(([apiTrack, apiLessons]) => {
      if (!active) return;
      const track = apiTrack ?? offlineTrack(slug);
      const lessons = apiLessons ? apiLessons.modules.flatMap((m) => m.lessons) : offlineLessons(track.name);
      setState({ kind: "ready", track, lessons, nextId: apiLessons?.nextLessonId ?? null, offline: !apiTrack });
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className={`relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*1.6)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)] ${noScrollbar}`}
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (state.kind === "loading") {
    return wrapper(
      <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>,
    );
  }

  const { track, lessons: list, nextId, offline } = state;
  const extra = EXTRA[track.code.toUpperCase()] ?? FALLBACK;
  const previewId = nextId ?? list[0]?.id ?? null;

  async function choose() {
    if (offline) {
      setActionError("The server isn't reachable, so this is demo content.");
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await selectTrack(track.code);
      if (nextId) router.push(lessonPath(track.code, nextId) as Route);
      else setState({ kind: "ready", track: { ...track, isLearning: true }, lessons: list, nextId, offline });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not choose this track.");
    } finally {
      setBusy(false);
    }
  }

  return wrapper(
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[1.4em] bg-gradient-to-br from-[#f1fbf8] via-[#e4f7f2] to-[#d4f1ec]">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          <span className="absolute -top-[4em] right-[24%] size-[12em] rounded-full border-[0.2em] border-[#bfe8df]/70" />
          <span className="absolute -bottom-[5em] right-[2%] size-[14em] rounded-full bg-[#c9efe7]/70" />
          <span className="absolute right-[10%] top-[35%] size-[9em] rounded-full bg-[#bdeae0]/60" />
          <span className="absolute bottom-[18%] right-[30%] size-[1em] rounded-full bg-[#5fd6c4]/70" />
          <span className="absolute bottom-[16%] right-[7%] size-[0.9em] rounded-full bg-[#5fd6c4]/70" />
          <Plus className="absolute bottom-[10%] right-[14%] size-[3em] text-[#2cc5b2]" strokeWidth={3.2} />
          <Plus className="absolute left-[52%] top-[30%] size-[2em] text-[#b6e6dd]" strokeWidth={3} />
          <Sparkles className="absolute right-[4%] top-[8%] size-[2.2em] text-[#2cc5b2]" />
          <span className="absolute right-[16%] top-1/2 grid size-[6.5em] -translate-y-1/2 place-items-center rounded-[1.5em] bg-white shadow-[0_10px_28px_rgba(18,147,155,0.15)]">
            <PenTool className="size-[2.6em] text-[#1d7f5f]" />
          </span>
        </div>

        <div className="relative z-10 max-w-[38em] px-[2em] py-[2.2em]">
          <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">Learning track</p>
          <h1 className="mt-[0.4em] text-[2.4em] font-extrabold leading-tight text-[#14365a]">{track.name}</h1>
          <p className="mt-[0.7em] max-w-[30em] text-[0.8em] leading-relaxed text-[#14365a]/70">{track.shortDescription}</p>

          <ul className="mt-[1em] flex flex-wrap gap-[0.5em]">
            {extra.chips.map((c) => (
              <li key={c} className="rounded-[0.5em] border border-[#cfe6e1] bg-white/70 px-[0.9em] py-[0.35em] text-[0.7em] text-[#14365a]/80">
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-[1.4em] flex flex-wrap items-center gap-[0.7em]">
            {track.isLearning && nextId ? (
              <Link
                href={lessonPath(track.code, nextId) as Route}
                className="rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-white hover:bg-[#0f505a]"
              >
                Continue Learning
              </Link>
            ) : (
              <button
                type="button"
                onClick={choose}
                disabled={busy || track.isLearning}
                className="rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-white hover:bg-[#0f505a] disabled:opacity-60"
              >
                {busy ? "Saving..." : track.isLearning ? "Your Track" : "Choose This Track"}
              </button>
            )}

            {previewId && (
              <Link
                href={lessonPath(track.code, previewId) as Route}
                className="rounded-[0.5em] border border-[#12939b]/60 bg-white px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
              >
                Preview Content
              </Link>
            )}
          </div>
          {actionError && (
            <p role="alert" className="mt-[0.7em] text-[0.75em] font-medium text-[#c0392b]">
              {actionError}
            </p>
          )}
        </div>
      </section>

      {/* ---------- Learning objectives ---------- */}
      <section className="mt-[1.6em]">
        <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">What you&apos;ll learn</p>
        <h2 className="mt-[0.3em] text-[1.1em] font-extrabold text-[#14365a]">Learning objectives</h2>
        <ul className="mt-[0.8em] grid gap-[0.8em] sm:grid-cols-2 lg:grid-cols-3 xl:max-w-[60%]">
          {extra.objectives.map((o) => (
            <li key={o} className={`${box} flex items-center gap-[0.7em] px-[1em] py-[0.9em] text-[0.8em] font-semibold text-[#14365a]`}>
              <CheckCircle2 className="size-[1.4em] shrink-0 text-[#12939b]" />
              {o}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Lessons ---------- */}
      <section id="track-lessons" className="mt-[1.6em] scroll-mt-4">
        <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">Track content</p>
        <h2 className="mt-[0.3em] text-[1.1em] font-extrabold text-[#14365a]">Lessons in this track</h2>

        {list.length === 0 ? (
          <p className={`${box} mt-[0.8em] px-[1em] py-[1.2em] text-[0.8em] text-[#14365a]/65`}>
            {track.hasLessons ? "No lessons available yet." : "Lessons for this track are coming soon."}
          </p>
        ) : (
          <ol className={`${box} mt-[0.8em] divide-y divide-[#e3ebf3] overflow-hidden`}>
            {list.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={lessonPath(track.code, l.id) as Route}
                  className="flex w-full items-center gap-[1em] px-[1em] py-[1em] text-left hover:bg-[#f6fafd]"
                >
                  <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.6em] bg-[#e7f6f3] text-[0.8em] font-bold text-[#12939b]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.85em] font-bold text-[#14365a]">{l.title}</span>
                    <span className="mt-[0.2em] block text-[0.7em] text-[#14365a]/65">{l.concept}</span>
                  </span>
                  {l.status === "Done" ? (
                    <CheckCircle2 className="size-[1.3em] shrink-0 text-[#12939b]" aria-label="Completed" />
                  ) : (
                    <ArrowRight className="size-[1.2em] shrink-0 text-[#14365a]" aria-label="Open lesson" />
                  )}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>,
  );
}