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

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <Link href="/" className="shrink-0">
          <Image src="/images/Auth/logo.png" alt="Junior Hub" width={160} height={32} priority />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1b2a5c]/80 md:flex">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={i === 0 ? "border-b-2 border-[#12939b] pb-1 text-[#12939b]" : "transition-colors hover:text-[#12939b]"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-1 text-sm font-medium text-[#1b2a5c]/80 sm:flex">
            EN <ChevronDown size={14} />
          </button>
          <Link
            href="/login"
            className="rounded-full bg-[#12939b] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f7a81]"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
