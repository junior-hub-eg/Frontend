"use client";

import Image from "next/image";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export function InternsStepper() {
  const t = useT();
  const steps = [
    {
      num: 1,
      title: tk("Apply & Assessment"),
      desc: tk("Submit your application and complete the technical assessment."),
    },
    {
      num: 2,
      title: tk("Team Matching"),
      desc: tk("Get matched with the right squad and Senior Team Leader."),
    },
    {
      num: 3,
      title: tk("Work & Learn"),
      desc: tk("Complete weekly sprints, work on tasks, and submit GitHub PRs."),
    },
    {
      num: 4,
      title: tk("Get Certified"),
      desc: tk("Complete your internship and receive your certificate."),
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-[30px] p-6 lg:p-8">
          {/* No background in the Figma: only the soft blur image at the left edge, behind "Why choose us" */}
          <Image
            src="/images/Landing%20Page/Interns/Background%2BBlur.png"
            alt=""
            width={318}
            height={196}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 start-0 h-full w-auto max-w-none"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-12">
            {/* Left intro label */}
            <div className="lg:col-span-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#12939b]">
                {t("WHY CHOOSE US")}
              </span>
              <h3 className="mt-1 text-base font-bold text-[#1b2a5c] sm:text-lg">
                {t("Weekly Sprints Real tasks & PRs")}
              </h3>
              <p className="mt-1 text-xs text-[#1b2a5c]/60">{t("Follow a clear path")}</p>
            </div>

            {/* Stepper items */}
            <div className="relative lg:col-span-9">
              {/* Connecting line on desktop */}
              {/* Solid line from step 1 to 2, dotted after it (Figma) */}
              <div
                className="pointer-events-none absolute start-[12.5%] end-[12.5%] top-[18px] -z-0 hidden border-t-2 border-dotted border-[#1b2a5c]/25 lg:block"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute start-[12.5%] top-[17px] -z-0 hidden h-[2px] w-[25%] bg-gradient-to-r from-[#1b2a5c] to-[#7D2331] lg:block"
                aria-hidden
              />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
                {steps.map(({ num, title, desc }) => (
                  <div key={num} className="relative z-10 flex flex-col items-center text-center">
                    {/* Number Circle */}
                    <div className="grid size-9 place-items-center rounded-full bg-[#1b2a5c] text-xs font-bold text-white shadow-sm ring-4 ring-white">
                      {num}
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-[#1b2a5c] sm:text-sm">{t(title)}</h4>
                    <p className="mt-1 max-w-[190px] text-[11px] leading-relaxed text-[#1b2a5c]/65">
                      {t(desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
