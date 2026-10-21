import LessonPage from "@/components/learner/LessonPage";

export default async function Page({ params }: { params: Promise<{ trackSlug: string; lessonId: string }> }) {
  const { trackSlug, lessonId } = await params;
  return <LessonPage key={lessonId} code={trackSlug} lessonId={lessonId} />;
}