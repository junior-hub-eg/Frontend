import { LandingHeader } from "@/components/Landing/Header";
import { RecruitmentApplicationForm } from "@/components/Landing/RecruitmentApplicationForm";
import { landingFont } from "@/components/Landing/font";

export default function RecruitmentApplicationPage() {
  return (
    <div className={`${landingFont.variable} flex min-h-full flex-1 flex-col font-[family-name:var(--font-poppins)]`}>
      <LandingHeader activeHref="/recruitment" />
      <RecruitmentApplicationForm />
    </div>
  );
}
