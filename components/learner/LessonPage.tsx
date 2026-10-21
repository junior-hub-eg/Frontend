"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Award, CheckCircle2, CircleDot, Code2, LoaderCircle, School } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import {
  completeLessonStep,
  getLesson,
  getTrackLessons,
  lessonPath,
  trackPath,
  type Lesson,
  type LessonStep,
  type LessonSummary,
} from "@/lib/learning-api";
import { getMyMentor, type Mentor } from "@/lib/mentorship-api";
import { LinearGraph, LoadState, VideoPlayer, minutes } from "@/components/Courses/course-ui";

type Data = { lesson: Lesson; trackName: string; list: LessonSummary[]; mentor: Mentor | null };

/** The lesson, its track's lessons, and the student's mentor in this track. */
async function load(code: string, lessonId: string): Promise<Data> {
  const [lesson, track, mine] = await Promise.all([getLesson(lessonId), getTrackLessons(code).catch(() => null), getMyMentor().catch(() => null)]);
  const mentor =
    mine?.currents?.find((a) => a.mentor.trackCode === lesson.trackCode)?.mentor ??
    (mine?.current?.mentor.trackCode === lesson.trackCode ? mine.current.mentor : null);
  return { lesson, trackName: track?.trackName ?? lesson.trackCode, list: track?.modules.flatMap((m) => m.lessons) ?? [], mentor };
}

const TABS = ["Overview", "Steps"] as const;

const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const box = "rounded-[0.9em] border border-[#e3ebf3] bg-white";
const label = "text-[0.55em] font-bold uppercase tracking-wide text-[#12939b]";
const navBtn =
  "inline-flex items-center gap-[0.5em] rounded-full border px-[1.2em] py-[0.45em] text-[0.75em] font-semibold";

