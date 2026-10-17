import { LandingFooter } from "@/components/Landing/Footer";
import { LandingHeader } from "@/components/Landing/Header";
import { RecruitmentOpportunity } from "@/components/Landing/RecruitmentOpportunity";
import { landingFont } from "@/components/Landing/font";

export default function RecruitmentOpportunityPage() {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader />
      <RecruitmentOpportunity />
      <LandingFooter />
    </div>
  );
}
