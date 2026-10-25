"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useSearchParams } from "next/navigation";
import {
  CalendarPlus,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  Clock3,
  Hash,
  LoaderCircle,
  Megaphone,
  MessageCircleQuestionMark,
  Search,
  SendHorizontal,
  Timer,
  Users,
  Video,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import {
  broadcast,
  getChannel,
  getStudentThread,
  getTeacherMessages,
  postToChannel,
  sendStudentMessage,
  type AssignmentStatus,
  type ChannelThread,
  type ClassStudentStatus,
  type StudentThread,
  type TeacherMessages,
  type ThreadMessage,
} from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { Card, FieldLabel, LoadBlock, StudentAvatar, formatDate, inputClass, useTeacherData } from "@/components/teacher/teacher-ui";
import { EventDialog, TeacherDialog, useToast } from "@/components/teacher/teacher-dialogs";

type Selection = { kind: "student" | "class"; id: string };
type Thread = { kind: "student"; data: StudentThread } | { kind: "class"; data: ChannelThread };
type Filter = "all" | "classes" | "direct" | "unread";

const STATUS_LABEL: Record<ClassStudentStatus, string> = {
  TopQuartile: tk("Top Quartile"),
  OnTrack: tk("On Track"),
  NeedsAssistance: tk("Needs Support"),
};

const STATUS_STYLE: Record<ClassStudentStatus, string> = {
  TopQuartile: "bg-[#8ff0d6] text-[#0f5d63]",
  OnTrack: "bg-[#eef2f1] text-[#1B2D54]/70",
  NeedsAssistance: "bg-[#fde8e8] text-[#c62828]",
};

const DELIVERABLE_LABEL: Record<AssignmentStatus, string> = {
  NotStarted: tk("Not started"),
  Submitted: tk("Submitted, waiting for grading"),
  Late: tk("Submitted late"),
  Graded: tk("Graded"),
  Missing: tk("Missing"),
};

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(dateLocale("en-GB"), { hour: "numeric", minute: "2-digit" });

/** "5m", "10:42", "Yesterday", "Sun" or "3 Oct", like a chat list. */
function shortWhen(t: TFunction, iso: string | null) {
  if (!iso) return "";
  const at = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60e3);
  if (minutes < 1) return t("now");
  if (minutes < 60) return t("{n}m", { n: minutes });
  if (sameDay(at, now)) return timeOf(iso);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(at, yesterday)) return t("Yesterday");
  if (minutes < 6 * 24 * 60) return at.toLocaleDateString(dateLocale("en-GB"), { weekday: "short" });
  return formatDate(iso);
}

