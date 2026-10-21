"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, LoaderCircle, Maximize2, Pause, Play, Volume2 } from "lucide-react";
import {
  completeLessonStep,
  getLesson,
  getTrackLessons,
  lessonPath,
  mediaUrl,
  trackPath,
  type LessonSummary,
  type TrackLevel,
} from "@/lib/learning-api";
import { NAMES, offlineLessons, toCode } from "./TrackDetailPage";

type View = {
  id: string;
  title: string;
  concept: string;
  level: TrackLevel;
  minutes: number;
  videoUrl: string | null;
  questionCount: number;
  trackName: string;
  list: LessonSummary[];
  offline: boolean;
};

type State = { kind: "loading" } | { kind: "ready"; view: View };

const TABS = ["Overview", "Steps", "Resources", "Notes", "Q&A"] as const;

const OBJECTIVES = [
  "Understand what UI/UX design really is",
  "Learn the core vocabulary designers use",
  "Spot the difference between good and poor usability",
];

const RESOURCES = [
  { tag: "PDF", color: "#c0392b", bg: "#fbe9e7", name: "Lesson slides", meta: "2.4 MB · PDF" },
  { tag: "KIT", color: "#7a4fd6", bg: "#efe7fb", name: "Wireframe starter kit", meta: "8 KB · Figma" },
  { tag: "DOC", color: "#2f6fc4", bg: "#e4f0ff", name: "Further reading list", meta: "6 articles" },
];

/** Demo meta lines, used when the API gives no duration (same as the design). */
const DEMO_META = ["8 min · Video lesson", "12 min · Video + quiz", "18 min · Hands-on project"];

const lessonMeta = (l: LessonSummary, i: number) =>
  l.durationSeconds > 0 ? `${Math.max(1, Math.round(l.durationSeconds / 60))} min · Video lesson` : (DEMO_META[i] ?? DEMO_META[0]);

function offlineView(code: string, lessonId: string): View {
  const name = NAMES[toCode(code)] ?? code;
  const list = offlineLessons(name);
  const cur = list.find((l) => l.id === lessonId) ?? list[0];
  return {
    id: cur.id,
    title: cur.title,
    concept: cur.concept,
    level: "Beginner",
    minutes: 8,
    videoUrl: null,
    questionCount: 3,
    trackName: name,
    list,
    offline: true,
  };
}

const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const box = "rounded-[0.9em] border border-[#e3ebf3] bg-white";
const label = "text-[0.55em] font-bold uppercase tracking-wide text-[#12939b]";
const navBtn =
  "inline-flex items-center gap-[0.5em] rounded-full border px-[1.2em] py-[0.45em] text-[0.75em] font-semibold";

