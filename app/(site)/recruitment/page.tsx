import { RecruitmentHero, RecruitmentListings } from "@/components/Landing/RecruitmentListings";

export default function RecruitmentPage() {
  return (
    <div className="flex-1 bg-white">
      <RecruitmentHero />
      <RecruitmentListings />
    </div>
  );
}
