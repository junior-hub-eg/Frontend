"use client";

import { useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
const TEACHER = { firstName: "Mona", title: "Ms." };

const CLASSES = [
  { label: "All Classes", count: 84 },
  { label: "Grade 9A" },
  { label: "Grade 9B" },
];

type Stat = {
  label: string;
  value: string;
  unit: string;
  icon: ReactNode;
  left: string;
  right: string;
  tone?: "default" | "danger";
  rightTone?: "teal" | "danger" | "muted";
};

const STATS: Stat[] = [
  { label: "Total Enrolled", value: "84", unit: "students", icon: <Users aria-hidden className="size-3.5" />, left: "3 cohort tracks", right: "100% cap", rightTone: "teal" },
  { label: "Weekly Active", value: "78", unit: "/84", icon: <Activity aria-hidden className="size-3.5" />, left: "↗ 92.8%", right: "+4% w/w", rightTone: "muted" },
  { label: "Due This Week", value: "3", unit: "pending", icon: <CalendarClock aria-hidden className="size-3.5" />, left: "Sprint 04 Wireframes", right: "Fri", rightTone: "danger" },
  { label: "Class Avg Score", value: "84.5%", unit: "", icon: <BarChart3 aria-hidden className="size-3.5" />, left: "↗ +2.1%", right: "Benchmark 80%", rightTone: "muted" },
  { label: "Published Units", value: "14", unit: "units", icon: <BookOpen aria-hidden className="size-3.5" />, left: "+4 Sched", right: "Next week", rightTone: "muted" },
  { label: "Needs Focus", value: "5", unit: "students", icon: <CircleAlert aria-hidden className="size-3.5" />, left: "Action Required", right: "", tone: "danger" },
];

type Group = "blockers" | "admin";

type StudentAlert = {
  id: string;
  group: Group;
  kind: string;
  kindTone: string; // text colour of the label
  dot: string;
  time: string;
  name: string;
  meta: string;
  initials: string;
  avatar: string; 
  photo?: string; 
  note: ReactNode;
  actions: { label: string; variant: "primary" | "secondary" | "dark" }[];
};

const ALERTS: StudentAlert[] = [
  {
    id: "struggling",
    group: "blockers",
    kind: "Struggling with Task",
    kindTone: "text-[#c81e1e]",
    dot: "bg-[#c81e1e]",
    time: "2h ago",
    name: "Karim Tarek",
    meta: "Grade 9A • UI/UX Design",
    initials: "KT",
    avatar: "bg-[#f5a524]",
    photo: "/images/teacher/students/karim.png",
    note: (
      <>
        Failed <strong>&quot;Figma Auto-layout Constraints&quot;</strong> 3 times in a row.
      </>
    ),
    actions: [
      { label: "Review Attempt", variant: "primary" },
      { label: "Send Hint", variant: "secondary" },
    ],
  },
  {
    id: "missed",
    group: "blockers",
    kind: "Missed Deadline",
    kindTone: "text-[#c81e1e]",
    dot: "bg-[#c81e1e]",
    time: "Yesterday 11:59 PM",
    name: "Sarah Mansour",
    meta: "Grade 9A • Design Systems",
    initials: "SM",
    avatar: "bg-[#12939b]",
    photo: "/images/teacher/students/sarah.png",

    note: (
      <>
        Did not submit <strong>Sprint 03 Design System Quiz</strong>. No activity recorded.
      </>
    ),
    actions: [
      { label: "Extend (+24h)", variant: "primary" },
      { label: "Send Reminder", variant: "secondary" },
    ],
  },
  {
    id: "inactive",
    group: "admin",
    kind: "7+ Days Inactive",
    kindTone: "text-[#1B2D54]/70",
    dot: "bg-[#8a94a6]",
    time: "Last on Oct 18",
    name: "Youssef Ezzat",
    meta: "Grade 9B • Web Dev",
    initials: "YE",
    avatar: "bg-[#7c5cff]",
    photo: "/images/teacher/students/youssef.png",
    note: "Missed 2 lectures and has 0 submissions logged this week.",
    actions: [{ label: "Notify Parent & Student", variant: "dark" }],
  },
];

const FILTERS: { key: "all" | Group; label: string; count: number }[] = [
  { key: "all", label: "All", count: 5 },
  { key: "blockers", label: "Blockers", count: 2 },
  { key: "admin", label: "Admin", count: 3 },
];

const QUERIES = [
  { name: "Laila K.", text: "Is flex-wrap permitted in Q4?" },
  { name: "Tarek H.", text: "Auto-layout resizing clip issue" },
  { name: "Jana M.", text: "Can we submit interactive link?" },
];

const CLASS_PROGRESS = [
  {
    code: "9A",
    avatar: "bg-[#14757d]",
    bar: "bg-[#14757d]",
    title: "Grade 9A • UI/UX Design Fundamentals",
    module: "Unit 4: Prototyping & Interactions",
    onTrack: "24/28 on track",
    percent: 76,
    milestone: "Interactive Wireframe Presentation",
    due: "Due Oct 27",
  },
  {
    code: "9B",
    avatar: "bg-[#0f9d6b]",
    bar: "bg-[#3ecf9a]",
    title: "Grade 9B • Frontend & Web Development",
    module: "Unit 3: Responsive CSS & Flexbox Layouts",
    onTrack: "18/28 on track",
    percent: 64,
    milestone: "Mobile Navigation Screen Challenge",
    due: "Due Oct 23",
  },
  {
    code: "8A",
    avatar: "bg-[#14757d]",
    bar: "bg-[#1B2D54]",
    title: "Grade 8A • Digital Foundations & Computational Thinking",
    module: "Unit 5: Variables, Conditionals & Logic",
    onTrack: "26/28 on track",
    percent: 86,
    milestone: "Final Logic Gate Quiz",
    due: "Due Nov 02",
  },
];

const MISTAKES = [
  {
    id: "Problem #4.2",
    title: "Calculating Auto-layout Padding & Resizing",
    tag: "54% 1st-Attempt Pass",
    tagTone: "bg-[#fde8e8] text-[#c81e1e]",
    rate: 54,
    count: "42/78",
    barTone: "bg-[#c81e1e]",
    rateTone: "text-[#c81e1e]",
    danger: true,
    pitfall: (
      <>
        Confusing <code className="rounded bg-white px-1 text-[9px]">Hug contents</code> with{" "}
        <code className="rounded bg-white px-1 text-[9px]">Fill container</code> on nested vertical cards.
      </>
    ),
  },
  {
    id: "Problem #3.5",
    title: "CSS Box Model & Margin Collapsing",
    tag: "61% 1st-Attempt Pass",
    tagTone: "bg-[#9be9ef] text-[#14757d]",
    rate: 61,
    count: "47/77",
    barTone: "bg-[#14757d]",
    rateTone: "text-[#14757d]",
    danger: false,
    pitfall: "Assuming adjacent vertical margins sum up rather than collapse to the largest single value.",
  },
];

const SCHEDULE = [
  {
    day: "THU",
    date: "24",
    active: true,
    title: "Sprint 04 Wireframe R",
    meta: "Grade 9A • Interactive Design Lab A",
    time: "10:00 AM",
    timeTone: "text-[#14757d]",
    note: "In-person critique",
    noteTone: "text-[#14757d]",
    dotTone: "bg-[#14757d]",
  },
  {
    day: "FRI",
    date: "25",
    active: false,
    title: "CSS Flexbox Submission",
    meta: "Grade 9B • Digital Portal",
    time: "11:59 PM",
    timeTone: "text-[#c81e1e]",
    note: "Automated grading queue",
    noteTone: "text-[#1B2D54]/60",
    dotTone: "bg-[#8a94a6]",
  },
  {
    day: "MON",
    date: "28",
    active: false,
    title: "Launch Unit 5: Prototyping",
    meta: "All cohorts • Syllabus sync",
    time: "08:30 AM",
    timeTone: "text-[#1B2D54]/70",
    note: "New challenge packs unlocked",
    noteTone: "text-[#14757d]",
    dotTone: "bg-[#8a94a6]",
  },
];

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function ActionButton({ label, variant }: { label: string; variant: "primary" | "secondary" | "dark" }) {
  return (
    <button
      type="button"
      className={cn(
        "flex-1 rounded-lg px-3 py-2 text-[11px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
        variant === "primary" && "bg-[#14757d] text-white",
        variant === "secondary" && "bg-[#eef2f1] text-[#1B2D54]",
        variant === "dark" && "bg-[#1B2D54] text-white"
      )}
    >
      {label}
    </button>
  );
}

function StatCard({ stat }: { stat: Stat }) {
  const danger = stat.tone === "danger";
  return (
    <div className="flex w-[200px] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[#e3ece9] bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase leading-tight text-[#1B2D54]/60">{stat.label}</p>
        <span className="shrink-0 text-[#14757d]">{stat.icon}</span>
      </div>

      <p className="mt-2 flex items-baseline gap-1">
        <span className={cn("text-2xl font-bold leading-none", danger && "text-[#e5484d]")}>{stat.value}</span>
        <span className="text-[10px] text-[#1B2D54]/60">{stat.unit}</span>
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 text-[10px]">
        {danger ? (
          <span className="rounded bg-[#fde8e8] px-1.5 py-0.5 font-semibold text-[#e5484d]">{stat.left}</span>
        ) : (
          <span className="truncate text-[#1B2D54]/60">{stat.left}</span>
        )}
        {stat.right && (
          <span
            className={cn(
              "shrink-0 font-semibold",
              stat.rightTone === "teal" && "text-[#14757d]",
              stat.rightTone === "danger" && "text-[#e5484d]",
              stat.rightTone === "muted" && "text-[#1B2D54]/60"
            )}
          >
            {stat.right}
          </span>
        )}
      </div>
    </div>
  );
}

function DragRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !ref.current) return; // touch already scrolls natively
    drag.current = { active: true, startX: e.clientX, startLeft: ref.current.scrollLeft, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active || !ref.current) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    ref.current.scrollLeft = d.startLeft - dx;
  }

  function end() {
    drag.current.active = false;
  }

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerLeave={end}
      className={cn(
        "flex gap-3 overflow-x-auto pb-2 snap-x snap-proximity",
        "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
        "cursor-grab active:cursor-grabbing select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

function AlertCard({ alert }: { alert: StudentAlert }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className={cn("flex items-center gap-1.5 font-semibold", alert.kindTone)}>
          <span aria-hidden className={cn("size-1.5 rounded-full", alert.dot)} />
          {alert.kind}
        </span>
        <span className="text-[#1B2D54]/50">{alert.time}</span>
      </div>

      <div className="flex items-center gap-2.5">
        {alert.photo ? (
          <Image
            src={alert.photo}
            alt={alert.name}
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
              alert.avatar
            )}
          >
            {alert.initials}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{alert.name}</p>
          <p className="truncate text-[10px] text-[#1B2D54]/60">{alert.meta}</p>
        </div>
      </div>

      <p className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5 text-[11px] leading-snug text-[#1B2D54]/80">
        {alert.note}
      </p>

      <div className="mt-auto flex gap-2">
        {alert.actions.map((a) => (
          <ActionButton key={a.label} {...a} />
        ))}
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const [activeClass, setActiveClass] = useState(CLASSES[0].label);
  const [filter, setFilter] = useState<"all" | Group>("all");

  const visibleAlerts = ALERTS.filter((a) => filter === "all" || a.group === filter);
  const showJoin = filter === "all" || filter === "admin";
  const showQueries = filter === "all" || filter === "admin";

  return (
    <div dir="ltr" className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-0.5 text-[#14757d]">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#14757d]" />
              <span className="relative top-[1px]">Term 1 • Academic Workspace</span>
            </span>
            <span className="text-[#1B2D54]/70">3 Active Cohorts</span>
          </p>
        
          <h1 className="mt-1 text-2xl font-bold">
            Good morning, {TEACHER.title} {TEACHER.firstName} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">Here is what is happening across your assigned classes this week</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-[#e3ece9]">
            {CLASSES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setActiveClass(c.label)}
                aria-pressed={activeClass === c.label}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
                  activeClass === c.label ? "bg-[#1B2D54] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10"
                )}
              >
                {c.label}
                {c.count !== undefined && ` (${c.count})`}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <Plus aria-hidden className="size-3.5" />
            Quick Assignment
          </button>
        </div>
      </header>

      <DragRow>
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </DragRow>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fde8e8] text-[#e5484d]">
              <CircleAlert aria-hidden className="size-4" />
            </span>
            <div className="leading-tight">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                Needs Attention
                <span className="rounded bg-[#fde8e8] px-1.5 py-0.5 text-[9px] font-semibold text-[#e5484d]">5 Urgent</span>
              </h2>
              <p className="mt-1 text-[10px] text-[#1B2D54]/60">
                Real-time alerts requiring teacher feedback, intervention, or admission checks
              </p>
            </div>
          </div>

          <div role="tablist" className="flex items-center gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
                  filter === f.key ? "bg-[#14757d] text-white" : "bg-[#eef2f1] text-[#1B2D54] hover:bg-[#dfe9e7]"
                )}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleAlerts.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}

          {showJoin && (
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#14757d]">
                  <span aria-hidden className="size-1.5 rounded-full bg-[#14757d]" />
                  Pending Cohort Join
                </span>
                <span className="text-[#1B2D54]/50">Today</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#9be9ef] text-[10px] font-bold text-[#14757d]">
                  +2
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">2 Students Waiting</p>
                  <p className="text-[10px] text-[#1B2D54]/60">Grade 9A Enrollment Room</p>
                </div>
              </div>

              <p className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5 text-[11px] leading-snug text-[#1B2D54]/80">
                Nour Adel &amp; Malek Omar requested approval into Grade 9A.
              </p>

              <div className="mt-auto flex">
                <ActionButton label="Review & Accept (2)" variant="primary" />
              </div>
            </div>
          )}

          {showQueries && (
            <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3 md:col-span-2 xl:col-span-2">
              <div className="flex items-center justify-between text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#1B2D54]">
                  <span aria-hidden className="size-1.5 rounded-full bg-[#1B2D54]" />
                  3 Unread Queries
                </span>
                <span className="text-[#1B2D54]/50">Within last 45 mins</span>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {QUERIES.map((q) => (
                  <p
                    key={q.name}
                    className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5 text-[11px] leading-snug text-[#1B2D54]/80"
                  >
                    <strong className="text-[#1B2D54]">{q.name}:</strong> &quot;{q.text}&quot;
                  </p>
                ))}
              </div>

              <div className="mt-auto flex justify-end">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg bg-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
                >
                  <MessageSquare aria-hidden className="size-3.5" />
                  Reply in Student Messages
                </button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* ---------------- Class progress ---------------- */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">Class Progress &amp; Completion</h2>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">
              Track syllabus velocity and on-track benchmarks across cohorts
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-[10px] font-semibold text-[#14757d] hover:underline"
          >
            Detailed Class Breakdown
            <ChevronRight aria-hidden className="size-3.5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {CLASS_PROGRESS.map((c) => (
            <div key={c.code} className="rounded-xl border border-[#e3ece9] bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white",
                    c.avatar
                  )}
                >
                  {c.code}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold">{c.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[#1B2D54]/60">
                    Active Module: <span className="font-semibold text-[#1B2D54]">{c.module}</span>
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-[#c9efe9] px-2 py-0.5 text-[9px] font-semibold text-[#14757d] sm:inline">
                  {c.onTrack}
                </span>
                <span className="shrink-0 text-sm font-bold">{c.percent}%</span>
              </div>

              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={c.percent}
              >
                <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${c.percent}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-[9px] text-[#1B2D54]/60">
                <span>Next Milestone: {c.milestone}</span>
                <span className="font-semibold">{c.due}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="leading-tight">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <CircleHelp aria-hidden className="size-4 text-[#14757d]" />
                Diagnostic: Hardest Problems &amp; Common Mistakes
              </h2>
              <p className="mt-1 pl-6 text-[10px] text-[#1B2D54]/60">
                Automatic simulation telemetry identifying concept drop-offs this week
              </p>
            </div>
            <span className="rounded-full bg-[#9be9ef] px-2.5 py-1 text-[9px] font-semibold text-[#14757d]">
              Based on 320 attempts
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {MISTAKES.map((m) => (
              <div key={m.id} className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
                <div className="flex items-center justify-between gap-2 text-[9px]">
                  <span className="font-semibold uppercase text-[#14757d]">{m.id}</span>
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", m.tagTone)}>{m.tag}</span>
                </div>

                <p className="text-sm font-semibold leading-snug">{m.title}</p>

                <div className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#1B2D54]/60">First Attempt Success Rate</span>
                    <span className={cn("font-semibold", m.rateTone)}>
                      {m.rate}% ({m.count})
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]">
                    <div className={cn("h-full rounded-full", m.barTone)} style={{ width: `${m.rate}%` }} />
                  </div>
                </div>

                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg border px-3 py-2 text-[10px] leading-snug",
                    m.danger
                      ? "border-[#f7caca] bg-[#fdecec] text-[#1B2D54]/80"
                      : "border-[#9be9ef] bg-[#e4f8fa] text-[#1B2D54]/80"
                  )}
                >
                  <CircleAlert
                    aria-hidden
                    className={cn("mt-0.5 size-3.5 shrink-0", m.danger ? "text-[#c81e1e]" : "text-[#14757d]")}
                  />
                  <p>
                    <strong className={m.danger ? "text-[#c81e1e]" : "text-[#14757d]"}>Primary Pitfall:</strong>{" "}
                    {m.pitfall}
                  </p>
                </div>

                <div className="mt-auto flex gap-2">
                  {/* TODO: connect to the real pages */}
                  <ActionButton label="Review Problem" variant="dark" />
                  <ActionButton label="Class Error Matrix" variant="secondary" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Class schedule */}
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays aria-hidden className="size-4 text-[#14757d]" />
              Class Schedule
            </h2>
            <button type="button" className="text-[10px] font-semibold text-[#14757d] hover:underline">
              View All
            </button>
          </div>

          <ul className="flex flex-col gap-3">
            {SCHEDULE.map((s) => (
              <li key={s.title} className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    "flex w-11 shrink-0 flex-col items-center rounded-xl py-1.5 leading-none",
                    s.active ? "bg-[#1B2D54] text-white" : "bg-[#eef2f1] text-[#1B2D54]"
                  )}
                >
                  <span className={cn("text-[8px] font-semibold", s.active ? "text-white/70" : "text-[#1B2D54]/50")}>
                    {s.day}
                  </span>
                  <span className="mt-1 text-base font-bold">{s.date}</span>
                </span>

                <div className="min-w-0 flex-1 leading-tight">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold">{s.title}</p>
                    <span className={cn("shrink-0 text-[10px] font-semibold", s.timeTone)}>{s.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[9px] text-[#1B2D54]/60">{s.meta}</p>
                  <p className={cn("mt-1 flex items-center gap-1 text-[9px] font-semibold", s.noteTone)}>
                    <span aria-hidden className={cn("size-1.5 rounded-full", s.dotTone)} />
                    {s.note}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-auto rounded-xl bg-[#eef2f1] px-3 py-2.5 text-[11px] font-semibold transition-colors hover:bg-[#dfe9e7]"
          >
            + Schedule Office Hour or Review
          </button>
        </Card>
      </div>
    </div>
  );
}
