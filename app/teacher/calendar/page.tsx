"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Copy,
  DoorOpen,
  MapPin,
  Monitor,
  Plus,
  Presentation,
  RefreshCw,
  Star,
  Users,
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

type View = "Day" | "Week" | "Month" | "Agenda";
const VIEWS: View[] = ["Day", "Week", "Month", "Agenda"];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTH_CELLS: { d: number; muted?: boolean }[] = [
  { d: 29, muted: true },
  { d: 30, muted: true },
  ...Array.from({ length: 31 }, (_, i) => ({ d: i + 1 })),
  { d: 1, muted: true },
  { d: 2, muted: true },
];

const DAYS = [
  { key: "MON", date: 21 },
  { key: "TUE", date: 22 },
  { key: "WED", date: 23 },
  { key: "THU", date: 24 },
  { key: "FRI", date: 25 },
];

type Tone = "teal" | "navy" | "orange" | "purple";

const TONE: Record<Tone, { bar: string; time: string }> = {
  teal: { bar: "border-s-[#0b6b70]", time: "text-[#0b6b70]" },
  navy: { bar: "border-s-[#14243f]", time: "text-[#14243f]" },
  orange: { bar: "border-s-[#f5a524]", time: "text-[#c2410c]" },
  purple: { bar: "border-s-[#5b5bf0]", time: "text-[#5b5bf0]" },
};

type EventItem = {
  id: string;
  day: string;
  time: string;
  title: string;
  desc?: string;
  tone: Tone;
  tags?: string[];
  chips?: string[];
  live?: boolean;
  note?: string;
  progress?: number;
  room?: string;
  icon?: "monitor" | "star";
};

const EVENTS: EventItem[] = [
  { id: "e1", day: "MON", time: "09:00 - 10:45 AM", title: "UI/UX Fundamentals", desc: "Lesson 3.2: Responsive Auto Layout & Constraints", tone: "teal", tags: ["Studio 304"], chips: ["Cohort 9A"], icon: "monitor" },
  { id: "e2", day: "TUE", time: "10:00 - 11:15 AM", title: "Cohort 9A Live Design Critique", desc: "Mobile App Wireframes & Information Architecture Review", tone: "teal", live: true, room: "Studio 304", progress: 80 },
  { id: "e3", day: "TUE", time: "14:00 - 15:00 PM", title: "Faculty Syllabus Sync", desc: "Term 1 Assessment Rubric calibration", tone: "navy", tags: ["Zoom Room 2"] },
  { id: "e4", day: "WED", time: "11:00 - 12:45 PM", title: "Cohort 9B UX Research Lab", desc: "Usability Testing Synthesis & User Journey Mapping", tone: "teal", tags: ["Lab 304"], chips: ["Cohort 9B"] },
  { id: "e5", day: "WED", time: "15:30 - 16:15 PM", title: "Portfolio Review Call", desc: "Sara's Mentor Review (Sprint 04 Showcase Case Study)", tone: "purple", tags: ["Google Meet + Hybrid"], icon: "star" },
  { id: "e6", day: "THU", time: "13:30 - 14:15 PM", title: "1-on-1 Mentoring Clinic", desc: "Youssef Ahmed & Karim Tarek", tone: "orange", note: "Auto Layout Nesting & WCAG" },
  { id: "e7", day: "FRI", time: "11:15 - 12:05 PM", title: "Design Review Breakout Rooms", desc: "Peer Feedback & Heuristic Evaluation (Cohorts 9A & 9B)", tone: "teal", tags: ["Breakout 1-6 + Virtual"] },
  { id: "e8", day: "FRI", time: "14:00 - 14:45 PM", title: "Remedial Clinic: Figma Tokens", desc: "Design system color primitives setup", tone: "orange", tags: ["Terminal 12 + Studio 304"] },
];

