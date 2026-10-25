"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  CircleCheck,
  ClipboardCheck,
  Clock,
  Copy,
  FilePlus,
  Layers,
  Lightbulb,
  Network,
  Pencil,
  Plus,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { getTeacherAssignments, getTeacherDashboard, getTeacherProfile, type SchoolSubject } from "@/lib/teacher-api";
import {
  getCurriculum,
  updateCurriculumLesson,
  updateCurriculumUnit,
  type CurriculumLesson,
  type CurriculumProblem,
  type CurriculumUnit,
} from "@/lib/teacher-curriculum-api";
import { errorMessage } from "@/lib/api-client";
import { Card, LoadBlock, SUBJECT_LABEL, useTeacherData } from "@/components/teacher/teacher-ui";
import { QuickAssignmentDialog, useToast } from "@/components/teacher/teacher-dialogs";
import {
  DIFFICULTY_LABEL,
  LessonDialog,
  ProblemDialog,
  STATUS_LABEL,
  UnitDialog,
} from "@/components/teacher/curriculum/curriculum-dialogs";

function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-block", className)}>
      {children}
    </span>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Published: "bg-[#e6e9eb] text-[#1B2D54]/70",
  Draft: "bg-[#fff1d6] text-[#8a5a00]",
};

const DIFFICULTY_TEXT_STYLE: Record<string, string> = {
  Beginner: "text-[#0b6b70]",
  Intermediate: "text-[#2d3a8c]",
  Advanced: "text-[#7a2d8c]",
};

const DIFFICULTY_CHIP_STYLE: Record<string, string> = {
  Beginner: "bg-[#bff3f3] text-[#0b6b70]",
  Intermediate: "bg-[#e3e7ff] text-[#2d3a8c]",
  Advanced: "bg-[#f3e3ff] text-[#7a2d8c]",
};

const NUMBER_STYLE = ["bg-[#0b6b70] text-white", "bg-[#14243f] text-white", "bg-[#e3e7e9] text-[#1B2D54]/70"];

const VIDEO_POSTER = "/images/teacher/curriculum/lesson-video.png";
const STUDENT_PAGE = "/learner/ai-curriculum";

function Pill({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={cn("shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-semibold", className)}>{children}</span>;
}

type ButtonTone = "teal" | "navy" | "gray" | "outline";

const BUTTON_TONE: Record<ButtonTone, string> = {
  teal: "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
  navy: "bg-[#14243f] text-white hover:bg-[#0e1a2e]",
  gray: "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]",
  outline: "border border-[#e3ece9] bg-white text-[#14243f] hover:bg-[#f6f9f8]",
};

const buttonClass = (tone: ButtonTone) =>
  cn(
    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40 disabled:opacity-60",
    BUTTON_TONE[tone],
  );

function ActionButton({
  tone,
  icon,
  children,
  onClick,
  disabled,
}: {
  tone: ButtonTone;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={buttonClass(tone)}>
      {icon}
      {children}
    </button>
  );
}

function LessonDot({ draft, selected }: { draft: boolean; selected: boolean }) {
  if (selected) return <span aria-hidden className="mt-0.5 size-2 shrink-0 rounded-full bg-[#0b6b70]" />;
  return (
    <span
      aria-hidden
      className={cn("mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full border-2", draft ? "border-[#1B2D54]/40" : "border-[#1B2D54]/60")}
    >
      {!draft && <span className="size-1.5 rounded-full bg-[#1B2D54]/60" />}
    </span>
  );
}

function StatCard({ icon, value, label, hint }: { icon: ReactNode; value: ReactNode; label: string; hint: string }) {
  return (
    <div className="flex min-w-[10.5rem] items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-[#e3ece9]">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#eaf6f6] text-[#0b6b70]">{icon}</span>
      <div className="min-w-0 leading-tight">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] font-semibold">{label}</p>
        <p className="mt-0.5 text-[9px] leading-snug text-[#1B2D54]/60">{hint}</p>
      </div>
    </div>
  );
}

