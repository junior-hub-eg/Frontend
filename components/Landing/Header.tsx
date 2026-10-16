"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { ChevronDown } from "lucide-react";

const NAV_ITEMS: { label: string; href: Route }[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Monitor", href: "/monitor" },
  { label: "Interns", href: "/interns" },
  { label: "Recruitment", href: "/recruitment" },
];

export function LandingHeader({ activeHref = "/" }: { activeHref?: Route }) {
  return (
    <header className="relative z-30 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-[1760px] items-center justify-between gap-3 px-5 py-3 sm:px-8 lg:px-12">
        <Link href="/" className="shrink-0">
          <Image
            src="/images/Auth/logo.png"
            alt="Junior Hub"
            width={150}
            height={30}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-4 text-xs font-medium text-[#1b2a5c]/80 sm:flex lg:gap-8 lg:text-sm">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.href === activeHref ? "page" : undefined}
              className={item.href === activeHref ? "border-b-2 border-[#12939b] pb-1 text-[#12939b]" : "transition-colors hover:text-[#12939b]"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button className="hidden items-center gap-1 text-xs font-medium text-[#1b2a5c]/80 sm:flex lg:text-sm">
            EN <ChevronDown size={14} />
          </button>
          <Link
            href="/login"
            className="rounded-full bg-[#12939b] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#0f7a81] sm:text-sm"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
