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
  LoaderCircle,
  MessageCircle,
  Play,
  Send,
  Share2,
  Volume2,
  VolumeX,
  XCircle,
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

type Comment = { id: string; name: string; text: string; time: string };

const OBJECTIVES = [
  "Understand what UI/UX design really is",
  "Learn the core vocabulary designers use",
  "Spot the difference between good and poor usability",
];

const RESOURCES = [
  {
    tag: "PDF",
    color: "#c0392b",
    bg: "#fbe9e7",
    name: "Lesson slides",
    meta: "2.4 MB · PDF",
  },
  {
    tag: "KIT",
    color: "#7a4fd6",
    bg: "#efe7fb",
    name: "Wireframe starter kit",
    meta: "8 KB · Figma",
  },
  {
    tag: "DOC",
    color: "#2f6fc4",
    bg: "#e4f0ff",
    name: "Further reading list",
    meta: "6 articles",
  },
];

const DEMO_META = [
  "8 min · Video lesson",
  "12 min · Video + quiz",
  "18 min · Hands-on project",
];

/** Demo comments + like count until the backend has them. */
const SEED_COMMENTS: Comment[] = [
  {
    id: "d1",
    name: "Sara Ahmed",
    text: "This explained it so clearly, thank you!",
    time: "2h",
  },
  {
    id: "d2",
    name: "Omar Hassan",
    text: "Can we get the wireframe kit in Figma?",
    time: "5h",
  },
  {
    id: "d3",
    name: "Mariam Tarek",
    text: "The vocabulary part helped me a lot.",
    time: "1d",
  },
];

const BASE_LIKES = 128;

/* ---------- Try-it-yourself challenge ---------- */

const CHALLENGE = {
  task: "Write a function named sum that takes two numbers and returns their total.",
  starter: "function sum(a, b) {\n  // write your code here\n}",
  fn: "sum",
  hint: "Use the return keyword to send the result back.",
  tests: [
    { args: [2, 3], expected: 5 },
    { args: [10, -4], expected: 6 },
    { args: [0, 0], expected: 0 },
  ],
};

type TestResult = {
  label: string;
  pass: boolean;
  got: string;
};

type CheckResult = {
  ok: boolean;
  results: TestResult[];
  error?: string;
};

function runChallenge(source: string): CheckResult {
  try {
    const fn = new Function(
      `${source}\nreturn typeof ${CHALLENGE.fn} === "function" ? ${CHALLENGE.fn} : null;`,
    )() as ((...a: number[]) => unknown) | null;

    if (!fn) {
      return {
        ok: false,
        results: [],
        error: `Define a function named ${CHALLENGE.fn}.`,
      };
    }

    const results = CHALLENGE.tests.map((t) => {
      const label = `${CHALLENGE.fn}(${t.args.join(", ")}) should return ${t.expected}`;

      try {
        const got = fn(...t.args);

        return {
          label,
          pass: got === t.expected,
          got: String(got),
        };
      } catch {
        return {
          label,
          pass: false,
          got: "error",
        };
      }
    });

    return {
      ok: results.every((r) => r.pass),
      results,
    };
  } catch (e) {
    return {
      ok: false,
      results: [],
      error:
        e instanceof Error
          ? e.message
          : "Your code has an error.",
    };
  }
}