export default function CurriculumPage() {
  const { t } = useI18n();
  const profile = useTeacherData(getTeacherProfile, t("Could not load your profile."));
  const [subjectChoice, setSubjectChoice] = useState<SchoolSubject | null>(null);
  const [gradeChoice, setGradeChoice] = useState<number | null>(null);

  if (!profile.data) {
    return (
      <div className="flex min-w-0 flex-1 flex-col pt-4">
        <LoadBlock error={profile.error} onRetry={profile.reload} />
      </div>
    );
  }

  const subjects = profile.data.subjects;
  const grades = profile.data.grades;
  const subject = subjectChoice && subjects.includes(subjectChoice) ? subjectChoice : (subjects[0] ?? "Math");
  const grade = gradeChoice != null && grades.includes(gradeChoice) ? gradeChoice : (grades[0] ?? null);

  return (
    <Workspace
      key={`${subject}-${grade}`}
      subjects={subjects}
      grades={grades}
      subject={subject}
      grade={grade}
      onSubject={setSubjectChoice}
      onGrade={setGradeChoice}
    />
  );
}

function Workspace({
  subjects,
  grades,
  subject,
  grade,
  onSubject,
  onGrade,
}: {
  subjects: SchoolSubject[];
  grades: number[];
  subject: SchoolSubject;
  grade: number | null;
  onSubject: (s: SchoolSubject) => void;
  onGrade: (g: number) => void;
}) {
  const { t, locale } = useI18n();
  const toast = useToast();

  const loadCurriculum = useCallback(() => getCurriculum(subject, grade ?? undefined), [subject, grade]);
  const curriculum = useTeacherData(loadCurriculum, t("Could not load the curriculum."));
  const dashboard = useTeacherData(getTeacherDashboard, t("Could not load your classes."));
  const loadAssignments = useCallback(() => getTeacherAssignments(), []);
  const assignments = useTeacherData(loadAssignments, t("Could not load the assignments."));

  const [chosenLesson, setChosenLesson] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string> | null>(null);
  const [dialog, setDialog] = useState<
    | { kind: "unit"; unit?: CurriculumUnit }
    | { kind: "lesson"; lesson?: CurriculumLesson; unitId?: string }
    | { kind: "problem"; problem?: CurriculumProblem }
    | { kind: "assignment" }
    | null
  >(null);
  const [sharing, setSharing] = useState(false);

  const titleOf = useCallback(
    (x: { titleAr: string; titleEn: string }) => (locale === "ar" ? x.titleAr || x.titleEn : x.titleEn || x.titleAr),
    [locale],
  );
  const textOf = (ar: string | null, en: string | null) => (locale === "ar" ? ar || en : en || ar) ?? "";

  const units = useMemo(() => curriculum.data ?? [], [curriculum.data]);
  const allLessons = units.flatMap((u, ui) => u.lessons.map((l, li) => ({ lesson: l, unit: u, ui, li })));
  const selected = allLessons.find((x) => x.lesson.id === chosenLesson) ?? allLessons[0] ?? null;
  const open = openIds ?? new Set(selected ? [selected.unit.id] : units[0] ? [units[0].id] : []);
  const toggle = (id: string) => {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  const totalStudents = dashboard.data?.stats.totalEnrolled;
  const pendingReviews = assignments.data?.reduce((sum, a) => sum + Math.max(0, a.submitted - a.graded), 0);
  const recent = [...(assignments.data ?? [])].sort((a, b) => b.openUtc.localeCompare(a.openUtc)).slice(0, 2);
  const lessonCount = allLessons.length;
  const problemCount = allLessons.reduce((n, x) => n + x.lesson.problems.length, 0);

  async function share() {
    if (!selected) return;
    const { lesson, unit } = selected;
    setSharing(true);
    try {
      if (lesson.status !== "Published" || unit.status !== "Published") {
        if (unit.status !== "Published") {
          await updateCurriculumUnit(unit.id, {
            titleAr: unit.titleAr,
            titleEn: unit.titleEn,
            descriptionAr: unit.descriptionAr,
            descriptionEn: unit.descriptionEn,
            orderIndex: unit.orderIndex,
            status: "Published",
          });
        }
        if (lesson.status !== "Published") {
          await updateCurriculumLesson(lesson.id, {
            titleAr: lesson.titleAr,
            titleEn: lesson.titleEn,
            summaryAr: lesson.summaryAr,
            summaryEn: lesson.summaryEn,
            orderIndex: lesson.orderIndex,
            status: "Published",
          });
        }
        await curriculum.reload();
        toast.show(t("Lesson published: your students can see it now."));
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}${STUDENT_PAGE}`);
        toast.show(t("Link to the students' lesson page copied."));
      }
    } catch (e) {
      toast.show(errorMessage(e));
    } finally {
      setSharing(false);
    }
  }

  const afterSave = (lessonId?: string) => {
    setDialog(null);
    if (lessonId) setChosenLesson(lessonId);
    void curriculum.reload();
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 pb-6 pt-4 font-[family-name:var(--font-poppins)] text-[#1B2D54]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[453px] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        <Image src="/images/learner/projects/background.png" alt="" fill priority sizes="100vw" className="object-cover object-top" />
      </div>

      <header className="flex min-w-0 flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 ps-3">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#0b6b70] px-2.5 py-1 text-[9px] font-semibold text-white">
            <span aria-hidden className="size-1.5 rounded-full bg-[#7ff0c6]" />
            {t(SUBJECT_LABEL[subject])}
            {grade != null && <> • {t("Grade {grade}", { grade })}</>}
          </p>
          <h1 className="mt-2 max-w-[26rem] text-2xl font-bold leading-tight">{t("My Lessons & Teaching Plan")}</h1>
          <p className="mt-2 max-w-[32rem] text-xs leading-relaxed text-[#1B2D54]/75">
            {t("Prepare your units and lessons, add practice activities, and review what your students hand in.")}
          </p>
        </div>

        <div className="grid shrink-0 grid-cols-2 items-stretch gap-3">
          <StatCard
            icon={<Users aria-hidden className="size-4" />}
            value={<Ltr>{totalStudents ?? "–"}</Ltr>}
            label={t("Total Students")}
            hint={t("Active Enrolled")}
          />
          <StatCard
            icon={<Clock aria-hidden className="size-4" />}
            value={<Ltr>{pendingReviews ?? "–"}</Ltr>}
            label={t("Pending Reviews")}
            hint={t("To Grade")}
          />
        </div>
      </header>

      <Card className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Layers aria-hidden className="size-4 text-[#0b6b70]" />
          <h2 className="text-xs font-semibold">{t("My Teaching Workspace")}</h2>
          {subjects.length > 1 && (
            <div role="group" aria-label={t("Switch subject")} className="flex flex-wrap gap-1 rounded-full bg-[#eef0f2] p-0.5">
              {subjects.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={s === subject}
                  onClick={() => onSubject(s)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[9px] font-semibold transition-colors",
                    s === subject ? "bg-[#0b6b70] text-white" : "text-[#1B2D54]/70 hover:bg-white",
                  )}
                >
                  {t(SUBJECT_LABEL[s])}
                </button>
              ))}
            </div>
          )}
          {grades.length > 1 && (
            <select
              aria-label={t("Grade")}
              value={grade ?? ""}
              onChange={(e) => onGrade(Number(e.target.value))}
              className="h-7 rounded-full border border-[#e3ece9] bg-white px-2 text-[9px] font-semibold"
            >
              {grades.map((g) => (
                <option key={g} value={g}>
                  {t("Grade {grade}", { grade: g })}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton tone="teal" icon={<Plus aria-hidden className="size-3.5" />} onClick={() => setDialog({ kind: "lesson", unitId: selected?.unit.id })}>
            {t("Create Lesson")}
          </ActionButton>
          <ActionButton tone="outline" icon={<FilePlus aria-hidden className="size-3.5" />} onClick={() => setDialog({ kind: "assignment" })}>
            {t("Create Assignment")}
          </ActionButton>
          <Link href="/teacher/assignments" className={buttonClass("navy")}>
            <ClipboardCheck aria-hidden className="size-3.5" />
            {t("Review Submissions")}
          </Link>
        </div>
      </Card>

      {subjects.includes("Language") && (
        <Link
          href="/teacher/curriculum/grammar"
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#0b6b70] to-[#14243f] px-4 py-3 text-white shadow-sm transition-opacity hover:opacity-95 rtl:bg-gradient-to-l"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15">
            <Sparkles aria-hidden className="size-4" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block text-xs font-bold">{t("Arabic grammar coach — review AI parsing")}</span>
            <span className="mt-0.5 block text-[10px] text-white/80">{t("Review how the AI parses your students' sentences (i'rab).")}</span>
          </span>
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#0b6b70]">
            <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
          </span>
        </Link>
      )}

      {!curriculum.data ? (
        <LoadBlock error={curriculum.error} onRetry={curriculum.reload} />
      ) : (
        <div className="grid min-w-0 items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="flex items-center gap-2 text-xs font-semibold leading-tight">
                  <Network aria-hidden className="size-4 shrink-0 text-[#0b6b70]" />
                  {t("My Lessons & Teaching Plan")}
                </h2>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-end text-[9px] leading-tight text-[#1B2D54]/60">
                    {t("{units} units • {lessons} lessons • {problems} activities", { units: units.length, lessons: lessonCount, problems: problemCount })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: "unit" })}
                    className="flex items-center gap-1 text-[10px] font-semibold text-[#0b6b70] hover:underline"
                  >
                    <Plus aria-hidden className="size-3" />
                    {t("Add unit")}
                  </button>
                </div>
              </div>

              {units.length === 0 ? (
                <p className="mt-3 rounded-xl bg-[#f1f4f4] p-6 text-center text-[11px] text-[#1B2D54]/60">
                  {t("No units yet for this subject and grade. Add your first unit to start the plan.")}
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {units.map((u, ui) => {
                    const isOpen = open.has(u.id);
                    const active = selected?.unit.id === u.id;
                    const problems = u.lessons.reduce((n, l) => n + l.problems.length, 0);
                    return (
                      <li key={u.id}>
                        <div
                          className={cn(
                            "overflow-hidden rounded-xl",
                            active ? "bg-white shadow-sm ring-1 ring-[#e3ece9]" : "bg-[#f1f4f4]",
                            u.status === "Draft" && !active && "opacity-70",
                          )}
                        >
                          <div className={cn("flex items-center gap-1 pe-2", active && "bg-[#0b6b70] text-white")}>
                            <button
                              type="button"
                              onClick={() => toggle(u.id)}
                              aria-expanded={isOpen}
                              className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-start"
                            >
                              <span
                                className={cn(
                                  "grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-bold",
                                  active ? "bg-white text-[#0b6b70]" : "bg-[#bff3f3] text-[#0b6b70]",
                                )}
                              >
                                <Ltr>{ui + 1}</Ltr>
                              </span>
                              <div className="min-w-0 flex-1 leading-tight">
                                <p className="text-[11px] font-semibold">{t("Unit {n}: {title}", { n: ui + 1, title: titleOf(u) })}</p>
                                <p className={cn("mt-1 text-[9px]", active ? "text-white/80" : "text-[#1B2D54]/60")}>
                                  {t("{lessons} lessons • {problems} activities", { lessons: u.lessons.length, problems })}
                                </p>
                              </div>
                              <Pill className={active ? "bg-white text-[#0b6b70]" : (STATUS_STYLE[u.status] ?? STATUS_STYLE.Published)}>
                                {t(STATUS_LABEL[u.status] ?? u.status)}
                              </Pill>
                              <ChevronDown aria-hidden className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDialog({ kind: "unit", unit: u })}
                              aria-label={t("Edit unit")}
                              className={cn("grid size-7 shrink-0 place-items-center rounded-lg", active ? "hover:bg-white/15" : "text-[#0b6b70] hover:bg-white")}
                            >
                              <Pencil aria-hidden className="size-3.5" />
                            </button>
                          </div>

                          {isOpen && (
                            <ul className="flex flex-col gap-1 bg-white p-2">
                              {u.lessons.map((l, li) => {
                                const isSelected = selected?.lesson.id === l.id;
                                return (
                                  <li key={l.id}>
                                    <button
                                      type="button"
                                      onClick={() => setChosenLesson(l.id)}
                                      aria-pressed={isSelected}
                                      className={cn(
                                        "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2.5 text-start transition-colors",
                                        isSelected ? "bg-white shadow-sm ring-1 ring-[#0b6b70]" : "hover:bg-[#f6f9f8]",
                                      )}
                                    >
                                      <LessonDot draft={l.status === "Draft"} selected={isSelected} />
                                      <span className={cn("min-w-0 flex-1 text-[10px] leading-snug", isSelected ? "font-bold text-[#14243f]" : "font-medium")}>
                                        {t("Lesson {n}: {title}", { n: `${ui + 1}.${li + 1}`, title: titleOf(l) })}
                                      </span>
                                      <Pill className={isSelected && l.status !== "Draft" ? "bg-[#0b6b70] text-white" : (STATUS_STYLE[l.status] ?? STATUS_STYLE.Published)}>
                                        {t(STATUS_LABEL[l.status] ?? l.status)}
                                      </Pill>
                                    </button>

                                    {isSelected && l.problems.length > 0 && (
                                      <ul className="mx-1 mt-1 flex flex-col gap-2 rounded-lg bg-[#f1f4f4] p-3">
                                        {l.problems.map((p, pi) => (
                                          <li key={p.id} className="flex items-start gap-2">
                                            <CircleCheck aria-hidden className="mt-0.5 size-3.5 shrink-0 text-[#0b6b70]" />
                                            <span className="min-w-0 flex-1 text-[9px] leading-snug">
                                              {t("Challenge {n}: {title}", { n: pi + 1, title: titleOf(p) })}
                                            </span>
                                            <span className={cn("shrink-0 text-[9px] font-semibold", DIFFICULTY_TEXT_STYLE[p.difficulty] ?? "text-[#1B2D54]/60")}>
                                              {t(DIFFICULTY_LABEL[p.difficulty] ?? p.difficulty)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                );
                              })}
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setDialog({ kind: "lesson", unitId: u.id })}
                                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-[#0b6b70] hover:bg-[#f6f9f8]"
                                >
                                  <Plus aria-hidden className="size-3.5" />
                                  {t("Add a lesson to this unit")}
                                </button>
                              </li>
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold leading-tight">{t("Recent Assignment Submissions")}</h2>
                <Link href="/teacher/assignments" className="shrink-0 rounded-full bg-[#e6f7f2] px-2.5 py-0.5 text-[10px] font-semibold text-[#0b6b70] hover:underline">
                  {t("All assignments")}
                </Link>
              </div>

              {!assignments.data ? (
                <LoadBlock error={assignments.error} onRetry={assignments.reload} className="py-6" />
              ) : recent.length === 0 ? (
                <p className="mt-3 rounded-xl bg-[#f1f4f4] p-4 text-center text-[10px] text-[#1B2D54]/60">{t("No assignments yet.")}</p>
              ) : (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {recent.map((a) => {
                    const pct = a.enrolled > 0 ? Math.round((a.submitted / a.enrolled) * 100) : 0;
                    return (
                      <Link key={a.id} href="/teacher/assignments" className="rounded-xl bg-[#f1f4f4] px-3 py-2.5 transition-colors hover:bg-[#e8eeee]">
                        <p className="truncate text-[9px] font-medium text-[#1B2D54]/70" dir="auto">
                          {a.title}
                        </p>
                        <p className="mt-1 text-lg font-bold">
                          <Ltr>
                            {a.submitted} <span className="text-[10px] font-medium text-[#1B2D54]/60">/ {a.enrolled}</span>
                          </Ltr>
                        </p>
                        <p className="mt-0.5 text-[9px] font-semibold text-[#0b6b70]">
                          {t("{pct}% submitted", { pct })} • {t("Class {name}", { name: a.className })}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <Card className="flex min-w-0 flex-col gap-4 p-5">
            {!selected ? (
              <p className="rounded-xl bg-[#f1f4f4] p-8 text-center text-[11px] text-[#1B2D54]/60">
                {t("Create a lesson to see its details, video and activities here.")}
              </p>
            ) : (
              <LessonDetail
                key={selected.lesson.id}
                lesson={selected.lesson}
                breadcrumb={`${titleOf(selected.unit)} / ${t("Lesson {n}", { n: `${selected.ui + 1}.${selected.li + 1}` })}`}
                titleOf={titleOf}
                textOf={textOf}
                sharing={sharing}
                onEdit={() => setDialog({ kind: "lesson", lesson: selected.lesson })}
                onShare={share}
                onAddProblem={() => setDialog({ kind: "problem" })}
                onEditProblem={(problem) => setDialog({ kind: "problem", problem })}
              />
            )}
          </Card>
        </div>
      )}

      {dialog?.kind === "unit" && (
        <UnitDialog
          unit={dialog.unit}
          subject={subject}
          grade={grade ?? 9}
          nextOrder={Math.max(0, ...units.map((u) => u.orderIndex)) + 1}
          onClose={() => setDialog(null)}
          onSaved={() => afterSave()}
        />
      )}
      {dialog?.kind === "lesson" && (
        <LessonDialog
          lesson={dialog.lesson}
          unitId={dialog.unitId}
          units={units}
          titleOf={titleOf}
          onClose={() => setDialog(null)}
          onSaved={(id) => afterSave(id)}
        />
      )}
      {dialog?.kind === "problem" && selected && (
        <ProblemDialog problem={dialog.problem} lesson={selected.lesson} onClose={() => setDialog(null)} onSaved={() => afterSave()} />
      )}
      {dialog?.kind === "assignment" && (
        <QuickAssignmentDialog
          onClose={() => setDialog(null)}
          onCreated={() => void assignments.reload()}
          defaults={selected ? { title: titleOf(selected.lesson) } : undefined}
        />
      )}
      {toast.node}
    </div>
  );
}

function LessonDetail({
  lesson,
  breadcrumb,
  titleOf,
  textOf,
  sharing,
  onEdit,
  onShare,
  onAddProblem,
  onEditProblem,
}: {
  lesson: CurriculumLesson;
  breadcrumb: string;
  titleOf: (x: { titleAr: string; titleEn: string }) => string;
  textOf: (ar: string | null, en: string | null) => string;
  sharing: boolean;
  onEdit: () => void;
  onShare: () => void;
  onAddProblem: () => void;
  onEditProblem: (p: CurriculumProblem) => void;
}) {
  const { t, locale } = useI18n();
  const summary = textOf(lesson.summaryAr, lesson.summaryEn);
  const published = lesson.status === "Published";

  // The lesson's competencies: the topics its activities practise.
  const topics = new Map<string, CurriculumProblem[]>();
  for (const p of lesson.problems) {
    const key = p.topic.trim();
    if (key) topics.set(key, [...(topics.get(key) ?? []), p]);
  }

  return (
    <>
      <div>
        <p className="text-[9px] font-semibold uppercase text-[#0b6b70]">{breadcrumb}</p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <h2 className="min-w-0 max-w-[28rem] text-2xl font-bold leading-tight">{titleOf(lesson)}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton tone="outline" icon={<Pencil aria-hidden className="size-3.5" />} onClick={onEdit}>
              {t("Edit Lesson")}
            </ActionButton>
            <ActionButton
              tone="teal"
              icon={published ? <Share2 aria-hidden className="size-3.5" /> : <BadgeCheck aria-hidden className="size-3.5" />}
              onClick={onShare}
              disabled={sharing}
            >
              {published ? t("Share with Students") : t("Publish to Students")}
            </ActionButton>
          </div>
        </div>
        {summary && <p className="mt-3 whitespace-pre-line text-[11px] leading-relaxed text-[#1B2D54]/80">{summary}</p>}
      </div>

      {topics.size > 0 && (
        <div>
          <p className="text-[11px] font-semibold">{t("Targeted Competencies:")}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {[...topics].map(([topic, list]) => (
              <div key={topic} className="rounded-xl border border-[#d9f0ee] bg-[#f4fbfa] p-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0b6b70]" dir="auto">
                  <Network aria-hidden className="size-3.5 shrink-0" />
                  {topic}
                </p>
                <p className="mt-1 text-[9px] leading-snug text-[#1B2D54]/75">
                  {t("{n} activities", { n: list.length })} •{" "}
                  {[...new Set(list.map((p) => t(DIFFICULTY_LABEL[p.difficulty] ?? p.difficulty)))].join(locale === "ar" ? "، " : ", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl bg-[#f1f4f4] p-3">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold">
          <Video aria-hidden className="size-4" />
          {t("Lesson Video")}
        </p>
        <div className="relative mt-2 aspect-[11/5] max-h-60 w-full overflow-hidden rounded-xl bg-[#14243f]">
          <Image src={VIDEO_POSTER} alt="" fill sizes="(min-width: 1280px) 40vw, 100vw" className="object-cover object-top opacity-70" />
          <div className="absolute inset-0 grid place-items-center bg-black/30 p-4">
            <span className="rounded-full bg-black/40 px-3 py-1 text-center text-[10px] font-medium text-white">{t("No video for this lesson yet")}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold leading-snug">
            <span className="grid size-5 place-items-center rounded-md bg-[#eaf6f6] text-[10px] text-[#0b6b70]">
              <Ltr>{lesson.problems.length}</Ltr>
            </span>
            {t("Lesson Activities & Resources")}
          </p>
          <ActionButton tone="teal" icon={<Pencil aria-hidden className="size-3.5" />} onClick={onAddProblem}>
            {t("Add activity")}
          </ActionButton>
        </div>

        {lesson.problems.length === 0 ? (
          <p className="mt-2 rounded-xl bg-[#f1f4f4] p-6 text-center text-[11px] text-[#1B2D54]/60">
            {t("No activities yet. Add a practice problem for this lesson.")}
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {lesson.problems.map((p, i) => {
              const hints = countList(p.hintsJson);
              const steps = countList(p.stepsJson);
              return (
                <li key={p.id} className="flex items-start gap-3 rounded-xl border border-[#e3ece9] bg-white p-3">
                  <span className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold", NUMBER_STYLE[Math.min(i, 2)])}>
                    <Ltr>{i + 1}</Ltr>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold">{titleOf(p)}</p>
                      <Pill className={DIFFICULTY_CHIP_STYLE[p.difficulty] ?? "bg-[#e3e7e9] text-[#1B2D54]/70"}>
                        {t(DIFFICULTY_LABEL[p.difficulty] ?? p.difficulty)}
                      </Pill>
                    </div>
                    <p className="mt-1 line-clamp-2 whitespace-pre-line text-[10px] leading-snug text-[#1B2D54]/75">
                      {textOf(p.statementAr, p.statementEn)}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] font-semibold text-[#14243f]/80">
                      {p.topic && (
                        <span className="flex items-center gap-1" dir="auto">
                          <Network aria-hidden className="size-3.5" />
                          {p.topic}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Copy aria-hidden className="size-3.5" />
                        {t("{n} steps", { n: steps })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Lightbulb aria-hidden className="size-3.5" />
                        {t("{n} hints", { n: hints })}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditProblem(p)}
                    aria-label={t("Edit activity")}
                    className="grid size-7 shrink-0 place-items-center rounded-lg text-[#0b6b70] transition-colors hover:bg-[#f1f4f4]"
                  >
                    <SlidersHorizontal aria-hidden className="size-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

function countList(json: string) {
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.length : 0;
  } catch {
    return 0;
  }
}
