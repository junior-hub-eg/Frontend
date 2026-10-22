"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export function AssessmentBanner() {
  const t = useT();
  return (
    <section className="bg-white py-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[28px] border border-[#FDE8D0] bg-gradient-to-r from-[#FDEFD9] via-[#FFF9F3] to-[#FDE8D0] p-6 shadow-xs sm:p-8">
          {/* Abstract background decorative waves */}
          <div
            className="pointer-events-none absolute -start-12 -top-12 h-44 w-44 rounded-full bg-[#FCD8B3]/40 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -end-12 -bottom-12 h-48 w-48 rounded-full bg-[#FCE3C8]/50 blur-2xl"
            aria-hidden
          />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Left: Icon and message */}
            <div className="flex items-center gap-4 text-center sm:text-start">
              <div className="grid size-13 shrink-0 place-items-center rounded-2xl bg-[#1b2a5c] text-white shadow-md">
                <GraduationCap size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1b2a5c] sm:text-xl md:text-2xl">
                  {t("Not sure which track is for you?")}
                </h3>
                <p className="mt-1 text-xs text-[#1b2a5c]/70 sm:text-sm">
                  {t("Ensure which internship path suits you best!")}
                </p>
              </div>
            </div>

            {/* Right: CTA Button */}
            <Link
              href="/interns/portal"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#1b2a5c] px-6 py-3 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#12939b] hover:shadow-lg active:scale-95 sm:text-sm"
            >
              <span>{t("Take assessment")}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
