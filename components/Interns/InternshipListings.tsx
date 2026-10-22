"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Star, Clock, Globe2, Briefcase, X, CheckCircle2, ArrowRight } from "lucide-react";

type CategoryFilter = "All" | "Frontend" | "Backend" | "Mobile" | "Flutter" | "DevOps";

interface InternshipCardItem {
  id: string;
  title: string;
  category: Exclude<CategoryFilter, "All">;
  instructor: {
    name: string;
    avatar: string;
  };
  image: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  duration: string;
  mode: string;
  hours: string;
  enrolledAvatars: string[];
  enrolledExtra: number;
}

const INTERNSHIPS: InternshipCardItem[] = [
  {
    id: "ml-advanced",
    title: "Machine Learning & Deep Learning: From Basics to Advanced",
    category: "Backend",
    instructor: {
      name: "Sarah Anderson",
      avatar: "/images/Intern/char-girl.png",
    },
    image: "/images/Intern/machine-learning.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.8,
    reviewsCount: 120,
    duration: "12 Weeks",
    mode: "Remote",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 12,
  },
  {
    id: "mobile-dev",
    title: "Mobile App Development: From Basics to Advanced",
    category: "Mobile",
    instructor: {
      name: "Alex Rodriguez",
      avatar: "/images/Intern/char-boy-glasses.png",
    },
    image: "/images/Intern/mobile-dev.jpg",
    tag: "10 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 95,
    duration: "10 Weeks",
    mode: "Remote",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
    ],
    enrolledExtra: 8,
  },
  {
    id: "cyber-security",
    title: "Ethical Hacking & Network Security: From Basics to Advanced",
    category: "DevOps",
    instructor: {
      name: "David Chen",
      avatar: "/images/Intern/char-boy-glasses-2.png",
    },
    image: "/images/Intern/cyber-security.jpg",
    tag: "8 Weeks • Remote",
    rating: 4.7,
    reviewsCount: 110,
    duration: "8 Weeks",
    mode: "Remote",
    hours: "10-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 15,
  },
  {
    id: "cloud-devops",
    title: "Cloud Architecture & DevOps: From Basics to Advanced",
    category: "DevOps",
    instructor: {
      name: "Emma Watson",
      avatar: "/images/Intern/char-girl.png",
    },
    image: "/images/Intern/cyber-security.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 140,
    duration: "12 Weeks",
    mode: "Remote",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
    ],
    enrolledExtra: 9,
  },
  {
    id: "react-frontend",
    title: "Frontend Engineering: Modern React & Next.js Systems",
    category: "Frontend",
    instructor: {
      name: "Sarah Anderson",
      avatar: "/images/Intern/char-girl.png",
    },
    image: "/images/Intern/machine-learning.jpg",
    tag: "10 Weeks • Remote",
    rating: 4.8,
    reviewsCount: 135,
    duration: "10 Weeks",
    mode: "Remote",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 14,
  },
  {
    id: "flutter-cross-platform",
    title: "Cross-Platform Mobile Apps with Flutter & Dart",
    category: "Flutter",
    instructor: {
      name: "Alex Rodriguez",
      avatar: "/images/Intern/char-boy-glasses.png",
    },
    image: "/images/Intern/mobile-dev.jpg",
    tag: "12 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 105,
    duration: "12 Weeks",
    mode: "Remote",
    hours: "15-20 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-boy-glasses-2.png",
    ],
    enrolledExtra: 11,
  },
  {
    id: "backend-microservices",
    title: "Microservices & Distributed Systems with Go & Node",
    category: "Backend",
    instructor: {
      name: "David Chen",
      avatar: "/images/Intern/char-boy-glasses-2.png",
    },
    image: "/images/Intern/cyber-security.jpg",
    tag: "8 Weeks • Remote",
    rating: 4.7,
    reviewsCount: 98,
    duration: "8 Weeks",
    mode: "Remote",
    hours: "10-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses.png",
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-girl.png",
    ],
    enrolledExtra: 16,
  },
  {
    id: "kubernetes-production",
    title: "Kubernetes CI/CD Pipelines & Site Reliability",
    category: "DevOps",
    instructor: {
      name: "Emma Watson",
      avatar: "/images/Intern/char-girl.png",
    },
    image: "/images/Intern/cyber-security.jpg",
    tag: "10 Weeks • Remote",
    rating: 4.9,
    reviewsCount: 125,
    duration: "10 Weeks",
    mode: "Remote",
    hours: "12-15 hrs/wk",
    enrolledAvatars: [
      "/images/Intern/char-boy-glasses-2.png",
      "/images/Intern/char-girl.png",
      "/images/Intern/char-boy-glasses.png",
    ],
    enrolledExtra: 10,
  },
];

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Frontend",
  "Backend",
  "Mobile",
  "Flutter",
  "DevOps",
];

