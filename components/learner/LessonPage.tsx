"use client";

/* The lesson identity is external state; reset the reel state when its route changes. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Heart,
  FileText,
  LoaderCircle,
  Play,
  Share2,
  Volume2,
  VolumeX,
} from "lucide-react";

import { errorMessage } from "@/lib/api-client";
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
import { offlineLessons, trackName } from "./offline-data";
import LessonPractice, { type Practice } from "./LessonPractice";
import { webPractice } from "./web-practice";
import { useT } from "@/lib/i18n/client";
import { tk, tNow } from "@/lib/i18n/translate";
import { youTubeId, youTubeEmbed } from "@/lib/youtube";

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
  practice: Practice | null;
  tryItDone: boolean;
};

type State = { kind: "loading" } | { kind: "ready"; view: View };

const RESOURCES = [
  {
    tag: "PDF",
    color: "#c0392b",
    bg: "#fbe9e7",
    name: tk("Lesson slides"),
    meta: "2.4 MB · PDF",
  },
  {
    tag: "KIT",
    color: "#7a4fd6",
    bg: "#efe7fb",
    name: tk("Wireframe starter kit"),
    meta: "8 KB · Figma",
  },
  {
    tag: "DOC",
    color: "#2f6fc4",
    bg: "#e4f0ff",
    name: tk("Further reading list"),
    meta: tk("6 articles"),
  },
];

const DEMO_META = [
  tk("8 min · Video lesson"),
  tk("12 min · Video + quiz"),
  tk("18 min · Hands-on project"),
];

const BASE_LIKES = 128;

const lessonMeta = (l: LessonSummary, i: number) =>
  l.durationSeconds > 0
    ? tNow("{n} min · Video lesson", { n: Math.max(1, Math.round(l.durationSeconds / 60)) })
    : tNow(DEMO_META[i] ?? DEMO_META[0]);

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
};

function offlineView(code: string, lessonId: string): View {
  const name = trackName(code);
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
    practice: null,
    tryItDone: false,
  };
}

const noScrollbar =
  "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const box = "rounded-[0.9em] border border-[#e3ebf3] bg-white";

const label =
  "text-[0.55em] font-bold uppercase tracking-wide text-[#12939b]";

const circleBtn =
  "grid size-[2.6em] place-items-center rounded-full border border-[#e1e8f0] bg-white text-[#14365a] transition-colors hover:bg-[#eef4fa] disabled:opacity-35 disabled:hover:bg-white";

export default function LessonPage({
  code,
  lessonId,
}: {
  code: string;
  lessonId: string;
}) {
  const t = useT();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [state, setState] = useState<State>({ kind: "loading" });

  const [marked, setMarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Native video state (a YouTube reel has its own controls)
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  // Social state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState<"practice" | "overview">("practice");

  useEffect(() => {
    let active = true;

    setState({ kind: "loading" });
    setMarked(false);
    setError(null);
    setPlaying(false);
    setProgress(0);
    setPanel("practice");

    setLiked(readStore(`jh:lesson:${lessonId}:liked`, false));
    setSaved(readStore(`jh:lesson:${lessonId}:saved`, false));

    // Local no-login mode
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      setState({ kind: "ready", view: offlineView(code, lessonId) });
      return;
    }

    Promise.all([
      getLesson(lessonId).catch(() => null),
      getTrackLessons(code).catch(() => null),
    ]).then(([lesson, track]) => {
      if (!active) return;

      if (!lesson || !track) {
        setState({ kind: "ready", view: offlineView(code, lessonId) });
        return;
      }

      const web = webPractice(lesson.title);

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
          practice: lesson.tryIt
            ? { kind: "js", ...lesson.tryIt }
            : web
              ? { kind: "web", web }
              : null,
          tryItDone: lesson.progress.tryItDone,
        },
      });
    });

    return () => {
      active = false;
    };
  }, [code, lessonId]);

  // Values needed by hooks
  const ready = state.kind === "ready" ? state.view : null;
  const list = ready?.list ?? [];

  const idx = ready ? Math.max(0, list.findIndex((l) => l.id === ready.id)) : 0;

  const prev = list[idx - 1];
  const next = list[idx + 1];

  const prevId = prev?.id;
  const nextId = next?.id;

  // Reels navigation with the arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;

      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;

      if (e.key === "ArrowDown" && nextId) router.push(lessonPath(code, nextId) as Route);
      if (e.key === "ArrowUp" && prevId) router.push(lessonPath(code, prevId) as Route);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code, nextId, prevId, router]);

  /* Desktop: one screen, no page scroll. */
  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (state.kind === "loading") {
    return wrapper(
      <div className="grid min-h-[50vh] flex-1 place-items-center" role="status" aria-label={t("Loading")}>
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>,
    );
  }

  const { view } = state;

  const current = list[idx];

  const completed = marked || (!view.offline && current?.status === "Done");

  const doneOthers = view.offline ? 0 : list.filter((l) => l.status === "Done" && l.id !== view.id).length;

  const doneCount = doneOthers + (completed ? 1 : 0);

  const percent =
    view.offline && !completed ? 15 : list.length ? Math.round((doneCount / list.length) * 100) : 0;

  const base = lessonPath(code, view.id);
  const likes = BASE_LIKES + (liked ? 1 : 0);
  const ytId = view.videoUrl ? youTubeId(view.videoUrl) : null;
  const tab = view.practice ? panel : "overview";

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    writeStore(`jh:lesson:${view.id}:liked`, nextLiked);
  }

  function toggleSave() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    writeStore(`jh:lesson:${view.id}:saved`, nextSaved);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  }

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
      setError(errorMessage(e, tk("We couldn't save your progress. Please try again.")));
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
        <ArrowLeft className="size-[1.1em]" />
        {t("Track Details")}
      </Link>

      <div className="grid gap-[1em] lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_23%]">
        {/* ================= Left: reel + practice ================= */}

        <div className="grid min-h-0 min-w-0 gap-[1em] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* ---------- Reel + actions ---------- */}

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="relative mx-auto w-full max-w-[20em] lg:max-w-none lg:min-h-0 lg:flex-1">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.2em] bg-gradient-to-b from-[#14586a] via-[#1d7a85] to-[#0f4252] shadow-[0_14px_34px_rgba(20,54,90,0.22)] lg:absolute lg:inset-y-0 lg:left-1/2 lg:w-auto lg:max-w-full lg:-translate-x-1/2">
                {ytId ? (
                  <iframe
                    key={ytId}
                    src={youTubeEmbed(ytId)}
                    title={view.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="absolute inset-0 size-full border-0 bg-black"
                  />
                ) : view.videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={view.videoUrl}
                      loop
                      playsInline
                      muted={muted}
                      autoPlay
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      onTimeUpdate={(e) => {
                        const v = e.currentTarget;
                        if (v.duration) setProgress((v.currentTime / v.duration) * 100);
                      }}
                      className="absolute inset-0 size-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={togglePlay}
                      aria-label={playing ? t("Pause video") : t("Play video")}
                      className="absolute inset-0 grid place-items-center"
                    >
                      {!playing && (
                        <span className="grid size-[4em] place-items-center rounded-full bg-white/25 ring-1 ring-white/50 backdrop-blur-sm">
                          <Play className="size-[1.6em] fill-white text-white" />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setMuted((m) => !m)}
                      aria-label={muted ? t("Unmute") : t("Mute")}
                      className="absolute end-[0.8em] top-[0.8em] grid size-[2.2em] place-items-center rounded-full bg-black/40 text-white"
                    >
                      {muted ? <VolumeX className="size-[1.1em]" /> : <Volume2 className="size-[1.1em]" />}
                    </button>

                    <span className="absolute inset-x-0 bottom-0 h-[0.25em] bg-white/25">
                      <span className="block h-full bg-[#5fe0d0]" style={{ width: `${progress}%` }} />
                    </span>
                  </>
                ) : (
                  <div className="absolute inset-0 grid place-items-center p-[1.5em] text-center text-white">
                    <span>
                      <Play className="mx-auto size-[2em] text-white/70" />
                      <span className="mt-[0.6em] block text-[0.75em] font-semibold text-white/80">
                        {t("The video of this lesson is coming soon.")}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions under the reel */}

            <div className="mt-[0.7em] flex items-center justify-center gap-[1.2em] lg:shrink-0">
              {prev ? (
                <Link href={lessonPath(code, prev.id) as Route} aria-label={t("Previous lesson")} className={circleBtn}>
                  <ChevronUp className="size-[1.3em]" />
                </Link>
              ) : (
                <span className={`${circleBtn} opacity-35`}>
                  <ChevronUp className="size-[1.3em]" />
                </span>
              )}

              <button
                type="button"
                onClick={toggleLike}
                aria-pressed={liked}
                aria-label={t("Like")}
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <Heart className={`size-[1.3em] ${liked ? "fill-[#e0245e] text-[#e0245e]" : ""}`} />
                </span>
                <span className="text-[0.6em] font-semibold text-[#14365a]">{likes}</span>
              </button>

              <button type="button" onClick={share} aria-label={t("Share")} className="flex flex-col items-center gap-[0.15em]">
                <span className={circleBtn}>
                  <Share2 className="size-[1.2em]" />
                </span>
                <span className="text-[0.6em] font-semibold text-[#14365a]">{copied ? t("Copied") : t("Share")}</span>
              </button>

              <button
                type="button"
                onClick={toggleSave}
                aria-pressed={saved}
                aria-label={t("Save")}
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <Bookmark className={`size-[1.2em] ${saved ? "fill-[#12606b] text-[#12606b]" : ""}`} />
                </span>
                <span className="text-[0.6em] font-semibold text-[#14365a]">{saved ? t("Saved") : t("Save")}</span>
              </button>

              {next ? (
                <Link href={lessonPath(code, next.id) as Route} aria-label={t("Next lesson")} className={circleBtn}>
                  <ChevronDown className="size-[1.3em]" />
                </Link>
              ) : (
                <span className={`${circleBtn} opacity-35`}>
                  <ChevronDown className="size-[1.3em]" />
                </span>
              )}
            </div>
          </div>

          {/* ---------- Practice / Overview panel ---------- */}

          <section className={`${box} flex min-h-[30em] min-w-0 flex-col overflow-hidden lg:min-h-0`}>
            <header className="shrink-0 border-b border-[#e3ebf3] px-[1.1em] pb-[0.7em] pt-[0.9em]">
              <div className="flex flex-wrap items-center gap-[0.5em]">
                <span className="rounded-full bg-[#e7f6f3] px-[0.8em] py-[0.15em] text-[0.6em] font-semibold text-[#12606b]">
                  {t(view.trackName)}
                </span>
                <span className="rounded-full bg-[#dff5e8] px-[0.8em] py-[0.15em] text-[0.6em] font-semibold text-[#2a9a5f]">
                  {t(view.level)}
                </span>
                <span className="text-[0.62em] font-semibold text-[#14365a]/55">
                  {t("Lesson {n} of {total}", { n: idx + 1, total: list.length })}
                </span>
              </div>
              <h1 className="mt-[0.35em] text-[1.25em] font-extrabold leading-tight text-[#14365a]">{t(view.title)}</h1>
              <p dir="auto" className="mt-[0.2em] line-clamp-2 text-[0.75em] text-[#14365a]/70">
                {view.concept}
              </p>

              {view.practice && (
                <div role="tablist" aria-label={t("Lesson panel")} className="mt-[0.7em] flex gap-[0.4em]">
                  {(
                    [
                      ["practice", t("Practice")],
                      ["overview", t("Overview")],
                    ] as const
                  ).map(([id, text]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={tab === id}
                      onClick={() => setPanel(id)}
                      className={`rounded-full px-[1.1em] py-[0.35em] text-[0.72em] font-semibold transition-colors ${
                        tab === id ? "bg-[#14365a] text-white" : "bg-[#f1f6fa] text-[#14365a]/70 hover:bg-[#e6eef5]"
                      }`}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {tab === "practice" && view.practice ? (
              <LessonPractice
                key={view.id}
                lessonId={view.id}
                practice={view.practice}
                offline={view.offline}
                initiallySolved={view.tryItDone}
              />
            ) : (
              <div className={`min-h-0 flex-1 space-y-[1.1em] overflow-y-auto p-[1.1em] ${noScrollbar}`}>
                <div className="rounded-[0.8em] bg-[#f3f9fb] p-[1em]">
                  <h2 className="flex items-center gap-[0.5em] text-[0.85em] font-extrabold text-[#14365a]">
                    <FileText className="size-[1.1em] text-[#12939b]" />
                    {t("Key idea")}
                  </h2>
                  <p dir="auto" className="mt-[0.4em] text-[0.8em] leading-relaxed text-[#14365a]/85">
                    {view.concept}
                  </p>
                </div>

                <div>
                  <h2 className="text-[0.85em] font-extrabold text-[#14365a]">{t("Lesson summary")}</h2>

                  <dl className="mt-[0.3em] divide-y divide-[#eef2f6] text-[0.75em]">
                    <div className="flex items-center justify-between py-[0.45em]">
                      <dt className="text-[#14365a]/65">{t("Estimated time")}</dt>
                      <dd className="font-semibold text-[#14365a]">{t("{n} min", { n: view.minutes })}</dd>
                    </div>
                    <div className="flex items-center justify-between py-[0.45em]">
                      <dt className="text-[#14365a]/65">{t("Level")}</dt>
                      <dd className="rounded-full bg-[#dff5e8] px-[0.8em] py-[0.05em] text-[0.9em] font-semibold text-[#2a9a5f]">
                        {t(view.level)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-[0.45em]">
                      <dt className="text-[#14365a]/65">{t("Format")}</dt>
                      <dd className="font-semibold text-[#14365a]">
                        {view.practice ? t("Short video + code practice") : t("Short video")}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between py-[0.45em]">
                      <dt className="text-[#14365a]/65">{t("Lesson")}</dt>
                      <dd className="font-semibold text-[#14365a]">{t("{n} of {total}", { n: idx + 1, total: list.length })}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex flex-wrap gap-[0.6em]">
                  {view.practice && (
                    <button
                      type="button"
                      onClick={() => setPanel("practice")}
                      className="inline-flex rounded-[0.5em] bg-[#12939b] px-[1.4em] py-[0.6em] text-[0.75em] font-semibold text-white hover:bg-[#0f7f86]"
                    >
                      {t("Start practising")}
                    </button>
                  )}
                  <Link
                    href={`${base}/quiz` as Route}
                    className="inline-flex rounded-[0.5em] border border-[#12939b]/60 px-[1.4em] py-[0.6em] text-[0.75em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
                  >
                    {t("Start quiz")}
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ================= Right column ================= */}

        <aside className={`flex min-h-0 min-w-0 flex-col gap-[0.6em] lg:overflow-y-auto ${noScrollbar}`}>
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
                <span className={`${label} block`}>{t("Your progress")}</span>
                <span className="mt-[0.2em] block text-[0.85em] font-extrabold text-[#14365a]">
                  {t("Lesson {n} of {total}", { n: idx + 1, total: list.length })}
                </span>
                <span className="mt-[0.25em] inline-block rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.05em] text-[0.55em] font-semibold text-[#12939b]">
                  {completed ? t("Completed") : t("In progress")}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={markComplete}
              disabled={busy || completed}
              className="mt-[0.6em] w-full rounded-[0.5em] border border-[#12939b]/60 bg-white py-[0.45em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7] disabled:opacity-60"
            >
              {busy ? t("Saving...") : completed ? t("Completed") : t("Mark as Complete")}
            </button>

            {error && (
              <p role="alert" className="mt-[0.4em] text-[0.65em] font-medium text-[#c0392b]">
                {error}
              </p>
            )}
          </section>

          {/* Quiz */}

          <section className="rounded-[0.9em] bg-gradient-to-br from-[#14586a] to-[#1d8a8f] p-[0.9em] text-white">
            <p className="text-[0.5em] font-bold uppercase tracking-wide text-white/70">{t("Lesson quiz")}</p>
            <h2 className="mt-[0.2em] text-[1em] font-extrabold">{t("Check your understanding")}</h2>
            <p className="mt-[0.15em] text-[0.6em] text-white/80">
              {t("{n} questions · about 5 minutes", { n: view.questionCount })}
            </p>
            <Link
              href={`${base}/quiz` as Route}
              className="mt-[0.6em] inline-flex items-center rounded-[0.5em] bg-white px-[1.1em] py-[0.4em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
            >
              {t("Start quiz")}
            </Link>
          </section>

          {/* Track content */}

          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={label}>{t("Track content")}</p>
                <h2 className="text-[0.9em] font-extrabold text-[#14365a]">{t("Lessons")}</h2>
              </div>
              <span className="rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.1em] text-[0.55em] font-semibold text-[#12939b]">
                {t("{n} lessons", { n: list.length })}
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
                      className={`flex items-center gap-[0.6em] rounded-[0.6em] px-[0.5em] py-[0.4em] ${
                        active ? "bg-[#e7f6f3]" : "hover:bg-[#f3f8fb]"
                      }`}
                    >
                      <span
                        className={`grid size-[1.9em] shrink-0 place-items-center rounded-full text-[0.65em] font-bold ${
                          active ? "bg-[#12606b] text-white" : "border border-[#cfdbe6] text-[#14365a]/70"
                        }`}
                      >
                        {done ? <CheckCircle2 className="size-[1.3em] text-[#12939b]" /> : i + 1}
                      </span>

                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[0.72em] font-semibold text-[#14365a]">{t(l.title)}</span>
                        <span className="block text-[0.58em] text-[#14365a]/60">{lessonMeta(l, i)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Resources */}

          <section className={`${box} p-[0.8em]`}>
            <p className={label}>{t("Resources")}</p>

            <ul className="mt-[0.3em] space-y-[0.1em]">
              {RESOURCES.map((r) => (
                <li key={r.name}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-[0.6em] rounded-[0.6em] px-[0.3em] py-[0.3em] text-start hover:bg-[#f3f8fb]"
                  >
                    <span
                      className="grid size-[2em] shrink-0 place-items-center rounded-[0.5em] text-[0.5em] font-bold"
                      style={{ backgroundColor: r.bg, color: r.color }}
                    >
                      {r.tag}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[0.7em] font-semibold text-[#14365a]">{t(r.name)}</span>
                      <span className="block text-[0.55em] text-[#14365a]/60">{t(r.meta)}</span>
                    </span>
                    <ChevronRight className="size-[1em] shrink-0 text-[#14365a]/50 rtl:rotate-180" />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Mentor */}

          <section className={`${box} p-[0.8em]`}>
            <p className={label}>{t("Your mentor")}</p>

            <div className="mt-[0.4em] flex items-center gap-[0.6em]">
              <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#12606b] text-[0.7em] font-bold text-white">
                AY
              </span>
              <span className="leading-tight">
                <span className="block text-[0.8em] font-extrabold text-[#14365a]">Ahmed Yasser</span>
                <span className="block text-[0.58em] text-[#14365a]/60">
                  {t(view.trackName)} · {t("{n}+ years", { n: 4 })}
                </span>
              </span>
            </div>

            <Link
              href={"/learner/mentorship" as Route}
              className="mt-[0.5em] block w-full rounded-[0.5em] bg-[#12606b] py-[0.45em] text-center text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
            >
              {t("Ask a question")}
            </Link>
          </section>
        </aside>
      </div>
    </>,
  );
}
