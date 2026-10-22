"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  Brain,
  ChartColumn,
  CheckCircle2,
  Code,
  Compass,
  Database,
  Hammer,
  Layers,
  ListChecks,
  MonitorPlay,
  Palette,
  PlayCircle,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";
import { CtaBand } from "@/components/Landing/CtaBand";
import { Sparkle } from "@/components/Landing/LandingDecorations";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const IMG = "/images/Landing%20Page/Home";
/** Track and lesson pages need a signed-in student (proxy.ts sends visitors to /login first). */
const COURSES = "/learner/courses";

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: BookOpen, title: tk("Explore"), text: tk("Focused lessons") },
  { icon: Hammer, title: tk("Practice"), text: tk("Learn by doing") },
  { icon: TrendingUp, title: tk("Progress"), text: tk("Keep moving forward") },
  { icon: Layers, title: tk("Build"), text: tk("Turn ideas into projects") },
];

const TRACKS: {
  slug: string;
  title: string;
  text: string;
  tags: string[];
  icon: LucideIcon;
  /** card gradient, icon tile, accent */
  bg: string;
  tile: string;
  accent: string;
}[] = [
  { slug: "ui-ux-design", title: tk("UI/UX Design"), text: tk("Design useful, clear digital experiences."), tags: [tk("User research"), tk("Wireframes"), tk("Interface design")], icon: Palette, bg: "from-[#E3F6EE] to-[#F4FBF8]", tile: "bg-white text-[#1E9D5B]", accent: "#1E9D5B" },
  { slug: "frontend", title: tk("Frontend"), text: tk("Build responsive experiences for the web."), tags: [tk("HTML"), tk("CSS"), tk("Interactive pages")], icon: Code, bg: "from-[#DCEBFB] to-[#F1F7FE]", tile: "bg-white text-[#2563EB]", accent: "#2563EB" },
  { slug: "mobile-development", title: tk("Mobile Development"), text: tk("Create thoughtful experiences for mobile devices."), tags: [tk("Mobile layouts"), tk("App flows"), tk("Interaction")], icon: Smartphone, bg: "from-[#FCEBDC] to-[#FEF7F0]", tile: "bg-white text-[#C2780C]", accent: "#C2780C" },
  { slug: "data-science", title: tk("Data Science"), text: tk("Use data to explore questions and patterns."), tags: [tk("Data thinking"), tk("Patterns"), tk("Insights")], icon: ChartColumn, bg: "from-[#FBE3E6] to-[#FEF4F5]", tile: "bg-white text-[#D1365A]", accent: "#D1365A" },
  { slug: "ai", title: tk("AI"), text: tk("Explore intelligent systems and responsible ideas."), tags: [tk("AI concepts"), tk("Models"), tk("Responsible use")], icon: Brain, bg: "from-[#EFE5FB] to-[#F8F3FE]", tile: "bg-white text-[#7C3AED]", accent: "#7C3AED" },
  { slug: "", title: tk("Backend"), text: tk("Understand the systems behind digital products."), tags: [tk("Servers"), tk("Logic"), tk("Data")], icon: Database, bg: "from-[#DBF4F1] to-[#F1FBF9]", tile: "bg-white text-[#12939b]", accent: "#12939b" },
];

const FEATURED: { slug: string; tag: string; category: string; title: string; text: string; image?: string; imageHasTag?: boolean; tint: string }[] = [
  { slug: "ui-ux-design", tag: tk("UI/UX Design"), category: tk("UI/UX DESIGN"), title: tk("Designing Your First Interface"), text: tk("Use layout, color, and hierarchy to turn an idea into a clear digital experience."), image: "/images/Landing%20Page/Courses/CourseCard.png", imageHasTag: true, tint: "from-[#FBD3E4] to-[#FDEAF2]" },
  { slug: "frontend", tag: tk("Frontend"), category: tk("FRONTEND"), title: tk("Build a Responsive Web Page"), text: tk("Discover the building blocks of the web and bring a responsive page to life."), image: "/images/Landing%20Page/Courses/CourseCard-2.png", imageHasTag: true, tint: "from-[#D6E8FB] to-[#EEF5FE]" },
  { slug: "data-science", tag: tk("Data Science"), category: tk("DATA SCIENCE"), title: tk("Introduction to Data Thinking"), text: tk("Explore how data can reveal patterns, answer questions, and support decisions."), image: "/images/Landing%20Page/Courses/Container.png", tint: "from-[#E7DCFB] to-[#F4EEFE]" },
];

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Compass, title: tk("Explore Tracks"), text: tk("Find a learning direction that matches your interests") },
  { icon: BookOpenCheck, title: tk("Discover Lessons"), text: tk("Move through focused lessons in a clear sequence") },
  { icon: MonitorPlay, title: tk("Watch & Understand"), text: tk("Learn new ideas through approachable video content") },
  { icon: PlayCircle, title: tk("Practice with Try It"), text: tk("Apply each idea through practical activities") },
  { icon: ListChecks, title: tk("Check Understanding"), text: tk("Complete quizzes and strengthen what you learned") },
  { icon: Trophy, title: tk("Follow Your Progress"), text: tk("Continue lessons and celebrate achievements") },
];

