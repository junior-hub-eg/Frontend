"use client";

import { Suspense, useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Download,
  ExternalLink,
  GraduationCap,
  Megaphone,
  Search,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  getTeacherClass,
  getTeacherClasses,
  type ClassStudentStatus,
  type TeacherClass,
  type TeacherClassDetail,
} from "@/lib/teacher-api";
import { LoadBlock, StudentAvatar, SUBJECT_LABEL, useTeacherData } from "@/components/teacher/teacher-ui";

type TabKey = "students" | "invite" | "lesson" | "assignments";

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "students", label: tk("Students"), icon: Users },
  { key: "invite", label: tk("Invite & Access"), icon: UserPlus },
  { key: "lesson", label: tk("Weekly Lesson Plan"), icon: CalendarCheck },
  { key: "assignments", label: tk("Assignments"), icon: ClipboardList },
];

const STATUS_LABEL: Record<ClassStudentStatus, string> = {
  TopQuartile: tk("Top Quartile"),
  OnTrack: tk("On Track"),
  NeedsAssistance: tk("Needs Assistance"),
};

const QUICK_LINKS = [
  { title: tk("Digital Curriculum"), note: tk("Textbook & Guide"), icon: GraduationCap, trailing: ExternalLink },
  { title: tk("AI Grading Copilot"), note: tk("Auto-diagnostic summaries"), icon: Sparkles, trailing: ExternalLink },
  { title: tk("Class Announcements"), note: tk("Broadcast to parents & students"), icon: Megaphone, trailing: ChevronRight },
];

const STATUS_STYLE: Record<ClassStudentStatus, string> = {
  TopQuartile: "bg-[#eef2f1] text-[#1B2D54]/70",
  OnTrack: "bg-[#c9f1f0] text-[#14757d]",
  NeedsAssistance: "bg-[#fde8e8] text-[#c62828]",
};

function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-[#e3ece9] bg-white px-3 py-2">
      <p className="truncate text-[9px] text-[#1B2D54]/60">{label}</p>
      <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
        <span className="text-lg font-bold leading-none text-[#14757d]">{value}</span>
        {suffix && <span className="text-[9px] text-[#1B2D54]/60">{suffix}</span>}
      </p>
    </div>
  );
}