export default function LessonPage({ code, lessonId }: { code: string; lessonId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
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
      (e) => active && setLoadError(e),
    );
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

  if (!data) {
    return wrapper(
      loadError ? (
        <LoadState error={loadError} onRetry={reload} backHref={trackPath(code)} />
      ) : (
        <div className="grid min-h-[50vh] flex-1 place-items-center" role="status" aria-label="Loading">
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ),
    );
  }

  const { lesson, trackName, list, mentor } = data;
  const progress = lesson.progress;
  const idx = Math.max(0, list.findIndex((l) => l.id === lesson.id));
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const doneCount = list.filter((l) => (l.id === lesson.id ? progress.done : l.status === "Done")).length;
  const percent = list.length ? Math.round((doneCount / list.length) * 100) : progress.done ? 100 : 0;
  const base = lessonPath(lesson.trackCode, lesson.id);
  const link = lesson.schoolLink;

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

  const steps: { label: string; done: boolean; href?: string; action?: () => void }[] = [
    ...(link ? [{ label: "Read the school link", done: progress.schoolLinkDone, action: () => complete("SchoolLink") }] : []),
    { label: "Watch the lesson video", done: progress.videoDone },
    ...(lesson.tryIt ? [{ label: "Try it: run the code", done: progress.tryItDone, href: `${base}/challenge` }] : []),
    { label: "Pass the lesson quiz", done: progress.done, href: `${base}/quiz` },
  ];
  const nextStep = steps.find((st) => !st.done);

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
        <div className="flex min-h-0 min-w-0 flex-col lg:overflow-y-auto">
          {/* Video: counts as watched at 90% */}
          <div className="overflow-hidden rounded-[1em] bg-gradient-to-br from-[#14586a] via-[#1d7a85] to-[#0f4252] lg:shrink-0">
            <VideoPlayer
              key={lesson.id}
              src={lesson.videoUrl}
              title={lesson.title}
              watchedPercent={progress.videoDone ? 100 : 0}
              onProgress={(p) => (p >= 90 && !progress.videoDone ? complete("Video") : undefined)}
            />
          </div>

          {/* Title */}
          <div className="mt-[0.7em] lg:shrink-0">
            <p className={label}>Current lesson</p>
            <h1 className="mt-[0.15em] text-[1.7em] font-extrabold leading-tight text-[#14365a]">{lesson.title}</h1>
            <p className="mt-[0.2em] text-[0.75em] text-[#14365a]/70">
              {lesson.moduleTitle} · {lesson.level} · {minutes(lesson.durationSeconds)} · {lesson.xpReward} XP
            </p>
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

          {error && (
            <p role="alert" className="mt-[0.5em] rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.5em] text-[0.7em] font-semibold text-[#b83232]">
              {error}
            </p>
          )}

          {/* Tab content */}
          {tab === "Overview" ? (
            <div className="mt-[0.6em] grid gap-[0.6em] md:grid-cols-2 lg:shrink-0">
              <section className={`${box} p-[0.9em]`}>
                {link ? (
                  <>
                    <h2 className="flex items-center gap-[0.4em] text-[0.8em] font-extrabold text-[#14365a]">
                      <School className="size-[1.2em] text-[#12939b]" /> {link.cardHeadline}
                    </h2>
                    <p className="mt-[0.2em] text-[0.62em] font-semibold uppercase tracking-wide text-[#12939b]">
                      {link.subject} · Grade {link.grade} · {link.unit} · {link.schoolLessonTitle}
                    </p>
                    <p className="mt-[0.5em] rounded-[0.5em] bg-[#f3f8fb] px-[0.7em] py-[0.5em] font-mono text-[0.7em] text-[#14365a]">{link.schoolExample}</p>
                    <p className="mt-[0.5em] text-[0.68em] leading-relaxed text-[#14365a]/85">{link.bridgeText}</p>
                    {link.graphSpec && (
                      <div className="mt-[0.5em]">
                        <LinearGraph spec={link.graphSpec} />
                      </div>
                    )}
                    <div className="mt-[0.6em] flex flex-wrap items-center gap-[0.6em]">
                      <span className="flex items-center gap-[0.3em] text-[0.6em] text-[#14365a]/70">
                        <Award className="size-[1.2em] text-[#d4a017]" /> Pass the quiz to earn “{link.badge.name}”
                      </span>
                      <button
                        type="button"
                        disabled={progress.schoolLinkDone || saving !== null}
                        onClick={() => complete("SchoolLink")}
                        className="ml-auto rounded-[0.5em] border border-[#12939b]/60 bg-white px-[1em] py-[0.3em] text-[0.65em] font-semibold text-[#12606b] hover:bg-[#eef8f7] disabled:opacity-60"
                      >
                        {progress.schoolLinkDone ? "Got it ✓" : saving === "SchoolLink" ? "Saving..." : "Got it"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-[0.8em] font-extrabold text-[#14365a]">What you will learn</h2>
                    <p className="mt-[0.5em] flex items-center gap-[0.5em] text-[0.68em] text-[#14365a]/85">
                      <CheckCircle2 className="size-[1.3em] shrink-0 text-[#12939b]" />
                      {lesson.title}: {lesson.concept}
                    </p>
                  </>
                )}
              </section>

              <section className={`${box} p-[0.9em]`}>
                <h2 className="text-[0.8em] font-extrabold text-[#14365a]">Lesson summary</h2>
                <dl className="mt-[0.4em] divide-y divide-[#eef2f6] text-[0.68em]">
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Estimated time</dt>
                    <dd className="font-semibold text-[#14365a]">{minutes(lesson.durationSeconds)}</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Level</dt>
                    <dd className="rounded-full bg-[#dff5e8] px-[0.8em] py-[0.05em] text-[0.9em] font-semibold text-[#2a9a5f]">{lesson.level}</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Format</dt>
                    <dd className="font-semibold text-[#14365a]">{lesson.tryIt ? "Video · Try it · Quiz" : "Video · Quiz"}</dd>
                  </div>
                  <div className="flex items-center justify-between py-[0.35em]">
                    <dt className="text-[#14365a]/65">Lesson</dt>
                    <dd className="font-semibold text-[#14365a]">{list.length ? `${idx + 1} of ${list.length}` : lesson.moduleTitle}</dd>
                  </div>
                </dl>
              </section>
            </div>
          ) : (
            <section className={`${box} mt-[0.6em] p-[0.9em] lg:shrink-0`}>
              <ol className="space-y-[0.5em]">
                {steps.map((st, i) => (
                  <li key={st.label} className="flex items-center gap-[0.6em] text-[0.72em] text-[#14365a]">
                    {st.done ? (
                      <CheckCircle2 aria-label="Done" className="size-[1.5em] shrink-0 text-[#12939b]" />
                    ) : (
                      <span className="grid size-[1.5em] shrink-0 place-items-center rounded-full bg-[#e7f6f3] text-[0.85em] font-bold text-[#12939b]">{i + 1}</span>
                    )}
                    <span className={`flex-1 ${st.done ? "text-[#14365a]/55" : ""}`}>{st.label}</span>
                    {st.href && (
                      <Link href={st.href as Route} className="font-semibold text-[#12606b] hover:underline">
                        {st.done ? "Open again" : "Open"}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Previous / Try it / Next */}
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
              href={`${base}/${lesson.tryIt ? "challenge" : "quiz"}` as Route}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.5em] text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
            >
              <Code2 className="size-[1.1em]" /> {lesson.tryIt ? (progress.tryItDone ? "Open Try it again" : "Open Try it") : "Take the quiz"}
            </Link>

            {next ? (
              <Link href={lessonPath(code, next.id) as Route} className={`${navBtn} border-[#14365a]/40 bg-white text-[#14365a] hover:bg-[#eef4fa]`}>
                Next <ArrowRight className="size-[1.1em]" />
              </Link>
            ) : (
              <Link href={trackPath(code) as Route} className={`${navBtn} border-[#14365a]/40 bg-white text-[#14365a] hover:bg-[#eef4fa]`}>
                Back to Track <ArrowRight className="size-[1.1em]" />
              </Link>
            )}
          </div>
        </div>

        {/* ================= Right column ================= */}
        <aside className="flex min-h-0 min-w-0 flex-col gap-[0.6em] lg:overflow-y-auto">
          {/* Progress */}
          <section className={`${box} p-[0.8em]`}>
            <div className="flex items-center gap-[0.8em]">
              <span
                className="grid size-[3.6em] shrink-0 place-items-center rounded-full text-[0.75em] font-extrabold text-[#14365a]"
                style={{ background: `conic-gradient(#12939b ${percent * 3.6}deg, #e3ebf3 0)` }}
                role="img"
                aria-label={`${percent}% of the track complete`}
              >
                <span className="grid size-[78%] place-items-center rounded-full bg-white">{percent}%</span>
              </span>
              <span className="leading-tight">
                <span className={`${label} block`}>Your progress</span>
                <span className="mt-[0.2em] block text-[0.85em] font-extrabold text-[#14365a]">
                  {list.length ? `Lesson ${idx + 1} of ${list.length}` : lesson.moduleTitle}
                </span>
                <span className="mt-[0.25em] inline-block rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.05em] text-[0.55em] font-semibold text-[#12939b]">
                  {progress.done ? "Completed" : "In progress"}
                </span>
              </span>
            </div>
            {nextStep ? (
              nextStep.href ? (
                <Link
                  href={nextStep.href as Route}
                  className="mt-[0.6em] block w-full rounded-[0.5em] border border-[#12939b]/60 bg-white py-[0.45em] text-center text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
                >
                  Next step: {nextStep.label}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={!nextStep.action || saving !== null}
                  onClick={nextStep.action}
                  className="mt-[0.6em] w-full rounded-[0.5em] border border-[#12939b]/60 bg-white py-[0.45em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7] disabled:cursor-default disabled:opacity-70"
                >
                  Next step: {nextStep.label}
                </button>
              )
            ) : (
              <p className="mt-[0.6em] rounded-[0.5em] bg-[#e7f6f3] py-[0.45em] text-center text-[0.7em] font-semibold text-[#12606b]">Lesson completed ✓</p>
            )}
          </section>

          {/* Track content */}
          {list.length > 0 && (
            <section className={`${box} p-[0.8em]`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={label}>Track content</p>
                  <h2 className="text-[0.9em] font-extrabold text-[#14365a]">{trackName} lessons</h2>
                </div>
                <span className="rounded-full bg-[#e7f6f3] px-[0.7em] py-[0.1em] text-[0.55em] font-semibold text-[#12939b]">{list.length} lessons</span>
              </div>
              <ol className="mt-[0.4em] space-y-[0.2em]">
                {list.map((l, i) => {
                  const active = l.id === lesson.id;
                  const status = active && progress.done ? "Done" : l.status;
                  return (
                    <li key={l.id}>
                      <Link
                        href={lessonPath(code, l.id) as Route}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-[0.6em] rounded-[0.6em] px-[0.5em] py-[0.4em] ${active ? "bg-[#e7f6f3]" : "hover:bg-[#f3f8fb]"}`}
                      >
                        <span
                          className={`grid size-[1.9em] shrink-0 place-items-center rounded-full text-[0.65em] font-bold ${
                            active ? "bg-[#12606b] text-white" : "border border-[#cfdbe6] text-[#14365a]/70"
                          }`}
                        >
                          {status === "Done" && !active ? (
                            <CheckCircle2 className="size-[1.3em] text-[#12939b]" />
                          ) : status === "InProgress" && !active ? (
                            <CircleDot className="size-[1.3em] text-[#12939b]" />
                          ) : (
                            i + 1
                          )}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[0.72em] font-semibold text-[#14365a]">{l.title}</span>
                          <span className="block text-[0.58em] text-[#14365a]/60">
                            {minutes(l.durationSeconds)} · {l.level}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}

          {/* Quiz */}
          <section className="rounded-[0.9em] bg-gradient-to-br from-[#14586a] to-[#1d8a8f] p-[0.9em] text-white">
            <p className="text-[0.5em] font-bold uppercase tracking-wide text-white/70">Lesson quiz</p>
            <h2 className="mt-[0.2em] text-[1em] font-extrabold">{progress.done ? "You passed this lesson" : "Check your understanding"}</h2>
            <p className="mt-[0.15em] text-[0.6em] text-white/80">
              {lesson.questions.length} questions · all correct finishes the lesson (+{lesson.xpReward} XP)
            </p>
            <Link
              href={`${base}/quiz` as Route}
              className="mt-[0.6em] inline-flex items-center rounded-[0.5em] bg-white px-[1.1em] py-[0.4em] text-[0.7em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
            >
              {progress.done ? "Take it again" : "Start quiz"}
            </Link>
          </section>

          {/* Mentor of this track */}
          <section className={`${box} p-[0.8em]`}>
            <p className={label}>Your mentor</p>
            {mentor ? (
              <div className="mt-[0.4em] flex items-center gap-[0.6em]">
                <span className="relative size-[2.4em] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: mentorAvatar(mentor.id).bg }}>
                  <Image src={mentorAvatar(mentor.id).src} alt="" fill sizes="40px" className="object-cover" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[0.8em] font-extrabold text-[#14365a]">{mentor.fullName}</span>
                  <span className="block text-[0.58em] text-[#14365a]/60">
                    {mentor.title} · {mentor.yearsOfExperience}+ years
                  </span>
                </span>
              </div>
            ) : (
              <p className="mt-[0.4em] text-[0.68em] text-[#14365a]/65">You don&apos;t have a mentor in {trackName} yet.</p>
            )}
            <Link
              href="/learner/mentorship"
              className="mt-[0.5em] block w-full rounded-[0.5em] bg-[#12606b] py-[0.45em] text-center text-[0.7em] font-semibold text-white hover:bg-[#0f505a]"
            >
              {mentor ? "Book a session" : "Choose a mentor"}
            </Link>
          </section>
        </aside>
      </div>
    </>,
  );
}
