"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Monitor, PlayCircle, UserCheck, BookOpen } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const STEPS = [
  { title: tk("Discover"), icon: CheckCircle2, text: tk("Take structured video courses with smart quizzes.") },
  {
    title: tk("Try Subject"),
    icon: PlayCircle,
    text: tk("AI interview evaluates your real skills and recommends what to study next."),
  },
  { title: tk("Choose Track"), icon: BookOpen, text: tk("Work with expert mentors and get help whenever you're stuck.") },
  { title: tk("Learn & Build"), icon: Monitor, text: tk("Join a team, work on real projects, and earn scores.") },
  { title: tk("Get Guidance"), icon: UserCheck, text: tk("Practice with case studies and mock interviews.") },
  {
    title: tk("Explore Opportunities"),
    icon: Briefcase,
    text: tk("Get recommended to partner companies based on your profile."),
  },
];

export function HowItWorks() {
  const t = useT();
  return (
    <section className="relative bg-white py-20">
      <Image
        src="/images/Landing%20Page/Home/Back%20Back-2.png"
        alt=""
        width={107}
        height={116}
        className="pointer-events-none absolute top-6 end-6 w-12 opacity-80 lg:end-10"
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#12939b]">{t("YOUR PATH, STEP BY STEP")}</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">{t("How It Works")}</h2>
            <p className="mt-2 max-w-md text-sm text-[#1b2a5c]/60">{t("A clear, guided journey from learning to career.")}</p>
          </div>
          <Link href="/courses" className="flex items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline">
            {t("View All Tracks")} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          <div className="absolute start-[8%] end-[8%] top-6 hidden h-[3px] lg:block" aria-hidden>
            <Image
              src="/images/Landing%20Page/Home/Line%203.png"
              alt=""
              fill
              className="object-cover opacity-60"
            />
          </div>
          {STEPS.map(({ title, icon: Icon, text }, i) => (
            <div key={title} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 grid size-12 place-items-center rounded-full bg-[#12939b] text-white shadow-sm">
                <Icon size={20} />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#1b2a5c]">
                {String(i + 1).padStart(2, "0")}. {t(title)}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#1b2a5c]/60">{t(text)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
