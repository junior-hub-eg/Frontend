"use client";

import Image from "next/image";

export function JobReadinessBanner() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#12939b]/15 bg-gradient-to-r from-[#EAF7F4] via-[#E6F5F2] to-[#DEF3EE] p-6 shadow-xs lg:p-8">
      {/* Decorative background curve */}
      <div
        className="pointer-events-none absolute -end-16 -top-16 h-72 w-72 rounded-full bg-[#12939b]/10 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
        {/* Left: 75% Circular Progress Score */}
        <div className="flex flex-col items-center text-center">
          <div className="relative grid size-28 place-items-center sm:size-32">
            <svg className="size-full -rotate-90" viewBox="0 0 100 100">
              {/* Background track circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#CCEBE5"
                strokeWidth="8"
              />
              {/* 75% progress arc (strokeDasharray: 2 * pi * 40 ~= 251.3, 75% ~= 188.5) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#1B2A5C"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="251.3"
                strokeDashoffset="62.8"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-2xl font-black tracking-tight text-[#1b2a5c] sm:text-3xl">
                75%
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs font-bold text-[#1b2a5c] sm:text-sm">
            Job Readiness Score
          </p>
        </div>

        {/* Center: Improve Profile Information */}
        <div className="flex-1 text-center lg:text-start">
          <h2 className="text-2xl font-extrabold text-[#1b2a5c] sm:text-3xl">
            Improve Profile
          </h2>
          <p className="mt-1 text-xs text-[#1b2a5c]/70 sm:text-sm">
            Linked to external accounts into your profile
          </p>

          {/* External accounts icons */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <span className="text-xs font-medium text-[#1b2a5c]/60">External accounts:</span>
            
            {/* LinkedIn */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#0A66C2] shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              <span>LinkedIn</span>
            </span>

            {/* Figma */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#1b2a5c] shadow-2xs">
              <svg width="10" height="15" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
              </svg>
              <span>Figma</span>
            </span>

            {/* GitHub */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-[#24292F] shadow-2xs">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <button
              type="button"
              className="rounded-full bg-[#1b2a5c] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#12939b] active:scale-95"
            >
              Practice Mock Interviews
            </button>
            <button
              type="button"
              className="rounded-full border border-black/15 bg-white/90 px-5 py-2.5 text-xs font-semibold text-[#1b2a5c] shadow-2xs transition-colors hover:bg-white active:scale-95"
            >
              Review Resume
            </button>
          </div>
        </div>

        {/* Right: Girl Student Illustration */}
        <div className="relative shrink-0">
          <div className="relative size-40 sm:size-48">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#12939b]/30 to-[#80e5d8]/40 blur-lg"
              aria-hidden
            />
            <Image
              src="/images/Intern/banner-student.jpg"
              alt="Student with laptop and book"
              fill
              className="rounded-2xl object-cover shadow-sm ring-2 ring-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
