import { notFound } from "next/navigation";
import ProblemDetailPage from "@/components/learner/ProblemDetailPage";
import { MATH_PROBLEMS, getMathProblem } from "@/lib/math-problems";

export function generateStaticParams() {
  return MATH_PROBLEMS.map((p) => ({ problemId: p.id }));
}

export default async function LearnerProblemPage({
  params,
}: {
  params: Promise<{ problemId: string }>;
}) {
  const { problemId } = await params;
  const problem = getMathProblem(problemId);
  // A problem that does not exist shows "page not found" instead of another problem's content.
  if (!problem) notFound();
  return <ProblemDetailPage problem={problem} />;
}
