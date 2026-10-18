"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Code2 } from "lucide-react";
import type { Track } from "@/lib/data/courses";
import { getCompletedLessons, getServerCompletedLessons, setActiveTrack, subscribeProgress } from "@/lib/data/progress";
import { cn } from "@/lib/utils";
import { ChooseTrackDialog } from "./ChooseTrackDialog";

export function TrackOverview({ track }: { track: Track }) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const completed = useSyncExternalStore(
    subscribeProgress,
    () => getCompletedLessons(track.slug),
    getServerCompletedLessons
  );

  function confirmTrack() {
    setActiveTrack(track.slug);
    setDialogOpen(false);
    router.push(`/learner/courses/${track.slug}/lessons/${track.lessons[0].id}` as Route);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
      <Link href="/learner/courses" className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
        <ArrowLeft aria-hidden size={14} /> All Tracks
      </Link>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#F2FBF9] to-[#c9f0e9] p-7 sm:p-9">
        <div className="relative z-10 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">Learning track</p>
          <h1 className="mt-1 text-3xl font-bold text-[#1b2a5c]">{track.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1b2a5c]/70">{track.description}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
            {track.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#1b2a5c]/80">
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90"
            >
              Choose This Track
            </button>
            <Link
              href="#lessons"
              className="rounded-lg border border-[#12939b] bg-white px-5 py-2.5 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]"
            >
              Preview Content
            </Link>
          </div>
        </div>
        <span aria-hidden className="absolute right-8 top-1/2 hidden size-24 -translate-y-1/2 place-items-center rounded-3xl bg-white text-[#12939b] shadow-lg sm:grid">
          <Code2 size={40} strokeWidth={1.6} />
        </span>
      </section>

      {/* Objectives */}
      <section aria-labelledby="objectives-heading">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">What you&apos;ll learn</p>
        <h2 id="objectives-heading" className="mt-1 text-lg font-bold text-[#1b2a5c]">
          Learning objectives
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {track.objectives.map((objective) => (
            <li key={objective} className="flex items-center gap-2.5 rounded-xl border border-[#dfe7e5] bg-white px-4 py-3 text-xs font-semibold text-[#1b2a5c]">
              <CheckCircle2 aria-hidden size={16} className="shrink-0 text-[#12939b]" />
              {objective}
            </li>
          ))}
        </ul>
      </section>

      {/* Lessons */}
      <section id="lessons" aria-labelledby="lessons-heading" className="scroll-mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">Track content</p>
        <h2 id="lessons-heading" className="mt-1 text-lg font-bold text-[#1b2a5c]">
          Lessons in this track
        </h2>
        <ol className="mt-4 overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white">
          {track.lessons.map((lesson, i) => {
            const done = completed.includes(lesson.id);
            return (
              <li key={lesson.id} className={cn(i > 0 && "border-t border-[#e8eeed]")}>
                <Link
                  href={`/learner/courses/${track.slug}/lessons/${lesson.id}` as Route}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#F7FBFA]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#E9F7F4] text-xs font-semibold text-[#12939b]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#1b2a5c]">{lesson.title}</span>
                    <span className="block text-xs text-[#1b2a5c]/60">{lesson.summary}</span>
                  </span>
                  {done ? (
                    <CheckCircle2 aria-label="Completed" size={18} className="shrink-0 text-[#12939b]" />
                  ) : (
                    <ArrowRight aria-hidden size={16} className="shrink-0 text-[#1b2a5c]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <ChooseTrackDialog open={dialogOpen} trackTitle={track.title} onCancel={() => setDialogOpen(false)} onConfirm={confirmTrack} />
    </div>
  );
}
