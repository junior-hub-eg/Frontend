"use client";
import { Suspense, useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  AlarmClock,
  ArrowRight,
  BellRing,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Clock,
  FileText,
  Gauge,
  Inbox,
  ListChecks,
  LoaderCircle,
  Medal,
  PlusCircle,
  TimerReset,
  TriangleAlert,
  Users,
} from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import {
  changeDue,
  getAssignment,
  getTeacherAssignments,
  getTeacherClasses,
  nudgeStudent,
  type Assignment,
  type AssignmentDetail,
} from "@/lib/teacher-api";
import { Card, LoadBlock, StudentAvatar, SUBJECT_LABEL, formatDate, useTeacherData } from "@/components/teacher/teacher-ui";
import { QuickAssignmentDialog } from "@/components/teacher/teacher-dialogs";
import { GradingForm } from "@/components/teacher/assignments/grading-form";
import { cn } from "@/lib/utils";

type Student = AssignmentDetail["students"][number];
type PipelineTab = "active" | "upcoming" | "past";

const PIPELINE_TABS: { key: PipelineTab; label: string }[] = [
  { key: "active", label: tk("Active") },
  { key: "upcoming", label: tk("Upcoming") },
  { key: "past", label: tk("Past") },
];

const HOUR = 3600e3;
const DAY = 24 * HOUR;

const hasSubmitted = (s: Student) => s.submittedUtc != null;
const isGraded = (s: Student) => s.status === "Graded" || s.score != null;

/** Upcoming: not open yet. Active: open and not due yet, or still has work to grade. Past: the rest. */
function tabOf(a: Assignment, now: number): PipelineTab {
  if (Date.parse(a.openUtc) > now) return "upcoming";
  if (Date.parse(a.dueUtc) > now || a.submitted > a.graded) return "active";
  return "past";
}

/** Keeps numbers in the right order inside Arabic text. */
function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

function SmallButton({ tone, children, onClick, disabled }: { tone: "white" | "teal" | "gray"; children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40 disabled:opacity-60",
        tone === "white" && "bg-white text-[#14243f] shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]",
        tone === "teal" && "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
        tone === "gray" && "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]",
      )}
    >
      {children}
    </button>
  );
}

function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

const startOfDay = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Submissions per day over the last (up to) 7 days before the due date, plus late work after it. */
function submissionBuckets(a: AssignmentDetail) {
  const due = Date.parse(a.dueUtc);
  const dueDay = startOfDay(due);
  const first = Math.max(startOfDay(Date.parse(a.openUtc)), dueDay - 6 * DAY);
  const days: { label: string; count: number; due?: boolean; late?: boolean }[] = [];
  for (let d = first; d <= dueDay; d += DAY) {
    days.push({
      label: new Date(d).toLocaleDateString(dateLocale("en-GB"), { weekday: "short", day: "numeric" }),
      count: 0,
      due: d === dueDay,
    });
  }
  let late = 0;
  for (const s of a.students) {
    if (!s.submittedUtc) continue;
    const at = Date.parse(s.submittedUtc);
    if (at > due) late++;
    else days[Math.max(0, Math.round((startOfDay(at) - first) / DAY))].count++;
  }
  if (late) days.push({ label: tk("After due"), count: late, late: true });
  return days;
}