function ClassCard({ c, subjects, active, onSelect }: { c: TeacherClass; subjects: string; active: boolean; onSelect: () => void }) {
  const t = useT();
  return (
    <Card
      className={cn(
        "w-[88%] min-w-0 shrink-0 snap-start p-4 transition-colors sm:w-[400px]",
        active && "bg-[#f4fbfa] ring-2 ring-[#14757d]"
      )}
    >
      <button type="button" onClick={onSelect} className="block w-full text-start">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#c9efe9] text-sm font-bold text-[#14757d]">
            {c.name}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold">
                {t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}
                {subjects && ` • ${subjects}`}
              </h3>
              <span className="rounded-full bg-[#dff5e8] px-2 py-0.5 text-[9px] font-medium text-[#22a559]">{t("Active Class")}</span>
              {c.pendingRequests > 0 && (
                <span className="rounded-full bg-[#fdeec2] px-2 py-0.5 text-[9px] font-medium text-[#a8740a]">
                  {t("{count} waiting to join", { count: c.pendingRequests })}
                </span>
              )}
            </div>
            <p className="mt-1 text-[10px] text-[#1B2D54]/60">
              {t("Join code")}: <span dir="ltr" className="font-mono font-semibold">{c.joinCode}</span> •{" "}
              {t("{count} open assignments", { count: c.openAssignments })}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <MiniStat label={t("Class Size")} value={String(c.students)} suffix={t("Students")} />
          <MiniStat label={t("Active Rate")} value={`${c.activeRate}%`} />
          <MiniStat label={t("Avg Score")} value={c.averageScore === null ? "—" : `${c.averageScore}%`} suffix={t("Mastery")} />
        </div>

        <div className="mt-4 flex items-center justify-between text-[10px]">
          <span className="font-medium">
            {t("This week")}: {c.currentPlan ?? t("No lesson planned")}
          </span>
          <span className="font-semibold text-[#14757d]">{t("{percent}% active this week", { percent: c.activeRate })}</span>
        </div>
        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#c9efe9]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={c.activeRate}
        >
          <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${c.activeRate}%` }} />
        </div>
      </button>
    </Card>
  );
}

function Slider({ children, className }: { children: ReactNode; className?: string }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative min-w-0">
      {!atStart && (
        <button
          type="button"
          aria-label={t("Previous")}
          onClick={() => scrollBy(-1)}
          className="absolute -start-3 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B2D54] shadow-md hover:bg-[#f6f9f8] lg:grid"
        >
          <ChevronLeft aria-hidden className="size-4 rtl:rotate-180" />
        </button>
      )}
      {!atEnd && (
        <button
          type="button"
          aria-label={t("Next")}
          onClick={() => scrollBy(1)}
          className="absolute -end-3 top-1/2 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B2D54] shadow-md hover:bg-[#f6f9f8] lg:grid"
        >
          <ChevronRight aria-hidden className="size-4 rtl:rotate-180" />
        </button>
      )}

      <div
        ref={ref}
        onScroll={update}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !ref.current) return;
          drag.current = { active: true, startX: e.clientX, startLeft: ref.current.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (drag.current.active && ref.current) ref.current.scrollLeft = drag.current.startLeft - (e.clientX - drag.current.startX);
        }}
        onPointerUp={() => (drag.current.active = false)}
        onPointerLeave={() => (drag.current.active = false)}
        className={cn(
          "flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab active:cursor-grabbing",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

type SortKey = "attendance" | "mastery" | "name";

export default function MyClassesPage() {
  return (
    <Suspense fallback={null}>
      <MyClasses />
    </Suspense>
  );
}

function MyClasses() {
  const t = useT();
  const params = useSearchParams();
  const classes = useTeacherData(getTeacherClasses, tk("We couldn't load your classes. Please try again."));
  const [chosen, setChosen] = useState<string | null>(params.get("class"));
  const requestedTab = params.get("tab");
  const [tab, setTab] = useState<TabKey>(TABS.some((x) => x.key === requestedTab) ? (requestedTab as TabKey) : "students");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("attendance");

  const list = classes.data ?? [];
  const activeClass = list.some((c) => c.id === chosen) ? chosen! : list[0]?.id ?? null;
  const loadDetail = useCallback(
    (): Promise<TeacherClassDetail | null> => (activeClass ? getTeacherClass(activeClass) : Promise.resolve(null)),
    [activeClass],
  );
  const detail = useTeacherData(loadDetail, tk("We couldn't load this class. Please try again."));
  const d = detail.data && detail.data.id === activeClass ? detail.data : null;
  const subjects = d ? d.subjects.map((x) => t(SUBJECT_LABEL[x])).join(" • ") : "";

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const found = (d?.students ?? []).filter(
      (s) => !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.id.toLowerCase().startsWith(q),
    );
    return [...found].sort((a, b) =>
      sort === "name" ? a.fullName.localeCompare(b.fullName) : sort === "mastery" ? (b.mastery ?? -1) - (a.mastery ?? -1) : b.attendance - a.attendance,
    );
  }, [d, query, sort]);

  if (!classes.data) {
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
        <LoadBlock error={classes.error} onRetry={classes.reload} />
      </div>
    );
  }

  const current = list.find((c) => c.id === activeClass);
  const tabLabel = (key: TabKey, label: string) =>
    key === "students" && d ? `${t(label)} (${d.students.length})` : key === "assignments" && d ? `${t(label)} (${d.assignments.length})` : t(label);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      {/* ---------------- Title + class switcher ---------------- */}
      <header className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#14757d]">
            <GraduationCap aria-hidden className="size-3.5" />
            {t("{count} classes", { count: list.length })}
          </p>
          <h1 className="mt-1 text-2xl font-bold">{t("My Classes")}</h1>
          <p className="mt-0.5 text-[11px] text-[#1B2D54]/70">{t("Track your classes and your students' performance.")}</p>
        </div>

        <div className="min-w-0 max-w-full rounded-full bg-white/80 p-0.5 shadow-sm ring-1 ring-[#e3ece9] lg:max-w-[340px]">
          <div className="flex gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {list.map((c) => {
              const active = activeClass === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChosen(c.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
                    active ? "bg-[#14757d] text-white" : "text-[#1B2D54] hover:bg-[#14757d]/10"
                  )}
                >
                  {t("Class {name}", { name: c.name })}
                  {active && <span aria-hidden className="size-1.5 rounded-full bg-[#4da3ff]" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {list.length === 0 && (
        <Card className="text-center text-[11px] text-[#1B2D54]/70">{t("No classes yet. Ask the school admin to link your classes.")}</Card>
      )}

      <Slider>
        {list.map((c) => (
          <ClassCard key={c.id} c={c} subjects={c.id === activeClass ? subjects : ""} active={activeClass === c.id} onSelect={() => setChosen(c.id)} />
        ))}
      </Slider>

      <Card className="p-0">
        <div className="border-b border-[#e3ece9] px-5 pt-4">
          <div role="tablist" className="flex flex-wrap items-center gap-4">
            {TABS.map(({ key, label, icon: Icon }) => {
              const dot = key === "invite" && (current?.pendingRequests ?? 0) > 0;
              return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 pb-3 text-[11px] font-semibold transition-colors",
                  tab === key ? "border-[#14757d] text-[#14757d]" : "border-transparent text-[#1B2D54]/70 hover:text-[#1B2D54]"
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {tabLabel(key, label)}
                {dot && <span aria-label={t("New")} className="size-1.5 rounded-full bg-[#e5484d]" />}
              </button>
              );
            })}
          </div>

          <p className="flex items-center gap-1.5 py-2.5 text-[10px] font-medium text-[#1B2D54]/70">
            <CircleCheck aria-hidden className="size-3.5 shrink-0 text-[#14757d]" />
            {current ? t("Grade {grade} • Class {name}", { grade: current.grade, name: current.name }) : ""}
          </p>
        </div>

        {tab === "students" && !d ? (
          <LoadBlock error={detail.error} onRetry={detail.reload} />
        ) : tab === "students" && d ? (
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="relative w-full max-w-[280px]">
                <Search aria-hidden className="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-[#1B2D54]/50" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("Filter by student name, ID...")}
                  className="h-9 w-full rounded-lg border border-[#e3ece9] bg-[#f6f9f8] ps-9 pe-3 text-[11px] outline-none placeholder:text-[#1B2D54]/50 focus:ring-2 focus:ring-[#12939b]/40"
                />
              </label>

              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#1B2D54]/60">{t("Sort by:")}</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-8 rounded-lg border border-[#e3ece9] bg-white px-2 text-[10px] font-bold text-[#14243f] outline-none"
                >
                  <option value="attendance">{t("Attendance Rate")}</option>
                  <option value="mastery">{t("Mastery")}</option>
                  <option value="name">{t("Name")}</option>
                </select>
                <button
                  type="button"
                  aria-label={t("Export")}
                  className="grid size-8 place-items-center rounded-lg border border-[#e3ece9] bg-white hover:bg-[#f6f9f8]"
                >
                  <Download aria-hidden className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl bg-[#f6f9f8]">
              <table className="w-full min-w-[720px] text-start text-[10px]">
                <thead>
                  <tr className="text-start text-[9px] font-bold text-[#1B2D54]/70">
                    <th className="px-4 py-2.5 text-start">{t("Student Name")}</th>
                    <th className="px-3 py-2.5 text-start">{t("Student ID")}</th>
                    <th className="px-3 py-2.5 text-start">{t("Attendance")}</th>
                    <th className="px-3 py-2.5 text-start">{t("Mastery")}</th>
                    <th className="px-3 py-2.5 text-start">{t("Status")}</th>
                    <th className="px-3 py-2.5 text-center">{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const low = (s.mastery ?? s.attendance) < 60;
                    const lowAttendance = s.attendance < 50;
                    return (
                      <tr key={s.id} className="border-t border-[#e3ece9] bg-white">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={32} />
                            <div className="leading-tight">
                              <p className="text-[11px] font-bold text-[#14243f]">{s.fullName}</p>
                              <p dir="ltr" className="font-mono text-[9px] text-[#1B2D54]/55 rtl:text-end">
                                {s.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td dir="ltr" className="px-3 py-3 font-mono text-[#1B2D54]/55 rtl:text-end">
                          {s.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td dir="ltr" className={cn("px-3 py-3 font-bold rtl:text-end", lowAttendance ? "text-[#c62828]" : "text-[#14243f]")}>
                          {s.attendance}%
                        </td>
                        <td className="px-3 py-3">
                          {s.mastery === null ? (
                            <span className="text-[#1B2D54]/50">{t("No grades yet")}</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[#e3ece9]">
                                <div
                                  className={cn("h-full rounded-full", low ? "bg-[#c62828]" : "bg-[#0b6b70]")}
                                  style={{ width: `${s.mastery}%` }}
                                />
                              </div>
                              <span dir="ltr" className={cn("font-bold", low ? "text-[#c62828]" : "text-[#0b6b70]")}>
                                {s.mastery}%
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span className={cn("rounded-full px-2.5 py-1 text-[9px] font-bold", STATUS_STYLE[s.status])}>
                            {t(STATUS_LABEL[s.status])}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            type="button"
                            className="rounded-lg bg-[#eef0f2] px-3 py-1.5 text-[10px] font-bold text-[#14243f] transition-colors hover:bg-[#e1e5e8]"
                          >
                            {t("Details")} <span className="inline-block rtl:rotate-180">→</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-[#1B2D54]/60">
                        {t("No students match your search.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px]">
              <p className="font-medium text-[#1B2D54]/70">
                {t("Showing {shown} of {total} students in Class {name}", { shown: rows.length, total: d.students.length, name: d.name })}
              </p>
            </div>
          </div>
        ) : (
          <p className="p-8 text-center text-[11px] text-[#1B2D54]/60">{t("This tab is coming soon.")}</p>
        )}
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        {QUICK_LINKS.map(({ title, note, icon: Icon, trailing: Trailing }) => (
          <button
            key={title}
            type="button"
            className="flex items-center gap-3 rounded-2xl border border-[#e3ece9] bg-white p-3 text-start shadow-sm transition-colors hover:bg-[#f6f9f8]"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#c9efe9] text-[#14757d]">
              <Icon aria-hidden className="size-4" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[11px] font-semibold">{t(title)}</span>
              <span className="block truncate text-[9px] text-[#1B2D54]/60">{t(note)}</span>
            </span>
            <Trailing aria-hidden className="size-3.5 shrink-0 text-[#1B2D54]/60 rtl:rotate-180" />
          </button>
        ))}
      </div>
    </div>
  );
}