"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function MentorshipHero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-6 py-14 md:grid-cols-[1.1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <p className="flex flex-wrap items-center gap-2 text-[10px] text-[#1b2a5c]/70">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1b2a5c]/10 px-3 py-1 font-semibold uppercase tracking-wide text-[#1b2a5c]">
              <span className="size-1.5 rounded-full bg-[#1b2a5c]" aria-hidden /> {t("500+ Verified Mentors Online")}
            </span>
            <span aria-hidden>•</span> {t("Junior Hub Talent Network")}
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-[#1b2a5c] sm:text-5xl lg:text-[56px]">
            {t("Find Your Tech Mentor.")}
            <br />
            <span className="text-[#12939b]">
              {t("Accelerate Your")}
              <br />
              {t("Career.")}
            </span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#1b2a5c]/75">
            {t("Connect 1-on-1 with vetted senior engineers, staff architects, and design leaders from world-class teams. Get systematic code reviews, live interview practice, and bespoke roadmap guidance.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#mentors"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#12939b] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(18,147,155,0.3)] transition-colors hover:bg-[#0f7a81]"
            >
              {t("Explore Mentors")} <ArrowRight size={15} aria-hidden />
            </Link>
            <Link
              href="/courses"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#4A2C7A] px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span className="grid size-7 place-items-center rounded-full bg-white/20">
                <PlayCircle size={14} aria-hidden />
              </span>
              {t("Explore Learning Tracks")}
            </Link>
          </div>
        </div>

        <Image
          src="/images/Landing%20Page/Mentorship/image%2040.png"
          alt={t("A mentor and a student working together on a laptop: 1:1 mentorship, project feedback, career guidance and answers to any question")}
          width={713}
          height={600}
          priority
          sizes="(max-width: 768px) 90vw, 45vw"
          className="mx-auto h-auto w-full max-w-[560px]"
        />
      </div>
    </section>
  );
}
