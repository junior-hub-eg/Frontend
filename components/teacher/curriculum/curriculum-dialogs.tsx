"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import type { SchoolSubject } from "@/lib/teacher-api";
import {
  createCurriculumLesson,
  createCurriculumProblem,
  createCurriculumUnit,
  updateCurriculumLesson,
  updateCurriculumProblem,
  updateCurriculumUnit,
  type CurriculumLesson,
  type CurriculumProblem,
  type CurriculumStatus,
  type CurriculumUnit,
} from "@/lib/teacher-curriculum-api";
import { TeacherDialog } from "@/components/teacher/teacher-dialogs";
import { FieldLabel, inputClass } from "@/components/teacher/teacher-ui";
import { cn } from "@/lib/utils";

export const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"] as const;

export const DIFFICULTY_LABEL: Record<string, string> = {
  Beginner: tk("Beginner"),
  Intermediate: tk("Intermediate"),
  Advanced: tk("Advanced"),
};

export const STATUS_LABEL: Record<string, string> = {
  Published: tk("Published"),
  Draft: tk("Draft"),
};

/** Field errors of a 400 (camelCase field name -> first message) and the overall message. */
function useFormErrors() {
  const [fields, setFields] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  return {
    fields,
    message,
    clear() {
      setFields({});
      setMessage(null);
    },
    take(e: unknown) {
      const errs = e instanceof ApiError ? e.fieldErrors : {};
      const entries = Object.entries(errs).map(([k, v]) => {
        const name = k.replace(/^\$\.?/, "").replace(/^request\./i, "");
        return [name.charAt(0).toLowerCase() + name.slice(1), v] as const;
      });
      if (entries.length) {
        setFields(Object.fromEntries(entries));
        setMessage(null);
      } else {
        setFields({});
        setMessage(errorMessage(e));
      }
    },
  };
}

function Actions({ busy, onClose, label }: { busy: boolean; onClose: () => void; label: string }) {
  const t = useT();
  return (
    <div className="mt-1 flex justify-end gap-2">
      <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
        {t("Cancel")}
      </button>
      <button
        type="submit"
        disabled={busy}
        className="flex items-center justify-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] disabled:opacity-60"
      >
        {busy && <LoaderCircle className="size-3.5 animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function FormMessage({ text }: { text: string | null }) {
  return text ? (
    <p role="alert" className="text-[11px] text-[#c81e1e]">
      {text}
    </p>
  ) : null;
}

function TwoCols({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function StatusField({ value, onChange, error }: { value: string; onChange: (s: CurriculumStatus) => void; error?: string }) {
  const t = useT();
  return (
    <FieldLabel label={t("Status")} error={error}>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        {Object.keys(STATUS_LABEL).map((s) => (
          <option key={s} value={s}>
            {t(STATUS_LABEL[s])}
          </option>
        ))}
      </select>
    </FieldLabel>
  );
}

const orNull = (s: string) => s.trim() || null;

/** Add a unit to the subject/grade being shown, or edit one (`unit`). */
export function UnitDialog({
  unit,
  subject,
  grade,
  nextOrder,
  onClose,
  onSaved,
}: {
  unit?: CurriculumUnit;
  subject: SchoolSubject;
  grade: number;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const errors = useFormErrors();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    titleAr: unit?.titleAr ?? "",
    titleEn: unit?.titleEn ?? "",
    descriptionAr: unit?.descriptionAr ?? "",
    descriptionEn: unit?.descriptionEn ?? "",
    status: (unit?.status ?? "Published") as CurriculumStatus,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    errors.clear();
    setBusy(true);
    const common = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      descriptionAr: orNull(form.descriptionAr),
      descriptionEn: orNull(form.descriptionEn),
    };
    try {
      if (unit) await updateCurriculumUnit(unit.id, { ...common, orderIndex: unit.orderIndex, status: form.status });
      else await createCurriculumUnit({ ...common, subject, grade, orderIndex: nextOrder });
      onSaved();
    } catch (err) {
      errors.take(err);
      setBusy(false);
    }
  }

  return (
    <TeacherDialog title={unit ? t("Edit unit") : t("Add unit")} subtitle={t("Write the title in Arabic, English or both.")} onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-3">
        <TwoCols>
          <FieldLabel label={t("Title (Arabic)")} error={errors.fields.titleAr}>
            <input className={inputClass} dir="rtl" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} maxLength={200} />
          </FieldLabel>
          <FieldLabel label={t("Title (English)")} error={errors.fields.titleEn}>
            <input className={inputClass} dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} maxLength={200} />
          </FieldLabel>
          <FieldLabel label={t("Description (Arabic)")} error={errors.fields.descriptionAr}>
            <textarea className={cn(inputClass, "h-20 py-2")} dir="rtl" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} maxLength={2000} />
          </FieldLabel>
          <FieldLabel label={t("Description (English)")} error={errors.fields.descriptionEn}>
            <textarea className={cn(inputClass, "h-20 py-2")} dir="ltr" value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} maxLength={2000} />
          </FieldLabel>
        </TwoCols>
        {unit && <StatusField value={form.status} onChange={(status) => setForm({ ...form, status })} error={errors.fields.status} />}
        <FormMessage text={errors.message} />
        <Actions busy={busy} onClose={onClose} label={unit ? t("Save") : t("Add unit")} />
      </form>
    </TeacherDialog>
  );
}

