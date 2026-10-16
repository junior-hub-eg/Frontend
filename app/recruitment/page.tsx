import { LandingFooter } from "@/components/Landing/Footer";
import { LandingHeader } from "@/components/Landing/Header";
import { landingFont } from "@/components/Landing/font";
import { RecruitmentHero, RecruitmentListings } from "@/components/Landing/RecruitmentListings";

export default function RecruitmentPage() {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader activeHref="/recruitment" />
      <main className="flex-1 bg-white">
        <RecruitmentHero />
        <RecruitmentListings />
      </main>
      <LandingFooter />
    </div>
  );
}
