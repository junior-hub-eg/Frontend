"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, Clock, FolderOpen, Heart, Star, Trophy } from "lucide-react";
import { trackPath } from "@/lib/learning-api";

const IMG = "/images/Intern";

/** Header: cover background (also sits behind the top bar) + the Courses building on the right. */
const COVER_IMG = `${IMG}/image%2047%20%281%29.png`;
const BUILDING_IMG = `${IMG}/Courses.png`;

/** Backend track codes (TracksController); Product Management has no track yet. */
const TRACK_CODE: Record<string, string> = {
  "UI/UX Fundamentals": "UIUX",
  "Intro to Machine Learning": "AI",
  "React for Beginners": "FRONTEND",
  "UI/UX Design": "UIUX",
  Frontend: "FRONTEND",
  "Mobile Development": "MOBILE",
  "Data Science": "DATA",
  AI: "AI",
  Backend: "BACKEND",
  "Quality Assurance": "TESTING",
};

const trackHref = (title: string) => (TRACK_CODE[title] ? (trackPath(TRACK_CODE[title]) as Route) : null);

const STATS = [
  { icon: BookOpen, label: "Completed Courses", value: "1/5", color: "#12939b", bg: "#e0f4f4" },
  { icon: CheckCircle2, label: "Lessons Completed", value: "12", color: "#2fb36b", bg: "#e6f5ec" },
  { icon: Trophy, label: "Quizzes Passed", value: "8", color: "#d9a21b", bg: "#fff4d6" },
  { icon: Award, label: "Certificates Earned", value: "3", color: "#14365a", bg: "#e4ecf5" },
];

const FEATURED = [
  {
    tag: "UI/UX Design",
    tagBg: "#ffd3e6",
    tagText: "#c2386f",
    title: "UI/UX Fundamentals",
    desc: "Junior Hub is not just a course library. It's a complete learning opportunities in the tech world.",
    hours: 16,
    lessons: 24,
    students: "12,2k",
    bg: "linear-gradient(135deg,#ffe3ef 0%,#ffc6dc 100%)",
    img: `${IMG}/image%2036.png`,
  },
  {
    tag: "Data Science",
    tagBg: "#d6e7ff",
    tagText: "#2f6fc4",
    title: "Intro to Machine Learning",
    desc: "Learn foundational machine learning algorithms and data datasets.",
    hours: 18,
    lessons: 28,
    students: "13,5k",
    bg: "linear-gradient(135deg,#e4f0ff 0%,#c6dcff 100%)",
    img: `${IMG}/image%2037.png`,
  },
  {
    tag: "Frontend",
    tagBg: "#d6e7ff",
    tagText: "#2f6fc4",
    title: "React for Beginners",
    desc: "A complete learning pipeline designed to help you discover, grow, and reach real opportunities in the tech world.",
    hours: 16,
    lessons: 24,
    students: "12,2k",
    bg: "linear-gradient(135deg,#e4f0ff 0%,#cfe0ff 100%)",
    img: `${IMG}/image%2037.png`,
  },
];

