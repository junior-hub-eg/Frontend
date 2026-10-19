import { TrackOverview } from "@/components/Courses/TrackOverview";
import { landingFont } from "@/components/Landing/font";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";

export default async function Page({ params }: { params: Promise<{ trackSlug: string }> }) {
  const { trackSlug } = await params;

  return (
    <LearnerPageFrame>
      <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 md:p-10 font-[family-name:var(--font-poppins)]`}>
        <TrackOverview key={trackSlug} code={trackSlug} />
      </div>
    </LearnerPageFrame>
  );
}
