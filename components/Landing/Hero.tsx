"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";
import { useT } from "@/lib/i18n/client";

export function Hero() {
  const t = useT();
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Decorative curl */}
      <Curl
        className="absolute start-0 top-24 w-10 -scale-x-100 opacity-60"
        aria-hidden
      />

      <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-8 sm:gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-4 lg:px-10 lg:py-10">
        {/* Left: Hero Content */}
        <div className="relative z-10">
          {/* Soft background blur */}
          <Image
            src="/images/Landing%20Page/Home/Background-Blur.png"
            alt=""
            width={290}
            height={296}
            className="pointer-events-none absolute -start-2 top-0 w-64 opacity-50 sm:start-8 sm:w-72"
            aria-hidden
          />

          <span className="inline-flex items-center rounded-full border border-[#C6EBDD] bg-white/90 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#1B2A5C]/80 shadow-sm sm:text-xs">
            {t("YOUR FUTURE STARTS HERE")}
          </span>

          <h1 className="mt-4 max-w-[540px] text-[34px] font-bold leading-[1.12] tracking-tight text-[#1B2A5C] sm:text-4xl lg:text-[38px] xl:text-[42px]">
            {t("Discover")}
            <br />
            {t("Your")} <span className="text-[#128B91]">{t("Interests.")}</span>
            <br />
            {t("Build Your")} <span className="text-[#128B91]">{t("Future.")}</span>
          </h1>

          <p className="mt-4 max-w-[440px] text-[12px] leading-[1.65] text-[#1B2A5C]/75 sm:text-[13px]">
            {t("Explore technology tracks, learn through short videos, connect with mentors, and experience the world of internships and recruitment.")}
          </p>

          {/* Hero Actions */}
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link
              href="/courses"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#128B91] px-4 text-[11px] font-semibold text-white transition-colors hover:bg-[#0F777D] sm:px-5"
            >
              {t("Explore Courses")}
              <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
            </Link>

            <button
              type="button"
              className="relative isolate inline-flex h-11 items-center gap-2 overflow-hidden rounded-full px-4 text-[11px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 sm:px-5"
            >
              <Image
                src="/images/Landing%20Page/Home/40174ca2683c92fc391daa5a1fa5a0ae695b3b14.jpg"
                alt=""
                fill
                className="object-cover"
                aria-hidden
              />
              <Image
                src="/images/Landing%20Page/Home/55e7b74faabefe7f835a610cb9df64edacafc9c9.jpg"
                alt=""
                fill
                className="object-cover opacity-50"
                aria-hidden
              />
              <span className="relative z-10 flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white">
                  <Play size={13} className="ms-0.5 fill-[#B45B65] text-[#B45B65]" />
                </span>
                {t("How It Works")}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="relative mx-auto mt-2 w-full max-w-[560px] lg:mt-0 lg:max-w-none">
          {/* Decorative graphic */}
          <Image
            src="/images/Landing%20Page/Home/Component%201.png"
            alt=""
            width={339}
            height={220}
            className="pointer-events-none absolute -start-3 top-0 z-0 w-28 sm:-start-5 sm:w-40 lg:-start-4 lg:w-44"
            aria-hidden
          />

          <Image
            src="/images/Landing%20Page/Home/Group%205.png"
            alt={t("Two Junior Hub students with AI assessment, real projects, and mentorship")}
            width={754}
            height={565}
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 85vw, 48vw"
            className="relative z-10 h-auto w-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
