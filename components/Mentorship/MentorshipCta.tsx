import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WaveLoop } from "@/components/Auth/AuthDecorations";

/** Closing band of the Mentorship page (Figma), different from the landing CtaBand. */
export function MentorshipCta() {
  return (
    <section className="px-6 py-12 lg:px-10">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[28px] bg-[#1b2a5c] px-6 py-16 text-center">
        <span aria-hidden className="pointer-events-none absolute -left-16 -top-16 size-64 rounded-full bg-[#12939b]/25 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 size-72 rounded-full bg-[#12939b]/25 blur-3xl" />
        <WaveLoop className="pointer-events-none absolute left-[6%] top-1/2 hidden h-10 w-14 text-[#12939b]/70 md:block" />
        <WaveLoop className="pointer-events-none absolute right-[6%] top-1/2 hidden h-10 w-14 -scale-x-100 text-[#12939b]/70 md:block" />

        <div className="relative mx-auto max-w-2xl">
          <span className="rounded-full bg-[#12939b]/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7fe8d6]">
            Accelerate Your Career
          </span>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl">Ready to Build Your Future with Junior Hub?</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/70">
            Join over 5,000 ambitious junior engineers who leveled up their skills and landed roles at tier-1 technology teams.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="#mentors"
              className="inline-flex items-center gap-2 rounded-full bg-[#12939b] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
            >
              Schedule Free Matching Call <ArrowRight size={15} aria-hidden />
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              Explore Learning Tracks
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