const lessonMeta = (l: LessonSummary, i: number) =>
  l.durationSeconds > 0
    ? `${Math.max(1, Math.round(l.durationSeconds / 60))} min · Video lesson`
    : (DEMO_META[i] ?? DEMO_META[0]);

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
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [state, setState] = useState<State>({
    kind: "loading",
  });

  const [marked, setMarked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reel state
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(8);

  // Social state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mine, setMine] = useState<Comment[]>([]);
  const [panel, setPanel] = useState<"comments" | "overview">(
    "comments",
  );
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  // Try-it-yourself state
  const [snippet, setSnippet] = useState(CHALLENGE.starter);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [solved, setSolved] = useState(false);

  useEffect(() => {
    let active = true;

    setState({ kind: "loading" });
    setMarked(false);
    setError(null);
    setPlaying(false);
    setProgress(8);

    setLiked(readStore(`jh:lesson:${lessonId}:liked`, false));
    setSaved(readStore(`jh:lesson:${lessonId}:saved`, false));

    setMine(
      readStore<Comment[]>(
        `jh:lesson:${lessonId}:comments`,
        [],
      ),
    );

    // Restore saved practice code and solution status
    setSnippet(
      readStore(
        `jh:lesson:${lessonId}:code`,
        CHALLENGE.starter,
      ),
    );

    setSolved(
      readStore(
        `jh:lesson:${lessonId}:solved`,
        false,
      ),
    );

    setCheck(null);

    // Local no-login mode
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      setState({
        kind: "ready",
        view: offlineView(code, lessonId),
      });

      return;
    }

    Promise.all([
      getLesson(lessonId).catch(() => null),
      getTrackLessons(code).catch(() => null),
    ]).then(([lesson, track]) => {
      if (!active) return;

      if (!lesson || !track) {
        setState({
          kind: "ready",
          view: offlineView(code, lessonId),
        });

        return;
      }

      setState({
        kind: "ready",
        view: {
          id: lesson.id,
          title: lesson.title,
          concept: lesson.concept,
          level: lesson.level,
          minutes: Math.max(
            1,
            Math.round(lesson.durationSeconds / 60),
          ),
          videoUrl: lesson.videoUrl
            ? mediaUrl(lesson.videoUrl)
            : null,
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

  // Values needed by hooks
  const ready = state.kind === "ready" ? state.view : null;
  const list = ready?.list ?? [];

  const idx = ready
    ? Math.max(
        0,
        list.findIndex((l) => l.id === ready.id),
      )
    : 0;

  const prev = list[idx - 1];
  const next = list[idx + 1];

  const prevId = prev?.id;
  const nextId = next?.id;

  // Reels navigation with the arrow keys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;

      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (e.key === "ArrowDown" && nextId) {
        router.push(lessonPath(code, nextId) as Route);
      }

      if (e.key === "ArrowUp" && prevId) {
        router.push(lessonPath(code, prevId) as Route);
      }
    };

    window.addEventListener("keydown", onKey);

    return () =>
      window.removeEventListener("keydown", onKey);
  }, [code, nextId, prevId, router]);

  /* Desktop: one screen, no page scroll. */
  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{
          fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)",
        }}
      >
        {children}
      </div>
    </div>
  );

  if (state.kind === "loading") {
    return wrapper(
      <div
        className="grid min-h-[50vh] flex-1 place-items-center"
        role="status"
        aria-label="Loading"
      >
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>,
    );
  }

  const { view } = state;

  const current = list[idx];

  const completed =
    marked ||
    (!view.offline && current?.status === "Done");

  const doneOthers = view.offline
    ? 0
    : list.filter(
        (l) => l.status === "Done" && l.id !== view.id,
      ).length;

  const doneCount = doneOthers + (completed ? 1 : 0);

  const percent =
    view.offline && !completed
      ? 15
      : list.length
        ? Math.round((doneCount / list.length) * 100)
        : 0;

  const base = lessonPath(code, view.id);

  const comments = [...mine, ...SEED_COMMENTS];
  const likes = BASE_LIKES + (liked ? 1 : 0);

  function togglePlay() {
    const v = videoRef.current;

    if (v) {
      if (v.paused) void v.play();
      else v.pause();
    } else {
      setPlaying((p) => !p);
    }
  }

  function toggleLike() {
    const nextLiked = !liked;

    setLiked(nextLiked);

    writeStore(
      `jh:lesson:${view.id}:liked`,
      nextLiked,
    );
  }

  function toggleSave() {
    const nextSaved = !saved;

    setSaved(nextSaved);

    writeStore(
      `jh:lesson:${view.id}:saved`,
      nextSaved,
    );
  }

  // Run challenge tests and save the code
  function checkCode() {
    const r = runChallenge(snippet);

    setCheck(r);

    writeStore(
      `jh:lesson:${view.id}:code`,
      snippet,
    );

    if (r.ok) {
      setSolved(true);

      writeStore(
        `jh:lesson:${view.id}:solved`,
        true,
      );
    }
  }

  // Reset the editor to the starter code
  function resetCode() {
    setSnippet(CHALLENGE.starter);
    setCheck(null);
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(
        window.location.href,
      );

      setCopied(true);

      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard may be blocked */
    }
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault();

    const text = draft.trim();

    if (!text) return;

    const updated = [
      {
        id: String(Date.now()),
        name: "You",
        text,
        time: "Just now",
      },
      ...mine,
    ];

    setMine(updated);

    writeStore(
      `jh:lesson:${view.id}:comments`,
      updated,
    );

    setDraft("");
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
      setError(
        errorMessage(
          e,
          "Could not save your progress.",
        ),
      );
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
        Track Details
      </Link>

      <div className="grid gap-[1em] lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_27%]">
        {/* ================= Left: reel + comments ================= */}

        <div className="grid min-h-0 min-w-0 gap-[1em] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* ---------- Reel + actions ---------- */}

          <div className="flex min-h-0 min-w-0 flex-col">
            <div className="relative mx-auto w-full max-w-[20em] lg:max-w-none lg:min-h-0 lg:flex-1">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.2em] bg-gradient-to-b from-[#14586a] via-[#1d7a85] to-[#0f4252] shadow-[0_14px_34px_rgba(20,54,90,0.22)] lg:absolute lg:inset-y-0 lg:left-1/2 lg:w-auto lg:max-w-full lg:-translate-x-1/2">
                {view.videoUrl ? (
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

                      if (v.duration) {
                        setProgress(
                          (v.currentTime / v.duration) * 100,
                        );
                      }
                    }}
                    className="absolute inset-0 size-full object-cover"
                  />
                ) : (
                  <span className="absolute left-[1em] top-[1em] rounded-[0.4em] bg-black/40 px-[0.6em] py-[0.15em] text-[0.55em] font-bold text-white">
                    Video preview
                  </span>
                )}

                {/* Tap anywhere to play / pause */}

                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={
                    playing ? "Pause video" : "Play video"
                  }
                  className="absolute inset-0 grid place-items-center"
                >
                  {!playing && (
                    <span className="grid size-[4em] place-items-center rounded-full bg-white/25 ring-1 ring-white/50 backdrop-blur-sm">
                      <Play className="size-[1.6em] fill-white text-white" />
                    </span>
                  )}
                </button>

                {/* Mute */}

                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="absolute right-[0.8em] top-[0.8em] grid size-[2.2em] place-items-center rounded-full bg-black/40 text-white"
                >
                  {muted ? (
                    <VolumeX className="size-[1.1em]" />
                  ) : (
                    <Volume2 className="size-[1.1em]" />
                  )}
                </button>

                {/* Caption overlay */}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-[1em] pt-[3em] text-white">
                  <div className="flex items-center gap-[0.6em]">
                    <span className="grid size-[2.2em] place-items-center rounded-full bg-white/90 text-[0.7em] font-bold text-[#12606b]">
                      AY
                    </span>

                    <span className="text-[0.75em] font-bold">
                      Ahmed Yasser
                    </span>

                    <span className="rounded-full border border-white/60 px-[0.7em] py-[0.05em] text-[0.55em] font-semibold">
                      {view.trackName}
                    </span>
                  </div>

                  <h1 className="mt-[0.6em] text-[1.05em] font-extrabold leading-tight">
                    {view.title}
                  </h1>

                  <p className="mt-[0.2em] line-clamp-2 text-[0.65em] text-white/80">
                    {view.concept}
                  </p>
                </div>

                {/* Progress */}

                <span className="absolute inset-x-0 bottom-0 h-[0.25em] bg-white/25">
                  <span
                    className="block h-full bg-[#5fe0d0]"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </div>
            </div>

            {/* Actions under the reel */}

            <div className="mt-[0.7em] flex items-center justify-center gap-[1.2em] lg:shrink-0">
              {prev ? (
                <Link
                  href={lessonPath(code, prev.id) as Route}
                  aria-label="Previous lesson"
                  className={circleBtn}
                >
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
                aria-label="Like"
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <Heart
                    className={`size-[1.3em] ${
                      liked
                        ? "fill-[#e0245e] text-[#e0245e]"
                        : ""
                    }`}
                  />
                </span>

                <span className="text-[0.6em] font-semibold text-[#14365a]">
                  {likes}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPanel("comments")}
                aria-label="Comments"
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <MessageCircle className="size-[1.3em]" />
                </span>

                <span className="text-[0.6em] font-semibold text-[#14365a]">
                  {comments.length}
                </span>
              </button>

              <button
                type="button"
                onClick={share}
                aria-label="Share"
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <Share2 className="size-[1.2em]" />
                </span>

                <span className="text-[0.6em] font-semibold text-[#14365a]">
                  {copied ? "Copied" : "Share"}
                </span>
              </button>

              <button
                type="button"
                onClick={toggleSave}
                aria-pressed={saved}
                aria-label="Save"
                className="flex flex-col items-center gap-[0.15em]"
              >
                <span className={circleBtn}>
                  <Bookmark
                    className={`size-[1.2em] ${
                      saved
                        ? "fill-[#12606b] text-[#12606b]"
                        : ""
                    }`}
                  />
                </span>

                <span className="text-[0.6em] font-semibold text-[#14365a]">
                  {saved ? "Saved" : "Save"}
                </span>
              </button>

              {next ? (
                <Link
                  href={lessonPath(code, next.id) as Route}
                  aria-label="Next lesson"
                  className={circleBtn}
                >
                  <ChevronDown className="size-[1.3em]" />
                </Link>
              ) : (
                <span className={`${circleBtn} opacity-35`}>
                  <ChevronDown className="size-[1.3em]" />
                </span>
              )}
            </div>
          </div>

          {/* ---------- Comments / Overview panel ---------- */}

          <section
            className={`${box} flex min-h-[22em] min-w-0 flex-col overflow-hidden lg:min-h-0`}
          >
            <div
              role="tablist"
              aria-label="Lesson panel"
              className="flex shrink-0 border-b border-[#e3ebf3] p-[0.3em]"
            >
              {(
                [
                  ["comments", `Comments (${comments.length})`],
                  ["overview", "Overview"],
                ] as const
              ).map(([id, text]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={panel === id}
                  onClick={() => setPanel(id)}
                  className={`flex-1 rounded-[0.6em] px-[1em] py-[0.5em] text-[0.75em] font-semibold transition-colors ${
                    panel === id
                      ? "bg-[#e7f6f3] text-[#12606b]"
                      : "text-[#14365a]/70 hover:bg-[#f3f8fb]"
                  }`}
                >
                  {text}
                </button>
              ))}
            </div>

            {panel === "comments" ? (
              <>
                <ul
                  className={`min-h-0 flex-1 space-y-[0.9em] overflow-y-auto p-[1em] ${noScrollbar}`}
                >
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="flex gap-[0.7em]"
                    >
                      <span className="grid size-[2.2em] shrink-0 place-items-center rounded-full bg-[#e7f6f3] text-[0.7em] font-bold text-[#12606b]">
                        {c.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>

                      <span className="min-w-0 leading-snug">
                        <span className="text-[0.75em] font-bold text-[#14365a]">
                          {c.name}{" "}
                          <span className="font-normal text-[#14365a]/50">
                            · {c.time}
                          </span>
                        </span>

                        <span className="mt-[0.1em] block break-words text-[0.75em] text-[#14365a]/85">
                          {c.text}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>

                <form
                  onSubmit={addComment}
                  className="flex shrink-0 items-center gap-[0.6em] border-t border-[#e3ebf3] p-[0.7em]"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Add a comment..."
                    maxLength={300}
                    className="h-[2.6em] min-w-0 flex-1 rounded-full border border-[#e1e8f0] bg-[#f6fafd] px-[1.1em] text-[0.75em] text-[#14365a] outline-none placeholder:text-[#14365a]/45 focus:ring-2 focus:ring-[#12939b]/30"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    aria-label="Post comment"
                    className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#12606b] text-white disabled:opacity-40"
                  >
                    <Send className="size-[1.1em]" />
                  </button>
                </form>
              </>
            ) : (
              <div
                className={`min-h-0 flex-1 space-y-[1em] overflow-y-auto p-[1em] ${noScrollbar}`}
              >
                <div>
                  <h2 className="text-[0.85em] font-extrabold text-[#14365a]">
                    What you will learn
                  </h2>

                  <ul className="mt-[0.5em] space-y-[0.4em]">
                    {OBJECTIVES.map((o) => (
                      <li
                        key={o}
                        className="flex items-center gap-[0.5em] text-[0.72em] text-[#14365a]/85"
                      >
                        <CheckCircle2 className="size-[1.3em] shrink-0 text-[#12939b]" />
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-[0.85em] font-extrabold text-[#14365a]">
                    Lesson summary
                  </h2>

                  <dl className="mt-[0.3em] divide-y divide-[#eef2f6] text-[0.72em]">
                    <div className="flex items-center justify-between py-[0.4em]">
                      <dt className="text-[#14365a]/65">
                        Estimated time
                      </dt>

                      <dd className="font-semibold text-[#14365a]">
                        {view.minutes} minutes
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-[0.4em]">
                      <dt className="text-[#14365a]/65">
                        Level
                      </dt>

                      <dd className="rounded-full bg-[#dff5e8] px-[0.8em] py-[0.05em] text-[0.9em] font-semibold text-[#2a9a5f]">
                        {view.level}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-[0.4em]">
                      <dt className="text-[#14365a]/65">
                        Format
                      </dt>

                      <dd className="font-semibold text-[#14365a]">
                        Video lesson
                      </dd>
                    </div>

                    <div className="flex items-center justify-between py-[0.4em]">
                      <dt className="text-[#14365a]/65">
                        Lesson
                      </dt>

                      <dd className="font-semibold text-[#14365a]">
                        {idx + 1} of {list.length}
                      </dd>
                    </div>
                  </dl>
                </div>

                <Link
                  href={`${base}/challenge` as Route}
                  className="inline-flex rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.55em] text-[0.75em] font-semibold text-white hover:bg-[#0f505a]"
                >
                  Open Lesson
                </Link>
              </div>
            )}
          </section>
        </div>

        {/* ================= Right column ================= */}

        <aside
          className={`flex min-h-0 min-w-0 flex-col gap-[0.6em] lg:overflow-y-auto ${noScrollbar}`}
        >
          {/* Progress */}

          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-center gap-[0.8em]">
              <span
                className="grid size-[3.6em] shrink-0 place-items-center rounded-full text-[0.75em] font-extrabold text-[#14365a]"
                style={{
                  background: `conic-gradient(#12939b ${percent * 3.6}deg, #e3ebf3 0)`,
                }}
              >
                <span className="grid size-[78%] place-items-center rounded-full bg-white">
                  {percent}%
                </span>
              </span>

              <span className="leading-tight">
                <span className={`${label} block`}>
                  Your progress
                </span>

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
              {busy
                ? "Saving..."
                : completed
                  ? "Completed"
                  : "Mark as Complete"}
            </button>

            {error && (
              <p
                role="alert"
                className="mt-[0.4em] text-[0.65em] font-medium text-[#c0392b]"
              >
                {error}
              </p>
            )}
          </section>

          {/* Track content */}

          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={label}>Track content</p>

                <h2 className="text-[0.9em] font-extrabold text-[#14365a]">
                  Lessons
                </h2>
              </div>

              <span className="rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.1em] text-[0.55em] font-semibold text-[#12939b]">
                {list.length} lessons
              </span>
            </div>

            <ol className="mt-[0.4em] space-y-[0.2em]">
              {list.map((l, i) => {
                const active = l.id === view.id;

                const done =
                  !view.offline &&
                  l.status === "Done" &&
                  !active;

                return (
                  <li key={l.id}>
                    <Link
                      href={lessonPath(code, l.id) as Route}
                      className={`flex items-center gap-[0.6em] rounded-[0.6em] px-[0.5em] py-[0.4em] ${
                        active
                          ? "bg-[#e7f6f3]"
                          : "hover:bg-[#f3f8fb]"
                      }`}
                    >
                      <span
                        className={`grid size-[1.9em] shrink-0 place-items-center rounded-full text-[0.65em] font-bold ${
                          active
                            ? "bg-[#12606b] text-white"
                            : "border border-[#cfdbe6] text-[#14365a]/70"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="size-[1.3em] text-[#12939b]" />
                        ) : (
                          i + 1
                        )}
                      </span>

                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block truncate text-[0.72em] font-semibold text-[#14365a]">
                          {l.title}
                        </span>

                        <span className="block text-[0.58em] text-[#14365a]/60">
                          {lessonMeta(l, i)}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Try it yourself */}

          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={label}>Practice</p>

                <h2 className="text-[0.9em] font-extrabold text-[#14365a]">
                  Try it yourself
                </h2>
              </div>

              {solved && (
                <span className="rounded-full bg-[#dff5e8] px-[0.7em] py-[0.1em] text-[0.55em] font-semibold text-[#2a9a5f]">
                  Solved
                </span>
              )}
            </div>

            <p className="mt-[0.3em] text-[0.65em] text-[#14365a]/75">
              {CHALLENGE.task}
            </p>

            <textarea
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              spellCheck={false}
              dir="ltr"
              aria-label="Your code"
              rows={5}
              className="mt-[0.5em] w-full resize-none rounded-[0.5em] border border-[#e1e8f0] bg-[#0f2a3d] p-[0.6em] font-mono text-[0.65em] leading-relaxed text-[#d6f5ef] outline-none focus:ring-2 focus:ring-[#12939b]/40"
            />

            <div className="mt-[0.5em] flex gap-[0.5em]">
              <button
                type="button"
                onClick={checkCode}
                className="flex-1 rounded-[0.5em] bg-[#12606b] py-[0.45em] text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
              >
                Run &amp; Check
              </button>

              <button
                type="button"
                onClick={resetCode}
                className="rounded-[0.5em] border border-[#12939b]/60 bg-white px-[1em] py-[0.45em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
              >
                Reset
              </button>
            </div>

            {check && (
              <div
                role="status"
                className="mt-[0.5em] space-y-[0.3em]"
              >
                <p
                  className={`text-[0.7em] font-bold ${
                    check.ok
                      ? "text-[#2a9a5f]"
                      : "text-[#c0392b]"
                  }`}
                >
                  {check.ok
                    ? "Correct! Nice work."
                    : "Not quite yet. Check the details and try again."}
                </p>

                {check.error && (
                  <p className="text-[0.62em] text-[#c0392b]">
                    {check.error}
                  </p>
                )}

                {check.results.map((r) => (
                  <p
                    key={r.label}
                    className="flex items-start gap-[0.4em] text-[0.62em] text-[#14365a]/80"
                  >
                    {r.pass ? (
                      <CheckCircle2 className="mt-[0.1em] size-[1.2em] shrink-0 text-[#2a9a5f]" />
                    ) : (
                      <XCircle className="mt-[0.1em] size-[1.2em] shrink-0 text-[#c0392b]" />
                    )}

                    <span>
                      {r.label}

                      {!r.pass && (
                        <span className="text-[#c0392b]">
                          {" "}
                          (you got {r.got})
                        </span>
                      )}
                    </span>
                  </p>
                ))}

                {!check.ok && (
                  <p className="text-[0.6em] italic text-[#14365a]/60">
                    Hint: {CHALLENGE.hint}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Quiz */}

          <section className="rounded-[0.9em] bg-gradient-to-br from-[#14586a] to-[#1d8a8f] p-[0.9em] text-white">
            <p className="text-[0.5em] font-bold uppercase tracking-wide text-white/70">
              Lesson quiz
            </p>

            <h2 className="mt-[0.2em] text-[1em] font-extrabold">
              Check your understanding
            </h2>

            <p className="mt-[0.15em] text-[0.6em] text-white/80">
              {view.questionCount} questions · about 5 minutes
            </p>

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
                  <button
                    type="button"
                    className="flex w-full items-center gap-[0.6em] rounded-[0.6em] px-[0.3em] py-[0.3em] text-left hover:bg-[#f3f8fb]"
                  >
                    <span
                      className="grid size-[2em] shrink-0 place-items-center rounded-[0.5em] text-[0.5em] font-bold"
                      style={{
                        backgroundColor: r.bg,
                        color: r.color,
                      }}
                    >
                      {r.tag}
                    </span>

                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[0.7em] font-semibold text-[#14365a]">
                        {r.name}
                      </span>

                      <span className="block text-[0.55em] text-[#14365a]/60">
                        {r.meta}
                      </span>
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
              <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#12606b] text-[0.7em] font-bold text-white">
                AY
              </span>

              <span className="leading-tight">
                <span className="block text-[0.8em] font-extrabold text-[#14365a]">
                  Ahmed Yasser
                </span>

                <span className="block text-[0.58em] text-[#14365a]/60">
                  {view.trackName} · 4+ years
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPanel("comments")}
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
