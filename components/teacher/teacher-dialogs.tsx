"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle, X } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  createAssignment,
  createEvent,
  deleteEvent,
  getTeacherClasses,
  getTeacherProfile,
  getTeacherStudentsList,
  updateEvent,
  type Assignment,
  type CalendarItem,
  type EventKind,
  type SchoolSubject,
  type TeacherClass,
} from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { FieldLabel, SUBJECT_LABEL, inputClass, toLocalInput } from "@/components/teacher/teacher-ui";

/** A centered dialog over the page; Escape or the backdrop closes it. */
export function TeacherDialog({
  title,
  subtitle,
  onClose,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-[#14365a]/40 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "max-h-[90svh] w-full overflow-y-auto rounded-2xl bg-white p-5 font-[family-name:var(--font-poppins)] text-[#1B2D54] shadow-2xl",
          wide ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="leading-tight">
            <h2 className="text-base font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-[11px] text-[#1B2D54]/60">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-8 shrink-0 place-items-center rounded-full bg-[#eef2f1] hover:bg-[#dfe9e7]">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Field errors from a 400 (by camelCase field name) and the overall message. */
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
      const body = e instanceof ApiError ? (e.body as { errors?: Record<string, string[]> } | undefined) : undefined;
      if (body?.errors) {
        setFields(Object.fromEntries(Object.entries(body.errors).map(([k, v]) => [k.charAt(0).toLowerCase() + k.slice(1), v[0]])));
        setMessage(null);
      } else {
        setMessage(errorMessage(e));
      }
    },
  };
}

function PrimaryButton({ busy, children, className }: { busy: boolean; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] disabled:opacity-60",
        className,
      )}
    >
      {busy && <LoaderCircle className="size-3.5 animate-spin" />}
      {children}
    </button>
  );
}

/** The teacher's classes and subjects for the forms, loaded once. */
function useTeacherChoices(open: boolean) {
  const [classes, setClasses] = useState<TeacherClass[] | null>(null);
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    Promise.all([getTeacherClasses(), getTeacherProfile()]).then(
      ([c, me]) => {
        if (!active) return;
        setClasses(c);
        setSubjects(me.subjects);
      },
      () => active && setClasses([]),
    );
    return () => {
      active = false;
    };
  }, [open]);
  return { classes, subjects };
}

/**
 * "Quick Assignment" (dashboard and progress page): a short assignment for one class, open now; the class is notified.
 * `defaults` pre-fills the class and title.
 */
