"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Poppins } from "next/font/google";
import Image from "next/image";
import { ArrowLeft, LoaderCircle, MessagesSquare, RotateCw, Send, Users, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { mentorAvatar } from "@/lib/avatars";
import {
  CHAT_MAX_LENGTH,
  getChatMessages,
  getChatThreads,
  markChatRead,
  sendChatMessage,
  type ChatMessage,
  type ChatMessageEvent,
  type ChatThread,
  type Squad,
  type SquadRole,
} from "@/lib/interns-api";
import { useLiveChannel } from "@/lib/live-channel";
import { avatarFor, ROLE_TITLE } from "./interns-data";

/** Same font as the learner shell (the drawer is rendered outside it). */
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

/** Without the live channel (no backend, a proxy without WebSockets), look for new messages this often. */
const POLL_MS = 8000;

/** A chat: null for the squad's group chat, else the monitor's or teammate's id. */
export type ChatKey = string | null;

type Listener = (message: ChatMessageEvent) => void;

/**
 * The team page's chats (decisions of 22 Oct 2026): the squad group with the monitor, and a private chat with the
 * monitor or any teammate, each with its unread count. New messages come through the live channel; without it, the
 * threads are polled.
 */
export function useTeamChat(squad: Squad | null) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  /** The chats were loaded at least once. */
  const [loaded, setLoaded] = useState(false);
  /** Why the last load failed (the API offline or restarting, the project not ready, ...); null when it worked. */
  const [error, setError] = useState<string | null>(null);
  const listeners = useRef(new Set<Listener>());

  const reloadThreads = useCallback(
    () =>
      getChatThreads().then(
        (r) => {
          setThreads(r.threads);
          setLoaded(true);
          setError(null);
        },
        (e) => setError(errorMessage(e, "We couldn't load your team chat. Please try again.")),
      ),
    [],
  );

  const enabled = !!squad?.projectRevealed;
  useEffect(() => {
    if (enabled) void reloadThreads();
  }, [enabled, reloadThreads]);

  const live = useLiveChannel(
    {
      ChatMessage: (message: ChatMessageEvent) => {
        listeners.current.forEach((l) => l(message));
        void reloadThreads();
      },
    },
    enabled,
  );

  useEffect(() => {
    if (!enabled || live) return;
    const timer = window.setInterval(() => void reloadThreads(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [enabled, live, reloadThreads]);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    return () => {
      listeners.current.delete(listener);
    };
  }, []);

  const unreadTotal = threads.reduce((n, t) => n + t.unread, 0);
  const unreadFor = useCallback((key: ChatKey) => threads.find((t) => t.with === key)?.unread ?? 0, [threads]);

  return { threads, loaded, error, unreadTotal, unreadFor, reloadThreads, subscribe, live, enabled };
}

export type TeamChatState = ReturnType<typeof useTeamChat>;

/** Avatar of anyone in the squad, the same one as on the team card. */
function useAvatars(squad: Squad | null) {
  return useMemo(() => {
    const map = new Map<string, { src: string; bg: string }>();
    squad?.members.forEach((m, i) => map.set(m.studentId, avatarFor(m.photoUrl, i)));
    if (squad?.monitor) {
      const a = mentorAvatar(squad.monitor);
      map.set(squad.monitor.id, { src: a.src, bg: a.bg });
    }
    return map;
  }, [squad]);
}

function Face({ avatar, size = "h-[2.6em] w-[2.6em]" }: { avatar?: { src: string; bg: string }; size?: string }) {
  if (!avatar)
    return (
      <span className={`grid shrink-0 place-items-center rounded-full bg-[#d6f3f0] text-[#12939b] ${size}`}>
        <Users className="h-[55%] w-[55%]" aria-hidden />
      </span>
    );
  return (
    <span className={`relative shrink-0 overflow-hidden rounded-full ${size}`} style={{ backgroundColor: avatar.bg }}>
      <Image src={avatar.src} alt="" fill sizes="48px" className="object-cover" />
    </span>
  );
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="grid h-[1.5em] min-w-[1.5em] place-items-center rounded-full bg-[#ef5b5b] px-[0.4em] text-[0.7em] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** A failed load: what went wrong and a Retry button, instead of a spinner that never ends. */
function LoadError({ message, onRetry }: { message: string; onRetry: () => unknown }) {
  const [retrying, setRetrying] = useState(false);
  return (
    <div role="alert" className="mx-[1em] mt-[2.5em] flex flex-col items-center gap-[0.7em] text-center">
      <p className="text-[0.9em] font-semibold text-[#b83232]">{message}</p>
      <button
        type="button"
        disabled={retrying}
        onClick={async () => {
          setRetrying(true);
          try {
            await onRetry();
          } finally {
            setRetrying(false);
          }
        }}
        className="flex items-center gap-[0.4em] rounded-[0.8em] bg-[#14365a] px-[1em] py-[0.45em] text-[0.85em] font-bold text-white hover:bg-[#1d4a7a] disabled:opacity-60"
      >
        <RotateCw className={`h-[1em] w-[1em] ${retrying ? "animate-spin" : ""}`} aria-hidden /> {retrying ? "Retrying…" : "Retry"}
      </button>
    </div>
  );
}

/** "14:05" today, else "Oct 21, 14:05". */
function when(utc: string) {
  const d = new Date(utc);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toDateString() === new Date().toDateString() ? time : `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

const subtitle = (t: ChatThread) =>
  t.kind === "Group" ? "Your squad and monitor" : t.kind === "Monitor" ? `Monitor · ${t.role ?? ""}` : (ROLE_TITLE[t.role as SquadRole] ?? t.role ?? "");

/** An event from the live channel, as a message of the chat it belongs to (from my side). */
function fromEvent(e: ChatMessageEvent, me: string): ChatMessage {
  return {
    id: e.id,
    senderId: e.senderId,
    senderName: e.senderName,
    senderPhotoUrl: e.senderPhotoUrl,
    with: e.recipientId === null ? null : e.senderId === me ? e.recipientId : e.senderId,
    body: e.body,
    sentUtc: e.sentUtc,
    isMine: e.senderId === me,
  };
}

function ThreadList({ chat, avatars, onOpen }: { chat: TeamChatState; avatars: Map<string, { src: string; bg: string }>; onOpen: (key: ChatKey) => void }) {
  if (!chat.loaded && chat.error) return <LoadError message={chat.error} onRetry={chat.reloadThreads} />;
  if (!chat.loaded)
    return <LoaderCircle className="mx-auto mt-[3em] h-[2em] w-[2em] animate-spin text-[#14365a]" aria-label="Loading chats" />;
  return (
    <ul className="grid gap-[0.3em] overflow-y-auto p-[0.6em]">
      {chat.threads.map((t) => (
        <li key={t.with ?? "group"}>
          <button
            type="button"
            onClick={() => onOpen(t.with)}
            className="flex w-full items-center gap-[0.7em] rounded-[0.9em] p-[0.6em] text-left hover:bg-[#eef6fb]"
          >
            <Face avatar={t.with ? avatars.get(t.with) : undefined} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-[0.4em]">
                <span className="truncate text-[0.95em] font-bold text-[#14365a]">{t.kind === "Group" ? `${t.name} (group)` : t.name}</span>
                {t.lastMessage && <span className="ml-auto shrink-0 text-[0.7em] text-[#14365a]/50">{when(t.lastMessage.sentUtc)}</span>}
              </span>
              <span className="flex items-center gap-[0.4em]">
                <span className="truncate text-[0.78em] text-[#14365a]/65">
                  {t.lastMessage ? `${t.lastMessage.isMine ? "You" : t.lastMessage.senderName.split(" ")[0]}: ${t.lastMessage.body}` : subtitle(t)}
                </span>
                <span className="ml-auto shrink-0">
                  <Badge count={t.unread} />
                </span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Conversation({
  chat,
  thread,
  me,
  avatars,
}: {
  chat: TeamChatState;
  thread: ChatThread;
  me: string;
  avatars: Map<string, { src: string; bg: string }>;
}) {
  const key = thread.with;
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** The first load failed: shown instead of the messages, with Retry. */
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const { reloadThreads, subscribe, live } = chat;

  /** Adds messages not shown yet, in time order. */
  const merge = useCallback((incoming: ChatMessage[]) => {
    setMessages((current) => {
      const all = new Map((current ?? []).map((m) => [m.id, m]));
      incoming.forEach((m) => all.set(m.id, m));
      return [...all.values()].sort((a, b) => a.sentUtc.localeCompare(b.sentUtc));
    });
  }, []);

  const markRead = useCallback(() => void markChatRead(key).then(() => reloadThreads(), () => {}), [key, reloadThreads]);

  // The latest 50 when the chat opens, then mark it read.
  useEffect(() => {
    let active = true;
    getChatMessages(key).then(
      (r) => {
        if (!active) return;
        stickToBottom.current = true;
        setLoadError(null);
        setMessages(r.messages);
        setHasMore(r.hasMore);
        markRead();
      },
      (e) => active && setLoadError(errorMessage(e, "We couldn't load this chat. Please try again.")),
    );
    return () => {
      active = false;
    };
  }, [key, markRead, attempt]);

  // New messages of this chat, live.
  useEffect(
    () =>
      subscribe((e) => {
        const m = fromEvent(e, me);
        if (m.with !== key) return;
        stickToBottom.current = true;
        merge([m]);
        if (!m.isMine) markRead();
      }),
    [subscribe, me, key, merge, markRead],
  );

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
    if (stickToBottom.current) bottom.current?.scrollIntoView({ block: "end" });
    stickToBottom.current = false;
  }, [messages]);

  // Without the live channel, look for new messages now and then.
  useEffect(() => {
    if (live) return;
    const timer = window.setInterval(
      () =>
        void getChatMessages(key).then((r) => {
          const fresh = r.messages.length > 0 && !messagesRef.current?.some((m) => m.id === r.messages[r.messages.length - 1].id);
          merge(r.messages);
          if (fresh) {
            stickToBottom.current = true;
            markRead();
          }
        }, () => {}),
      POLL_MS,
    );
    return () => window.clearInterval(timer);
  }, [live, key, merge, markRead]);

  async function loadOlder() {
    if (!messages?.length) return;
    setLoadingOlder(true);
    try {
      const r = await getChatMessages(key, messages[0].sentUtc);
      merge(r.messages);
      setHasMore(r.hasMore);
    } catch (e) {
      setError(errorMessage(e, "We couldn't load older messages."));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const sent = await sendChatMessage(key, body);
      stickToBottom.current = true;
      merge([sent]);
      setDraft("");
      void reloadThreads();
    } catch (err) {
      setError(errorMessage(err, "We couldn't send your message. Please try again."));
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  }

  const isGroup = key === null;
  return (
    <>
      <div className="flex-1 overflow-y-auto px-[0.9em] py-[0.7em]">
        {hasMore && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="mx-auto mb-[0.6em] block rounded-full bg-[#eef6fb] px-[0.9em] py-[0.25em] text-[0.75em] font-semibold text-[#12939b] hover:bg-[#e1eff8] disabled:opacity-60"
          >
            {loadingOlder ? "Loading…" : "Load older messages"}
          </button>
        )}
        {messages === null && loadError && (
          <LoadError
            message={loadError}
            onRetry={() => {
              setLoadError(null);
              setAttempt((n) => n + 1);
            }}
          />
        )}
        {messages === null && !loadError && <LoaderCircle className="mx-auto mt-[2em] h-[1.8em] w-[1.8em] animate-spin text-[#14365a]" aria-label="Loading messages" />}
        {messages?.length === 0 && (
          <p className="mt-[2em] text-center text-[0.85em] text-[#14365a]/60">
            {isGroup ? "Say hi to your squad and your monitor!" : `Start your private chat with ${thread.name.split(" ")[0]}.`}
          </p>
        )}
        <ul className="grid gap-[0.55em]">
          {messages?.map((m) => (
            <li key={m.id} className={`flex items-end gap-[0.45em] ${m.isMine ? "justify-end" : ""}`}>
              {!m.isMine && isGroup && <Face avatar={avatars.get(m.senderId)} size="h-[1.9em] w-[1.9em]" />}
              <div
                className={`max-w-[78%] rounded-[1em] px-[0.8em] py-[0.45em] text-[0.88em] leading-snug ${
                  m.isMine ? "rounded-br-[0.3em] bg-[#4f9cf0] text-white" : "rounded-bl-[0.3em] bg-[#eef2f7] text-[#14365a]"
                }`}
              >
                {!m.isMine && isGroup && <p className="text-[0.78em] font-bold text-[#12939b]">{m.senderName}</p>}
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-[0.15em] text-right text-[0.68em] ${m.isMine ? "text-white/75" : "text-[#14365a]/50"}`}>{when(m.sentUtc)}</p>
              </div>
            </li>
          ))}
        </ul>
        <div ref={bottom} />
      </div>

      {messages !== null && (
      <form onSubmit={send} className="border-t border-[#14365a]/10 p-[0.6em]">
        {error && (
          <p role="alert" className="mb-[0.4em] text-[0.75em] font-semibold text-[#b83232]">
            {error}
          </p>
        )}
        <div className="flex items-end gap-[0.5em]">
          <label className="sr-only" htmlFor="team-chat-draft">
            Message
          </label>
          <textarea
            id="team-chat-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={CHAT_MAX_LENGTH}
            rows={1}
            placeholder={isGroup ? "Message your squad…" : `Message ${thread.name.split(" ")[0]}…`}
            className="max-h-[7em] min-h-[2.6em] flex-1 resize-none rounded-[0.9em] border border-[#14365a]/15 bg-white px-[0.8em] py-[0.55em] text-[0.9em] text-[#14365a] outline-none focus:border-[#4f9cf0]"
          />
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send"
            className="grid h-[2.6em] w-[2.6em] shrink-0 place-items-center rounded-[0.9em] bg-[#14365a] text-white hover:bg-[#1d4a7a] disabled:opacity-40"
          >
            {sending ? <LoaderCircle className="h-[1.1em] w-[1.1em] animate-spin" /> : <Send className="h-[1.1em] w-[1.1em]" />}
          </button>
        </div>
        {draft.length > CHAT_MAX_LENGTH - 100 && (
          <p className="mt-[0.2em] text-right text-[0.7em] text-[#14365a]/60">
            {draft.length}/{CHAT_MAX_LENGTH}
          </p>
        )}
      </form>
      )}
    </>
  );
}

