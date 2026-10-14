import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Globe, Mail, MessageCircle } from "lucide-react";
import { Curl } from "@/components/Auth/AuthDecorations";
import { Sparkle, SpikeBurst } from "./LandingDecorations";

const PRODUCT_LINKS: { label: string; href: Route }[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Monitor", href: "/monitor" },
  { label: "Interns", href: "/interns" },
  { label: "Recruitment", href: "/recruitment" },
];

const COMPANY_LINKS: { label: string; href: Route }[] = [
  { label: "About", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact Us", href: "/contact" },
];

export function LandingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#16244a] py-14">
      {/* Small decorations (positions follow the Figma) */}
      <Sparkle className="pointer-events-none absolute left-[16%] top-[22%] hidden h-6 w-6 text-[#12939b] md:block" />
      <Sparkle className="pointer-events-none absolute bottom-[14%] left-[26%] hidden h-6 w-6 text-[#12939b] md:block" />
      <SpikeBurst className="pointer-events-none absolute bottom-[2%] left-[37%] hidden h-12 w-12 text-[#12939b] md:block" />
      <span className="pointer-events-none absolute bottom-[2%] left-[50%] hidden h-4 w-8 rounded-b-full bg-white/75 md:block" />
      <Curl className="pointer-events-none absolute bottom-[2%] left-[58%] hidden h-14 w-9 md:block" />
      <Sparkle className="pointer-events-none absolute right-[26%] top-[26%] hidden h-7 w-7 text-white/80 md:block" />
      <Image
        src="/images/Auth/Vector-decoration.png"
        alt=""
        width={84}
        height={84}
        aria-hidden
        className="pointer-events-none absolute right-[17%] top-[38%] hidden w-9 opacity-70 md:block"
      />
      <Sparkle className="pointer-events-none absolute bottom-[10%] right-[22%] hidden h-6 w-6 text-[#12939b] md:block" />
      <Curl className="pointer-events-none absolute right-[10%] top-[10%] hidden h-10 w-6 md:block" />
      <Curl className="pointer-events-none absolute bottom-[2%] right-[8%] hidden h-14 w-9 scale-x-[-1] md:block" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 sm:grid-cols-[1.3fr_1fr_1fr_auto] lg:px-10">
        <div>
          <Image
            src="/images/Auth/logo.png"
            alt="Junior Hub"
            width={150}
            height={30}
            className="brightness-0 invert"
          />
          <p className="mt-3 text-sm font-medium text-white/70">Learn. Practice. Grow.</p>
          <p className="mt-1 max-w-[220px] text-xs text-white/45">A brighter future for every young learner.</p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/60">
          {PRODUCT_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col gap-2 text-sm text-white/60">
          {COMPANY_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-3 sm:items-start sm:justify-end">
          {[Globe, Mail, MessageCircle].map((Icon, i) => (
            <span
              key={i}
              className="grid size-9 place-items-center rounded-full border border-white/15 text-white/70"
            >
              <Icon size={16} />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}