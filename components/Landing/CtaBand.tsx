"use client";

import Image from "next/image";
import Link from "next/link";
import { Curl } from "@/components/Auth/AuthDecorations";
import { Sparkle } from "./LandingDecorations";
import { useT } from "@/lib/i18n/client";

export function CtaBand() {
  const t = useT();
  return (
    <section className="bg-white px-6 py-10 lg:px-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-[#1b2a5c] py-14">
        <Image
          src="/images/Landing%20Page/Home/Group%20172.png"
          alt=""
          width={419}
          height={277}
          className="pointer-events-none absolute bottom-0 start-0 w-44 opacity-90 sm:w-64 lg:w-80"
          aria-hidden
        />
        <Image
          src="/images/Landing%20Page/Home/Group%20173.png"
          alt=""
          width={450}
          height={277}
          className="pointer-events-none absolute bottom-0 end-0 w-44 opacity-90 sm:w-64 lg:w-80"
          aria-hidden
        />

        {/* Small decorations (positions follow the Figma) */}
        <Curl className="pointer-events-none absolute start-[15%] top-[6%] hidden h-20 w-11 md:block" />
        <Curl className="pointer-events-none absolute end-[11%] top-[3%] hidden h-20 w-11 scale-x-[-1] md:block" />
        <Sparkle className="pointer-events-none absolute start-[26%] top-[26%] hidden h-7 w-7 text-[#12939b] md:block" />
        <Sparkle className="pointer-events-none absolute start-[24%] top-[42%] hidden h-5 w-5 text-[#12939b] md:block" />
        <Sparkle className="pointer-events-none absolute bottom-[14%] start-[34%] hidden h-5 w-5 text-[#12939b] md:block" />
        <Sparkle className="pointer-events-none absolute end-[27%] top-[18%] hidden h-6 w-6 text-[#12939b] md:block" />
        <Sparkle className="pointer-events-none absolute bottom-[42%] end-[28%] hidden h-6 w-6 text-[#12939b] md:block" />

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white">{t("Ready to Build Your Future?")}</h2>
          <p className="mt-3 text-sm text-white/70">
            {t("Join Junior Hub today and start your journey from learning to real opportunities.")}
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#12939b] px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
          >
            {t("Log in")} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}