function SubmissionChart({ detail }: { detail: AssignmentDetail }) {
  const t = useT();
  const buckets = submissionBuckets(detail);
  const n = Math.max(buckets.length, 2);
  const W = 900;
  const H = 150;
  const top = Math.max(1, ...buckets.map((b) => b.count));
  const x = (i: number) => ((i + 0.5) * W) / n;
  const y = (v: number) => H - (v / top) * (H - 12);
  const values = buckets.length === 1 ? [buckets[0].count, buckets[0].count] : buckets.map((b) => b.count);
  const pts = values.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const peak = buckets.reduce((best, b, i) => (b.count > buckets[best].count ? i : best), 0);
  const total = buckets.reduce((s, b) => s + b.count, 0);

  if (total === 0) {
    return <p className="rounded-xl bg-[#f1f4f4] p-6 text-center text-[11px] text-[#1B2D54]/60">{t("No submissions yet for this assignment.")}</p>;
  }

  return (
    <div dir="ltr">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-36 w-full overflow-visible" role="img" aria-label={t("Submissions per day")} preserveAspectRatio="none">
          <defs>
            <linearGradient id="velocity-fill-a" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b6b70" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0b6b70" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2={W} y1={(i * H) / 3} y2={(i * H) / 3} stroke="#e3ece9" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          <path d={area} fill="url(#velocity-fill-a)" />
          <path d={line} fill="none" stroke="#0b6b70" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        </svg>
        {buckets.map((b, i) => (
          <span
            key={i}
            aria-hidden
            title={String(b.count)}
            className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white"
            style={{ left: `${((i + 0.5) / n) * 100}%`, top: `${(y(b.count) / H) * 100}%`, backgroundColor: b.late ? "#c81e1e" : i === peak ? "#14243f" : "#0b6b70" }}
          />
        ))}
      </div>
      <div className="mt-2 grid text-center text-[9px] text-[#1B2D54]/60" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {buckets.map((b, i) => (
          <span key={i} dir="auto" className={cn("truncate", (i === peak || b.due) && "font-bold text-[#14243f]", b.late && "font-bold text-[#c81e1e]")}>
            {b.late ? t(b.label) : b.label}
            <span className="block">
              {b.count}
              {b.due ? ` • ${t("Due")}` : ""}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AssignmentsPage() {
  return (
    <Suspense fallback={null}>
      <Assignments />
    </Suspense>
  );
}

function Assignments() {
  const t = useT();
  const params = useSearchParams();
  const [classFilter, setClassFilter] = useState("");
  const [chosenAssignment, setChosenAssignment] = useState<string | null>(params.get("assignment"));
  const [chosenStudent, setChosenStudent] = useState<string | null>(params.get("student"));
  const [briefOpen, setBriefOpen] = useState(true);
  const [pipelineTab, setPipelineTab] = useState<PipelineTab | null>(null);
  const [creating, setCreating] = useState(false);
  const [nudged, setNudged] = useState<Record<string, "busy" | "sent">>({});
  const [extending, setExtending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const classes = useTeacherData(getTeacherClasses, tk("We couldn't load your classes. Please try again."));
  const loadList = useCallback(() => getTeacherAssignments(classFilter || undefined), [classFilter]);
  const list = useTeacherData(loadList, tk("We couldn't load your assignments. Please try again."));
  const assignments = useMemo(() => list.data ?? [], [list.data]);

  const byTab = useMemo(() => {
    const out: Record<PipelineTab, Assignment[]> = { active: [], upcoming: [], past: [] };
    for (const a of assignments) out[tabOf(a, now)].push(a);
    out.active.sort((a, b) => Date.parse(a.dueUtc) - Date.parse(b.dueUtc));
    out.upcoming.sort((a, b) => Date.parse(a.openUtc) - Date.parse(b.openUtc));
    out.past.sort((a, b) => Date.parse(b.dueUtc) - Date.parse(a.dueUtc));
    return out;
  }, [assignments, now]);

  const fallbackId = (byTab.active.find((a) => a.submitted > a.graded) ?? byTab.active[0] ?? byTab.past[0] ?? byTab.upcoming[0])?.id ?? null;
  const assignmentId = chosenAssignment && (assignments.some((a) => a.id === chosenAssignment) || !classFilter) ? chosenAssignment : fallbackId;
  const summary = assignments.find((a) => a.id === assignmentId) ?? null;
  const tab = pipelineTab ?? (summary ? tabOf(summary, now) : "active");

  const loadDetail = useCallback((): Promise<AssignmentDetail | null> => (assignmentId ? getAssignment(assignmentId) : Promise.resolve(null)), [assignmentId]);
  const detailState = useTeacherData(loadDetail, tk("We couldn't load this assignment. Please try again."));
  const detail = detailState.data && detailState.data.id === assignmentId ? detailState.data : null;

  const submitted = useMemo(
    () => (detail?.students ?? []).filter(hasSubmitted).sort((a, b) => Date.parse(a.submittedUtc!) - Date.parse(b.submittedUtc!)),
    [detail],
  );
  const waiting = (detail?.students ?? []).filter((s) => !hasSubmitted(s));
  const studentId =
    chosenStudent && submitted.some((s) => s.studentId === chosenStudent)
      ? chosenStudent
      : (submitted.find((s) => !isGraded(s)) ?? submitted[0])?.studentId ?? null;
  const studentIndex = submitted.findIndex((s) => s.studentId === studentId);
  const student = studentIndex >= 0 ? submitted[studentIndex] : null;
  const gradedCount = submitted.filter(isGraded).length;

  // ---------- Stats ----------
  const opened = assignments.filter((a) => Date.parse(a.openUtc) <= now);
  const toGrade = opened.reduce((s, a) => s + Math.max(0, a.submitted - a.graded), 0);
  const toGradeAssignments = opened.filter((a) => a.submitted > a.graded).length;
  const closed = opened.filter((a) => Date.parse(a.dueUtc) <= now);
  const closedEnrolled = closed.reduce((s, a) => s + a.enrolled, 0);
  const submittedRate = closedEnrolled ? Math.round((closed.reduce((s, a) => s + a.submitted, 0) / closedEnrolled) * 100) : null;
  const onTime = detail ? detail.students.filter((s) => s.submittedUtc && Date.parse(s.submittedUtc) <= Date.parse(detail.dueUtc)).length : 0;
  const onTimeRate = detail && detail.students.length ? Math.round((onTime / detail.students.length) * 100) : null;
  const gradedTotal = assignments.reduce((s, a) => s + (a.averagePercent != null ? a.graded : 0), 0);
  const average = gradedTotal ? Math.round((assignments.reduce((s, a) => s + (a.averagePercent ?? 0) * (a.averagePercent != null ? a.graded : 0), 0) / gradedTotal) * 10) / 10 : null;
  const next = [...assignments].filter((a) => Date.parse(a.dueUtc) > now && Date.parse(a.openUtc) <= now).sort((a, b) => Date.parse(a.dueUtc) - Date.parse(b.dueUtc))[0];

  const stats = [
    {
      label: t("Submissions to Grade"),
      value: String(toGrade),
      text: t("Waiting for your score"),
      note: toGrade ? t("In {n} assignments", { n: toGradeAssignments }) : t("All caught up"),
      tone: toGrade ? "red" : "teal",
      noteIcon: toGrade ? <CircleAlert aria-hidden className="size-4 shrink-0" /> : <CircleCheck aria-hidden className="size-4 shrink-0" />,
      iconBox: "bg-[#eef0f2] text-[#14243f]",
      icon: <ClipboardCheck aria-hidden className="size-4" />,
    },
    {
      label: t("On-time Rate"),
      value: onTimeRate != null ? `${onTimeRate}%` : "–",
      text: detail ? t("Submitted on time: {title}", { title: detail.title }) : t("Choose an assignment"),
      note: submittedRate != null ? t("{pct}% of closed work handed in", { pct: submittedRate }) : t("No closed assignments yet"),
      tone: "teal",
      noteIcon: <Gauge aria-hidden className="size-4 shrink-0" />,
      iconBox: "bg-[#eef0f2] text-[#14243f]",
      icon: <Gauge aria-hidden className="size-4" />,
    },
    {
      label: t("Class Average Score"),
      value: average != null ? String(average) : "–",
      suffix: "/ 100",
      text: t("Across all graded work"),
      note: t("{n} graded submissions", { n: gradedTotal }),
      tone: "teal",
      noteIcon: <CircleCheck aria-hidden className="size-4 shrink-0" />,
      iconBox: "bg-[#eef0f2] text-[#14243f]",
      icon: <Medal aria-hidden className="size-4" />,
    },
    {
      label: t("Next Deadline"),
      value: next ? next.title : t("None"),
      wide: true,
      text: next ? t("Due {date} • {name}", { date: formatDate(next.dueUtc, true), name: next.className }) : t("No open assignments are due."),
      note: next ? t("{n} late or missing", { n: Math.max(0, next.enrolled - next.submitted) }) : "",
      tone: "red",
      noteIcon: <span aria-hidden className="mx-1 size-1.5 shrink-0 rounded-full bg-[#c81e1e]" />,
      iconBox: "bg-[#fde8e8] text-[#c81e1e]",
      icon: <AlarmClock aria-hidden className="size-4" />,
    },
  ];

  function pickAssignment(id: string) {
    setChosenAssignment(id);
    setChosenStudent(null);
    setActionError(null);
  }

  function nextStudent() {
    if (!submitted.length) return;
    setChosenStudent(submitted[(studentIndex + 1) % submitted.length].studentId);
  }

  function graded(d: AssignmentDetail) {
    detailState.setData(d);
    void list.reload();
    const done = d.students.filter(hasSubmitted);
    const after = [...done.slice(studentIndex + 1), ...done.slice(0, studentIndex + 1)];
    const nextUngraded = after.find((s) => !isGraded(s));
    if (nextUngraded) setChosenStudent(nextUngraded.studentId);
  }

  async function extend() {
    if (!detail) return;
    setExtending(true);
    setActionError(null);
    try {
      detailState.setData(await changeDue(detail.id, new Date(Date.parse(detail.dueUtc) + DAY).toISOString()));
      void list.reload();
    } catch (e) {
      setActionError(errorMessage(e, tk("We couldn't change the due date. Please try again.")));
    } finally {
      setExtending(false);
    }
  }

  async function remind(id: string) {
    if (!detail) return;
    setNudged((n) => ({ ...n, [id]: "busy" }));
    setActionError(null);
    try {
      await nudgeStudent(id, "Reminder", detail.id);
      setNudged((n) => ({ ...n, [id]: "sent" }));
    } catch (e) {
      setNudged((n) => {
        const rest = { ...n };
        delete rest[id];
        return rest;
      });
      setActionError(errorMessage(e, tk("We couldn't send the reminder. Please try again.")));
    }
  }

  const pipeline = byTab[tab];
  const crumbs = [t("Assignments"), ...(detail ? [t("Class {name}", { name: detail.className }), detail.title] : [])];

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* Sky background: only the top part, fading into white */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      {/* ---------------- Hero ---------------- */}
      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <nav aria-label={t("Breadcrumb")} className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-[#14243f]">
            {crumbs.map((b, i) => (
              <span key={i} dir="auto" className="flex min-w-0 items-center gap-1.5">
                <span className="truncate">{b}</span>
                {i < crumbs.length - 1 && <ChevronRight aria-hidden className="size-3 shrink-0 rtl:rotate-180" />}
              </span>
            ))}
          </nav>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 rounded-full bg-[#bff3f3]/80 px-3 py-1.5 text-[11px] font-semibold text-[#0b6b70] shadow-sm">
              <span aria-hidden className="size-2 rounded-full bg-[#0b6b70]" />
              {t("{n} active assignments", { n: byTab.active.length })}
            </span>
            {detail && (
              <span className="flex items-center gap-2 rounded-full bg-[#E6E8EA] px-3 py-1.5 text-[11px] font-semibold text-[#14243f] shadow-sm">
                <Users aria-hidden className="size-3.5" />
                {t("Grading queue: {n} to grade", { n: submitted.length - gradedCount })}
              </span>
            )}
          </div>

          <h1 className="mt-3 text-[28px] font-bold leading-tight text-[#0f1f3d]">{t("Assignments & Grading")}</h1>
          <p className="mt-1.5 max-w-[34rem] text-[13px] leading-snug text-[#1B2D54]/75">
            {t("Review your students' work, give each one a score and feedback, and keep every class on schedule.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[11px] font-semibold text-[#14243f] shadow-sm ring-1 ring-[#e3ece9]">
            <span className="sr-only">{t("Class")}</span>
            <Users aria-hidden className="size-3.5 shrink-0" />
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPipelineTab(null);
              }}
              className="h-7 max-w-[11rem] bg-transparent outline-none"
            >
              <option value="">{t("All classes")}</option>
              {(classes.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}
                </option>
              ))}
            </select>
          </label>
          <SmallButton tone="teal" onClick={() => setCreating(true)}>
            <PlusCircle aria-hidden className="size-3.5" />
            {t("Create Assignment")}
          </SmallButton>
        </div>
      </header>

      {creating && <QuickAssignmentDialog defaults={{ classId: classFilter || undefined }} onClose={() => setCreating(false)} onCreated={() => void list.reload()} />}

      {!list.data ? (
        <LoadBlock error={list.error} onRetry={list.reload} />
      ) : assignments.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <Inbox aria-hidden className="size-8 text-[#0b6b70]" />
          <p className="text-sm font-bold">{t("No assignments yet")}</p>
          <p className="max-w-sm text-[12px] text-[#1B2D54]/70">{t("Create an assignment for one of your classes. Their submissions will show up here for grading.")}</p>
          <SmallButton tone="teal" onClick={() => setCreating(true)}>
            <PlusCircle aria-hidden className="size-3.5" />
            {t("Create Assignment")}
          </SmallButton>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="flex min-h-[12.5rem] min-w-0 flex-col gap-3 rounded-2xl border-0 p-4 shadow-[0_6px_24px_rgba(20,54,90,0.08)] sm:p-6">
                <div className="flex items-center justify-start gap-3">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5", s.iconBox)}>{s.icon}</span>
                  <p className="max-w-[9rem] text-start text-[11px] font-semibold uppercase leading-tight tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                    {s.label}
                  </p>
                </div>
                <p className="mt-1 flex min-w-0 items-baseline gap-2">
                  {s.wide ? (
                    <span dir="auto" className="line-clamp-2 block w-full text-start text-[1.35rem] font-bold leading-tight text-[#14243f]">
                      {s.value}
                    </span>
                  ) : (
                    <Ltr className="text-4xl font-bold leading-none text-[#14243f]">{s.value}</Ltr>
                  )}
                  {s.suffix && <Ltr className="text-sm text-[#1B2D54]/60">{s.suffix}</Ltr>}
                </p>
                <p dir="auto" className="line-clamp-2 text-start text-[13px] text-[#1B2D54]/75">
                  {s.text}
                </p>
                {s.note && (
                  <p className={cn("mt-auto flex items-center gap-1.5 text-[11px] font-semibold", s.tone === "red" ? "text-[#c81e1e]" : "text-[#0b6b70]")}>
                    {s.noteIcon}
                    {s.note}
                  </p>
                )}
              </Card>
            ))}
          </div>

          <div className="grid min-w-0 items-start gap-6 xl:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-4 xl:col-span-8">
              {!detail ? (
                <LoadBlock error={detailState.error} onRetry={detailState.reload} />
              ) : (
                <>
                  {/* Student strip */}
                  {submitted.length > 0 && (
                    <Card className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-0 bg-[#f1f4f7] px-5 py-3 shadow-none">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#bff3f3] text-xs font-bold text-[#0b6b70]">
                          <Ltr>{studentIndex + 1}</Ltr>
                        </span>
                        <div className="leading-tight">
                          <p className="text-[13px] font-semibold">{t("Student {n} of {total}", { n: studentIndex + 1, total: submitted.length })}</p>
                          <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">
                            {t("{pct}% of submissions graded", { pct: Math.round((gradedCount / submitted.length) * 100) })}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 max-w-full items-center gap-2">
                        <div className="flex min-w-0 gap-2 overflow-x-auto pb-0.5">
                          {submitted.map((s) => {
                            const selected = s.studentId === studentId;
                            return (
                              <button
                                key={s.studentId}
                                type="button"
                                onClick={() => setChosenStudent(s.studentId)}
                                aria-pressed={selected}
                                className={cn(
                                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[10px] font-semibold transition-colors",
                                  selected ? "bg-[#14243f] text-white" : "bg-white text-[#14243f] ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]",
                                )}
                              >
                                {selected ? (
                                  <span aria-hidden className="size-1.5 rounded-full bg-[#4da3ff]" />
                                ) : isGraded(s) ? (
                                  <CircleCheck aria-hidden className="size-3.5 text-[#0b6b70]" />
                                ) : (
                                  <span aria-hidden className="size-1.5 rounded-full bg-[#f5a524]" />
                                )}
                                <bdi>{s.fullName}</bdi>
                                {selected ? (
                                  <span className="font-normal">({t("Grading")})</span>
                                ) : isGraded(s) ? (
                                  <Ltr className="text-[#1B2D54]/60">{s.score}</Ltr>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          aria-label={t("Next student")}
                          onClick={nextStudent}
                          className="grid size-7 shrink-0 place-items-center rounded-full bg-white ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8]"
                        >
                          <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
                        </button>
                      </div>
                    </Card>
                  )}

                  <Card className="flex min-w-0 flex-col gap-5 p-4 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {student ? (
                        <div className="flex min-w-0 items-center gap-3">
                          <StudentAvatar name={student.fullName} photoUrl={student.photoUrl} gender={student.gender} size={48} />
                          <div className="min-w-0 leading-tight">
                            <h2 dir="auto" className="text-start text-lg font-bold">
                              {student.fullName}
                            </h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="flex items-start gap-1.5 text-[11px] leading-snug text-[#1B2D54]/70">
                                <Clock aria-hidden className="mt-0.5 size-3 shrink-0 text-[#0b6b70]" />
                                <span>
                                  {t("Submitted {date}", { date: formatDate(student.submittedUtc!, true) })} •{" "}
                                  {Date.parse(student.submittedUtc!) <= Date.parse(detail.dueUtc) ? (
                                    t("On time")
                                  ) : (
                                    <span className="font-semibold text-[#c81e1e]">{t("Late")}</span>
                                  )}
                                </span>
                              </span>
                              <span dir="auto" className="shrink-0 whitespace-nowrap rounded-md bg-[#bff3f3] px-2 py-0.5 text-[9px] font-semibold text-[#0b6b70]">
                                {t("Class {name}", { name: detail.className })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#eef0f2] text-[#1B2D54]/60">
                            <Inbox aria-hidden className="size-5" />
                          </span>
                          <div className="leading-tight">
                            <h2 className="text-lg font-bold">{t("No submissions yet")}</h2>
                            <p className="mt-1 text-[11px] text-[#1B2D54]/70">{t("Students' answers will appear here once they hand in their work.")}</p>
                          </div>
                        </div>
                      )}

                      {/* Assignment card */}
                      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2 rounded-xl bg-[#f1f4f4] px-4 py-3">
                        <FileText aria-hidden className="size-5 shrink-0 text-[#1B2D54]/70" />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p dir="auto" className="truncate text-start text-[10px] font-semibold">
                            {detail.title}
                          </p>
                          <p className="mt-0.5 text-[9px] text-[#1B2D54]/60">
                            {t("Due {date} • {max} points", { date: formatDate(detail.dueUtc, true), max: detail.maxPoints })}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={extend}
                          disabled={extending}
                          className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-[11px] font-semibold shadow-sm ring-1 ring-[#e3ece9] hover:bg-[#f6f9f8] disabled:opacity-60"
                        >
                          {extending ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : <TimerReset aria-hidden className="size-3.5" />}
                          {t("Extend +24h")}
                        </button>
                      </div>
                    </div>

                    {actionError && (
                      <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[11px] font-semibold text-[#c81e1e]">
                        {actionError}
                      </p>
                    )}

                    <div className="rounded-xl bg-[#f1f4f4] p-4">
                      <button
                        type="button"
                        onClick={() => setBriefOpen((o) => !o)}
                        aria-expanded={briefOpen}
                        className="flex w-full items-center justify-between gap-2 text-start"
                      >
                        <span className="flex items-center gap-2 text-[11px] font-bold text-[#14243f]">
                          <ListChecks aria-hidden className="size-4 text-[#0b6b70]" />
                          {t("Assignment Instructions")}
                          <span className="font-normal text-[#1B2D54]/60">• {t(SUBJECT_LABEL[detail.subject])}</span>
                        </span>
                        <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", briefOpen && "rotate-180")} />
                      </button>
                      {briefOpen && (
                        <p dir="auto" className="mt-2 whitespace-pre-wrap ps-6 text-start text-[12px] leading-relaxed text-[#1B2D54]/75">
                          {detail.instructions?.trim() || t("No instructions were added to this assignment.")}
                        </p>
                      )}
                    </div>

                    {student && (
                      <>
                        <div>
                          <h3 className="flex items-center gap-2 text-sm font-bold">
                            <FileText aria-hidden className="size-5 text-[#0b6b70]" />
                            {t("Student Answer")}
                          </h3>
                          <p
                            dir="auto"
                            className="mt-3 whitespace-pre-wrap break-words rounded-xl border border-[#e3ece9] p-4 text-start text-[12px] leading-relaxed"
                          >
                            {student.answer?.trim() || <span className="text-[#1B2D54]/50">{t("The student handed in without writing an answer.")}</span>}
                          </p>
                        </div>

                        <GradingForm
                          key={`${detail.id}.${student.studentId}`}
                          assignment={detail}
                          student={student}
                          onGraded={graded}
                          onNext={nextStudent}
                        />
                      </>
                    )}
                  </Card>
                </>
              )}
            </div>

            {/* ================= Right: review pipeline ================= */}
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-4">
              <Card className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold">{t("Review Pipeline")}</h2>
                  <span className="rounded-full bg-[#bff3f3] px-2.5 py-1 text-[10px] font-semibold text-[#0b6b70]">
                    <bdi>{t("{n} to grade", { n: toGrade })}</bdi>
                  </span>
                </div>

                <div role="tablist" className="mt-4 flex items-center gap-0.5 rounded-lg bg-[#f1f4f4] p-0.5">
                  {PIPELINE_TABS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      role="tab"
                      aria-selected={tab === p.key}
                      onClick={() => setPipelineTab(p.key)}
                      className={cn(
                        "flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold transition-colors",
                        tab === p.key ? "bg-white text-[#14243f] shadow-sm" : "text-[#1B2D54]/60 hover:text-[#1B2D54]",
                      )}
                    >
                      {t(p.label)}
                      <bdi>{` (${byTab[p.key].length})`}</bdi>
                    </button>
                  ))}
                </div>

                <ul className="mt-4 flex max-h-[44rem] flex-col gap-5 overflow-y-auto">
                  {pipeline.length === 0 && <li className="rounded-xl bg-[#f1f4f4] p-6 text-center text-[11px] text-[#1B2D54]/60">{t("Nothing here yet.")}</li>}

                  {pipeline.map((a) => {
                    const selected = a.id === assignmentId;
                    const pct = a.enrolled ? Math.round((a.submitted / a.enrolled) * 100) : 0;
                    const due = Date.parse(a.dueUtc);
                    const missing = Math.max(0, a.enrolled - a.submitted);
                    const dueSoon = due > now && due - now < 48 * HOUR;
                    const ungraded = a.submitted - a.graded;
                    const badge =
                      tab === "upcoming"
                        ? { text: t("Opens {date}", { date: formatDate(a.openUtc) }), tone: "navy" }
                        : dueSoon
                          ? { text: t("Due soon"), tone: "red" }
                          : ungraded > 0
                            ? { text: t("{n} to grade", { n: ungraded }), tone: "green" }
                            : due <= now
                              ? { text: t("Closed"), tone: "navy" }
                              : { text: t("Open"), tone: "green" };
                    return (
                      <li
                        key={a.id}
                        className={cn("rounded-xl p-4", selected ? "border border-[#e3ece9] border-s-4 border-s-[#0b6b70] bg-white shadow-sm" : "bg-white ring-1 ring-[#eef0f2]")}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate text-[9px] font-semibold uppercase text-[#1B2D54]/60 rtl:normal-case">
                            {t("Class {name}", { name: a.className })} • {t(SUBJECT_LABEL[a.subject])}
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded px-2 py-0.5 text-[9px] font-semibold",
                              badge.tone === "red" && "bg-[#fde8e8] text-[#c81e1e]",
                              badge.tone === "green" && "bg-[#d4f5f5] text-[#0b6b70]",
                              badge.tone === "navy" && "bg-[#eef0f2] text-[#14243f]",
                            )}
                          >
                            {badge.text}
                          </span>
                        </div>

                        <p dir="auto" className="mt-2 text-start text-sm font-bold leading-snug">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">{t("Due {date}", { date: formatDate(a.dueUtc, true) })}</p>

                        <div className="mt-3 flex items-center justify-between text-[10px]">
                          <span className="text-[#1B2D54]/70">
                            <Ltr>{pct}%</Ltr> {t("Submitted")}
                          </span>
                          <span className="font-bold">{t("{x} of {y} students", { x: a.submitted, y: a.enrolled })}</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#e3ece9]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                          <div className={cn("h-full rounded-full", selected ? "bg-[#0b6b70]" : "bg-[#14243f]")} style={{ width: `${pct}%` }} />
                        </div>

                        {a.submitted > 0 && (
                          <p className="mt-2 text-end text-[10px] font-semibold text-[#0b6b70]">
                            {t("{x} of {y} graded", { x: a.graded, y: a.submitted })}
                            {a.averagePercent != null && ` • ${t("Average {pct}%", { pct: Math.round(a.averagePercent) })}`}
                          </p>
                        )}

                        {dueSoon && missing > 0 && (
                          <p className="mt-3 flex items-start gap-2 rounded-lg border border-[#f7caca] bg-[#fdecec] p-3 text-[10px] font-semibold leading-snug text-[#c81e1e]">
                            <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
                            {t("{n} students have not submitted yet. Due {date}.", { n: missing, date: formatDate(a.dueUtc, true) })}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={() => pickAssignment(a.id)}
                          aria-pressed={selected}
                          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#eef0f2] px-3 py-2.5 text-[11px] font-semibold text-[#14243f] hover:bg-[#e1e5e8]"
                        >
                          {ungraded > 0 ? t("Grade submissions") : t("Open assignment")}
                          <ArrowRight aria-hidden className="size-3.5 rtl:rotate-180" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              {detail && (
                <Card className="border-0 bg-[#f1f4f4] p-5 shadow-none">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold">
                    <BellRing aria-hidden className="size-4 text-[#0b6b70]" />
                    {t("Not submitted yet")}
                    <bdi className="font-normal text-[#1B2D54]/60">({waiting.length})</bdi>
                  </h3>
                  {waiting.length === 0 ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-[#1B2D54]/75">{t("Every student has handed in this assignment.")}</p>
                  ) : (
                    <ul className="mt-3 flex flex-col gap-2">
                      {waiting.map((s) => {
                        const state = nudged[s.studentId];
                        return (
                          <li key={s.studentId} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2">
                            <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={28} />
                            <div className="min-w-0 flex-1 leading-tight">
                              <p dir="auto" className="truncate text-start text-[11px] font-semibold">
                                {s.fullName}
                              </p>
                              <p className={cn("text-[9px]", s.status === "Missing" ? "font-semibold text-[#c81e1e]" : "text-[#1B2D54]/60")}>
                                {s.status === "Missing" ? t("Missing") : t("Not started")}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => remind(s.studentId)}
                              disabled={!!state}
                              className="flex shrink-0 items-center gap-1 rounded-md bg-[#eef0f2] px-2.5 py-1.5 text-[10px] font-semibold text-[#14243f] hover:bg-[#e1e5e8] disabled:opacity-70"
                            >
                              {state === "busy" ? (
                                <LoaderCircle aria-hidden className="size-3 animate-spin" />
                              ) : state === "sent" ? (
                                <CircleCheck aria-hidden className="size-3 text-[#0b6b70]" />
                              ) : (
                                <BellRing aria-hidden className="size-3" />
                              )}
                              {state === "sent" ? t("Reminder sent") : t("Send reminder")}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Card>
              )}
            </div>
          </div>

          {detail && (
            <Card className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 leading-tight">
                  <h3 className="text-sm font-bold">{t("Submissions per Day")}</h3>
                  <p dir="auto" className="mt-1 max-w-[26rem] text-start text-[10px] text-[#1B2D54]/80">
                    {t("When students handed in {title}, in the days before the due date.", { title: detail.title })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-[#14243f]">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="size-2 rounded-full bg-[#0b6b70]" />
                    {t("On time")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="size-2 rounded-full bg-[#c81e1e]" />
                    {t("Late")}
                  </span>
                  <span className="flex items-center gap-1 rounded bg-[#dfe3e7] px-2 py-1 text-[9px] font-semibold text-[#14243f]">
                    <Clock aria-hidden className="size-3" />
                    {t("{x} of {y} students", { x: submitted.length, y: detail.students.length })}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <SubmissionChart detail={detail} />
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
