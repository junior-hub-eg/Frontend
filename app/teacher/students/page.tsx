"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChartColumn,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock,
  Copy,
  Download,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { getTeacherClasses, type ClassStudentStatus, type TeacherClass } from "@/lib/teacher-api";
import { getStudentsDirectory, type DirectoryStudent } from "@/lib/teacher-students-api";
import { LoadBlock, StudentAvatar, useTeacherData } from "@/components/teacher/teacher-ui";
import { TeacherDialog } from "@/components/teacher/teacher-dialogs";

function Bidi({ text }: { text: string }) {
  const parts = text.split(/([+-]?\d[\d.,:/-]*%?)/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <bdi key={i} dir="ltr">
            {p}
          </bdi>
        ) : (
          p
        )
      )}
    </>
  );
}

const PAGE_SIZE = 6;

type Filter = "all" | "struggling" | "on-track" | "top";
const FILTERS: { key: Filter; label: string; status?: ClassStudentStatus }[] = [
  { key: "all", label: tk("All") },
  { key: "struggling", label: tk("Struggling"), status: "NeedsAssistance" },
  { key: "on-track", label: tk("On Track"), status: "OnTrack" },
  { key: "top", label: tk("Top Quartile"), status: "TopQuartile" },
];

const STATUS_LABEL: Record<ClassStudentStatus, string> = {
  OnTrack: tk("On Track"),
  TopQuartile: tk("Top Quartile"),
  NeedsAssistance: tk("Struggling"),
};

const STATUS_STYLE: Record<ClassStudentStatus, string> = {
  OnTrack: "bg-[#eef2f1] text-[#1B2D54]/70",
  TopQuartile: "bg-[#c9efe9] text-[#14757d]",
  NeedsAssistance: "bg-[#fde8e8] text-[#c81e1e]",
};

type Sort = "default" | "mastery" | "lastActive" | "name";
const SORTS: { key: Sort; label: string }[] = [
  { key: "default", label: tk("Default order") },
  { key: "mastery", label: tk("Mastery (highest first)") },
  { key: "lastActive", label: tk("Last active (most recent)") },
  { key: "name", label: tk("Name (A-Z)") },
];

const COLUMNS = [
  tk("Student"),
  tk("Student ID"),
  tk("Class"),
  tk("Lessons"),
  tk("Problems Solved"),
  tk("Mastery"),
  tk("Time Spent"),
  tk("Last Active"),
  tk("Status"),
];

function masteryTone(value: number | null) {
  if (value == null) return { bg: "bg-[#eef2f1]", dot: "bg-[#1B2D54]/30", text: "text-[#1B2D54]/60" };
  if (value >= 90) return { bg: "bg-[#e2f6ea]", dot: "bg-[#22a559]", text: "text-[#168a45]" };
  if (value >= 70) return { bg: "bg-[#fff1d6]", dot: "bg-[#f5a524]", text: "text-[#c76a0a]" };
  return { bg: "bg-[#fde8e8]", dot: "bg-[#e5484d]", text: "text-[#c81e1e]" };
}

const shortId = (s: DirectoryStudent) => `JH-${s.className}-${s.studentId.slice(0, 3)}`.toUpperCase();

function formatDuration(minutes: number, t: TFunction) {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? t("{h}h {m}m", { h, m: String(m).padStart(2, "0") }) : t("{m}m", { m });
}

function lastActiveLabel(iso: string | null, t: TFunction) {
  if (!iso) return t("Never");
  const date = new Date(iso);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  if (days <= 0) {
    const time = date.toLocaleTimeString(dateLocale("en-US"), { hour: "2-digit", minute: "2-digit" });
    return t("Today, {time}", { time });
  }
  if (days === 1) return t("Yesterday");
  if (days < 30) return t("{n} days ago", { n: days });
  return date.toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });
}

/** Page numbers with gaps: 1 2 3 … 9 */
function pageList(current: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, current - 1, current, current + 1].filter((p) => p >= 1 && p <= count));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("…");
    out.push(p);
  });
  return out;
}

