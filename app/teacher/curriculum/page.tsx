"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Accessibility,
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  Copy,
  FilePlus,
  FolderOpen,
  Layers,
  Network,
  Palette,
  Pencil,
  PenTool,
  Play,
  Plus,
  Radio,
  SlidersHorizontal,
  Sparkles,
  Timer,
  TrendingUp,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

function useTr() {
  const { t } = useI18n();
  return (s: string) => (/[A-Za-z]/.test(s) ? t(s) : s);
}

function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}


type LessonStatus = "Published" | "In Review" | "Draft";
type TreeLevel = "Medium" | "Advanced" | "Applied";
type ChallengeLevel = "Intermediate" | "Advanced" | "Applied";

const LESSON_STATUS_STYLE: Record<LessonStatus, string> = {
  Published: "bg-[#e6e9eb] text-[#1B2D54]/70",
  "In Review": "bg-[#0b6b70] text-white",
  Draft: "bg-[#e6e9eb] text-[#1B2D54]/60",
};

const TREE_LEVEL_STYLE: Record<TreeLevel, string> = {
  Medium: "text-[#0b6b70]",
  Advanced: "text-[#14243f]",
  Applied: "text-[#1B2D54]/60",
};

const CHALLENGE_LEVEL_STYLE: Record<ChallengeLevel, string> = {
  Intermediate: "bg-[#bff3f3] text-[#0b6b70]",
  Advanced: "bg-[#e3e7ff] text-[#2d3a8c]",
  Applied: "bg-[#e3e7e9] text-[#1B2D54]/70",
};

const CHALLENGE_NUMBER_STYLE = [
  "bg-[#0b6b70] text-white",
  "bg-[#14243f] text-white",
  "bg-[#e3e7e9] text-[#1B2D54]/70",
];

const VIDEO_POSTER = "/images/teacher/curriculum/lesson-video.png";

const TRACK = {
  tag: "Fall 2024 Track",
  title: "UI/UX Product Design & Track Management",
  text: "Curate skill sequence, interactive matrices, and apprentice readiness for professional product design roles.",
  units: 4,
  mastery: 74,
  version: "v2.4.0",
};

const LESSONS: {
  id: string;
  label: string;
  title: string;
  heading: string;
  status: LessonStatus;
  challenges?: { title: string; level: TreeLevel }[];
}[] = [
  { id: "l31", label: "Unit 03 / Lesson 3.1", title: "Lesson 3.1: Mental Models & Atomic Design Principles", heading: "Mental Models & Atomic Design Principles", status: "Published" },
  { id: "l32", label: "Unit 03 / Lesson 3.2", title: "Lesson 3.2: Building Responsive Components with Auto Layout", heading: "Building Responsive Components with Auto Layout", status: "Published" },
  {
    id: "l33",
    label: "Unit 03 / Lesson 3.3",
    title: "Lesson 3.3: Interactive Variants & Micro-interactions in Figma",
    heading: "Interactive Variants & Micro-interactions in Figma",
    status: "In Review",
    challenges: [
      { title: "Challenge 1: Button Variant Matrix", level: "Medium" },
      { title: "Challenge 2: Responsive Navigation Bar", level: "Advanced" },
      { title: "Challenge 3: Mobile Fintech Interaction", level: "Applied" },
    ],
  },
  { id: "l34", label: "Unit 03 / Lesson 3.4", title: "Lesson 3.4: WCAG AA Color Accessibility & Design Tokens", heading: "WCAG AA Color Accessibility & Design Tokens", status: "Draft" },
];

const UNITS: {
  id: string;
  number: number;
  title: string;
  meta: string;
  kind: "done" | "active" | "upcoming";
}[] = [
  { id: "u1", number: 1, title: "Unit 01: Foundations of User Experience & User Research", meta: "4 lessons • 8 research exercises", kind: "done" },
  { id: "u2", number: 2, title: "Unit 02: Information Architecture & Wireframing", meta: "5 lessons • 10 interactive models", kind: "done" },
  { id: "u3", number: 3, title: "Unit 03: Auto Layout & Design Systems", meta: "Week 4 of 6 • 4 lessons • 7 design challenges", kind: "active" },
  { id: "u4", number: 4, title: "Unit 04: Usability Testing & Experience Evaluation", meta: "3 lessons • 4 live testing sessions", kind: "upcoming" },
];

const SUBMISSIONS = [
  { cohort: "Cohort Riyadh 9A", done: 24, total: 28, onTime: 85 },
  { cohort: "Cohort Jeddah 9B", done: 21, total: 26, onTime: 80 },
];

const DETAILS: Record<
  string,
  {
    competencies: { icon: ReactNode; title: string; text: string }[];
    duration: string;
    challenges: { title: string; level: ChallengeLevel; text: string; mins: number; pts: number }[];
  }
