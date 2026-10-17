import { LandingHeader } from "@/components/Landing/Header";
import { landingFont } from "@/components/Landing/font";
import { Hero } from "@/components/Landing/Hero";
import { Stats } from "@/components/Landing/Stats";
import { Tracks } from "@/components/Landing/Tracks";
import { HowItWorks } from "@/components/Landing/HowItWorks";
import { PlatformFeatures } from "@/components/Landing/PlatformFeatures";
import { Testimonials } from "@/components/Landing/Testimonials";
import { CtaBand } from "@/components/Landing/CtaBand";
import { LandingFooter } from "@/components/Landing/Footer";

export default function HomePage() {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Tracks />
        <HowItWorks />
        <PlatformFeatures />
        <Testimonials />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}
