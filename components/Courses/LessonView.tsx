"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Circle, CircleDot, Code2, HelpCircle, School } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-context";
import {
  completeLessonStep,
  getLesson,
  getTrackLessons,
  lessonPath,
  trackPath,
  type Lesson,
  type LessonStep,
  type TrackLessons,
} from "@/lib/learning-api";
import { getMyMentor, type MyMentor } from "@/lib/mentorship-api";
import { cn } from "@/lib/utils";
import { LinearGraph, LoadState, VideoPlayer, minutes } from "./course-ui";

type Data = { lesson: Lesson; track: TrackLessons | null; mentor: MyMentor | null };

async function load(code: string, lessonId: string): Promise<Data> {
  const [lesson, track, mentor] = await Promise.all([
    getLesson(lessonId),
    getTrackLessons(code).catch(() => null),
    getMyMentor().catch(() => null),
  ]);
  return { lesson, track, mentor };
}

/** A lesson with Try on Subject (LessonsController): school link, video, Try it, then the quiz. */
export function LessonView({ code, lessonId }: { code: string; lessonId: string }) {
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [saving, setSaving] = useState<LessonStep | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoadError(null);
    load(code, lessonId).then(setData, setLoadError);
  }, [code, lessonId]);

  useEffect(() => {
    let active = true;
    load(code, lessonId).then(
      (d) => active && setData(d),
      (e) => active && setLoadError(e)
    );
    return () => {
      active = false;
    };
  }, [code, lessonId]);

  if (!data) return <LoadState error={loadError} onRetry={reload} backHref={trackPath(code)} />;
  const { lesson, track, mentor } = data;
  const progress = lesson.progress;
  const base = trackPath(lesson.trackCode);
  const lessons = track?.modules.flatMap((m) => m.lessons) ?? [];
  const index = lessons.findIndex((l) => l.id === lesson.id);
  const prev = index > 0 ? lessons[index - 1] : undefined;
  const next = index >= 0 ? lessons[index + 1] : undefined;
  const doneCount = lessons.filter((l) => (l.id === lesson.id ? progress.done : l.status === "Done")).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : progress.done ? 100 : 0;
  const position = index >= 0 ? `Lesson ${index + 1} of ${lessons.length}` : lesson.moduleTitle;

  async function complete(step: LessonStep) {
    setSaving(step);
    setError(null);
    try {
      const p = await completeLessonStep(lesson.id, step);
      setData((d) => (d ? { ...d, lesson: { ...d.lesson, progress: p } } : d));
    } catch (e) {
      setError(errorMessage(e, "We couldn't save your progress. Please try again."));
    } finally {
      setSaving(null);
    }
  }

  const steps = [
    ...(lesson.schoolLink ? [{ label: "Read the school link", done: progress.schoolLinkDone }] : []),
    { label: "Watch the lesson video", done: progress.videoDone },
    { label: "Try it: run the code", done: progress.tryItDone, href: `${base}/lessons/${lesson.id}/challenge` },
    { label: "Pass the lesson quiz", done: progress.done, href: `${base}/lessons/${lesson.id}/quiz` },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      {/* Greeting banner */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#E9F7F4] to-[#bfece5] px-6 py-5">
        <h1 className="text-lg font-bold text-[#1b2a5c]">
          {progress.done ? "Well done" : index <= 0 ? "Great start" : "Keep it up"}, {user?.firstName ?? "there"}!
        </h1>
        <p className="mt-0.5 text-xs text-[#1b2a5c]/70">
          {position} · {track?.trackName ?? lesson.trackCode} track
        </p>
        <span aria-hidden className="absolute -right-4 -top-6 size-24 rounded-full bg-white/40" />
      </section>

      <Link href={base as Route} className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
        <ArrowLeft aria-hidden size={14} /> Track Details
      </Link>

      {error && (
        <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-xs font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">{lesson.moduleTitle}</p>
            <h2 className="mt-1 text-2xl font-bold text-[#1b2a5c]">{lesson.title}</h2>
            <p className="mt-1 text-sm text-[#1b2a5c]/65">
              {lesson.level} · {minutes(lesson.durationSeconds)} · {lesson.xpReward} XP
            </p>
          </div>

          {lesson.schoolLink && (
            <section aria-labelledby="school-link-heading" className="rounded-2xl border border-[#cdebe5] bg-[#F2FBF9] p-5">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">
                <School aria-hidden size={14} /> {lesson.schoolLink.subject} · Grade {lesson.schoolLink.grade} · {lesson.schoolLink.unit}
              </p>
              <h3 id="school-link-heading" className="mt-1 text-base font-bold text-[#1b2a5c]">
                {lesson.schoolLink.cardHeadline}: {lesson.schoolLink.schoolLessonTitle}
              </h3>
              <div className="mt-3 grid items-center gap-4 md:grid-cols-[1fr_auto]">
                <div className="flex flex-col gap-3">
                  <p className="rounded-xl bg-white px-4 py-3 font-mono text-sm text-[#1b2a5c]">{lesson.schoolLink.schoolExample}</p>
                  <p className="text-sm leading-relaxed text-[#1b2a5c]/80">{lesson.schoolLink.bridgeText}</p>
                </div>
                {lesson.schoolLink.graphSpec && <LinearGraph spec={lesson.schoolLink.graphSpec} />}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#1b2a5c]/70">
                  <Award aria-hidden size={14} className="text-[#12939b]" /> Pass the quiz to earn “{lesson.schoolLink.badge.name}”
                </span>
                <button
                  type="button"
                  disabled={progress.schoolLinkDone || saving !== null}
                  onClick={() => complete("SchoolLink")}
                  className="ml-auto rounded-lg border border-[#12939b] bg-white px-4 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4] disabled:cursor-default disabled:bg-[#E9F7F4]"
                >
                  {progress.schoolLinkDone ? "Got it ✓" : saving === "SchoolLink" ? "Saving…" : "Got it"}
                </button>
              </div>
            </section>
          )}

          <VideoPlayer
            src={lesson.videoUrl}
            title={lesson.title}
            watchedPercent={progress.videoDone ? 100 : 0}
            onProgress={(p) => (p >= 90 && !progress.videoDone ? complete("Video") : undefined)}
          />

          {/* Steps */}
          <section aria-labelledby="steps-heading" className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <h3 id="steps-heading" className="text-sm font-bold text-[#1b2a5c]">
              Lesson steps
            </h3>
            <ol className="mt-3 flex flex-col gap-3">
              {steps.map((step, i) => (
                <li key={step.label} className="flex items-center gap-3 text-xs text-[#1b2a5c]">
                  {step.done ? (
                    <CheckCircle2 aria-label="Done" size={22} className="shrink-0 text-[#12939b]" />
                  ) : (
                    <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-[#E9F7F4] text-[10px] font-semibold text-[#12939b]">{i + 1}</span>
                  )}
                  <span className={cn("flex-1", step.done && "text-[#1b2a5c]/60")}>{step.label}</span>
                  {step.href && (
                    <Link href={step.href as Route} className="font-semibold text-[#12939b] hover:underline">
                      {step.done ? "Open again" : "Open"}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>

          {/* Prev / next */}
          <div className="flex items-center justify-between border-t border-[#dfe7e5] pt-4 text-xs font-semibold text-[#12939b]">
            {prev ? (
              <Link href={lessonPath(lesson.trackCode, prev.id) as Route} className="inline-flex items-center gap-1.5 hover:underline">
                <ArrowLeft aria-hidden size={14} /> Previous Lesson
              </Link>
            ) : (
              <span />
            )}
            <Link href={(next ? lessonPath(lesson.trackCode, next.id) : base) as Route} className="inline-flex items-center gap-1.5 hover:underline">
              {next ? "Next Lesson" : "Back to Track"} <ArrowRight aria-hidden size={14} />
            </Link>
          </div>
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Your progress</p>
            <div className="mt-2 flex items-center gap-3">
              <span
                role="img"
                aria-label={`${percent}% of the track complete`}
                className="grid size-14 place-items-center rounded-full text-xs font-bold text-[#1b2a5c]"
                style={{ background: `conic-gradient(#12939b ${percent * 3.6}deg, #E9F7F4 0deg)` }}
              >
                <span className="grid size-10 place-items-center rounded-full bg-white">{percent}%</span>
              </span>
              <p className="text-xs text-[#1b2a5c]/70">
                {position}
                <span className="block font-semibold text-[#12939b]">{progress.done ? "Completed" : "In progress"}</span>
              </p>
            </div>
          </div>

          {lessons.length > 0 && (
            <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Track content</p>
              <h3 className="text-sm font-bold text-[#1b2a5c]">Lessons</h3>
              <ol className="mt-3 flex flex-col gap-1">
                {lessons.map((l) => {
                  const status = l.id === lesson.id && progress.done ? "Done" : l.status;
                  return (
                    <li key={l.id}>
                      <Link
                        href={lessonPath(lesson.trackCode, l.id) as Route}
                        aria-current={l.id === lesson.id ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-medium text-[#1b2a5c] hover:bg-[#F7FBFA]",
                          l.id === lesson.id && "bg-[#E9F7F4]"
                        )}
                      >
                        {status === "Done" ? (
                          <CheckCircle2 aria-label="Completed" size={15} className="shrink-0 text-[#12939b]" />
                        ) : status === "InProgress" ? (
                          <CircleDot aria-label="In progress" size={15} className="shrink-0 text-[#12939b]" />
                        ) : (
                          <Circle aria-hidden size={15} className="shrink-0 text-[#1b2a5c]/30" />
                        )}
                        <span className="min-w-0 flex-1 truncate">{l.title}</span>
                        <span className="text-[10px] text-[#1b2a5c]/45">{l.level}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Try it</p>
            <h3 className="mt-1 text-sm font-bold text-[#1b2a5c]">Run the lesson code</h3>
            <p className="mt-1 text-[11px] text-[#1b2a5c]/65">Change the code and run it in your browser until it prints the right answer.</p>
            <Link
              href={`${base}/lessons/${lesson.id}/challenge` as Route}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#12939b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f7a81]"
            >
              <Code2 aria-hidden size={13} /> {progress.tryItDone ? "Open again" : "Open Try it"}
            </Link>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-[#14757d] to-[#1b2a5c] p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Lesson quiz</p>
            <h3 className="mt-1 text-sm font-bold">{progress.done ? "You passed this lesson" : "Check your understanding"}</h3>
            <p className="mt-1 text-[11px] text-white/75">
              {lesson.questions.length} questions. Answer them all correctly to finish the lesson and earn {lesson.xpReward} XP.
            </p>
            <Link
              href={`${base}/lessons/${lesson.id}/quiz` as Route}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#1b2a5c] hover:bg-white/90"
            >
              <HelpCircle aria-hidden size={13} /> {progress.done ? "Take it again" : "Start quiz"}
            </Link>
          </div>

          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Your mentor</p>
            {mentor?.current ? (
              <p className="mt-2 text-xs font-semibold text-[#1b2a5c]">
                {mentor.current.mentor.fullName}
                <span className="block font-normal text-[#1b2a5c]/60">{mentor.current.mentor.title}</span>
              </p>
            ) : (
              <p className="mt-2 text-xs text-[#1b2a5c]/65">You haven&apos;t chosen a mentor yet.</p>
            )}
            <Link
              href="/learner/mentorship"
              className="mt-3 block w-full rounded-lg bg-[#12939b] px-3 py-2 text-center text-xs font-semibold text-white hover:bg-[#0f7a81]"
            >
              {mentor?.current ? "Ask a question" : "Choose a mentor"}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