export function QuickAssignmentDialog({
  onClose,
  onCreated,
  defaults,
}: {
  onClose: () => void;
  onCreated?: (a: Assignment) => void;
  defaults?: { classId?: string; title?: string; instructions?: string };
}) {
  const t = useT();
  const { classes, subjects } = useTeacherChoices(true);
  const errors = useFormErrors();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Assignment | null>(null);
  const [form, setForm] = useState(() => {
    const due = new Date(Date.now() + 2 * 864e5);
    due.setHours(18, 0, 0, 0);
    return {
      classId: defaults?.classId ?? "",
      subject: "" as SchoolSubject | "",
      title: defaults?.title ?? "",
      instructions: defaults?.instructions ?? "",
      due: toLocalInput(due),
      maxPoints: 10,
    };
  });
  const classId = form.classId || classes?.[0]?.id || "";
  const subject = form.subject || subjects[0] || "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    errors.clear();
    setBusy(true);
    try {
      const created = await createAssignment({
        classId,
        subject: subject as SchoolSubject,
        title: form.title.trim(),
        instructions: form.instructions.trim() || undefined,
        dueUtc: new Date(form.due).toISOString(),
        maxPoints: Number(form.maxPoints),
      });
      setDone(created);
      onCreated?.(created);
    } catch (err) {
      errors.take(err);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <TeacherDialog title={t("Assignment published")} onClose={onClose}>
        <p className="text-[12px] leading-relaxed">
          {t("{title} is open now for class {name}; the students were notified.", { title: done.title, name: done.className })}
        </p>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white">
            {t("Done")}
          </button>
        </div>
      </TeacherDialog>
    );
  }

  return (
    <TeacherDialog title={t("Quick Assignment")} subtitle={t("Open now for one class. The students get a notification.")} onClose={onClose}>
      {classes === null ? (
        <div className="grid place-items-center py-8">
          <LoaderCircle className="size-5 animate-spin text-[#14757d]" />
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label={t("Class")} error={errors.fields.classId}>
              <select className={inputClass} value={classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {t("Grade {grade} • Class {name}", { grade: c.grade, name: c.name })}
                  </option>
                ))}
              </select>
            </FieldLabel>
            <FieldLabel label={t("Subject")} error={errors.fields.subject}>
              <select className={inputClass} value={subject} onChange={(e) => setForm({ ...form, subject: e.target.value as SchoolSubject })}>
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {t(SUBJECT_LABEL[s])}
                  </option>
                ))}
              </select>
            </FieldLabel>
          </div>
          <FieldLabel label={t("Title")} error={errors.fields.title}>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} required dir="auto" />
          </FieldLabel>
          <FieldLabel label={t("Instructions")} error={errors.fields.instructions}>
            <textarea
              className={cn(inputClass, "h-24 py-2")}
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              maxLength={4000}
              dir="auto"
            />
          </FieldLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <FieldLabel label={t("Due")} error={errors.fields.dueUtc}>
              <input type="datetime-local" className={inputClass} value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} required />
            </FieldLabel>
            <FieldLabel label={t("Points")} error={errors.fields.maxPoints}>
              <input
                type="number"
                min={1}
                max={1000}
                className={inputClass}
                value={form.maxPoints}
                onChange={(e) => setForm({ ...form, maxPoints: Number(e.target.value) })}
                required
              />
            </FieldLabel>
          </div>
          {errors.message && <p role="alert" className="text-[11px] text-[#c81e1e]">{errors.message}</p>}
          {classes.length === 0 && <p className="text-[11px] text-[#c81e1e]">{t("No classes yet. Ask the school admin to link your classes.")}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
              {t("Cancel")}
            </button>
            <PrimaryButton busy={busy}>{t("Publish assignment")}</PrimaryButton>
          </div>
        </form>
      )}
    </TeacherDialog>
  );
}

export const EVENT_KIND_LABEL: Record<EventKind, string> = {
  Lesson: tk("Lesson"),
  OfficeHour: tk("Office hours"),
  OneOnOne: tk("1-on-1"),
  Review: tk("Review"),
  Meeting: tk("Meeting"),
};

/**
 * Schedule (or edit) a calendar event: a lesson, office hours, a 1-on-1 with a student, a review or a meeting.
 * The class, or the student of a 1-on-1, is notified. `event` edits an existing one (with Delete).
 */
