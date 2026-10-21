import CourseDetailPage from "@/components/learner/CourseDetailPage";

/** A course of a track (HTML, React…) with its 3 levels. */
export default async function Page({ params }: { params: Promise<{ trackSlug: string; courseId: string }> }) {
  const { trackSlug, courseId } = await params;
  return <CourseDetailPage key={courseId} code={trackSlug} courseId={courseId} />;
}
