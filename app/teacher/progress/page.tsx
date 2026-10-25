"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BellRing,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  FileDown,
  Flag,
  GraduationCap,
  MessageSquare,
  Rocket,
  Search,
  Sheet,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk, type TFunction } from "@/lib/i18n/translate";
import {
  getTeacherClasses,
  getTeacherProfile,
  getTeacherProgress,
  nudgeStudent,
  type ClassStudentStatus,
  type EventKind,
  type Spotlight,
  type TeacherProgress,
} from "@/lib/teacher-api";
import { Card, LoadBlock, StudentAvatar, useTeacherData } from "@/components/teacher/teacher-ui";
import { EventDialog, QuickAssignmentDialog, useToast } from "@/components/teacher/teacher-dialogs";

type Basis = TeacherProgress["basis"];
type Row = TeacherProgress["rows"][number];
type StatusFilter = "all" | ClassStudentStatus;

const PAGE_SIZE = 6;
const READY_AT = 75;

const STATUS_LABEL: Record<ClassStudentStatus, string> = {
  TopQuartile: tk("Top quartile"),
  OnTrack: tk("On track"),
  NeedsAssistance: tk("Needs assistance"),
};

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: tk("All levels") },
  { key: "NeedsAssistance", label: tk("Needs assistance") },
  { key: "OnTrack", label: tk("On track") },
  { key: "TopQuartile", label: tk("Top quartile") },
];

const BASIS_LABEL: Record<Basis, string> = { Grammar: tk("Grammar"), Subjects: tk("Subjects") };

type DialogState =
  | { type: "event"; defaults: { kind: EventKind; title?: string; classId?: string; studentId?: string } }
  | { type: "assign"; defaults: { classId?: string; title?: string; instructions?: string } }
  | null;

const pct = (v: number | null) => (v === null ? "—" : `${Math.round(v * 10) / 10}%`);
const hours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

function cellClass(v: number | null) {
  if (v === null) return "bg-transparent text-[#1B2D54]/40";
  if (v >= 90) return "bg-[#0f6f6b] text-white";
  if (v >= 75) return "bg-[#9be9ef] text-[#0f4f55]";
  if (v < 70) return "bg-[#fde8e8] text-[#c62828]";
  return "bg-[#eef2f1] text-[#1B2D54]/80";
}