> = {
  l33: {
    competencies: [
      { icon: <Network aria-hidden className="size-3.5" />, title: "Nested Architecture", text: "Multi-level variant structure with instant property swap." },
      { icon: <Accessibility aria-hidden className="size-3.5" />, title: "Accessibility Standards", text: "Visual focus and pressed state styling compliant with WCAGAA." },
      { icon: <Sparkles aria-hidden className="size-3.5" />, title: "Motion Physics", text: "Spring physics curves calibrated via Smart Animate for realistic motion feel." },
    ],
    duration: "18:45",
    challenges: [
      {
        title: "Button Variant Matrix",
        level: "Intermediate",
        text: "Build a complete 4-size, 5-state interactive button system (Default, Hover, Pressed, Focused, Disabled) with leading/trailing icon swap.",
        mins: 45,
        pts: 15,
      },
      {
        title: "Responsive Navigation Bar",
        level: "Advanced",
        text: "Mobile-to-desktop adaptive navigation using Auto Layout Hug & Fill with animated dropdown.",
        mins: 60,
        pts: 25,
      },
      {
        title: "Mobile Fintech Flow Micro-interaction",
        level: "Applied",
        text: "Interactive money transfer simulation with 3D haptic card flip and transaction confirmation loop.",
        mins: 90,
        pts: 40,
      },
    ],
  },
};


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold", className)}>
      {children}
    </span>
  );
}

type ButtonTone = "teal" | "navy" | "gray" | "outline";

const BUTTON_TONE: Record<ButtonTone, string> = {
  teal: "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
  navy: "bg-[#14243f] text-white hover:bg-[#0e1a2e]",
  gray: "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]",
  outline: "border border-[#e3ece9] bg-white text-[#14243f] hover:bg-[#f6f9f8]",
};

function ActionButton({ tone, icon, children }: { tone: ButtonTone; icon?: ReactNode; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
        BUTTON_TONE[tone]
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function LessonDot({ status, selected }: { status: LessonStatus; selected: boolean }) {
  if (selected && status === "In Review") {
    return <span aria-hidden className="mt-0.5 size-2 shrink-0 rounded-full bg-[#0b6b70]" />;
  }
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border-2",
        status === "Draft" ? "border-[#1B2D54]/40" : "border-[#1B2D54]/60"
      )}
    >
      {status !== "Draft" && <span className="size-1.5 rounded-full bg-[#1B2D54]/60" />}
    </span>
  );
}


