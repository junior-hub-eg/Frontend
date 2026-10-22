"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, Award, BookOpen, CheckCircle2, ChevronDown, LoaderCircle, PlayCircle, Star, Trophy } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import { getAchievements, getTrack, getTrackLessons, getTracks, trackPath, type TrackSummary } from "@/lib/learning-api";
import { getMentors, type Mentor } from "@/lib/mentorship-api";
import MyCourses from "./MyCourses";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const IMG = "/images/Intern";

/** Header: cover background (also sits behind the top bar) + the Courses building on the right. */
const COVER_IMG = `${IMG}/image%2047%20%281%29.png`;
const BUILDING_IMG = `${IMG}/Courses.png`;

/** Card colours and pictures from the Figma, given to the tracks in turn. */
const THEMES = [
  { tagBg: "#ffd3e6", tagText: "#c2386f", bg: "linear-gradient(135deg,#ffe3ef 0%,#ffc6dc 100%)", imgBg: "#ffe3ef", img: `${IMG}/image%2036.png` },
  { tagBg: "#d6e7ff", tagText: "#2f6fc4", bg: "linear-gradient(135deg,#e4f0ff 0%,#c6dcff 100%)", imgBg: "#e4f0ff", img: `${IMG}/image%2037.png` },
  { tagBg: "#d3f0f0", tagText: "#12939b", bg: "linear-gradient(135deg,#e0f4f4 0%,#c3ebe9 100%)", imgBg: "#e0f4f4", img: `${IMG}/image%2037.png` },
  { tagBg: "#fde5cf", tagText: "#d9822b", bg: "linear-gradient(135deg,#fbefe4 0%,#fbdcc0 100%)", imgBg: "#fbefe4", img: `${IMG}/image%2036.png` },
];

type Course = TrackSummary & {
  /** null: the track has no lessons yet. */
  lessons: number | null;
  lessonsDone: number;
  quizPassed: boolean;
  /** The best rated mentor of the track. */
  mentor: Mentor | null;
  theme: (typeof THEMES)[number];
};

type Loaded = { courses: Course[]; badges: number };

/** Tracks, lessons and quiz progress, mentors and badges: everything on this page comes from the API. */
async function load(): Promise<Loaded> {
  const [tracks, mentors, achievements] = await Promise.all([
    getTracks(),
    getMentors({ all: true }).catch(() => [] as Mentor[]),
    getAchievements().catch(() => null),
  ]);
  const [lessons, details] = await Promise.all([
    Promise.all(tracks.map((t) => (t.hasLessons ? getTrackLessons(t.code).catch(() => null) : null))),
    Promise.all(tracks.map((t) => (t.isLearning ? getTrack(t.code).catch(() => null) : null))),
  ]);
  const courses = tracks.map((t, i) => {
    const all = lessons[i]?.modules.flatMap((m) => m.lessons) ?? null;
    const mentor = mentors.filter((m) => m.trackCode === t.code).sort((a, b) => b.rating - a.rating)[0] ?? null;
    return {
      ...t,
      lessons: all ? all.length : null,
      lessonsDone: all?.filter((l) => l.status === "Done").length ?? 0,
      quizPassed: details[i]?.quiz.passed ?? false,
      mentor,
      theme: THEMES[i % THEMES.length],
    };
  });
  return { courses, badges: achievements?.badges.length ?? 0 };
}

const SORTS = [tk("Top Rated"), tk("Name")] as const;
type Sort = (typeof SORTS)[number];

const card = "rounded-[1.4em] border border-[#e8eef5] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

