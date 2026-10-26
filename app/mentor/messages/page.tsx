import MentorMessagesPage from "@/components/mentor/area/MentorMessagesPage";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/** The one chat of every dashboard (27 Oct 2026); ?student= keeps the old links working. */
export default async function Page({ searchParams }: { searchParams: Search }) {
  const { c, with: withUser, student } = await searchParams;
  return <MentorMessagesPage conversationId={one(c)} withUserId={one(withUser) ?? one(student)} />;
}
