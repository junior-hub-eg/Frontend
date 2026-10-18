import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { InternsHero } from "@/components/Interns/InternsHero";
import { InternsStepper } from "@/components/Interns/InternsStepper";
import { InternshipListings } from "@/components/Interns/InternshipListings";
import { AssessmentBanner } from "@/components/Interns/AssessmentBanner";
import { InternsTestimonials } from "@/components/Interns/InternsTestimonials";
import { CtaBand } from "@/components/Landing/CtaBand";

export const metadata: Metadata = {
  title: "Internship Program | Junior Hub",
  description:
    "Join an agile squad, work on real projects, and gain hands-on experience under the guidance of a Senior Team Leader.",
};

export default function InternsLandingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Quick switcher bar for the user to jump between all 4 pages */}
      <div className="border-b border-[#12939b]/15 bg-[#EAF7F4] px-6 py-2.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#1b2a5c]">
            <span className="font-bold text-[#12939b]">الصفحة 1 (الرئيسية):</span>
            <span className="hidden sm:inline">Internship Landing Page</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#1b2a5c]/60">الانتقال للصفحات الأخرى:</span>
            <Link
              href="/interns/portal"
              className="inline-flex items-center gap-1 rounded-full bg-[#1b2a5c] px-3 py-1 font-semibold text-white transition-colors hover:bg-[#12939b]"
            >
              <LayoutDashboard size={12} />
              <span>الصفحة 2: Dashboard الفرص</span>
            </Link>
            <Link
              href="/interns/applications"
              className="rounded-full border border-[#1b2a5c]/20 bg-white px-3 py-1 font-semibold text-[#1b2a5c] transition-colors hover:bg-slate-100"
            >
              الصفحة 3: My Applications
            </Link>
            <Link
              href="/interns/ui-ux-design-intern"
              className="rounded-full border border-[#1b2a5c]/20 bg-white px-3 py-1 font-semibold text-[#1b2a5c] transition-colors hover:bg-slate-100"
            >
              الصفحة 4: Details التفاصيل
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Hero Section */}
      <InternsHero />

      {/* 2. Stepper / Why Choose Us */}
      <InternsStepper />

      {/* 3. Find Your Internship (Listings with Search & Category Filters) */}
      <InternshipListings />

      {/* 4. Assessment CTA Banner */}
      <AssessmentBanner />

      {/* 5. What Our Interns Say Testimonials */}
      <InternsTestimonials />

      {/* 6. Ready to Build Your Future CTA Banner */}
      <CtaBand />
    </div>
  );
}
