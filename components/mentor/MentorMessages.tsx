"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Send, ShieldCheck, CalendarDays } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MENTOR_CONVERSATIONS, type Conversation } from "@/lib/data/mentor-workspace";
import { Avatar, Card, PageHeading, Pill, fieldCls } from "./mentor-ui";
import { cn } from "@/lib/utils";

export default function MentorMessages() {
  const t = useT();
  const [convs, setConvs] = useState<Conversation[]>(MENTOR_CONVERSATIONS);
  const [activeId, setActiveId] = useState(MENTOR_CONVERSATIONS[0].id);
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const active = convs.find((c) => c.id === activeId)!;
  const shown = convs.filter((c) => !q.trim() || c.student.toLowerCase().includes(q.trim().toLowerCase()));

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, active.messages.length]);

  const open = (id: string) => {
    setActiveId(id);
    setConvs((all) => all.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };
  function send() {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setConvs((all) => all.map((c) => (c.id === activeId ? { ...c, preview: text, time, messages: [...c.messages, { id: `m-${Date.now()}`, from: "mentor", text, time }] } : c)));
    setDraft("");
  }

  return (
    <>
      <PageHeading eyebrow={t("Messages")} title={t("Student conversations")} subtitle={t("Support assigned students through focused, clear and respectful messages.")} />
      <Card className="grid min-h-[30rem] gap-0 overflow-hidden p-0 md:grid-cols-[18rem_1fr]">
        <aside className="border-[#e6efed] md:border-e">
          <div className="space-y-3 p-4">
            <h2 className="flex items-center justify-between text-sm font-bold">{t("Conversations")} <Pill>{convs.reduce((n, c) => n + c.unread, 0)}</Pill></h2>
            <label className="relative block">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#14305a]/50" />
              <input className={cn(fieldCls, "py-2 ps-9 text-xs")} placeholder={t("Search conversations")} aria-label={t("Search conversations")} value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
          </div>
          <ul className="max-h-[22rem] overflow-y-auto px-2 pb-2">
            {shown.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => open(c.id)} aria-current={c.id === activeId} className={cn("flex w-full items-center gap-3 rounded-xl p-2.5 text-start", c.id === activeId ? "bg-[#e3f4f1]" : "hover:bg-[#f4fbf9]")}>
                  <Avatar initials={c.initials} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs font-semibold">{c.student}<span className="text-[0.6rem] font-normal text-[#14305a]/50">{c.time}</span></span>
                    <span className="block truncate text-[0.7rem] text-[#14305a]/60">{c.preview}</span>
                  </span>
                  {c.unread > 0 && <span className="size-2 shrink-0 rounded-full bg-[#0f8f8c]" aria-label={t("Unread")} />}
                </button>
              </li>
            ))}
            {shown.length === 0 && <li className="p-4 text-center text-xs text-[#14305a]/55">{t("No conversations found.")}</li>}
          </ul>
          <p className="m-3 flex items-start gap-2 rounded-xl bg-[#e9f7f4] p-3 text-[0.65rem] text-[#14305a]/70"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#0f8f8c]" /> {t("Conversations stay within Junior Hub. Keep them about learning.")}</p>
        </aside>

        <div className="flex min-h-[26rem] flex-col bg-[#f4fbf9]">
          <div className="flex items-center justify-between gap-3 border-b border-[#e6efed] bg-white px-5 py-3">
            <div className="flex items-center gap-3">
              <Avatar initials={active.initials} size="sm" />
              <div className="text-xs"><p className="font-semibold">{active.student}</p><p className="text-[#14305a]/55">{t(active.track)}</p></div>
            </div>
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-[#0f8f8c]"><CalendarDays className="size-3.5" /> {t("Next session this week")}</span>
          </div>
          <div ref={logRef} className="max-h-[24rem] flex-1 space-y-2 overflow-y-auto p-5" role="log" aria-live="polite">
            {active.messages.map((m) => (
              <div key={m.id} className={cn("flex", m.from === "mentor" ? "justify-end" : "justify-start")}>
                <p className={cn("max-w-[75%] rounded-2xl px-3.5 py-2 text-xs", m.from === "mentor" ? "bg-[#0f8f8c] text-white" : "bg-white")}>
                  {t(m.text)}
                  <span className={cn("mt-0.5 block text-[0.55rem]", m.from === "mentor" ? "text-white/70" : "text-[#14305a]/45")}>{m.time}</span>
                </p>
              </div>
            ))}
          </div>
          <form className="flex items-center gap-2 border-t border-[#e6efed] bg-white p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input className={cn(fieldCls, "flex-1")} placeholder={t("Write a message")} aria-label={t("Write a message")} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} />
            <button type="submit" disabled={!draft.trim()} aria-label={t("Send")} className="grid size-10 place-items-center rounded-xl bg-[#14305a] text-white hover:bg-[#0e2444] disabled:opacity-40"><Send className="size-4 rtl:-scale-x-100" /></button>
          </form>
        </div>
      </Card>
    </>
  );
}
