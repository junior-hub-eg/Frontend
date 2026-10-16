"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const FILTERS = ["All Tracks", "UI-UX", "Software Engineering", "Data & Analytics"] as const;
type TrackFilter = (typeof FILTERS)[number];
type ArtVariant = "design" | "frontend" | "qa" | "data" | "product";

const ROLES: {
  title: string;
  track: Exclude<TrackFilter, "All Tracks">;
  description: string;
  tags: string[];
  art: ArtVariant;
}[] = [
  {
    title: "Junior UI/UX Designer",
    track: "UI-UX",
    description: "Synthesize user interviews, build interactive low-fidelity mockups, and construct cohesive mini-design systems.",
    tags: ["Figma", "User Journey Mapping", "Design Systems", "Wireframing"],
    art: "design",
  },
  {
    title: "Junior Frontend Developer",
    track: "Software Engineering",
    description: "Implement a real-time account ledger view with dynamic filtering, test component re-renders, and satisfy WCAG 2.1 AA specs.",
    tags: ["Responsive Web", "Tailwind CSS", "React", "Component Arch"],
    art: "frontend",
  },
  {
    title: "Junior QA / Test Automation Engineer",
    track: "Software Engineering",
    description: "Write robust end-to-end Cypress test suites for an e-commerce checkout flow, inspect API responses, and generate structured bug logs.",
    tags: ["Responsive Web", "Tailwind CSS", "React", "Component Arch"],
    art: "qa",
  },
  {
    title: "Junior Data Analyst",
    track: "Data & Analytics",
    description: "Cleanse raw seasonal transaction datasets using SQL queries, extract domain signals, and build an executive summary dashboard.",
    tags: ["Data Visualization", "Excel", "SQL", "KPI Analysis"],
    art: "data",
  },
  {
    title: "Associate Product Designer",
    track: "UI-UX",
    description: "Implement a real-time account ledger view with dynamic filtering, test component re-renders, and satisfy WCAG 2.1 AA specs.",
    tags: ["Wireframing", "User Interviews", "Interaction Specs"],
    art: "product",
  },
];

