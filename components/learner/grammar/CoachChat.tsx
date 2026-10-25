"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import { askGrammarCoach } from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import { CARD, isAiUnavailable } from "./shared";
import { errorMessage } from "@/lib/api-client";

type Message = { role: "student" | "coach"; text: string; failed?: boolean };

/** The star mascot of the design, drawn with a star and a face. */
function Mascot({ small }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#5aa9f5] to-[#2f6fd6] text-white shadow ${
        small ? "h-[2.2em] w-[2.2em] text-[1.1em]" : "h-[3.4em] w-[3.4em] text-[1.9em]"
      }`}
    >
      ⭐
    </span>
  );
}

/** "اسأل المساعد الذكي": questions about the topic, with the current sentence as context. */
export default function CoachChat({ topicKey, context }: { topicKey: string; context: string }) {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // A different topic starts a new conversation.
  const [shownKey, setShownKey] = useState(topicKey);
  if (shownKey !== topicKey) {
    setShownKey(topicKey);
    setMessages([]);
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  const send = async () => {
    const question = draft.trim();
    if (!question || sending) return;
    const history = messages.filter((m) => !m.failed).map(({ role, text }) => ({ role, text }));
    setMessages((m) => [...m, { role: "student", text: question }]);
    setDraft("");
    setSending(true);
    try {
      const { answer } = await askGrammarCoach(topicKey, question, context, history);
      setMessages((m) => [...m, { role: "coach", text: answer }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "coach",
          failed: true,
          text: isAiUnavailable(e) ? t("The AI coach is taking a short break. Please try again in a moment.") : errorMessage(e),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className={`${CARD} flex flex-col p-[1em]`}>
      <header className="flex items-center justify-between gap-[0.6em]">
        <h2 className="flex items-center gap-[0.4em] text-[1.15em] font-extrabold text-[#14365a]">
          <Bot className="h-[1.3em] w-[1.3em] text-[#2f6fd6]" />
          {t("Ask the AI assistant")}
        </h2>
        <Mascot />
      </header>

      <div ref={listRef} className="mt-[0.7em] flex max-h-[22em] min-h-[6em] flex-col gap-[0.6em] overflow-y-auto">
        {messages.length === 0 && (
          <p className="rounded-[0.9em] bg-[#f3f9fd] p-[0.8em] text-[0.8em] text-[#5b7089]">
            {t("Ask anything about this lesson or the sentence you are practising.")}
          </p>
        )}
        {messages.map((m, i) =>
          m.role === "student" ? (
            <div key={i} className="flex items-start gap-[0.4em]">
              <span className="grid h-[2em] w-[2em] shrink-0 place-items-center rounded-full bg-[#eef1f4] text-[#5b6675]">
                <UserRound className="h-[1.1em] w-[1.1em]" />
              </span>
              <p dir="auto" className="rounded-[0.9em] bg-[#eaf4fd] px-[0.8em] py-[0.5em] text-[0.85em] text-[#14365a]">{m.text}</p>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-[0.4em]">
              <Mascot small />
              <p
                dir="auto"
                className={`whitespace-pre-line rounded-[0.9em] px-[0.8em] py-[0.5em] text-[0.85em] ring-1 ${
                  m.failed ? "bg-[#fff8ef] text-[#8a4b12] ring-[#f6d6b4]" : "bg-white text-[#14365a] ring-[#e3eef5]"
                }`}
              >
                {m.text}
              </p>
            </div>
          )
        )}
        {sending && (
          <div className="flex items-center gap-[0.4em] text-[0.8em] text-[#5b7089]">
            <Mascot small />
            {t("Thinking...")}
          </div>
        )}
      </div>

      <form
        className="mt-[0.8em] flex items-center gap-[0.5em]"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          dir="auto"
          maxLength={500}
          placeholder={t("Type your question here...")}
          aria-label={t("Your question")}
          className="min-w-0 flex-1 rounded-full border border-[#e3eef5] bg-white px-[1em] py-[0.6em] text-[0.85em] text-[#14365a] outline-none focus:border-[#2bb8a6]"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sending}
          aria-label={t("Send")}
          className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-full bg-[#1f9e95] text-white transition hover:brightness-110 disabled:opacity-50"
        >
          <Send className="h-[1.1em] w-[1.1em] rtl:-scale-x-100" />
        </button>
      </form>
    </section>
  );
}