export default function CurriculumPage() {
  const { t } = useI18n();
  const tr = useTr();
  const [openUnit, setOpenUnit] = useState<string | null>("u3");
  const [lessonId, setLessonId] = useState("l33");

  const lesson = LESSONS.find((l) => l.id === lessonId) ?? LESSONS[2];
  const detail = DETAILS[lesson.id];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image
          src="/images/learner/projects/background.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
      </div>

      <header className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 ps-3">
          <p className="inline-flex items-center rounded-full bg-[#0b6b70] px-2.5 py-1 text-[9px] font-semibold text-white">
            {tr(TRACK.tag)}
          </p>
          <h1 className="mt-2 max-w-[26rem] text-2xl font-bold leading-tight">{tr(TRACK.title)}</h1>
          <p className="mt-2 max-w-[32rem] text-xs leading-relaxed text-[#1B2D54]/75">{tr(TRACK.text)}</p>
        </div>

        <div className="grid shrink-0 grid-cols-2 items-stretch gap-3">
          <div className="flex min-w-[10.5rem] items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#e3ece9]">
            <Layers aria-hidden className="size-4 shrink-0 text-[#1B2D54]" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-bold">
                <Ltr>{TRACK.units}</Ltr> {tr("Units")}
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#1B2D54]/60">{tr("Integrated Curriculum")}</p>
            </div>
          </div>

          <div className="flex min-w-[10.5rem] items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#e3ece9]">
            <TrendingUp aria-hidden className="size-4 shrink-0 text-[#1B2D54] rtl:-scale-x-100" />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-bold">
                <Ltr>{TRACK.mastery}%</Ltr>
              </p>
              <p className="mt-0.5 text-[10px] leading-snug text-[#1B2D54]/60">{tr("Overall Track Mastery")}</p>
            </div>
          </div>
        </div>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Network aria-hidden className="size-4 text-[#0b6b70]" />
          <h2 className="text-xs font-semibold">{tr("Curriculum Repository")}</h2>
          <Pill className="bg-[#eef0f2] text-[#1B2D54]/60">
            <Ltr>{TRACK.version}</Ltr>
          </Pill>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton tone="teal" icon={<Plus aria-hidden className="size-3.5" />}>
            {tr("Add Unit")}
          </ActionButton>
          <ActionButton tone="gray" icon={<FilePlus aria-hidden className="size-3.5" />}>
            {tr("Add Practical Exercise")}
          </ActionButton>
          <ActionButton tone="navy" icon={<PenTool aria-hidden className="size-3.5" />}>
            {tr("Create Design Challenge")}
          </ActionButton>
        </div>
      </Card>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="flex items-center gap-2 text-xs font-semibold leading-tight">
                <Network aria-hidden className="size-4 shrink-0 text-[#0b6b70]" />
                {tr("Modules & Lessons Structure")}
              </h2>
              <span className="max-w-[5.5rem] shrink-0 text-end text-[9px] leading-tight text-[#1B2D54]/60">
                {t("Showing {n} of {total} Units", { n: UNITS.length, total: UNITS.length })}
              </span>
            </div>

            <ul className="mt-3 flex flex-col gap-2">
              {UNITS.map((u) => {
                const expandable = u.id === "u3"; 
                const open = expandable && openUnit === u.id;
                const active = u.kind === "active";

                return (
                  <li key={u.id}>
                    <div className={cn("overflow-hidden rounded-xl", active ? "bg-white shadow-sm ring-1 ring-[#e3ece9]" : "bg-[#f1f4f4]", u.kind === "upcoming" && "opacity-60")}>
                      {/* Unit header */}
                      <button
                        type="button"
                        disabled={!expandable}
                        onClick={() => setOpenUnit(open ? null : u.id)}
                        aria-expanded={expandable ? open : undefined}
                        aria-label={expandable ? tr(open ? "Collapse unit" : "Expand unit") : undefined}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2.5 text-start",
                          active && "bg-[#0b6b70] text-white",
                          !expandable && "cursor-default"
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                            u.kind === "done" && "bg-[#bff3f3] text-[#0b6b70]",
                            active && "bg-white text-[#0b6b70]",
                            u.kind === "upcoming" && "rounded-md bg-[#dde2e4] text-[#1B2D54]/60"
                          )}
                        >
                          <Ltr>{u.number}</Ltr>
                        </span>

                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="text-[11px] font-semibold">{tr(u.title)}</p>
                          <p className={cn("mt-1 text-[9px]", active ? "text-white/80" : "text-[#1B2D54]/60")}>{tr(u.meta)}</p>
                        </div>

                        {u.kind === "done" && (
                          <Pill className="flex items-center gap-1.5 bg-[#e3e7e9] px-2.5 py-1 text-[10px] font-bold text-[#0b6b70]">
                            <CircleCheck aria-hidden className="size-3.5" />
                            {tr("100% Completed")}
                          </Pill>
                        )}
                        {active && (
                          <>
                            <Pill className="bg-white text-[#0b6b70]">{tr("Active Sprint")}</Pill>
                            <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")} />
                          </>
                        )}
                        {u.kind === "upcoming" && <Pill className="bg-white text-[#1B2D54]/60">{tr("Upcoming")}</Pill>}
                      </button>

                      {/* Lessons */}
                      {open && (
                        <ul className="flex flex-col gap-1 bg-white p-2">
                          {LESSONS.map((l) => {
                            const selected = l.id === lessonId;
                            return (
                              <li key={l.id}>
                                <button
                                  type="button"
                                  onClick={() => setLessonId(l.id)}
                                  aria-pressed={selected}
                                  className={cn(
                                    "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-start transition-colors",
                                    selected ? "bg-white shadow-sm ring-1 ring-[#e3ece9]" : "hover:bg-[#f6f9f8]"
                                  )}
                                >
                                  <LessonDot status={l.status} selected={selected} />
                                  <span className={cn("min-w-0 flex-1 text-[10px] leading-snug", selected ? "font-bold text-[#14243f]" : "font-medium")}>
                                    {tr(l.title)}
                                  </span>
                                  <Pill className={LESSON_STATUS_STYLE[l.status]}>{tr(l.status)}</Pill>
                                </button>

                                {/* Challenges of the selected lesson */}
                                {selected && l.challenges && (
                                  <ul className="mx-1 mt-1 flex flex-col gap-2 rounded-lg bg-[#f1f4f4] p-3">
                                    {l.challenges.map((c) => (
                                      <li key={c.title} className="flex items-start gap-2">
                                        <CircleCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#0b6b70]" />
                                        <span className="min-w-0 flex-1 text-[9px] leading-snug">{tr(c.title)}</span>
                                        <span className={cn("shrink-0 text-[9px] font-semibold", TREE_LEVEL_STYLE[c.level])}>
                                          {tr(c.level)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Submissions */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold leading-tight">{tr("Active Unit Challenge Submissions")}</h2>
              <button type="button" className="shrink-0 text-[10px] font-semibold text-[#0b6b70] hover:underline">
                {tr("Live Feed")}
              </button>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {SUBMISSIONS.map((s) => (
                <div key={s.cohort} className="rounded-xl bg-[#f1f4f4] px-3 py-2.5">
                  <p className="text-[9px] font-medium text-[#1B2D54]/70">{tr(s.cohort)}</p>
                  <p className="mt-1 text-lg font-bold">
                    <Ltr>
                      {s.done} / {s.total}
                    </Ltr>
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold text-[#0b6b70]">{t("{pct}% on time", { pct: s.onTime })}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="flex min-w-0 flex-col gap-4 p-5">
          <div>
            <p className="text-[9px] font-semibold text-[#0b6b70]">{tr(lesson.label)}</p>
            <h2 className="mt-1 max-w-[28rem] text-2xl font-bold leading-tight">{tr(lesson.heading)}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActionButton tone="gray" icon={<Pencil aria-hidden className="size-3.5" />}>
                {tr("Edit Content")}
              </ActionButton>
              <ActionButton tone="teal" icon={<Radio aria-hidden className="size-3.5" />}>
                {tr("Publish to Cohorts 9A & 9B")}
              </ActionButton>
            </div>
          </div>

          {!detail ? (
            <p className="rounded-xl bg-[#f1f4f4] p-8 text-center text-[11px] text-[#1B2D54]/60">
              {tr("Lesson details will appear here once the lesson is set up.")}
            </p>
          ) : (
            <>
              <div>
                <p className="text-[11px] font-semibold">{tr("Targeted Competencies:")}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {detail.competencies.map((c) => (
                    <div key={c.title} className="rounded-xl bg-[#f1f4f4] p-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0b6b70]">
                        {c.icon}
                        {tr(c.title)}
                      </p>
                      <p className="mt-1 text-[9px] leading-snug text-[#1B2D54]/75">{tr(c.text)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video */}
              <div className="rounded-xl bg-[#f1f4f4] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold">
                    <Video aria-hidden className="size-4" />
                    {tr("Lesson Walkthrough Video")}
                  </p>
                  <span className="text-[9px] text-[#1B2D54]/70">{t("Duration: {time} mins", { time: detail.duration })}</span>
                </div>

                <div className="relative mt-2 aspect-[11/5] max-h-60 w-full overflow-hidden rounded-xl bg-[#14243f]">
                  <Image
                    src={VIDEO_POSTER}
                    alt={tr("Instructor Preview Video")}
                    fill
                    sizes="(min-width: 1280px) 40vw, 100vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 grid place-items-center bg-black/25">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        aria-label={tr("Play video")}
                        className="grid size-11 place-items-center rounded-full bg-[#0b6b70] text-white shadow-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <Play aria-hidden className="size-4 translate-x-px rtl:-scale-x-100" fill="currentColor" />
                      </button>
                      <span className="text-[9px] font-medium text-white">{tr("Instructor Preview Video")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Challenges */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex max-w-[11rem] items-center gap-2 text-sm font-bold leading-snug">
                    <Copy aria-hidden className="size-4 shrink-0 text-[#0b6b70]" />
                    {tr("Three Figma Design Challenges")}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <ActionButton tone="gray" icon={<FolderOpen aria-hidden className="size-3.5" />}>
                      {tr("Open in Figma (.fig)")}
                    </ActionButton>
                    <ActionButton tone="navy" icon={<Palette aria-hidden className="size-3.5" />}>
                      {tr("Design Challenge Editor")}
                    </ActionButton>
                  </div>
                </div>

                <ul className="mt-2 flex flex-col gap-2">
                  {detail.challenges.map((c, i) => (
                    <li key={c.title} className="flex items-start gap-3 rounded-xl bg-[#f1f4f4] p-3">
                      <span
                        className={cn(
                          "grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-bold",
                          CHALLENGE_NUMBER_STYLE[i] ?? CHALLENGE_NUMBER_STYLE[2]
                        )}
                      >
                        <Ltr>{i + 1}</Ltr>
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-bold">{tr(c.title)}</p>
                          <Pill className={CHALLENGE_LEVEL_STYLE[c.level]}>{tr(c.level)}</Pill>
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-[#1B2D54]/75">{tr(c.text)}</p>
                        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-semibold text-[#14243f]/80">
                          <span className="flex items-center gap-1">
                            <Timer aria-hidden className="size-3.5" />
                            {t("Est: {m} mins", { m: c.mins })}
                          </span>
                          <span className="flex items-center gap-1">
                            <BadgeCheck aria-hidden className="size-3.5" />
                            {t("{p} pts", { p: c.pts })}
                          </span>
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label={tr("Challenge settings")}
                        className="grid size-7 shrink-0 place-items-center rounded-lg text-[#0b6b70] transition-colors hover:bg-white"
                      >
                        <SlidersHorizontal aria-hidden className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}