"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowRight, CheckCircle2, HelpCircle, LoaderCircle, Lock, PenTool, Plus, School, Sparkles } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  coursePath,
  getTrack,
  getTrackCourses,
  getTrackLessons,
  lessonPath,
  recordVideoProgress,
  selectTrack,
  trackPath,
  type Course,
  type LessonSummary,
  type TrackDetail,
  type TrackLevel,
} from "@/lib/learning-api";
import { LoadState, VideoPlayer, minutes } from "@/components/Courses/course-ui";
import { CourseIcon, LevelChips } from "./course-levels";
import { useT } from "@/lib/i18n/client";

type Data = {
  track: TrackDetail;
  lessons: LessonSummary[];
  modules: string[];
  nextId: string | null;
  level: TrackLevel | null;
  courses: Course[];
};

async function load(code: string): Promise<Data> {
  const [track, lessons, courses] = await Promise.all([
    getTrack(code),
    getTrackLessons(code).catch(() => null),
    getTrackCourses(code).catch(() => null),
  ]);
  return {
    track,
    lessons: track.hasLessons ? (lessons?.modules.flatMap((m) => m.lessons) ?? []) : [],
    modules: lessons?.modules.map((m) => m.title) ?? [],
    nextId: lessons?.nextLessonId ?? null,
    level: track.isLearning ? (lessons?.level ?? null) : null,
    courses: courses?.courses ?? [],
  };
}

const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const box = "rounded-[1em] border border-[#e3ebf3] bg-white";

