"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { SquareArrowOutUpRight } from "lucide-react";

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

/** Card illustrations exported from the Figma design (public/images/Recruitment). */
const ROLE_IMAGES: Record<ArtVariant, string> = {
  design: "/images/Recruitment/role-uiux.png",
  frontend: "/images/Recruitment/role-frontend.png",
  qa: "/images/Recruitment/role-qa.png",
  data: "/images/Recruitment/role-data.png",
  product: "/images/Recruitment/role-product.png",
};

function RoleIllustration({ variant }: { variant: ArtVariant }) {
  return <Image src={ROLE_IMAGES[variant]} alt="" width={140} height={140} className="mx-auto h-[140px] w-[140px] object-contain" />;
}

/** The hero art: the decorations layer (507 × 386, as in the design) with the illustration on top. */
function OpportunityIllustration() {
  return (
    <div className="relative mx-auto h-[386px] w-full max-w-[507px]">
      <Image src="/images/Recruitment/hero-decorations.png" alt="" fill sizes="507px" className="object-contain" priority />
      <Image
        src="/images/Recruitment/hero-resume.png"
        alt=""
        width={380}
        height={380}
        className="absolute left-[19%] top-[10%] h-[88%] w-auto"
        priority
      />
    </div>
  );
}

export function RecruitmentListings() {
  const [activeFilter, setActiveFilter] = useState<TrackFilter>("All Tracks");
  const visibleRoles =
    activeFilter === "All Tracks" ? ROLES : ROLES.filter((role) => role.track === activeFilter);

  return (
    <>
      <RecruitmentHero>
        <div className="mt-8 flex flex-wrap gap-3" aria-label="Filter opportunities by track">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
              className={`h-14 rounded-full px-7 text-[17px] font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-[#12939b] text-white"
                  : "bg-[#e3f1ef] text-[#12939b] hover:bg-[#d3e9e5]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </RecruitmentHero>

      <section className="mx-auto max-w-[1440px] px-5 pb-[75px] pt-10 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-y-[52px]">
          {Array.from({ length: 2 }, (_, row) =>
            visibleRoles.map((role) => (
              <article
                key={`${role.title}-${row}`}
                className="relative flex min-h-[345px] min-w-0 flex-col rounded-lg border border-[#1b2a5c]/10 bg-white px-3 pb-3 pt-3 shadow-[0_2px_8px_rgba(27,42,92,0.14)] transition-shadow hover:shadow-[0_8px_24px_rgba(27,42,92,0.14)]"
              >
                <span className="self-start rounded-md bg-[#edf0f3] px-2 py-1 text-[11px] font-medium leading-none text-[#1b2a5c]">
                  Ready to Start
                </span>
                <div className="mt-1 h-[140px] shrink-0">
                  <RoleIllustration variant={role.art} />
                </div>
                <h2 className="mt-3 line-clamp-2 text-[15px] font-semibold leading-tight text-[#1b2a5c]">{role.title}</h2>
                <p className="mt-2 line-clamp-3 text-[11.5px] leading-[16px] text-[#1b2a5c]/80">{role.description}</p>
                <div className="mt-3 flex flex-wrap content-start gap-1.5">
                  {role.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-[#eef1f4] px-2.5 py-1 text-[12px] leading-[18px] text-[#1b2a5c]">
                      {tag}
                    </span>
                  ))}
                </div>
                <details className="group relative mt-auto pt-4">
                  <summary className="mx-auto flex h-7 w-[150px] cursor-pointer list-none items-center justify-center gap-1.5 rounded-md bg-[#0f7a81] text-xs font-medium text-white transition-colors hover:bg-[#0c6a70] [&::-webkit-details-marker]:hidden">
                    View Details
                    <SquareArrowOutUpRight size={12} aria-hidden />
                  </summary>
                  <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-[#1b2a5c]/10 bg-white p-3 text-xs leading-relaxed text-[#1b2a5c] shadow-lg">
                    Practice {role.track.toLowerCase()} skills through a guided hiring scenario.{" "}
                    {role.title === "Junior UI/UX Designer" && (
                      <>
                        <Link href="/recruitment/junior-ui-ux-designer" className="font-semibold text-[#0f7a81] underline">
                          View full opportunity
                        </Link>
                        {" · "}
                      </>
                    )}
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
    </>
  );
}

/** The hero; the track filters sit under the text, beside the illustration, as in the design. */
export function RecruitmentHero({ children }: { children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_22%_30%,rgba(213,238,234,0.72),transparent_34%)]">
      <Image
        src="/images/Recruitment/background-blur.png"
        alt=""
        width={359}
        height={261}
        className="pointer-events-none absolute right-0 top-0 select-none"
        priority
      />
      <div className="mx-auto grid max-w-[1440px] items-end gap-8 px-5 pt-8 sm:grid-cols-[1fr_0.75fr] sm:px-8 lg:px-16">
        <div className="relative z-10">
          <span className="inline-flex rounded-full border border-[#cde8e4] bg-white/80 px-4 py-2.5 text-sm font-semibold tracking-wide text-[#1b2a5c]">
            YOUR FUTURE STARTS HERE
          </span>
          <h1 className="mt-7 max-w-[620px] text-4xl font-bold leading-[1.15] text-[#1b2a5c] sm:text-[46px]">
            Explore <span className="text-[#12939b]">Simulated</span> Job <span className="text-[#12939b]">Opportunities</span>
          </h1>
          <p className="mt-6 max-w-[560px] text-lg leading-snug text-[#1b2a5c]/80">
            Browse practice hiring scenarios tailored for early-career professionals. Step through full end-to-end
            recruitment cycles without real-world risk.
          </p>
          {children}
        </div>
        <div className="relative hidden sm:block">
          <OpportunityIllustration />
        </div>
      </div>
    </section>
  );
}
