"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  AtSign,
  Bold,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  CheckCheck,
  Clock,
  Code,
  FileText,
  Hash,
  Italic,
  Link2,
  Megaphone,
  Mic,
  MoreVertical,
  Paperclip,
  Plus,
  RefreshCw,
  Search,
  Send,
  Timer,
  TriangleAlert,
  Video,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

function useTr() {
  const { t } = useI18n();
  return (s: string) => (/[A-Za-z]/.test(s) ? t(s) : s);
}

function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

const STATS = [
  { label: "Urgent Direct Queries", value: "3", unit: "Unread", note: "2 students blocked in sprint", tone: "red", icon: "alert" },
  { label: "Figma Critique Queue", value: "7", unit: "Inquiries", note: "Awaiting token audits", tone: "teal", icon: "wrench" },
  { label: "1-on-1 Mentorship", value: "2", unit: "Today", note: "Next: 14:00 (Youssef A.)", tone: "teal", icon: "video" },
  { label: "Mentor SLA Velocity", value: "18", unit: "mins avg", note: "Top 5% Mentor Tier", tone: "teal", icon: "timer" },
] as const;

type Filter = "all" | "cohorts" | "direct" | "priority";

const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: "all", label: "All", count: 12 },
  { key: "cohorts", label: "Cohorts", count: 3 },
  { key: "direct", label: "Direct", count: 9 },
  { key: "priority", label: "Priority", count: 4 },
];

const COHORTS = [
  { id: "c1", name: "Cohort 9A • Sprints", preview: "Sara: Uploaded Fintech token review...", time: "10:42 AM", unread: 4 },
  { id: "c2", name: "Cohort 9A • Auto Layout", preview: "Marwan: Should we nest frames or...", time: "Yday", unread: 0 },
  { id: "c3", name: "Cohort 9B • User Research", preview: "Zeinab: Synthesized 5 interview transcripts", time: "Sun", unread: 0 },
];

type Person = { initials: string; avatar: string; photo?: string };

type Student = Person & {
  id: string;
  name: string;
  preview: string;
  time: string;
  timeTone?: "red";
  tag: string;
  tagTone: "teal" | "red" | "gray";
};

const STUDENTS: Student[] = [
  {
    id: "sara",
    name: "Sara Hassan",
    initials: "SH",
    avatar: "bg-[#f5a524]",
    photo: "/images/teacher/students/sara.png",
    preview: "Fintech_App_Design_System...",
    time: "15m",
    tag: "96% Mastery",
    tagTone: "teal",
  },
  {
    id: "youssef",
    name: "Youssef Ahmed",
    initials: "YA",
    avatar: "bg-[#7c5cff]",
    photo: "/images/teacher/students/youssef.png",
    preview: "Regarding contrast ratio feedback...",
    time: "45m",
    timeTone: "red",
    tag: "Needs Support • 58%",
    tagTone: "red",
  },
  {
    id: "omar",
    name: "Omar Ali",
    initials: "OA",
    avatar: "bg-[#12939b]",
    photo: "/images/teacher/students/omar.png",
    preview: "Variant loops prototype submitted",
    time: "2h",
    tag: "Cohort 9A • 90%",
    tagTone: "gray",
  },
];

const MENTOR: Person & { name: string } = {
  name: "Ms. Mona Hassan (Lead Mentor)",
  initials: "MH",
  avatar: "bg-[#14243f]",
};

type Msg = { id: string; from: "mentor" | "student"; text: string; time: string };

const THREADS: Record<string, Msg[]> = {
  sara: [
    {
      id: "m1",
      from: "mentor",
      text: "Hi Sara, excellent work on the Auto Layout hierarchy for the fourth sprint and applying the Nested Frames guidelines. Did you update the Semantic Variables for the primary purchase button across interactive states (Hover, Active, and Focus)?",
      time: "10:32 AM",
    },
    {
      id: "m2",
      from: "student",
      text: "Hello Ms. Mona! Yes, I completely updated the variables for both Light & Dark Modes and connected them to the component set.",
      time: "10:35 AM",
    },
  ],
};

