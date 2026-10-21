import LessonQuizPage from "@/components/learner/LessonQuizPage";

export default async function Page({ params }: { params: Promise<{ trackSlug: string; lessonId: string }> }) {
  const { trackSlug, lessonId } = await params;
  return <LessonQuizPage key={lessonId} code={trackSlug} lessonId={lessonId} />;
}