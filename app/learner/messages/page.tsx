import { MessagesPage } from "@/components/chat/ChatWorkspace";
import { LearnerPageFrame } from "@/components/learner/LearnerPageFrame";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;
const one = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

/** The one chat of every dashboard (27 Oct 2026). */
export default async function Page({ searchParams }: { searchParams: Search }) {
  const { c, with: withUser, student } = await searchParams;
  return (
    <LearnerPageFrame>
      <MessagesPage conversationId={one(c)} withUserId={one(withUser) ?? one(student)} fill />
    </LearnerPageFrame>
  );
}
