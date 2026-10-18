"use client";

import { useMemo, useRef, useState, type ComponentType } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BarChart3,
  Brain,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  Monitor,
  Palette,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  BookOpen,
  Users,
} from "lucide-react";
import {
  COURSE_CATEGORIES,
  FEATURED_COURSES,
  INSTRUCTORS,
  TRACK_CARDS,
  type CourseCategory,
  type CourseLevel,
  type CourseTheme,
  type TrackIcon,
} from "@/lib/data/courses";
import { TRACK_COLORS } from "@/components/Landing/colors";
import { cn } from "@/lib/utils";

type IconType = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

const CATEGORY_ICONS: Record<"all" | CourseCategory, IconType> = {
  all: LayoutGrid,
  "ui-ux": Palette,
  frontend: Monitor,
  backend: Server,
  mobile: Smartphone,
  data: BarChart3,
  qa: ShieldCheck,
  product: Briefcase,
};

const TRACK_ICONS: Record<TrackIcon, IconType> = {
  palette: Palette,
  monitor: Monitor,
  smartphone: Smartphone,
  chart: BarChart3,
  brain: Brain,
};

const THEMES: Record<CourseTheme, { bg: string; accent: string; tag: string }> = {
  pink: { bg: "bg-[#FDE4EE]", accent: "text-[#D1365A]", tag: "bg-[#fbc9dc] text-[#b02a4c]" },
  blue: { bg: "bg-[#DCEBFB]", accent: "text-[#2563EB]", tag: "bg-[#bcd6f7] text-[#1d4fb8]" },
  mint: { bg: "bg-[#DDF3EF]", accent: "text-[#12939b]", tag: "bg-[#bfe8e0] text-[#0f7a81]" },
};

/** Illustrations from the Figma (public/images/Intern); the mint card has none yet. */
const FEATURED_ART: Partial<Record<"pink" | "blue" | "mint", string>> = {
  pink: "/images/Intern/image%2036.png",
  blue: "/images/Intern/image%2037.png",
};

function formatStudents(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
}

const selectClass =
  "rounded-lg border border-[#dfe7e5] bg-white px-3 py-2 text-xs font-medium text-[#1b2a5c] outline-none focus:border-[#12939b]";

