import { notFound } from "next/navigation";
import { LessonView } from "@/components/Courses/LessonView";
import { landingFont } from "@/components/Landing/font";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";
import { getTrack } from "@/lib/data/courses";

export default async function LessonPage({ params }: { params: Promise<{ trackSlug: string; lessonId: string }> }) {
  const { trackSlug, lessonId } = await params;
  const track = getTrack(trackSlug);
  const lessonIndex = track ? track.lessons.findIndex((l) => l.id === lessonId) : -1;
  if (!track || lessonIndex === -1) notFound();

  return (
    <LearnerPageFrame>
      <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 font-[family-name:var(--font-poppins)] md:p-10`}>
        <LessonView track={track} lessonIndex={lessonIndex} />
      </div>
    </LearnerPageFrame>
  );
}
