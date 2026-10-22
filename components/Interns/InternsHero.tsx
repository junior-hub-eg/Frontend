"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, Play, ArrowRight } from "lucide-react";

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
              <Zap size={13} className="fill-[#12939b]" />
              <span>INTERNSHIP PROGRAM</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#1b2a5c] sm:text-5xl lg:text-[54px] lg:leading-[1.12]">
              Real Projects.<br />
              Real <span className="text-[#12939b]">Teams.</span>
              <br />
              <span className="text-[#12939b]">Real Experience.</span>
            </h1>

            {/* Description */}
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#1b2a5c]/75 sm:text-base">
              Join an Agile squad, work on real projects, and gain hands-on experience with the guidance of a
              Senior Team Leader. Build your skills, collaborate with your team, and prepare for your career.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/interns/portal"
                className="inline-flex items-center gap-2 rounded-full bg-[#12939b] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#12939b]/20 transition-all hover:bg-[#0f7a81] hover:shadow-lg active:scale-95"
              >
                <span>Explore interns</span>
                <ArrowRight size={16} />
              </Link>

              {/* Figma fills: the colour gradient, with the frosted glass on top at 50% */}
              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="relative isolate inline-flex h-14 items-center gap-2 overflow-hidden rounded-full px-7 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95"
              >
                <Image src="/images/Landing%20Page/Interns/55e7b74faabefe7f835a610cb9df64edacafc9c9.jpg" alt="" fill sizes="200px" className="object-cover" aria-hidden />
                <Image src="/images/Landing%20Page/Interns/40174ca2683c92fc391daa5a1fa5a0ae695b3b14.jpg" alt="" fill sizes="200px" className="object-cover opacity-50" aria-hidden />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
                    <Play size={13} className="ms-0.5 fill-[#B45B65] text-[#B45B65]" />
                  </span>
                  How It Works
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: the Figma illustration (transparent, cards included) */}
          <div className="lg:col-span-6 xl:col-span-6">
            <Image
              src="/images/Landing%20Page/Interns/image%2042.png"
              alt="Three Junior Hub interns working together on a laptop: real projects, team collaboration and career growth"
              width={826}
              height={465}
              priority
              sizes="(max-width: 1024px) 90vw, 46vw"
              className="mx-auto h-auto w-full max-w-[620px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