export default function LessonPage({ code, lessonId }: { code: string; lessonId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [marked, setMarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setMarked(false);

    // Local no-login mode: skip the API so a 401 can't send you to /login.
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      setState({ kind: "ready", view: offlineView(code, lessonId) });
      return;
    }

    Promise.all([getLesson(lessonId).catch(() => null), getTrackLessons(code).catch(() => null)]).then(([lesson, track]) => {
      if (!active) return;
      if (!lesson || !track) {
        setState({ kind: "ready", view: offlineView(code, lessonId) });
        return;
      }
      setState({
        kind: "ready",
        view: {
          id: lesson.id,
          title: lesson.title,
          concept: lesson.concept,
          level: lesson.level,
          minutes: Math.max(1, Math.round(lesson.durationSeconds / 60)),
          videoUrl: lesson.videoUrl ? mediaUrl(lesson.videoUrl) : null,
          questionCount: lesson.questions.length,
          trackName: track.trackName,
          list: track.modules.flatMap((m) => m.lessons),
          offline: false,
        },
      });
    });
    return () => {
      active = false;
    };
  }, [code, lessonId]);

  /* Desktop: one screen, no page scroll. The video takes whatever height is left. */
  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (state.kind === "loading") {
    return wrapper(
      <div className="grid min-h-[50vh] flex-1 place-items-center" role="status" aria-label="Loading">
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>,
    );
  }

  const { view } = state;
  const list = view.list;
  const idx = Math.max(0, list.findIndex((l) => l.id === view.id));
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const current = list[idx];
  const completed = marked || (!view.offline && current?.status === "Done");
  const doneOthers = view.offline ? 0 : list.filter((l) => l.status === "Done" && l.id !== view.id).length;
  const doneCount = doneOthers + (completed ? 1 : 0);
  const percent = view.offline && !completed ? 15 : list.length ? Math.round((doneCount / list.length) * 100) : 0;
  const base = lessonPath(code, view.id);

  async function markComplete() {
    if (view.offline) {
      setMarked(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await completeLessonStep(view.id, "Video");
      setMarked(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save your progress.");
    } finally {
      setBusy(false);
    }
  }

  return wrapper(
    <>
      <Link
        href={trackPath(code) as Route}
        className="mb-[0.6em] inline-flex w-fit items-center gap-[0.5em] text-[0.8em] font-semibold text-[#12606b] hover:underline lg:shrink-0"
      >
        <ArrowLeft className="size-[1.1em]" /> Track Details
      </Link>

      <div className="grid gap-[1em] lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_27%]">
        {/* ================= Left column ================= */}
        <div className="flex min-h-0 min-w-0 flex-col">
          {/* Video */}
          <div className="relative aspect-video overflow-hidden rounded-[1em] bg-gradient-to-br from-[#14586a] via-[#1d7a85] to-[#0f4252] lg:aspect-auto lg:min-h-0 lg:flex-1">
            {view.videoUrl ? (
              <video src={view.videoUrl} controls className="size-full object-cover" />
            ) : (
              <>
                <span className="absolute right-[1em] top-[0.9em] rounded-[0.4em] bg-black/40 px-[0.6em] py-[0.15em] text-[0.55em] font-bold text-white">
                  HD 1080p
                </span>
                <div className="absolute inset-0 grid place-items-center text-center text-white">
                  <div>
                    <span className="mx-auto grid size-[3.6em] place-items-center rounded-full bg-white/20 ring-1 ring-white/40">
                      <Play className="size-[1.4em] fill-white" />
                    </span>
                    <p className="mt-[0.6em] text-[0.95em] font-bold">Video preview</p>
                    <p className="mt-[0.15em] text-[0.6em] text-white/75">No video file is connected to this prototype.</p>
                  </div>
                </div>

                {/* Fake player controls */}
                <div className="absolute inset-x-[1em] bottom-[0.8em] text-white">
                  <div className="flex justify-between text-[0.55em] text-white/80">
                    <span>00:30</span>
                    <span>08:30</span>
                  </div>
                  <div className="mt-[0.2em] h-[0.2em] rounded-full bg-white/30">
                    <span className="block h-full w-[8%] rounded-full bg-[#5fe0d0]" />
                  </div>
                  <div className="mt-[0.5em] flex items-center gap-[0.8em]">
                    <span className="grid size-[2.2em] place-items-center rounded-full bg-white/25 ring-1 ring-white/40">
                      <Pause className="size-[1em] fill-white" />
                    </span>
                    <Volume2 className="size-[1.1em]" />
                    <span className="h-[0.2em] w-[4em] rounded-full bg-white/30">
                      <span className="block h-full w-1/2 rounded-full bg-white" />
                    </span>
                    <span className="ml-auto flex items-center gap-[0.5em] text-[0.55em] font-bold">
                      <span className="rounded-[0.3em] border border-white/50 px-[0.6em] py-[0.15em]">1x</span>
                      <span className="rounded-[0.3em] border border-white/50 px-[0.6em] py-[0.15em]">CC</span>
                      <Maximize2 className="size-[1.6em]" />
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <div className="mt-[0.7em] lg:shrink-0">
            <p className={label}>Current lesson</p>
            <h1 className="mt-[0.15em] text-[1.7em] font-extrabold leading-tight text-[#14365a]">{view.title}</h1>
            <p className="mt-[0.2em] text-[0.75em] text-[#14365a]/70">{view.concept}</p>
          </div>

          {/* Tabs */}
          <div
            role="tablist"
            aria-label="Lesson sections"
            className={`mt-[0.7em] flex overflow-x-auto rounded-[0.7em] border border-[#e3ebf3] bg-[#f6fafd] p-[0.2em] lg:shrink-0 ${noScrollbar}`}
          >
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`flex-1 whitespace-nowrap rounded-[0.55em] px-[1em] py-[0.4em] text-[0.7em] font-semibold transition-colors ${
                  tab === t ? "border border-[#cfe6e1] bg-white text-[#12606b]" : "text-[#14365a]/70 hover:bg-white/70"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "Overview" ? (
            <div className="mt-[0.6em] grid gap-[0.6em] md:grid-cols-2 lg:shrink-0">
              <section className={`${box} p-[0.9em]`}>
                <h2 className="text-[0.8em] font-extrabold text-[#14365a]">What you will learn</h2>
                <ul className="mt-[0.5em] space-y-[0.4em]">
                  {OBJECTIVES.map((o) => (
                    <li key={o} className="flex items-center gap-[0.5em] text-[0.68em] text-[#14365a]/85">
                      <CheckCircle2 className="size-[1.3em] shrink-0 text-[#12939b]" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>

              <section className={`${box} p-[0.9em]`}>
                <h2 className="text-[0.8em] font-extrabold text-[#14365a]">Lesson summary</h2>
                <dl className="mt-[0.4em] divide-y divide-[#eef2f6] text-[0.68em]">
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Estimated time</dt>
                    <dd className="font-semibold text-[#14365a]">{view.minutes} minutes</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Level</dt>
                    <dd className="rounded-full bg-[#dff5e8] px-[0.8em] py-[0.05em] text-[0.9em] font-semibold text-[#2a9a5f]">{view.level}</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Format</dt>
                    <dd className="font-semibold text-[#14365a]">Video lesson</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Lesson</dt>
                    <dd className="font-semibold text-[#14365a]">
                      {idx + 1} of {list.length}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <p className={`${box} mt-[0.6em] px-[1em] py-[1.2em] text-[0.7em] text-[#14365a]/65 lg:shrink-0`}>{tab} will be available soon.</p>
          )}

          {/* Previous / Open Lesson / Next */}
          <div className="mt-[0.7em] flex items-center justify-between gap-[0.8em] lg:shrink-0">
            {prev ? (
              <Link href={lessonPath(code, prev.id) as Route} className={`${navBtn} border-[#e1e8f0] bg-white text-[#14365a] hover:bg-[#eef4fa]`}>
                <ArrowLeft className="size-[1.1em]" /> Previous
              </Link>
            ) : (
              <span className={`${navBtn} border-[#e1e8f0] text-[#14365a]/35`}>
                <ArrowLeft className="size-[1.1em]" /> Previous
              </span>
            )}

            <Link
              href={`${base}/challenge` as Route}
              className="rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.5em] text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
            >
              Open Lesson
            </Link>

            {next ? (
              <Link href={lessonPath(code, next.id) as Route} className={`${navBtn} border-[#14365a]/40 bg-white text-[#14365a] hover:bg-[#eef4fa]`}>
                Next <ArrowRight className="size-[1.1em]" />
              </Link>
            ) : (
              <span className={`${navBtn} border-[#e1e8f0] text-[#14365a]/35`}>
                Next <ArrowRight className="size-[1.1em]" />
              </span>
            )}
          </div>
        </div>

        {/* ================= Right column ================= */}
        <aside className="flex min-h-0 min-w-0 flex-col gap-[0.6em] lg:overflow-hidden">
          {/* Progress */}
          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-center gap-[0.8em]">
              <span
                className="grid size-[3.6em] shrink-0 place-items-center rounded-full text-[0.75em] font-extrabold text-[#14365a]"
                style={{ background: `conic-gradient(#12939b ${percent * 3.6}deg, #e3ebf3 0)` }}
              >
                <span className="grid size-[78%] place-items-center rounded-full bg-white">{percent}%</span>
              </span>
              <span className="leading-tight">
                <span className={`${label} block`}>Your progress</span>
                <span className="mt-[0.2em] block text-[0.85em] font-extrabold text-[#14365a]">
                  Lesson {idx + 1} of {list.length}
                </span>
                <span className="mt-[0.25em] inline-block rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.05em] text-[0.55em] font-semibold text-[#12939b]">
                  {completed ? "Completed" : "In progress"}
                </span>
              </span>
            </div>
            <button
              type="button"
              onClick={markComplete}
              disabled={busy || completed}
              className="mt-[0.6em] w-full rounded-[0.5em] border border-[#12939b]/60 bg-white py-[0.45em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7] disabled:opacity-60"
            >
              {busy ? "Saving..." : completed ? "Completed" : "Mark as Complete"}
            </button>
            {error && (
              <p role="alert" className="mt-[0.4em] text-[0.65em] font-medium text-[#c0392b]">
                {error}
              </p>
            )}
          </section>

          {/* Track content */}
          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={label}>Track content</p>
                <h2 className="text-[0.9em] font-extrabold text-[#14365a]">Lessons</h2>
              </div>
              <span className="rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.1em] text-[0.55em] font-semibold text-[#12939b]">
                {list.length} lessons
              </span>
            </div>
            <ol className="mt-[0.4em] space-y-[0.2em]">
              {list.map((l, i) => {
                const active = l.id === view.id;
                const done = !view.offline && l.status === "Done" && !active;
                return (
                  <li key={l.id}>
                    <Link
                      href={lessonPath(code, l.id) as Route}
                      className={`flex items-center gap-[0.6em] rounded-[0.6em] px-[0.5em] py-[0.4em] ${active ? "bg-[#e7f6f3]" : "hover:bg-[#f3f8fb]"}`}
                    >
                      <span
                        className={`grid size-[1.9em] shrink-0 place-items-center rounded-full text-[0.65em] font-bold ${
                          active ? "bg-[#12606b] text-white" : "border border-[#cfdbe6] text-[#14365a]/70"
                        }`}
                      >
                        {done ? <CheckCircle2 className="size-[1.3em] text-[#12939b]" /> : i + 1}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[0.72em] font-semibold text-[#14365a]">{l.title}</span>
                        <span className="block text-[0.58em] text-[#14365a]/60">{lessonMeta(l, i)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Quiz */}
          <section className="rounded-[0.9em] bg-gradient-to-br from-[#14586a] to-[#1d8a8f] p-[0.9em] text-white">
            <p className="text-[0.5em] font-bold uppercase tracking-wide text-white/70">Lesson quiz</p>
            <h2 className="mt-[0.2em] text-[1em] font-extrabold">Check your understanding</h2>
            <p className="mt-[0.15em] text-[0.6em] text-white/80">{view.questionCount} questions · about 5 minutes</p>
            <Link
              href={`${base}/quiz` as Route}
              className="mt-[0.6em] inline-flex items-center rounded-[0.5em] bg-white px-[1.1em] py-[0.4em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
            >
              Start quiz
            </Link>
          </section>

          {/* Resources */}
          <section className={`${box} p-[0.8em]`}>
            <p className={label}>Resources</p>
            <ul className="mt-[0.3em] space-y-[0.1em]">
              {RESOURCES.map((r) => (
                <li key={r.name}>
                  <button type="button" className="flex w-full items-center gap-[0.6em] rounded-[0.6em] px-[0.3em] py-[0.3em] text-left hover:bg-[#f3f8fb]">
                    <span
                      className="grid size-[2em] shrink-0 place-items-center rounded-[0.5em] text-[0.5em] font-bold"
                      style={{ backgroundColor: r.bg, color: r.color }}
                    >
                      {r.tag}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[0.7em] font-semibold text-[#14365a]">{r.name}</span>
                      <span className="block text-[0.55em] text-[#14365a]/60">{r.meta}</span>
                    </span>
                    <ChevronRight className="size-[1em] shrink-0 text-[#14365a]/50" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Mentor */}
          <section className={`${box} p-[0.8em]`}>
            <p className={label}>Your mentor</p>
            <div className="mt-[0.4em] flex items-center gap-[0.6em]">
              <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#12606b] text-[0.7em] font-bold text-white">AY</span>
              <span className="leading-tight">
                <span className="block text-[0.8em] font-extrabold text-[#14365a]">Ahmed Yasser</span>
                <span className="block text-[0.58em] text-[#14365a]/60">{view.trackName} · 4+ years</span>
              </span>
            </div>
            <button
              type="button"
              className="mt-[0.5em] w-full rounded-[0.5em] bg-[#12606b] py-[0.45em] text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
            >
              Ask a question
            </button>
          </section>
        </aside>
      </div>
    </>,
  );
}