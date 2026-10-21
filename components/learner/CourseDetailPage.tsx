"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, CircleDot, ClipboardCheck, LoaderCircle, Lock } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { coursePath, getTrackCourses, lessonPath, type Course, type TrackCourses } from "@/lib/learning-api";
import { LoadState, minutes } from "@/components/Courses/course-ui";
import { COURSE_STYLE, CourseIcon, LEVEL_STYLE, levelName, levelsDone } from "./course-levels";

const box = "rounded-[1em] border border-[#e3ebf3] bg-white";

/** One course of a track: its 3 levels, each with its lessons and the exam that opens the next level. */
export default function CourseDetailPage({ code, courseId }: { code: string; courseId: string }) {
  const [data, setData] = useState<{ track: TrackCourses; course: Course; next: Course | null } | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  const load = useCallback(
    () =>
      getTrackCourses(code).then((track) => {
        const index = track.courses.findIndex((c) => c.id === courseId);
        if (index < 0) throw new ApiError("We could not find this course in the track.", 404);
        return { track, course: track.courses[index], next: track.courses[index + 1] ?? null };
      }),
    [code, courseId],
  );

  useEffect(() => {
    let active = true;
    load().then(
      (d) => active && setData(d),
      (e) => active && setLoadError(e),
    );
    return () => {
      active = false;
    };
  }, [load]);

  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*1.6)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (!data) {
    return wrapper(
      loadError ? (
        <LoadState error={loadError} onRetry={() => load().then(setData, setLoadError)} />
      ) : (
        <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ),
    );
  }

  const { track, course, next } = data;
  const style = COURSE_STYLE[course.status];
  const done = levelsDone(course.levels);

  return wrapper(
    <>
      <Link href="/learner/courses" className="inline-flex w-fit items-center gap-[0.5em] text-[0.8em] font-semibold text-[#12606b] hover:underline">
        <ArrowLeft className="size-[1.1em]" /> My Courses
      </Link>

      {/* ---------- Header ---------- */}
      <section className="mt-[0.7em] flex flex-wrap items-center gap-[1.2em] rounded-[1.4em] bg-gradient-to-br from-[#f1fbf8] via-[#e4f7f2] to-[#d4f1ec] p-[1.6em]">
        <span className="grid size-[4.2em] shrink-0 place-items-center rounded-[1.2em] bg-white text-[#12939b] shadow-[0_10px_28px_rgba(18,147,155,0.15)]">
          <CourseIcon iconKey={course.iconKey} className="size-[2em]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">{track.trackName} course</p>
          <h1 className="text-[2.2em] font-extrabold leading-tight text-[#14365a]">{course.title}</h1>
          <p className="mt-[0.3em] max-w-[40em] text-[0.85em] text-[#14365a]/75">{course.summary}</p>
        </div>
        <div className="text-right">
          <span className="rounded-full px-[0.9em] py-[0.25em] text-[0.75em] font-semibold" style={{ backgroundColor: style.bg, color: style.text }}>
            {style.label}
          </span>
          <p className="mt-[0.5em] text-[0.8em] font-semibold text-[#14365a]">{done} of 3 levels</p>
        </div>
      </section>

      {/* ---------- Levels ---------- */}
      <ol className="mt-[1.2em] grid gap-[0.9em] lg:grid-cols-3">
        {course.levels.map((level) => {
          const ls = LEVEL_STYLE[level.status];
          const reachable = level.status !== "Locked";
          const lessonsDone = level.lessons.every((l) => l.status === "Done");
          const examHref = `${coursePath(track.trackCode, course.id)}/exam/${level.level}`;
          return (
            <li key={level.level} className={`${box} flex flex-col p-[1em] ${reachable ? "" : "opacity-70"}`}>
              <div className="flex items-center justify-between gap-[0.5em]">
                <h2 className="text-[1em] font-extrabold text-[#14365a]">{levelName(level)}</h2>
                <span
                  className="flex items-center gap-[0.3em] rounded-full px-[0.7em] py-[0.15em] text-[0.65em] font-semibold"
                  style={{ backgroundColor: ls.bg, color: ls.text }}
                >
                  <ls.icon className="size-[1.1em]" /> {ls.label}
                </span>
              </div>
              {level.status === "Skipped" && (
                <p className="mt-[0.3em] text-[0.68em] text-[#14365a]/60">Below your level, so you can skip it. It stays open to review.</p>
              )}

              <ul className="mt-[0.7em] space-y-[0.3em]">
                {level.lessons.map((l) => {
                  const row = (
                    <>
                      {l.status === "Done" ? (
                        <CheckCircle2 className="size-[1.2em] shrink-0 text-[#12939b]" aria-label="Completed" />
                      ) : l.status === "InProgress" ? (
                        <CircleDot className="size-[1.2em] shrink-0 text-[#12939b]" aria-label="In progress" />
                      ) : reachable ? (
                        <ArrowRight className="size-[1.1em] shrink-0 text-[#14365a]/60" aria-hidden />
                      ) : (
                        <Lock className="size-[1.1em] shrink-0 text-[#14365a]/40" aria-label="Locked" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                      <span className="text-[0.85em] text-[#14365a]/50">{minutes(l.durationSeconds)}</span>
                    </>
                  );
                  const rowClass = "flex items-center gap-[0.5em] rounded-[0.6em] px-[0.5em] py-[0.45em] text-[0.78em] font-semibold text-[#14365a]";
                  return (
                    <li key={l.id}>
                      {reachable ? (
                        <Link href={lessonPath(track.trackCode, l.id) as Route} className={`${rowClass} hover:bg-[#f3f8fb]`}>
                          {row}
                        </Link>
                      ) : (
                        <span className={rowClass}>{row}</span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* The level exam: after the lessons, opens the next level */}
              {level.examQuestions > 0 && (
                <div className="mt-auto pt-[0.9em]">
                  {level.examPassed ? (
                    <Link
                      href={examHref as Route}
                      className="flex items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#e6f5ec] py-[0.55em] text-[0.75em] font-semibold text-[#2a9a5f]"
                    >
                      <CheckCircle2 className="size-[1.2em]" /> Exam passed · take it again
                    </Link>
                  ) : reachable && lessonsDone ? (
                    <Link
                      href={examHref as Route}
                      className="flex items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#12606b] py-[0.55em] text-[0.75em] font-semibold text-white hover:bg-[#0f505a]"
                    >
                      <ClipboardCheck className="size-[1.2em]" /> Take the Level {level.level === "Beginner" ? 1 : level.level === "Intermediate" ? 2 : 3} exam
                    </Link>
                  ) : (
                    <p className="flex items-center justify-center gap-[0.4em] rounded-[0.6em] bg-[#f3f5f8] py-[0.55em] text-[0.72em] font-semibold text-[#14365a]/55">
                      <Lock className="size-[1.1em]" /> {reachable ? "Finish the lessons to take the exam" : "Locked"}
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {course.status === "Done" && next && (
        <Link
          href={coursePath(track.trackCode, next.id) as Route}
          className="mt-[1.2em] flex items-center justify-between rounded-[1em] bg-gradient-to-r from-[#14586a] to-[#1d8a8f] p-[1em] text-white"
        >
          <span>
            <span className="block text-[0.7em] uppercase tracking-wide text-white/70">Course completed</span>
            <span className="text-[1em] font-extrabold">Next course: {next.title}</span>
          </span>
          <ArrowRight className="size-[1.4em]" />
        </Link>
      )}
    </>,
  );
}
