"use client";

import { MessagesSquare } from "lucide-react";
import { useT } from "@/lib/i18n/client";

/**
 * The team card's "Team chat" button. Since 27 Oct 2026 the squad chat is a conversation of the one chat (the top bar's
 * chat panel); this button opens it there.
 */
export function TeamChatButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[0.45em] rounded-[0.8em] bg-[#14365a] px-[0.9em] py-[0.5em] text-[0.85em] font-bold text-white shadow-md hover:bg-[#1d4a7a]"
    >
      <MessagesSquare className="h-[1.15em] w-[1.15em]" aria-hidden /> {t("Team chat")}
      {unread > 0 && (
        <span className="grid h-[1.5em] min-w-[1.5em] place-items-center rounded-full bg-[#ef5b5b] px-[0.4em] text-[0.7em] font-bold text-white">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}
