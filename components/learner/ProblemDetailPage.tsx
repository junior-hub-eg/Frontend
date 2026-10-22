"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { relatedMathProblems, type MathProblem } from "@/lib/math-problems";
import EquationSimulation from "./EquationSimulation";
import {
  Captions,
  Check,
  ChevronRight,
  Clock,
  HelpCircle,
  Maximize,
  Pause,
  Play,
  Settings,
  Volume2,
} from "lucide-react";

/** Put the real video URL here (e.g. "/videos/linear-equation.mp4"). While it is empty a placeholder shows. */
const VIDEO_SRC: string | undefined = undefined;

/* ---------------- Data (replace with API data later) ---------------- */

const TABS = ["AI Explanation", "Try it Yourself", "Steps", "Related Problems"] as const;
type Tab = (typeof TABS)[number];

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "00:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};

const SPEEDS = [1, 1.25, 1.5, 2, 0.75];

/* ---------------- Video player ---------------- */

function VideoPlayer() {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [speedIdx, setSpeedIdx] = useState(0);

  const hasVideo = Boolean(VIDEO_SRC);

  function toggle() {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  }

  function seek(value: number) {
    if (video.current) video.current.currentTime = value;
    setTime(value);
  }

  function changeVolume(value: number) {
    if (video.current) video.current.volume = value;
    setVolume(value);
  }

  function cycleSpeed() {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (video.current) video.current.playbackRate = SPEEDS[next];
  }

  function fullscreen() {
    void box.current?.requestFullscreen?.();
  }

  const btn =
    "grid h-[2.2em] w-[2.2em] place-items-center rounded-full text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:opacity-40";

  return (
    <div
      ref={box}
      className="relative aspect-[838/361] w-full overflow-hidden rounded-[1.4em] bg-gradient-to-br from-[#2a3d3a] via-[#33504a] to-[#1d2b2a]"
    >
      {hasVideo && (
        <video
          ref={video}
          src={VIDEO_SRC}
          className="absolute inset-0 h-full w-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onClick={toggle}
        />
      )}

      {!hasVideo && (
        <p className="absolute left-1/2 top-[42%] -translate-x-1/2 text-[0.9em] text-white/70">
          Video coming soon
        </p>
      )}

      {/* Quality badge */}
      <span className="absolute end-[1em] top-[1em] flex items-center gap-[0.5em] rounded-full bg-black/45 px-[0.9em] py-[0.35em] text-[0.7em] font-medium text-white">
        <span className="h-[0.6em] w-[0.6em] rounded-full bg-red-500" />
        HD 1080p
      </span>

      {/* Big play button */}
      {!playing && (
        <button
          type="button"
          onClick={toggle}
          disabled={!hasVideo}
          aria-label="Play video"
          className="absolute left-1/2 top-1/2 grid h-[4.6em] w-[4.6em] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#2bb8a6]/90 text-white ring-[0.35em] ring-white/40 transition hover:scale-105 disabled:cursor-not-allowed"
        >
          <Play className="ms-[0.2em] h-[1.9em] w-[1.9em] fill-white" />
        </button>
      )}

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[1.2em] pb-[0.9em] pt-[2.4em] text-white">
        <div className="flex items-center gap-[0.8em] text-[0.7em]">
          <span className="tabular-nums">{fmt(time)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={!hasVideo}
            aria-label="Seek"
            className="h-[0.35em] flex-1 cursor-pointer accent-[#2bb8a6] disabled:cursor-not-allowed"
          />
          <span className="tabular-nums">{fmt(duration)}</span>
        </div>

        <div className="mt-[0.4em] flex items-center gap-[0.6em]">
          <button
            type="button"
            onClick={toggle}
            disabled={!hasVideo}
            aria-label={playing ? "Pause" : "Play"}
            className="grid h-[2.6em] w-[2.6em] place-items-center rounded-full bg-white text-[#14365a] transition hover:brightness-95 disabled:opacity-50"
          >
            {playing ? (
              <Pause className="h-[1.2em] w-[1.2em] fill-current" />
            ) : (
              <Play className="ms-[0.1em] h-[1.2em] w-[1.2em] fill-current" />
            )}
          </button>

          <Volume2 className="h-[1.3em] w-[1.3em]" aria-hidden />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volume"
            className="h-[0.35em] w-[6em] cursor-pointer accent-white"
          />

          <div className="ms-auto flex items-center gap-[0.3em]">
            <button
              type="button"
              onClick={cycleSpeed}
              aria-label="Playback speed"
              className="rounded-[0.4em] border border-white/60 px-[0.6em] py-[0.15em] text-[0.7em] font-medium transition hover:bg-white/20"
            >
              {SPEEDS[speedIdx]}x
            </button>
            <button type="button" className={btn} aria-label="Captions" disabled>
              <Captions className="h-[1.2em] w-[1.2em]" />
            </button>
            <button type="button" className={btn} aria-label="Settings" disabled>
              <Settings className="h-[1.2em] w-[1.2em]" />
            </button>
            <button type="button" onClick={fullscreen} className={btn} aria-label="Fullscreen">
              <Maximize className="h-[1.2em] w-[1.2em]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function ProblemDetailPage({ problem }: { problem: MathProblem }) {
  const [tab, setTab] = useState<Tab>("AI Explanation");
  const related = relatedMathProblems(problem);
  const summary = [
    { icon: Clock, text: `Estimated time ${problem.minutes} minutes` },
    { icon: HelpCircle, text: `${problem.topic} · ${problem.algorithm}` },
  ];

  const crumb = "hover:underline";

  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-[0.5em] text-[0.8em] text-[#14365a]">
          <Link href={"/learner/ai-curriculum" as Route} className={`font-semibold ${crumb}`}>
            AI Curriculum
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <Link href={"/learner/ai-curriculum/mathematics" as Route} className={crumb}>
            Mathematics
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <Link href={"/learner/ai-curriculum/mathematics" as Route} className={crumb}>
            {problem.algorithm}
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <span>{problem.title}</span>
        </nav>

        {/* Title */}
        <h1 className="mt-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">{problem.title}</h1>
        <div className="mt-[0.2em] flex items-center gap-[0.8em]">
          <p className="font-serif text-[1.05em] text-[#14365a]">{problem.formula}</p>
          <span className="rounded-[0.4em] bg-[#d5f2de] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a45]">
            {problem.level}
          </span>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Problem sections"
          className="mt-[1.2em] inline-flex max-w-full overflow-x-auto rounded-[0.9em] border border-[#e3e9f0] bg-white"
        >
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={`relative shrink-0 px-[1.6em] py-[1.1em] text-[0.8em] font-medium text-[#14365a] transition ${
                  active
                    ? "bg-[#e4f7f4] font-semibold text-[#0f7a81] after:absolute after:inset-x-0 after:bottom-0 after:h-[0.2em] after:bg-[#2bb8a6]"
                    : "hover:bg-[#f3f6f9]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-[1em]">
          {tab === "AI Explanation" && <VideoPlayer />}

          {tab === "Try it Yourself" &&
            (problem.equation ? (
              <EquationSimulation {...problem.equation} />
            ) : (
              <div className="rounded-[1.2em] border border-dashed border-[#c9d3df] p-[2.5em] text-center text-[0.9em] text-[#5b7089]">
                The interactive simulation for this problem is coming soon.
              </div>
            ))}

          {tab === "Steps" && (
            <ol className="space-y-[0.8em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
              {problem.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-[0.9em] text-[0.9em] text-[#14365a]">
                  <span className="grid h-[1.9em] w-[1.9em] shrink-0 place-items-center rounded-full bg-[#e4f7f4] text-[0.85em] font-bold text-[#0f7a81]">
                    {i + 1}
                  </span>
                  <span className="pt-[0.2em]">{s}</span>
                </li>
              ))}
            </ol>
          )}

          {tab === "Related Problems" && (
            <ul className="space-y-[0.8em]">
              {related.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/learner/ai-curriculum/mathematics/${r.id}` as Route}
                      className="flex items-center justify-between rounded-[1em] border border-[#e3e9f0] bg-white px-[1.2em] py-[1em] text-[0.9em] font-semibold text-[#14365a] transition hover:bg-[#f3f6f9]"
                    >
                      <span>
                        {r.title}
                        <span className="ms-[0.8em] font-serif font-normal text-[#5b7089]">{r.formula}</span>
                      </span>
                      <ChevronRight className="h-[1.2em] w-[1.2em]" />
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Info cards */}
        <div className="mt-[1em] grid gap-[1em] md:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
            <h2 className="text-[1em] font-bold text-[#14365a]">What you will learn</h2>
            <ul className="mt-[1em] space-y-[0.9em]">
              {problem.learn.map((item) => (
                <li key={item} className="flex items-center gap-[0.8em] text-[0.8em] text-[#14365a]">
                  <span className="grid h-[1.8em] w-[1.8em] shrink-0 place-items-center rounded-full bg-[#12939b] text-white">
                    <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
            <h2 className="text-[1em] font-bold text-[#14365a]">Problem summary</h2>
            <p className="mt-[0.8em] font-serif text-[1.05em] text-[#14365a]">{problem.formula}</p>
            <ul className="mt-[0.8em] space-y-[0.8em]">
              {summary.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-[0.8em] text-[0.75em] text-[#14365a]">
                  <span className="grid h-[2em] w-[2em] shrink-0 place-items-center rounded-full bg-[#d9f2f1] text-[#12939b]">
                    <Icon className="h-[1.2em] w-[1.2em]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}