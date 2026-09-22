import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default async function TrackCoursesPage({ params }: PageProps<"/learner/courses/[trackSlug]">) {
  const { trackSlug } = await params;
  return (
    <PlaceholderPage
      title={`مسار: ${trackSlug}`}
      description="عرض الموديولات، مشغل الفيديو، والكويز/case-study بعد كل فيديو"
      waitingOn="تصميمات UI/UX لمرحلة التعلم + Learning Phase API (Sprint 2 backend)"
      prdSection="§4.1"
    />
  );
}