function RoleIllustration({ variant }: { variant: ArtVariant }) {
  return (
    <svg viewBox="0 0 140 70" fill="none" aria-hidden="true" className="block h-[76px] w-full">
      <ellipse cx="70" cy="62" rx="51" ry="5" fill="#D8E9E7" />
      {variant === "design" && (
        <>
          <circle cx="43" cy="39" r="24" fill="#E6F4F1" />
          <rect x="62" y="13" width="48" height="38" rx="3" fill="#1B5961" transform="rotate(-8 62 13)" />
          <rect x="66" y="17" width="39" height="29" rx="2" fill="#F8FCFB" transform="rotate(-8 66 17)" />
          <rect x="71" y="23" width="27" height="3" rx="1.5" fill="#12939B" transform="rotate(-8 71 23)" />
          <rect x="70" y="30" width="15" height="12" rx="2" fill="#D8EFEB" transform="rotate(-8 70 30)" />
          <path d="M88 31h11M87 36h10M86 41h8" stroke="#789DA0" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="29" r="7" fill="#D98C6A" />
          <path d="M33 29c0-8 13-11 15-1l-3-2-10 5-2-2Z" fill="#1B2A5C" />
          <path d="M32 37c4-5 14-5 18 1l6 17H27l5-18Z" fill="#12939B" />
          <path d="m39 54 1 8m8-8-2 8" stroke="#1B2A5C" strokeWidth="4" strokeLinecap="round" />
          <circle cx="106" cy="15" r="4" fill="#B6DCD6" />
        </>
      )}
      {variant === "frontend" && (
        <>
          <path d="m34 18 43-12 36 18-43 13-36-19Z" fill="#83C9C2" />
          <path d="m33 23 42-12v34L33 57V23Z" fill="#1B5961" />
          <path d="m38 25 33-9v24l-33 10V25Z" fill="#F8FCFB" />
          <path d="m77 11 33 16v30L77 42V11Z" fill="#12939B" />
          <path d="m82 17 23 12v20L82 38V17Z" fill="#E8F4F2" />
          <path d="m45 29 4 4-4 4m9 1 7-2m24-13 8 4m-8 1 13 6" stroke="#12939B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m29 58 43-12 39 12-43 9-39-9Z" fill="#B7DCD6" />
        </>
      )}
      {variant === "qa" && (
        <>
          <circle cx="72" cy="36" r="29" fill="#E8F4F2" />
          <rect x="30" y="17" width="68" height="36" rx="3" fill="#1B5961" />
          <rect x="34" y="21" width="60" height="28" rx="2" fill="#F8FCFB" />
          <path d="M40 28h22m-22 7h17m-17 7h25" stroke="#B5D9D5" strokeWidth="3" strokeLinecap="round" />
          <circle cx="81" cy="30" r="5" fill="#DDF1ED" />
          <path d="m78 30 2 2 4-5" stroke="#12939B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="99" cy="41" r="12" fill="#D9EBE9" stroke="#12939B" strokeWidth="3" />
          <path d="m107 50 8 8" stroke="#12939B" strokeWidth="4" strokeLinecap="round" />
          <circle cx="48" cy="59" r="5" fill="#D88B6C" />
          <path d="M41 66c2-6 13-6 15 0" fill="#1B2A5C" />
        </>
      )}
      {variant === "data" && (
        <>
          <circle cx="72" cy="36" r="30" fill="#E6F4F1" />
          <rect x="24" y="15" width="91" height="43" rx="4" fill="#1B5961" />
          <rect x="28" y="19" width="83" height="35" rx="2" fill="#F8FCFB" />
          <rect x="33" y="24" width="27" height="12" rx="2" fill="#DAEFEB" />
          <path d="M36 33v-4m6 4v-6m6 6v-8m6 8v-5" stroke="#12939B" strokeWidth="3" strokeLinecap="round" />
          <path d="M67 47V39m9 8V31m9 16V36m9 11V27m9 20V33" stroke="#66B9B1" strokeWidth="4" strokeLinecap="round" />
          <path d="m66 34 9-6 9 3 10-8 9 4" stroke="#1B2A5C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m57 58 8 5h15l8-5" stroke="#719D9C" strokeWidth="2" />
        </>
      )}
      {variant === "product" && (
        <>
          <circle cx="72" cy="37" r="30" fill="#E6F4F1" />
          <rect x="52" y="13" width="46" height="36" rx="3" fill="#1B5961" />
          <rect x="56" y="17" width="38" height="28" rx="2" fill="#F8FCFB" />
          <rect x="60" y="21" width="13" height="9" rx="1.5" fill="#B9E0DA" />
          <path d="M77 23h12m-12 5h10m-27 8h25" stroke="#12939B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="37" cy="34" r="6" fill="#D98C6A" />
          <path d="M29 42c3-5 13-5 16 0l4 17H26l3-17Z" fill="#12939B" />
          <circle cx="107" cy="35" r="6" fill="#E7A282" />
          <path d="M100 43c3-5 13-5 16 0l3 16H97l3-16Z" fill="#1B2A5C" />
          <path d="m44 50 8-5m44 5-8-5" stroke="#D98C6A" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function OpportunityIllustration() {
  return (
    <svg
      viewBox="0 0 340 220"
      fill="none"
      aria-hidden="true"
      className="absolute left-0 top-0 h-[205px] w-full"
    >
      <ellipse cx="183" cy="184" rx="87" ry="20" fill="#F0F2F1" />
      <path d="m153 34 28-15 27 15-27 14-28-14Z" fill="#ECEDEF" />
      <path d="m164 39 17 9 17-9" stroke="#D5D9DC" strokeWidth="2" />
      <path d="M181 47v17" stroke="#D5D9DC" strokeWidth="2" />
      <rect x="174" y="47" width="55" height="111" rx="5" fill="#1B5961" transform="rotate(-8 174 47)" />
      <rect x="181" y="54" width="46" height="98" rx="2" fill="#F8FCFB" transform="rotate(-8 181 54)" />
      <path d="m188 63 35-5 1 8-35 6-1-9Z" fill="#12939B" />
      <circle cx="198" cy="87" r="9" fill="#C9E5E1" />
      <path d="M195 84c1-6 10-6 11 0l-2 5h-8l-1-5Z" fill="#D98C6A" />
      <path d="M191 98c4-7 14-8 19-2l3 31-23 4-4-24 5-9Z" fill="#12939B" />
      <path d="m197 101 2 20m7-21 2 18m-17-9 21-3" stroke="#F4FAF9" strokeWidth="2" />
      <path d="m225 78 20-3m-19 10 14-2m-16 10 13-2m-14 10 14-2m-15 10 11-2" stroke="#B6DCD6" strokeWidth="3" strokeLinecap="round" />
      <circle cx="248" cy="63" r="12" fill="#E9ECEE" />
      <path d="M239 63c1-11 16-14 21-4l-5 2-3-4-13 8Z" fill="#D5D9DC" />
      <path d="M239 78c5-6 15-6 20 1l8 42-29 1-4-32 5-12Z" fill="#DDF1ED" />
      <circle cx="248" cy="79" r="9" fill="#E4A180" />
      <path d="M239 80c1-11 17-12 20-2l-2 4-4-6-12 6-2-2Z" fill="#1B2A5C" />
      <path d="m240 96-5 29m19-28 4 28" stroke="#D98C6A" strokeWidth="5" strokeLinecap="round" />
      <path d="m239 121-3 17m20-13 5 15" stroke="#1B2A5C" strokeWidth="5" strokeLinecap="round" />
      <path d="m224 108-9 9-8-5" stroke="#E4A180" strokeWidth="4" strokeLinecap="round" />
      <path d="M111 168c-2-13 13-22 23-15 8 6 4 17-8 20-8 2-13 0-15-5Z" fill="#B4D8D4" />
      <path d="M287 170c3-9 8-14 15-16m-11 19 17-4m-14 9 15 6m-26-12-2-14m12 18 3 14" stroke="#B4D8D4" strokeWidth="4" strokeLinecap="round" />
      <path d="m99 52 2 5m4 3 5 2m-10 5-2 5m-4-13-5-2m139 87 2 4m5 1 4-2m-10 4-3 3" stroke="#12939B" strokeWidth="2" strokeLinecap="round" />
      <path d="m143 83 1 7m6 2 6 1m-12 6-1 6m-5-13-6-1" stroke="#1B2A5C" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RecruitmentListings() {
  const [activeFilter, setActiveFilter] = useState<TrackFilter>("All Tracks");
  const visibleRoles =
    activeFilter === "All Tracks" ? ROLES : ROLES.filter((role) => role.track === activeFilter);

  return (
    <section className="mx-auto max-w-[1244px] px-5 pb-5 pt-0 sm:px-8">
      <div className="flex flex-wrap gap-2" aria-label="Filter opportunities by track">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            aria-pressed={activeFilter === filter}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-3.5 py-2 text-[9px] font-medium transition-colors ${
              activeFilter === filter
                ? "bg-[#12939b] text-white"
                : "bg-[#e3f1ef] text-[#1b2a5c] hover:bg-[#d3e9e5]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 2 }, (_, row) =>
          visibleRoles.map((role) => (
            <article
              key={`${role.title}-${row}`}
              className="relative flex h-[228px] min-w-0 flex-col rounded-lg border border-[#1b2a5c]/10 bg-white p-2 shadow-[0_2px_3px_rgba(27,42,92,0.18)]"
            >
              <span className="mb-0.5 self-start rounded-full bg-[#edf0f3] px-1.5 py-0.5 text-[8px] font-medium leading-none text-[#1b2a5c]">
                Ready to Start
              </span>
              <div className="h-[76px] shrink-0 overflow-hidden">
                <RoleIllustration variant={role.art} />
              </div>
              <h2 className="mt-0.5 line-clamp-2 min-h-[25px] text-[10px] font-semibold leading-[1.2] text-[#1b2a5c]">
                {role.title}
              </h2>
              <p className="line-clamp-3 min-h-[33px] text-[8px] leading-[1.35] text-[#1b2a5c]/75">
                {role.description}
              </p>
              <div className="mt-1 flex min-h-[28px] flex-wrap content-start gap-1">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#e9edf1] px-1.5 py-[3px] text-[8px] leading-none text-[#1b2a5c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <details className="group relative mt-auto">
                <summary className="flex h-5 cursor-pointer list-none items-center justify-center gap-0.5 rounded-full bg-[#12939b] text-[8px] font-semibold text-white transition-colors hover:bg-[#0f7a81] [&::-webkit-details-marker]:hidden">
                  View Details
                  <ArrowUpRight size={8} aria-hidden />
                </summary>
                <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-[#1b2a5c]/10 bg-white p-2 text-[9px] leading-relaxed text-[#1b2a5c] shadow-lg">
                  Practice {role.track.toLowerCase()} skills through a guided hiring scenario.{" "}
                  <Link href="/register" className="font-semibold text-[#0f7a81] underline">
                    Create your profile
                  </Link>
                  .
                </div>
              </details>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function RecruitmentHero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,rgba(213,238,234,0.72),transparent_36%),radial-gradient(ellipse_at_95%_15%,rgba(219,240,237,0.7),transparent_25%)]">
      <div className="mx-auto grid min-h-[163px] max-w-[1244px] items-center gap-1 px-8 py-2 sm:grid-cols-[1fr_0.9fr] sm:px-8">
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-[#cde8e4] bg-white/80 px-2.5 py-1 text-[8px] font-medium text-[#1b2a5c]">
            YOUR FUTURE STARTS HERE
          </span>
          <h1 className="mt-3 max-w-[350px] text-[22px] font-bold leading-[1.08] text-[#1b2a5c] sm:text-[23px]">
            Explore <span className="text-[#12939b]">Simulated Job Opportunities</span>
          </h1>
          <p className="mt-3 max-w-[340px] text-[9px] leading-[1.4] text-[#1b2a5c]/80">
            Browse practice hiring scenarios tailored for early-career professionals. Step through full end-to-end
            recruitment cycles without real-world risk.
          </p>
        </div>
        <div className="relative hidden h-[150px] sm:block">
          <OpportunityIllustration />
        </div>
      </div>
    </section>
  );
}
