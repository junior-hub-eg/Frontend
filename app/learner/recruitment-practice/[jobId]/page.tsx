import PracticeJobPage from "@/components/learner/PracticeJobPage";

export default async function LearnerPracticeJobPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <PracticeJobPage jobId={jobId} />;
}
