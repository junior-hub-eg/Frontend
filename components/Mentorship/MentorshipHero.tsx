import Link from "next/link";
import { BadgeCheck, Code2, MessageSquareText, Rocket, Video } from "lucide-react";
import { Curl, CrossMark } from "@/components/Auth/AuthDecorations";

const FLOATING_CHIPS = [
  { icon: Video, label: "1:1 Video Calls", className: "left-0 top-6" },
  { icon: MessageSquareText, label: "Project Feedback", className: "right-0 top-0" },
  { icon: Code2, label: "Code Review", className: "left-4 bottom-8" },
  { icon: Rocket, label: "Career Support", className: "right-2 bottom-2" },
];

export function MentorshipHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#E9F7F4] to-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-6 py-14 md:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#12939b] shadow-sm">
            <BadgeCheck aria-hidden size={14} /> Verified mentors for young tech learners
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-[#1b2a5c] sm:text-4xl lg:text-5xl">
            Find Your Tech Mentor. <span className="text-[#12939b]">Accelerate Your Career.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#1b2a5c]/70">
            Connect with experienced professionals who guide your projects, review your work, and help you grow with
            confidence — one session at a time.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="#mentors"
              className="rounded-full bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Explore Mentors
            </Link>
            <Link
              href="/courses"
              className="rounded-full border border-[#12939b] bg-white px-6 py-3 text-sm font-semibold text-[#12939b] transition-colors hover:bg-[#E9F7F4]"
            >
              Explore Learning Tracks
            </Link>
          </div>
        </div>

        <div className="relative mx-auto hidden h-72 w-full max-w-md md:block" aria-hidden>
          <div className="absolute inset-6 rounded-[40%_60%_55%_45%/50%_45%_55%_50%] bg-[#bfece5]/70" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid size-28 place-items-center rounded-3xl bg-white text-[#12939b] shadow-lg">
              <Video size={44} strokeWidth={1.6} />
            </span>
          </div>
          {FLOATING_CHIPS.map(({ icon: Icon, label, className }) => (
            <span
              key={label}
              className={`absolute flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[11px] font-semibold text-[#1b2a5c] shadow-md ${className}`}
            >
              <Icon size={14} className="text-[#12939b]" /> {label}
            </span>
          ))}
          <Curl className="absolute -right-4 top-1/2 w-6" />
          <CrossMark className="absolute left-1/2 top-0 w-6" />
        </div>
      </div>
    </section>
  );
}
