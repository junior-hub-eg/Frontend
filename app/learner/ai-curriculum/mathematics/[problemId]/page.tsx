import ProblemDetailPage from "@/components/learner/ProblemDetailPage";

export default async function LearnerProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  return <ProblemDetailPage problemId={problemId} />;
}