function StatCard({
  label,
  value,
  note,
  noteTone,
  icon,
  danger,
}: {
  label: string;
  value: string;
  note: string;
  noteTone: string;
  icon: ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm">
      <div className="min-w-0 leading-tight">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">{label}</p>
        <p className={cn("mt-1.5 text-2xl font-bold leading-none", danger && "text-[#e5484d]")}>
          <Bidi text={value} />
        </p>
        <p className={cn("mt-1.5 text-[10px] font-medium", noteTone)}>
          <Bidi text={note} />
        </p>
      </div>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          danger ? "bg-[#fde8e8] text-[#e5484d]" : "bg-[#e4f8fa] text-[#14757d]"
        )}
      >
        {icon}
      </span>
    </div>
  );
}

function exportCsv(rows: DirectoryStudent[], t: TFunction) {
  const head = [
    t("Name"),
    t("Email"),
    t("Student ID"),
    t("Class"),
    t("Lessons"),
    t("Problems Solved"),
    t("Mastery %"),
    t("Time Spent"),
    t("Last Active"),
    t("Status"),
  ];
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = rows.map((s) =>
    [
      s.fullName,
      s.email,
      shortId(s),
      t("Grade {grade}{name}", { grade: s.grade, name: s.className }),
      `${s.lessonsDone}/${s.lessonsTotal}`,
      `${s.problemsSolved}/${s.problemsTotal}`,
      s.mastery ?? "",
      formatDuration(s.timeSpentMinutes, t),
      s.lastActiveUtc ?? "",
      t(STATUS_LABEL[s.status]),
    ]
      .map(esc)
      .join(",")
  );
  const csv = "﻿" + [head.map(esc).join(","), ...lines].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/** "Enroll Student": there is no enroll-by-email; students join a class with its code. */
function EnrollDialog({ classes, onClose }: { classes: TeacherClass[] | null; onClose: () => void }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (c: TeacherClass) => {
    try {
      await navigator.clipboard.writeText(c.joinCode);
      setCopied(c.id);
      setTimeout(() => setCopied((v) => (v === c.id ? null : v)), 2000);
    } catch {
      /* clipboard blocked: the code stays visible to copy by hand */
    }
  };

  return (
    <TeacherDialog
      title={t("Enroll Student")}
      subtitle={t("Students join a class with its join code from their account. Share the code of the class below.")}
      onClose={onClose}
    >
      {classes == null ? (
        <LoadBlock error={null} onRetry={() => {}} />
      ) : classes.length === 0 ? (
        <p className="py-6 text-center text-[11px] text-[#1B2D54]/60">{t("You have no classes yet.")}</p>
      ) : (
        <ul className="grid gap-2">
          {classes.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e3ece9] bg-[#f6f9f8] p-3">
              <div className="min-w-0 leading-tight">
                <p className="text-xs font-semibold">{t("Grade {grade}{name}", { grade: c.grade, name: c.name })}</p>
                <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">
                  {c.autoAccept ? t("Students join instantly") : t("Requests need your approval")}
                  {c.pendingRequests > 0 && (
                    <span className="ms-1.5 rounded-full bg-[#fff1d6] px-1.5 font-semibold text-[#c76a0a]">
                      {t("{n} pending", { n: c.pendingRequests })}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <bdi dir="ltr" className="rounded-md bg-white px-2 py-1 font-mono text-xs font-bold tracking-wider">
                  {c.joinCode}
                </bdi>
                <button
                  type="button"
                  onClick={() => copy(c)}
                  aria-label={t("Copy code")}
                  className="flex items-center gap-1 rounded-lg bg-[#14757d] px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-[#0f6169]"
                >
                  {copied === c.id ? <Check aria-hidden className="size-3" /> : <Copy aria-hidden className="size-3" />}
                  {copied === c.id ? t("Copied") : t("Copy")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/teacher/classes"
        className="mt-4 flex items-center justify-center rounded-full border border-[#e3ece9] px-4 py-2 text-[11px] font-semibold hover:bg-[#f6f9f8]"
      >
        {t("Review pending join requests in My Classes")}
      </Link>
    </TeacherDialog>
  );
}

export default function StudentsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [classFilter, setClassFilter] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);

  const loadStudents = useCallback(() => getStudentsDirectory(classFilter || undefined), [classFilter]);
  const { data, error, reload } = useTeacherData(loadStudents, t("Could not load the students."));
  const { data: classes } = useTeacherData(getTeacherClasses, t("Could not load your classes."));

  const students = useMemo(() => data?.students ?? [], [data]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: students.length, struggling: 0, "on-track": 0, top: 0 };
    for (const s of students) {
      if (s.status === "NeedsAssistance") c.struggling++;
      else if (s.status === "OnTrack") c["on-track"]++;
      else c.top++;
    }
    return c;
  }, [students]);

  const rows = useMemo(() => {
    const status = FILTERS.find((f) => f.key === filter)?.status;
    const q = query.trim().toLowerCase();
    const list = students.filter(
      (s) =>
        (!status || s.status === status) &&
        (!q ||
          s.fullName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          shortId(s).toLowerCase().includes(q))
    );
    if (sort === "mastery") list.sort((a, b) => (b.mastery ?? -1) - (a.mastery ?? -1));
    else if (sort === "lastActive") list.sort((a, b) => (b.lastActiveUtc ?? "").localeCompare(a.lastActiveUtc ?? ""));
    else if (sort === "name") list.sort((a, b) => a.fullName.localeCompare(b.fullName));
    return list;
  }, [students, filter, query, sort]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const pageRows = rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = rows.length ? (current - 1) * PAGE_SIZE + 1 : 0;
  const to = (current - 1) * PAGE_SIZE + pageRows.length;

  const stats = data?.stats;
  const classCount = classFilter ? 1 : (classes?.length ?? new Set(students.map((s) => s.classId)).size);
  const avgMinutes = students.length ? students.reduce((sum, s) => sum + s.timeSpentMinutes, 0) / students.length : 0;

  const openStudent = (id: string) => router.push(`/teacher/messages?student=${encodeURIComponent(id)}`);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[340px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
      >
        <Image
          src="/images/learner/projects/background.png"
          alt=""
          width={1847}
          height={453}
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-top"
        />
      </div>

      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="ps-2">
          <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#14757d] rtl:normal-case rtl:tracking-normal">
            <ChartColumn aria-hidden className="size-3.5" />
            {t("Cohort Analytics & Oversight")}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t("Students Directory")}</h1>
          <p className="mt-0.5 max-w-xl text-[11px] text-[#1B2D54]/70">
            {t("Manage student roster, track mastery velocity, and review individualized learning interventions.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportCsv(rows, t)}
            disabled={rows.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-[#e3ece9] bg-white px-4 py-2 text-[11px] font-semibold shadow-sm transition-colors hover:bg-[#f6f9f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40 disabled:opacity-50"
          >
            <Download aria-hidden className="size-3.5" />
            {t("Export Roster CSV")}
          </button>
          <button
            type="button"
            onClick={() => setEnrollOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <UserPlus aria-hidden className="size-3.5" />
            {t("Enroll Student")}
          </button>
        </div>
      </header>

      {!stats ? (
        <LoadBlock error={error} onRetry={reload} />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={t("Total Enrolled")}
              value={String(stats.total)}
              note={classCount === 1 ? t("In 1 class") : t("Across {n} classes", { n: classCount })}
              noteTone="text-[#14757d]"
              icon={<Users aria-hidden className="size-5" />}
            />
            <StatCard
              label={t("Class Mastery")}
              value={stats.averageMastery == null ? "—" : `${Math.round(stats.averageMastery * 10) / 10}%`}
              note={stats.averageMastery == null ? t("No graded work yet") : t("Average mastery")}
              noteTone="text-[#168a45]"
              icon={<CircleCheck aria-hidden className="size-5" />}
            />
            <StatCard
              label={t("Struggling Alerts")}
              value={String(stats.needsAssistance)}
              note={stats.needsAssistance > 0 ? t("Immediate review") : t("No one needs help now")}
              noteTone="text-[#1B2D54]/60"
              danger={stats.needsAssistance > 0}
              icon={<CircleAlert aria-hidden className="size-5" />}
            />
            <StatCard
              label={t("Avg Practice Time")}
              value={formatDuration(avgMinutes, t)}
              note={t("Practice time per student")}
              noteTone="text-[#1B2D54]/60"
              icon={<Clock aria-hidden className="size-5" />}
            />
          </div>

          <section className="rounded-2xl border border-[#e3ece9] bg-white shadow-sm">
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-start gap-2">
                <div className="relative">
                  <select
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setPage(1);
                    }}
                    aria-label={t("Class")}
                    className="w-36 appearance-none rounded-lg border border-[#e3ece9] bg-white py-2 ps-3 pe-8 text-[11px] font-medium outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
                  >
                    <option value="">{t("All Classes")}</option>
                    {(classes ?? []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {t("Grade {grade}{name}", { grade: c.grade, name: c.name })}
                      </option>
                    ))}
                  </select>
                  <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2" />
                </div>

                <div role="tablist" className="flex flex-wrap items-center gap-1.5">
                  {FILTERS.map((f) => {
                    const active = filter === f.key;
                    return (
                      <button
                        key={f.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => {
                          setFilter(f.key);
                          setPage(1);
                        }}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
                          active ? "bg-[#1B2D54] text-white" : "bg-[#f1f3f5] text-[#1B2D54] hover:bg-[#e6eaec]"
                        )}
                      >
                        {t(f.label)}
                        <span
                          className={cn(
                            "text-[9px] font-medium",
                            active && "text-white/70",
                            !active && f.key === "struggling" && "rounded-full bg-[#fde8e8] px-1.5 text-[#c81e1e]",
                            !active && f.key !== "struggling" && "text-[#1B2D54]/50"
                          )}
                        >
                          {counts[f.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex items-center gap-2">
                <label className="relative block min-w-0 flex-1">
                  <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t("Search student by name or ID...")}
                    aria-label={t("Search student by name or ID...")}
                    className="w-full rounded-lg border border-transparent bg-[#f1f3f5] py-2.5 ps-9 pe-3 text-[11px] outline-none placeholder:text-[#1B2D54]/50 focus:border-[#12939b] focus:bg-white focus:ring-2 focus:ring-[#12939b]/20 sm:w-64"
                  />
                </label>
                <button
                  type="button"
                  aria-label={t("Sort by")}
                  aria-expanded={sortOpen}
                  onClick={() => setSortOpen((o) => !o)}
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-[#1B2D54] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
                    sortOpen || sort !== "default" ? "bg-[#1B2D54] text-white" : "bg-[#f1f3f5] hover:bg-[#e6eaec]"
                  )}
                >
                  <SlidersHorizontal aria-hidden className="size-4" />
                </button>
                {sortOpen && (
                  <div className="absolute end-0 top-full z-20 mt-2 w-56 rounded-xl border border-[#e3ece9] bg-white p-2 shadow-lg">
                    <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                      {t("Sort by")}
                    </p>
                    {SORTS.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => {
                          setSort(o.key);
                          setSortOpen(false);
                          setPage(1);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-start text-[11px] hover:bg-[#f6f9f8]",
                          sort === o.key && "font-semibold text-[#14757d]"
                        )}
                      >
                        {t(o.label)}
                        {sort === o.key && <Check aria-hidden className="size-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && <LoadBlock error={error} onRetry={reload} className="mx-4 mb-3" />}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] border-collapse text-start text-[11px]">
                <thead>
                  <tr className="border-y border-[#e3ece9] bg-[#f6f9f8] text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                    {COLUMNS.map((c) => (
                      <th key={c} scope="col" className="px-4 py-2.5 text-start font-semibold">
                        {t(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((s) => {
                    const lessonsPct = s.lessonsTotal > 0 ? Math.round((s.lessonsDone / s.lessonsTotal) * 100) : 0;
                    const tone = masteryTone(s.mastery);
                    return (
                      <tr
                        key={`${s.classId}-${s.studentId}`}
                        onClick={() => openStudent(s.studentId)}
                        className="cursor-pointer border-b border-[#e3ece9] transition-colors last:border-b-0 hover:bg-[#f6f9f8]"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={32} />
                            <div className="min-w-0 leading-tight">
                              <Link
                                href={`/teacher/messages?student=${encodeURIComponent(s.studentId)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="block truncate text-xs font-semibold hover:text-[#14757d] hover:underline"
                              >
                                {s.fullName}
                              </Link>
                              <p className="truncate text-[10px] text-[#1B2D54]/55">{s.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#1B2D54]/70">
                          <bdi>{shortId(s)}</bdi>
                        </td>
                        <td className="px-4 py-3">
                          <span className="whitespace-nowrap rounded-md bg-[#eef2f1] px-2 py-0.5 text-[10px] font-medium">
                            {t("Grade {grade}{name}", { grade: s.grade, name: s.className })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-28">
                            <div className="flex items-center justify-between text-[10px]">
                              <bdi className="font-semibold">
                                {s.lessonsDone}/{s.lessonsTotal}
                              </bdi>
                              <bdi className="text-[#1B2D54]/55">{lessonsPct}%</bdi>
                            </div>
                            <div
                              className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#dfe9e7]"
                              role="progressbar"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={lessonsPct}
                            >
                              <div
                                className={cn("h-full rounded-full", lessonsPct < 80 ? "bg-[#c81e1e]" : "bg-[#14757d]")}
                                style={{ width: `${lessonsPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <bdi>
                            <span className="font-semibold">{s.problemsSolved}</span>
                            <span className="text-[#1B2D54]/50">/{s.problemsTotal}</span>
                          </bdi>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                              tone.bg,
                              tone.text
                            )}
                          >
                            <span aria-hidden className={cn("size-1.5 rounded-full", tone.dot)} />
                            <bdi>{s.mastery == null ? "—" : `${Math.round(s.mastery)}%`}</bdi>
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#1B2D54]/80">
                          <Bidi text={formatDuration(s.timeSpentMinutes, t)} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-[#1B2D54]/80">
                          <Bidi text={lastActiveLabel(s.lastActiveUtc, t)} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold", STATUS_STYLE[s.status])}>
                            {t(STATUS_LABEL[s.status])}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[#1B2D54]/60">
                        {students.length === 0 ? t("No students in your classes yet.") : t("No students match your filters.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer: count + pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e3ece9] p-4 text-[10px] sm:flex-row">
              <p className="text-[#1B2D54]/70">
                {t("Showing")}{" "}
                <strong className="text-[#1B2D54]">
                  <bdi dir="ltr">{rows.length > 0 ? `${from}-${to}` : "0"}</bdi>
                </strong>{" "}
                {t("of")} <strong className="text-[#1B2D54]">{rows.length}</strong> {t("students")}
              </p>

              <nav aria-label={t("Pagination")} className="flex flex-wrap items-center justify-center gap-1">
                  <button
                    type="button"
                    disabled={current === 1}
                    onClick={() => setPage(current - 1)}
                    className="rounded-lg bg-[#eef2f1] px-3 py-1.5 font-semibold transition-colors hover:bg-[#dfe9e7] disabled:opacity-50"
                  >
                    {t("Previous")}
                  </button>
                  {pageList(current, pageCount).map((p, i) =>
                    typeof p === "number" ? (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        aria-current={current === p ? "page" : undefined}
                        className={cn(
                          "size-7 rounded-lg font-semibold transition-colors",
                          current === p ? "bg-[#1B2D54] text-white" : "hover:bg-[#eef2f1]"
                        )}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={`gap-${i}`} aria-hidden className="px-1 text-[#1B2D54]/50">
                        {p}
                      </span>
                    )
                  )}
                  <button
                    type="button"
                    disabled={current === pageCount}
                    onClick={() => setPage(current + 1)}
                    className="rounded-lg bg-[#eef2f1] px-3 py-1.5 font-semibold transition-colors hover:bg-[#dfe9e7] disabled:opacity-50"
                  >
                    {t("Next")}
                  </button>
                </nav>
            </div>
          </section>
        </>
      )}

      {enrollOpen && <EnrollDialog classes={classes} onClose={() => setEnrollOpen(false)} />}
    </div>
  );
}
