"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, HelpCircle, Lock, School } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  getTrack,
  getTrackLessons,
  lessonPath,
  recordVideoProgress,
  selectTrack,
  trackPath,
  type TrackDetail,
  type TrackLessons,
} from "@/lib/learning-api";
import { cn } from "@/lib/utils";
import { ChooseTrackDialog } from "./ChooseTrackDialog";
import { LoadState, TrackIcon, VideoPlayer, minutes } from "./course-ui";

type Data = { track: TrackDetail; lessons: TrackLessons | null };

async function load(code: string): Promise<Data> {
  const [track, lessons] = await Promise.all([getTrack(code), getTrackLessons(code).catch(() => null)]);
  return { track, lessons: track.hasLessons ? lessons : null };
}

/** A track: intro videos, the track quiz and its lessons (TracksController). */
export function TrackOverview({ code }: { code: string }) {
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoadError(null);
    load(code).then(setData, setLoadError);
  }, [code]);

  useEffect(() => {
    let active = true;
    load(code).then(
      (d) => active && setData(d),
      (e) => active && setLoadError(e)
    );
    return () => {
      active = false;
    };
  }, [code]);

  if (!data) return <LoadState error={loadError} onRetry={reload} />;
  const { track, lessons } = data;
  const allLessons = lessons?.modules.flatMap((m) => m.lessons) ?? [];
  const nextLessonId = lessons?.nextLessonId ?? allLessons[0]?.id;

  async function confirmTrack() {
    setChoosing(true);
    setError(null);
    try {
      await selectTrack(track.code);
      setDialogOpen(false);
      if (nextLessonId) router.push(lessonPath(track.code, nextLessonId) as Route);
      else reload();
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your track. Please try again."));
      setDialogOpen(false);
    } finally {
      setChoosing(false);
    }
  }

  async function videoProgress(videoId: string, percent: number) {
    const p = await recordVideoProgress(track.code, videoId, percent);
    if (p.completed) reload();
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
          <h1 className="mt-1 text-3xl font-bold text-[#1b2a5c]">{track.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#1b2a5c]/70">{track.shortDescription}</p>
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="About this track">
            {[
              `${track.videos.length} intro ${track.videos.length === 1 ? "video" : "videos"}`,
              lessons ? `${allLessons.length} lessons` : "Lessons coming soon",
              ...(track.isLearning && lessons ? [`Your level: ${lessons.level}`] : []),
            ].map((tag) => (
              <li key={tag} className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#1b2a5c]/80">
                {tag}
              </li>
            ))}
          </ul>
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-[#fdecec] px-3 py-2 text-xs font-semibold text-[#b83232]">
              {error}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {track.isLearning ? (
              nextLessonId ? (
                <Link
                  href={lessonPath(track.code, nextLessonId) as Route}
                  className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  Continue Learning
                </Link>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-xs font-semibold text-[#12939b]">
                  <CheckCircle2 aria-hidden size={14} /> You&apos;re learning this track
                </span>
              )
            ) : (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90"
              >
                Choose This Track
              </button>
            )}
            <Link
              href="#content"
              className="rounded-lg border border-[#12939b] bg-white px-5 py-2.5 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]"
            >
              Preview Content
            </Link>
          </div>
        </div>
        <span aria-hidden className="absolute right-8 top-1/2 hidden size-24 -translate-y-1/2 place-items-center rounded-3xl bg-white text-[#12939b] shadow-lg sm:grid">
          <TrackIcon iconKey={track.iconKey} />
        </span>
      </section>

      {/* Intro videos + track quiz */}
      <section id="content" aria-labelledby="videos-heading" className="scroll-mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">Meet the track</p>
        <h2 id="videos-heading" className="mt-1 text-lg font-bold text-[#1b2a5c]">
          Intro videos
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {track.videos.map((v) => (
            <article key={v.id} className="rounded-2xl border border-[#dfe7e5] bg-white p-3">
              <VideoPlayer
                src={v.fileUrl}
                poster={v.posterUrl}
                title={v.title}
                watchedPercent={v.watchedPercent}
                onProgress={(p) => videoProgress(v.id, p)}
              />
              <div className="mt-3 flex items-center gap-2 px-1">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#1b2a5c]">{v.title}</p>
                <span className="text-[11px] text-[#1b2a5c]/55">{minutes(v.durationSeconds)}</span>
                {v.completed ? (
                  <CheckCircle2 aria-label="Watched" size={16} className="text-[#12939b]" />
                ) : (
                  v.watchedPercent > 0 && <span className="text-[11px] font-semibold text-[#12939b]">{v.watchedPercent}%</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-linear-to-br from-[#14757d] to-[#1b2a5c] p-5 text-white">
          <span className="grid size-10 place-items-center rounded-xl bg-white/15">
            {track.quiz.unlocked ? <HelpCircle aria-hidden size={18} /> : <Lock aria-hidden size={18} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Track quiz</p>
            <h3 className="text-sm font-bold">
              {track.quiz.passed ? "You passed the track quiz" : `${track.quiz.questions.length} quick questions about ${track.name}`}
            </h3>
            <p className="text-[11px] text-white/75">
              {track.quiz.unlocked ? "Answer 2 of 3 correctly to pass." : "Watch one of the videos to unlock the quiz."}
            </p>
          </div>
          {track.quiz.unlocked && (
            <Link
              href={`${trackPath(track.code)}/quiz` as Route}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#1b2a5c] hover:bg-white/90"
            >
              {track.quiz.passed ? "Take it again" : "Start quiz"} <ArrowRight aria-hidden size={13} />
            </Link>
          )}
        </div>
      </section>

      {/* Lessons */}
      <section aria-labelledby="lessons-heading">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">Track content</p>
        <h2 id="lessons-heading" className="mt-1 text-lg font-bold text-[#1b2a5c]">
          Lessons in this track
        </h2>
        {!lessons ? (
          <p className="mt-4 rounded-2xl border border-dashed border-[#cfdcda] bg-white px-5 py-6 text-center text-sm text-[#1b2a5c]/60">
            Lessons for {track.name} are coming soon. Watch the intro videos and take the quiz meanwhile.
          </p>
        ) : (
          lessons.modules.map((m) => (
            <div key={m.id} className="mt-4">
              <h3 className="mb-2 text-xs font-semibold text-[#1b2a5c]/70">{m.title}</h3>
              <ol className="overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white">
                {m.lessons.map((lesson, i) => {
                  const number = allLessons.indexOf(lesson) + 1;
                  return (
                    <li key={lesson.id} className={cn(i > 0 && "border-t border-[#e8eeed]")}>
                      <Link
                        href={lessonPath(track.code, lesson.id) as Route}
                        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-[#F7FBFA]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#E9F7F4] text-xs font-semibold text-[#12939b]">
                          {String(number).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1b2a5c]">
                            {lesson.title}
                            {lesson.id === lessons.nextLessonId && (
                              <span className="rounded-full bg-[#12939b] px-2 py-0.5 text-[10px] font-semibold text-white">Up next</span>
                            )}
                          </span>
                          <span className="flex flex-wrap items-center gap-x-3 text-xs text-[#1b2a5c]/60">
                            {lesson.level} · {minutes(lesson.durationSeconds)}
                            {lesson.hasSchoolLink && (
                              <span className="inline-flex items-center gap-1 text-[#12939b]">
                                <School aria-hidden size={12} /> Linked to school
                              </span>
                            )}
                          </span>
                        </span>
                        {lesson.status === "Done" ? (
                          <CheckCircle2 aria-label="Completed" size={18} className="shrink-0 text-[#12939b]" />
                        ) : lesson.status === "InProgress" ? (
                          <CircleDot aria-label="In progress" size={18} className="shrink-0 text-[#12939b]" />
                        ) : (
                          <ArrowRight aria-hidden size={16} className="shrink-0 text-[#1b2a5c]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))
        )}
      </section>

      <ChooseTrackDialog
        open={dialogOpen}
        trackTitle={track.name}
        busy={choosing}
        onCancel={() => setDialogOpen(false)}
        onConfirm={confirmTrack}
        onPlacement={() => router.push(`/learner/placement/${track.code.toLowerCase()}` as Route)}
      />
    </div>
  );
}