const CHANNELS = [
  { label: "Cohort 9A Live Design Critiques", color: "bg-[#0b6b70]", count: "6h", tone: "teal" },
  { label: "Cohort 9B UX Research Labs", color: "bg-[#2ed3b7]", count: "4h", tone: "gray" },
  { label: "1-on-1 Mentorship & Remedial", color: "bg-[#f5a524]", count: "3h", tone: "gray" },
  { label: "Figma Sprints & Deadlines", color: "bg-[#c81e1e]", count: "2", tone: "red" },
  { label: "Industry Juries & Hiring Reviews", color: "bg-[#5b5bf0]", count: "1", tone: "gray" },
  { label: "Design Faculty Syncs", color: "bg-[#14243f]", count: "1h", tone: "gray" },
] as const;

const chipClass = {
  teal: "bg-[#bff3f3] text-[#0b6b70]",
  gray: "bg-[#eef0f2] text-[#14243f]",
  red: "bg-[#fde8e8] text-[#c81e1e]",
};


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white shadow-sm", className)}>{children}</section>
  );
}

export default function CalendarPage() {
  const tr = useTr();
  const [view, setView] = useState<View>("Week");
  const [selected, setSelected] = useState(22);
  const [copied, setCopied] = useState(false);

  const link = "juniorhub.design/meet/mona";

  async function copy() {
    try {
      await navigator.clipboard.writeText(`https://${link}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#14243f] rtl:normal-case rtl:tracking-normal">
            {tr("UI/UX Department • Term 1")}
          </p>
          <h1 className="mt-1.5 max-w-[34rem] text-[28px] font-bold leading-tight text-[#0f1f3d]">
            {tr("Academic Timetable & Design Studio Schedule")}
          </h1>
        </div>

        <div className="flex flex-col items-start gap-2.5 lg:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[11px] font-semibold text-[#14243f] shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
            >
              <RefreshCw aria-hidden className="size-3.5" />
              {tr("Sync External Calendar")}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-[#0b6b70] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#095a5e]"
            >
              <Plus aria-hidden className="size-3.5" />
              {tr("Schedule Studio Event")}
            </button>
          </div>

          <div role="tablist" className="flex items-center rounded-lg bg-[#eef0f2] p-1 ring-1 ring-[#e3ece9]">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={cn(
                  "rounded-md px-4 py-1.5 text-[11px] font-semibold transition-colors",
                  view === v ? "bg-[#0b6b70] text-white" : "text-[#14243f] hover:bg-white"
                )}
              >
                {tr(v)}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid min-w-0 items-start gap-6 xl:grid-cols-12">
        {/* ===== Left column ===== */}
        <div className="flex min-w-0 flex-col gap-4 xl:col-span-4">
          {/* Mini calendar */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-[#14243f]">
                <Ltr>{tr("October 2024")}</Ltr>
              </h2>
              <div className="flex items-center gap-1 text-[#14243f]">
                <button type="button" aria-label={tr("Previous month")} className="grid size-6 place-items-center rounded hover:bg-[#eef0f2]">
                  <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
                </button>
                <button type="button" aria-label={tr("Next month")} className="grid size-6 place-items-center rounded hover:bg-[#eef0f2]">
                  <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div dir="ltr" className="mt-4 grid grid-cols-7 gap-y-1.5 text-center">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-[10px] font-semibold text-[#14243f]">
                  {tr(w)}
                </span>
              ))}
              {MONTH_CELLS.map((c, i) => {
                const isSel = !c.muted && c.d === selected;
                const inWeek = !c.muted && c.d >= 21 && c.d <= 25;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={c.muted}
                    onClick={() => setSelected(c.d)}
                    className={cn(
                      "mx-auto grid h-7 w-full place-items-center text-[11px] font-medium transition-colors",
                      c.muted && "text-[#1B2D54]/30",
                      !c.muted && "text-[#14243f]",
                      !c.muted && !inWeek && "rounded-md hover:bg-[#eef0f2]",
                      inWeek && !isSel && "bg-[#cdf5f5] hover:bg-[#bff0f0]",
                      c.d === 21 && inWeek && "rounded-s-md",
                      c.d === 25 && inWeek && "rounded-e-md",
                      isSel && "rounded-md bg-[#bff3f3] font-bold text-[#14243f] ring-1 ring-[#0b6b70] hover:bg-[#bff3f3]"
                    )}
                  >
                    {c.d}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Channels */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-bold text-[#14243f]">{tr("Studio Channels")}</h2>
              <span className="text-[10px] font-bold uppercase text-[#0b6b70] rtl:normal-case">
                <bdi>{tr("6 ACTIVE")}</bdi>
              </span>
            </div>
            <ul className="mt-4 flex flex-col gap-3.5">
              {CHANNELS.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5">
                  <span aria-hidden className={cn("size-3.5 shrink-0 rounded-[3px]", c.color)} />
                  <span aria-hidden className={cn("size-2 shrink-0 rounded-full", c.color)} />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-[#14243f]">{tr(c.label)}</span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", chipClass[c.tone])}>
                    <bdi>{c.count}</bdi>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-4">
            <div className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#bff3f3] text-[#0b6b70]">
                <CalendarDays aria-hidden className="size-4" />
              </span>
              <div className="leading-tight">
                <h3 className="text-xs font-bold text-[#14243f]">{tr("1-on-1 Booking Link")}</h3>
                <p className="mt-0.5 text-[9px] text-[#1B2D54]/70">{tr("Public Figma review link for apprentices")}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-[#eef0f2] px-3 py-2">
              <Ltr className="truncate font-mono text-[10px] text-[#14243f]">{link}</Ltr>
              <button type="button" onClick={copy} className="flex shrink-0 items-center gap-1 font-mono text-[10px] font-semibold text-[#0b6b70]">
                {copied ? <CircleCheck aria-hidden className="size-3" /> : <Copy aria-hidden className="size-3" />}
                {tr(copied ? "Copied" : "Copy")}
              </button>
            </div>
          </Card>

          <section className="rounded-2xl bg-[#0b6b70] p-5 text-white shadow-sm">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-white/80 rtl:normal-case rtl:tracking-normal">
              {tr("PHYSICAL & CLOUD HUB")}
            </p>
            <h3 className="mt-2 text-sm font-bold leading-snug">{tr("Design Studio Lab 304 & Zoom Room 4")}</h3>
            <p className="mt-2 text-[11px] leading-snug text-white/85">
              {tr("32 Figma Interactive Terminals Active • Dual 4K Projection Sync Enabled")}
            </p>
          </section>
        </div>

        {/* ===== Right column ===== */}
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-8">
          {/* Week grid */}
          <Card className="overflow-x-auto">
            <div className="min-w-[44rem] px-4 pb-4 pt-4">
              <div className="grid grid-cols-5 items-stretch gap-2">
                {DAYS.map((d) => {
                  const today = d.date === 22;
                  const items = EVENTS.filter((e) => e.day === d.key);
                  return (
                    <div
                      key={d.key}
                      className={cn(
                        "flex min-w-0 flex-col gap-2 rounded-xl px-1.5",
                        today ? "bg-[#d9f6f8] pb-40" : "pb-4"
                      )}
                    >
                      <div className="py-2 text-center leading-tight">
                        <p
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide rtl:normal-case",
                            today ? "text-[#0b6b70]" : "text-[#1B2D54]/70"
                          )}
                        >
                          {tr(d.key)}
                        </p>
                        <Ltr className="mt-0.5 text-lg font-bold text-[#14243f]">{d.date}</Ltr>
                      </div>

                      {items.map((e) => {
                        const tone = TONE[e.tone];
                        return (
                          <article
                            key={e.id}
                            className={cn(
                              "min-w-0 rounded-lg border border-[#e3ece9] border-s-4 bg-white p-2.5 shadow-sm",
                              tone.bar,
                              e.live && "ring-1 ring-[#0b6b70]/40"
                            )}
                          >
                            {e.live && (
                              <p className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-[#fde8e8] px-1.5 py-0.5 text-[8px] font-bold text-[#c81e1e]">
                                <span aria-hidden className="size-1 rounded-full bg-[#c81e1e]" />
                                {tr("LIVE NOW")}
                              </p>
                            )}

                            <div className="flex items-start justify-between gap-1.5">
                              <p className={cn("text-[9px] font-bold leading-snug", e.live ? "text-[#14243f]" : tone.time)}>
                                <Ltr>{e.time}</Ltr>
                              </p>
                              {e.icon === "monitor" && <Monitor aria-hidden className="mt-0.5 size-3 shrink-0 text-[#1B2D54]/60" />}
                              {e.icon === "star" && (
                                <span aria-hidden className="mt-0.5 grid size-3 shrink-0 place-items-center rounded-full bg-[#5b5bf0] text-white">
                                  <Star className="size-2" fill="currentColor" />
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1 text-xs font-bold leading-snug text-[#14243f]">{tr(e.title)}</h4>
                            {e.desc && <p className="mt-1.5 text-[10px] leading-snug text-[#1B2D54]/70">{tr(e.desc)}</p>}

                            {e.note && (
                              <p className="mt-2 rounded bg-[#eef0f2] px-1.5 py-1 text-[9px] font-bold leading-snug text-[#14243f]">
                                {tr(e.note)}
                              </p>
                            )}

                            {e.room && (
                              <div className="mt-2 border-t border-[#e3ece9] pt-1.5">
                                <p className="flex items-start gap-1 text-[9px] font-bold leading-snug text-[#0b6b70]">
                                  <DoorOpen aria-hidden className="mt-0.5 size-3 shrink-0" />
                                  {tr(e.room)}
                                </p>
                                {e.progress !== undefined && (
                                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#e3ece9]">
                                    <div className="h-full rounded-full bg-[#0b6b70]" style={{ width: `${e.progress}%` }} />
                                  </div>
                                )}
                              </div>
                            )}

{(e.tags || e.chips) && (
  <div className="mt-2 flex items-center gap-1">
    {e.tags?.map((tag) => (
      <span
        key={tag}
        className="shrink-0 text-[9px] font-bold leading-snug text-[#14243f]"
      >
        {tr(tag)}
      </span>
    ))}

    {e.chips?.map((chip) => (
      <span
        key={chip}
        className="shrink-0 rounded bg-[#eef0f2] px-1.5 py-0.5 text-[9px] font-bold leading-snug text-[#14243f]"
      >
        {tr(chip)}
      </span>
    ))}
  </div>
)}
                          </article>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Active session */}
          <Card className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-1.5 rounded-full bg-[#bff3f3] px-2.5 py-1 text-[9px] font-bold text-[#0b6b70]">
                  <span aria-hidden className="size-1.5 rounded-full bg-[#0b6b70]" />
                  {tr("ACTIVE SESSION • UI/UX Design Cohort 9A")}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#1B2D54]/80">
                  <MapPin aria-hidden className="size-3" />
                  {tr("Tuesday In-Person & Hybrid Studio Lab 304")}
                </span>
              </div>
              <h2 className="mt-3 max-w-[26rem] text-lg font-bold leading-snug text-[#14243f]">
                {tr("Lesson 3.3: Interactive Variants & Micro-interactions in Figma")}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#0b6b70]">
                <Users aria-hidden className="size-3.5" />
                {tr("24 of 28 apprentices actively connected via Figma Live multiplayer")}
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#eef0f2] px-4 py-2 text-[11px] font-semibold text-[#14243f] hover:bg-[#e1e5e8]"
              >
                <Presentation aria-hidden className="size-3.5 text-[#0b6b70]" />
                {tr("Open Figma Slide Deck")}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0b6b70] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#095a5e]"
              >
                <Video aria-hidden className="size-3.5" />
                {tr("Enter Studio 304 Live Stream")}
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}