export function EventDialog({
  onClose,
  onSaved,
  event,
  defaults,
}: {
  onClose: () => void;
  onSaved: (item: CalendarItem | null) => void;
  event?: CalendarItem;
  defaults?: { kind?: EventKind; title?: string; classId?: string; studentId?: string; start?: Date };
}) {
  const t = useT();
  const { classes } = useTeacherChoices(true);
  const [students, setStudents] = useState<{ id: string; name: string; classId: string }[]>([]);
  const errors = useFormErrors();
  const [busy, setBusy] = useState(false);

  const start = event ? new Date(event.startUtc) : (defaults?.start ?? nextHour());
  const end = event ? new Date(event.endUtc) : new Date(start.getTime() + 60 * 60e3);
  const [form, setForm] = useState({
    kind: (event?.kind as EventKind | undefined) ?? defaults?.kind ?? "OfficeHour",
    title: event?.title ?? defaults?.title ?? "",
    classId: event?.classId ?? defaults?.classId ?? "",
    studentId: event?.studentId ?? defaults?.studentId ?? "",
    location: event?.location ?? "",
    notes: event?.notes ?? "",
    start: toLocalInput(start),
    end: toLocalInput(end),
  });

  useEffect(() => {
    let active = true;
    getTeacherStudentsList().then(
      (page) => active && setStudents(page.students.map((s) => ({ id: s.studentId, name: s.fullName, classId: s.classId }))),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    errors.clear();
    setBusy(true);
    const body = {
      kind: form.kind,
      title: form.title.trim(),
      notes: form.notes.trim() || null,
      location: form.location.trim() || null,
      classId: form.kind === "OneOnOne" ? null : form.classId || null,
      studentId: form.kind === "OneOnOne" ? form.studentId || null : null,
      startUtc: new Date(form.start).toISOString(),
      endUtc: new Date(form.end).toISOString(),
    };
    try {
      onSaved(event ? await updateEvent(event.id, body) : await createEvent(body));
    } catch (err) {
      errors.take(err);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!event) return;
    setBusy(true);
    try {
      await deleteEvent(event.id);
      onSaved(null);
    } catch (err) {
      errors.take(err);
      setBusy(false);
    }
  }

  return (
    <TeacherDialog
      title={event ? t("Edit event") : t("Schedule an event")}
      subtitle={t("The class, or the student of a 1-on-1, gets a notification.")}
      onClose={onClose}
    >
      <form onSubmit={submit} className="grid gap-3">
        <FieldLabel label={t("Kind")} error={errors.fields.kind}>
          <select className={inputClass} value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as EventKind })}>
            {(Object.keys(EVENT_KIND_LABEL) as EventKind[]).map((k) => (
              <option key={k} value={k}>
                {t(EVENT_KIND_LABEL[k])}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label={t("Title")} error={errors.fields.title}>
          <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} required dir="auto" />
        </FieldLabel>
        {form.kind === "OneOnOne" ? (
          <FieldLabel label={t("Student")} error={errors.fields.studentId}>
            <select className={inputClass} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">{t("Choose a student")}</option>
              {students.map((s) => (
                <option key={`${s.id}-${s.classId}`} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FieldLabel>
        ) : (
          <FieldLabel label={t("Class (optional)")} error={errors.fields.classId}>
            <select className={inputClass} value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}>
              <option value="">{t("No class (just me)")}</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {t("Class {name}", { name: c.name })}
                </option>
              ))}
            </select>
          </FieldLabel>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t("Starts")} error={errors.fields.startUtc}>
            <input type="datetime-local" className={inputClass} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required />
          </FieldLabel>
          <FieldLabel label={t("Ends")} error={errors.fields.endUtc}>
            <input type="datetime-local" className={inputClass} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} required />
          </FieldLabel>
        </div>
        <FieldLabel label={t("Room or link")} error={errors.fields.location}>
          <input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} maxLength={200} dir="auto" />
        </FieldLabel>
        <FieldLabel label={t("Notes")} error={errors.fields.notes}>
          <textarea className={cn(inputClass, "h-20 py-2")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={1000} dir="auto" />
        </FieldLabel>
        {errors.message && <p role="alert" className="text-[11px] text-[#c81e1e]">{errors.message}</p>}
        <div className="mt-1 flex items-center justify-between gap-2">
          {event ? (
            <button type="button" onClick={remove} disabled={busy} className="rounded-full bg-[#fde8e8] px-4 py-2 text-[11px] font-semibold text-[#c81e1e]">
              {t("Delete")}
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
              {t("Cancel")}
            </button>
            <PrimaryButton busy={busy}>{event ? t("Save") : t("Schedule")}</PrimaryButton>
          </div>
        </div>
      </form>
    </TeacherDialog>
  );
}

function nextHour() {
  const d = new Date(Date.now() + 60 * 60e3);
  d.setMinutes(0, 0, 0);
  return d;
}

/** A short-lived confirmation at the bottom of the page ("Reminder sent"). */
export function useToast() {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    if (!text) return;
    const id = setTimeout(() => setText(null), 3500);
    return () => clearTimeout(id);
  }, [text]);
  const node = text ? (
    <div role="status" className="fixed bottom-6 start-1/2 z-[70] -translate-x-1/2 rounded-full bg-[#1B2D54] px-5 py-2.5 text-[11px] font-semibold text-white shadow-lg rtl:translate-x-1/2">
      {text}
    </div>
  ) : null;
  return { show: setText, node };
}