/** The day label above a group of messages: "Today • 10:30", "Yesterday • 09:12" or "3 Oct • 14:00". */
function dayLabel(t: TFunction, iso: string) {
  const at = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const day = sameDay(at, now) ? t("Today") : sameDay(at, yesterday) ? t("Yesterday") : formatDate(iso);
  return `${day} • ${timeOf(iso)}`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

function masteryBadge(t: TFunction, status: ClassStudentStatus, mastery: number | null, className: string) {
  const pct = mastery === null ? "—" : `${mastery}%`;
  if (status === "TopQuartile") return t("{percent} Mastery", { percent: pct });
  if (status === "NeedsAssistance") return t("Needs Support • {percent}", { percent: pct });
  return t("Class {name} • {percent}", { name: className, percent: pct });
}

/** The first conversation with unread messages, else the first class channel, else the first student. */
function defaultSelection(d: TeacherMessages): Selection | null {
  const unread = d.direct.find((x) => x.unread > 0);
  if (unread) return { kind: "student", id: unread.studentId };
  if (d.channels[0]) return { kind: "class", id: d.channels[0].classId };
  if (d.direct[0]) return { kind: "student", id: d.direct[0].studentId };
  return null;
}

export default function TeacherMessagesPage() {
  return (
    <Suspense fallback={null}>
      <Messages />
    </Suspense>
  );
}

function Messages() {
  const { t } = useI18n();
  const params = useSearchParams();
  const messages = useTeacherData(getTeacherMessages, tk("We couldn't load your messages. Please try again."));
  const setList = messages.setData;
  const [selected, setSelected] = useState<Selection | null>(() => {
    const student = params.get("student");
    const cls = params.get("class");
    return student ? { kind: "student", id: student } : cls ? { kind: "class", id: cls } : null;
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<null | "office" | "broadcast" | { oneOnOne: string } | { classBroadcast: string }>(null);
  const toast = useToast();

  const d = messages.data;
  const open = selected ?? (d ? defaultSelection(d) : null);
  const openKind = open?.kind ?? null;
  const openId = open?.id ?? null;

  const loadThread = useCallback(async (): Promise<Thread | null> => {
    if (!openKind || !openId) return null;
    if (openKind === "class") return { kind: "class", data: await getChannel(openId) };
    const data = await getStudentThread(openId);
    // Opening a conversation marks it read on the server; drop its unread count here too.
    setList((prev) => {
      const row = prev?.direct.find((x) => x.studentId === openId);
      if (!prev || !row?.unread) return prev;
      return {
        ...prev,
        stats: { ...prev.stats, unreadDirect: Math.max(0, prev.stats.unreadDirect - row.unread) },
        direct: prev.direct.map((x) => (x.studentId === openId ? { ...x, unread: 0 } : x)),
      };
    });
    return { kind: "student", data };
  }, [openKind, openId, setList]);
  const thread = useTeacherData(loadThread, tk("We couldn't load this conversation. Please try again."));
  const current =
    thread.data && openKind && thread.data.kind === openKind && (thread.data.kind === "class" ? thread.data.data.classId : thread.data.data.studentId) === openId
      ? thread.data
      : null;

  const appendMessage = useCallback(
    (msg: ThreadMessage) => {
      thread.setData((prev) => (prev ? ({ ...prev, data: { ...prev.data, messages: [...prev.data.messages, msg] } } as Thread) : prev));
      void messages.reload();
    },
    [thread, messages],
  );

  const visible = useMemo(() => {
    if (!d) return { channels: [], direct: [] };
    const q = query.trim().toLowerCase();
    const match = (...texts: (string | null)[]) => !q || texts.some((x) => x?.toLowerCase().includes(q));
    return {
      channels: filter === "all" || filter === "classes" ? d.channels.filter((c) => match(c.name, `${c.grade}`, c.lastText)) : [],
      direct:
        filter === "all" || filter === "direct" || filter === "unread"
          ? d.direct.filter((x) => (filter !== "unread" || x.unread > 0) && match(x.fullName, x.className, x.lastText))
          : [],
    };
  }, [d, filter, query]);

  if (!d) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
        <LoadBlock error={messages.error} onRetry={messages.reload} />
      </div>
    );
  }

  const s = d.stats;
  const waiting = d.direct.filter((x) => x.unread > 0).length;
  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: t("All"), count: d.channels.length + d.direct.length },
    { key: "classes", label: t("Classes"), count: d.channels.length },
    { key: "direct", label: t("Direct"), count: d.direct.length },
    { key: "unread", label: t("Unread"), count: waiting },
  ];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* ---------------- Header ---------------- */}
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium">
            <span className="text-[#1B2D54]/70">{t("Teacher workspace")}</span>
            <ChevronRight aria-hidden className="size-3 text-[#1B2D54]/50 rtl:rotate-180" />
            <span className="font-semibold text-[#14757d]">{t("Class channels & direct messages")}</span>
            <span className="flex items-center gap-1 rounded-full bg-[#c9f1f0] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">
              <span aria-hidden className="size-1.5 rounded-full bg-[#14757d]" />
              {t("{count} classes active", { count: d.channels.length })}
            </span>
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t("Messages")}</h1>
          <p className="mt-0.5 max-w-xl text-[11px] text-[#1B2D54]/70">
            {t("Real-time communication with your students and classes: answer questions, follow up on their work and share announcements.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setDialog("office")}
            className="flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-[11px] font-semibold text-[#14757d] shadow-sm ring-1 ring-[#e3ece9] transition-colors hover:bg-[#f6f9f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <CalendarPlus aria-hidden className="size-3.5" />
            {t("Schedule Office Hours")}
          </button>
          <button
            type="button"
            onClick={() => setDialog("broadcast")}
            className="flex items-center gap-1.5 rounded-lg bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <Megaphone aria-hidden className="size-3.5 rtl:-scale-x-100" />
            {t("+ New Broadcast Message")}
          </button>
        </div>
      </header>

      {/* ---------------- Stats ---------------- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("Unread Direct Messages")}
          value={String(s.unreadDirect)}
          unit={t("Unread")}
          icon={<CircleAlert aria-hidden className="size-5" />}
          iconClass="bg-[#fde8e8] text-[#e5484d]"
          foot={
            <span className={cn("flex items-center gap-1.5 font-semibold", waiting ? "text-[#c81e1e]" : "text-[#1B2D54]/60")}>
              {waiting > 0 && <span aria-hidden className="size-1.5 rounded-full bg-[#c81e1e]" />}
              {waiting ? t("{count} students waiting for a reply", { count: waiting }) : t("You are all caught up")}
            </span>
          }
        />
        <StatCard
          label={t("Open Questions")}
          value={String(s.openQuestions)}
          unit={t("Questions")}
          icon={<MessageCircleQuestionMark aria-hidden className="size-5" />}
          iconClass="bg-[#c9f1f0] text-[#14757d]"
          foot={
            <Link href={"/teacher/dashboard" as Route} className="font-semibold text-[#14757d] hover:underline">
              {s.openQuestions ? t("Waiting for your answer") : t("No questions waiting")}
            </Link>
          }
        />
        <StatCard
          label={t("Sessions Today")}
          value={String(s.eventsToday)}
          unit={t("Today")}
          icon={<Video aria-hidden className="size-5" />}
          iconClass="bg-[#e3e8fb] text-[#1B2D54]"
          foot={
            <span className="truncate text-[#1B2D54]/80">
              {s.nextEventUtc
                ? t("Next: {time} ({title})", { time: timeOf(s.nextEventUtc), title: s.nextEventTitle ?? "" })
                : t("Nothing else scheduled today")}
            </span>
          }
        />
        <StatCard
          label={t("Average Reply Time")}
          value={s.averageReplyMinutes === null ? "—" : String(Math.round(s.averageReplyMinutes))}
          unit={t("mins avg")}
          icon={<Timer aria-hidden className="size-5" />}
          iconClass="bg-[#8ff0d6] text-[#0f5d63]"
          foot={
            <span className="font-semibold text-[#14757d]">
              {s.averageReplyMinutes === null ? t("No replies yet") : t("To student messages")}
            </span>
          }
        />
      </div>

      {/* ---------------- Inbox | conversation | details ---------------- */}
      <div className="grid min-w-0 gap-4 lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_250px]">
        {/* Inbox */}
        <Card className="flex min-w-0 flex-col p-0 lg:h-[760px]">
          <div className="border-b border-[#e3ece9] p-3">
            <label className="relative block">
              <span className="sr-only">{t("Search classes or students")}</span>
              <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search classes or students...")}
                className={cn(inputClass, "ps-8")}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold leading-tight transition-colors",
                    filter === f.key
                      ? "bg-[#14757d] text-white"
                      : f.key === "unread" && f.count > 0
                        ? "bg-[#fde8e8] text-[#c81e1e]"
                        : "bg-[#eef2f1] text-[#1B2D54]/80 hover:bg-[#e3ece9]",
                  )}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[440px] min-h-0 flex-1 overflow-y-auto py-2 lg:max-h-none">
            {(filter === "all" || filter === "classes") && (
              <section>
                <h2 className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">{t("Active classes")}</h2>
                {visible.channels.length === 0 && <p className="px-3 py-2 text-[11px] text-[#1B2D54]/60">{t("No classes found.")}</p>}
                {visible.channels.map((c) => {
                  const active = open?.kind === "class" && open.id === c.classId;
                  return (
                    <button
                      key={c.classId}
                      type="button"
                      onClick={() => setSelected({ kind: "class", id: c.classId })}
                      aria-current={active ? "true" : undefined}
                      className={cn("flex w-full gap-2.5 px-3 py-2.5 text-start transition-colors", active ? "bg-[#c9f1f0]/70" : "hover:bg-[#f6f9f8]")}
                    >
                      <Hash aria-hidden className="mt-0.5 size-4 shrink-0 text-[#14757d]" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[12px] font-semibold">{t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}</span>
                          <span className="shrink-0 text-[9px] text-[#1B2D54]/50">{shortWhen(t, c.lastUtc)}</span>
                        </span>
                        <span dir="auto" className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-[#1B2D54]/70">
                          {c.lastText ? (c.lastSender ? `${c.lastSender}: ${c.lastText}` : c.lastText) : t("No messages yet")}
                        </span>
                        <span className="mt-1 block text-[9px] text-[#1B2D54]/50">{t("{count} students", { count: c.students })}</span>
                      </span>
                    </button>
                  );
                })}
              </section>
            )}

            {filter !== "classes" && (
              <section className="mt-2 border-t border-[#e3ece9] pt-2">
                <h2 className="flex items-center justify-between px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">
                  {t("Direct messages")}
                  <span className="normal-case text-[#14757d]">{t("{count} active", { count: d.direct.length })}</span>
                </h2>
                {visible.direct.length === 0 && (
                  <p className="px-3 py-2 text-[11px] text-[#1B2D54]/60">{filter === "unread" ? t("No unread messages.") : t("No conversations found.")}</p>
                )}
                {visible.direct.map((x) => {
                  const active = open?.kind === "student" && open.id === x.studentId;
                  return (
                    <button
                      key={x.studentId}
                      type="button"
                      onClick={() => setSelected({ kind: "student", id: x.studentId })}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "mx-1.5 flex w-[calc(100%-0.75rem)] gap-2.5 rounded-xl px-2 py-2.5 text-start transition-colors",
                        active ? "bg-[#c9f1f0]" : "hover:bg-[#f6f9f8]",
                      )}
                    >
                      <StudentAvatar name={x.fullName} photoUrl={x.photoUrl} gender={x.gender} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cn("truncate text-[12px]", x.unread ? "font-bold" : "font-semibold")}>{x.fullName}</span>
                          <span className={cn("shrink-0 text-[9px]", x.unread ? "font-semibold text-[#c81e1e]" : "text-[#1B2D54]/50")}>
                            {shortWhen(t, x.lastUtc)}
                          </span>
                        </span>
                        <span dir="auto" className="mt-0.5 line-clamp-2 block text-[11px] leading-snug text-[#1B2D54]/70">
                          {x.lastText ?? t("No messages yet")}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-2">
                          <span className={cn("truncate rounded px-1.5 py-0.5 text-[9px] font-semibold", STATUS_STYLE[x.status])}>
                            {masteryBadge(t, x.status, x.mastery, x.className)}
                          </span>
                          {x.unread > 0 && (
                            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#14757d] px-1 text-[9px] font-bold text-white">
                              {x.unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </section>
            )}
          </div>
        </Card>

        {/* Conversation */}
        <Card className="flex min-w-0 flex-col p-0 lg:h-[760px]">
          {!open ? (
            <EmptyPane text={t("No conversations yet. Students' messages and your class channels will show here.")} />
          ) : !current ? (
            <LoadBlock error={thread.error} onRetry={thread.reload} className="m-4" />
          ) : (
            <Conversation
              key={`${current.kind}:${openId}`}
              thread={current}
              onSent={appendMessage}
              onOneOnOne={(id) => setDialog({ oneOnOne: id })}
              onClassBroadcast={(id) => setDialog({ classBroadcast: id })}
            />
          )}
        </Card>

        {/* Details */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2 xl:col-span-1">
          {current?.kind === "student" && <StudentPanel s={current.data} />}
          {current?.kind === "class" && (
            <ClassPanel
              c={current.data}
              grade={d.channels.find((x) => x.classId === current.data.classId)?.grade ?? null}
              onBroadcast={() => setDialog({ classBroadcast: current.data.classId })}
            />
          )}
        </div>
      </div>

      {dialog === "office" && (
        <EventDialog
          defaults={{ kind: "OfficeHour" }}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            toast.show(t("Office hours scheduled"));
            void messages.reload();
          }}
        />
      )}
      {dialog !== null && typeof dialog === "object" && "oneOnOne" in dialog && (
        <EventDialog
          defaults={{ kind: "OneOnOne", studentId: dialog.oneOnOne }}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            toast.show(t("1-on-1 scheduled"));
            void messages.reload();
          }}
        />
      )}
      {(dialog === "broadcast" || (dialog !== null && typeof dialog === "object" && "classBroadcast" in dialog)) && (
        <BroadcastDialog
          channels={d.channels}
          classId={typeof dialog === "object" && "classBroadcast" in dialog ? dialog.classBroadcast : ""}
          onClose={() => setDialog(null)}
          onSent={(students, classId) => {
            setDialog(null);
            toast.show(t("Sent to {students} students", { students }));
            void messages.reload();
            if (open?.kind === "class" && (classId === null || classId === open.id)) void thread.reload();
          }}
        />
      )}
      {toast.node}
    </div>
  );
}

