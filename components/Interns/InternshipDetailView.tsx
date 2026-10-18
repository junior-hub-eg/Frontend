"use client";

import Link from "next/link";
import { Check, CheckCircle2, ArrowLeft } from "lucide-react";
import { InternsTestimonials } from "./InternsTestimonials";
import { FaqAccordion } from "./FaqAccordion";

interface DetailViewProps {
  id?: string;
}

export function InternshipDetailView({ id }: DetailViewProps) {
  const responsibilities = [
    "Conduct user research and define user needs",
    "Create wireframes, prototypes, and UI designs",
    "Improve user experience and usability",
    "Collaborate with cross-functional teams",
  ];

  return (
    <div className="bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/interns"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline"
        >
          <ArrowLeft size={14} />
          <span>Back to Internships</span>
        </Link>

        {/* 1. Top Banner */}
        <div className="rounded-[24px] bg-[#E9F7F4] p-6 sm:p-8">
          <h1 className="text-2xl font-extrabold text-[#1b2a5c] sm:text-3xl">
            Your Internship
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#12939b]">
            Career
          </p>
        </div>

        {/* 2. Main Role Header Card */}
        <div className="mt-6 rounded-[24px] border border-black/8 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Brand Icon + Title */}
            <div className="flex items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-50 border border-black/5 shadow-2xs">
                {/* Figma Logo */}
                <svg width="24" height="36" viewBox="0 0 38 57" fill="none">
                  <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                  <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                  <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                  <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                  <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#1b2a5c] sm:text-2xl">
                  UI/UX Design Intern
                </h2>
                <p className="mt-0.5 text-xs text-[#1b2a5c]/60 sm:text-sm">
                  TechCrop | Full-Time | Remote
                </p>
              </div>
            </div>

            {/* Right: Assessment Completed Badge */}
            <div className="flex shrink-0 items-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-[#E6F9F0] px-4 py-1.5 text-xs font-semibold text-[#027A48] shadow-2xs">
                <CheckCircle2 size={14} className="fill-[#027A48] text-white" />
                <span>Assessment Completed</span>
              </span>
            </div>
          </div>

          <div className="my-6 border-t border-black/5" />

          {/* 3. Responsibilities */}
          <div>
            <h3 className="text-base font-bold text-[#1b2a5c] sm:text-lg">
              Responsibilities
            </h3>
            <ul className="mt-4 space-y-2.5">
              {responsibilities.map((resp) => (
                <li key={resp} className="flex items-start gap-2.5 text-xs text-[#1b2a5c]/80 sm:text-sm">
                  <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-emerald-100 text-[#027A48]">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span>{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="my-8 border-t border-black/5" />

          {/* 4. Your Assessment Section */}
          <div>
            <h3 className="text-center text-lg font-bold text-[#1b2a5c] sm:text-xl">
              Your Assessment
            </h3>

            <div className="mt-6 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-12">
              {/* Left Donut Progress Chart (75%) */}
              <div className="relative grid size-32 place-items-center sm:size-36">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E6F5F2"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#12939B"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="251.3"
                    strokeDashoffset="62.8"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black tracking-tight text-[#1b2a5c]">
                    75%
                  </span>
                </div>
              </div>

              {/* Right Status Step Card */}
              <div className="w-full max-w-sm rounded-2xl border border-[#12939b]/20 bg-[#EAF7F4] p-5 shadow-2xs">
                <div className="flex flex-col gap-3 text-xs font-semibold text-[#1b2a5c]">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#12939b]" />
                    <span>Applied-12 Apr 2024</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#10B981]" />
                    <span>Assessment Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#12939b]" />
                    <span>Interview Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status text */}
            <div className="mt-6 text-center">
              <span className="text-sm font-semibold text-[#1b2a5c]/80">Status: </span>
              <span className="text-sm font-bold text-emerald-600 sm:text-base">
                Interview Completed
              </span>
            </div>
          </div>
        </div>

        {/* 5. What Our Interns Say */}
        <div className="mt-14">
          <InternsTestimonials />
        </div>

        {/* 6. FAQ Accordion */}
        <div className="mt-6">
          <FaqAccordion />
        </div>
      </div>
    </div>
  );
}
