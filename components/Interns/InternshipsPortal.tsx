"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Globe2, Briefcase } from "lucide-react";
import { JobReadinessBanner } from "./JobReadinessBanner";
import { InternshipFilterSidebar, type FilterState } from "./InternshipFilterSidebar";
import { ApplicationsStats } from "./ApplicationsStats";
import { CtaBand } from "@/components/Landing/CtaBand";
import { useT } from "@/lib/i18n/client";

export interface PortalInternship {
  id: string;
  title: string;
  category: "UI/UX" | "Software" | "Marketing";
  type: "Full-Time" | "Part-Time";
  location: "Remote" | "In-Site" | "Hybrid";
  instructor: {
    name: string;
    avatar: string;
  };
  image: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  duration: string;
  hours: string;
  enrolledAvatars: string[];
  enrolledExtra: number;
  isApplied?: boolean;
}

const ALL_INTERNSHIPS: PortalInternship[] = [
  {
    id: "ui-ux-design-intern",
    title: "Advanced Design Systems & Component Libraries",
    category: "UI/UX",
    type: "Full-Time",
    location: "Remote",
    instructor: { name: "Sarah Anderson", avatar: "/images/Intern/char-girl.png" },
    image: "/images/Intern/machine-learning.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.8,
    reviewsCount: 120,
    duration: "12 Weeks",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 12,
    isApplied: true,
  },
  {
    id: "react-nextjs-advanced",
    title: "React & Next.js: From Basics to Advanced",
    category: "Software",
    type: "Full-Time",
    location: "Remote",
    instructor: { name: "Alex Rodriguez", avatar: "/images/Intern/char-boy-glasses.png" },
    image: "/images/Intern/cyber-security.jpg",
    tag: "10 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 140,
    duration: "10 Weeks",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
    ],
    enrolledExtra: 18,
    isApplied: false,
  },
  {
    id: "backend-microservices",
    title: "Advanced Backend Architecture & Microservices",
    category: "Software",
    type: "Part-Time",
    location: "Hybrid",
    instructor: { name: "David Chen", avatar: "/images/Intern/char-boy-glasses-2.png" },
    image: "/images/Intern/mobile-dev.jpg",
    tag: "8 Weeks • Hybrid",
    rating: 4.7,
    reviewsCount: 98,
    duration: "8 Weeks",
    hours: "10-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 15,
    isApplied: false,
  },
  {
    id: "growth-marketing",
    title: "Integrated Marketing Strategies & Growth Campaigns",
    category: "Marketing",
    type: "Full-Time",
    location: "In-Site",
    instructor: { name: "Emma Watson", avatar: "/images/Intern/char-girl.png" },
    image: "/images/Intern/hero-students.jpg",
    tag: "12 Weeks • In-Site",
    rating: 4.8,
    reviewsCount: 115,
    duration: "12 Weeks",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
    ],
    enrolledExtra: 14,
    isApplied: false,
  },
  {
    id: "machine-learning-deep",
    title: "Machine Learning & Deep Learning: From Basics to Advanced",
    category: "Software",
    type: "Full-Time",
    location: "Remote",
    instructor: { name: "Sarah Anderson", avatar: "/images/Intern/char-girl.png" },
    image: "/images/Intern/machine-learning.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.8,
    reviewsCount: 120,
    duration: "12 Weeks",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 12,
    isApplied: false,
  },
  {
    id: "mobile-app-dev",
    title: "Mobile App Development: From Basics to Advanced",
    category: "Software",
    type: "Part-Time",
    location: "Remote",
    instructor: { name: "Alex Rodriguez", avatar: "/images/Intern/char-boy-glasses.png" },
    image: "/images/Intern/mobile-dev.jpg",
    tag: "10 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 95,
    duration: "10 Weeks",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
    ],
    enrolledExtra: 8,
    isApplied: false,
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking & Network Security: From Basics to Advanced",
    category: "Software",
    type: "Full-Time",
    location: "Remote",
    instructor: { name: "David Chen", avatar: "/images/Intern/char-boy-glasses-2.png" },
    image: "/images/Intern/cyber-security.jpg",
    tag: "8 Weeks • Remote",
    rating: 4.7,
    reviewsCount: 110,
    duration: "8 Weeks",
    hours: "10-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 15,
    isApplied: true,
  },
  {
    id: "devops-sre-advanced",
    title: "Cloud Architecture & DevOps: From Basics to Advanced",
    category: "Software",
    type: "Full-Time",
    location: "Remote",
    instructor: { name: "Emma Watson", avatar: "/images/Intern/char-girl.png" },
    image: "/images/Intern/cyber-security.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 140,
    duration: "12 Weeks",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
    ],
    enrolledExtra: 9,
    isApplied: true,
  },
  {
    id: "frontend-ui-perf",
    title: "Frontend Development & UI Performance Optimization",
    category: "Software",
    type: "Full-Time",
    location: "Hybrid",
    instructor: { name: "Sarah Anderson", avatar: "/images/Intern/char-girl.png" },
    image: "/images/Intern/machine-learning.jpg",
    tag: "10 Weeks • Hybrid",
    rating: 4.8,
    reviewsCount: 85,
    duration: "10 Weeks",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 11,
    isApplied: false,
  },
  {
    id: "embedded-iot",
    title: "Embedded Systems & IoT: From Basics to Advanced",
    category: "Software",
    type: "Part-Time",
    location: "In-Site",
    instructor: { name: "David Chen", avatar: "/images/Intern/char-boy-glasses-2.png" },
    image: "/images/Intern/mobile-dev.jpg",
    tag: "8 Weeks • In-Site",
    rating: 4.7,
    reviewsCount: 75,
    duration: "8 Weeks",
    hours: "8-12 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
    ],
    enrolledExtra: 8,
    isApplied: false,
  },
];

