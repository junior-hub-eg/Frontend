import { QuizView } from "@/components/Courses/QuizView";
import { landingFont } from "@/components/Landing/font";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";

/** "I know my track": technical questions that find the student's level in the track. */
export default async function PlacementPage({ params }: { params: Promise<{ trackCode: string }> }) {
  const { trackCode } = await params;

  return (
    <LearnerPageFrame>
      <div className={`${landingFont.variable} flex flex-1 flex-col bg-[#F7FBFA] p-6 md:p-10 font-[family-name:var(--font-poppins)]`}>
        <QuizView key={trackCode} code={trackCode} placement />
      </div>
    </LearnerPageFrame>
  );
}
