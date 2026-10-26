"use client";

import { MessagesPage } from "@/components/chat/ChatWorkspace";
import { useI18n } from "@/lib/i18n/client";
import { MentorPage } from "../mentor-area-ui";

/** M · Messages: the one chat (27 Oct 2026) under the mentor area's top bar. */
export default function MentorMessagesPage({ conversationId, withUserId }: { conversationId?: string; withUserId?: string }) {
  const { t } = useI18n();
  return (
    <MentorPage title={t("Messages")} subtitle={t("Students, squads, teachers, admins: everyone on Junior Hub.")}>
      <MessagesPage conversationId={conversationId} withUserId={withUserId} />
    </MentorPage>
  );
}
