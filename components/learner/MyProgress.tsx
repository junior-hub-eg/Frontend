"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, Award, BookOpen, Briefcase, CheckCircle2, Crown, Flame, Folder, Star } from "lucide-react";
import { getHub, type Hub } from "@/lib/hub-api";
import { getSquad, type Squad } from "@/lib/interns-api";
import {
  getAchievements,
  getTrackLessons,
  getTracks,
  lessonPath,
  trackPath,
  type Achievements,
  type TrackLessons,
  type TrackSummary,
} from "@/lib/learning-api";
import { getMentor, type MentorProfile } from "@/lib/mentorship-api";
import { TrackIcon } from "@/components/Courses/course-ui";
import { XP_PER_LEVEL } from "./dashboard-cards";
import { mentorAvatar } from "./ChooseMentorPage";

const IMG = "/images/Intern";
const BG = `${IMG}/bg-park.png`;

const glass = "rounded-[1.2em] border border-white/80 bg-white/55 shadow-lg shadow-[#14365a]/10 backdrop-blur-md";
const solid = "rounded-[1.2em] bg-white shadow-[0_8px_24px_rgba(20,54,90,0.08)]";

interface ProgressData {
  hub: Hub | null;
  tracks: TrackSummary[];
  lessons: Record<string, TrackLessons>;
  achievements: Achievements | null;
  squad: Squad | null;
  mentor: MentorProfile | null;
}

/** Everything on the page. Each request fails on its own, so one missing piece never blanks the page. */
function useProgressData() {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [hub, tracks, achievements, squad] = await Promise.all([
        getHub().catch(() => null),
        getTracks().catch(() => [] as TrackSummary[]),
        getAchievements().catch(() => null),
        getSquad().catch(() => null),
      ]);
      const learning = tracks.filter((t) => t.isLearning && t.hasLessons);
      const lessonList = await Promise.all(learning.map((t) => getTrackLessons(t.code).catch(() => null)));
      const lessons: Record<string, TrackLessons> = {};
      lessonList.forEach((l) => l && (lessons[l.trackCode] = l));
      const mentorId = hub?.mentorship.mentor?.id;
      const mentor = mentorId ? await getMentor(mentorId).catch(() => null) : null;
      if (active) setData({ hub, tracks, lessons, achievements, squad, mentor });
    })();
    return () => {
      active = false;
    };
  }, []);

  return data;
}

const allLessons = (t: TrackLessons) => t.modules.flatMap((m) => m.lessons);
const doneCount = (t: TrackLessons) => allLessons(t).filter((l) => l.status === "Done").length;