function StatCard({ label, value, unit, icon, iconClass, foot }: { label: string; value: string; unit: string; icon: ReactNode; iconClass: string; foot: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-2 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#1B2D54]/80">{label}</p>
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold leading-none">{value}</span>
            <span className="text-[11px] text-[#1B2D54]/70">{unit}</span>
          </p>
        </div>
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", iconClass)}>{icon}</span>
      </div>
      <div className="flex min-w-0 items-center text-[10px]">{foot}</div>
    </div>
  );
}

function EmptyPane({ text }: { text: string }) {
  return <p className="m-auto max-w-xs p-6 text-center text-[11px] text-[#1B2D54]/60">{text}</p>;
}

/** The open conversation: header, messages grouped by day, and the composer (Enter sends, Shift+Enter adds a line). */
function Conversation({
  thread,
  onSent,
  onOneOnOne,
  onClassBroadcast,
}: {
  thread: Thread;
  onSent: (msg: ThreadMessage) => void;
  onOneOnOne: (studentId: string) => void;
  onClassBroadcast: (classId: string) => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const list = thread.data.messages;
  const name = thread.kind === "student" ? thread.data.fullName : thread.data.name;

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [list.length]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError(null);
    try {
      const msg = thread.kind === "student" ? await sendStudentMessage(thread.data.studentId, body) : await postToChannel(thread.data.classId, body);
      setText("");
      onSent(msg);
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't send your message. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-[#e3ece9] px-4 py-3">
        {thread.kind === "student" ? (
          <StudentAvatar name={thread.data.fullName} photoUrl={thread.data.photoUrl} gender={thread.data.gender} size={44} />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#c9f1f0] text-[#14757d]">
            <Hash aria-hidden className="size-5" />
          </span>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold">{thread.kind === "student" ? name : t("Class {name}", { name })}</span>
            {thread.kind === "student" && (
              <span className="rounded-full bg-[#c9f1f0] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">{t("Class {name}", { name: thread.data.className })}</span>
            )}
          </p>
          <p className="mt-1 truncate text-[11px] text-[#1B2D54]/70">
            {thread.kind === "student"
              ? `${thread.data.email} • ${t("Attendance {percent}%", { percent: thread.data.attendance })}`
              : t("Class channel • {count} students", { count: thread.data.students })}
          </p>
        </div>
        {thread.kind === "student" ? (
          <button
            type="button"
            onClick={() => onOneOnOne(thread.data.studentId)}
            className="flex items-center gap-1.5 rounded-lg bg-[#eef2f1] px-3 py-1.5 text-[11px] font-semibold text-[#14757d] hover:bg-[#e3ece9]"
          >
            <Video aria-hidden className="size-3.5" />
            {t("Schedule 1-on-1")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onClassBroadcast(thread.data.classId)}
            className="flex items-center gap-1.5 rounded-lg bg-[#eef2f1] px-3 py-1.5 text-[11px] font-semibold text-[#14757d] hover:bg-[#e3ece9]"
          >
            <Megaphone aria-hidden className="size-3.5 rtl:-scale-x-100" />
            {t("Broadcast")}
          </button>
        )}
      </div>

      <div ref={scroller} className="h-[420px] min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f6f9f8]/60 px-4 py-4 lg:h-auto">
        {list.length === 0 && (
          <EmptyPane
            text={
              thread.kind === "student"
                ? t("No messages with {name} yet. Write the first one below.", { name })
                : t("No messages in this class yet. Post the first one below.")
            }
          />
        )}
        {list.map((m, i) => {
          const showDay = i === 0 || !sameDay(new Date(list[i - 1]!.createdUtc), new Date(m.createdUtc));
          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-2 flex justify-center">
                  <span className="rounded-md bg-[#eef2f1] px-2.5 py-1 text-[10px] font-medium text-[#1B2D54]/80">{dayLabel(t, m.createdUtc)}</span>
                </p>
              )}
              <MessageBubble m={m} />
            </div>
          );
        })}
      </div>

      <form onSubmit={send} className="border-t border-[#e3ece9] px-4 py-3">
        <div className="flex items-end gap-2 rounded-xl bg-[#f6f9f8] p-2 ring-1 ring-[#e3ece9] focus-within:ring-2 focus-within:ring-[#12939b]/40">
          <label className="min-w-0 flex-1">
            <span className="sr-only">{t("Message")}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              maxLength={4000}
              dir="auto"
              placeholder={thread.kind === "student" ? t("Write a message to {name}...", { name }) : t("Write a message to class {name}...", { name })}
              className="block max-h-40 w-full resize-none bg-transparent px-2 py-1 text-[12px] outline-none placeholder:text-[#1B2D54]/40"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            aria-label={t("Send")}
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#14757d] text-white transition-colors hover:bg-[#0f6169] disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <SendHorizontal aria-hidden className="size-4 rtl:rotate-180" />}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-1.5 text-[10px] text-[#c81e1e]">
            {error}
          </p>
        )}
        <p className="mt-1.5 text-[10px] text-[#1B2D54]/60">{t("Shift + Enter for a new line • Enter to send")}</p>
      </form>
    </>
  );
}

