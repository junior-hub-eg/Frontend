"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowUp, History, LoaderCircle, MessageCircle, Plus, Sparkles, X } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  assistantLinkHref,
  getAssistantConversation,
  getAssistantConversations,
  sendAssistantMessage,
  type AssistantConversationSummary,
  type AssistantLink,
  type AssistantMessage,
} from "@/lib/assistant-api";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/config";

const MAX_LENGTH = 1000;
/** The chat the student had open, so it reopens after a page change or reload (this browser only). */
const STORAGE_KEY = "jh.assistant.conversation";
const STARTERS = [
  tk("What's my next lesson?"),
  tk("How much XP do I have?"),
  tk("Who is my mentor?"),
  tk("Explain the lesson I'm on"),
];

/** The links and suggestions of the latest reply; earlier replies show their text only. */
interface LatestReply {
  replyId: string;
  suggestions: string[];
  links: AssistantLink[];
  isFallback: boolean;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(id: string | null) {
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage blocked: the chat still works, it just won't reopen
  }
}

/**
 * The Junior Hub assistant: a floating chat on every student page. It answers questions about the student's own
 * journey (next lesson, XP, squad, mentor...) and the platform. Chats are stored by the backend.
 */
/** The top-bar button (AssistantButton) asks the chat to open or close with this window event. */
const TOGGLE_EVENT = "jh:assistant-toggle";

/** The assistant's button in the learner top bar, next to the bell. */
export function AssistantButton() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(TOGGLE_EVENT))}
      aria-label={t("Open assistant")}
      title={t("Junior Hub assistant")}
      className="grid h-[2.8em] w-[2.8em] place-items-center rounded-full bg-[#12939b] text-white shadow-[0_6px_18px_-6px_rgba(18,147,155,0.7)] transition hover:bg-[#0f7a81]"
    >
      <MessageCircle className="h-[1.2em] w-[1.2em]" />
    </button>
  );
}

