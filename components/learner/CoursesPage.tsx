"use client";

import { useRef, useState, type ComponentType, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Briefcase,
  ChevronDown,
  Clock,
  LayoutGrid,
  Monitor,
  Palette,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { trackPath } from "@/lib/learning-api";

const IMG = "/images/Intern";

type Icon = ComponentType<{ className?: string; style?: CSSProperties }>;

const CATEGORIES: { id: string; label: string; icon: Icon; color: string }[] = [
  { id: "all", label: "All", icon: LayoutGrid, color: "#14365a" },
  { id: "uiux", label: "UI/UX", icon: Palette, color: "#2fb36b" },
  { id: "frontend", label: "Frontend", icon: Monitor, color: "#3b82c4" },
  { id: "backend", label: "Backend", icon: Server, color: "#12939b" },
  { id: "mobile", label: "Mobile", icon: Smartphone, color: "#d9822b" },
  { id: "data", label: "Data analysis", icon: BarChart3, color: "#c0392b" },
  { id: "qa", label: "Quality Assurance", icon: ShieldCheck, color: "#2fb36b" },
  { id: "pm", label: "Product Management", icon: Briefcase, color: "#3b82c4" },
];

const FEATURED: {
  cat: string;
  tag: string;
  tagBg: string;
  tagText: string;
  title: string;
  desc: string;
  hours: number;
  lessons: number;
  students: string;
  bg: string;
  img: string;
}[] = [
  {
    cat: "uiux",
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
    cat: "data",
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
    cat: "frontend",
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

const COURSES: { cat: string; title: string; sub: string; bg: string; icon: Icon; color: string }[] = [
  { cat: "uiux", title: "UI/UX Design", sub: "Design Digital Experiance", bg: "#e6f5ec", icon: Palette, color: "#2fb36b" },
  { cat: "frontend", title: "Frontend", sub: "Web Development", bg: "#e4f1fb", icon: Monitor, color: "#3b82c4" },
  { cat: "mobile", title: "Mobile Development", sub: "Create Mobile Apps", bg: "#fbefe4", icon: Smartphone, color: "#d9822b" },
  { cat: "data", title: "Data Science", sub: "& Data analysis", bg: "#f8e6e6", icon: BarChart3, color: "#c0392b" },
  { cat: "data", title: "AI", sub: "Explore Intelligent systems", bg: "#f1e6fb", icon: BrainCircuit, color: "#9b4fd6" },
  { cat: "backend", title: "Backend", sub: "APIs & Databases", bg: "#e0f4f4", icon: Server, color: "#12939b" },
  { cat: "qa", title: "Quality Assurance", sub: "Testing & Automation", bg: "#e6f5ec", icon: ShieldCheck, color: "#2fb36b" },
  { cat: "pm", title: "Product Management", sub: "Plan & Ship Products", bg: "#e4f1fb", icon: Briefcase, color: "#3b82c4" },
];

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

const AVATARS = [
  { src: `${IMG}/char-boy-glasses.png`, bg: "#ffc531" },
  { src: `${IMG}/char-girl.png`, bg: "#ff9a62" },
  { src: `${IMG}/char-boy-glasses-2.png`, bg: "#5aa9e6" },
  { src: `${IMG}/char-girl.png`, bg: "#3fc9b0" },
];

const card = "rounded-[1.4em] border border-[#e8eef5] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";
const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function ArrowPair({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const btn =
    "grid h-[1.7em] w-[1.7em] place-items-center rounded-[0.4em] border border-[#14365a]/60 text-[#14365a] hover:bg-[#14365a] hover:text-white";
  return (
    <div className="flex gap-[0.4em]">
      <button type="button" onClick={onPrev} aria-label="Previous" className={btn}>
        <ArrowLeft className="h-[1em] w-[1em]" />
      </button>
      <button type="button" onClick={onNext} aria-label="Next" className={btn}>
        <ArrowRight className="h-[1em] w-[1em]" />
      </button>
    </div>
  );
}

/** The Figma banner (sparkles, blobs and the boy), shared with AI Curriculum. */
function Banner() {
  return (
    <div className="relative aspect-[751/121] w-full min-w-0 lg:ml-auto lg:w-[54%]">
      <Image
        src="/images/Intern/AI%20Curriculum/Group%20189.png"
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 90vw, 50vw"
        className="object-cover object-right"
      />
    </div>
  );
}

export default function CoursesPage() {
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");
  const featuredRef = useRef<HTMLDivElement>(null);
  const allRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const q = query.trim().toLowerCase();
  const featured = FEATURED.filter((c) => cat === "all" || c.cat === cat);
  const courses = COURSES.filter(
    (c) => (cat === "all" || c.cat === cat) && (!q || `${c.title} ${c.sub}`.toLowerCase().includes(q)),
  );

  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      {/* Desktop: a column that fills the window; the bottom part shrinks to fit */}
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:flex lg:flex-col lg:overflow-hidden lg:pb-[calc(var(--u)*1.6)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* ---------- Title + banner ---------- */}
        <section className="flex flex-col gap-[0.8em] lg:shrink-0 lg:flex-row lg:items-center">
          <div className="shrink-0">
            <h1 className="text-[2.3em] font-extrabold leading-tight text-[#14365a]">Courses</h1>
            <p className="text-[0.95em] text-[#14365a]">Ready to learn new something today?</p>
          </div>
          <Banner />
        </section>

        {/* ---------- Categories ---------- */}
        <nav
          aria-label="Course categories"
          className={`${card} mt-[0.9em] flex gap-[0.6em] overflow-x-auto p-[0.6em] lg:shrink-0 ${noScrollbar}`}
        >
          {CATEGORIES.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={active}
                className={`flex shrink-0 items-center gap-[0.5em] rounded-[0.8em] px-[1em] py-[0.5em] text-[0.9em] font-semibold transition-colors ${
                  active ? "bg-[#1d5f73] text-white" : "text-[#14365a] hover:bg-[#eef4fa]"
                }`}
              >
                <c.icon className="h-[1.2em] w-[1.2em]" style={{ color: active ? "#fff" : c.color }} />
                {c.label}
              </button>
            );
          })}
        </nav>

        {/* ---------- Search + filters ---------- */}
        <div className="mt-[0.8em] flex flex-wrap items-center gap-[0.7em] lg:shrink-0">
          <label className="relative min-w-[14em] flex-1">
            <Search className="pointer-events-none absolute left-[1em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]/55" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything..."
              className="h-[2.6em] w-full rounded-[0.9em] border border-[#e1e8f0] bg-white pl-[2.8em] pr-[1em] text-[0.9em] text-[#14365a] outline-none placeholder:text-[#14365a]/45 focus:ring-2 focus:ring-[#12939b]/30"
            />
          </label>

          {["Level", "Duration", "Instructor"].map((f) => (
            <button
              key={f}
              type="button"
              className="flex h-[2.6em] items-center gap-[0.8em] rounded-[0.9em] border border-[#e1e8f0] bg-white px-[1.1em] text-[0.9em] font-medium text-[#14365a]"
            >
              {f} <ChevronDown className="h-[1em] w-[1em]" />
            </button>
          ))}

          <div className="ml-auto flex items-center gap-[0.6em] text-[0.9em] text-[#14365a]">
            Sort by
            <button
              type="button"
              className="flex h-[2.6em] items-center gap-[0.8em] rounded-[0.9em] border border-[#e1e8f0] bg-white px-[1.1em] font-medium"
            >
              Most Popular <ChevronDown className="h-[1em] w-[1em]" />
            </button>
          </div>
        </div>

        {/* ---------- Bottom part: shrinks to fit the remaining height ---------- */}
        <div className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          {/* Featured */}
          <section className="mt-[1.6em] lg:mt-[1.2em] lg:flex lg:min-h-0 lg:flex-[1.15] lg:flex-col">
            <div className="mb-[0.7em] flex items-center lg:shrink-0">
              <h2 className="text-[1.3em] font-extrabold text-[#14365a]">Featured Courses</h2>
              <div className="ml-auto">
                <ArrowPair onPrev={() => scroll(featuredRef, -1)} onNext={() => scroll(featuredRef, 1)} />
              </div>
            </div>

            <div
              ref={featuredRef}
              className={`flex gap-[1em] overflow-x-auto pb-[0.5em] lg:min-h-0 lg:flex-1 lg:pb-0 ${noScrollbar}`}
            >
              {featured.length === 0 && <p className="text-[0.9em] text-[#14365a]/60">No featured courses here yet.</p>}
              {featured.map((c) => (
                <article
                  key={c.title}
                  className="relative aspect-[282/150] w-[min(92%,32em)] shrink-0 overflow-hidden rounded-[1.6rem] [container-type:inline-size] lg:h-full lg:w-auto"
                  style={{ background: c.bg }}
                >
                  {trackHref(c.title) && (
                    <Link href={trackHref(c.title)!} aria-label={`Open ${c.title}`} className="absolute inset-0 z-20 rounded-[1.6rem]" />
                  )}
                  {/* Everything inside scales with the card width (like the Figma) */}
                  <div className="relative h-full w-full p-[1.1em]" style={{ fontSize: "calc(100cqw / 28)" }}>
                    {/* Illustration: right half, its left edge fades into the card */}
                    <div className="absolute right-0 top-0 h-full w-[58%] [mask-image:linear-gradient(to_right,transparent,black_28%)]">
                      <Image src={c.img} alt="" fill sizes="400px" className="object-cover object-right" />
                    </div>

                    <div className="relative z-10 flex h-full w-[52%] flex-col">
                      <span
                        className="w-fit rounded-full px-[0.8em] py-[0.2em] text-[0.7em] font-bold"
                        style={{ backgroundColor: c.tagBg, color: c.tagText }}
                      >
                        {c.tag}
                      </span>
                      <h3 className="mt-[0.6em] text-[1.25em] font-extrabold leading-tight text-[#14365a]">{c.title}</h3>
                      <p className="mt-[0.4em] line-clamp-3 text-[0.75em] leading-snug text-[#14365a]/75">{c.desc}</p>

                      <div className="mt-auto">
                        <div className="flex items-center gap-[1em] whitespace-nowrap text-[0.75em] font-medium text-[#14365a]">
                          <span className="flex items-center gap-[0.4em]">
                            <Clock className="h-[1.1em] w-[1.1em]" /> {c.hours} Hours
                          </span>
                          <span className="flex items-center gap-[0.4em]">
                            <BookOpen className="h-[1.1em] w-[1.1em]" /> {c.lessons} Lessons
                          </span>
                        </div>
                        <div className="mt-[0.6em] flex items-center whitespace-nowrap">
                          <ul className="flex">
                            {AVATARS.map((a, i) => (
                              <li
                                key={i}
                                className="relative -ml-[0.6em] h-[2em] w-[2em] overflow-hidden rounded-full ring-2 ring-white first:ml-0"
                                style={{ backgroundColor: a.bg }}
                              >
                                <Image
                                  src={a.src}
                                  alt=""
                                  fill
                                  sizes="40px"
                                  className="origin-top scale-[2.1] object-cover object-top"
                                />
                              </li>
                            ))}
                          </ul>
                          <span className="ml-[0.6em] text-[0.7em] font-medium text-[#14365a]/75">
                            +{c.students} students
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* All courses */}
          <section className="mt-[1.6em] lg:mt-[1.2em] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
            <div className="mb-[0.7em] flex items-center lg:shrink-0">
              <h2 className="text-[1.3em] font-extrabold text-[#14365a]">All Courses</h2>
              <div className="ml-auto">
                <ArrowPair onPrev={() => scroll(allRef, -1)} onNext={() => scroll(allRef, 1)} />
              </div>
            </div>

            <div
              ref={allRef}
              className={`flex gap-[1em] overflow-x-auto pb-[0.5em] lg:min-h-0 lg:flex-1 lg:pb-0 ${noScrollbar}`}
            >
              {courses.length === 0 && <p className="text-[0.9em] text-[#14365a]/60">No courses match your search.</p>}
              {courses.map((c) => (
                <article
                  key={c.title}
                  className="aspect-[133/150] w-[11em] shrink-0 overflow-hidden rounded-[1.4rem] [container-type:inline-size] lg:h-full lg:w-auto"
                  style={{ backgroundColor: c.bg }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center p-[1em] text-center"
                    style={{ fontSize: "calc(100cqw / 12)" }}
                  >
                    <c.icon className="mt-[0.8em] h-[3.4em] w-[3.4em]" style={{ color: c.color }} />
                    <h3 className="mt-[0.7em] text-[0.95em] font-extrabold leading-tight text-[#14365a]">{c.title}</h3>
                    <p className="mt-[0.2em] text-[0.8em] leading-snug text-[#14365a]/80">{c.sub}</p>
                    {trackHref(c.title) ? (
                      <Link
                        href={trackHref(c.title)!}
                        aria-label={`Open ${c.title}`}
                        className="mt-auto grid h-[2em] w-[2em] place-items-center rounded-full border-2 border-[#14365a] text-[#14365a] hover:bg-[#14365a] hover:text-white"
                      >
                        <ArrowRight className="h-[1em] w-[1em]" />
                      </Link>
                    ) : (
                      <span
                        title="Coming soon"
                        className="mt-auto grid h-[2em] w-[2em] place-items-center rounded-full border-2 border-[#14365a]/30 text-[#14365a]/40"
                      >
                        <ArrowRight className="h-[1em] w-[1em]" />
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}