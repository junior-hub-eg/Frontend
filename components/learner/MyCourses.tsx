"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, LoaderCircle, Lock, Plus } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { coursePath, getTrackCourses, type TrackCourses, type TrackSummary } from "@/lib/learning-api";
import { COURSE_STYLE, CourseIcon, LevelChips, levelsDone } from "./course-levels";
import { useT } from "@/lib/i18n/client";

const card = "rounded-[1.2em] border border-[#e8eef5] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/**
 * The courses of a track the student learns (decision of 21 Oct 2026), in order: each with its 3 levels and what is
 * open. Tracks the student learns are tabs; Change / Add track opens every track.
 */
export default function MyCourses({ learning, onExplore }: { learning: TrackSummary[]; onExplore: () => void }) {
  const t = useT();
  const tracks = [...learning].sort((a, b) => Number(b.isFocus) - Number(a.isFocus));
  const [code, setCode] = useState(tracks[0]?.code ?? null);
  const [loaded, setLoaded] = useState<{ code: string; data: TrackCourses } | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  useEffect(() => {
    if (!code) return;
    let active = true;
    getTrackCourses(code).then(
      (data) => active && setLoaded({ code, data }),
      (e) => active && setError({ code, message: errorMessage(e, "We couldn't load your courses. Please try again.") }),
    );
    return () => {
      active = false;
    };
  }, [code]);

  const data = loaded?.code === code ? loaded.data : null;
  const failed = error?.code === code ? error.message : null;

  return (
    <section className="mt-[0.9em] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <div className="mb-[0.7em] flex flex-wrap items-center gap-[0.5em] lg:shrink-0">
        {tracks.map((tr) => (
          <button
            key={tr.code}
            type="button"
            onClick={() => setCode(tr.code)}
            aria-pressed={tr.code === code}
            className={`rounded-full border px-[1em] py-[0.35em] text-[0.8em] font-semibold transition-colors ${
              tr.code === code ? "border-[#1d7f85] bg-[#1d7f85] text-white" : "border-[#e1e8f0] bg-white text-[#14365a] hover:bg-[#eef4fa]"
            }`}
          >
            {t(tr.name)}
            {tr.isFocus && <span className="ms-[0.4em] text-[0.8em] opacity-80">{t("· focus")}</span>}
          </button>
        ))}
        <button
          type="button"
          onClick={onExplore}
          className="ms-auto flex items-center gap-[0.4em] rounded-full border border-[#12939b]/60 bg-white px-[1em] py-[0.35em] text-[0.8em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
        >
          <Plus className="size-[1.1em]" /> {t("Change / Add track")}
        </button>
      </div>

      {failed && (
        <p role="alert" className="rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.85em] font-semibold text-[#b83232]">
          {failed}
        </p>
      )}
      {!data && !failed && (
        <div className="grid place-items-center py-[3em]" role="status" aria-label={t("Loading")}>
          <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
        </div>
      )}

      {data && (
        <>
          <p className="mb-[0.6em] text-[0.8em] text-[#14365a]/70 lg:shrink-0">
            {t("{track} · you start at {level} · finish each level's lessons and pass its exam to open the next one.", { track: t(data.trackName), level: t(data.level) })}
          </p>
          <ol className="grid content-start gap-[0.7em] md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-[0.4em] xl:grid-cols-3">
            {data.courses.map((c, i) => {
              const style = COURSE_STYLE[c.status];
              const locked = c.status === "Locked";
              const body = (
                <>
                  <div className="flex items-start gap-[0.8em]">
                    <span
                      className={`grid size-[2.8em] shrink-0 place-items-center rounded-[0.8em] ${locked ? "bg-[#f3f5f8] text-[#14365a]/40" : "bg-[#e7f6f3] text-[#12939b]"}`}
                    >
                      {locked ? <Lock className="size-[1.3em]" /> : <CourseIcon iconKey={c.iconKey} className="size-[1.4em]" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-[0.5em]">
                        <span className="text-[0.65em] font-bold text-[#14365a]/50">{String(i + 1).padStart(2, "0")}</span>
                        <span className="truncate text-[1em] font-extrabold text-[#14365a]">{c.title}</span>
                      </span>
                      <span className="mt-[0.2em] line-clamp-2 block text-[0.72em] leading-snug text-[#14365a]/70">{c.summary}</span>
                    </span>
                    <span
                      className="shrink-0 rounded-full px-[0.7em] py-[0.15em] text-[0.62em] font-semibold"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {t(style.label)}
                    </span>
                  </div>
                  <div className="mt-[0.8em] flex items-center justify-between gap-[0.6em]">
                    <LevelChips levels={c.levels} />
                    <span className="flex shrink-0 items-center gap-[0.3em] text-[0.7em] font-semibold text-[#14365a]/70">
                      {levelsDone(c.levels)}/3 {!locked && <ArrowRight className="size-[1.1em] text-[#12606b]" />}
                    </span>
                  </div>
                  {locked && i > 0 && (
                    <p className="mt-[0.5em] text-[0.65em] text-[#14365a]/55">{t("Finish {course} to open this course.", { course: data.courses[i - 1].title })}</p>
                  )}
                </>
              );
              return (
                <li key={c.id}>
                  {locked ? (
                    <div className={`${card} block h-full p-[0.9em] opacity-75`} aria-disabled="true">
                      {body}
                    </div>
                  ) : (
                    <Link href={coursePath(data.trackCode, c.id) as Route} className={`${card} block h-full p-[0.9em] transition-shadow hover:shadow-[0_10px_28px_rgba(20,54,90,0.14)]`}>
                      {body}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