function Card({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${solid} min-w-0 p-[1.1em] ${className}`}>
      <div className="mb-[0.8em] flex items-center justify-between gap-[1em]">
        <h2 className="text-[1.15em] font-extrabold text-[#14365a]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-[0.8em] bg-[#f1f6fb] p-[1em] text-[0.85em] text-[#14365a]/70">{children}</p>;
}

function Ring({ percent }: { percent: number }) {
  return (
    <span
      role="img"
      aria-label={`${percent}% done`}
      className="grid h-[3.6em] w-[3.6em] place-items-center rounded-full text-[0.75em] font-bold text-[#14365a]"
      style={{ background: `conic-gradient(#12939b ${percent * 3.6}deg, #e3edf5 0deg)` }}
    >
      <span className="grid h-[2.7em] w-[2.7em] place-items-center rounded-full bg-white">{percent}%</span>
    </span>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyProgress() {
  const data = useProgressData();
  const hub = data?.hub ?? null;

  const xp = hub?.totalXp ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const xpInLevel = xp % XP_PER_LEVEL;

  const learningTracks = (data?.tracks ?? []).filter((t) => t.isLearning);
  const lessonSets = Object.values(data?.lessons ?? {});
  const lessonsDone = lessonSets.reduce((n, t) => n + doneCount(t), 0);
  const coursesDone = lessonSets.filter((t) => allLessons(t).length > 0 && doneCount(t) === allLessons(t).length).length;
  const badges = data?.achievements?.badges.length ?? 0;

  const focusCode = hub?.courses.track?.code;
  const focus = focusCode ? data?.lessons[focusCode] : undefined;
  const next = focus ? allLessons(focus).find((l) => l.id === focus.nextLessonId) : undefined;
  const focusPercent = hub?.courses.progressPercent ?? 0;

  const mentor = hub?.mentorship.mentor ?? null;
  const mentorLook = mentor ? mentorAvatar(mentor.id) : null;

  const stats = [
    { label: "Completed Courses", value: `${coursesDone}/${learningTracks.length}`, icon: BookOpen, color: "#4a9df8", bg: "#eaf4fe" },
    { label: "Lessons Completed", value: lessonsDone, icon: CheckCircle2, color: "#2fb36b", bg: "#e6f6ee" },
    { label: "Day Streak", value: hub?.streakDays ?? 0, icon: Flame, color: "#f97316", bg: "#fff1e6" },
    { label: "Badges Earned", value: badges, icon: Award, color: "#f5a623", bg: "#fff6dc" },
  ];

  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[75svh] [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:h-full lg:[mask-image:none]"
      >
        <Image src={BG} alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%]" />
      </div>

      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*8.5)]"
        style={{ fontSize: "clamp(12px, calc(var(--u) * 1.05), 17px)" }}
      >
        <div className="mx-auto flex max-w-[78em] flex-col gap-[1em]">
          {/* Header: title, level and the building */}
          <section className={`${glass} relative overflow-hidden p-[1.3em]`}>
            <div className="max-w-[34em]">
              <h1 className="text-[2.2em] font-extrabold leading-tight text-[#14365a]">My Progress</h1>
              <p className="mt-[0.3em] text-[0.9em] text-[#14365a]/80">
                Junior Hub is not just a course library — it&apos;s a complete learning opportunity in the tech world.
              </p>
              <div className="mt-[1em] flex items-center gap-[0.8em] rounded-[1em] bg-white/70 px-[0.9em] py-[0.7em]">
                <span className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-full bg-[#14365a] text-[#ffc531]">
                  <Crown className="h-[1.3em] w-[1.3em] fill-[#ffc531]" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[0.85em] font-bold text-[#14365a]">
                    <span>Level {level}</span>
                    <span>
                      {xpInLevel}/{XP_PER_LEVEL} XP
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="XP in this level"
                    aria-valuemin={0}
                    aria-valuemax={XP_PER_LEVEL}
                    aria-valuenow={xpInLevel}
                    className="mt-[0.4em] h-[0.5em] overflow-hidden rounded-full bg-[#dde6ee]"
                  >
                    <div className="h-full rounded-full bg-[#ffc531]" style={{ width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
            <Image
              src={`${IMG}/building-progress.png`}
              alt=""
              width={559}
              height={376}
              sizes="(max-width: 1024px) 0px, 26vw"
              className="pointer-events-none absolute -right-[1em] -top-[1em] hidden h-auto w-[24em] drop-shadow-[0_18px_22px_rgba(13,43,90,0.25)] lg:block"
            />
          </section>

          {/* Stats */}
          <ul className="grid grid-cols-2 gap-[1em] lg:grid-cols-4">
            {stats.map((s) => (
              <li key={s.label} className={`${solid} flex items-center gap-[0.8em] p-[0.9em]`}>
                <span className="grid h-[2.8em] w-[2.8em] shrink-0 place-items-center rounded-[0.8em]" style={{ backgroundColor: s.bg, color: s.color }}>
                  <s.icon className="h-[1.4em] w-[1.4em]" aria-hidden />
                </span>
                <span className="leading-tight">
                  <span className="block text-[1.4em] font-extrabold text-[#14365a]">{data ? s.value : "–"}</span>
                  <span className="text-[0.75em] text-[#14365a]/65">{s.label}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="grid gap-[1em] lg:grid-cols-2">
            {/* Continue learning */}
            <Card title="Continue Learning">
              {hub?.courses.hasTrack && hub.courses.track ? (
                <div className="flex items-center gap-[1em]">
                  <span className="grid h-[4em] w-[4em] shrink-0 place-items-center rounded-[1em] bg-[#e6f6ee] text-[#1f9d5b]">
                    <TrackIcon iconKey={data?.tracks.find((t) => t.code === hub.courses.track?.code)?.iconKey ?? ""} size={28} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.75em] font-semibold text-[#14365a]/60">{hub.courses.track.name}</p>
                    <p className="truncate text-[1em] font-bold text-[#14365a]">{next ? next.title : "Pick up where you left off"}</p>
                    <div className="mt-[0.5em] flex items-center gap-[0.6em]">
                      <div className="h-[0.5em] flex-1 overflow-hidden rounded-full bg-[#dde6ee]">
                        <div className="h-full rounded-full bg-[#12939b]" style={{ width: `${focusPercent}%` }} />
                      </div>
                      <span className="text-[0.75em] font-bold text-[#14365a]">{focusPercent}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Empty>You haven&apos;t chosen a track yet.</Empty>
              )}
              <Link
                href={((hub?.courses.track && next ? lessonPath(hub.courses.track.code, next.id) : "/learner/courses") as Route)}
                className="mt-[1em] flex h-[2.8em] items-center justify-center gap-[0.5em] rounded-[0.8em] bg-gradient-to-r from-[#14757d] to-[#14365a] text-[0.9em] font-bold text-white hover:opacity-90"
              >
                {hub?.courses.hasTrack ? "Continue Learning" : "Browse Courses"} <ArrowRight className="h-[1.1em] w-[1.1em]" aria-hidden />
              </Link>
            </Card>

            {/* My learning tracks */}
            <Card title="My Learning Tracks">
              {learningTracks.length === 0 ? (
                <Empty>Tracks you start will show up here.</Empty>
              ) : (
                <ul className="grid grid-cols-2 gap-[0.8em] sm:grid-cols-3">
                  {learningTracks.slice(0, 6).map((t) => {
                    const l = data?.lessons[t.code];
                    const total = l ? allLessons(l).length : 0;
                    const percent = total ? Math.round((doneCount(l!) / total) * 100) : 0;
                    return (
                      <li key={t.code}>
                        <Link
                          href={trackPath(t.code) as Route}
                          className="flex flex-col items-center gap-[0.4em] rounded-[1em] bg-[#f1f6fb] p-[0.8em] text-center hover:bg-[#e6eff8]"
                        >
                          <span className="text-[#12939b]">
                            <TrackIcon iconKey={t.iconKey} size={26} />
                          </span>
                          <span className="text-[0.8em] font-bold text-[#14365a]">{t.name}</span>
                          <Ring percent={percent} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Weekly progress */}
            <Card title="Weekly Learning Progress">
              {/* TODO(backend): there is no weekly activity endpoint yet; the bars stay flat until it exists. */}
              <div className="flex h-[10em] items-end gap-[0.8em]" role="img" aria-label="Weekly learning activity chart (no data yet)">
                {DAYS.map((d) => (
                  <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-[0.4em]">
                    <div className="w-full rounded-t-[0.4em] bg-[#dbe9f3]" style={{ height: "6%" }} />
                    <span className="text-[0.7em] text-[#14365a]/60">{d}</span>
                  </div>
                ))}
              </div>
              <p className="mt-[0.6em] text-[0.75em] text-[#14365a]/60">Your daily activity will appear here soon.</p>
            </Card>

            {/* Your mentor */}
            <Card
              title="Your Mentor"
              action={
                <Link href="/learner/mentorship" className="text-[0.8em] font-bold text-[#12939b] hover:underline">
                  {mentor ? "View" : "Choose"}
                </Link>
              }
            >
              {mentor && mentorLook ? (
                <div className="flex items-center gap-[1em]">
                  <span className="relative h-[6em] w-[6em] shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: mentorLook.bg }}>
                    <Image src={mentorLook.src} alt="" fill sizes="100px" className="object-cover" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[1.1em] font-bold text-[#14365a]">{mentor.fullName}</p>
                    <p className="text-[0.8em] text-[#14365a]/70">{mentor.title}</p>
                    {data?.mentor && (
                      <>
                        <p className="mt-[0.3em] flex items-center gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]">
                          <Star className="h-[1em] w-[1em] fill-[#ffc531] text-[#ffc531]" aria-hidden /> {data.mentor.mentor.rating.toFixed(1)}
                        </p>
                        <ul className="mt-[0.5em] flex flex-wrap gap-[0.4em]">
                          {data.mentor.mentor.skills.slice(0, 3).map((s) => (
                            <li key={s} className="rounded-[0.5em] bg-[#eaf3fb] px-[0.6em] py-[0.25em] text-[0.7em] font-semibold text-[#14365a]">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <Empty>You don&apos;t have a mentor yet.</Empty>
              )}
            </Card>

            {/* Current project */}
            <Card
              title="Current Working Project"
              action={
                <Link href="/learner/interns/internship" className="text-[0.8em] font-bold text-[#12939b] hover:underline">
                  Open
                </Link>
              }
            >
              {data?.squad ? (
                <div className="flex items-center gap-[1em]">
                  <span className="grid h-[4em] w-[4em] shrink-0 place-items-center rounded-[1em] bg-[#eaf4fe] text-[#2f7fd6]">
                    <Folder className="h-[2em] w-[2em]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[1em] font-bold text-[#14365a]">{data.squad.projectTitle}</p>
                    <p className="line-clamp-2 text-[0.8em] text-[#14365a]/70">{data.squad.projectDescription}</p>
                    <span className="mt-[0.4em] inline-block rounded-full bg-[#fff1c9] px-[0.7em] py-[0.15em] text-[0.7em] font-bold text-[#a86a00]">In Progress</span>
                  </div>
                </div>
              ) : (
                <Empty>
                  Join a squad to get your project.{" "}
                  <Link href="/learner/interns/internship" className="font-bold text-[#12939b] underline">
                    Join now
                  </Link>
                </Empty>
              )}
            </Card>

            {/* Opportunities */}
            <Card title="Opportunities">
              <ul className="grid gap-[0.8em] sm:grid-cols-2">
                {[
                  { title: "Internships", text: "Internships and career simulation", href: "/interns", icon: Briefcase, bg: "#fff1e6", color: "#c2571a" },
                  { title: "Recruitment", text: "Practice for your first job", href: "/recruitment", icon: Award, bg: "#e6f6ee", color: "#1f9d5b" },
                ].map((o) => (
                  <li key={o.title}>
                    <Link href={o.href as Route} className="flex h-full items-center gap-[0.8em] rounded-[1em] p-[0.9em] hover:opacity-90" style={{ backgroundColor: o.bg }}>
                      <span className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-[0.8em] bg-white" style={{ color: o.color }}>
                        <o.icon className="h-[1.3em] w-[1.3em]" aria-hidden />
                      </span>
                      <span className="leading-tight">
                        <span className="block text-[0.95em] font-bold text-[#14365a]">{o.title}</span>
                        <span className="text-[0.75em] text-[#14365a]/70">{o.text}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
