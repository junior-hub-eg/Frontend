import SessionDetails from "@/components/mentor/SessionDetails";

export default async function MentorSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SessionDetails id={id} />;
}