/** Create a lesson in one of the units, or edit one (`lesson`). */
export function LessonDialog({
  lesson,
  units,
  unitId,
  titleOf,
  onClose,
  onSaved,
}: {
  lesson?: CurriculumLesson;
  units: CurriculumUnit[];
  unitId?: string;
  titleOf: (item: { titleAr: string; titleEn: string }) => string;
  onClose: () => void;
  onSaved: (lessonId: string) => void;
}) {
  const t = useT();
  const errors = useFormErrors();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    unitId: lesson?.unitId ?? unitId ?? units[0]?.id ?? "",
    titleAr: lesson?.titleAr ?? "",
    titleEn: lesson?.titleEn ?? "",
    summaryAr: lesson?.summaryAr ?? "",
    summaryEn: lesson?.summaryEn ?? "",
    videoUrl: lesson?.videoUrl ?? "",
    status: (lesson?.status ?? "Published") as CurriculumStatus,
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    errors.clear();
    setBusy(true);
    const common = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      summaryAr: orNull(form.summaryAr),
      summaryEn: orNull(form.summaryEn),
      videoUrl: form.videoUrl.trim(),
    };
    try {
      if (lesson) {
        await updateCurriculumLesson(lesson.id, { ...common, orderIndex: lesson.orderIndex, status: form.status });
        onSaved(lesson.id);
      } else {
        const unit = units.find((u) => u.id === form.unitId);
        const nextOrder = Math.max(0, ...(unit?.lessons ?? []).map((l) => l.orderIndex)) + 1;
        const created = await createCurriculumLesson({ ...common, unitId: form.unitId, orderIndex: nextOrder });
        onSaved(created.id);
      }
    } catch (err) {
      errors.take(err);
      setBusy(false);
    }
  }

  return (
    <TeacherDialog title={lesson ? t("Edit Lesson") : t("Create Lesson")} subtitle={t("Write the title in Arabic, English or both.")} onClose={onClose} wide>
      {!lesson && units.length === 0 ? (
        <p className="text-[12px] leading-relaxed">{t("Add a unit first, then create its lessons.")}</p>
      ) : (
        <form onSubmit={submit} className="grid gap-3">
          {!lesson && (
            <FieldLabel label={t("Unit")} error={errors.fields.unitId}>
              <select className={inputClass} value={form.unitId} onChange={(e) => setForm({ ...form, unitId: e.target.value })} required>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {titleOf(u)}
                  </option>
                ))}
              </select>
            </FieldLabel>
          )}
          <TwoCols>
            <FieldLabel label={t("Title (Arabic)")} error={errors.fields.titleAr}>
              <input className={inputClass} dir="rtl" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} maxLength={200} />
            </FieldLabel>
            <FieldLabel label={t("Title (English)")} error={errors.fields.titleEn}>
              <input className={inputClass} dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} maxLength={200} />
            </FieldLabel>
            <FieldLabel label={t("Summary (Arabic)")} error={errors.fields.summaryAr}>
              <textarea className={cn(inputClass, "h-24 py-2")} dir="rtl" value={form.summaryAr} onChange={(e) => setForm({ ...form, summaryAr: e.target.value })} maxLength={4000} />
            </FieldLabel>
            <FieldLabel label={t("Summary (English)")} error={errors.fields.summaryEn}>
              <textarea className={cn(inputClass, "h-24 py-2")} dir="ltr" value={form.summaryEn} onChange={(e) => setForm({ ...form, summaryEn: e.target.value })} maxLength={4000} />
            </FieldLabel>
          </TwoCols>
          <FieldLabel label={t("Lesson video link (YouTube or a video file)")} error={errors.fields.videoUrl}>
            <input
              className={inputClass}
              dir="ltr"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={form.videoUrl}
              onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              maxLength={500}
            />
          </FieldLabel>
          {lesson && <StatusField value={form.status} onChange={(status) => setForm({ ...form, status })} error={errors.fields.status} />}
          <FormMessage text={errors.message} />
          <Actions busy={busy} onClose={onClose} label={lesson ? t("Save") : t("Create Lesson")} />
        </form>
      )}
    </TeacherDialog>
  );
}