function MessageBubble({ m }: { m: ThreadMessage }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex items-end gap-2", m.mine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[85%] flex-col sm:max-w-[75%]", m.mine ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-[12px] leading-relaxed shadow-sm",
            m.mine ? "rounded-ee-md bg-[#e4e7eb] text-[#1B2D54]" : "rounded-es-md border border-[#e3ece9] bg-white",
          )}
        >
          <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[#1B2D54]/80">
            <span className={m.mine ? "" : "text-[#14757d]"}>{m.senderName}</span>
            {m.broadcast && <span className="rounded bg-[#c9f1f0] px-1.5 py-0.5 text-[9px] text-[#14757d]">{t("Broadcast")}</span>}
          </p>
          <p dir="auto" className="whitespace-pre-wrap break-words">
            {m.text}
          </p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-[9px] text-[#1B2D54]/60">
          {timeOf(m.createdUtc)}
          {m.mine && <CheckCheck aria-hidden className="size-3 text-[#14757d]" />}
        </p>
      </div>
      {m.mine && (
        <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1B2D54] text-[9px] font-bold text-white">
          {initials(m.senderName)}
        </span>
      )}
    </div>
  );
}

function StudentPanel({ s }: { s: StudentThread }) {
  const { t } = useI18n();
  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-2">
          <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={52} />
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold", STATUS_STYLE[s.status])}>
            {t(STATUS_LABEL[s.status])} • {s.mastery === null ? "—" : `${s.mastery}%`}
          </span>
        </div>
        <p className="mt-3 text-base font-bold">{s.fullName}</p>
        <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Class {name}", { name: s.className })}</p>
        <p className="truncate text-[11px] text-[#1B2D54]/60">{s.email}</p>

        <h3 className="mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">{t("Core competencies")}</h3>
        {s.competencies.length === 0 ? (
          <p className="mt-2 text-[11px] text-[#1B2D54]/60">{t("No graded work yet.")}</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {s.competencies.map((c) => (
              <li key={c.title}>
                <p className="flex items-end justify-between gap-2 text-[11px]">
                  <span className="min-w-0 font-medium">{c.title}</span>
                  <span className="shrink-0 font-semibold text-[#14757d]">{c.percent}%</span>
                </p>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#e3ece9]">
                  <span className="block h-full rounded-full bg-[#14757d]" style={{ width: `${Math.max(0, Math.min(100, c.percent))}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[12px] font-bold leading-tight">{t("Deliverables")}</h3>
          <Link href={"/teacher/assignments" as Route} className="text-[10px] font-semibold text-[#14757d] hover:underline">
            {t("View all")}
          </Link>
        </div>
        {s.deliverables.length === 0 ? (
          <p className="mt-2 text-[11px] text-[#1B2D54]/60">{t("No assignments yet.")}</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {s.deliverables.map((a) => {
              const graded = a.status === "Graded" && a.score !== null;
              const late = a.status === "Missing" || a.status === "Late";
              return (
                <li key={a.assignmentId} className="rounded-xl bg-[#f6f9f8] p-3">
                  <p className="flex items-start justify-between gap-2">
                    <span dir="auto" className="min-w-0 text-[11px] font-semibold leading-snug">
                      {a.title}
                    </span>
                    <span className={cn("shrink-0 text-[10px] font-semibold", graded ? "text-[#14757d]" : late ? "text-[#c81e1e]" : "text-[#1B2D54]/60")}>
                      {graded ? `${a.score}/${a.maxPoints}` : t("Due {date}", { date: formatDate(a.dueUtc) })}
                    </span>
                  </p>
                  <p className={cn("mt-1.5 flex items-center gap-1.5 text-[10px]", late ? "text-[#c81e1e]" : "text-[#1B2D54]/70")}>
                    {a.status === "Graded" ? (
                      <CircleCheck aria-hidden className="size-3.5 text-[#14757d]" />
                    ) : a.status === "Submitted" ? (
                      <Clock3 aria-hidden className="size-3.5" />
                    ) : late ? (
                      <CircleAlert aria-hidden className="size-3.5" />
                    ) : (
                      <CircleDashed aria-hidden className="size-3.5" />
                    )}
                    {t(DELIVERABLE_LABEL[a.status])}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </>
  );
}

function ClassPanel({ c, grade, onBroadcast }: { c: ChannelThread; grade: number | null; onBroadcast: () => void }) {
  const { t } = useI18n();
  const teacherPosts = c.messages.filter((m) => m.mine).length;
  return (
    <Card>
      <span className="grid size-12 place-items-center rounded-full bg-[#c9f1f0] text-[#14757d]">
        <Hash aria-hidden className="size-6" />
      </span>
      <p className="mt-3 text-base font-bold">{t("Class {name}", { name: c.name })}</p>
      {grade !== null && <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Grade {grade}", { grade })}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-[#f6f9f8] p-2.5">
          <dt className="flex items-center justify-center gap-1 text-[10px] text-[#1B2D54]/70">
            <Users aria-hidden className="size-3" />
            {t("Students")}
          </dt>
          <dd className="mt-1 text-lg font-bold">{c.students}</dd>
        </div>
        <div className="rounded-xl bg-[#f6f9f8] p-2.5">
          <dt className="text-[10px] text-[#1B2D54]/70">{t("Messages")}</dt>
          <dd className="mt-1 text-lg font-bold">{c.messages.length}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[10px] text-[#1B2D54]/60">{t("{count} of them from you", { count: teacherPosts })}</p>
      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onBroadcast}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-[#14757d] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#0f6169]"
        >
          <Megaphone aria-hidden className="size-3.5 rtl:-scale-x-100" />
          {t("Broadcast to this class")}
        </button>
        <Link
          href={`/teacher/classes?class=${c.classId}` as Route}
          className="flex items-center justify-center gap-1 rounded-lg bg-[#eef2f1] px-3 py-2 text-[11px] font-semibold text-[#1B2D54] hover:bg-[#e3ece9]"
        >
          {t("Open class")}
          <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>
    </Card>
  );
}

/** "+ New Broadcast Message": one message to every class, or to one class. */
function BroadcastDialog({
  channels,
  classId: initialClass,
  onClose,
  onSent,
}: {
  channels: TeacherMessages["channels"];
  classId: string;
  onClose: () => void;
  onSent: (students: number, classId: string | null) => void;
}) {
  const { t } = useI18n();
  const [classId, setClassId] = useState(initialClass);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reach = classId ? (channels.find((c) => c.classId === classId)?.students ?? 0) : channels.reduce((a, c) => a + c.students, 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setBusy(true);
    setError(null);
    try {
      const target = classId || null;
      const result = await broadcast(target, body);
      onSent(result.students, target);
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't send your message. Please try again.")));
      setBusy(false);
    }
  }

  return (
    <TeacherDialog title={t("New broadcast message")} subtitle={t("Every student in the chosen classes gets it in their class channel.")} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3">
        <FieldLabel label={t("Send to")}>
          <select className={inputClass} value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">{t("All classes")}</option>
            {channels.map((c) => (
              <option key={c.classId} value={c.classId}>
                {t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label={t("Message")}>
          <textarea className={cn(inputClass, "h-28 py-2")} value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} required dir="auto" />
        </FieldLabel>
        <p className="text-[10px] text-[#1B2D54]/60">{t("Reaches {count} students", { count: reach })}</p>
        {error && (
          <p role="alert" className="text-[11px] text-[#c81e1e]">
            {error}
          </p>
        )}
        <div className="mt-1 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
            {t("Cancel")}
          </button>
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="flex items-center justify-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#0f6169] disabled:opacity-60"
          >
            {busy && <LoaderCircle className="size-3.5 animate-spin" />}
            {t("Send broadcast")}
          </button>
        </div>
      </form>
    </TeacherDialog>
  );
}
