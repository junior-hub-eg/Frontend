import { notFound } from "next/navigation";
import { TrackOverview } from "@/components/Courses/TrackOverview";
import { landingFont } from "@/components/Landing/font";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";
import { getTrack } from "@/lib/data/courses";

export default async function TrackCoursesPage({ params }: { params: Promise<{ trackSlug: string }> }) {
  const { trackSlug } = await params;
  const track = getTrack(trackSlug);
  if (!track) notFound();

  return (
    <LearnerPageFrame>
      <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 font-[family-name:var(--font-poppins)] md:p-10`}>
        <TrackOverview track={track} />
      </div>
    </LearnerPageFrame>
  );
}