const POPULAR = [
  { title: "UI/UX Fundamentals", tag: "UI/UX Design", tagBg: "#ffd3e6", tagText: "#c2386f", img: `${IMG}/image%2036.png`, imgBg: "#ffe3ef", lessons: 12, projects: 2, rating: 4.8, reviews: 135, students: 12200, instructor: "Khadija Mohammed", role: "UI/UX Designer", avatar: `${IMG}/char-girl.png`, avatarBg: "#ff9a62" },
  { title: "Intro to Machine Learning", tag: "Data Science", tagBg: "#d6e7ff", tagText: "#2f6fc4", img: `${IMG}/image%2037.png`, imgBg: "#e4f0ff", lessons: 28, projects: 3, rating: 4.7, reviews: 98, students: 13500, instructor: "Omar Hassan", role: "ML Engineer", avatar: `${IMG}/char-boy-glasses.png`, avatarBg: "#ffc531" },
  { title: "React for Beginners", tag: "Frontend", tagBg: "#d6e7ff", tagText: "#2f6fc4", img: `${IMG}/image%2037.png`, imgBg: "#e4f0ff", lessons: 24, projects: 2, rating: 4.9, reviews: 210, students: 12200, instructor: "Sara Ahmed", role: "Frontend Developer", avatar: `${IMG}/char-girl.png`, avatarBg: "#3fc9b0" },
  { title: "Backend", tag: "Backend", tagBg: "#d3f0f0", tagText: "#12939b", img: `${IMG}/image%2037.png`, imgBg: "#e0f4f4", lessons: 20, projects: 2, rating: 4.6, reviews: 76, students: 8400, instructor: "Youssef Ali", role: "Backend Developer", avatar: `${IMG}/char-boy-glasses-2.png`, avatarBg: "#5aa9e6" },
  { title: "Mobile Development", tag: "Mobile", tagBg: "#fde5cf", tagText: "#d9822b", img: `${IMG}/image%2036.png`, imgBg: "#fbefe4", lessons: 18, projects: 2, rating: 4.5, reviews: 64, students: 7100, instructor: "Mariam Tarek", role: "Mobile Developer", avatar: `${IMG}/char-girl.png`, avatarBg: "#ff9a62" },
  { title: "Quality Assurance", tag: "QA", tagBg: "#d9f2e3", tagText: "#2fb36b", img: `${IMG}/image%2037.png`, imgBg: "#e6f5ec", lessons: 14, projects: 1, rating: 4.4, reviews: 52, students: 5200, instructor: "Ahmed Samir", role: "QA Engineer", avatar: `${IMG}/char-boy-glasses.png`, avatarBg: "#ffc531" },
];

const SORTS = ["Top Rated", "Most Popular"] as const;
type Sort = (typeof SORTS)[number];

const card = "rounded-[1.4em] border border-[#e8eef5] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