export default function CoursesPage() {
  const t = useT();
  // Only the courses of the student's tracks; Change / Add track opens the other tracks.
  const [browsing, setBrowsing] = useState(false);
  const [sort, setSort] = useState<Sort>("Top Rated");
  const [sortOpen, setSortOpen] = useState(false);
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    load().then(
      (d) => active && setData(d),
      (e) => active && setLoadError(errorMessage(e, "We couldn't load the courses. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, []);

  const courses = data?.courses ?? [];
  const learning = courses.filter((c) => c.isLearning);
  const stats = [
    { icon: BookOpen, label: t("Tracks You Learn"), value: data ? `${learning.length}/${courses.length}` : "–", color: "#12939b", bg: "#e0f4f4" },
    { icon: CheckCircle2, label: t("Lessons Completed"), value: data ? String(courses.reduce((n, c) => n + c.lessonsDone, 0)) : "–", color: "#2fb36b", bg: "#e6f5ec" },
    { icon: Trophy, label: t("Track Quizzes Passed"), value: data ? String(learning.filter((c) => c.quizPassed).length) : "–", color: "#d9a21b", bg: "#fff4d6" },
    { icon: Award, label: t("Badges Earned"), value: data ? String(data.badges) : "–", color: "#14365a", bg: "#e4ecf5" },
  ];

  const sorted = (list: Course[]) =>
    [...list].sort((a, b) => (sort === "Top Rated" ? (b.mentor?.rating ?? 0) - (a.mentor?.rating ?? 0) : a.name.localeCompare(b.name)));
  // A student with no track yet sees every track.
  const showTracks = browsing || (data !== null && learning.length === 0);
  // Tracks the student learns first.
  const listed = sorted(courses).sort((a, b) => Number(b.isLearning) - Number(a.isLearning));

  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      {/* Desktop: one screen, no page scroll. The lower sections shrink to fit the window height. */}
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.6)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* ---------- Header (the cover also sits behind the top bar: search / EN / profile) ---------- */}
        <section className="relative shrink-0 overflow-hidden rounded-[1.6em] bg-[#d8ecfb] lg:-mt-[calc(var(--u)*6.5)] lg:pt-[calc(var(--u)*6.5)]">
          <Image src={COVER_IMG} alt="" fill priority sizes="100vw" className="object-cover object-top" />

          {/* Courses building (right side) */}
          <div className="pointer-events-none absolute bottom-0 end-[3%] hidden h-[82%] w-[26%] lg:block">
            <Image src={BUILDING_IMG} alt="" fill priority sizes="30vw" className="object-contain object-right-bottom" />
          </div>

          <div className="relative z-10 flex flex-col gap-[0.7em] p-[1.2em] lg:pt-[0.4em]">
            <div className="max-w-[32em]">
              <h1 className="text-[2.1em] font-extrabold leading-tight text-[#14365a]">{t("Explore Courses")}</h1>
              <p className="text-[0.9em] text-[#14365a]/85">
                {t("Learn New Skills, Build real projects and Grow with Guides from expert Mentors.")}
              </p>
            </div>

            <ul className={`${card} grid w-fit max-w-full grid-cols-2 gap-x-[1.6em] gap-y-[0.6em] p-[0.7em] sm:grid-cols-4 sm:px-[1.2em]`}>
              {stats.map((s) => (
                <li key={s.label} className="flex items-center gap-[0.6em]">
                  <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.6em]" style={{ backgroundColor: s.bg }}>
                    <s.icon className="size-[1.2em]" style={{ color: s.color }} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[0.95em] font-extrabold text-[#14365a]">{s.value}</span>
                    <span className="block whitespace-nowrap text-[0.72em] text-[#14365a]/70">{s.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Change / Add track: every track, with a way back ---------- */}
        {showTracks && (
        <div className="mt-[0.9em] flex flex-wrap items-center gap-[0.8em] lg:shrink-0">
          {learning.length > 0 && (
            <button
              type="button"
              onClick={() => setBrowsing(false)}
              className="flex items-center gap-[0.4em] rounded-full border border-[#e1e8f0] bg-white px-[1em] py-[0.4em] text-[0.85em] font-semibold text-[#12606b] hover:bg-[#eef4fa]"
            >
              <ArrowLeft className="size-[1.1em]" /> {t("My Courses")}
            </button>
          )}
          <div className="leading-tight">
            <h2 className="text-[1.25em] font-extrabold text-[#14365a]">{t("Change or add a track")}</h2>
            <p className="text-[0.75em] text-[#14365a]/70">{t("Open a track to see its courses and start learning it.")}</p>
          </div>
          <div className="relative ms-auto flex items-center gap-[0.6em] text-[0.9em] text-[#14365a]">
            {t("Sort by")}
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className="flex h-[2.4em] items-center gap-[0.8em] rounded-[0.9em] border border-[#e1e8f0] bg-white px-[1.1em] font-medium"
            >
              {t(sort)} <ChevronDown className="size-[1em]" />
            </button>
            {sortOpen && (
              <ul role="listbox" className="absolute end-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg">
                {SORTS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sort === s}
                      onClick={() => {
                        setSort(s);
                        setSortOpen(false);
                      }}
                      className="w-full whitespace-nowrap px-[1.1em] py-[0.6em] text-start hover:bg-[#eef4fa]"
                    >
                      {t(s)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}

        {loadError && (
          <p role="alert" className="mt-[0.9em] rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-[0.85em] font-semibold text-[#b83232] lg:shrink-0">
            {loadError}
          </p>
        )}
        {!data && !loadError && (
          <div className="grid flex-1 place-items-center py-[3em]" role="status" aria-label={t("Loading")}>
            <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
          </div>
        )}

        {data && !showTracks && <MyCourses learning={learning} onExplore={() => setBrowsing(true)} />}

        {/* ---------- Bottom part: shrinks to fit the remaining height ---------- */}
        {data && showTracks && (
        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          {/* Other tracks / All */}
          <section className="mt-[0.9em] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="grid content-start gap-[0.9em] md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:overflow-y-auto lg:pb-[0.4em]">
              {listed.map((c) => (
                <article
                  key={c.code}
                  className={`${card} relative aspect-[270/125] min-h-0 min-w-0 overflow-hidden rounded-[1.2rem] [container-type:size]`}
                >
                  <Link href={trackPath(c.code) as Route} aria-label={t("Open {name}", { name: t(c.name) })} className="absolute inset-0 z-10" />

                  {/* Everything inside scales with the card size */}
                  <div className="flex h-full w-full gap-[0.8em] p-[0.8em]" style={{ fontSize: "min(calc(100cqw / 22), calc(100cqh / 9.8))" }}>
                    <div className="relative aspect-square h-full shrink-0 overflow-hidden rounded-[0.9em]" style={{ backgroundColor: c.theme.imgBg }}>
                      <Image src={c.theme.img} alt="" fill sizes="160px" className="object-cover" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-[0.5em]">
                        <span className="w-fit rounded-full px-[0.8em] py-[0.1em] text-[0.7em] font-bold" style={{ backgroundColor: c.theme.tagBg, color: c.theme.tagText }}>
                          {t(c.name)}
                        </span>
                        {c.isLearning && (
                          <span className="flex items-center gap-[0.3em] text-[0.65em] font-semibold text-[#2fb36b]">
                            <CheckCircle2 className="size-[1.1em]" /> {t("Learning")}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-[0.3em] truncate text-[0.95em] font-extrabold leading-tight text-[#14365a]">{t(c.name)}</h3>
                      <p className="mt-[0.2em] line-clamp-2 text-[0.68em] leading-snug text-[#14365a]/70">{t(c.shortDescription)}</p>

                      <div className="mt-[0.4em] flex items-center gap-[1em] whitespace-nowrap text-[0.7em] text-[#14365a]/80">
                        <span className="flex items-center gap-[0.4em]">
                          <BookOpen className="size-[1.1em]" /> {c.lessons === null ? t("Lessons soon") : t("{n} Lessons", { n: c.lessons })}
                        </span>
                        <span className="flex items-center gap-[0.4em]">
                          <PlayCircle className="size-[1.1em]" /> {c.videoCount === 1 ? t("1 Video") : t("{n} Videos", { n: c.videoCount })}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center gap-[0.5em]">
                        {c.mentor ? (
                          <>
                            <span
                              className="relative size-[2em] shrink-0 overflow-hidden rounded-full"
                              style={{ backgroundColor: mentorAvatar(c.mentor).bg }}
                            >
                              <Image src={mentorAvatar(c.mentor).src} alt="" fill sizes="40px" className="object-cover" />
                            </span>
                            <span className="min-w-0 flex-1 leading-tight">
                              <span className="block truncate text-[0.78em] font-bold text-[#14365a]">{c.mentor.fullName}</span>
                              <span className="block truncate text-[0.65em] text-[#14365a]/65">{t(c.mentor.title)}</span>
                            </span>
                            <span className="flex shrink-0 items-center gap-[0.3em] text-[0.7em] font-semibold text-[#14365a]">
                              <Star className="size-[1.1em] fill-[#f5b301] text-[#f5b301]" />
                              {c.mentor.rating.toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[0.68em] text-[#14365a]/60">{t("Mentors coming soon")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
        )}
      </div>
    </div>
  );
}