export function CourseCatalog() {
  const [category, setCategory] = useState<"all" | CourseCategory>("all");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | CourseLevel>("all");
  const [duration, setDuration] = useState<"any" | "short" | "long">("any");
  const [instructor, setInstructor] = useState<"all" | (typeof INSTRUCTORS)[number]>("all");
  const [sort, setSort] = useState<"popular" | "shortest">("popular");
  const carouselRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (item: { title: string; category: CourseCategory; level: CourseLevel; hours: number; instructor: string }) =>
      (category === "all" || item.category === category) &&
      (!q || item.title.toLowerCase().includes(q)) &&
      (level === "all" || item.level === level) &&
      (duration === "any" || (duration === "short" ? item.hours < 16 : item.hours >= 16)) &&
      (instructor === "all" || item.instructor === instructor);
  }, [category, query, level, duration, instructor]);

  const sorter = <T extends { students: number; hours: number }>(a: T, b: T) =>
    sort === "popular" ? b.students - a.students : a.hours - b.hours;

  const featured = FEATURED_COURSES.filter(matches).sort(sorter);
  const tracks = TRACK_CARDS.filter(matches).sort(sorter);

  function scrollCarousel(dir: 1 | -1) {
    carouselRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      {/* Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#E9F7F4] to-[#bfece5] px-6 py-7">
        <h1 className="text-2xl font-bold text-[#1b2a5c]">Courses</h1>
        <p className="mt-1 text-sm text-[#1b2a5c]/70">Ready to learn something new today?</p>
        <span aria-hidden className="absolute -right-6 -top-6 size-32 rounded-full bg-white/40" />
        <span aria-hidden className="absolute bottom-3 right-24 size-8 rounded-full bg-[#12939b]/20" />
      </section>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Course categories">
        {COURSE_CATEGORIES.map((c) => {
          const Icon = CATEGORY_ICONS[c.id];
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                active ? "border-[#12939b] bg-[#12939b] text-white" : "border-[#dfe7e5] bg-white text-[#1b2a5c] hover:border-[#12939b]"
              )}
            >
              <Icon size={14} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-[#dfe7e5] bg-white px-3 py-2 focus-within:border-[#12939b]">
          <Search aria-hidden size={14} className="text-[#1b2a5c]/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything…"
            aria-label="Search courses"
            className="w-full bg-transparent text-xs text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40"
          />
        </label>
        <select aria-label="Level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className={selectClass}>
          <option value="all">Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
        </select>
        <select aria-label="Duration" value={duration} onChange={(e) => setDuration(e.target.value as typeof duration)} className={selectClass}>
          <option value="any">Duration</option>
          <option value="short">Under 16 hours</option>
          <option value="long">16 hours or more</option>
        </select>
        <select aria-label="Instructor" value={instructor} onChange={(e) => setInstructor(e.target.value as typeof instructor)} className={selectClass}>
          <option value="all">Instructor</option>
          {INSTRUCTORS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <label className="ml-auto flex items-center gap-2 text-xs text-[#1b2a5c]/70">
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className={selectClass}>
            <option value="popular">Most Popular</option>
            <option value="shortest">Shortest first</option>
          </select>
        </label>
      </div>

      {featured.length === 0 && tracks.length === 0 && (
        <p className="rounded-2xl border border-dashed border-[#cfd5d4] p-10 text-center text-sm text-[#1b2a5c]/70">
          No courses match these filters.
        </p>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section aria-labelledby="featured-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="featured-heading" className="text-base font-bold text-[#1b2a5c]">
              Featured Courses
            </h2>
            <div className="flex gap-1">
              <button type="button" onClick={() => scrollCarousel(-1)} aria-label="Scroll left" className="grid size-7 place-items-center rounded-md border border-[#dfe7e5] bg-white text-[#1b2a5c] hover:bg-[#E9F7F4]">
                <ChevronLeft size={14} />
              </button>
              <button type="button" onClick={() => scrollCarousel(1)} aria-label="Scroll right" className="grid size-7 place-items-center rounded-md border border-[#dfe7e5] bg-white text-[#1b2a5c] hover:bg-[#E9F7F4]">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div ref={carouselRef} className="flex snap-x gap-4 overflow-x-auto pb-2">
            {featured.map((course) => {
              const theme = THEMES[course.theme];
              return (
                <Link
                  key={course.id}
                  href={`/learner/courses/${course.trackSlug}` as Route}
                  className={cn("flex min-h-44 w-[min(100%,420px)] shrink-0 snap-start gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md", theme.bg)}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className={cn("w-fit rounded-md px-2 py-0.5 text-[10px] font-semibold", theme.tag)}>{course.tag}</span>
                    <h3 className="mt-2 text-base font-bold text-[#1b2a5c]">{course.title}</h3>
                    <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#1b2a5c]/70">{course.description}</p>
                    <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[10px] font-medium text-[#1b2a5c]/70">
                      <span className="flex items-center gap-1"><Clock aria-hidden size={11} /> {course.hours} Hours</span>
                      <span className="flex items-center gap-1"><BookOpen aria-hidden size={11} /> {course.lessons} Lessons</span>
                      <span className="flex items-center gap-1"><Users aria-hidden size={11} /> {formatStudents(course.students)} students</span>
                    </p>
                  </div>
                  {FEATURED_ART[course.theme] ? (
                    <Image
                      src={FEATURED_ART[course.theme]!}
                      alt=""
                      width={245}
                      height={180}
                      className="hidden w-36 shrink-0 self-center object-contain sm:block"
                    />
                  ) : (
                    <span aria-hidden className={cn("hidden size-24 shrink-0 place-items-center self-center rounded-2xl bg-white/70 sm:grid", theme.accent)}>
                      <Monitor size={40} strokeWidth={1.5} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* All courses */}
      {tracks.length > 0 && (
        <section aria-labelledby="all-heading">
          <h2 id="all-heading" className="mb-3 text-base font-bold text-[#1b2a5c]">
            All Courses
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tracks.map((track) => {
              const Icon = TRACK_ICONS[track.icon];
              const color = TRACK_COLORS[track.color];
              return (
                <Link
                  key={track.slug}
                  href={`/learner/courses/${track.slug}` as Route}
                  style={{ backgroundColor: color.bg }}
                  className="flex flex-col items-center rounded-2xl p-5 text-center transition-shadow hover:shadow-md"
                >
                  <span aria-hidden style={{ color: color.icon }} className="mt-2">
                    <Icon size={34} strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-4 text-sm font-bold text-[#1b2a5c]">{track.title}</h3>
                  <p className="mt-0.5 text-xs text-[#1b2a5c]/70">{track.subtitle}</p>
                  <span className="mt-4 grid size-7 place-items-center rounded-full bg-white text-[#1b2a5c] shadow-sm">
                    <ArrowRight aria-hidden size={14} />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
