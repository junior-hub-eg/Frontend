import { CtaBand } from "@/components/Landing/CtaBand";
import { landingFont } from "@/components/Landing/font";
import { MentorBrowser } from "@/components/Mentorship/MentorBrowser";
import { MentorshipHero } from "@/components/Mentorship/MentorshipHero";

// Header and footer come from app/(site)/layout.tsx — don't add them here.
export default function MonitorPage() {
  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-white font-[family-name:var(--font-poppins)]`}>
      <MentorshipHero />
      <MentorBrowser />
      <CtaBand />
    </div>
  );
}
