import type { Metadata } from "next";
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