/**
 * The chat drawer of the team page: the list of chats, or one open chat. `open` is the chat to show: undefined shows
 * the list, null the group chat, an id the private chat with that person.
 */
export function TeamChatPanel({
  chat,
  squad,
  open,
  onOpen,
  onClose,
}: {
  chat: TeamChatState;
  squad: Squad;
  open: ChatKey | undefined;
  onOpen: (key: ChatKey | undefined) => void;
  onClose: () => void;
}) {
  const avatars = useAvatars(squad);
  const me = squad.members.find((m) => m.isMe)?.studentId ?? "";
  const thread = open === undefined ? null : (chat.threads.find((t) => t.with === open) ?? null);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Into <body>: the shell's <main> is its own stacking context, so a fixed layer inside it stays under the top bar.
  // Above the assistant's bubble (z-61), under the shell's own dialogs (z-70).
  return createPortal(
    <div dir="ltr" className={`${poppins.className} fixed inset-0 z-[65] flex justify-end`} role="dialog" aria-modal="true" aria-label="Team chat">
      <button type="button" aria-label="Close the chat" onClick={onClose} className="absolute inset-0 bg-[#14365a]/25 backdrop-blur-[2px]" />
      <section
        className="relative flex h-full w-full max-w-[26rem] flex-col bg-white shadow-2xl"
        style={{ fontSize: "clamp(13px, 1vw, 16px)" }}
      >
        <header className="flex items-center gap-[0.6em] border-b border-[#14365a]/10 p-[0.8em]">
          {thread ? (
            <>
              <button type="button" onClick={() => onOpen(undefined)} aria-label="All chats" className="rounded-[0.6em] p-[0.3em] text-[#14365a] hover:bg-[#eef6fb]">
                <ArrowLeft className="h-[1.3em] w-[1.3em]" />
              </button>
              <Face avatar={thread.with ? avatars.get(thread.with) : undefined} size="h-[2.3em] w-[2.3em]" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-bold text-[#14365a]">{thread.kind === "Group" ? `${thread.name} (group)` : thread.name}</span>
                <span className="block truncate text-[0.75em] text-[#14365a]/60">{subtitle(thread)}</span>
              </span>
            </>
          ) : (
            <>
              <MessagesSquare className="h-[1.5em] w-[1.5em] text-[#12939b]" aria-hidden />
              <span className="font-extrabold text-[#14365a]">Team chat</span>
            </>
          )}
          <button type="button" onClick={onClose} aria-label="Close the chat" className="ml-auto rounded-[0.6em] p-[0.3em] text-[#14365a] hover:bg-[#eef6fb]">
            <X className="h-[1.3em] w-[1.3em]" />
          </button>
        </header>

        {thread ? (
          <Conversation key={thread.with ?? "group"} chat={chat} thread={thread} me={me} avatars={avatars} />
        ) : open !== undefined && chat.error ? (
          <LoadError message={chat.error} onRetry={chat.reloadThreads} />
        ) : open !== undefined && chat.loaded ? (
          <LoadError message="This chat isn't available. Open the list of chats." onRetry={() => onOpen(undefined)} />
        ) : open !== undefined ? (
          <LoaderCircle className="mx-auto mt-[3em] h-[2em] w-[2em] animate-spin text-[#14365a]" aria-label="Loading chat" />
        ) : (
          <ThreadList chat={chat} avatars={avatars} onOpen={onOpen} />
        )}
      </section>
    </div>,
    document.body,
  );
}

/** The "Team chat" button of the team card, with the unread count of every chat. */
export function TeamChatButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[0.45em] rounded-[0.8em] bg-[#14365a] px-[0.9em] py-[0.5em] text-[0.85em] font-bold text-white shadow-md hover:bg-[#1d4a7a]"
    >
      <MessagesSquare className="h-[1.15em] w-[1.15em]" aria-hidden /> Team chat
      <Badge count={unread} />
    </button>
  );
}