const SKILLS = [
  { label: "Design Systems & Tokens", value: 98 },
  { label: "Auto Layout & Responsive", value: 98 },
  { label: "Interactive Prototyping", value: 94 },
];

const DELIVERABLES = [
  { title: "Sprint 04: Tokens Architecture", status: "Approved & Cataloged", score: "100/100", tone: "ok" },
  { title: "Sprint 05: Mobile Checkout Flow", status: "Awaiting Mentor Audit", score: "Due Tomorrow", tone: "due" },
] as const;


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white shadow-sm", className)}>{children}</section>
  );
}

function Avatar({ person, px, text = "text-[11px]" }: { person: Person; px: number; text?: string }) {
  const [failed, setFailed] = useState(false);
  const box = { width: px, height: px };

  if (person.photo && !failed) {
    return (
      <Image
        src={person.photo}
        alt=""
        width={px}
        height={px}
        style={box}
        onError={() => setFailed(true)}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      style={box}
      className={cn("grid shrink-0 place-items-center rounded-full font-bold text-white", text, person.avatar)}
    >
      {person.initials}
    </span>
  );
}

const tagClass = {
  teal: "bg-[#bff3f3] text-[#0b6b70]",
  red: "bg-[#fbd5d5] text-[#c81e1e]",
  gray: "bg-[#eef0f2] text-[#14243f]",
};


export default function MessagesPage() {
  const { t } = useI18n();
  const tr = useTr();
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState("sara");
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sent, setSent] = useState<Record<string, Msg[]>>({});

  const active = STUDENTS.find((s) => s.id === activeId) ?? STUDENTS[0];
  const thread = [...(THREADS[active.id] ?? []), ...(sent[active.id] ?? [])];
  const draft = drafts[active.id] ?? "";

  const q = query.trim().toLowerCase();
  const students = STUDENTS.filter((s) => {
    if (filter === "cohorts") return false;
    if (filter === "priority" && s.tagTone !== "red") return false;
    return !q || s.name.toLowerCase().includes(q);
  });
  const cohorts = COHORTS.filter((c) => {
    if (filter === "direct" || filter === "priority") return false;
    return !q || c.name.toLowerCase().includes(q);
  });

  function send() {
    const text = draft.trim();
    if (!text) return;
    // TODO: send to the real endpoint
    const msg: Msg = { id: `s${Date.now()}`, from: "mentor", text, time: "Now" };
    setSent((m) => ({ ...m, [active.id]: [...(m[active.id] ?? []), msg] }));
    setDrafts((d) => ({ ...d, [active.id]: "" }));
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#14243f]">
            <span>{tr("Academic")}</span>
            <ChevronRight aria-hidden className="size-3 rtl:rotate-180" />
            <span>{tr("Cohort Channels & Direct Mentorship")}</span>
            <span className="ms-1 rounded-full bg-[#bff3f3] px-2.5 py-1 text-[10px] font-semibold text-[#0b6b70]">
              {tr("UI/UX Cohort Suite Active")}
            </span>
          </nav>
          <h1 className="mt-3 max-w-[28rem] text-[28px] font-bold leading-tight text-[#0f1f3d]">
            {tr("Messages & Mentor Critique Center")}
          </h1>
          <p className="mt-1.5 max-w-[34rem] text-[13px] leading-snug text-[#1B2D54]/75">
            {tr("Real-time communication with students, cohort sprint groups, Figma critique sync, and rapid pedagogical unblocking.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-[11px] font-semibold text-[#14243f] shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
          >
            <CalendarClock aria-hidden className="size-3.5" />
            {tr("Schedule Office Hours")}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-[#0b6b70] px-3.5 py-2 text-[11px] font-semibold text-white hover:bg-[#095a5e]"
          >
            <Megaphone aria-hidden className="size-3.5" />
            {tr("+ New Broadcast Message")}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => (
          <Card key={s.label} className="flex items-center justify-between gap-3 border-0 p-5 shadow-[0_6px_24px_rgba(20,54,90,0.08)]">
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-semibold text-[#1B2D54]/70">{tr(s.label)}</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <Ltr className="text-4xl font-bold text-[#14243f]">{s.value}</Ltr>
                <span className="text-sm text-[#1B2D54]/70">{tr(s.unit)}</span>
              </p>
              <p className={cn("mt-2 flex items-center gap-1.5 text-[11px] font-semibold", s.tone === "red" ? "text-[#c81e1e]" : "text-[#0b6b70]")}>
                {s.tone === "red" && <span aria-hidden className="size-1.5 rounded-full bg-[#c81e1e]" />}
                {tr(s.note)}
              </p>
            </div>
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-xl",
                s.icon === "alert" ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#d4f5f5] text-[#0b6b70]"
              )}
            >
              {s.icon === "alert" && <TriangleAlert aria-hidden className="size-5" />}
              {s.icon === "wrench" && <Wrench aria-hidden className="size-5" />}
              {s.icon === "video" && <Video aria-hidden className="size-5" />}
              {s.icon === "timer" && <Timer aria-hidden className="size-5" />}
            </span>
          </Card>
        ))}
      </div>

      <div className="grid min-w-0 items-stretch gap-4 xl:h-[46rem] xl:grid-cols-[17.5rem_minmax(0,1fr)_16.5rem]">
        {/* ===== Left: conversations ===== */}
        <Card className="flex min-h-[30rem] min-w-0 flex-col overflow-hidden">
          <div className="p-4 pb-3">
            <label className="flex items-center gap-2 rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5">
              <Search aria-hidden className="size-4 shrink-0 text-[#1B2D54]/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Search cohorts or students...")}
                className="w-full bg-transparent text-xs outline-none placeholder:text-[#1B2D54]/55"
              />
            </label>

            <div role="tablist" className="mt-3 flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.key}
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-1 py-1.5 text-[10px] font-semibold transition-colors",
                    filter === f.key
                      ? "bg-[#0b6b70] text-white"
                      : f.key === "priority"
                        ? "bg-[#fde8e8] text-[#c81e1e]"
                        : "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]"
                  )}
                >
                  {tr(f.label)} <bdi>({f.count})</bdi>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#e3ece9] bg-[#fafcfc] px-4 py-3">
            {cohorts.length > 0 && (
              <>
                <p className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-[#14243f] rtl:normal-case rtl:tracking-normal">
                  {tr("Active Cohorts")}
                  <Plus aria-hidden className="size-4 text-[#1B2D54]/60" />
                </p>
                <ul className="mt-2 flex flex-col">
                  {cohorts.map((c) => (
                    <li key={c.id} className="flex items-start gap-2.5 rounded-lg px-1 py-2.5 hover:bg-white">
                      <Hash aria-hidden className="mt-0.5 size-4 shrink-0 text-[#14243f]" />
                      <div className="min-w-0 flex-1 leading-snug">
                        <p className="truncate text-[13px] font-semibold text-[#14243f]">{tr(c.name)}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-[#1B2D54]/70">{tr(c.preview)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="text-[10px] text-[#1B2D54]/55">
                          <bdi>{tr(c.time)}</bdi>
                        </span>
                        {c.unread > 0 && (
                          <span className="grid size-5 place-items-center rounded-full bg-[#0b6b70] text-[10px] font-bold text-white">
                            <Ltr>{c.unread}</Ltr>
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {students.length > 0 && (
              <>
                <p className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-[#14243f] rtl:normal-case rtl:tracking-normal">
                  {tr("Direct Mentorship")}
                  <span className="text-[11px] font-semibold normal-case tracking-normal text-[#0b6b70]">
                    <bdi>{t("{n} Active", { n: 4 })}</bdi>
                  </span>
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {students.map((s) => {
                    const selected = s.id === active.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => setActiveId(s.id)}
                          aria-pressed={selected}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl p-3 text-start transition-colors",
                            selected ? "bg-[#bff3f3]/70" : "hover:bg-white"
                          )}
                        >
                          <Avatar person={s} px={36} />
                          <div className="min-w-0 flex-1 leading-snug">
                            <p className="truncate text-[13px] font-semibold text-[#14243f]">{tr(s.name)}</p>
                            <p className="mt-0.5 line-clamp-2 text-xs text-[#1B2D54]/70">{tr(s.preview)}</p>
                            <span className={cn("mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-semibold", tagClass[s.tagTone])}>
                              {tr(s.tag)}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "shrink-0 text-[11px] font-semibold",
                              s.timeTone === "red" ? "text-[#c81e1e]" : "text-[#1B2D54]/55"
                            )}
                          >
                            <bdi>{tr(s.time)}</bdi>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            {cohorts.length === 0 && students.length === 0 && (
              <p className="p-6 text-center text-xs text-[#1B2D54]/60">{tr("Nothing here yet.")}</p>
            )}
          </div>

          <p className="flex items-center gap-2 border-t border-[#e3ece9] px-4 py-2.5 text-[11px] text-[#1B2D54]/75">
            <span aria-hidden className="size-2 rounded-full bg-[#2ed3b7]" />
            {tr("Status: Open for Live Critiques")}
          </p>
        </Card>

        <Card className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#e3ece9] px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar person={active} px={48} text="text-xs" />
              <div className="min-w-0 leading-tight">
                <p className="flex flex-wrap items-center gap-2 text-[17px] font-bold text-[#14243f]">
                  {tr(active.name)}
                  <span className="rounded-md bg-[#bff3f3] px-2 py-0.5 text-[10px] font-semibold text-[#0b6b70]">
                    {tr("Cohort 9A • Capstone")}
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#1B2D54]/70">
                  {tr("Fintech Mobile Banking App • Sprint 04 Design Tokens")}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" aria-label={tr("Video call")} className="grid size-8 place-items-center rounded-lg text-[#0b6b70] hover:bg-[#eef0f2]">
                <Video aria-hidden className="size-5" />
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-[#eef0f2] px-3 py-2 text-[11px] font-semibold text-[#14243f] hover:bg-[#e1e5e8]"
              >
                <RefreshCw aria-hidden className="size-3.5" />
                {tr("Sync Review")}
              </button>
              <button type="button" aria-label={tr("More")} className="grid size-8 place-items-center rounded-lg hover:bg-[#eef0f2]">
                <MoreVertical aria-hidden className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto bg-[#f6f9f9] px-5 py-4">
            <p className="mx-auto w-fit rounded-full bg-white px-3.5 py-1 text-[11px] font-semibold text-[#1B2D54]/70 shadow-sm ring-1 ring-[#e3ece9]">
              {tr("Today • 10:30 AM")}
            </p>

            {thread.map((m) => {
              const mine = m.from === "mentor";
              return (
                <div key={m.id} className={cn("flex flex-col gap-1.5", mine ? "items-end" : "items-start")}>
                  <div className={cn("flex items-end gap-3", mine ? "flex-row" : "flex-row")}>
                    <div
                      dir="auto"
                      className={cn(
                        "max-w-[28rem] rounded-2xl px-5 py-4 text-[14px] leading-relaxed text-[#14243f]",
                        mine ? "bg-[#d9dcdf]" : "bg-white shadow-sm ring-1 ring-[#e3ece9]"
                      )}
                    >
                      <p className={cn("mb-1 text-[11px] font-semibold", mine ? "text-[#14243f]" : "text-[#0b6b70]")}>
                        {tr(mine ? MENTOR.name : active.name)}
                      </p>
                      {tr(m.text)}
                    </div>
                    {mine && <Avatar person={MENTOR} px={36} text="text-[11px]" />}
                  </div>
                  <p className={cn("flex items-center gap-1 text-[11px] text-[#1B2D54]/55", mine && "me-12")}>
                    <bdi>{tr(m.time)}</bdi>
                    {mine && <CheckCheck aria-hidden className="size-3.5 text-[#0b6b70]" />}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-[#e3ece9] px-5 pb-3 pt-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
              <div className="flex items-center gap-1">
                {[Bold, Italic, Code, Link2].map((Icon, i) => (
                  <span key={i} aria-hidden className="grid size-7 place-items-center rounded text-[#14243f]">
                    <Icon className="size-3.5" />
                  </span>
                ))}
                <span aria-hidden className="mx-1 h-4 w-px bg-[#1B2D54]/15" />
                <button type="button" className="flex items-center gap-1 rounded-md bg-[#d4f5f5] px-2.5 py-1.5 text-[11px] font-semibold text-[#0b6b70]">
                  <AtSign aria-hidden className="size-3" />
                  {tr("Token")}
                </button>
                <button type="button" className="flex items-center gap-1 rounded-md bg-[#eef0f2] px-2.5 py-1.5 text-[11px] font-semibold text-[#14243f]">
                  <FileText aria-hidden className="size-3" />
                  {tr("Rubric Snippets")}
                </button>
              </div>
              <div className="flex items-center gap-2 text-[#14243f]">
                <Mic aria-hidden className="size-4" />
                <Paperclip aria-hidden className="size-4" />
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-[#e3ece9] bg-[#f6f9f9] p-2.5">
              <textarea
                value={draft}
                onChange={(e) => setDrafts((d) => ({ ...d, [active.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                dir="auto"
                placeholder={t("Type pedagogical critique or mentorship notes for {name}...", { name: tr(active.name.split(" ")[0]) })}
                className="w-full resize-none bg-transparent px-1 text-[13px] outline-none placeholder:text-[#1B2D54]/50"
              />
              <button
                type="button"
                onClick={send}
                aria-label={tr("Send")}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0b6b70] text-white hover:bg-[#095a5e]"
              >
                <Send aria-hidden className="size-5 rtl:-scale-x-100" />
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-start justify-between gap-2 text-[10px] text-[#1B2D54]/60">
              <span className="max-w-[12rem]">{tr("Shift + Enter for new line • Enter to send")}</span>
              <span className="max-w-[12rem] text-end font-semibold text-[#0b6b70]">{tr("Auto-saves to Student Academic Audit Log")}</span>
            </div>
          </div>
        </Card>

        <div className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-2">
              <Avatar person={active} px={56} text="text-sm" />
              <span className="rounded-full bg-[#bff3f3] px-2.5 py-1 text-[10px] font-semibold text-[#0b6b70]">
                {tr("Advanced • 96%")}
              </span>
            </div>
            <p className="mt-3 text-[17px] font-bold text-[#14243f]">{tr(active.name)}</p>
            <p className="mt-0.5 text-xs leading-snug text-[#1B2D54]/70">{tr("Product Designer • Spring 2025 Cohort 9A")}</p>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-[#1B2D54]/65 rtl:normal-case rtl:tracking-normal">
              {tr("Core Track Competencies")}
            </p>
            <ul className="mt-3 flex flex-col gap-3.5">
              {SKILLS.map((s) => (
                <li key={s.label}>
                  <div className="flex items-start justify-between gap-2 text-xs">
                    <span className="max-w-[8rem] font-medium leading-snug text-[#14243f]">{tr(s.label)}</span>
                    <Ltr className="font-bold text-[#0b6b70]">{s.value}%</Ltr>
                  </div>
                  <div
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e3ece9]"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={s.value}
                  >
                    <div className="h-full rounded-full bg-[#0b6b70]" style={{ width: `${s.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="max-w-[6rem] text-[13px] font-bold leading-snug text-[#14243f]">{tr("Sprint Deliverables")}</h3>
              <button type="button" className="max-w-[3.5rem] text-end text-[11px] font-semibold leading-snug text-[#0b6b70] hover:underline">
                {tr("Track View")}
              </button>
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {DELIVERABLES.map((d) => (
                <li key={d.title} className="rounded-xl bg-[#f1f4f4] p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="max-w-[7.5rem] text-xs font-bold leading-snug text-[#14243f]">{tr(d.title)}</p>
                    <span
                      className={cn(
                        "shrink-0 text-end text-[11px] font-bold leading-snug",
                        d.tone === "due" ? "max-w-[3rem] text-[#c81e1e]" : "text-[#0b6b70]"
                      )}
                    >
                      <bdi>{tr(d.score)}</bdi>
                    </span>
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-snug text-[#1B2D54]/75">
                    {d.tone === "ok" ? (
                      <CircleCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#0b6b70]" />
                    ) : (
                      <Clock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                    )}
                    {tr(d.status)}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}