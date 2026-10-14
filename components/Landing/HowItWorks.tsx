import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Monitor, PlayCircle, UserCheck, BookOpen } from "lucide-react";

const STEPS = [
  { title: "Discover", icon: CheckCircle2, text: "Take structured video courses with smart quizzes." },
  {
    title: "Try Subject",
    icon: PlayCircle,
    text: "AI interview evaluates your real skills and recommends what to study next.",
  },
  { title: "Choose Track", icon: BookOpen, text: "Work with expert mentors and get help whenever you're stuck." },
  { title: "Learn & Build", icon: Monitor, text: "Join a team, work on real projects, and earn scores." },
  { title: "Get Guidance", icon: UserCheck, text: "Practice with case studies and mock interviews." },
  {
    title: "Explore Opportunities",
    icon: Briefcase,
    text: "Get recommended to partner companies based on your profile.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-[#F7FBFA] py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[#12939b]">YOUR PATH, STEP BY STEP</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">How It Works</h2>
            <p className="mt-2 max-w-md text-sm text-[#1b2a5c]/60">A clear, guided journey from learning to career.</p>
          </div>
          <Link href="/courses" className="flex items-center gap-1 text-sm font-semibold text-[#12939b] hover:underline">
            View All Tracks <ArrowRight size={14} />
          </Link>
        </div>

        <div className="relative mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          <div className="absolute left-[8%] right-[8%] top-6 hidden h-px bg-[#12939b]/20 lg:block" aria-hidden />
          {STEPS.map(({ title, icon: Icon, text }, i) => (
            <div key={title} className="relative flex flex-col items-center text-center">
              <span className="relative z-10 grid size-12 place-items-center rounded-full bg-[#12939b] text-white shadow-sm">
                <Icon size={20} />
              </span>
              <p className="mt-3 text-sm font-semibold text-[#1b2a5c]">
                {String(i + 1).padStart(2, "0")}. {title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#1b2a5c]/60">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
