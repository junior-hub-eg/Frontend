"use client";

import { useState } from "react";
import Image from "next/image";
import { Send, X } from "lucide-react";

export type Teammate = { name: string; avatar: string; bg: string; role?: string; isMe?: boolean };

const ROLE_TITLE: Record<string, string> = {
  Frontend: "Frontend Developer",
  Backend: "Backend Developer",
  UIUX: "UI/UX Designer",
  AI: "AI Engineer",
  Testing: "QA Tester",
  Data: "Data Analyst",
  Mobile: "Mobile Developer",
  Gaming: "Game Developer",
};
type Msg = { from: "me" | "them"; text: string };

export function TeammatesPanel({
  teammates,
  className = "",
  fluid = false,
}: {
  teammates: Teammate[];
  className?: string;
  fluid?: boolean;
}) {
  const [active, setActive] = useState<Teammate | null>(null);
  const [threads, setThreads] = useState<Record<string, Msg[]>>({});
  const [draft, setDraft] = useState("");

  const messages = active ? (threads[active.name] ?? []) : [];

  function send() {
    const text = draft.trim();
    if (!active || !text) return;
    setThreads((t) => ({ ...t, [active.name]: [...(t[active.name] ?? []), { from: "me", text }] }));
    setDraft("");
  }

  function toggle(m: Teammate) {
    setDraft("");
    setActive((cur) => (cur?.name === m.name ? null : m));
  }

  const card =
    "rounded-[1.4em] border border-white/80 bg-white/55 p-[1em] shadow-lg shadow-[#14365a]/10 backdrop-blur-md";

  return (
    <div
      style={{ fontSize: fluid ? "clamp(8px, calc(var(--u) * 0.95), 14px)" : "14px" }}
      className={`flex items-start gap-[0.8em] ${fluid ? "flex-row" : "flex-col"} ${className}`}
    >
      {/* ---------- Chat card (appears to the left of the list) ---------- */}
      {active && (
        <section
          aria-label={`Chat with ${active.name}`}
          className={`${card} ${fluid ? "w-[calc(var(--u)*19)]" : "w-full"}`}
        >
          <div className="flex items-center justify-between gap-[0.5em]">
            <span className="flex min-w-0 items-center gap-[0.5em] text-[0.9em] font-bold text-[#14365a]">
              <span
                className="relative h-[2em] w-[2em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                style={{ backgroundColor: active.bg }}
              >
                <Image src={active.avatar} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
              </span>
              <span className="truncate">{active.name}</span>
            </span>
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close chat"
              className="grid h-[1.8em] w-[1.8em] shrink-0 place-items-center rounded-full text-[#14365a]/70 ring-1 ring-[#14365a]/30 hover:text-[#14365a]"
            >
              <X className="h-[1em] w-[1em]" />
            </button>
          </div>

          <div className="mt-[0.6em] flex h-[7em] flex-col gap-[0.3em] overflow-y-auto text-[0.75em] font-semibold text-[#14365a]">
            {messages.length === 0 && <p className="text-[#14365a]/50">Say hi 👋</p>}
            {messages.map((m, i) => (
              <p key={i} className={`max-w-full break-words ${m.from === "me" ? "self-start" : "self-end"}`}>
                {m.from === "me" ? `You: ${m.text}` : `${m.text} :${active.name.split(" ")[0]}`}
              </p>
            ))}
          </div>

          <div className="mt-[0.6em] flex items-center gap-[0.5em] rounded-[0.9em] border border-white/80 bg-white/70 px-[0.8em] py-[0.5em]">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type something..."
              className="min-w-0 flex-1 bg-transparent text-[0.8em] text-[#14365a] outline-none placeholder:text-[#14365a]/50"
            />
            <button type="button" onClick={send} aria-label="Send message" className="text-[#14365a]">
              <Send className="h-[1.1em] w-[1.1em]" />
            </button>
          </div>
        </section>
      )}

      {/* ---------- Teammates list ---------- */}
      <section
        aria-labelledby="teammates-title"
        className={`${card} ${fluid ? "w-[calc(var(--u)*22.1)] shrink-0" : "w-full"}`}
      >
        <h2
          id="teammates-title"
          className="mb-[0.8em] flex items-center gap-[0.5em] text-[1.15em] font-extrabold text-[#14365a]"
        >
          <svg className="h-[1.6em] w-[1.6em]" viewBox="0 0 24 24" fill="#14365a" aria-hidden="true">
            <circle cx="12" cy="5" r="3" />
            <circle cx="5" cy="12" r="3" />
            <circle cx="19" cy="12" r="3" />
            <circle cx="12" cy="19" r="3" />
          </svg>
          Your Teammates
        </h2>

        {teammates.length === 0 && (
          <p className="text-[0.85em] text-[#14365a]/70">You&apos;ll see your squad here once you join an internship team.</p>
        )}
        <ul className="grid gap-[0.6em]">
          {teammates.map((m, i) => {
            const isActive = active?.name === m.name;
            return (
              <li key={i} className="flex items-center gap-[0.6em] text-[1em] font-semibold text-[#14365a]">
                <span
                  className="relative h-[2.4em] w-[2.4em] shrink-0 overflow-hidden rounded-full ring-2 ring-white"
                  style={{ backgroundColor: m.bg }}
                >
                  <Image src={m.avatar} alt="" fill sizes="40px" className="origin-top scale-[2.1] object-cover object-top" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate">
                    {m.name}
                    {m.isMe && <span className="ml-[0.3em] text-[0.8em] font-medium text-[#14365a]/60">(you)</span>}
                  </span>
                  {m.role && <span className="block truncate text-[0.7em] font-medium text-[#14365a]/65">{ROLE_TITLE[m.role] ?? m.role}</span>}
                </span>

                <button
                  type="button"
                  className="ml-auto flex shrink-0 items-center gap-[0.4em] whitespace-nowrap rounded-full bg-[#43a5ff]/90 px-[0.9em] py-[0.25em] text-[0.85em] font-extrabold text-white hover:bg-[#2f90ec]"
                >
                  Invite <span className="text-[1.2em] leading-none">+</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggle(m)}
                  aria-label={`Message ${m.name}`}
                  aria-pressed={isActive}
                  className={`grid h-[2em] w-[2em] shrink-0 place-items-center rounded-full text-[#2f7fd6] ring-1 ring-[#43a5ff]/60 ${
                    isActive ? "bg-[#43a5ff]/55" : "bg-[#43a5ff]/25 hover:bg-[#43a5ff]/40"
                  }`}
                >
                  <svg
                    className="h-[1em] w-[1em]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}