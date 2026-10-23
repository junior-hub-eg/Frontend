import StudentProfile from "@/components/mentor/StudentProfile";

export default async function MentorStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StudentProfile id={id} />;
}
