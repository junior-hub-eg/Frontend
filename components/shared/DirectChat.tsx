"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LoaderCircle, Send, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { useLiveChannel } from "@/lib/live-channel";
import type { DirectMessage } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";

/** The "DirectMessage" event of /hubs/live, sent to both people of the conversation. */
interface DirectMessageEvent {
  id: string;
  senderId: string;
  recipientId: string;
  senderRole: string;
  text: string;
  sentUtc: string;
}

interface Props {
  /** The other person: the student for a mentor, the mentor for a student. */
  partner: { id: string; name: string; photoUrl?: string | null; subtitle?: string };
  /** "mentor" or "student": who is writing on this page. */
  me: "mentor" | "student";
  load: (partnerId: string) => Promise<DirectMessage[]>;
  send: (partnerId: string, text: string) => Promise<DirectMessage>;
  markRead: (partnerId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * The private mentor-student chat, as a side drawer. New messages come live; without the live channel it looks for
 * them every 15 seconds. The parent keys it by the partner, so a new partner starts a fresh chat.
 */
export default function DirectChat({ partner, me, load, send, markRead, onClose }: Props) {
  const { t, intl, dir } = useI18n();
  const [messages, setMessages] = useState<DirectMessage[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    load(partner.id).then(setMessages, (e) => setErr(errorMessage(e)));
    markRead(partner.id).catch(() => undefined);
  }, [partner.id, load, markRead]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const live = useLiveChannel({
    DirectMessage: (m: DirectMessageEvent) => {
      if (m.senderId !== partner.id && m.recipientId !== partner.id) return;
      const mine = m.senderId !== partner.id;
      setMessages((all) =>
        all?.some((x) => x.id === m.id)
          ? all
          : [...(all ?? []), { id: m.id, senderId: m.senderId, recipientId: m.recipientId, from: mine ? me : m.senderRole, text: m.text, createdUtc: m.sentUtc, time: "" }],
      );
      if (!mine) markRead(partner.id).catch(() => undefined);
    },
  });
  // Without the live channel, look for new messages every 15 seconds.
  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => load(partner.id).then(setMessages, () => undefined), 15000);
    return () => clearInterval(timer);
  }, [live, partner.id, load]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr(null);
    send(partner.id, body).then(
      (m) => {
        setMessages((all) => (all?.some((x) => x.id === m.id) ? all : [...(all ?? []), m]));
        setText("");
        setBusy(false);
      },
      (er) => {
        setErr(errorMessage(er));
        setBusy(false);
      },
    );
  };

  const [opened] = useState(() => Date.now());
  const groups = useMemo(() => {
    const out: { label: string; items: DirectMessage[] }[] = [];
    const today = new Date(opened).toDateString();
    const yesterday = new Date(opened - 86400000).toDateString();
    for (const m of messages ?? []) {
      const d = new Date(m.createdUtc).toDateString();
      const label = d === today ? t("Today") : d === yesterday ? t("Yesterday") : new Date(m.createdUtc).toLocaleDateString(intl, { weekday: "long", month: "short", day: "numeric" });
      if (out[out.length - 1]?.label !== label) out.push({ label, items: [] });
      out[out.length - 1].items.push(m);
    }
    return out;
  }, [messages, t, intl, opened]);

  // On <body>, so no page layer (the top bar, the assistant button) covers it.
  return createPortal(
    <div dir={dir} className="fixed inset-0 z-[80] flex justify-end bg-[#0b1b33]/30" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("Chat with {name}", { name: partner.name })}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[26rem] flex-col bg-white text-[#1b2d54] shadow-[0_0_40px_rgba(20,54,90,0.25)]"
      >
        <header className="flex items-center gap-3 border-b border-[#eef2f6] px-4 py-3">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffd38a] text-sm font-bold">
            {partner.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partner.photoUrl} alt="" className="size-full object-cover" />
            ) : (
              partner.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-bold">{partner.name}</span>
            {partner.subtitle && <span className="block truncate text-xs text-[#64748b]">{partner.subtitle}</span>}
          </span>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-[#f2f5f8]">
            <X className="size-5" />
          </button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-[#f7fafc] px-4 py-4">
          {!messages && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
          {messages?.length === 0 && <p className="py-10 text-center text-sm text-[#64748b]">{t("No messages yet. Say hello!")}</p>}
          {groups.map((g) => (
            <div key={g.label} className="space-y-2">
              <p className="text-center text-xs font-medium text-[#64748b]">{g.label}</p>
              {g.items.map((m) => {
                const mine = m.from === me;
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <p
                      className={cn(
                        "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm",
                        mine ? "rounded-ee-sm bg-[#1b2d54] text-white" : "rounded-es-sm bg-white text-[#1b2d54] shadow-sm",
                      )}
                    >
                      {m.text}
                      <span className={cn("mt-1 block text-[0.7rem]", mine ? "text-white/60" : "text-[#98a2b3]")}>
                        {new Date(m.createdUtc).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={end} />
        </div>

        {err && <p role="alert" className="bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
        <form onSubmit={submit} className="flex items-end gap-2 border-t border-[#eef2f6] p-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) submit(e);
            }}
            rows={1}
            maxLength={2000}
            placeholder={t("Write a message...")}
            aria-label={t("Message")}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-[#e1e8f0] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f7378]/30"
          />
          <button
            type="submit"
            disabled={busy || !text.trim()}
            aria-label={t("Send")}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0f7378] text-white disabled:opacity-50"
          >
            <Send className="size-4 rtl:-scale-x-100" />
          </button>
        </form>
      </aside>
    </div>,
    document.body,
  );
}