export function InternshipListings() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [applyingFor, setApplyingFor] = useState<InternshipCardItem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const filteredInternships = INTERNSHIPS.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setApplyingFor(null);
    }, 2000);
  };

  return (
    <section id="find-internships" className="bg-white py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Top Header + Search Bar */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#1b2a5c] sm:text-4xl">
              Find Your Internship
            </h2>
            <p className="mt-2 text-sm text-[#1b2a5c]/65 sm:text-base">
              Explore available internships and join a team that matches your interests and career goals.
            </p>
          </div>

          {/* Search Input */}
          <div className="flex w-full items-center rounded-full border border-black/10 bg-white p-1.5 shadow-xs transition-colors focus-within:border-[#12939b] sm:max-w-md">
            <div className="flex flex-1 items-center gap-2 px-3 text-[#1b2a5c]/40">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-[#1b2a5c] placeholder-[#1b2a5c]/40 outline-hidden sm:text-sm"
              />
            </div>
            <button
              type="button"
              className="rounded-full bg-[#1b2a5c] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#12939b] sm:text-sm"
            >
              Search
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all sm:text-sm ${
                  isActive
                    ? "bg-[#1b2a5c] text-white shadow-sm"
                    : "bg-[#F1F5F9] text-[#1b2a5c]/70 hover:bg-[#E2E8F0] hover:text-[#1b2a5c]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Grid of Cards */}
        {filteredInternships.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-black/10 py-16 text-center">
            <p className="text-sm font-medium text-[#1b2a5c]/60">
              No internships match your filter or search query.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs font-semibold text-[#12939b] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredInternships.map((internship) => (
              <div
                key={internship.id}
                className="group flex flex-col overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Thumbnail Image with Tag */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={internship.image}
                    alt={internship.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Badge Tag */}
                  <div className="absolute top-3 start-3 rounded-full bg-[#1b2a5c]/85 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
                    {internship.tag}
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col p-4">
                  {/* Title */}
                  <h3 className="line-clamp-2 text-sm font-bold text-[#1b2a5c] transition-colors group-hover:text-[#12939b]">
                    {internship.title}
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

                  {/* Meta details */}
                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2.5 text-[10px] text-[#1b2a5c]/60">
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-[#12939b]" />
                      <span>{internship.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe2 size={11} className="text-[#12939b]" />
                      <span>{internship.mode}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={11} className="text-[#12939b]" />
                      <span>{internship.hours}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Enrolled avatars + Apply button */}
                  <div className="mt-4 flex items-center justify-between pt-2">
                    {/* Stacked Avatars */}
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

                    {/* Apply Button */}
                    <button
                      type="button"
                      onClick={() => setApplyingFor(internship)}
                      className="rounded-full bg-[#1b2a5c] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#12939b] active:scale-95"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link to Page 2 (Portal with Readiness score and sidebar filters) */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/interns/portal"
            className="inline-flex items-center gap-2 rounded-full border border-[#1b2a5c]/20 bg-[#F8FAFC] px-8 py-3.5 text-sm font-bold text-[#1b2a5c] shadow-xs transition-all hover:border-[#12939b] hover:bg-[#12939b] hover:text-white"
          >
            <span>Explore All Internships in Portal with Filters</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Quick Application Modal */}
      {applyingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => {
                setApplyingFor(null);
                setSubmitted(false);
              }}
              className="absolute top-5 end-5 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="py-8 text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500" />
                <h3 className="mt-3 text-lg font-bold text-[#1b2a5c]">Application Submitted!</h3>
                <p className="mt-1 text-xs text-[#1b2a5c]/60">
                  We received your application for {applyingFor.title}. Check your email for next steps.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-[#1b2a5c]">Apply for Internship</h3>
                <p className="mt-1 text-xs text-[#1b2a5c]/60 line-clamp-1">{applyingFor.title}</p>

                <form onSubmit={handleApply} className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#1b2a5c]">Full Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. John Doe"
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-xs outline-hidden focus:border-[#12939b]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#1b2a5c]">Email Address</label>
                    <input
                      required
                      type="email"
                      placeholder="you@domain.com"
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-xs outline-hidden focus:border-[#12939b]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-[#1b2a5c]">GitHub / Portfolio URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/yourhandle"
                      className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-xs outline-hidden focus:border-[#12939b]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mt-2 rounded-full bg-[#12939b] py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#0f7a81]"
                  >
                    Submit Application
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
