"use client";

import { useCallback, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleHelp,
  LoaderCircle,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import {
  changeDue,
  decideJoinRequest,
  getTeacherDashboard,
  type ClassQuestion,
  type TeacherAlert,
  type TeacherDashboard,
} from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { Card, LoadBlock, StudentAvatar, formatDate, useTeacherData } from "@/components/teacher/teacher-ui";

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

type Group = "blockers" | "admin";

const GROUP_OF: Record<TeacherAlert["kind"], Group> = {
  MissedDeadline: "blockers",
  LowScore: "blockers",
  Inactive: "admin",
  JoinRequest: "admin",
};

const KIND_LABEL: Record<TeacherAlert["kind"], string> = {
  MissedDeadline: tk("Missed Deadline"),
  LowScore: tk("Low Score"),
  Inactive: tk("7+ Days Inactive"),
  JoinRequest: tk("Pending Class Join"),
};

const KIND_TONE: Record<TeacherAlert["kind"], { text: string; dot: string }> = {
  MissedDeadline: { text: "text-[#c81e1e]", dot: "bg-[#c81e1e]" },
  LowScore: { text: "text-[#c81e1e]", dot: "bg-[#c81e1e]" },
  Inactive: { text: "text-[#1B2D54]/70", dot: "bg-[#8a94a6]" },
  JoinRequest: { text: "text-[#14757d]", dot: "bg-[#14757d]" },
};

function ActionButton({
  label,
  variant,
  onClick,
  href,
  busy,
}: {
  label: string;
  variant: "primary" | "secondary" | "dark";
  onClick?: () => void;
  href?: string;
  busy?: boolean;
}) {
  const className = cn(
    "flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-center text-[11px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40 disabled:opacity-50",
    variant === "primary" && "bg-[#14757d] text-white",
    variant === "secondary" && "bg-[#eef2f1] text-[#1B2D54]",
    variant === "dark" && "bg-[#1B2D54] text-white",
  );
  if (href) {
    return (
      <Link href={href as Route} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={busy} className={className}>
      {busy && <LoaderCircle className="size-3 animate-spin" />} {label}
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
              stat.rightTone === "muted" && "text-[#1B2D54]/60",
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
        className,
      )}
    >
      {children}
    </div>
  );
}

