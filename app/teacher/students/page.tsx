"use client";

import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  ChartColumn,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock,
  Download,
  Search,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

function useTr() {
  const { t } = useI18n();
  return (s: string) => (/[A-Za-z]/.test(s) ? t(s) : s);
}

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


type Status = "On Track" | "Top Quartile" | "Struggling";

type Student = {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar: string; 
  photo: string; 
  className: string;
  lessonsDone: number;
  lessonsTotal: number;
  problemsDone: number;
  problemsTotal: number;
  mastery: number;
  timeSpent: string;
  lastActive: string;
  status: Status;
};

const STUDENTS: Student[] = [
  { id: "JH-9A-042", name: "Sara Hassan", email: "sara.hassan@edu.jh.org", initials: "SH", avatar: "bg-[#f06292]", photo: "/images/teacher/students/sara.png", className: "Grade 9A", lessonsDone: 14, lessonsTotal: 16, problemsDone: 48, problemsTotal: 52, mastery: 87, timeSpent: "4h 25m", lastActive: "Today, 10:14 AM", status: "On Track" },
  { id: "JH-9A-018", name: "Omar Ali", email: "omar.ali@edu.jh.org", initials: "OA", avatar: "bg-[#12939b]", photo: "/images/teacher/students/omar.png", className: "Grade 9A", lessonsDone: 16, lessonsTotal: 16, problemsDone: 52, problemsTotal: 52, mastery: 92, timeSpent: "5h 10m", lastActive: "Today, 08:42 AM", status: "Top Quartile" },
  { id: "JH-9A-031", name: "Youssef Ahmed", email: "youssef.ahmed@edu.jh.org", initials: "YA", avatar: "bg-[#f5a524]", photo: "/images/teacher/students/youssef.png", className: "Grade 9A", lessonsDone: 12, lessonsTotal: 16, problemsDone: 39, problemsTotal: 52, mastery: 61, timeSpent: "3h 15m", lastActive: "Yesterday", status: "Struggling" },
  { id: "JH-9A-012", name: "Zainab Ezzat", email: "zainab.ezzat@edu.jh.org", initials: "ZE", avatar: "bg-[#ff8a65]", photo: "/images/teacher/students/zainab.png", className: "Grade 9A", lessonsDone: 16, lessonsTotal: 16, problemsDone: 50, problemsTotal: 52, mastery: 94, timeSpent: "4h 50m", lastActive: "Today, 11:20 AM", status: "Top Quartile" },
  { id: "JH-9A-027", name: "Karim Tarek", email: "karim.tarek@edu.jh.org", initials: "KT", avatar: "bg-[#5c6bc0]", photo: "/images/teacher/students/karim.png", className: "Grade 9A", lessonsDone: 13, lessonsTotal: 16, problemsDone: 44, problemsTotal: 52, mastery: 72, timeSpent: "3h 55m", lastActive: "2 days ago", status: "On Track" },
  { id: "JH-9B-009", name: "Lina Hamdy", email: "lina.hamdy@edu.jh.org", initials: "LH", avatar: "bg-[#7c5cff]", photo: "/images/teacher/students/lina.png", className: "Grade 9B", lessonsDone: 14, lessonsTotal: 16, problemsDone: 46, problemsTotal: 52, mastery: 79, timeSpent: "4h 05m", lastActive: "Today, 09:12 AM", status: "On Track" },
];

const TOTAL_STUDENTS = 54;
const PAGES = [1, 2, 3, "…", 9] as const;

const CLASS_OPTIONS = ["All Classes", "Grade 9A", "Grade 9B"];

type Filter = "all" | "struggling" | "on-track" | "top";
const FILTERS: { key: Filter; label: string; count: number; status?: Status }[] = [
  { key: "all", label: "All", count: 54 },
  { key: "struggling", label: "Struggling", count: 3, status: "Struggling" },
  { key: "on-track", label: "On Track", count: 41, status: "On Track" },
  { key: "top", label: "Top Quartile", count: 10, status: "Top Quartile" },
];

const STATUS_STYLE: Record<Status, string> = {
  "On Track": "bg-[#eef2f1] text-[#1B2D54]/70",
  "Top Quartile": "bg-[#c9efe9] text-[#14757d]",
  Struggling: "bg-[#fde8e8] text-[#c81e1e]",
};

