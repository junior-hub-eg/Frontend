import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { Globe, Mail, MessageCircle } from "lucide-react";
import { CrossMark, Curl, WaveLoop } from "@/components/Auth/AuthDecorations";

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
    <footer className="relative overflow-hidden bg-[#1b2a5c] py-7">
      <Curl className="absolute -right-1 top-0 h-12 w-8 rotate-[-25deg] opacity-90" aria-hidden />
      <Curl className="absolute bottom-0 right-[9%] h-10 w-6 rotate-[20deg] opacity-90" aria-hidden />
      <WaveLoop className="absolute bottom-0 left-[59%] w-9 opacity-90" aria-hidden />
      <CrossMark className="absolute left-[22%] top-2 h-5 w-5 opacity-80" aria-hidden />
      <CrossMark className="absolute bottom-2 left-[39%] h-5 w-5 opacity-70" aria-hidden />
      <span className="absolute bottom-5 right-[18%] size-4 rotate-45 bg-[#b5dbd5]" aria-hidden />
      <div className="relative mx-auto grid max-w-[1760px] grid-cols-[1fr_1.8fr_auto] items-center gap-6 px-5 sm:px-8 lg:px-12">
        <div className="min-w-0">
          <Image
            src="/images/Auth/logo.png"
            alt="Junior Hub"
            width={150}
            height={30}
            className="brightness-0 invert"
          />
          <p className="mt-1 text-[10px] font-medium text-white/80">Learn. Practice. Grow.</p>
          <p className="mt-0.5 max-w-[220px] text-[9px] text-white/70">A brighter future for every young learner.</p>
        </div>

        <div className="flex flex-col items-center gap-2 text-xs text-white/80">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Product">
            {PRODUCT_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2" aria-label="Company">
            {COMPANY_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex gap-1.5">
          {[Globe, Mail, MessageCircle].map((Icon, i) => (
            <span key={i} className="grid size-4 place-items-center rounded-sm bg-white text-[#1b2a5c]">
              <Icon size={11} strokeWidth={2.5} />
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
