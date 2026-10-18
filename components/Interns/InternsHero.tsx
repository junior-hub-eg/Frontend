"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Play, ArrowRight, FolderKanban, Users2, TrendingUp } from "lucide-react";

export function InternsHero() {
  const scrollToInternships = () => {
    document.getElementById("find-internships")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Headline and CTAs */}
          <div className="lg:col-span-6 xl:col-span-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#12939b]/25 bg-[#E9F7F4] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-[#12939b] shadow-xs">
              <GraduationCap size={15} />
              <span>INTERNSHIP PROGRAM</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#1b2a5c] sm:text-5xl lg:text-[54px] lg:leading-[1.12]">
              Real Projects .<br />
              <span className="text-[#12939b]">Real Teams .</span><br />
              Real Experience .
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#1b2a5c]/75 sm:text-base">
              Join an agile squad, work on real projects, and gain hands-on experience under the guidance
              of a Senior Team Leader. Build your skills, collaborate with your team, and prepare for your career.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/interns/portal"
                className="inline-flex items-center gap-2 rounded-full bg-[#12939b] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#12939b]/20 transition-all hover:bg-[#0f7a81] hover:shadow-lg active:scale-95"
              >
                <span>Explore Internships</span>
                <ArrowRight size={16} />
              </Link>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#7D2331] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#7D2331]/20 transition-all hover:bg-[#681d29] hover:shadow-lg active:scale-95"
              >
                <span className="grid size-6 place-items-center rounded-full bg-white text-[#7D2331]">
                  <Play size={11} className="ml-0.5 fill-[#7D2331]" />
                </span>
                <span>How it Works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Graphic with Floating Badges */}
          <div className="relative lg:col-span-6 xl:col-span-6">
            {/* Organic cyan/teal background blob shape */}
            <div
              className="pointer-events-none absolute -inset-4 -z-10 rounded-[48px] bg-gradient-to-tr from-[#12939b]/25 via-[#4fd1c5]/20 to-[#E9F7F4] opacity-90 blur-xl"
              aria-hidden
            />

            <div className="relative mx-auto max-w-[540px]">
              {/* Teal decorative backdrop card */}
              <div
                className="absolute inset-0 translate-x-3 translate-y-3 rounded-[36px] bg-gradient-to-br from-[#12939b]/30 via-[#14b8a6]/20 to-[#a7f3d0]/30"
                aria-hidden
              />

              {/* Main Photo */}
              <div className="relative overflow-hidden rounded-[32px] border-4 border-white bg-white shadow-2xl">
                <Image
                  src="/images/Intern/hero-students.jpg"
                  alt="Junior Hub tech interns and students working on real projects"
                  width={720}
                  height={540}
                  priority
                  className="h-[340px] w-full object-cover sm:h-[400px]"
                />
              </div>

              {/* Floating Badge 1: Real Projects (Top-Left) */}
              <div className="absolute -top-4 -left-4 sm:-top-5 sm:-left-6 z-20 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-1">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#E9F7F4] text-[#12939b]">
                  <FolderKanban size={18} />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#1b2a5c]">Real Projects</p>
                  <p className="text-[10px] text-[#1b2a5c]/60">Real-world codes</p>
                </div>
              </div>

              {/* Floating Badge 2: Team Collaboration (Top-Right) */}
              <div className="absolute -top-5 -right-3 sm:-top-6 sm:-right-5 z-20 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-1">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#E9F7F4] text-[#12939b]">
                  <Users2 size={18} />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#1b2a5c]">Team Collaboration</p>
                  <p className="text-[10px] text-[#1b2a5c]/60">Learn together</p>
                </div>
              </div>

              {/* Floating Badge 3: Career Growth (Bottom-Right) */}
              <div className="absolute -bottom-4 -right-3 sm:-bottom-5 sm:-right-4 z-20 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur-md transition-transform hover:-translate-y-1">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#E9F7F4] text-[#12939b]">
                  <TrendingUp size={18} />
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-[#1b2a5c]">Career Growth</p>
                  <p className="text-[10px] text-[#1b2a5c]/60">Advance your career</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
