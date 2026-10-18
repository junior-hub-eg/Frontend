"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  Clock,
  Gamepad2,
  Globe,
  Info,
  Lightbulb,
  Link2,
  Lock,
  MonitorPlay,
  NotebookTabs,
  Rocket,
  ShieldCheck,
  Smile,
  Sparkles,
  Star,
  Tag,
  Terminal,
  Users,
  Video,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SESSION_TYPES, type Mentor } from "@/lib/data/mentors";
import { cn } from "@/lib/utils";
import { BookingCalendar } from "./BookingCalendar";
import { MentorAvatar } from "./MentorAvatar";

const STEPS = ["Session Type", "Date & Time", "Context & Prep", "Confirm"];
const SESSION_ICONS: Record<string, LucideIcon> = { build: Gamepad2, learn: Rocket, intro: Lightbulb };
const INTERESTS: { label: string; icon: LucideIcon }[] = [
  { label: "Games (Roblox / Scratch)", icon: Gamepad2 },
  { label: "Python Mini-Games", icon: Terminal },
  { label: "My First Website", icon: Globe },
  { label: "Homework & AP CS", icon: NotebookTabs },
];
const QUICK_IDEAS = [
  { emoji: "🚀", label: "Building a space game", text: "I'm building a space shooter game and want help making the enemy spaceships move and shoot." },
  { emoji: "🐞", label: "Fixing a bug", text: "My project has a bug I can't figure out, and I'd love help finding and fixing it." },
  { emoji: "✨", label: "Starting from scratch", text: "I want to start a brand-new project from scratch and learn how to plan it step by step." },
  { emoji: "🎁", label: "Surprise me!", text: "Surprise me! Pick a fun mini-project we can build together in one session." },
];
const IDEA_MAX = 280;
const noopSubscribe = () => () => {};

function addMinutes(time: string, minutes: number) {
  const [, h, m, ap] = time.match(/(\d+):(\d+) (AM|PM)/)!;
  const total = ((Number(h) % 12) + (ap === "PM" ? 12 : 0)) * 60 + Number(m) + minutes;
  const hh = Math.floor(total / 60) % 24;
  return `${((hh + 11) % 12) + 1}:${String(total % 60).padStart(2, "0")} ${hh >= 12 ? "PM" : "AM"}`;
}

/** MOCK after-school slots; one is "booked" on some days. */
function slotsFor(date: Date) {
  const base = [
    { time: "3:30 PM", label: "Right After School", highlight: true },
    { time: "4:30 PM", label: "Homework Break" },
    { time: "5:30 PM", label: "Homework Hour" },
    { time: "6:30 PM", label: "Evening Slot" },
  ];
  return base.map((s, i) => ({ ...s, booked: (date.getDate() + i) % 5 === 0 }));
}

/** "SCRATCH PROJECT", "GITHUB REPO" ... from the pasted link. */
function linkKind(link: string) {
  const host = link.toLowerCase();
  if (host.includes("scratch.mit.edu")) return "SCRATCH PROJECT";
  if (host.includes("replit.com")) return "REPLIT";
  if (host.includes("github.com")) return "GITHUB REPO";
  if (host.includes("roblox.com")) return "ROBLOX GAME";
  return null;
}

