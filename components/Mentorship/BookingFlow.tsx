"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, ShieldCheck, Star } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { SESSION_TYPES, type Mentor } from "@/lib/data/mentors";
import { cn } from "@/lib/utils";
import { BookingCalendar } from "./BookingCalendar";
import { MentorAvatar } from "./MentorAvatar";

const INTERESTS = ["Games", "Python Mini-Games", "My First Website", "Homework & AP CS"];
const STEPS = ["Session Type", "Date & Time", "Connect & Pay", "Confirm"];
const IDEA_MAX = 280;
const noopSubscribe = () => () => {};

function slotsFor(date: Date) {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const base = weekend
    ? [
        { time: "10:00 AM", label: "Morning Session" },
        { time: "12:00 PM", label: "Midday Session" },
        { time: "2:00 PM", label: "Afternoon Session" },
      ]
    : [
        { time: "3:30 PM", label: "Right After School" },
        { time: "4:30 PM", label: "Homework Break" },
        { time: "6:00 PM", label: "Evening Slot" },
      ];
  // MOCK: a deterministic slot is "booked".
  return base.map((s, i) => ({ ...s, booked: (date.getDate() + i) % 4 === 0 }));
}

function SectionCard({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#dfe7e5] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">{step}</p>
      <h2 className="mt-1 text-base font-bold text-[#1b2a5c]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BookingFlow({ mentor }: { mentor: Mentor }) {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const firstName = mentor.name.split(" ")[0];

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [interest, setInterest] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [link, setLink] = useState("");
  const [saved, setSaved] = useState(false);

  const session = SESSION_TYPES.find((s) => s.id === sessionId) ?? null;
  const fee = session ? Math.round(session.price * 0.1 * 100) / 100 : 0;
  const total = (session?.price ?? 0) + fee;
  const currentStep = !session ? 1 : !date || !time ? 2 : 3;
  const ready = !!session && !!date && !!time && idea.trim().length >= 10;

  const dateLabel = date
    ? `${date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}${time ? ` · ${time}` : ""}`
    : "Not selected yet";

  function handleContinue() {
    if (!ready) return;
    // TODO(backend): create the booking, then go to the payment step (not designed yet).
    setSaved(true);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 py-8 lg:px-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-[#1b2a5c]/60">
        <Link href="/monitor" className="inline-flex items-center gap-1 font-medium text-[#12939b] hover:underline">
          <ArrowLeft aria-hidden size={13} /> Mentorship
        </Link>
        <span>/</span>
        <span>{mentor.name}</span>
        <span>/</span>
        <span className="text-[#1b2a5c]">Book a Session</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#1b2a5c]">Schedule Mentorship with {mentor.name}</h1>
        <ol className="flex flex-wrap items-center gap-2 text-[11px] font-medium" aria-label="Booking steps">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = n < currentStep;
            const active = n === currentStep;
            return (
              <li key={label} className="flex items-center gap-1.5" aria-current={active ? "step" : undefined}>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-[10px] font-semibold",
                    done || active ? "bg-[#12939b] text-white" : "bg-[#e8eeed] text-[#1b2a5c]/50"
                  )}
                >
                  {done ? <Check size={11} /> : n}
                </span>
                <span className={active ? "text-[#12939b]" : "text-[#1b2a5c]/60"}>{label}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {/* Step 1 */}
          <SectionCard step="Step 1 · Session type" title="What kind of session would you like?">
            <div className="grid gap-3 sm:grid-cols-3">
              {SESSION_TYPES.map((s) => {
                const active = s.id === sessionId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSessionId(s.id)}
                    aria-pressed={active}
                    className={cn(
                      "relative rounded-xl border p-3 text-left transition-colors",
                      active ? "border-[#12939b] bg-[#E9F7F4]" : "border-[#dfe7e5] hover:border-[#12939b]/50"
                    )}
                  >
                    {s.popular && (
                      <span className="absolute right-2 top-2 rounded-full bg-[#12939b] px-2 py-0.5 text-[9px] font-semibold text-white">Popular</span>
                    )}
                    <p className="text-lg font-bold text-[#1b2a5c]">{s.price === 0 ? "Free" : `$${s.price}`}</p>
                    <p className="text-[10px] text-[#1b2a5c]/60">/ {s.minutes} min</p>
                    <p className="mt-2 text-xs font-semibold text-[#1b2a5c]">{s.title}</p>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#1b2a5c]/65">{s.description}</p>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* Step 2 */}
          <SectionCard step="Step 2 · Availability" title="Choose an After-School or Weekend Time">
            <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-[#E9F7F4] px-3 py-2 text-[11px] text-[#1b2a5c]/80">
              <Clock aria-hidden size={13} className="text-[#12939b]" /> All times are shown in your local timezone.
            </p>
            {isClient ? (
              <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
                <BookingCalendar
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setTime(null);
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-[#1b2a5c]">
                    {date ? date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }) : "Pick a day"}
                  </p>
                  {date ? (
                    <ul className="mt-3 flex flex-col gap-2">
                      {slotsFor(date).map((slot) => (
                        <li key={slot.time}>
                          <button
                            type="button"
                            disabled={slot.booked}
                            onClick={() => setTime(slot.time)}
                            aria-pressed={time === slot.time}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors",
                              time === slot.time
                                ? "border-[#12939b] bg-[#12939b] text-white"
                                : slot.booked
                                  ? "border-[#e8eeed] text-[#1b2a5c]/30 line-through"
                                  : "border-[#dfe7e5] text-[#1b2a5c] hover:border-[#12939b]"
                            )}
                          >
                            <span className="font-semibold">{slot.time}</span>
                            <span className={cn("text-[10px]", time === slot.time ? "text-white/80" : "text-[#1b2a5c]/55")}>
                              {slot.booked ? "Booked" : slot.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-[#1b2a5c]/60">Select an available day to see time slots.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-64" aria-hidden />
            )}
          </SectionCard>

          {/* Step 3 */}
          <SectionCard step="Step 3 · Your idea" title={`Tell ${firstName} what you'd love to build!`}>
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-xs font-semibold text-[#1b2a5c]">1. What sounds most fun to work on?</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setInterest(item)}
                      aria-pressed={interest === item}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        interest === item ? "border-[#12939b] bg-[#12939b] text-white" : "border-[#dfe7e5] text-[#1b2a5c] hover:border-[#12939b]"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="idea" className="mb-2 block text-xs font-semibold text-[#1b2a5c]">
                  2. Tell {firstName} what you want to build
                </label>
                <textarea
                  id="idea"
                  value={idea}
                  maxLength={IDEA_MAX}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={4}
                  placeholder="I'm building a small game where…"
                  className="w-full resize-none rounded-xl border border-[#dfe7e5] p-3 text-xs text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40 focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                />
                <p className="mt-1 text-right text-[10px] text-[#1b2a5c]/50">
                  {idea.length}/{IDEA_MAX}
                </p>
              </div>

              <div>
                <label htmlFor="project-link" className="mb-2 block text-xs font-semibold text-[#1b2a5c]">
                  3. Post a project link <span className="font-normal text-[#1b2a5c]/50">(optional)</span>
                </label>
                <input
                  id="project-link"
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://github.com/your-name/your-project"
                  className="w-full rounded-xl border border-[#dfe7e5] px-3 py-2.5 text-xs text-[#1b2a5c] outline-none placeholder:text-[#1b2a5c]/40 focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                />
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[#E9F7F4] p-3">
                <ShieldCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-[#12939b]" />
                <div>
                  <p className="text-xs font-semibold text-[#1b2a5c]">4. Safe Classroom Setup</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[#1b2a5c]/70">
                    Sessions happen inside the Junior Hub Safe Classroom — mentors are verified, chats are moderated, and a
                    guardian can review every session.
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <MentorAvatar name={mentor.name} className="size-12" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1b2a5c]">{mentor.name}</p>
                <p className="truncate text-[11px] text-[#1b2a5c]/65">{mentor.company}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[#1b2a5c]">
                  <Star aria-hidden size={11} className="fill-[#F5A623] text-[#F5A623]" />
                  <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
                  <span className="text-[#1b2a5c]/60">({mentor.reviews} reviews)</span>
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#1b2a5c]">Booking Summary</h2>
            <dl className="mt-3 flex flex-col gap-2 text-xs">
              {[
                ["Session", session?.title ?? "Not selected yet"],
                ["Duration", session ? `${session.minutes} minutes` : "—"],
                ["Date & Time", dateLabel],
                ["Platform", "Junior Hub Safe Classroom"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-[#1b2a5c]/60">{k}</dt>
                  <dd className="text-right font-medium text-[#1b2a5c]">{v}</dd>
                </div>
              ))}
            </dl>
            <dl className="mt-3 flex flex-col gap-1.5 border-t border-[#e8eeed] pt-3 text-xs">
              <div className="flex justify-between"><dt className="text-[#1b2a5c]/60">Session fee</dt><dd>${(session?.price ?? 0).toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt className="text-[#1b2a5c]/60">Platform fee</dt><dd>${fee.toFixed(2)}</dd></div>
              <div className="flex justify-between pt-1 text-sm font-bold text-[#1b2a5c]"><dt>Total Due</dt><dd>${total.toFixed(2)}</dd></div>
            </dl>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!ready}
              className="mt-4 h-11 w-full rounded-xl bg-linear-to-r from-[#14757d] to-[#1b2a5c] text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to Payment
            </button>
            {!ready && (
              <p className="mt-2 text-center text-[10px] text-[#1b2a5c]/55">
                Choose a session, a time, and describe your idea to continue.
              </p>
            )}
            {saved && (
              <Alert variant="success" className="mt-3 p-3 text-xs">
                Your booking details are ready. The payment step isn&apos;t built yet.
              </Alert>
            )}
          </div>

          <div className="rounded-2xl bg-[#E9F7F4] p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#1b2a5c]">
              <ShieldCheck aria-hidden size={14} className="text-[#12939b]" /> 100% Satisfaction Guarantee
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#1b2a5c]/70">
              Not happy with your first session? We&apos;ll help you find a better match.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