const COLUMNS = [
  "Student",
  "Student ID",
  "Class",
  "Lessons",
  "Problems Solved",
  "Mastery",
  "Time Spent",
  "Last Active",
  "Status",
];

function masteryTone(value: number) {
  if (value >= 90) return { bg: "bg-[#e2f6ea]", dot: "bg-[#22a559]", text: "text-[#168a45]" };
  if (value >= 70) return { bg: "bg-[#fff1d6]", dot: "bg-[#f5a524]", text: "text-[#c76a0a]" };
  return { bg: "bg-[#fde8e8]", dot: "bg-[#e5484d]", text: "text-[#c81e1e]" };
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
  const tr = useTr();
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm">
      <div className="min-w-0 leading-tight">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
          {tr(label)}
        </p>
        <p className={cn("mt-1.5 text-2xl font-bold leading-none", danger && "text-[#e5484d]")}>
          <Bidi text={tr(value)} />
        </p>
        <p className={cn("mt-1.5 text-[10px] font-medium", noteTone)}>
          <Bidi text={tr(note)} />
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

function Avatar({ student }: { student: Student }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <Image
        src={student.photo}
        alt=""
        width={64}
        height={64}
        onError={() => setFailed(true)}
        className="size-8 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
        student.avatar
      )}
    >
      {student.initials}
    </span>
  );
}

function exportCsv(rows: Student[]) {
  const head = ["Name", "Email", "Student ID", "Class", "Lessons", "Problems solved", "Mastery %", "Time spent", "Last active", "Status"];
  const esc = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  const lines = rows.map((s) =>
    [s.name, s.email, s.id, s.className, `${s.lessonsDone}/${s.lessonsTotal}`, `${s.problemsDone}/${s.problemsTotal}`, s.mastery, s.timeSpent, s.lastActive, s.status]
      .map(esc)
      .join(",")
  );
  const csv = "\uFEFF" + [head.map(esc).join(","), ...lines].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "students.csv";
  a.click();
  URL.revokeObjectURL(url);
}