function Badge({ icon: Icon, children, className }: { icon?: LucideIcon; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-[#DDF3E7] px-2.5 py-1 text-[10px] font-semibold text-[#0f6b60]", className)}>
      {Icon && <Icon size={11} aria-hidden />}
      {children}
    </span>
  );
}

function SectionCard({ step, title, aside, children }: { step: string; title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] bg-white p-6 shadow-[0_6px_24px_rgba(27,42,92,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0f6b60]">{step}</p>
          <h2 className="mt-1 max-w-sm text-lg font-semibold text-[#1b2a5c]">{title}</h2>
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function BookingFlow({ mentor }: { mentor: Mentor }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const timeZone = useSyncExternalStore(noopSubscribe, () => Intl.DateTimeFormat().resolvedOptions().timeZone, () => "");
  const firstName = mentor.name.split(" ")[0];

  const [sessionId, setSessionId] = useState<string>(SESSION_TYPES[0].id);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [interest, setInterest] = useState<string>(INTERESTS[0].label);
  const [idea, setIdea] = useState("");
  const [link, setLink] = useState("");
  const [parentJoins, setParentJoins] = useState(true);
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const session = SESSION_TYPES.find((s) => s.id === sessionId) ?? SESSION_TYPES[0];
  const total = session.price;
  const currentStep = !date || !time ? 2 : idea.trim().length < 10 ? 3 : 4;
  const ready = !!date && !!time && idea.trim().length >= 10;
  const slots = date ? slotsFor(date) : [];
  const kind = linkKind(link);

  function handleContinue() {
    if (!ready) return;
    // TODO(backend): create the booking, then go to the payment step (not designed yet).
    setSaved(true);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8 lg:px-10">
      {/* Header: breadcrumb, title and steps */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white px-5 py-4 shadow-[0_6px_24px_rgba(27,42,92,0.06)]">
        <div className="flex items-center gap-3">
          <Link href="/monitor" aria-label="Back to mentors" className="grid size-8 place-items-center rounded-full text-[#1b2a5c] hover:bg-[#F3F7FA]">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[10px] text-[#1b2a5c]/60">
              <Link href="/monitor" className="hover:underline">Mentors</Link>
              <span>/</span>
              <span>{mentor.name}</span>
              <span>/</span>
              <span className="font-medium text-[#1b2a5c]">Book a 1:1 Session</span>
            </nav>
            <h1 className="text-lg font-semibold text-[#1b2a5c] sm:text-xl">Schedule Mentorship with {mentor.name}</h1>
          </div>
        </div>
        <ol className="flex flex-wrap items-center gap-2 text-[11px]" aria-label="Booking steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < currentStep;
            const active = n === currentStep;
            return (
              <li key={label} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
                {i > 0 && <span aria-hidden className={cn("h-px w-6 sm:w-8", done || active ? "bg-[#0f6b60]" : "bg-[#1b2a5c]/15")} />}
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-[10px] font-semibold",
                    done ? "bg-[#0f6b60] text-white" : active ? "bg-[#0f6b60] text-white ring-4 ring-[#DDF3E7]" : "bg-[#F3F7FA] text-[#1b2a5c]/50",
                  )}
                >
                  {done ? <CircleCheck size={14} /> : n}
                </span>
                <span className={active ? "font-semibold text-[#0f6b60]" : done ? "text-[#1b2a5c]" : "text-[#1b2a5c]/55"}>
                  {n}. {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {/* Step 1 */}
          <SectionCard
            step="Step 1: Session Choice"
            title="What kind of session would you like?"
            aside={<Badge icon={BadgeCheck}>Ages 11–18 • Beginner to Advanced</Badge>}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {SESSION_TYPES.map((s) => {
                const active = s.id === sessionId;
                const Icon = SESSION_ICONS[s.id] ?? Sparkles;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSessionId(s.id)}
                    aria-pressed={active}
                    className={cn(
                      "flex flex-col rounded-2xl border-2 p-4 text-left transition-colors",
                      active ? "border-[#0f6b60] bg-white shadow-md" : "border-transparent bg-white hover:border-[#0f6b60]/30",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <span className={cn("grid size-9 place-items-center rounded-lg", active ? "bg-[#7fdcb8] text-[#0f6b60]" : "bg-[#EEF0FB] text-[#2b3a8c]")}>
                        <Icon size={17} aria-hidden />
                      </span>
                      <span className="text-right">
                        <span className={cn("block text-lg font-bold", s.price === 0 ? "text-[#0f6b60]" : "text-[#1b2a5c]")}>
                          {s.price === 0 ? "Free" : `$${s.price}`}
                        </span>
                        <span className="block text-[9px] text-[#1b2a5c]/50">{s.priceNote}</span>
                      </span>
                    </div>
                    <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-[#1b2a5c]">
                      {s.title}
                      {s.popular && <span className="rounded bg-[#FFE7A3] px-1.5 py-0.5 text-[9px] font-semibold text-[#8a5a00]">Popular</span>}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[#1b2a5c]/65">
                      {s.description.replace("{mentor}", firstName)}
                    </p>
                    <span className="mt-auto flex items-center justify-between pt-4 text-[10px]">
                      <span className={cn("flex items-center gap-1", active ? "font-semibold text-[#0f6b60]" : "text-[#1b2a5c]/55")}>
                        <Clock size={11} aria-hidden /> {s.minutes} mins
                      </span>
                      <span
                        className={cn("grid size-4 place-items-center rounded-full", active ? "bg-[#0f6b60] text-white" : "bg-[#E6ECF2]")}
                        aria-hidden
                      >
                        {active && <CircleCheck size={12} />}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Step 2 */}
          <SectionCard
            step="Step 2: Availability"
            title="Choose an After-School or Weekend Time"
            aside={
              <div className="flex flex-wrap items-center gap-2">
                <Badge icon={Users} className="max-w-[110px] text-center leading-tight">Parents welcome to join!</Badge>
                {timeZone && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F7FA] px-2.5 py-1 text-[10px] text-[#1b2a5c]/75">
                    <Globe size={11} aria-hidden /> Timezone: <span className="font-semibold text-[#1b2a5c]">{timeZone}</span>
                  </span>
                )}
              </div>
            }
          >
            {isClient ? (
              <div className="grid gap-6 md:grid-cols-[1.15fr_1fr]">
                <BookingCalendar
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setTime(null);
                  }}
                />
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-base font-semibold text-[#1b2a5c]">
                      {date ? date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "Pick a day"}
                    </p>
                    {date && <span className="text-[10px] font-semibold text-[#0f6b60]">{slots.filter((s) => !s.booked).length} afternoon slots</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-[#1b2a5c]/60">
                    {date ? "Your local time • Pick a convenient after-school slot" : "Select an available day to see time slots."}
                  </p>
                  {date && (
                    <ul className="mt-4 flex flex-col gap-2">
                      {slots.map((slot) => {
                        const selected = time === slot.time;
                        return (
                          <li key={slot.time}>
                            <button
                              type="button"
                              disabled={slot.booked}
                              onClick={() => setTime(slot.time)}
                              aria-pressed={selected}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-xs transition-colors",
                                selected
                                  ? "border-[#0f6b60] bg-[#0f6b60] text-white"
                                  : slot.booked
                                    ? "border-[#eef2f5] text-[#1b2a5c]/30 line-through"
                                    : "border-[#eef2f5] text-[#1b2a5c] hover:border-[#0f6b60]/40",
                              )}
                            >
                              {selected ? <CircleCheck size={14} aria-hidden /> : <Clock size={14} className="text-[#1b2a5c]/45" aria-hidden />}
                              <span className="font-semibold">
                                {slot.time} - {addMinutes(slot.time, session.minutes)}
                              </span>
                              <span
                                className={cn(
                                  "ml-auto rounded-full px-2 py-0.5 text-[10px]",
                                  selected ? "bg-white/20 font-semibold text-white" : slot.highlight ? "bg-[#DDF3E7] font-semibold text-[#1E9D5B]" : "text-[#1b2a5c]/55",
                                )}
                              >
                                {slot.booked ? "Booked" : selected ? "Selected" : slot.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <p className="mt-5 flex items-start gap-1.5 text-[10px] leading-relaxed text-[#1b2a5c]/55">
                    <CalendarCheck size={12} className="mt-0.5 shrink-0 text-[#0f6b60]" aria-hidden />
                    Calendar automatically syncs with student &amp; parent Google Calendar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-72" aria-hidden />
            )}
          </SectionCard>

          {/* Step 3 */}
          <SectionCard
            step="Step 3: What We're Making"
            title={`Tell ${firstName} what you'd love to build!`}
            aside={<Badge icon={Wand2}>Beginner friendly • Zero prep needed</Badge>}
          >
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#cdeee8] bg-[#EAF8F6] p-4">
              <MentorAvatar name={mentor.name} photo={mentor.photo} photoHasDot={mentor.photoHasDot} className="size-11" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1b2a5c]">
                  {firstName} is ready to help you code!
                  <span className="rounded-full bg-[#1b2a5c] px-2 py-0.5 text-[9px] font-semibold text-white">1-on-1 Mentorship</span>
                </p>
                <p className="mt-1 text-[11px] text-[#1b2a5c]/70">
                  &quot;Can&apos;t wait to build together! Got a cool idea, or want to start fresh with a fun project?&quot;
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#0f6b60]">
                <Smile size={11} aria-hidden /> Fun &amp; Stress-Free
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <div>
                <p className="mb-2.5 text-xs font-semibold text-[#1b2a5c]">1. What sounds most fun to work on?</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {INTERESTS.map(({ label, icon: Icon }) => {
                    const active = interest === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setInterest(label)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-[11px] font-medium transition-colors",
                          active ? "border-[#0f6b60] bg-[#7fdcb8]/60 text-[#0f6b60]" : "border-[#eef2f5] bg-white text-[#1b2a5c] hover:border-[#0f6b60]/40",
                        )}
                      >
                        <span className={cn("grid size-7 shrink-0 place-items-center rounded-lg", active ? "bg-white/70" : "bg-[#F3F7FA]")}>
                          <Icon size={14} aria-hidden />
                        </span>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor="idea" className="text-xs font-semibold text-[#1b2a5c]">
                    2. Tell {firstName} your idea (or just say &quot;Surprise me!&quot;)
                  </label>
                  <span className="text-[10px] text-[#1b2a5c]/50">Need ideas? Click a quick chip below 👇</span>
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {QUICK_IDEAS.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setIdea(q.text)}
                      className="rounded-full bg-[#F3F7FA] px-2.5 py-1 text-[10px] font-medium text-[#1b2a5c] hover:bg-[#E9F7F4]"
                    >
                      {q.emoji} {q.label}
                    </button>
                  ))}
                </div>
                <textarea
                  id="idea"
                  value={idea}
                  maxLength={IDEA_MAX}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={3}
                  placeholder="I'm building a space shooter game in Python with Pygame, and I want help making the enemy spaceships bounce and shoot lasers!"
                  className="w-full resize-none rounded-xl bg-[#F3F7FA] p-4 text-xs leading-relaxed text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40 focus:ring-2 focus:ring-[#0f6b60]/25"
                />
                <p className="mt-1 text-right text-[10px] text-[#1b2a5c]/50">
                  {idea.length}/{IDEA_MAX}
                </p>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <label htmlFor="project-link" className="text-xs font-semibold text-[#1b2a5c]">
                    3. Got a project link or file? <span className="font-normal text-[#1b2a5c]/50">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-[#1b2a5c]/50">Scratch, Replit, GitHub, or Roblox</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl bg-[#F3F7FA] px-3 py-2.5 focus-within:ring-2 focus-within:ring-[#0f6b60]/25">
                  <Link2 size={14} className="shrink-0 text-[#1b2a5c]/50" aria-hidden />
                  <input
                    id="project-link"
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://scratch.mit.edu/projects/918237461"
                    className="min-w-0 flex-1 bg-transparent text-xs text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40"
                  />
                  {kind && <span className="rounded bg-[#DDF3E7] px-2 py-0.5 text-[9px] font-semibold text-[#0f6b60]">{kind}</span>}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-[#1b2a5c]">4. Safe Classroom Setup</p>
                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#F3F7FA] p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#DDF3E7] text-[#0f6b60]">
                    <Video size={16} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#1b2a5c]">
                      Junior Hub Safe Classroom
                      <span className="rounded bg-[#7fdcb8]/70 px-1.5 py-0.5 text-[9px] font-semibold text-[#0f6b60]">Protected &amp; Private</span>
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#1b2a5c]/60">
                      Browser-based safe screen share • No downloads or third-party accounts required
                    </p>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] font-medium text-[#1b2a5c]">
                    <input
                      type="checkbox"
                      checked={parentJoins}
                      onChange={(e) => setParentJoins(e.target.checked)}
                      className="size-3.5 accent-[#2563EB]"
                    />
                    Parent Welcome &amp; Verified
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="rounded-[20px] bg-white p-5 shadow-[0_6px_24px_rgba(27,42,92,0.06)]">
            <div className="flex items-start gap-3">
              <MentorAvatar name={mentor.name} photo={mentor.photo} photoHasDot={mentor.photoHasDot} online className="size-14 text-base" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-base font-semibold text-[#1b2a5c]">
                    {mentor.name} <BadgeCheck size={14} className="text-[#12939b]" aria-label="Verified" />
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-[#1b2a5c]">
                    <Star size={11} className="fill-[#0f6b60] text-[#0f6b60]" aria-hidden />
                    <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
                    <span className="text-[#1b2a5c]/50">({mentor.reviews})</span>
                  </span>
                </p>
                <p className="text-[11px] font-semibold text-[#0f6b60]">{mentor.headline}</p>
                <p className="text-[10px] text-[#1b2a5c]/60">{mentor.specialty}</p>
              </div>
            </div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {mentor.expertiseTags.map((t) => (
                <li key={t} className="rounded-md bg-[#EEF0FB] px-2 py-1 text-[10px] font-medium text-[#2b3a8c]">
                  {t}
                </li>
              ))}
            </ul>
            <dl className="mt-4 grid grid-cols-2 rounded-xl bg-[#F3F7FA] p-3 text-center">
              <div>
                <dt className="text-[10px] text-[#1b2a5c]/55">Students Coached</dt>
                <dd className="mt-0.5 text-xs font-semibold text-[#1b2a5c]">{mentor.studentsCoached}</dd>
              </div>
              <div>
                <dt className="text-[10px] text-[#1b2a5c]/55">Response Time</dt>
                <dd className="mt-0.5 text-xs font-semibold text-[#1b2a5c]">{mentor.responseTime}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-[20px] bg-white p-5 shadow-[0_6px_24px_rgba(27,42,92,0.06)]">
            <h2 className="text-base font-semibold text-[#1b2a5c]">Booking Summary</h2>
            <dl className="mt-4 flex flex-col gap-3 text-[11px]">
              {(
                [
                  [CalendarCheck, "Session Type", session.title],
                  [Clock, "Duration", `${session.minutes} minutes`],
                  [
                    CalendarDays,
                    "Date & Time",
                    date ? (
                      <>
                        {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" })}
                        {time && (
                          <span className="block text-[#0f6b60]">
                            {time} - {addMinutes(time, session.minutes)}
                          </span>
                        )}
                      </>
                    ) : (
                      "Not selected yet"
                    ),
                  ],
                  [MonitorPlay, "Platform", "In-Platform Live Room (HD)"],
                ] as [LucideIcon, string, React.ReactNode][]
              ).map(([Icon, k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="flex shrink-0 items-center gap-1.5 text-[#1b2a5c]/70">
                    <Icon size={13} aria-hidden /> {k}
                  </dt>
                  <dd className="text-right font-semibold text-[#1b2a5c]">{v}</dd>
                </div>
              ))}
            </dl>

            <form
              className="mt-5 flex items-center gap-2 border-t border-[#eef2f5] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (promo.trim()) setPromoNote("This code isn't valid yet. Codes will work once payments are live.");
              }}
            >
              <label className="flex flex-1 items-center gap-1.5 rounded-lg bg-[#F3F7FA] px-3 py-2">
                <Tag size={12} className="text-[#1b2a5c]/45" aria-hidden />
                <input
                  value={promo}
                  onChange={(e) => {
                    setPromo(e.target.value);
                    setPromoNote(null);
                  }}
                  placeholder="PROMO OR TRACK CREDIT CODE"
                  aria-label="Promo or track credit code"
                  className="w-full bg-transparent text-[10px] uppercase text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/45"
                />
              </label>
              <button type="submit" className="rounded-lg bg-[#F3F7FA] px-3 py-2 text-[11px] font-semibold text-[#2b3a8c] hover:bg-[#EEF0FB]">
                Apply
              </button>
            </form>
            {promoNote && <p className="mt-1.5 text-[10px] text-[#b83232]">{promoNote}</p>}

            <dl className="mt-4 flex flex-col gap-2 text-[11px]">
              <div className="flex justify-between">
                <dt className="text-[#1b2a5c]/70">Session Subtotal</dt>
                <dd className="text-[#1b2a5c]">${session.price.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1 text-[#1b2a5c]/70">
                  Junior Hub Platform &amp; Recording <Info size={11} aria-hidden />
                </dt>
                <dd className="font-semibold text-[#0f6b60]">Included ($0.00)</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#1b2a5c]/70">Estimated Taxes</dt>
                <dd className="text-[#1b2a5c]">$0.00</dd>
              </div>
            </dl>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-base font-semibold text-[#1b2a5c]">Total Due</p>
                <p className="text-[10px] text-[#1b2a5c]/55">Held in escrow until session completion</p>
              </div>
              <p className="text-2xl font-bold text-[#1b2a5c]">${total.toFixed(2)}</p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!ready}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0f6b60] text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,107,96,0.3)] transition-colors hover:bg-[#0c5a51] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Payment <ArrowRight size={15} aria-hidden />
            </button>
            {!ready && (
              <p className="mt-2 text-center text-[10px] text-[#1b2a5c]/55">Pick a day and time, and tell {firstName} your idea to continue.</p>
            )}
            {saved && (
              <Alert variant="success" className="mt-3 p-3 text-xs">
                Your booking details are ready. The payment step isn&apos;t built yet.
              </Alert>
            )}

            <div className="mt-5 flex gap-3 rounded-xl bg-[#EEF0FB] p-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#DDF3E7] text-[#0f6b60]">
                <ShieldCheck size={14} aria-hidden />
              </span>
              <div>
                <p className="text-[11px] font-semibold text-[#1b2a5c]">100% Satisfaction Guarantee</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-[#1b2a5c]/65">
                  If the mentorship doesn&apos;t meet your technical expectations, request a free reschedule or full instant refund within
                  24 hours. Free cancellation up to 4 hours prior.
                </p>
              </div>
            </div>

            <figure className="mt-5">
              <p className="flex items-center gap-1 text-[10px] font-semibold text-[#1b2a5c]">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={11} className="fill-[#0f6b60] text-[#0f6b60]" aria-hidden />
                ))}
                <span className="ml-1">Verified Mentee</span>
              </p>
              <blockquote className="mt-1.5 text-[10px] italic leading-relaxed text-[#1b2a5c]/70">
                &quot;{firstName} untangled our team&apos;s distributed queue deadlocks in under 30 minutes and helped me prepare for my
                promotion interview. Worth 10x the price.&quot;
              </blockquote>
              <figcaption className="mt-2 flex items-center gap-2 text-[10px] text-[#1b2a5c]/60">
                <span className="grid size-6 place-items-center rounded-full bg-[#DDF3E7] text-[9px] font-semibold text-[#0f6b60]">MK</span>
                <span className="font-semibold text-[#1b2a5c]">Michelle K.</span> • Mom of 8th Grader Leo
              </figcaption>
            </figure>
          </div>
        </aside>
      </div>

      {/* Trust bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white px-5 py-4 text-[11px] shadow-[0_6px_24px_rgba(27,42,92,0.06)]">
        <ul className="flex flex-wrap items-center gap-5 font-semibold text-[#1b2a5c]">
          <li className="flex items-center gap-1.5"><Lock size={13} aria-hidden /> 256-bit Encrypted Checkout</li>
          <li className="flex items-center gap-1.5"><CalendarDays size={13} aria-hidden /> Flexible Rescheduling</li>
          <li className="flex items-center gap-1.5"><Video size={13} aria-hidden /> Automated HD Cloud Recording</li>
        </ul>
        <p className="text-[#1b2a5c]/60">
          Need custom company invoicing?{" "}
          <Link href="/contact" className="font-semibold text-[#2563EB] hover:underline">
            Contact Junior Hub Support
          </Link>
        </p>
      </div>
    </div>
  );
}
