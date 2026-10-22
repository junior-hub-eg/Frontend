"use client";

import Image from "next/image";
import { Route, ShieldCheck, UserCheck, Rocket } from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";
import { Sparkle } from "./LandingDecorations";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const FEATURES = [
  { title: tk("Learn Your Way"), subtitle: tk("Short Videos, Quizzes, and Real Projects"), icon: Route },
  { title: tk("Get Experts Guidance"), subtitle: tk("Choose Mentor and receive Report"), icon: UserCheck },
  { title: tk("Explore Real Opportunities"), subtitle: tk("Internships and Career Simulation"), icon: Rocket },
  { title: tk("A safe Supportive Environment"), subtitle: tk("Built For students aged 12-18"), icon: ShieldCheck },
];

export function PlatformFeatures() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <Image
            src="/images/Landing%20Page/Home/student.png"
            alt={t("A Junior Hub student learning on a laptop")}
            width={762}
            height={603}
            sizes="(max-width: 1024px) 80vw, 36rem"
            className="relative z-10 h-auto w-full"
          />
          <Image
            src="/images/Landing%20Page/Home/flat-color-icons_idea.png"
            alt=""
            width={64}
            height={64}
            className="pointer-events-none absolute start-[40%] -top-6 z-10 w-14 sm:w-16"
            aria-hidden
          />
          <Image
            src="/images/Landing%20Page/Home/bitcoin-icons_code-filled.png"
            alt=""
            width={24}
            height={24}
            className="pointer-events-none absolute start-[64%] top-[16%] z-10 w-9"
            aria-hidden
          />
          <Curl className="pointer-events-none absolute end-[4%] top-[20%] z-10 h-10 w-7 text-[#12939b]" />
          <Curl className="pointer-events-none absolute start-[46%] top-[36%] z-10 h-9 w-6 -scale-x-100 text-[#12939b]" />
          <span className="pointer-events-none absolute start-[71%] top-[30%] z-10 size-3 rounded-full bg-[#92E1D3]" />
          <span className="pointer-events-none absolute start-[64%] top-[39%] z-10 size-2.5 rounded-full bg-[#12939b]" />
          <Sparkle className="pointer-events-none absolute end-[4%] top-[54%] z-10 h-7 w-7 text-[#12939b]" />
        </div>

        <div className="relative">
          <Image
            src="/images/Landing%20Page/Home/Back%20Back-3.png"
            alt=""
            width={107}
            height={116}
            className="pointer-events-none absolute -top-4 end-0 w-10 opacity-80 sm:end-10"
            aria-hidden
          />
          <p className="text-xs font-semibold tracking-wide text-[#12939b]">{t("MORE THAN JUST COURSES")}</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a5c]">
            {t("A Platform Built")} <br className="hidden sm:block" />
            {t("for")} <span className="text-[#12939b]">{t("Your Future")}</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#1b2a5c]/65">
            {t("Junior Hub is not just a course library. It's a complete learning pipeline designed to help you discover, grow, and reach real opportunities in the tech world.")}
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {FEATURES.map(({ title, subtitle, icon: Icon }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#E9F7F4] text-[#12939b]">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#1b2a5c]">{t(title)}</p>
                  <p className="text-xs text-[#1b2a5c]/60">{t(subtitle)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