const PROGRESS: { icon: LucideIcon; title: string; text: string; tile: string }[] = [
  { icon: RotateCcw, title: tk("Continue Learning"), text: tk("Return to your next lesson without losing your place."), tile: "bg-[#DBF4F1] text-[#12939b]" },
  { icon: CheckCircle2, title: tk("See What You've Completed"), text: tk("Keep a clear view of the learning you've finished."), tile: "bg-[#EFE5FB] text-[#7C3AED]" },
  { icon: ShieldCheck, title: tk("Celebrate Achievements"), text: tk("Notice every milestone on your learning journey."), tile: "bg-[#FDEFD6] text-[#E28A00]" },
];

function trackHref(slug: string) {
  return (slug ? `${COURSES}/${slug}` : COURSES) as Route;
}

function SectionHeading({ eyebrow, title, text, link }: { eyebrow: string; title: string; text: string; link?: boolean }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-[#12939b]">{t(eyebrow)}</p>
        <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">{t(title)}</h2>
        <p className="mt-2 max-w-xl text-sm text-[#1b2a5c]/65">{t(text)}</p>
      </div>
      {link && (
        <Link href={COURSES as Route} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
          {t("View All Tracks")} <ArrowRight size={14} aria-hidden />
        </Link>
      )}
    </div>
  );
}

function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-6 py-10 lg:grid-cols-[1fr_1.05fr] lg:px-10">
        <div className="relative z-10">
          <span className="inline-flex items-center rounded-full border border-[#C6EBDD] bg-white px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#1B2A5C]/80 shadow-sm sm:text-xs">
            {t("YOUR NEXT ADVENTURE STARTS HERE")}
          </span>
          <h1 className="mt-5 text-[34px] font-bold leading-[1.12] tracking-tight text-[#1B2A5C] sm:text-[42px] lg:text-[46px]">
            {t("Discover Your Next")}
            <br />
            <span className="text-[#128B91]">{t("Learning Adventure")}</span>
          </h1>
          <p className="mt-4 max-w-[440px] text-[13px] leading-[1.65] text-[#1B2A5C]/75">
            {t("Explore learning tracks, build practical skills, and turn what you learn into real projects with Junior Hub.")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={COURSES as Route}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#128B91] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#0F777D]"
            >
              {t("Explore Courses")} <ArrowRight size={14} aria-hidden />
            </Link>
            <a
              href="#tracks"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#4A2C7A] px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span className="grid size-6 place-items-center rounded-full bg-white/20">
                <PlayCircle size={13} aria-hidden />
              </span>
              {t("Explore Learning Tracks")}
            </a>
          </div>
        </div>

        <Image
          src="/images/Landing%20Page/Courses/Two%20Junior%20Hub%20students%20ready%20to%20learn.png"
          alt={t("Two Junior Hub students ready to learn: creative lessons, practical skills and growing step by step")}
          width={795}
          height={600}
          priority
          sizes="(max-width: 1024px) 90vw, 46vw"
          className="mx-auto h-auto w-full max-w-[600px]"
        />
      </div>
    </section>
  );
}