export function AssistantChat() {
  const { t, intl, dir, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [latest, setLatest] = useState<LatestReply | null>(null);
  const [canContinue, setCanContinue] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<AssistantConversationSummary[] | null>(null);
  const restored = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open && !showHistory) inputRef.current?.focus();
  }, [open, showHistory]);

  async function openConversation(id: string) {
    setLoading(true);
    setError(null);
    try {
      const chat = await getAssistantConversation(id);
      setConversationId(chat.id);
      setMessages(chat.messages);
      setCanContinue(chat.canContinue);
      setLatest(null);
      setShowHistory(false);
      store(chat.id);
    } catch {
      // A chat that is gone (or another account's): start fresh.
      newChat();
    } finally {
      setLoading(false);
    }
  }

  function toggleOpen() {
    setOpen((o) => !o);
    // On first open, reopen the chat from last time.
    if (restored.current) return;
    restored.current = true;
    const id = readStored();
    if (id) void openConversation(id);
  }

  const toggleRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    toggleRef.current = toggleOpen;
  });
  useEffect(() => {
    const onToggle = () => toggleRef.current();
    window.addEventListener(TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(TOGGLE_EVENT, onToggle);
  }, []);

  function newChat() {
    setConversationId(null);
    setMessages([]);
    setLatest(null);
    setCanContinue(true);
    setShowHistory(false);
    setError(null);
    store(null);
  }

  async function toggleHistory() {
    if (showHistory) return setShowHistory(false);
    setShowHistory(true);
    try {
      setHistory(await getAssistantConversations());
    } catch (e) {
      setError(errorMessage(e, tk("We can't load your old chats right now.")));
      setShowHistory(false);
    }
  }

  async function send(question: string) {
    const value = question.trim();
    if (!value || sending || !canContinue) return;
    setSending(true);
    setError(null);
    setText("");
    // Show the question right away; the stored one replaces it when the reply comes.
    const pending: AssistantMessage = {
      id: `pending-${Date.now()}`,
      orderIndex: (messages.at(-1)?.orderIndex ?? 0) + 1,
      role: "Student",
      text: value,
      createdUtc: new Date().toISOString(),
    };
    setMessages((m) => [...m, pending]);
    setLatest(null);
    try {
      const result = await sendAssistantMessage(value, conversationId);
      setConversationId(result.conversationId);
      store(result.conversationId);
      setMessages((m) => [...m.filter((x) => x.id !== pending.id), result.message, result.reply]);
      setLatest({
        replyId: result.reply.id,
        suggestions: result.suggestions,
        links: result.links,
        isFallback: result.isFallback,
      });
      setCanContinue(result.canContinue);
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== pending.id));
      setText(value);
      setError(
        e instanceof ApiError && e.status === 429
          ? t("You sent a lot of questions in a row. Wait a minute and try again.")
          : errorMessage(e, tk("Your message wasn't sent. Try again."))
      );
    } finally {
      setSending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(text);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(text);
    }
  }

  return (
    <>
      {open && (
        <section
          role="dialog"
          aria-label={t("Junior Hub assistant")}
          className="fixed inset-0 z-[60] flex flex-col bg-white sm:inset-auto sm:top-24 sm:end-6 sm:h-[min(620px,calc(100vh-8rem))] sm:w-[380px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-[#d7e6ea] sm:shadow-[0_20px_60px_-15px_rgba(20,54,90,0.35)]"
        >
          <header className="flex items-center gap-2 bg-[#14365a] px-4 py-3 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-[#12939b]">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1" dir={dir}>
              <h2 className="text-sm font-bold">{t("Junior Hub assistant")}</h2>
              <p className="truncate text-xs text-white/70">{t("Ask me about your lessons, XP, your squad or your mentor")}</p>
            </div>
            <button
              type="button"
              onClick={() => void toggleHistory()}
              aria-label={t("Previous chats")}
              aria-pressed={showHistory}
              className={cn("rounded-full p-2 hover:bg-white/10", showHistory && "bg-white/15")}
            >
              <History className="size-4" />
            </button>
            <button type="button" onClick={newChat} aria-label={t("New chat")} className="rounded-full p-2 hover:bg-white/10">
              <Plus className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("Close assistant")}
              className="rounded-full p-2 hover:bg-white/10"
            >
              <X className="size-4" />
            </button>
          </header>

          {showHistory ? (
            <div className="flex-1 overflow-y-auto p-3" dir={dir}>
              <p className="px-1 pb-2 text-xs font-bold text-[#14365a]/70">{t("Your chats")}</p>
              {history === null ? (
                <div className="grid place-items-center p-8">
                  <LoaderCircle className="size-6 animate-spin text-[#12939b]" />
                </div>
              ) : history.length === 0 ? (
                <p className="p-4 text-center text-sm text-[#14365a]/60">{t("No chats yet.")}</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {history.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => void openConversation(c.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-2 text-start hover:bg-[#eef7f8]",
                          c.id === conversationId && "bg-[#eef7f8]"
                        )}
                      >
                        <span dir="auto" className="block truncate text-sm font-semibold text-[#14365a]">
                          {c.title || t("Chat")}
                        </span>
                        <span className="text-xs text-[#14365a]/60">
                          {new Date(c.lastMessageUtc).toLocaleDateString(intl, { day: "numeric", month: "short" })}
                          {" · "}
                          {questionCount(Math.ceil(c.messageCount / 2), locale)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto bg-[#f7fbfc] px-3 py-4" aria-live="polite">
              {loading ? (
                <div className="grid h-full place-items-center">
                  <LoaderCircle className="size-6 animate-spin text-[#12939b]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center" dir={dir}>
                  <span className="grid size-14 place-items-center rounded-full bg-[#e3f4f5]">
                    <MessageCircle className="size-7 text-[#12939b]" aria-hidden />
                  </span>
                  <div>
                    <p className="font-bold text-[#14365a]">{t("Hi! I'm your Junior Hub assistant 👋")}</p>
                    <p className="mt-1 text-sm text-[#14365a]/70">{t("Try asking me:")}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STARTERS.map((s) => (
                      <SuggestionChip key={s} text={t(s)} onPick={send} disabled={sending} />
                    ))}
                  </div>
                </div>
              ) : (
                <ol className="flex flex-col gap-3">
                  {messages.map((m) => (
                    <li key={m.id} className={cn("flex flex-col gap-2", m.role === "Student" ? "items-end" : "items-start")}>
                      <p
                        dir="auto"
                        className={cn(
                          "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          m.role === "Student"
                            ? "rounded-ee-sm bg-[#12939b] text-white"
                            : "rounded-es-sm border border-[#d7e6ea] bg-white text-[#14365a]",
                          latest?.replyId === m.id && latest.isFallback && "border-amber-200 bg-amber-50"
                        )}
                      >
                        {m.text}
                      </p>
                      {latest?.replyId === m.id && latest.links.length > 0 && (
                        <div className="flex max-w-[85%] flex-wrap gap-1.5">
                          {latest.links.map((link) => {
                            const href = assistantLinkHref(link);
                            return href ? (
                              <Link
                                key={`${link.kind}:${link.ref}`}
                                href={href as Route}
                                onClick={() => window.matchMedia("(max-width: 639px)").matches && setOpen(false)}
                                dir="auto"
                                className="rounded-full bg-[#14365a] px-3 py-1 text-xs font-semibold text-white hover:bg-[#0f2a47]"
                              >
                                {link.label || t("Open")} <span aria-hidden className="inline-block ltr:-scale-x-100">←</span>
                              </Link>
                            ) : null;
                          })}
                        </div>
                      )}
                    </li>
                  ))}
                  {sending && (
                    <li className="flex items-start" aria-label={t("The assistant is typing")}>
                      <span className="flex gap-1 rounded-2xl rounded-es-sm border border-[#d7e6ea] bg-white px-4 py-3">
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="size-1.5 animate-bounce rounded-full bg-[#12939b]"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </span>
                    </li>
                  )}
                </ol>
              )}
              <div ref={endRef} />
            </div>
          )}

          {!showHistory && (
            <div className="border-t border-[#e3eef1] bg-white p-3">
              {latest && latest.suggestions.length > 0 && !sending && (
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1" dir={dir}>
                  {latest.suggestions.map((s) => (
                    <SuggestionChip key={s} text={s} onPick={send} disabled={sending} />
                  ))}
                </div>
              )}
              {error && (
                <p role="alert" dir="auto" className="mb-2 text-xs font-semibold text-red-600">
                  {error}
                </p>
              )}
              {canContinue ? (
                <form onSubmit={onSubmit} className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
                    onKeyDown={onKeyDown}
                    rows={1}
                    dir="auto"
                    placeholder={t("Type your question...")}
                    aria-label={t("Your question")}
                    className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-[#d7e6ea] bg-[#f7fbfc] px-3.5 py-2.5 text-sm text-[#14365a] outline-none placeholder:text-[#14365a]/40 focus:border-[#12939b]"
                  />
                  <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    aria-label={t("Send")}
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[#12939b] text-white hover:bg-[#0f7a81] disabled:opacity-40"
                  >
                    {sending ? <LoaderCircle className="size-4 animate-spin" /> : <ArrowUp className="size-5" />}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={newChat}
                  className="w-full rounded-full bg-[#12939b] py-2.5 text-sm font-bold text-white hover:bg-[#0f7a81]"
                >
                  {t("This chat is full, start a new one")}
                </button>
              )}
            </div>
          )}
        </section>
      )}

    </>
  );
}

/** "1 question", "3 questions"; in Arabic "سؤال واحد", "سؤالين", "3 أسئلة", "11 سؤال". */
function questionCount(n: number, locale: Locale): string {
  if (locale === "en") return n === 1 ? "1 question" : `${n} questions`;
  if (n === 1) return "سؤال واحد";
  if (n === 2) return "سؤالين";
  return n >= 3 && n <= 10 ? `${n} أسئلة` : `${n} سؤال`;
}

function SuggestionChip({ text, onPick, disabled }: { text: string; onPick: (text: string) => void; disabled: boolean }) {
  return (
    <button
      type="button"
      dir="auto"
      disabled={disabled}
      onClick={() => onPick(text)}
      className="shrink-0 rounded-full border border-[#12939b]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#0f7a81] hover:bg-[#e3f4f5] disabled:opacity-50"
    >
      {text}
    </button>
  );
}