interface InternshipsPortalProps {
  initialTab?: "available" | "applications";
}

export function InternshipsPortal({ initialTab = "available" }: InternshipsPortalProps) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"available" | "applications">(initialTab);
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    types: [],
    locations: [],
  });

  const baseList =
    activeTab === "available"
      ? ALL_INTERNSHIPS
      : ALL_INTERNSHIPS.filter((item) => item.isApplied);

  const filteredInternships = baseList.filter((item) => {
    if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(item.type)) {
      return false;
    }
    if (filters.locations.length > 0 && !filters.locations.includes(item.location)) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Top: Job Readiness Score (75%) Banner */}
        <JobReadinessBanner />

        {/* Tab Navigation */}
        <div className="mt-10 flex border-b border-black/10">
          <button
            type="button"
            onClick={() => setActiveTab("available")}
            className={`relative pb-3 text-sm font-bold transition-colors sm:text-base ${
              activeTab === "available"
                ? "text-[#12939b]"
                : "text-[#1b2a5c]/60 hover:text-[#1b2a5c]"
            }`}
          >
            {t("Available Internships")}
            {activeTab === "available" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#12939b]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("applications")}
            className={`relative ms-8 pb-3 text-sm font-bold transition-colors sm:text-base ${
              activeTab === "applications"
                ? "text-[#12939b]"
                : "text-[#1b2a5c]/60 hover:text-[#1b2a5c]"
            }`}
          >
            {t("My Applications ({n})", { n: 3 })}
            {activeTab === "applications" && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#12939b]" />
            )}
          </button>
        </div>

        {/* Section Heading */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-[#1b2a5c]">
            {activeTab === "available" ? t("Available Internships") : t("My Applications")}
          </h2>
        </div>

        {/* Main Content Layout: Cards Grid (Left) + Filters Sidebar (Right) */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Internship Cards */}
          <div className="lg:col-span-9">
            {filteredInternships.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 py-16 text-center">
                <p className="text-sm font-medium text-[#1b2a5c]/60">
                  {t("No internships match the selected filters.")}
                </p>
                <button
                  onClick={() => setFilters({ categories: [], types: [], locations: [] })}
                  className="mt-3 text-xs font-semibold text-[#12939b] hover:underline"
                >
                  {t("Clear all filters")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {filteredInternships.map((internship) => (
                  <div
                    key={internship.id}
                    className="group flex flex-col overflow-hidden rounded-[20px] border border-black/6 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={internship.image}
                        alt={t(internship.title)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 35vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 start-3 rounded-full bg-[#1b2a5c]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                        {t(internship.tag)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="line-clamp-2 text-sm font-bold text-[#1b2a5c] transition-colors group-hover:text-[#12939b]">
                        {t(internship.title)}
                      </h3>

                      {/* Instructor */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="relative size-6 overflow-hidden rounded-full bg-slate-200">
                          <Image
                            src={internship.instructor.avatar}
                            alt={internship.instructor.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="text-xs text-[#1b2a5c]/70">
                          {internship.instructor.name}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <div className="flex text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-[#1b2a5c]">
                          {internship.rating}
                        </span>
                        <span className="text-[10px] text-[#1b2a5c]/45">
                          ({internship.reviewsCount})
                        </span>
                      </div>

                      {/* Meta Details */}
                      <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5 text-[10px] text-[#1b2a5c]/60">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-[#12939b]" />
                          <span>{t(internship.duration)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe2 size={11} className="text-[#12939b]" />
                          <span>{t(internship.location)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase size={11} className="text-[#12939b]" />
                          <span>{t(internship.hours)}</span>
                        </div>
                      </div>

                      {/* Bottom row: Stacked Avatars + Read More Link */}
                      <div className="mt-4 flex items-center justify-between pt-2">
                        <div className="flex items-center">
                          <div className="flex -space-x-1.5">
                            {internship.enrolledAvatars.map((avatar, idx) => (
                              <div
                                key={idx}
                                className="relative size-6 overflow-hidden rounded-full border border-white bg-slate-200 shadow-xs"
                              >
                                <Image src={avatar} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                          <span className="ms-1.5 text-[10px] font-semibold text-[#1b2a5c]/60">
                            +{internship.enrolledExtra}
                          </span>
                        </div>

                        {/* Read More button links to Details page */}
                        <Link
                          href={`/interns/${internship.id}`}
                          className="rounded-full bg-[#1b2a5c] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#12939b] active:scale-95"
                        >
                          {t("Read More")}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Filter Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-24">
              <InternshipFilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </div>
        </div>

        {/* If on "My Applications" tab, display the 4 Metric Stats Cards underneath! */}
        {activeTab === "applications" && (
          <div className="mt-14 border-t border-black/5 pt-10">
            <ApplicationsStats />
          </div>
        )}
      </div>

      {/* Footer CTA band */}
      <div className="mt-16">
        <CtaBand />
      </div>
    </div>
  );
}
