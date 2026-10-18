import { landingFont } from "@/components/Landing/font";
import { MentorBrowser } from "@/components/Mentorship/MentorBrowser";
import { MentorshipCta } from "@/components/Mentorship/MentorshipCta";
import { MentorshipHero } from "@/components/Mentorship/MentorshipHero";

// Header and footer come from app/(site)/layout.tsx — don't add them here.
export default function MonitorPage() {
  return (
    <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F3FAF8] font-[family-name:var(--font-poppins)]`}>
      <MentorshipHero />
      <MentorBrowser />
      <MentorshipCta />
    </div>
  );
}