function FeatureStrip() {
  const t = useT();
  return (
    <section className="mx-auto w-full max-w-7xl px-6 lg:px-10">
      <ul className="grid grid-cols-2 gap-y-5 rounded-[22px] bg-[#EAF9F7] px-5 py-6 sm:grid-cols-4 sm:px-6 sm:py-7">
        {FEATURES.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className={`flex items-center justify-center gap-3 ${i > 0 ? "sm:border-s sm:border-[#C7DEDF]" : ""}`}>
            <Icon size={30} strokeWidth={1.6} className="shrink-0 text-[#128B91]" aria-hidden />
            <span className="leading-tight">
              <span className="block text-base font-semibold text-[#1B2A5C]">{t(title)}</span>
              <span className="block text-[11px] text-[#1B2A5C]/70">{t(text)}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LearningTracks() {
  const t = useT();
  return (
    <section id="tracks" className="relative mx-auto w-full max-w-7xl scroll-mt-24 px-6 py-16 lg:px-10">
      <Curl className="pointer-events-none absolute end-2 top-6 hidden h-12 w-7 -rotate-12 text-[#12939b] lg:block" />
      <SectionHeading
        eyebrow={tk("EXPLORE YOUR INTERESTS")}
        title={tk("Learning Tracks")}
        text={tk("Choose a track and start building real skills with hands-on content, lessons, and projects.")}
        link
      />
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TRACKS.map((tr) => (
          <li key={tr.title}>
            <Link
              href={trackHref(tr.slug)}
              className={`group flex h-full flex-col rounded-[20px] border border-white bg-gradient-to-br p-5 shadow-[0_6px_20px_rgba(27,42,92,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(27,42,92,0.12)] ${tr.bg}`}
            >
              <div className="flex items-start justify-between">
                <span className={`grid size-11 place-items-center rounded-xl shadow-sm ${tr.tile}`}>
                  <tr.icon size={20} aria-hidden />
                </span>
                <ArrowRight size={16} className="text-[#1b2a5c]/60 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#1b2a5c]">{t(tr.title)}</h3>
              <p className="mt-1 text-xs text-[#1b2a5c]/60">{t(tr.text)}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {tr.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] text-[#1b2a5c]/75">
                    {t(tag)}
                  </span>
                ))}
              </div>
              <span className="mt-5 text-xs font-semibold" style={{ color: tr.accent }}>
                {t("Explore Track")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FeaturedCourses() {
  const t = useT();
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
      <Sparkle className="pointer-events-none absolute -start-1 top-3 hidden h-6 w-6 text-[#12939b] lg:block" />
      <SectionHeading
        eyebrow={tk("START WITH A LESSON")}
        title={tk("Featured Courses")}
        text={tk("Explore a few ways to begin learning across Junior Hub's approved technology tracks.")}
        link
      />
      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((c) => (
          <li key={c.title}>
            <Link
              href={trackHref(c.slug)}
              className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-[#E6EEF2] bg-white shadow-[0_6px_20px_rgba(27,42,92,0.06)] transition-shadow hover:shadow-[0_10px_28px_rgba(27,42,92,0.12)]"
            >
              <div className={`relative aspect-[424/184] bg-gradient-to-br ${c.tint}`}>
                {c.image ? (
                  <Image src={c.image} alt="" fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" />
                ) : (
                  <ChartColumn className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-[#7C3AED]/70" aria-hidden />
                )}
                {!c.imageHasTag && (
                  <span className="absolute bottom-3 start-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-[#1b2a5c]">
                    {t(c.tag)}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <p className="text-[10px] font-medium tracking-wide text-[#1b2a5c]/60">{t(c.category)}</p>
                <h3 className="mt-1 text-base font-semibold text-[#1b2a5c]">{t(c.title)}</h3>
                <p className="mt-3 text-xs leading-relaxed text-[#1b2a5c]/60">{t(c.text)}</p>
                <span className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-[#12939b]">
                  {t("Explore Course")} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowLearningWorks() {
  const t = useT();
  return (
    <section className="relative mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
      <Curl className="pointer-events-none absolute -start-2 -top-6 hidden h-12 w-7 rotate-90 text-[#12939b] lg:block" />
      <Sparkle className="pointer-events-none absolute end-0 top-0 hidden h-6 w-6 text-[#12939b] lg:block" />
      <div className="text-center">
        <p className="text-[11px] font-semibold tracking-wide text-[#12939b]">{t("YOUR PATH, STEP BY STEP")}</p>
        <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">{t("How Learning Works")}</h2>
        <p className="mt-2 text-sm text-[#1b2a5c]/65">{t("A clear, guided journey that helps every idea become a skill.")}</p>
      </div>
      <ol className="relative mt-8 grid grid-cols-2 gap-y-6 rounded-[22px] bg-[#EAF9F7] px-4 py-6 sm:grid-cols-3 lg:grid-cols-6">
        <span aria-hidden className="absolute start-[8%] end-[8%] top-[42px] hidden h-px bg-[#12939b]/30 lg:block" />
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title} className="relative flex flex-col items-center px-2 text-center">
            <span className="grid size-9 place-items-center rounded-full bg-[#12939b] text-white ring-4 ring-[#EAF9F7]">
              <Icon size={16} aria-hidden />
            </span>
            <span className="mt-3 text-[11px] font-semibold text-[#1b2a5c]">
              {String(i + 1).padStart(2, "0")}. {t(title)}
            </span>
            <span className="mt-1 text-[10px] leading-snug text-[#1b2a5c]/55">{t(text)}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function LearnByDoing() {
  const t = useT();
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-10">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#E4F6F3] to-[#F3FBFA] px-6 py-10 sm:px-10 lg:grid-cols-[1fr_1.1fr]">
        <Sparkle className="pointer-events-none absolute -top-2 end-6 h-6 w-6 text-[#12939b]" />
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#12939b]">{t("TURN IDEAS INTO SKILLS")}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">
            {t("Learn by")} <span className="text-[#12939b]">{t("Doing")}</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#1b2a5c]/70">
            {t("Try what you learn through guided exercises and coding practice. Make a change, see the result, and understand how each piece works.")}
          </p>
          <ul className="mt-5 grid gap-2.5">
            {[tk("Practice inside the lesson flow"), tk("Test ideas in a safe, supportive space"), tk("Build confidence one activity at a time")].map((item) => (
              <li key={item} className="flex items-center gap-2 text-xs text-[#1b2a5c]/80">
                <CheckCircle2 size={16} className="shrink-0 fill-[#12939b] text-white" aria-hidden />
                {t(item)}
              </li>
            ))}
          </ul>
          <Link
            href={COURSES as Route}
            className="mt-7 inline-flex h-10 items-center gap-2 rounded-full bg-[#128B91] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#0F777D]"
          >
            {t("Find a Course")} <ArrowRight size={14} aria-hidden />
          </Link>
        </div>

        <div dir="ltr" className="overflow-hidden rounded-2xl bg-[#1b2a5c] shadow-[0_18px_40px_rgba(27,42,92,0.25)]" aria-hidden>
          <div className="flex items-center gap-1.5 px-4 py-3">
            <span className="size-2 rounded-full bg-[#ff6b6b]" />
            <span className="size-2 rounded-full bg-[#ffd166]" />
            <span className="size-2 rounded-full bg-[#06d6a0]" />
            <span className="ms-auto text-[10px] font-semibold text-white/80">Try It</span>
          </div>
          <div className="grid grid-cols-[1.15fr_1fr]">
            <pre className="min-h-[170px] px-4 pb-6 font-mono text-[10px] leading-6 text-[#9fe0d9]">
              <span className="text-white/40">1 </span>&lt;h1&gt;Hello, Junior Hub!&lt;/h1&gt;{"\n"}
              <span className="text-white/40">2 </span>&lt;p&gt;I built this.&lt;/p&gt;{"\n"}
              <span className="text-white/40">3 </span>button {"{"} color: teal; {"}"}
            </pre>
            <div className="m-2 rounded-xl bg-white p-4">
              <p className="text-[9px] font-semibold tracking-wide text-[#1b2a5c]/50">RESULT</p>
              <p className="mt-4 text-base font-bold text-[#1b2a5c]">Hello, Junior Hub!</p>
              <p className="mt-1 text-[10px] text-[#1b2a5c]/60">I built this.</p>
              <span className="mt-3 inline-flex rounded-full bg-[#12939b] px-3 py-1.5 text-[10px] font-semibold text-white">Keep exploring</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrackYourProgress() {
  const t = useT();
  return (
    <section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 pb-16 lg:grid-cols-2 lg:px-10">
      <div className="relative">
        <Image
          src={`${IMG}/flat-color-icons_idea.png`}
          alt=""
          width={105}
          height={105}
          className="pointer-events-none mx-auto mb-2 w-14"
          aria-hidden
        />
        <Image
          src={`${IMG}/student.png`}
          alt={t("A student working on a laptop")}
          width={762}
          height={603}
          sizes="(max-width: 1024px) 90vw, 36vw"
          className="mx-auto h-auto w-full max-w-[460px]"
        />
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide text-[#12939b]">{t("KEEP YOUR MOMENTUM")}</p>
        <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">
          {t("Track Your")} <span className="text-[#12939b]">{t("Progress")}</span>
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#1b2a5c]/70">
          {t("Pick up where you left off, follow completed lessons, and recognize each achievement as your skills grow.")}
        </p>
        <ul className="mt-6 grid gap-4">
          {PROGRESS.map(({ icon: Icon, title, text, tile }) => (
            <li key={title} className="flex items-center gap-3">
              <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tile}`}>
                <Icon size={18} aria-hidden />
              </span>
              <span className="leading-tight">
                <span className="block text-xs font-semibold text-[#1b2a5c]">{t(title)}</span>
                <span className="mt-0.5 block text-[11px] text-[#1b2a5c]/55">{t(text)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The public Courses page (Figma "Courses"): what learning on Junior Hub looks like, for visitors and students. */
export function CoursesLanding() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <LearningTracks />
      <FeaturedCourses />
      <HowLearningWorks />
      <LearnByDoing />
      <TrackYourProgress />
      <CtaBand />
    </>
  );
}