/** Page numbers with gaps: 1 … 4 5 6 … 9. */
function pageList(count: number, current: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);
  const set = new Set([0, count - 1, current - 1, current, current + 1].filter((p) => p >= 0 && p < count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

function downloadCsv(t: TFunction, data: TeacherProgress, rows: Row[]) {
  const esc = (v: string | number | null) => {
    const s = v === null ? "" : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = [t("Student"), t("Class"), ...data.columns.map((c) => c.title), t("Mastery"), t("Status"), t("Time spent (minutes)")];
  const lines = rows.map((r) => [r.fullName, r.className, ...r.scores, r.mastery, t(STATUS_LABEL[r.status]), r.timeSpentMinutes]);
  const csv = [header, ...lines].map((l) => l.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `progress-${data.basis.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function TeacherProgressPage() {
  const t = useT();
  const toast = useToast();
  const [classId, setClassId] = useState("");
  const [basis, setBasis] = useState<Basis | undefined>(undefined);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [dialog, setDialog] = useState<DialogState>(null);

  const loadProgress = useCallback(() => getTeacherProgress(classId || undefined, basis), [classId, basis]);
  const progress = useTeacherData(loadProgress, t("Could not load student progress"));
  const classes = useTeacherData(getTeacherClasses, t("Could not load your classes"));
  const profile = useTeacherData(getTeacherProfile, t("Could not load your profile"));

  const d = progress.data;
  const subjects = profile.data?.subjects ?? [];
  const canToggleBasis = subjects.includes("Language") && subjects.length > 1;

  const filtered = useMemo(() => {
    if (!d) return [];
    const q = query.trim().toLowerCase();
    return d.rows.filter((r) => (status === "all" || r.status === status) && (!q || r.fullName.toLowerCase().includes(q)));
  }, [d, status, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);

  const weakest = useMemo(() => {
    if (!d || d.skillGaps.length === 0) return null;
    return d.skillGaps.reduce((min, s) => (s.percent < min.percent ? s : min));
  }, [d]);

  const changeClass = (id: string) => {
    setClassId(id);
    setPage(0);
  };

  const nudge = async (s: Spotlight, kind: "Certificate" | "Reminder") => {
    try {
      await nudgeStudent(s.studentId, kind);
      toast.show(
        kind === "Certificate"
          ? t("Certificate of excellence sent to {name}", { name: s.fullName })
          : t("Reminder sent to {name}", { name: s.fullName }),
      );
    } catch (e) {
      toast.show(errorMessage(e, t("Could not send. Try again.")));
    }
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54] print:pt-0">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold leading-tight">{t("Competency Matrix & Student Progress")}</h1>
          <p className="mt-1 text-[11px] text-[#1B2D54]/70">
            {t("Scores from graded assignments and practice, updated as your students submit work")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-[11px] font-semibold shadow-sm ring-1 ring-[#e3ece9] hover:bg-white"
          >
            <FileDown aria-hidden className="size-3.5" />
            {t("Export Report (PDF)")}
          </button>
          <button
            type="button"
            disabled={!d || filtered.length === 0}
            onClick={() => d && downloadCsv(t, d, filtered)}
            className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-2 text-[11px] font-semibold shadow-sm ring-1 ring-[#e3ece9] hover:bg-white disabled:opacity-50"
          >
            <Sheet aria-hidden className="size-3.5" />
            {t("Export CSV")}
          </button>
          <button
            type="button"
            onClick={() => setDialog({ type: "event", defaults: { kind: "Review", classId: classId || undefined } })}
            className="flex items-center gap-1.5 rounded-lg bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm hover:bg-[#0f6169]"
          >
            <CalendarPlus aria-hidden className="size-3.5" />
            {t("Schedule Review")}
          </button>
        </div>
      </header>

      {/* Filters */}
      <Card className="flex flex-col gap-2 p-2.5 lg:flex-row lg:items-center print:hidden">
        <div className="flex min-w-0 gap-1 overflow-x-auto rounded-lg bg-[#f6f9f8] p-1">
          <TabButton active={classId === ""} onClick={() => changeClass("")}>
            {t("All classes")}
          </TabButton>
          {(classes.data ?? []).map((c) => (
            <TabButton key={c.id} active={classId === c.id} onClick={() => changeClass(c.id)}>
              {t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}
            </TabButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ms-auto">
          <select
            aria-label={t("Status")}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StatusFilter);
              setPage(0);
            }}
            className="h-8 rounded-lg border border-[#e3ece9] bg-white px-2 text-[11px] outline-none focus:ring-2 focus:ring-[#12939b]/40"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.key} value={s.key}>
                {t(s.label)}
              </option>
            ))}
          </select>
          {canToggleBasis ? (
            <div className="flex items-center gap-1 rounded-lg bg-[#f6f9f8] p-1" role="group" aria-label={t("Scores by")}>
              {(["Grammar", "Subjects"] as Basis[]).map((b) => (
                <TabButton
                  key={b}
                  active={(d?.basis ?? basis) === b}
                  onClick={() => {
                    setBasis(b);
                    setPage(0);
                  }}
                >
                  {t(BASIS_LABEL[b])}
                </TabButton>
              ))}
            </div>
          ) : (
            d && (
              <span className="rounded-lg bg-[#f6f9f8] px-3 py-1.5 text-[11px] font-semibold">
                {t("Scores by")}: {t(BASIS_LABEL[d.basis])}
              </span>
            )
          )}
          <label className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e3ece9] bg-white px-2.5">
            <Search aria-hidden className="size-3.5 text-[#1B2D54]/50" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={t("Search students")}
              aria-label={t("Search students")}
              className="w-32 bg-transparent text-[11px] outline-none placeholder:text-[#1B2D54]/50"
            />
          </label>
        </div>
      </Card>

      {!d ? (
        <LoadBlock error={progress.error} onRetry={progress.reload} />
      ) : (
        <>
          <StatCards d={d} />

          <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="min-w-0 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">{t("Competency Matrix Heatmap")}</h2>
                  <p className="mt-0.5 text-[10px] text-[#1B2D54]/70">
                    {d.basis === "Grammar"
                      ? t("Average score per grammar topic from graded work")
                      : t("Average score per subject from graded work")}
                  </p>
                </div>
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] font-medium">
                  <Legend color="bg-[#0f6f6b]" label={t("Advanced (90–100%)")} />
                  <Legend color="bg-[#9be9ef]" label={t("Proficient (75–89%)")} />
                  <Legend color="bg-[#fde8e8]" label={t("Developing (<70%)")} className="text-[#c62828]" />
                </ul>
              </div>

              {d.rows.length === 0 || d.columns.length === 0 ? (
                <Empty icon={GraduationCap} text={t("No grades yet. Scores appear here once you grade your students' work.")} />
              ) : filtered.length === 0 ? (
                <Empty icon={Search} text={t("No students match these filters.")} />
              ) : (
                <>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[560px] border-collapse text-[11px]">
                      <thead>
                        <tr className="bg-[#f6f9f8] text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">
                          <th scope="col" className="rounded-s-lg px-3 py-3 text-start">
                            {t("Student")}
                          </th>
                          {d.columns.map((c) => (
                            <th key={c.key} scope="col" dir="auto" className="px-2 py-3 text-center last:rounded-e-lg">
                              {c.title}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r, i) => {
                          const onPage = Math.floor(i / PAGE_SIZE) === current;
                          return (
                            <tr
                              key={r.studentId}
                              className={cn(
                                "border-b border-[#eef2f1] last:border-0",
                                r.status === "NeedsAssistance" && "bg-[#fff7f7]",
                                !onPage && "hidden print:table-row",
                              )}
                            >
                              <th scope="row" className="px-3 py-3 text-start font-normal">
                                <div className="flex items-center gap-2.5">
                                  <StudentAvatar name={r.fullName} photoUrl={r.photoUrl} gender={r.gender} size={32} />
                                  <div className="min-w-0">
                                    <p className="truncate text-[12px] font-semibold">{r.fullName}</p>
                                    <p
                                      className={cn(
                                        "flex items-center gap-1 text-[9px]",
                                        r.status === "NeedsAssistance" ? "text-[#c62828]" : "text-[#14757d]",
                                      )}
                                    >
                                      {r.status === "NeedsAssistance" && <Flag aria-hidden className="size-2.5" />}
                                      {t("Class {name}", { name: r.className })} • {t(STATUS_LABEL[r.status])}
                                    </p>
                                  </div>
                                </div>
                              </th>
                              {r.scores.map((s, j) => (
                                <td key={d.columns[j]?.key ?? j} className="px-2 py-3 text-center">
                                  <span
                                    className={cn(
                                      "inline-block min-w-12 rounded px-2 py-1 text-[10px] font-semibold",
                                      cellClass(s),
                                    )}
                                  >
                                    {s === null ? "—" : `${Math.round(s)}%`}
                                  </span>
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <p className="text-[10px] font-medium text-[#1B2D54]/70">
                      {t("Showing {shown} of {total} students", {
                        shown: Math.min(PAGE_SIZE, filtered.length - current * PAGE_SIZE),
                        total: filtered.length,
                      })}
                    </p>
                    {pageCount > 1 && (
                      <nav aria-label={t("Pages")} className="flex items-center gap-1.5">
                        <PageButton disabled={current === 0} onClick={() => setPage(current - 1)} label={t("Previous page")}>
                          <ChevronLeft aria-hidden className="size-3.5 rtl:rotate-180" />
                        </PageButton>
                        {pageList(pageCount, current).map((p, i) =>
                          p === "gap" ? (
                            <span key={`gap-${i}`} className="px-0.5 text-[10px] text-[#1B2D54]/50">
                              …
                            </span>
                          ) : (
                            <PageButton key={p} active={p === current} onClick={() => setPage(p)} label={t("Page {page}", { page: p + 1 })}>
                              {p + 1}
                            </PageButton>
                          ),
                        )}
                        <PageButton
                          disabled={current >= pageCount - 1}
                          onClick={() => setPage(current + 1)}
                          label={t("Next page")}
                        >
                          <ChevronRight aria-hidden className="size-3.5 rtl:rotate-180" />
                        </PageButton>
                      </nav>
                    )}
                  </div>
                </>
              )}
            </Card>

            <div className="flex min-w-0 flex-col gap-4">
              <SkillGaps
                d={d}
                weakest={weakest}
                onDrill={(skill) =>
                  setDialog({
                    type: "event",
                    defaults: { kind: "Lesson", title: t("In-class drill: {skill}", { skill }), classId: classId || undefined },
                  })
                }
              />
              <Readiness
                d={d}
                onAssign={() =>
                  setDialog({
                    type: "assign",
                    defaults: {
                      classId: classId || undefined,
                      title: weakest ? t("Practice: {skill}", { skill: weakest.title }) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          {(d.top || d.needsHelp) && (
            <section className="break-inside-avoid">
              <h2 className="text-lg font-bold">{t("Spotlight: recognition & support")}</h2>
              <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Your strongest student and the one who needs you most right now")}</p>
              <div className="mt-3 grid gap-4 lg:grid-cols-2">
                {d.top && (
                  <SpotlightCard
                    s={d.top}
                    tone="top"
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => d.top && nudge(d.top, "Certificate")}
                          className="flex items-center gap-1.5 rounded-lg bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#0f6169]"
                        >
                          <Award aria-hidden className="size-3.5" />
                          {t("Issue Certificate of Excellence")}
                        </button>
                        <Link
                          href={`/teacher/messages?student=${d.top.studentId}`}
                          className="flex items-center gap-1.5 rounded-lg bg-[#f6f9f8] px-4 py-2 text-[11px] font-semibold hover:bg-[#eef2f1]"
                        >
                          <MessageSquare aria-hidden className="size-3.5" />
                          {t("Message")}
                        </Link>
                      </>
                    }
                  />
                )}
                {d.needsHelp && (
                  <SpotlightCard
                    s={d.needsHelp}
                    tone="help"
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            d.needsHelp &&
                            setDialog({
                              type: "event",
                              defaults: {
                                kind: "OneOnOne",
                                studentId: d.needsHelp.studentId,
                                title: t("1-on-1 with {name}", { name: d.needsHelp.fullName }),
                              },
                            })
                          }
                          className="flex items-center gap-1.5 rounded-lg bg-[#c62828] px-4 py-2 text-[11px] font-semibold text-white hover:bg-[#a51f1f]"
                        >
                          <CalendarPlus aria-hidden className="size-3.5" />
                          {t("Schedule 1-on-1 Session")}
                        </button>
                        <button
                          type="button"
                          onClick={() => d.needsHelp && nudge(d.needsHelp, "Reminder")}
                          className="flex items-center gap-1.5 rounded-lg bg-[#f6f9f8] px-4 py-2 text-[11px] font-semibold hover:bg-[#eef2f1]"
                        >
                          <BellRing aria-hidden className="size-3.5" />
                          {t("Send reminder")}
                        </button>
                      </>
                    }
                  />
                )}
              </div>
            </section>
          )}
        </>
      )}

      {dialog?.type === "event" && (
        <EventDialog
          defaults={dialog.defaults}
          onClose={() => setDialog(null)}
          onSaved={(item) => {
            setDialog(null);
            if (item) toast.show(t("Added to your calendar"));
          }}
        />
      )}
      {dialog?.type === "assign" && <QuickAssignmentDialog defaults={dialog.defaults} onClose={() => setDialog(null)} />}
      {toast.node}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[11px] font-semibold transition-colors",
        active ? "bg-[#14757d] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10",
      )}
    >
      {children}
    </button>
  );
}

function PageButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "grid size-7 place-items-center rounded-lg text-[10px] font-semibold transition-colors disabled:opacity-40",
        active ? "bg-[#14757d] text-white" : "bg-[#f6f9f8] text-[#1B2D54] hover:bg-[#eef2f1]",
      )}
    >
      {children}
    </button>
  );
}

function Legend({ color, label, className }: { color: string; label: string; className?: string }) {
  return (
    <li className={cn("flex items-center gap-1.5", className)}>
      <span aria-hidden className={cn("size-2.5 rounded-sm", color)} />
      {label}
    </li>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof Search; text: string }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-xl bg-[#f6f9f8] px-4 py-10 text-center">
      <Icon aria-hidden className="size-6 text-[#14757d]" />
      <p className="max-w-xs text-[11px] text-[#1B2D54]/70">{text}</p>
    </div>
  );
}

function StatLabel({ label, icon: Icon, tone = "teal" }: { label: string; icon: typeof Search; tone?: "teal" | "red" }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">{label}</p>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg",
          tone === "red" ? "bg-[#fde8e8] text-[#c62828]" : "bg-[#e6f6f5] text-[#14757d]",
        )}
      >
        <Icon aria-hidden className="size-3.5" />
      </span>
    </div>
  );
}

function StatCards({ d }: { d: TeacherProgress }) {
  const t = useT();
  const { mastery, ready, total, needsFocus, weeklyHoursPerStudent } = d.stats;
  const readyRate = total ? Math.round((ready / total) * 1000) / 10 : 0;
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-5">
        <StatLabel label={t("Class mastery")} icon={TrendingUp} />
        <p className="mt-3 text-3xl font-bold">{pct(mastery)}</p>
        <p className="mt-2 text-[11px] text-[#1B2D54]/70">
          {mastery === null
            ? t("No graded work yet")
            : t("{ready} of {total} students at {threshold}% or above", { ready, total, threshold: READY_AT })}
        </p>
      </Card>

      <Card className="p-5">
        <StatLabel label={t("Ready to advance")} icon={GraduationCap} />
        <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
          <span className="text-3xl font-bold">{ready}</span>
          <span className="text-sm text-[#1B2D54]/60">/ {total}</span>
          <span className="rounded-full bg-[#c9f1f0] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">
            {t("{percent}% rate", { percent: readyRate })}
          </span>
        </p>
        <p className="mt-2 text-[11px] text-[#1B2D54]/70">{t("Mastery of {threshold}% or above", { threshold: READY_AT })}</p>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eef2f1]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={readyRate}
        >
          <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${readyRate}%` }} />
        </div>
      </Card>

      <Card className="p-5">
        <StatLabel label={t("Needs focused support")} icon={AlertTriangle} tone="red" />
        <p className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#c62828]">{needsFocus}</span>
          <span className="text-[11px] font-medium">{t("students flagged")}</span>
        </p>
        <p className="mt-2 text-[11px] text-[#1B2D54]/70">{t("Mastery below the class target; plan a check-in this week")}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          {needsFocus > 0 && (
            <span className="rounded bg-[#fde8e8] px-2 py-0.5 text-[9px] font-semibold text-[#c62828]">{t("Critical attention")}</span>
          )}
          <Link href="/teacher/students" className="ms-auto flex items-center gap-1 text-[10px] font-semibold text-[#14757d] print:hidden">
            {t("Queue review")}
            <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
          </Link>
        </div>
      </Card>

      <Card className="p-5">
        <StatLabel label={t("Weekly practice time")} icon={Timer} />
        <p className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold">{weeklyHoursPerStudent}</span>
          <span className="text-sm text-[#1B2D54]/60">{t("hrs / wk")}</span>
        </p>
        <p className="mt-2 text-[11px] text-[#1B2D54]/70">{t("Average practice time per student this week")}</p>
      </Card>
    </div>
  );
}

function SkillGaps({
  d,
  weakest,
  onDrill,
}: {
  d: TeacherProgress;
  weakest: { title: string; percent: number } | null;
  onDrill: (skill: string) => void;
}) {
  const t = useT();
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-[#e6f6f5] text-[#14757d]">
            <Sparkles aria-hidden className="size-3.5" />
          </span>
          {t("Skill Gap Analysis")}
        </h2>
        <span className="rounded-full bg-[#eef2f1] px-2 py-0.5 text-[9px] font-semibold">{t(BASIS_LABEL[d.basis])}</span>
      </div>

      {d.skillGaps.length === 0 ? (
        <p className="mt-4 rounded-xl bg-[#f6f9f8] px-3 py-6 text-center text-[11px] text-[#1B2D54]/70">{t("No graded work yet")}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {d.skillGaps.map((s) => {
            const weak = s === weakest;
            return (
              <li key={s.title} className={cn(weak && "-mx-2 rounded-lg bg-[#fff1f1] px-2 py-1.5")}>
                <div className={cn("flex items-center justify-between gap-2 text-[11px]", weak && "font-semibold text-[#c62828]")}>
                  <span dir="auto" className="flex min-w-0 items-center gap-1 truncate">
                    {weak && <CircleAlert aria-hidden className="size-3 shrink-0" />}
                    {s.title}
                  </span>
                  <span className="font-semibold">{Math.round(s.percent)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eef2f1]">
                  <div
                    className={cn("h-full rounded-full", weak ? "bg-[#c62828]" : s.percent >= 85 ? "bg-[#0f6f6b]" : "bg-[#5fd0d6]")}
                    style={{ width: `${Math.min(100, Math.max(0, s.percent))}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {weakest && (
        <div className="mt-4 rounded-xl bg-[#f6f9f8] p-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">{t("Targeted lesson recommendation")}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed">
            {t("{percent}% average in {skill}. Plan a short review in the next lesson.", {
              percent: Math.round(weakest.percent),
              skill: weakest.title,
            })}
          </p>
          <button
            type="button"
            onClick={() => onDrill(weakest.title)}
            className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#14757d] hover:underline print:hidden"
          >
            {t("Schedule an in-class drill")}
            <ArrowRight aria-hidden className="size-3 rtl:rotate-180" />
          </button>
        </div>
      )}
    </Card>
  );
}

function Readiness({ d, onAssign }: { d: TeacherProgress; onAssign: () => void }) {
  const t = useT();
  const { ready, total } = d.stats;
  const rate = total ? Math.round((ready / total) * 100) : 0;
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-[#e6f6f5] text-[#14757d]">
            <CircleCheck aria-hidden className="size-3.5" />
          </span>
          {t("Readiness")}
        </h2>
        <span className="rounded-full bg-[#c9f1f0] px-2 py-0.5 text-[9px] font-semibold text-[#14757d]">
          {t("{threshold}%+ mastery", { threshold: READY_AT })}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-xl bg-[#f6f9f8] p-3.5">
        <div className="relative size-16 shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" stroke="#e3ece9" strokeWidth="6" />
            <circle
              cx="32"
              cy="32"
              r={r}
              fill="none"
              stroke="#14757d"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(rate / 100) * c} ${c}`}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[13px] font-bold">{rate}%</span>
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold">{t("{ready} / {total} students", { ready, total })}</p>
          <p className="mt-0.5 text-[10px] text-[#1B2D54]/70">{t("Ready to move on to the next unit.")}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAssign}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B2D54] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#14223f] print:hidden"
      >
        <Rocket aria-hidden className="size-3.5" />
        {t("Assign practice to the class")}
      </button>
    </Card>
  );
}

function SpotlightCard({ s, tone, actions }: { s: Spotlight; tone: "top" | "help"; actions: ReactNode }) {
  const t = useT();
  const [done, setDone] = useState<Set<string>>(() => new Set());
  const top = tone === "top";
  const strengths = s.strong.map((c) => c.title).join(t(", "));
  const plan = s.weak.slice(0, 3);

  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start gap-3">
        <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{s.fullName}</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                top ? "bg-[#c9f1f0] text-[#14757d]" : "bg-[#fde8e8] text-[#c62828]",
              )}
            >
              {top ? t("Outstanding student") : t("Needs support")}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">
            {t("Mastery")}:{" "}
            <span className={cn("font-semibold", top ? "text-[#14757d]" : "text-[#c62828]")}>{pct(s.mastery)}</span> •{" "}
            {t("Class {name}", { name: s.className })}
          </p>
        </div>
        {top ? (
          <Award aria-hidden className="size-5 shrink-0 text-[#14757d]" />
        ) : (
          <BellRing aria-hidden className="size-5 shrink-0 text-[#c62828]" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(top ? s.strong : s.weak).map((c) => (
          <span
            key={c.title}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold",
              top ? "bg-[#f6f9f8] text-[#1B2D54]" : "bg-[#fff1f1] text-[#c62828]",
            )}
          >
            {top ? <CircleCheck aria-hidden className="size-3" /> : <CircleAlert aria-hidden className="size-3" />}
            {Math.round(c.percent)}% <span dir="auto">{c.title}</span>
          </span>
        ))}
        <span className="flex items-center gap-1 rounded-md bg-[#f6f9f8] px-2 py-1 text-[9px] font-semibold">
          <Clock aria-hidden className="size-3" />
          {t("{hours} hrs practice time", { hours: hours(s.timeSpentMinutes) })}
        </span>
      </div>

      {top ? (
        <div className="mt-3 rounded-xl bg-[#f6f9f8] p-3.5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/70">{t("Teacher feedback")}</p>
          <p className="mt-1.5 text-[11px] leading-relaxed">
            {strengths
              ? t("{name} shows strong mastery in {skills}. Keep them challenged with extension work.", {
                  name: s.fullName,
                  skills: strengths,
                })
              : t("{name} is doing well. Keep them challenged with extension work.", { name: s.fullName })}
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-[#f6f9f8] p-3.5">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#c62828]">
            <span aria-hidden className="size-1.5 rounded-full bg-[#c62828]" />
            {t("Action plan (next 48 hours)")}
          </p>
          {plan.length === 0 ? (
            <p className="mt-1.5 text-[11px] text-[#1B2D54]/70">{t("Check in with the student to find where they are stuck.")}</p>
          ) : (
            <ul className="mt-1.5 flex flex-col gap-1">
              {plan.map((c) => (
                <li key={c.title}>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={done.has(c.title)}
                      onChange={() =>
                        setDone((prev) => {
                          const next = new Set(prev);
                          if (next.has(c.title)) next.delete(c.title);
                          else next.add(c.title);
                          return next;
                        })
                      }
                      className="size-3.5 accent-[#c62828]"
                    />
                    <span className={cn(done.has(c.title) && "text-[#1B2D54]/50 line-through")}>
                      {t("Review {skill} and redo the practice ({percent}% now)", {
                        skill: c.title,
                        percent: Math.round(c.percent),
                      })}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4 print:hidden">{actions}</div>
    </Card>
  );
}