export default function TrackDetailPage({ slug }: { slug: string }) {
  const t = useT();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLoadError(null);
    load(slug).then(setData, setLoadError);
  }, [slug]);

  useEffect(() => {
    let active = true;
    load(slug).then(
      (d) => active && setData(d),
      (e) => active && setLoadError(e),
    );
    return () => {
      active = false;
    };
  }, [slug]);

  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className={`relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*1.6)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)] ${noScrollbar}`}
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (!data) {
    return wrapper(
      loadError ? (
        <LoadState error={loadError} onRetry={reload} />
      ) : (
        <div className="grid min-h-[50vh] place-items-center" role="status" aria-label={t("Loading")}>
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      ),
    );
  }

  const { track, lessons: list, modules, nextId, level, courses } = data;
  const previewId = nextId ?? list[0]?.id ?? null;
  // Real facts about the track instead of made-up topics.
  const chips = [
    track.videos.length === 1 ? t("1 intro video") : t("{n} intro videos", { n: track.videos.length }),
    courses.length ? t("{n} courses · 3 levels each", { n: courses.length }) : list.length ? t("{n} lessons", { n: list.length }) : t("Lessons coming soon"),
    ...(level ? [t("Your level: {level}", { level: t(level) })] : []),
  ];
  // What you'll learn: the lessons themselves (the API has no separate objectives).
  const objectives = list.slice(0, 6);

  async function choose() {
    setBusy(true);
    setActionError(null);
    try {
      await selectTrack(track.code);
      if (nextId) router.push(lessonPath(track.code, nextId) as Route);
      else reload();
    } catch (e) {
      setActionError(errorMessage(e, "We couldn't choose this track. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  async function videoProgress(videoId: string, percent: number) {
    const p = await recordVideoProgress(track.code, videoId, percent);
    if (p.completed) reload();
  }

  return wrapper(
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden rounded-[1.4em] bg-gradient-to-br from-[#f1fbf8] via-[#e4f7f2] to-[#d4f1ec]">
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
          <span className="absolute -top-[4em] end-[24%] size-[12em] rounded-full border-[0.2em] border-[#bfe8df]/70" />
          <span className="absolute -bottom-[5em] end-[2%] size-[14em] rounded-full bg-[#c9efe7]/70" />
          <span className="absolute end-[10%] top-[35%] size-[9em] rounded-full bg-[#bdeae0]/60" />
          <span className="absolute bottom-[18%] end-[30%] size-[1em] rounded-full bg-[#5fd6c4]/70" />
          <span className="absolute bottom-[16%] end-[7%] size-[0.9em] rounded-full bg-[#5fd6c4]/70" />
          <Plus className="absolute bottom-[10%] end-[14%] size-[3em] text-[#2cc5b2]" strokeWidth={3.2} />
          <Plus className="absolute start-[52%] top-[30%] size-[2em] text-[#b6e6dd]" strokeWidth={3} />
          <Sparkles className="absolute end-[4%] top-[8%] size-[2.2em] text-[#2cc5b2]" />
          <span className="absolute end-[16%] top-1/2 grid size-[6.5em] -translate-y-1/2 place-items-center rounded-[1.5em] bg-white shadow-[0_10px_28px_rgba(18,147,155,0.15)]">
            <PenTool className="size-[2.6em] text-[#1d7f5f]" />
          </span>
        </div>

        <div className="relative z-10 max-w-[38em] px-[2em] py-[2.2em]">
          <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">{t("Learning track")}</p>
          <h1 className="mt-[0.4em] text-[2.4em] font-extrabold leading-tight text-[#14365a]">{t(track.name)}</h1>
          <p className="mt-[0.7em] max-w-[30em] text-[0.8em] leading-relaxed text-[#14365a]/70">{t(track.shortDescription)}</p>

          <ul className="mt-[1em] flex flex-wrap gap-[0.5em]">
            {chips.map((c) => (
              <li key={c} className="rounded-[0.5em] border border-[#cfe6e1] bg-white/70 px-[0.9em] py-[0.35em] text-[0.7em] text-[#14365a]/80">
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-[1.4em] flex flex-wrap items-center gap-[0.7em]">
            {track.isLearning && nextId ? (
              <Link
                href={lessonPath(track.code, nextId) as Route}
                className="rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-white hover:bg-[#0f505a]"
              >
                {t("Continue Learning")}
              </Link>
            ) : (
              <button
                type="button"
                onClick={choose}
                disabled={busy || track.isLearning}
                className="rounded-[0.5em] bg-[#12606b] px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-white hover:bg-[#0f505a] disabled:opacity-60"
              >
                {busy ? t("Saving...") : track.isLearning ? t("Your Track") : t("Choose This Track")}
              </button>
            )}

            {previewId && (
              <Link
                href={lessonPath(track.code, previewId) as Route}
                className="rounded-[0.5em] border border-[#12939b]/60 bg-white px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
              >
                {t("Preview Content")}
              </Link>
            )}
          </div>
          {actionError && (
            <p role="alert" className="mt-[0.7em] text-[0.75em] font-medium text-[#c0392b]">
              {actionError}
            </p>
          )}
        </div>
      </section>

      {/* ---------- Learning objectives ---------- */}
      {objectives.length > 0 && (
        <section className="mt-[1.6em]">
          <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">{t("What you'll learn")}</p>
          <h2 className="mt-[0.3em] text-[1.1em] font-extrabold text-[#14365a]">{modules[0] ?? t("Learning objectives")}</h2>
          <ul className="mt-[0.8em] grid gap-[0.8em] sm:grid-cols-2 lg:grid-cols-3 xl:max-w-[80%]">
            {objectives.map((o) => (
              <li key={o.id} className={`${box} flex items-center gap-[0.7em] px-[1em] py-[0.9em] text-[0.8em] font-semibold text-[#14365a]`}>
                <CheckCircle2 className="size-[1.4em] shrink-0 text-[#12939b]" />
                <span className="min-w-0">
                  {o.title}
                  {o.hasSchoolLink && (
                    <span className="mt-[0.2em] flex items-center gap-[0.3em] text-[0.8em] font-medium text-[#12939b]">
                      <School className="size-[1em]" /> {t("Linked to school")}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Intro videos + track quiz ---------- */}
      <section className="mt-[1.6em]">
        <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">{t("Meet the track")}</p>
        <h2 className="mt-[0.3em] text-[1.1em] font-extrabold text-[#14365a]">{t("Intro videos")}</h2>
        {track.videos.length === 0 ? (
          <p className={`${box} mt-[0.8em] px-[1em] py-[1.2em] text-[0.8em] text-[#14365a]/65`}>{t("No intro videos yet.")}</p>
        ) : (
          <div className="mt-[0.8em] grid gap-[0.8em] md:grid-cols-2 xl:grid-cols-3">
            {track.videos.map((v) => (
              <article key={v.id} className={`${box} p-[0.6em]`}>
                <VideoPlayer src={v.fileUrl} poster={v.posterUrl} title={v.title} watchedPercent={v.watchedPercent} onProgress={(p) => videoProgress(v.id, p)} />
                <div className="mt-[0.5em] flex items-center gap-[0.5em] px-[0.2em] text-[0.8em]">
                  <span className="min-w-0 flex-1 truncate font-semibold text-[#14365a]">{v.title}</span>
                  <span className="text-[0.85em] text-[#14365a]/55">{minutes(v.durationSeconds)}</span>
                  {v.completed && <CheckCircle2 aria-label={t("Watched")} className="size-[1.2em] text-[#12939b]" />}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-[0.8em] flex flex-wrap items-center gap-[1em] rounded-[1em] bg-gradient-to-br from-[#14586a] to-[#1d8a8f] p-[1em] text-white">
          <span className="grid size-[2.6em] place-items-center rounded-[0.7em] bg-white/15">
            {track.quiz.unlocked ? <HelpCircle className="size-[1.3em]" /> : <Lock className="size-[1.3em]" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[0.6em] font-bold uppercase tracking-wide text-white/70">{t("Track quiz")}</p>
            <p className="text-[0.9em] font-extrabold">
              {track.quiz.passed ? t("You passed the track quiz") : t("{n} quick questions about {track}", { n: track.quiz.questions.length, track: t(track.name) })}
            </p>
            <p className="text-[0.7em] text-white/80">
              {track.quiz.unlocked ? t("Answer 2 of 3 correctly to pass.") : t("Watch one of the videos to unlock the quiz.")}
            </p>
          </div>
          {track.quiz.unlocked && (
            <Link
              href={`${trackPath(track.code)}/quiz` as Route}
              className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-white px-[1.1em] py-[0.5em] text-[0.75em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
            >
              {track.quiz.passed ? t("Take it again") : t("Start quiz")} <ArrowRight className="size-[1em]" />
            </Link>
          )}
        </div>
      </section>

      {/* ---------- Courses ---------- */}
      <section id="track-lessons" className="mt-[1.6em] scroll-mt-4">
        <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#12939b]">{t("Track content")}</p>
        <h2 className="mt-[0.3em] text-[1.1em] font-extrabold text-[#14365a]">{t("Courses in this track")}</h2>
        <p className="mt-[0.2em] text-[0.72em] text-[#14365a]/65">{t("The courses open in order. Finish a level's lessons and pass its exam to open the next one.")}</p>

        {courses.length === 0 ? (
          <p className={`${box} mt-[0.8em] px-[1em] py-[1.2em] text-[0.8em] text-[#14365a]/65`}>
            {t("Courses for {track} are coming soon. Watch the intro videos and take the quiz meanwhile.", { track: t(track.name) })}
          </p>
        ) : (
          <ol className={`${box} mt-[0.8em] divide-y divide-[#e3ebf3] overflow-hidden`}>
            {courses.map((c, i) => {
              const locked = c.status === "Locked";
              const row = (
                <>
                  <span
                    className={`grid size-[2.6em] shrink-0 place-items-center rounded-[0.6em] ${locked ? "bg-[#f3f5f8] text-[#14365a]/40" : "bg-[#e7f6f3] text-[#12939b]"}`}
                  >
                    {locked ? <Lock className="size-[1.2em]" /> : <CourseIcon iconKey={c.iconKey} className="size-[1.3em]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.85em] font-bold text-[#14365a]">
                      {String(i + 1).padStart(2, "0")} · {c.title}
                    </span>
                    <span className="mt-[0.2em] block truncate text-[0.7em] text-[#14365a]/65">{c.summary}</span>
                  </span>
                  <span className="hidden sm:block">
                    <LevelChips levels={c.levels} />
                  </span>
                  {c.status === "Done" ? (
                    <CheckCircle2 className="size-[1.3em] shrink-0 text-[#12939b]" aria-label={t("Completed")} />
                  ) : !locked ? (
                    <ArrowRight className="size-[1.2em] shrink-0 text-[#14365a]" aria-label={t("Open course")} />
                  ) : null}
                </>
              );
              return (
                <li key={c.id}>
                  {locked ? (
                    <div className="flex items-center gap-[1em] px-[1em] py-[0.9em] opacity-70">{row}</div>
                  ) : (
                    <Link href={coursePath(track.code, c.id) as Route} className="flex items-center gap-[1em] px-[1em] py-[0.9em] hover:bg-[#f6fafd]">
                      {row}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </>,
  );
}