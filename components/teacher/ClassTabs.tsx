"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "next";
import Link from "next/link";
import { Check, Copy, LoaderCircle, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import {
  addClass,
  getTeacherProfile,
  removeClass,
  addPlanItem,
  broadcast,
  decideJoinRequest,
  deletePlanItem,
  removeClassStudent,
  renewClassCode,
  setAutoAccept,
  type SchoolSubject,
  type TeacherClassDetail,
} from "@/lib/teacher-api";
import { cn } from "@/lib/utils";
import { FieldLabel, SUBJECT_LABEL, StudentAvatar, formatDate, inputClass, weekStartOf } from "@/components/teacher/teacher-ui";
import { QuickAssignmentDialog, TeacherDialog } from "@/components/teacher/teacher-dialogs";

type Props = { d: TeacherClassDetail; onChange: (d: TeacherClassDetail) => void; reload: () => void; notify: (text: string) => void };

function useBusy() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function run<T>(key: string, action: () => Promise<T>): Promise<T | undefined> {
    setBusy(key);
    setError(null);
    try {
      return await action();
    } catch (e) {
      setError(errorMessage(e));
      return undefined;
    } finally {
      setBusy(null);
    }
  }
  return { busy, error, run };
}

/** "Invite & Access": the join code (copy, renew), auto-accept, join requests and removing a student. */
export function InviteTab({ d, onChange, notify }: Props) {
  const t = useT();
  const { busy, error, run } = useBusy();

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-2">
      <div className="rounded-xl border border-[#e3ece9] p-4">
        <p className="text-[11px] font-semibold">{t("Class join code")}</p>
        <p className="mt-1 text-[10px] text-[#1B2D54]/60">{t("Students who are not on the school list join the class with this code.")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span dir="ltr" className="rounded-lg bg-[#c9efe9] px-4 py-2 font-mono text-lg font-bold tracking-[0.3em] text-[#14757d]">
            {d.joinCode}
          </span>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(d.joinCode).then(() => notify(t("Copied")), () => undefined)}
            className="flex items-center gap-1 rounded-lg bg-[#eef2f1] px-3 py-2 text-[10px] font-semibold"
          >
            <Copy className="size-3.5" /> {t("Copy")}
          </button>
          <button
            type="button"
            disabled={busy === "code"}
            onClick={async () => {
              const next = await run("code", () => renewClassCode(d.id));
              if (next) {
                onChange(next);
                notify(t("New code ready. The old one no longer works."));
              }
            }}
            className="flex items-center gap-1 rounded-lg bg-[#eef2f1] px-3 py-2 text-[10px] font-semibold disabled:opacity-60"
          >
            <RefreshCw className={cn("size-3.5", busy === "code" && "animate-spin")} /> {t("New code")}
          </button>
        </div>
        <label className="mt-4 flex items-center justify-between gap-3 border-t border-[#e3ece9] pt-3">
          <span className="leading-tight">
            <span className="block text-[11px] font-semibold">{t("Accept automatically")}</span>
            <span className="block text-[10px] text-[#1B2D54]/60">{t("When off, you accept each request below.")}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={d.autoAccept}
            disabled={busy === "auto"}
            onClick={async () => {
              const next = await run("auto", () => setAutoAccept(d.id, !d.autoAccept));
              if (next) onChange(next);
            }}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", d.autoAccept ? "bg-[#14757d]" : "bg-[#d3dcda]")}
          >
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset-inline-start]", d.autoAccept ? "start-[1.375rem]" : "start-0.5")} />
          </button>
        </label>
      </div>

      <div className="rounded-xl border border-[#e3ece9] p-4">
        <p className="text-[11px] font-semibold">{t("Join requests ({count})", { count: d.requests.length })}</p>
        {d.requests.length === 0 ? (
          <p className="mt-3 text-[10px] text-[#1B2D54]/60">{t("No one is waiting to join.")}</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {d.requests.map((r) => (
              <li key={r.studentId} className="flex items-center gap-2.5 rounded-lg bg-[#f6f9f8] p-2">
                <StudentAvatar name={r.fullName} photoUrl={r.photoUrl} gender={r.gender} size={30} />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-[11px] font-semibold">{r.fullName}</p>
                  <p className="text-[9px] text-[#1B2D54]/60">{formatDate(r.requestedUtc, true)}</p>
                </div>
                {(["accept", "decline"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-label={k === "accept" ? t("Accept") : t("Decline")}
                    disabled={busy === `${k}-${r.studentId}`}
                    onClick={async () => {
                      const next = await run(`${k}-${r.studentId}`, () => decideJoinRequest(d.id, r.studentId, k === "accept"));
                      if (next) onChange(next);
                    }}
                    className={cn("grid size-7 place-items-center rounded-full", k === "accept" ? "bg-[#14757d] text-white" : "bg-[#fde8e8] text-[#c81e1e]")}
                  >
                    {k === "accept" ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                  </button>
                ))}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-5 text-[11px] font-semibold">{t("Joined with the code")}</p>
        <ul className="mt-2 grid gap-1.5">
          {d.students.filter((s) => s.joinedVia === "Code").map((s) => (
            <li key={s.id} className="flex items-center gap-2 text-[11px]">
              <StudentAvatar name={s.fullName} photoUrl={s.photoUrl} gender={s.gender} size={24} />
              <span className="min-w-0 flex-1 truncate">{s.fullName}</span>
              <button
                type="button"
                disabled={busy === `remove-${s.id}`}
                onClick={async () => {
                  if (!window.confirm(t("Take {name} out of the class?", { name: s.fullName }))) return;
                  if ((await run(`remove-${s.id}`, () => removeClassStudent(d.id, s.id))) !== undefined || true) notify(t("Removed"));
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-[#c81e1e] hover:bg-[#fde8e8]"
              >
                <Trash2 className="size-3" /> {t("Remove")}
              </button>
            </li>
          ))}
          {!d.students.some((s) => s.joinedVia === "Code") && <li className="text-[10px] text-[#1B2D54]/60">{t("Everyone is from the school list.")}</li>}
        </ul>
      </div>
      {error && <p role="alert" className="text-[11px] text-[#c81e1e] lg:col-span-2">{error}</p>}
    </div>
  );
}

/** "Weekly Lesson Plan": what is taught each week; add or remove lessons. */
export function PlanTab({ d, reload, notify }: Props) {
  const t = useT();
  const { busy, error, run } = useBusy();
  const [form, setForm] = useState({ weekStart: weekStartOf(new Date()), subject: d.subjects[0] ?? ("Math" as SchoolSubject), title: "", notes: "" });
  const plan = [...d.plan].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const thisWeek = weekStartOf(new Date());

  async function add(e: FormEvent) {
    e.preventDefault();
    const saved = await run("add", () =>
      addPlanItem(d.id, { weekStart: weekStartOf(new Date(form.weekStart)), subject: form.subject, title: form.title.trim(), notes: form.notes.trim() || undefined }),
    );
    if (saved) {
      setForm({ ...form, title: "", notes: "" });
      notify(t("Added to the plan"));
      reload();
    }
  }

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <ul className="grid content-start gap-2">
        {plan.length === 0 && <li className="text-[11px] text-[#1B2D54]/60">{t("No lessons planned yet.")}</li>}
        {plan.map((p) => (
          <li key={p.id} className={cn("flex items-start gap-3 rounded-xl border p-3", p.weekStart === thisWeek ? "border-[#14757d] bg-[#f4fbfa]" : "border-[#e3ece9]")}>
            <span className="w-20 shrink-0 text-[10px] font-semibold text-[#14757d]">
              {t("Week of {date}", { date: formatDate(`${p.weekStart}T00:00:00`) })}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p dir="auto" className="text-[12px] font-semibold">{p.title}</p>
              <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">
                {t(SUBJECT_LABEL[p.subject])}
                {p.notes && <span dir="auto"> • {p.notes}</span>}
              </p>
            </div>
            <button
              type="button"
              aria-label={t("Delete")}
              disabled={busy === p.id}
              onClick={async () => {
                if ((await run(p.id, () => deletePlanItem(p.id))) !== undefined || true) reload();
              }}
              className="grid size-7 shrink-0 place-items-center rounded-full text-[#c81e1e] hover:bg-[#fde8e8]"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="grid content-start gap-2.5 rounded-xl border border-[#e3ece9] p-4">
        <p className="text-[11px] font-semibold">{t("Plan a lesson")}</p>
        <FieldLabel label={t("Week")}>
          <input type="date" className={inputClass} value={form.weekStart} onChange={(e) => setForm({ ...form, weekStart: e.target.value })} required />
        </FieldLabel>
        <FieldLabel label={t("Subject")}>
          <select className={inputClass} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value as SchoolSubject })}>
            {d.subjects.map((s) => (
              <option key={s} value={s}>
                {t(SUBJECT_LABEL[s])}
              </option>
            ))}
          </select>
        </FieldLabel>
        <FieldLabel label={t("Title")}>
          <input dir="auto" className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} required />
        </FieldLabel>
        <FieldLabel label={t("Notes")}>
          <input dir="auto" className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} />
        </FieldLabel>
        {error && <p role="alert" className="text-[10px] text-[#c81e1e]">{error}</p>}
        <button type="submit" disabled={busy === "add"} className="flex items-center justify-center gap-1.5 rounded-full bg-[#14757d] py-2 text-[11px] font-semibold text-white disabled:opacity-60">
          {busy === "add" ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          {t("Add to plan")}
        </button>
      </form>
    </div>
  );
}

/** "Assignments": the class's assignments with submissions, and a Quick Assignment for this class. */
export function AssignmentsTab({ d, reload }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const list = [...d.assignments].sort((a, b) => b.dueUtc.localeCompare(a.dueUtc));
  return (
    <div className="p-5">
      <div className="mb-3 flex justify-end">
        <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-4 py-2 text-[11px] font-semibold text-white">
          <Plus className="size-3.5" /> {t("Quick Assignment")}
        </button>
      </div>
      {list.length === 0 ? (
        <p className="text-[11px] text-[#1B2D54]/60">{t("No assignments in this class yet.")}</p>
      ) : (
        <ul className="grid gap-2">
          {list.map((a) => {
            const pct = a.enrolled ? Math.round((a.submitted * 100) / a.enrolled) : 0;
            return (
              <li key={a.id}>
                <Link href={`/teacher/assignments?assignment=${a.id}` as Route} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e3ece9] p-3 hover:bg-[#f6f9f8]">
                  <div className="min-w-0 flex-1 leading-tight">
                    <p dir="auto" className="truncate text-[12px] font-semibold">{a.title}</p>
                    <p className="mt-0.5 text-[10px] text-[#1B2D54]/60">
                      {t(SUBJECT_LABEL[a.subject])} • {t("Due {date}", { date: formatDate(a.dueUtc, true) })}
                    </p>
                  </div>
                  <div className="w-40">
                    <p className="flex justify-between text-[9px] text-[#1B2D54]/60">
                      <span>{t("{submitted} of {enrolled} submitted", { submitted: a.submitted, enrolled: a.enrolled })}</span>
                      <span dir="ltr">{pct}%</span>
                    </p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#dfe9e7]">
                      <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="rounded-full bg-[#eef2f1] px-2 py-0.5 text-[9px] font-semibold">
                    {a.averagePercent === null ? t("{graded} graded", { graded: a.graded }) : `${t("Avg")} ${a.averagePercent}%`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {open && <QuickAssignmentDialog defaults={{ classId: d.id }} onClose={() => setOpen(false)} onCreated={reload} />}
    </div>
  );
}

/** "Class Announcements": a broadcast to this class's channel; each student is notified. */
export function AnnouncementDialog({ d, onClose, notify }: { d: TeacherClassDetail; onClose: () => void; notify: (text: string) => void }) {
  const t = useT();
  const { busy, error, run } = useBusy();
  const [text, setText] = useState("");
  return (
    <TeacherDialog title={t("Class Announcements")} subtitle={t("Sent to every student of class {name} as a notification.", { name: d.name })} onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const sent = await run("send", () => broadcast(d.id, text.trim()));
          if (sent) {
            notify(t("Sent to {students} students", { students: sent.students }));
            onClose();
          }
        }}
        className="grid gap-3"
      >
        <textarea dir="auto" className={cn(inputClass, "h-28 py-2")} value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} required />
        {error && <p role="alert" className="text-[11px] text-[#c81e1e]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
            {t("Cancel")}
          </button>
          <button type="submit" disabled={busy === "send" || !text.trim()} className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
            {busy === "send" && <LoaderCircle className="size-3.5 animate-spin" />}
            {t("Send")}
          </button>
        </div>
      </form>
    </TeacherDialog>
  );
}

/**
 * "Add class": a class in one of the teacher's grades. Students join it with its code (and school students whose record
 * has this class name are in it from the start).
 */
export function AddClassDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (d: TeacherClassDetail) => void }) {
  const t = useT();
  const [grades, setGrades] = useState<number[] | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [autoAccept, setAutoAccept] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    getTeacherProfile().then(
      (me) => {
        if (!active) return;
        setGrades(me.grades);
        setGrade((g) => g ?? me.grades[0] ?? null);
      },
      (e) => active && setError(errorMessage(e)),
    );
    return () => {
      active = false;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (grade == null) return;
    setBusy(true);
    setError(null);
    setFieldErrors({});
    try {
      onAdded(await addClass(grade, name.trim(), autoAccept));
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) setFieldErrors(err.fieldErrors);
      else setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <TeacherDialog title={t("Add a class")} subtitle={t("Students join it with the class code you get after adding it.")} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t("Grade")} error={fieldErrors.grade}>
            <select className={inputClass} value={grade ?? ""} onChange={(e) => setGrade(Number(e.target.value))} disabled={!grades}>
              {(grades ?? []).map((g) => (
                <option key={g} value={g}>
                  {t("Grade {grade}", { grade: g })}
                </option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label={t("Class name")} error={fieldErrors.name}>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={grade ? `${grade}E` : "9E"}
              maxLength={10}
              required
              dir="auto"
            />
          </FieldLabel>
        </div>
        <label className="flex items-center gap-2 text-[11px]">
          <input type="checkbox" checked={autoAccept} onChange={(e) => setAutoAccept(e.target.checked)} className="size-4 accent-[#14757d]" />
          {t("Accept students who use the code automatically")}
        </label>
        {error && <p role="alert" className="text-[11px] text-[#c81e1e]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
            {t("Cancel")}
          </button>
          <button
            type="submit"
            disabled={busy || grade == null || !name.trim()}
            className="flex items-center gap-1.5 rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
          >
            {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
            {t("Add class")}
          </button>
        </div>
      </form>
    </TeacherDialog>
  );
}

/** "Remove class", for a class with no students, assignments or lessons (one added by mistake). */
export function RemoveClassButton({ d, onRemoved, notify }: { d: TeacherClassDetail; onRemoved: () => void; notify: (text: string) => void }) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (d.students.length > 0 || d.assignments.length > 0 || d.plan.length > 0 || d.requests.length > 0) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-[#f3c2c2] p-3">
      <p className="text-[10px] text-[#1B2D54]/70">{t("This class is empty. You can remove it if you added it by mistake.")}</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm(t("Remove class {name}?", { name: d.name }))) return;
          setBusy(true);
          setError(null);
          try {
            await removeClass(d.id);
            notify(t("Class {name} was removed.", { name: d.name }));
            onRemoved();
          } catch (e) {
            setError(errorMessage(e));
          } finally {
            setBusy(false);
          }
        }}
        className="flex items-center gap-1 rounded-full bg-[#fde8e8] px-3 py-1.5 text-[10px] font-semibold text-[#c81e1e]"
      >
        <Trash2 className="size-3.5" /> {t("Remove class")}
      </button>
      {error && <p role="alert" className="w-full text-[10px] text-[#c81e1e]">{error}</p>}
    </div>
  );
}