function parseList(json: string): string[] {
  try {
    const v: unknown = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/** Add an activity (problem) to a lesson, or edit one (`problem`). Steps and simulation settings are kept as they are. */
export function ProblemDialog({
  problem,
  lesson,
  onClose,
  onSaved,
}: {
  problem?: CurriculumProblem;
  lesson: CurriculumLesson;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const errors = useFormErrors();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    titleAr: problem?.titleAr ?? "",
    titleEn: problem?.titleEn ?? "",
    statementAr: problem?.statementAr ?? "",
    statementEn: problem?.statementEn ?? "",
    difficulty: problem?.difficulty ?? "Beginner",
    topic: problem?.topic ?? "",
    answer: problem?.answer ?? "",
    accepted: parseList(problem?.acceptedFormatsJson ?? "[]")
      .filter((a) => a !== problem?.answer)
      .join("\n"),
    hints: parseList(problem?.hintsJson ?? "[]").join("\n"),
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    errors.clear();
    setBusy(true);
    const answer = form.answer.trim();
    const accepted = lines(form.accepted);
    const body = {
      titleAr: form.titleAr.trim(),
      titleEn: form.titleEn.trim(),
      statementAr: form.statementAr.trim(),
      statementEn: form.statementEn.trim(),
      difficulty: form.difficulty,
      topic: form.topic.trim(),
      stepsJson: problem?.stepsJson ?? "[]",
      answer,
      acceptedFormatsJson: JSON.stringify([...new Set([answer, ...accepted].filter(Boolean))]),
      hintsJson: JSON.stringify(lines(form.hints)),
      simulationType: problem?.simulationType ?? null,
      simulationParamsJson: problem?.simulationParamsJson ?? null,
      orderIndex: problem?.orderIndex ?? Math.max(0, ...lesson.problems.map((p) => p.orderIndex)) + 1,
    };
    try {
      if (problem) await updateCurriculumProblem(problem.id, body);
      else await createCurriculumProblem({ ...body, lessonId: lesson.id });
      onSaved();
    } catch (err) {
      errors.take(err);
      setBusy(false);
    }
  }

  return (
    <TeacherDialog
      title={problem ? t("Edit activity") : t("Add activity")}
      subtitle={t("A practice problem the students solve in this lesson.")}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit} className="grid gap-3">
        <TwoCols>
          <FieldLabel label={t("Title (Arabic)")} error={errors.fields.titleAr}>
            <input className={inputClass} dir="rtl" value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} maxLength={200} />
          </FieldLabel>
          <FieldLabel label={t("Title (English)")} error={errors.fields.titleEn}>
            <input className={inputClass} dir="ltr" value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} maxLength={200} />
          </FieldLabel>
          <FieldLabel label={t("Question (Arabic)")} error={errors.fields.statementAr}>
            <textarea className={cn(inputClass, "h-24 py-2")} dir="rtl" value={form.statementAr} onChange={(e) => setForm({ ...form, statementAr: e.target.value })} maxLength={4000} />
          </FieldLabel>
          <FieldLabel label={t("Question (English)")} error={errors.fields.statementEn}>
            <textarea className={cn(inputClass, "h-24 py-2")} dir="ltr" value={form.statementEn} onChange={(e) => setForm({ ...form, statementEn: e.target.value })} maxLength={4000} />
          </FieldLabel>
          <FieldLabel label={t("Difficulty")} error={errors.fields.difficulty}>
            <select className={inputClass} value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {t(DIFFICULTY_LABEL[d])}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label={t("Topic")} error={errors.fields.topic}>
            <input className={inputClass} dir="auto" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} maxLength={100} />
          </FieldLabel>
          <FieldLabel label={t("Correct answer")} error={errors.fields.answer}>
            <input className={inputClass} dir="auto" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} maxLength={500} required />
          </FieldLabel>
          <FieldLabel label={t("Other accepted answers (one per line)")} error={errors.fields.acceptedFormatsJson}>
            <textarea className={cn(inputClass, "h-20 py-2")} dir="auto" value={form.accepted} onChange={(e) => setForm({ ...form, accepted: e.target.value })} />
          </FieldLabel>
        </TwoCols>
        <FieldLabel label={t("Hints (one per line)")} error={errors.fields.hintsJson}>
          <textarea className={cn(inputClass, "h-20 py-2")} dir="auto" value={form.hints} onChange={(e) => setForm({ ...form, hints: e.target.value })} />
        </FieldLabel>
        <FormMessage text={errors.message} />
        <Actions busy={busy} onClose={onClose} label={problem ? t("Save") : t("Add activity")} />
      </form>
    </TeacherDialog>
  );
}
