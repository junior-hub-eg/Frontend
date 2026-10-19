"use client";

import { useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CirclePlay, LoaderCircle, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { selectTrack, startInterview, trackPath, type DiscoveryPath, type InterviewState, type TrackSummary } from "@/lib/learning-api";

const CHOICES: { path: DiscoveryPath; emoji: string; title: string; text: string; bg: string }[] = [
  {
    path: "KnowsTrack",
    emoji: "🎯",
    title: "I know what I want",
    text: "Pick your track from the list and start learning right away.",
    bg: "from-[#e3f6ee] to-[#f4fbf8]",
  },
  {
    path: "Exploring",
    emoji: "🧭",
    title: "I have no idea",
    text: "Explore the kinds of tech work in a friendly AI interview, then see the tracks that fit you.",
    bg: "from-[#dcebfb] to-[#f1f7fe]",
  },
  {
    path: "Unsure",
    emoji: "🤔",
    title: "I'm not sure yet",
    text: "Answer a few questions about what you enjoy, and the AI suggests your top 3 tracks.",
    bg: "from-[#efe5fb] to-[#f8f3fe]",
  },
];

/** The first visit to Courses, while the student has no track (US-04, US-07): three ways in. */
export default function FindYourTrack({
  tracks,
  inProgress,
}: {
  tracks: TrackSummary[];
  inProgress: InterviewState | null;
}) {
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restarting, setRestarting] = useState(false);

  /** Closes the interview in progress and opens a new one with the same path. */
  async function startAgain(path: DiscoveryPath) {
    setRestarting(true);
    setError(null);
    try {
      await startInterview(path, true);
      router.push(`/learner/courses/discovery?path=${path}&fresh=1`);
    } catch (e) {
      setError(errorMessage(e, "We couldn't start a new interview. Please try again."));
      setRestarting(false);
    }
  }

  async function choose(code: string) {
    setSaving(code);
    setError(null);
    try {
      await selectTrack(code);
      router.push(trackPath(code) as Route);
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your track. Please try again."));
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-[#fbfdff] p-6 md:p-10">
      <h1 className="text-[2em] font-extrabold leading-tight text-[#14365a]">Find your track</h1>
      <p className="mt-1 text-sm text-[#14365a]/75">
        {picking ? "Choose the track you want to learn. You can learn more tracks later." : "How do you want to start? Pick the way that feels right."}
      </p>

      {inProgress && !picking && (
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[#12939b]/30 bg-[#e9f7f4] p-4 text-sm text-[#14365a]">
          <CirclePlay className="size-6 shrink-0 text-[#12939b]" />
          <span className="min-w-0 flex-1">
            <span className="block font-bold">Continue your interview</span>
            You answered {inProgress.answeredCount} of {inProgress.maxQuestions} questions.
          </span>
          <button
            type="button"
            disabled={restarting}
            onClick={() => startAgain(inProgress.path)}
            className="flex items-center gap-1.5 rounded-full border border-[#12939b] px-4 py-2 text-xs font-bold text-[#12939b] hover:bg-white disabled:opacity-60"
          >
            {restarting ? <LoaderCircle className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Start again
          </button>
          <button
            type="button"
            disabled={restarting}
            onClick={() => router.push(`/learner/courses/discovery?path=${inProgress.path}`)}
            className="flex items-center gap-1.5 rounded-full bg-[#12939b] px-4 py-2 text-xs font-bold text-white hover:bg-[#0f7a81] disabled:opacity-60"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {!picking ? (
        <ul className="mt-6 grid gap-5 lg:grid-cols-3">
          {CHOICES.map((c) => (
            <li key={c.path}>
              <button
                type="button"
                onClick={() => (c.path === "KnowsTrack" ? setPicking(true) : router.push(`/learner/courses/discovery?path=${c.path}`))}
                className={`group flex h-full w-full flex-col rounded-[28px] border border-white bg-gradient-to-br p-7 text-left shadow-[0_10px_30px_rgba(20,54,90,0.08)] transition-shadow hover:shadow-[0_14px_36px_rgba(20,54,90,0.16)] ${c.bg}`}
              >
                <span className="text-5xl" aria-hidden>
                  {c.emoji}
                </span>
                <span className="mt-6 text-xl font-extrabold text-[#14365a]">{c.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-[#14365a]/75">{c.text}</span>
                <span className="mt-auto flex justify-end pt-6">
                  <span className="grid size-12 place-items-center rounded-full bg-[#14365a] text-white transition-transform group-hover:translate-x-1">
                    <ArrowRight className="size-5" />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setPicking(false)}
            className="mt-4 flex w-fit items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tracks.map((t) => (
              <li key={t.code}>
                <button
                  type="button"
                  disabled={saving !== null}
                  onClick={() => choose(t.code)}
                  className="flex h-full w-full flex-col rounded-2xl border border-[#e3ecea] bg-white p-5 text-left shadow-sm transition-colors hover:border-[#12939b] disabled:opacity-60"
                >
                  <span className="text-base font-bold text-[#14365a]">{t.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-[#14365a]/70">{t.shortDescription}</span>
                  <span className="mt-auto flex items-center justify-between pt-4 text-[11px] text-[#14365a]/60">
                    {t.videoCount} videos{t.hasLessons ? " · lessons" : ""}
                    {saving === t.code ? (
                      <LoaderCircle className="size-4 animate-spin text-[#12939b]" />
                    ) : (
                      <ArrowRight className="size-4 text-[#12939b]" />
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
