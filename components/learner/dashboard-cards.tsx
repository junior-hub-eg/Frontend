"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, CalendarCheck, Crown, Flame, Gift, LoaderCircle, X, CalendarClock } from "lucide-react";
import { getAchievements, type Achievements } from "@/lib/learning-api";
import { getMySessions, sessionTime, type MentorSession } from "@/lib/mentorship-api";

/** XP per dashboard level. The backend keeps total XP only, so the level is worked out here. */
export const XP_PER_LEVEL = 500;

/** XP for a task moved to Done (backend Xp:TaskDone). */
const TASK_XP = 20;

const glass = "rounded-[1.2em] border border-white/80 bg-white/45 shadow-lg shadow-[#14365a]/10 backdrop-blur-md";

/** The student's track in focus with their level in it (from the AI interview) and how much of the track is done. */
export function LevelCard({
  track,
  level,
  progressPercent,
  className = "",
}: {
  track: string;
  level: string;
  progressPercent: number;
  className?: string;
}) {
  const percent = Math.min(100, Math.max(0, progressPercent));
  return (
    <div className={`${glass} flex items-center gap-[0.9em] px-[1em] py-[0.8em] ${className}`}>
      <span className="grid h-[2.8em] w-[2.8em] shrink-0 place-items-center rounded-full bg-[#14365a] text-[#ffc531] shadow-inner">
        <Crown className="h-[1.4em] w-[1.4em] fill-[#ffc531]" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-[0.8em] text-[#14365a]">
          <span className="flex min-w-0 items-center gap-[0.5em]">
            <span className="truncate text-[1em] font-bold">{track}</span>
            <span className="shrink-0 rounded-full bg-[#2fa59b]/15 px-[0.6em] py-[0.1em] text-[0.75em] font-bold text-[#12797f]">
              {level}
            </span>
          </span>
          <span className="shrink-0 text-[0.9em] font-bold">{percent}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${track}: ${percent}% done`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="mt-[0.5em] h-[0.45em] overflow-hidden rounded-full bg-white/70"
        >
          <div className="h-full rounded-full bg-[#2fa59b]" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

/** Figma "Daily Challenge": move one of your tasks today. Opens the squad board. */
export function DailyChallengeCard({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/learner/interns/internship"
      className={`${glass} group flex items-center gap-[0.9em] p-[0.7em] pr-[1em] ${className}`}
    >
      <span className="grid h-[3.6em] w-[3.6em] shrink-0 place-items-center rounded-[0.9em] bg-gradient-to-br from-[#3b82f6] to-[#14365a] text-white shadow-md">
        <CalendarCheck className="h-[1.8em] w-[1.8em]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[1em] font-bold text-[#14365a]">Daily Challenge</span>
        <span className="block text-[0.8em] text-[#14365a]/75">Complete 1 task today</span>
        <span className="mt-[0.4em] inline-block rounded-full bg-[#ffd84d] px-[0.7em] py-[0.15em] text-[0.75em] font-bold text-[#7a5200]">
          +{TASK_XP} XP
        </span>
      </span>
      <span className="grid h-[2em] w-[2em] shrink-0 place-items-center rounded-[0.5em] bg-[#2fa59b] text-white transition-transform group-hover:translate-x-0.5">
        <ArrowRight className="h-[1.1em] w-[1.1em]" />
      </span>
    </Link>
  );
}

/** The next session the student booked with a mentor (GET /student/sessions), linking to the mentor page. */
export function NextSessionCard({ className = "" }: { className?: string }) {
  const [next, setNext] = useState<MentorSession | null>(null);

  useEffect(() => {
    let active = true;
    getMySessions().then(
      (list) => active && setNext(list[0] ?? null),
      () => {},
    );
    return () => {
      active = false;
    };
  }, []);

  if (!next) return null;
  return (
    <Link href="/learner/mentorship" className={`${glass} flex items-center gap-[0.8em] p-[0.7em] pr-[1em] ${className}`}>
      <span className="grid h-[3em] w-[3em] shrink-0 place-items-center rounded-[0.9em] bg-gradient-to-br from-[#2fa59b] to-[#14365a] text-white">
        <CalendarClock className="h-[1.5em] w-[1.5em]" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.95em] font-bold text-[#14365a]">
          {next.type === "OneToOne" ? "1:1" : "Group"} session with {next.mentor.fullName}
        </span>
        <span className="block text-[0.8em] text-[#14365a]/75">{sessionTime(next.startsUtc)}</span>
      </span>
    </Link>
  );
}

/** Figma "Rewards": total XP, the learning streak and the badges earned (GET /student/achievements). */
export function RewardsButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Achievements | null>(null);
  const [failed, setFailed] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || data) return;
    let active = true;
    getAchievements().then(
      (a) => active && setData(a),
      () => active && setFailed(true)
    );
    return () => {
      active = false;
    };
  }, [open, data]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={box} className={`relative ${className}`}>
      {open && (
        <section
          aria-label="Your rewards"
          className="absolute bottom-full right-0 mb-[0.6em] w-[17em] rounded-[1.2em] border border-white/80 bg-white/90 p-[1em] text-[#14365a] shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[1.05em] font-extrabold">Your rewards</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-[#14365a]/60 hover:text-[#14365a]">
              <X className="h-[1.1em] w-[1.1em]" />
            </button>
          </div>
          {!data && !failed && <LoaderCircle className="mx-auto my-[1em] h-[1.6em] w-[1.6em] animate-spin text-[#12939b]" />}
          {failed && <p className="mt-[0.6em] text-[0.85em] text-[#14365a]/70">We couldn&apos;t load your rewards. Please try again.</p>}
          {data && (
            <>
              <div className="mt-[0.8em] grid grid-cols-2 gap-[0.6em] text-center">
                <p className="rounded-[0.8em] bg-[#e9f7f4] p-[0.6em]">
                  <span className="block text-[1.3em] font-extrabold">{data.totalXp}</span>
                  <span className="text-[0.75em]">Total XP</span>
                </p>
                <p className="rounded-[0.8em] bg-[#fff4e5] p-[0.6em]">
                  <span className="flex items-center justify-center gap-[0.2em] text-[1.3em] font-extrabold">
                    <Flame className="h-[0.9em] w-[0.9em] text-[#f97316]" /> {data.streakDays}
                  </span>
                  <span className="text-[0.75em]">Day streak</span>
                </p>
              </div>
              <h3 className="mt-[0.9em] text-[0.85em] font-bold">Badges</h3>
              {data.badges.length === 0 ? (
                <p className="mt-[0.3em] text-[0.8em] text-[#14365a]/65">Pass a lesson linked to school to earn your first badge.</p>
              ) : (
                <ul className="mt-[0.4em] flex max-h-[10em] flex-col gap-[0.4em] overflow-y-auto">
                  {data.badges.map((b) => (
                    <li key={b.code} className="flex items-center gap-[0.5em] text-[0.8em]">
                      <Award className="h-[1.3em] w-[1.3em] shrink-0 text-[#d4a017]" />
                      <span className="min-w-0 flex-1 truncate font-semibold">{b.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-[6.4em] w-[6.4em] flex-col items-center justify-center gap-[0.2em] rounded-[1.2em] border border-white/80 bg-white/45 text-[0.85em] font-bold text-[#14365a] shadow-lg shadow-[#14365a]/10 backdrop-blur-md hover:bg-white/60"
      >
        <Gift className="h-[2.6em] w-[2.6em] text-[#e11d48]" strokeWidth={1.8} />
        Rewards
      </button>
    </div>
  );
}
