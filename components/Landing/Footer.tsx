"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Curl } from "@/components/Auth/AuthDecorations";
import { FacebookIcon, InstagramIcon, Sparkle, SpikeBurst, WhatsAppIcon } from "./LandingDecorations";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const PRODUCT_LINKS: { label: string; href: Route }[] = [
  { label: tk("Home"), href: "/" },
  { label: tk("Courses"), href: "/courses" },
  { label: tk("Monitor"), href: "/monitor" },
  { label: tk("Interns"), href: "/interns" },
  { label: tk("Recruitment"), href: "/recruitment" },
];

const COMPANY_LINKS: { label: string; href: Route }[] = [
  { label: tk("About"), href: "/about" },
  { label: tk("Privacy Policy"), href: "/privacy" },
  { label: tk("Terms of Service"), href: "/terms" },
  { label: tk("Contact Us"), href: "/contact" },
];

export function LandingFooter() {
  const t = useT();
  return (
    <footer className="relative overflow-hidden bg-[#16244a] py-14">
      {/* Small decorations (positions follow the Figma) */}
      <Sparkle className="pointer-events-none absolute start-[16%] top-[22%] hidden h-6 w-6 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute bottom-[14%] start-[26%] hidden h-6 w-6 text-[#12939b] md:block" />
      <SpikeBurst className="pointer-events-none absolute bottom-[2%] start-[37%] hidden h-12 w-12 text-[#12939b] md:block" />
      <span className="pointer-events-none absolute bottom-[2%] start-[50%] hidden h-4 w-8 rounded-b-full bg-white/75 md:block" />
      <Curl className="pointer-events-none absolute bottom-[2%] start-[58%] hidden h-14 w-9 md:block" />
      <Sparkle className="pointer-events-none absolute end-[26%] top-[26%] hidden h-7 w-7 text-white/80 md:block" />
      <Image
        src="/images/Auth/Vector-decoration.png"
        alt=""
        width={84}
        height={84}
        aria-hidden
        className="pointer-events-none absolute end-[17%] top-[38%] hidden w-9 opacity-70 md:block"
      />
      <Sparkle className="pointer-events-none absolute bottom-[10%] end-[22%] hidden h-6 w-6 text-[#12939b] md:block" />
      <Curl className="pointer-events-none absolute end-[10%] top-[10%] hidden h-10 w-6 md:block" />
      <Curl className="pointer-events-none absolute bottom-[2%] end-[8%] hidden h-14 w-9 scale-x-[-1] md:block" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 sm:flex-row sm:items-start sm:justify-between lg:px-10">
        <div>
          <Image
            src="/images/Auth/logo.png"
            alt={t("Junior Hub")}
            width={150}
            height={30}
            className="brightness-0 invert"
          />
          <p className="mt-3 text-sm font-medium text-white/70">{t("Learn. Practice. Grow.")}</p>
          <p className="mt-1 max-w-[220px] text-xs text-white/45">{t("A brighter future for every young learner.")}</p>
        </div>

        <div className="flex flex-col gap-3 text-sm text-white/60 sm:items-center">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {PRODUCT_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {t(l.label)}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {COMPANY_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {t(l.label)}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {[FacebookIcon, WhatsAppIcon, InstagramIcon].map((Icon, i) => (
            <span
              key={i}
              className="grid size-9 place-items-center rounded-xl bg-white text-[#16244a]"
            >
              <Icon className="size-4" />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}