export default function StudentsPage() {
  const tr = useTr();
  const [classFilter, setClassFilter] = useState(CLASS_OPTIONS[0]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const status = FILTERS.find((f) => f.key === filter)?.status;
    const q = query.trim().toLowerCase();
    return STUDENTS.filter(
      (s) =>
        (classFilter === CLASS_OPTIONS[0] || s.className === classFilter) &&
        (!status || s.status === status) &&
        (!q || s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    );
  }, [classFilter, filter, query]);

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
            {tr("Cohort Analytics & Oversight")}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{tr("Students Directory")}</h1>
          <p className="mt-0.5 max-w-xl text-[11px] text-[#1B2D54]/70">
            {tr("Manage student roster, track mastery velocity, and review individualized learning interventions.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportCsv(rows)}
            className="flex items-center gap-1.5 rounded-xl border border-[#e3ece9] bg-white px-4 py-2 text-[11px] font-semibold shadow-sm transition-colors hover:bg-[#f6f9f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <Download aria-hidden className="size-3.5" />
            {tr("Export Roster CSV")}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
          >
            <UserPlus aria-hidden className="size-3.5" />
            {tr("Enroll Student")}
          </button>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Enrolled" value="54" note="Across 2 Sections" noteTone="text-[#14757d]" icon={<Users aria-hidden className="size-5" />} />
        <StatCard label="Cohort Mastery" value="81.3%" note="+3.4% w/w" noteTone="text-[#168a45]" icon={<CircleCheck aria-hidden className="size-5" />} />
        <StatCard label="Struggling Alerts" value="3" note="Immediate review" noteTone="text-[#1B2D54]/60" danger icon={<CircleAlert aria-hidden className="size-5" />} />
        <StatCard label="Avg Practice Hours" value="4.4h" note="Per student/wk" noteTone="text-[#1B2D54]/60" icon={<Clock aria-hidden className="size-5" />} />
      </div>

      <section className="rounded-2xl border border-[#e3ece9] bg-white shadow-sm">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-2">
            <div className="relative">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                aria-label={tr("Class")}
                className="w-36 appearance-none rounded-lg border border-[#e3ece9] bg-white py-2 ps-3 pe-8 text-[11px] font-medium outline-none focus:border-[#12939b] focus:ring-2 focus:ring-[#12939b]/20"
              >
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {tr(c)}
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
                    onClick={() => setFilter(f.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
                      active ? "bg-[#1B2D54] text-white" : "bg-[#f1f3f5] text-[#1B2D54] hover:bg-[#e6eaec]"
                    )}
                  >
                    {tr(f.label)}
                    <span
                      className={cn(
                        "text-[9px] font-medium",
                        active && "text-white/70",
                        !active && f.key === "struggling" && "rounded-full bg-[#fde8e8] px-1.5 text-[#c81e1e]",
                        !active && f.key !== "struggling" && "text-[#1B2D54]/50"
                      )}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="relative block">
              <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={tr("Search student by name or ID...")}
                aria-label={tr("Search student by name or ID...")}
                className="w-full rounded-lg border border-transparent bg-[#f1f3f5] py-2.5 ps-9 pe-3 text-[11px] outline-none placeholder:text-[#1B2D54]/50 focus:border-[#12939b] focus:bg-white focus:ring-2 focus:ring-[#12939b]/20 sm:w-64"
              />
            </label>
            <button
              type="button"
              aria-label={tr("More filters")}
              // TODO: open the advanced filters
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f3f5] text-[#1B2D54] transition-colors hover:bg-[#e6eaec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
            >
              <SlidersHorizontal aria-hidden className="size-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-start text-[11px]">
            <thead>
              <tr className="border-y border-[#e3ece9] bg-[#f6f9f8] text-[9px] font-semibold uppercase tracking-wide text-[#1B2D54]/60 rtl:normal-case rtl:tracking-normal">
                {COLUMNS.map((c) => (
                  <th key={c} scope="col" className="px-4 py-2.5 text-start font-semibold">
                    {tr(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const lessonsPct = Math.round((s.lessonsDone / s.lessonsTotal) * 100);
                const tone = masteryTone(s.mastery);
                return (
                  <tr key={s.id} className="border-b border-[#e3ece9] transition-colors last:border-b-0 hover:bg-[#f6f9f8]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar student={s} />
                        <div className="min-w-0 leading-tight">
                          <p className="truncate text-xs font-semibold">{s.name}</p>
                          <p className="truncate text-[10px] text-[#1B2D54]/55">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#1B2D54]/70">
                      <bdi>{s.id}</bdi>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-[#eef2f1] px-2 py-0.5 text-[10px] font-medium">{tr(s.className)}</span>
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
                        <span className="font-semibold">{s.problemsDone}</span>
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
                        <bdi>{s.mastery}%</bdi>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1B2D54]/80">
                      <Bidi text={tr(s.timeSpent)} />
                    </td>
                    <td className="px-4 py-3 text-[#1B2D54]/80">
                      <Bidi text={tr(s.lastActive)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-2 py-1 text-[10px] font-semibold", STATUS_STYLE[s.status])}>
                        {tr(s.status)}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-[#1B2D54]/60">
                    {tr("No students match your filters.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: count + pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e3ece9] p-4 text-[10px] sm:flex-row">
          <p className="text-[#1B2D54]/70">
            {tr("Showing")} <strong className="text-[#1B2D54]">
              <bdi dir="ltr">{rows.length > 0 ? `1-${rows.length}` : "0"}</bdi>
            </strong> {tr("of")}{" "}
            <strong className="text-[#1B2D54]">{TOTAL_STUDENTS}</strong> {tr("students")}
          </p>

          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg bg-[#eef2f1] px-3 py-1.5 font-semibold transition-colors hover:bg-[#dfe9e7] disabled:opacity-50"
            >
              {tr("Previous")}
            </button>
            {PAGES.map((p, i) =>
              typeof p === "number" ? (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={page === p ? "page" : undefined}
                  className={cn(
                    "size-7 rounded-lg font-semibold transition-colors",
                    page === p ? "bg-[#1B2D54] text-white" : "hover:bg-[#eef2f1]"
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
              disabled={page === 9}
              onClick={() => setPage((p) => Math.min(9, p + 1))}
              className="rounded-lg bg-[#eef2f1] px-3 py-1.5 font-semibold transition-colors hover:bg-[#dfe9e7] disabled:opacity-50"
            >
              {tr("Next")}
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
