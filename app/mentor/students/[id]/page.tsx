import StudentPage from "@/components/mentor/area/StudentPage";

/** M5 · Student page (design of 26 Oct 2026). */
export default async function MentorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentPage id={id} />;
}
