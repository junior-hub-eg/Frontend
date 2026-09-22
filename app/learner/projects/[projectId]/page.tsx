import { PlaceholderPage } from "@/components/shared/placeholder-page";

export default async function ProjectDetailPage({ params }: PageProps<"/learner/projects/[projectId]">) {
  const { projectId } = await params;
  return (
    <PlaceholderPage
      title={`مشروع #${projectId}`}
      description="تفاصيل المهام، الفريق، الشات، والسكور"
      waitingOn="تصميمات صفحة الفريق (Sprint 4 UI/UX) + Task Board API (Sprint 5 backend)"
      prdSection="§4.4"
    />
  );
}
