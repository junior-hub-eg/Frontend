import { CtaBand } from "@/components/Landing/CtaBand";
import { LandingFooter } from "@/components/Landing/Footer";
import { LandingHeader } from "@/components/Landing/Header";
import { landingFont } from "@/components/Landing/font";
import { MentorBrowser } from "@/components/Mentorship/MentorBrowser";
import { MentorshipHero } from "@/components/Mentorship/MentorshipHero";

export default function MonitorPage() {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader activeHref="/monitor" />
      <main className="flex-1 bg-white">
        <MentorshipHero />
        <MentorBrowser />
        <CtaBand />
      </main>
      <LandingFooter />
    </div>
  );
}
