import MentorMessages from "@/components/mentor/MentorMessages";

export default async function MentorMessagesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { student } = await searchParams;
  return <MentorMessages studentId={typeof student === "string" ? student : undefined} />;
}
