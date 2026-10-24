"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Send, ShieldCheck, MessageSquare } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  getMonitorConversations,
  getMonitorMessages,
  getMonitorStudents,
  markMonitorMessagesRead,
  sendMonitorMessage,
  type DirectMessage,
} from "@/lib/monitor-api";
import { Avatar, Card, EmptyState, PageHeading, Pill, fieldCls } from "./mentor-ui";
import { LoadState, initialsOf, shortTime, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

/** A conversation, or an assigned student the mentor has not written to yet. */
interface Thread {
  studentId: string;
  name: string;
  track: string;
  preview: string;
  time: string;
  unread: number;
}

async function loadThreads(): Promise<Thread[]> {
  const [conversations, students] = await Promise.all([getMonitorConversations(), getMonitorStudents().catch(() => [])]);
  const threads: Thread[] = conversations.map((c) => ({
    studentId: c.partnerId,
    name: c.partnerName,
    track: c.track,
    preview: c.preview,
    time: c.time,
    unread: c.unread,
  }));
  for (const s of students) {
    if (!threads.some((x) => x.studentId === s.id)) threads.push({ studentId: s.id, name: s.name, track: s.track, preview: "", time: "", unread: 0 });
  }
  return threads;
}

export default function MentorMessages({ studentId }: { studentId?: string }) {
  const { data, error, reload } = useMentorData(loadThreads, tk("Could not load your conversations."));
  if (!data) {
    return (
      <>
        <Heading />
        <LoadState error={error} onRetry={reload} />
      </>
    );
  }
  return <Inbox initial={data} firstId={data.some((x) => x.studentId === studentId) ? studentId : data[0]?.studentId} />;
}

function Heading() {
  const t = useT();
  return <PageHeading eyebrow={t("Messages")} title={t("Student conversations")} subtitle={t("Support assigned students through focused, clear and respectful messages.")} />;
}

function Inbox({ initial, firstId }: { initial: Thread[]; firstId?: string }) {
  const t = useT();
  const [threads, setThreads] = useState(() => initial.map((c) => (c.studentId === firstId ? { ...c, unread: 0 } : c)));
  const [activeId, setActiveId] = useState(firstId);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const active = threads.find((c) => c.studentId === activeId);
  const shown = threads.filter((c) => !q.trim() || c.name.toLowerCase().includes(q.trim().toLowerCase()));

  const loadMessages = useCallback(() => (activeId ? getMonitorMessages(activeId) : Promise.resolve([] as DirectMessage[])), [activeId]);
  const messages = useMentorData(loadMessages, tk("Could not load the messages."));
  const list = messages.data ?? [];

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, list.length]);

  // The conversation opened first counts as read.
  useEffect(() => {
    if (firstId && initial.some((c) => c.studentId === firstId && c.unread > 0)) markMonitorMessagesRead(firstId).catch(() => undefined);
  }, [firstId, initial]);

  const open = (id: string) => {
    setActiveId(id);
    setSendError(null);
    setThreads((all) => all.map((c) => (c.studentId === id ? { ...c, unread: 0 } : c)));
    if (threads.some((c) => c.studentId === id && c.unread > 0)) markMonitorMessagesRead(id).catch(() => undefined);
  };
  async function send() {
    const text = draft.trim();
    if (!text || !activeId) return;
    setSending(true);
    setSendError(null);
    try {
      const message = await sendMonitorMessage(activeId, text);
      messages.setData((all) => [...(all ?? []), message]);
      setThreads((all) => all.map((c) => (c.studentId === activeId ? { ...c, preview: text, time: message.createdUtc } : c)));
      setDraft("");
    } catch (e) {
      setSendError(errorMessage(e, t("Could not send the message.")));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Heading />
      <Card className="grid min-h-[30rem] gap-0 overflow-hidden p-0 md:grid-cols-[18rem_1fr]">
        <aside className="border-[#e6efed] md:border-e">
          <div className="space-y-3 p-4">
            <h2 className="flex items-center justify-between text-sm font-bold">{t("Conversations")} <Pill>{threads.reduce((n, c) => n + c.unread, 0)}</Pill></h2>
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#14305a]/50" />
              <input className={cn(fieldCls, "py-2 ps-9 text-xs")} placeholder={t("Search conversations")} aria-label={t("Search conversations")} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>
          <ul className="max-h-[22rem] overflow-y-auto px-2 pb-2">
            {shown.map((c) => (
              <li key={c.studentId}>
                <button type="button" onClick={() => open(c.studentId)} aria-current={c.studentId === activeId} className={cn("flex w-full items-center gap-3 rounded-xl p-2.5 text-start", c.studentId === activeId ? "bg-[#e3f4f1]" : "hover:bg-[#f4fbf9]")}>
                  <Avatar initials={initialsOf(c.name)} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs font-semibold">{c.name}<span className="text-[0.6rem] font-normal text-[#14305a]/50">{c.time.includes("T") ? shortTime(c.time) : ""}</span></span>
                    <span className="block truncate text-[0.7rem] text-[#14305a]/60">{c.preview || t("No messages yet")}</span>
                  </span>
                  {c.unread > 0 && <span className="size-2 shrink-0 rounded-full bg-[#0f8f8c]" aria-label={t("Unread")} />}
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="p-4 text-center text-xs text-[#14305a]/55">{t("No conversations found.")}</li>}
          </ul>
          <p className="m-3 flex items-start gap-2 rounded-xl bg-[#e9f7f4] p-3 text-[0.65rem] text-[#14305a]/70"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#0f8f8c]" /> {t("Conversations stay within Junior Hub. Keep them about learning.")}</p>
        </aside>

        {!active ? (
          <div className="grid place-items-center bg-[#f4fbf9]">
            <EmptyState icon={<MessageSquare className="size-5" />} title={t("No conversations yet")} hint={t("Students assigned to you will appear here.")} />
          </div>
        ) : (
          <div className="flex min-h-[26rem] flex-col bg-[#f4fbf9]">
            <div className="flex items-center justify-between gap-3 border-b border-[#e6efed] bg-white px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar initials={initialsOf(active.name)} size="sm" />
                <div className="text-xs"><p className="font-semibold">{active.name}</p><p className="text-[#14305a]/55">{t(active.track)}</p></div>
              </div>
            </div>
            <div ref={logRef} className="max-h-[24rem] flex-1 space-y-2 overflow-y-auto p-5" role="log" aria-live="polite">
              {!messages.data && <LoadState error={messages.error} onRetry={messages.reload} />}
              {messages.data && list.length === 0 && <p className="py-10 text-center text-xs text-[#14305a]/55">{t("No messages yet. Say hello to start the conversation.")}</p>}
              {list.map((m) => (
                <div key={m.id} className={cn("flex", m.from === "mentor" ? "justify-end" : "justify-start")}>
                  <p className={cn("max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-xs", m.from === "mentor" ? "bg-[#0f8f8c] text-white" : "bg-white")}>
                    {m.text}
                    <span className={cn("mt-0.5 block text-[0.55rem]", m.from === "mentor" ? "text-white/70" : "text-[#14305a]/45")}>{shortTime(m.createdUtc)}</span>
                  </p>
                </div>
              ))}
            </div>
            {sendError && <p role="alert" className="bg-[#fdecec] px-4 py-2 text-xs font-semibold text-[#b83232]">{sendError}</p>}
            <form className="flex items-center gap-2 border-t border-[#e6efed] bg-white p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input className={cn(fieldCls, "flex-1")} placeholder={t("Write a message")} aria-label={t("Write a message")} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} />
              <button type="submit" disabled={!draft.trim() || sending} aria-label={t("Send")} className="grid size-10 place-items-center rounded-xl bg-[#14305a] text-white hover:bg-[#0e2444] disabled:opacity-40"><Send className="size-4 rtl:-scale-x-100" /></button>
            </form>
          </div>
        )}
      </Card>
    </>
  );
}
