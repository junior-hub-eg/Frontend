import { Hero } from "@/components/Landing/Hero";
import { Stats } from "@/components/Landing/Stats";
import { Tracks } from "@/components/Landing/Tracks";
import { HowItWorks } from "@/components/Landing/HowItWorks";
import { PlatformFeatures } from "@/components/Landing/PlatformFeatures";
import { Testimonials } from "@/components/Landing/Testimonials";
import { CtaBand } from "@/components/Landing/CtaBand";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Tracks />
      <HowItWorks />
      <PlatformFeatures />
      <Testimonials />
      <CtaBand />
    </>
  );
}