/** One alert with the action that fits it. Extending and accepting change data, so they reload the dashboard. */
function AlertCard({ alert, onChanged }: { alert: TeacherAlert; onChanged: () => void }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tone = KIND_TONE[alert.kind];

  async function run(key: string, action: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const note = (() => {
    switch (alert.kind) {
      case "MissedDeadline":
        return t("Did not submit {title} by the due date.", { title: alert.detail ?? "" });
      case "LowScore":
        return t("Scored low on {title}.", { title: alert.detail ?? "" });
      case "Inactive":
        return alert.detail
          ? t("No activity in the last 7 days. Last active {date}.", { date: formatDate(alert.detail) })
          : t("No activity recorded yet.");
      default:
        return t("Asked to join {className} with the class code.", { className: alert.className });
    }
  })();

  const actions = (() => {
    switch (alert.kind) {
      case "MissedDeadline":
        return (
          <>
            <ActionButton
              label={t("Extend (+24h)")}
              variant="primary"
              busy={busy === "extend"}
              onClick={() => run("extend", () => changeDue(alert.assignmentId!, new Date(Math.max(Date.now(), Date.parse(alert.atUtc!)) + 864e5).toISOString()))}
            />
            <ActionButton label={t("Send Reminder")} variant="secondary" />
          </>
        );
      case "LowScore":
        return (
          <>
            <ActionButton label={t("Review Attempt")} variant="primary" />
            <ActionButton label={t("Send Hint")} variant="secondary" />
          </>
        );
      case "Inactive":
        return <ActionButton label={t("Notify Parent & Student")} variant="dark" />;
      default:
        return (
          <>
            <ActionButton
              label={t("Accept")}
              variant="primary"
              busy={busy === "accept"}
              onClick={() => run("accept", () => decideJoinRequest(alert.classId, alert.studentId, true))}
            />
            <ActionButton
              label={t("Decline")}
              variant="secondary"
              busy={busy === "decline"}
              onClick={() => run("decline", () => decideJoinRequest(alert.classId, alert.studentId, false))}
            />
          </>
        );
    }
  })();

  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
      <div className="flex items-center justify-between text-[10px]">
        <span className={cn("flex items-center gap-1.5 font-semibold", tone.text)}>
          <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
          {t(KIND_LABEL[alert.kind])}
        </span>
        <span className="text-[#1B2D54]/50">{alert.atUtc ? formatDate(alert.atUtc, true) : ""}</span>
      </div>

      <div className="flex items-center gap-2.5">
        <StudentAvatar name={alert.fullName} photoUrl={alert.photoUrl} gender={alert.gender} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{alert.fullName}</p>
          <p className="truncate text-[10px] text-[#1B2D54]/60">{t("Class {name}", { name: alert.className })}</p>
        </div>
      </div>

      <p className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5 text-[11px] leading-snug text-[#1B2D54]/80">{note}</p>
      {error && <p role="alert" className="text-[10px] text-[#c81e1e]">{error}</p>}

      <div className="mt-auto flex gap-2">{actions}</div>
    </div>
  );
}

/** Open questions from students (the design's "Unread Queries" card). */
function QuestionsCard({ questions }: { questions: ClassQuestion[] }) {
  const { t } = useI18n();
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3 md:col-span-2 xl:col-span-2">
      <div className="flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1.5 font-semibold text-[#1B2D54]">
          <span aria-hidden className="size-1.5 rounded-full bg-[#1B2D54]" />
          {t("{count} Unread Queries", { count: questions.length })}
        </span>
        {questions[0] && <span className="text-[#1B2D54]/50">{formatDate(questions[0].createdUtc, true)}</span>}
      </div>

      {questions.length === 0 ? (
        <p className="text-[11px] text-[#1B2D54]/60">{t("No questions waiting for you.")}</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3">
          {questions.slice(0, 3).map((q) => (
            <p key={q.id} className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2.5 text-[11px] leading-snug text-[#1B2D54]/80">
              <strong className="text-[#1B2D54]">{q.studentName}:</strong> &quot;{q.text}&quot;
            </p>
          ))}
        </div>
      )}

      <div className="mt-auto flex justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-[#1B2D54] px-4 py-2 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
        >
          <MessageSquare aria-hidden className="size-3.5" />
          {t("Reply in Student Messages")}
        </button>
      </div>
    </div>
  );
}

function greeting(t: (s: string, v?: Record<string, string>) => string, name: string) {
  const hour = new Date().getHours();
  return hour < 12 ? t("Good morning, {name}", { name }) : hour < 18 ? t("Good afternoon, {name}", { name }) : t("Good evening, {name}", { name });
}

export default function TeacherDashboardPage() {
  const { t } = useI18n();
  const [activeClass, setActiveClass] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | Group>("all");
  const load = useCallback(() => getTeacherDashboard(activeClass ?? undefined), [activeClass]);
  const dashboard = useTeacherData(load, tk("We couldn't load your dashboard. Please try again."));
  const d: TeacherDashboard | null = dashboard.data;

  if (!d) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
        <LoadBlock error={dashboard.error} onRetry={dashboard.reload} />
      </div>
    );
  }

  const s = d.stats;
  const total = d.classes.reduce((a, c) => a + c.students, 0);
  const nextDue = d.schedule.find((x) => x.kind === "Due");
  const stats: Stat[] = [
    {
      label: t("Total Enrolled"),
      value: String(s.totalEnrolled),
      unit: t("students"),
      icon: <Users aria-hidden className="size-3.5" />,
      left: t("{count} classes", { count: activeClass ? 1 : d.classes.length }),
      right: "",
      rightTone: "teal",
    },
    {
      label: t("Weekly Active"),
      value: String(s.weeklyActive),
      unit: `/${s.totalEnrolled}`,
      icon: <Activity aria-hidden className="size-3.5" />,
      left: s.totalEnrolled ? `${Math.round((s.weeklyActive * 100) / s.totalEnrolled)}%` : "—",
      right: t("last 7 days"),
      rightTone: "muted",
    },
    {
      label: t("Due This Week"),
      value: String(s.dueThisWeek),
      unit: t("assignments"),
      icon: <CalendarClock aria-hidden className="size-3.5" />,
      left: nextDue?.title ?? t("Nothing due"),
      right: nextDue ? new Date(nextDue.dateUtc).toLocaleDateString(dateLocale(), { weekday: "short" }) : "",
      rightTone: "danger",
    },
    {
      label: t("Class Avg Score"),
      value: s.averageScore === null ? "—" : `${s.averageScore}%`,
      unit: "",
      icon: <BarChart3 aria-hidden className="size-3.5" />,
      left: s.averageScore === null ? t("No grades yet") : t("Graded work"),
      right: t("Benchmark 80%"),
      rightTone: "muted",
    },
    {
      label: t("Planned Lessons"),
      value: String(s.plannedLessons),
      unit: t("lessons"),
      icon: <BookOpen aria-hidden className="size-3.5" />,
      left: t("Weekly plans"),
      right: "",
      rightTone: "muted",
    },
    {
      label: t("Needs Focus"),
      value: String(s.needsFocus),
      unit: t("students"),
      icon: <CircleAlert aria-hidden className="size-3.5" />,
      left: s.needsFocus ? t("Action Required") : t("All good"),
      right: "",
      tone: s.needsFocus ? "danger" : "default",
    },
  ];

  const counts = {
    all: d.alerts.length,
    blockers: d.alerts.filter((a) => GROUP_OF[a.kind] === "blockers").length,
    admin: d.alerts.filter((a) => GROUP_OF[a.kind] === "admin").length,
  };
  const filters: { key: "all" | Group; label: string }[] = [
    { key: "all", label: t("All") },
    { key: "blockers", label: t("Blockers") },
    { key: "admin", label: t("Follow-up") },
  ];
  const visibleAlerts = d.alerts.filter((a) => filter === "all" || GROUP_OF[a.kind] === filter);
  const classIdOf = (name: string) => d.classes.find((c) => c.name === name)?.id ?? "";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide">
            <span className="flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-0.5 text-[#14757d]">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#14757d]" />
              <span className="relative top-[1px]">{t("Teacher workspace")}</span>
            </span>
            <span className="text-[#1B2D54]/70">{t("{count} classes", { count: d.classes.length })}</span>
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            {greeting(t, d.teacher.firstName)} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Here is what is happening across your classes this week")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-[#e3ece9]">
            <button
              type="button"
              onClick={() => setActiveClass(null)}
              aria-pressed={activeClass === null}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
                activeClass === null ? "bg-[#1B2D54] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10",
              )}
            >
              {t("All Classes")} ({total})
            </button>
            {d.classes.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveClass(c.id)}
                aria-pressed={activeClass === c.id}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
                  activeClass === c.id ? "bg-[#1B2D54] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10",
                )}
              >
                {t("Class {name}", { name: c.name })}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <Plus aria-hidden className="size-3.5" />
            {t("Quick Assignment")}
          </button>
        </div>
      </header>

      {d.classes.length === 0 && (
        <Card className="text-center text-[11px] text-[#1B2D54]/70">{t("No classes yet. Ask the school admin to link your classes.")}</Card>
      )}

      <DragRow>
        {stats.map((st) => (
          <StatCard key={st.label} stat={st} />
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
                {t("Needs Attention")}
                {counts.blockers > 0 && (
                  <span className="rounded bg-[#fde8e8] px-1.5 py-0.5 text-[9px] font-semibold text-[#e5484d]">
                    {t("{count} Urgent", { count: counts.blockers })}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("Missed deadlines, low scores, inactive students and join requests")}</p>
            </div>
          </div>

          <div role="tablist" className="flex items-center gap-1.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                role="tab"
                aria-selected={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full px-3 py-1 text-[10px] font-semibold transition-colors",
                  filter === f.key ? "bg-[#14757d] text-white" : "bg-[#eef2f1] text-[#1B2D54] hover:bg-[#dfe9e7]",
                )}
              >
                {f.label} ({counts[f.key]})
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleAlerts.map((a) => (
            <AlertCard key={`${a.kind}-${a.studentId}-${a.assignmentId ?? a.classId}`} alert={a} onChanged={dashboard.reload} />
          ))}
          {visibleAlerts.length === 0 && (
            <p className="text-[11px] text-[#1B2D54]/60 md:col-span-2 xl:col-span-3">{t("Nothing needs your attention right now.")}</p>
          )}
          {filter !== "blockers" && <QuestionsCard questions={d.questions} />}
        </div>
      </Card>

      {/* ---------------- Class progress ---------------- */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">{t("Class Progress & Completion")}</h2>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("Submissions of the work due so far, and who is on track")}</p>
          </div>
          <Link href={"/teacher/classes" as Route} className="flex items-center gap-1 text-[10px] font-semibold text-[#14757d] hover:underline">
            {t("Detailed Class Breakdown")}
            <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {d.classProgress.map((c) => (
            <div key={c.classId} className="rounded-xl border border-[#e3ece9] bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#14757d] text-[10px] font-bold text-white">{c.name}</span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-xs font-semibold">{t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}</p>
                  <p className="mt-0.5 truncate text-[10px] text-[#1B2D54]/60">
                    {t("This week")}: <span className="font-semibold text-[#1B2D54]">{c.currentPlan ?? t("No lesson planned")}</span>
                  </p>
                </div>
                <span className="hidden shrink-0 rounded-full bg-[#c9efe9] px-2 py-0.5 text-[9px] font-semibold text-[#14757d] sm:inline">
                  {t("{onTrack}/{total} on track", { onTrack: c.onTrack, total: c.students })}
                </span>
                <span dir="ltr" className="shrink-0 text-sm font-bold">
                  {c.percent}%
                </span>
              </div>

              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={c.percent}
              >
                <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${c.percent}%` }} />
              </div>

              <div className="mt-2 flex items-center justify-between text-[9px] text-[#1B2D54]/60">
                <span>
                  {t("Next")}: {c.nextAssignment ?? t("No assignment due")}
                </span>
                {c.nextDueUtc && <span className="font-semibold">{t("Due {date}", { date: formatDate(c.nextDueUtc) })}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card className="p-5">
          <div className="leading-tight">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <CircleHelp aria-hidden className="size-4 text-[#14757d]" />
              {t("Hardest Assignments")}
            </h2>
            <p className="mt-1 ps-6 text-[10px] text-[#1B2D54]/60">{t("The graded work with the lowest average score")}</p>
          </div>

          {d.hardest.length === 0 ? (
            <p className="mt-4 text-[11px] text-[#1B2D54]/60">{t("Grade some work to see where students struggle.")}</p>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {d.hardest.map((m) => {
                const danger = m.averagePercent < 60;
                return (
                  <div key={m.assignmentId} className="flex min-w-0 flex-col gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
                    <div className="flex items-center justify-between gap-2 text-[9px]">
                      <span className="font-semibold uppercase text-[#14757d]">{t("Class {name}", { name: m.className })}</span>
                      <span className={cn("rounded-full px-2 py-0.5 font-semibold", danger ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#9be9ef] text-[#14757d]")}>
                        {t("{graded} graded", { graded: m.graded })}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug">{m.title}</p>
                    <div className="rounded-lg border border-[#e3ece9] bg-white px-3 py-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#1B2D54]/60">{t("Average score")}</span>
                        <span dir="ltr" className={cn("font-semibold", danger ? "text-[#c81e1e]" : "text-[#14757d]")}>
                          {m.averagePercent}%
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]">
                        <div className={cn("h-full rounded-full", danger ? "bg-[#c81e1e]" : "bg-[#14757d]")} style={{ width: `${m.averagePercent}%` }} />
                      </div>
                    </div>
                    <div className="mt-auto flex gap-2">
                      <ActionButton label={t("Review Problem")} variant="dark" />
                      <ActionButton label={t("Class Error Matrix")} variant="secondary" href={`/teacher/classes?class=${classIdOf(m.className)}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Class schedule */}
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarDays aria-hidden className="size-4 text-[#14757d]" />
            {t("Class Schedule")}
          </h2>

          {d.schedule.length === 0 ? (
            <p className="text-[11px] text-[#1B2D54]/60">{t("Nothing scheduled in the next two weeks.")}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {d.schedule.map((s, i) => {
                const date = new Date(s.dateUtc);
                return (
                  <li key={`${s.kind}-${s.title}-${s.dateUtc}`} className="flex min-w-0 items-start gap-3">
                    <span
                      className={cn(
                        "flex w-11 shrink-0 flex-col items-center rounded-xl py-1.5 leading-none",
                        i === 0 ? "bg-[#1B2D54] text-white" : "bg-[#eef2f1] text-[#1B2D54]",
                      )}
                    >
                      <span className={cn("text-[8px] font-semibold uppercase", i === 0 ? "text-white/70" : "text-[#1B2D54]/50")}>
                        {date.toLocaleDateString(dateLocale(), { weekday: "short" })}
                      </span>
                      <span className="mt-1 text-base font-bold">{date.getDate()}</span>
                    </span>

                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[11px] font-semibold">{s.title}</p>
                        {s.kind === "Due" && (
                          <span className="shrink-0 text-[10px] font-semibold text-[#c81e1e]">
                            {date.toLocaleTimeString(dateLocale(), { hour: "numeric", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-[9px] text-[#1B2D54]/60">{t("Class {name}", { name: s.className })}</p>
                      <p className={cn("mt-1 flex items-center gap-1 text-[9px] font-semibold", s.kind === "Due" ? "text-[#c81e1e]" : "text-[#14757d]")}>
                        <span aria-hidden className={cn("size-1.5 rounded-full", s.kind === "Due" ? "bg-[#c81e1e]" : "bg-[#14757d]")} />
                        {s.kind === "Due" ? t("Assignment due") : t("Lesson planned this week")}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            type="button"
            className="mt-auto rounded-xl bg-[#eef2f1] px-3 py-2.5 text-[11px] font-semibold transition-colors hover:bg-[#dfe9e7]"
          >
            + {t("Schedule Office Hour or Review")}
          </button>
        </Card>
      </div>

    </div>
  );
}