export default function CoursesPage() {
  const [tab, setTab] = useState<"recommended" | "all">("recommended");
  const [sort, setSort] = useState<Sort>("Top Rated");
  const [sortOpen, setSortOpen] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const toggleFav = (title: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });

  const popular = useMemo(
    () => [...POPULAR].sort((a, b) => (sort === "Top Rated" ? b.rating - a.rating : b.students - a.students)),
    [sort],
  );

  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      {/* Desktop: one screen, no page scroll. The lower sections shrink to fit the window height. */}
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.6)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* ---------- Header (the cover also sits behind the top bar: search / EN / profile) ---------- */}
        <section className="relative shrink-0 overflow-hidden rounded-[1.6em] bg-[#d8ecfb] lg:-mt-[calc(var(--u)*6.5)] lg:pt-[calc(var(--u)*6.5)]">
          <Image src={COVER_IMG} alt="" fill priority sizes="100vw" className="object-cover object-top" />

          {/* Courses building (right side) */}
          <div className="pointer-events-none absolute bottom-0 right-[3%] hidden h-[82%] w-[26%] lg:block">
            <Image src={BUILDING_IMG} alt="" fill priority sizes="30vw" className="object-contain object-right-bottom" />
          </div>

          <div className="relative z-10 flex flex-col gap-[0.7em] p-[1.2em] lg:pt-[0.4em]">
            <div className="max-w-[32em]">
              <h1 className="text-[2.1em] font-extrabold leading-tight text-[#14365a]">Explore Courses</h1>
              <p className="text-[0.9em] text-[#14365a]/85">
                Learn New Skills, Build real projects and Grow with Guides from expert Mentors.
              </p>
            </div>

            <ul className={`${card} grid w-fit max-w-full grid-cols-2 gap-x-[1.6em] gap-y-[0.6em] p-[0.7em] sm:grid-cols-4 sm:px-[1.2em]`}>
              {STATS.map((s) => (
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

        {/* ---------- Tabs + sort ---------- */}
        <div className="mt-[0.9em] flex flex-wrap items-center gap-[0.8em] lg:shrink-0">
          <div role="tablist" aria-label="Courses view" className="flex flex-wrap gap-[0.5em]">
            {(
              [
                ["recommended", "Courses Recommended to you"],
                ["all", "All Courses"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`rounded-full px-[1.2em] py-[0.45em] text-[0.9em] font-semibold transition-colors ${
                  tab === id ? "bg-[#1d7f85] text-white" : "text-[#14365a] hover:bg-[#eef4fa]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative ml-auto flex items-center gap-[0.6em] text-[0.9em] text-[#14365a]">
            Sort by
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              className="flex h-[2.4em] items-center gap-[0.8em] rounded-[0.9em] border border-[#e1e8f0] bg-white px-[1.1em] font-medium"
            >
              {sort} <ChevronDown className="size-[1em]" />
            </button>
            {sortOpen && (
              <ul role="listbox" className="absolute right-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white shadow-lg">
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
                      className="w-full whitespace-nowrap px-[1.1em] py-[0.6em] text-left hover:bg-[#eef4fa]"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* ---------- Bottom part: shrinks to fit the remaining height ---------- */}
        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          {/* Featured (recommended tab only) */}
          {tab === "recommended" && (
            <section className="mt-[0.9em] grid gap-[1em] md:grid-cols-2 lg:min-h-0 lg:flex-[1.05] lg:grid-cols-3">
              {FEATURED.map((c, i) => {
                const href = trackHref(c.title);
                return (
                  <article
                    key={`${c.title}-${i}`}
                    className="relative aspect-[282/150] min-h-0 min-w-0 overflow-hidden rounded-[1.6rem] [container-type:size] lg:aspect-auto lg:h-full"
                    style={{ background: c.bg }}
                  >
                    {href && <Link href={href} aria-label={`Open ${c.title}`} className="absolute inset-0 z-20 rounded-[1.6rem]" />}
                    {/* Everything inside scales with the card size */}
                    <div
                      className="relative h-full w-full p-[1.1em]"
                      style={{ fontSize: "min(calc(100cqw / 28), calc(100cqh / 14.9))" }}
                    >
                      <div className="absolute right-0 top-0 h-full w-[58%] [mask-image:linear-gradient(to_right,transparent,black_28%)]">
                        <Image src={c.img} alt="" fill sizes="400px" className="object-cover object-right" />
                      </div>

                      <div className="relative z-10 flex h-full w-[52%] flex-col">
                        <span className="w-fit rounded-full px-[0.8em] py-[0.2em] text-[0.7em] font-bold" style={{ backgroundColor: c.tagBg, color: c.tagText }}>
                          {c.tag}
                        </span>
                        <h3 className="mt-[0.6em] text-[1.25em] font-extrabold leading-tight text-[#14365a]">{c.title}</h3>
                        <p className="mt-[0.4em] line-clamp-3 text-[0.75em] leading-snug text-[#14365a]/75">{c.desc}</p>

                        <div className="mt-auto">
                          <div className="flex items-center gap-[1em] whitespace-nowrap text-[0.75em] font-medium text-[#14365a]">
                            <span className="flex items-center gap-[0.4em]">
                              <Clock className="size-[1.1em]" /> {c.hours} Hours
                            </span>
                            <span className="flex items-center gap-[0.4em]">
                              <BookOpen className="size-[1.1em]" /> {c.lessons} Lessons
                            </span>
                          </div>
                          <div className="mt-[0.6em] flex items-center whitespace-nowrap">
                            <ul className="flex">
                              {POPULAR.slice(0, 4).map((a, k) => (
                                <li
                                  key={k}
                                  className="relative -ml-[0.6em] size-[2em] overflow-hidden rounded-full ring-2 ring-white first:ml-0"
                                  style={{ backgroundColor: a.avatarBg }}
                                >
                                  <Image src={a.avatar} alt="" fill sizes="40px" className="origin-top scale-[2.1] object-cover object-top" />
                                </li>
                              ))}
                            </ul>
                            <span className="ml-[0.6em] text-[0.7em] font-medium text-[#14365a]/75">+{c.students} students</span>
                          </div>
                        </div>
                      </div>

                      <span className="absolute bottom-[1.1em] right-[1.1em] z-10 grid size-[2.4em] place-items-center rounded-full bg-white text-[#14365a] shadow">
                        <ArrowRight className="size-[1.1em]" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* Popular / All */}
          <section className="mt-[0.9em] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <h2 className="mb-[0.5em] text-[1.25em] font-extrabold text-[#14365a] lg:shrink-0">
              {tab === "recommended" ? "Popular Courses" : "All Courses"}
            </h2>

            <div className="grid gap-[0.9em] md:grid-cols-2 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:grid-rows-2">
              {popular.map((c) => {
                const href = trackHref(c.title);
                const fav = favs.has(c.title);
                return (
                  <article
                    key={c.title}
                    className={`${card} relative aspect-[270/125] min-h-0 min-w-0 overflow-hidden rounded-[1.2rem] [container-type:size] lg:aspect-auto lg:h-full`}
                  >
                    {href && <Link href={href} aria-label={`Open ${c.title}`} className="absolute inset-0 z-10" />}

                    {/* Everything inside scales with the card size */}
                    <div
                      className="flex h-full w-full gap-[0.8em] p-[0.8em]"
                      style={{ fontSize: "min(calc(100cqw / 22), calc(100cqh / 9.8))" }}
                    >
                      <div className="relative aspect-square h-full shrink-0 overflow-hidden rounded-[0.9em]" style={{ backgroundColor: c.imgBg }}>
                        <Image src={c.img} alt="" fill sizes="160px" className="object-cover" />
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-[0.5em]">
                          <span className="w-fit rounded-full px-[0.8em] py-[0.1em] text-[0.7em] font-bold" style={{ backgroundColor: c.tagBg, color: c.tagText }}>
                            {c.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleFav(c.title)}
                            aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                            aria-pressed={fav}
                            className="relative z-20 text-[#14365a]/60 hover:text-[#c2386f]"
                          >
                            <Heart className={`size-[1.2em] ${fav ? "fill-[#c2386f] text-[#c2386f]" : ""}`} />
                          </button>
                        </div>

                        <h3 className="mt-[0.3em] truncate text-[0.95em] font-extrabold leading-tight text-[#14365a]">{c.title}</h3>
                        <p className="mt-[0.2em] line-clamp-2 text-[0.68em] leading-snug text-[#14365a]/70">
                          Junior Hub is not just a course library. It's a complete learning opportunities in the tech world.
                        </p>

                        <div className="mt-[0.4em] flex items-center gap-[1em] whitespace-nowrap text-[0.7em] text-[#14365a]/80">
                          <span className="flex items-center gap-[0.4em]">
                            <BookOpen className="size-[1.1em]" /> {c.lessons} Lessons
                          </span>
                          <span className="flex items-center gap-[0.4em]">
                            <FolderOpen className="size-[1.1em]" /> {c.projects} Projects
                          </span>
                        </div>

                        <div className="mt-auto flex items-center gap-[0.5em]">
                          <span className="relative size-[2em] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: c.avatarBg }}>
                            <Image src={c.avatar} alt="" fill sizes="40px" className="origin-top scale-[2.1] object-cover object-top" />
                          </span>
                          <span className="min-w-0 flex-1 leading-tight">
                            <span className="block truncate text-[0.78em] font-bold text-[#14365a]">{c.instructor}</span>
                            <span className="block truncate text-[0.65em] text-[#14365a]/65">{c.role}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-[0.3em] text-[0.7em] font-semibold text-[#14365a]">
                            <Star className="size-[1.1em] fill-[#f5b301] text-[#f5b301]" />
                            {c.rating} <span className="font-normal text-[#14365a]/60">({c.reviews})</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}