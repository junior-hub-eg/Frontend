import { QuizView } from "@/components/Courses/QuizView";
import { landingFont } from "@/components/Landing/font";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";

/** A course level's exam: passing it opens the next level. */
export default async function Page({ params }: { params: Promise<{ trackSlug: string; courseId: string; level: string }> }) {
  const { trackSlug, courseId, level } = await params;
  return (
    <LearnerPageFrame>
      <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 md:p-10 font-[family-name:var(--font-poppins)]`}>
        <QuizView key={`${courseId}-${level}`} code={trackSlug} exam={{ courseId, level }} />
      </div>
    </LearnerPageFrame>
  );
}
