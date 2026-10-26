"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { EmbeddedChat } from "@/components/chat/ChatWorkspace";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  ClipboardList,
  KeyRound,
  MessageCircleQuestion,
  MessagesSquare,
  School,
  Send,
  UsersRound,
} from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  askQuestion,
  getMyQuestions,
  getStudentAssignments,
  getStudentCalendar,
  getStudentClasses,
  joinClass,
  submitAssignment,
  type ClassQuestion,
  type StudentAssignment,
  type StudentCalendarItem,
  type StudentClass,
} from "@/lib/student-classes-api";
import type { AssignmentStatus } from "@/lib/teacher-api";
import { SUBJECT_LABEL, formatDate } from "@/components/teacher/teacher-ui";
import { CARD, ErrorBox, PRIMARY_BTN, Spinner } from "@/components/learner/grammar/shared";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

const STATUS: Record<AssignmentStatus, { label: string; cls: string }> = {
  NotStarted: { label: tk("To do"), cls: "bg-[#e7f1fb] text-[#1f5f99]" },
  Missing: { label: tk("Missing"), cls: "bg-[#fdecec] text-[#c81e1e]" },
  Submitted: { label: tk("Submitted"), cls: "bg-[#e3f6ec] text-[#11704a]" },
  Late: { label: tk("Submitted late"), cls: "bg-[#fff4d6] text-[#a8740a]" },
  Graded: { label: tk("Graded"), cls: "bg-[#ede7fb] text-[#5b3cc4]" },
};
/** To do first, then missing, then the rest by due date. */
const ORDER: Record<AssignmentStatus, number> = { NotStarted: 0, Missing: 1, Submitted: 2, Late: 2, Graded: 3 };

const INPUT =
  "w-full rounded-[0.8em] border border-[#d6e4ee] bg-white px-[0.9em] py-[0.55em] text-[0.9em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#1f9e95]/40";

function SectionTitle({ icon: Icon, children }: { icon: typeof School; children: string }) {
  return (
    <h2 className="flex items-center gap-[0.5em] text-[1.1em] font-extrabold text-[#14365a]">
      <Icon className="h-[1.2em] w-[1.2em] text-[#1f9e95]" />
      {children}
    </h2>
  );
}

/** Join another class with the code (or link) a teacher shared. */
function JoinByCode({ onJoined }: { onJoined: (c: StudentClass) => void }) {
  const t = useT();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    // A pasted invite link works too: its last part is the code.
    const clean = code.trim().split("/").pop()?.trim().toUpperCase() ?? "";
    if (!clean) return;
    setBusy(true);
    setMessage(null);
    try {
      const c = await joinClass(clean);
      onJoined(c);
      setCode("");
      setMessage({
        ok: true,
        text:
          c.status === "Active"
            ? t("You joined class {name}.", { name: c.name })
            : t("Request sent. Your teacher will accept you into class {name} soon.", { name: c.name }),
      });
    } catch (err) {
      setMessage({
        ok: false,
        text:
          err instanceof ApiError && (err.code === "ALREADY_IN_CLASS" || err.code === "ALREADY_ASKED")
            ? t("You are already in this class, or your request is waiting.")
            : errorMessage(err),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative mt-[0.9em] flex max-w-[30em] flex-wrap items-center gap-[0.5em]">
      <label className="sr-only" htmlFor="class-code">
        {t("Class code")}
      </label>
      <span className="relative min-w-[12em] flex-1">
        <KeyRound className="pointer-events-none absolute start-[0.8em] top-1/2 h-[1em] w-[1em] -translate-y-1/2 text-[#14365a]/50" />
        <input
          id="class-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("Class code")}
          className="w-full rounded-full border-0 bg-white py-[0.6em] pe-[1em] ps-[2.3em] font-mono text-[0.9em] uppercase tracking-wider text-[#14365a] outline-none ring-1 ring-white/50 focus:ring-2 focus:ring-[#ffd166]"
        />
      </span>
      <button type="submit" disabled={busy || !code.trim()} className={cn(PRIMARY_BTN, "bg-[#ffd166] text-[#123a63]")}>
        {busy ? t("Joining...") : t("Join a class")}
      </button>
      {message && (
        <p role="status" className={cn("w-full text-[0.82em] font-semibold", message.ok ? "text-[#bdf3ec]" : "text-[#ffd0d0]")}>
          {message.text}
        </p>
      )}
    </form>
  );
}

function ClassCard({ c, selected, onSelect }: { c: StudentClass; selected: boolean; onSelect: () => void }) {
  const t = useT();
  const pending = c.status === "Pending";
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        disabled={pending}
        aria-pressed={selected}
        className={cn(
          CARD,
          "flex w-full items-center gap-[0.8em] p-[1em] text-start transition",
          selected ? "ring-2 ring-[#1f9e95]" : "hover:shadow-md",
          pending && "cursor-default opacity-80",
        )}
      >
        <span className="grid h-[2.8em] w-[2.8em] shrink-0 place-items-center rounded-full bg-[#c9efe9] text-[#14757d]">
          <UsersRound className="h-[1.4em] w-[1.4em]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1.05em] font-bold text-[#14365a]">{t("Class {name}", { name: c.name })}</span>
          <span className="block truncate text-[0.78em] text-[#5b7089]">
            {c.schoolName} • {t("Grade {grade}", { grade: c.grade })}
          </span>
        </span>
        {pending ? (
          <span className="inline-flex shrink-0 items-center gap-[0.3em] rounded-full bg-[#fff4d6] px-[0.7em] py-[0.2em] text-[0.72em] font-semibold text-[#a8740a]">
            <Clock className="h-[1.1em] w-[1.1em]" /> {t("Waiting for the teacher")}
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center gap-[0.3em] rounded-full bg-[#e3f6ec] px-[0.7em] py-[0.2em] text-[0.72em] font-semibold text-[#11704a]">
            <CheckCircle2 className="h-[1.1em] w-[1.1em]" /> {t("Joined")}
          </span>
        )}
      </button>
    </li>
  );
}

function AssignmentCard({ a, onSubmitted }: { a: StudentAssignment; onSubmitted: (a: StudentAssignment) => void }) {
  const t = useT();
  const [open, setOpen] = useState(a.status === "NotStarted" || a.status === "Missing");
  const [answer, setAnswer] = useState(a.answer ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = STATUS[a.status] ?? STATUS.NotStarted;
  const canSubmit = a.status !== "Graded";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!answer.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await submitAssignment(a.id, answer.trim());
      const now = new Date().toISOString();
      onSubmitted({ ...a, answer: answer.trim(), submittedUtc: now, status: now > a.dueUtc ? "Late" : "Submitted" });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={`${CARD} p-[1em]`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-start gap-[0.7em] text-start">
        <span className="min-w-0 flex-1">
          <span className="block text-[0.72em] font-semibold text-[#1f9e95]">
            {t(SUBJECT_LABEL[a.subject] ?? a.subject)} • {t("Class {name}", { name: a.className })}
          </span>
          <span dir="auto" className="block text-[1em] font-bold text-[#14365a]">{a.title}</span>
          <span className="block text-[0.78em] text-[#5b7089]">{t("Due {date}", { date: formatDate(a.dueUtc, true) })}</span>
        </span>
        <span className={`shrink-0 rounded-full px-[0.7em] py-[0.2em] text-[0.72em] font-semibold ${s.cls}`}>
          {a.status === "Graded" && a.score != null ? `${a.score} / ${a.maxPoints}` : t(s.label)}
        </span>
      </button>

      {open && (
        <div className="mt-[0.8em] grid gap-[0.7em] border-t border-[#eef3f7] pt-[0.8em]">
          {a.instructions && (
            <p dir="auto" className="whitespace-pre-line text-[0.88em] text-[#14365a]">
              {a.instructions}
            </p>
          )}
          {a.status === "Graded" ? (
            <div className="rounded-[0.9em] bg-[#f5f2fd] p-[0.9em] text-[0.88em] text-[#14365a]">
              <p className="font-bold">{t("Your grade: {score} of {max}", { score: a.score ?? 0, max: a.maxPoints })}</p>
              {a.feedback && <p dir="auto" className="mt-[0.3em] whitespace-pre-line">{a.feedback}</p>}
              {a.answer && (
                <p dir="auto" className="mt-[0.5em] whitespace-pre-line text-[#5b7089]">
                  {t("Your answer")}: {a.answer}
                </p>
              )}
            </div>
          ) : (
            canSubmit && (
              <form onSubmit={submit} className="grid gap-[0.5em]">
                <label className="text-[0.8em] font-semibold text-[#14365a]" htmlFor={`answer-${a.id}`}>
                  {t("Your answer")}
                </label>
                <textarea
                  id={`answer-${a.id}`}
                  dir="auto"
                  rows={4}
                  maxLength={4000}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className={INPUT}
                />
                {error && <p role="alert" className="text-[0.8em] text-[#c81e1e]">{error}</p>}
                <div className="flex flex-wrap items-center gap-[0.6em]">
                  <button type="submit" disabled={busy || !answer.trim()} className={PRIMARY_BTN}>
                    <Send className="h-[1em] w-[1em] rtl:-scale-x-100" />
                    {a.submittedUtc ? t("Update my answer") : t("Submit")}
                  </button>
                  {a.submittedUtc && (
                    <span className="text-[0.78em] text-[#5b7089]">{t("Submitted {date}", { date: formatDate(a.submittedUtc, true) })}</span>
                  )}
                </div>
              </form>
            )
          )}
        </div>
      )}
    </li>
  );
}

/** The class's conversation of the one chat (27 Oct 2026): the teacher's messages and the students' replies, live. */
function ClassChannel({ classId }: { classId: string }) {
  return <EmbeddedChat target={{ classId }} className="h-[min(65vh,34rem)]" />;
}

function AskTeacher({ classes, questions, onAsked }: { classes: StudentClass[]; questions: ClassQuestion[]; onAsked: (q: ClassQuestion) => void }) {
  const t = useT();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim() || !classId) return;
    setBusy(true);
    setError(null);
    try {
      onAsked(await askQuestion(classId, text.trim()));
      setText("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-[0.7em]">
      <form onSubmit={submit} className="grid gap-[0.5em]">
        {classes.length > 1 && (
          <select aria-label={t("Class")} value={classId} onChange={(e) => setClassId(e.target.value)} className={INPUT}>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {t("Class {name}", { name: c.name })}
              </option>
            ))}
          </select>
        )}
        <textarea
          aria-label={t("Your question")}
          dir="auto"
          rows={2}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("Ask your teacher a question…")}
          className={INPUT}
        />
        {error && <p role="alert" className="text-[0.8em] text-[#c81e1e]">{error}</p>}
        <button type="submit" disabled={busy || !text.trim()} className={cn(PRIMARY_BTN, "justify-self-start")}>
          {t("Send question")}
        </button>
      </form>
      {questions.length > 0 && (
        <ul className="grid gap-[0.5em]">
          {questions.map((q) => (
            <li key={q.id} className="rounded-[0.9em] bg-[#f6f9fb] p-[0.8em] text-[0.85em] text-[#14365a]">
              <p dir="auto" className="font-semibold">{q.text}</p>
              {q.answer ? (
                <p dir="auto" className="mt-[0.3em] whitespace-pre-line text-[#11704a]">
                  {t("Teacher")}: {q.answer}
                </p>
              ) : (
                <p className="mt-[0.3em] text-[0.85em] text-[#a8740a]">{t("Waiting for an answer")}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Schedule({ items }: { items: StudentCalendarItem[] }) {
  const t = useT();
  if (items.length === 0) return <p className="py-[0.5em] text-[0.85em] text-[#5b7089]">{t("Nothing scheduled this week.")}</p>;
  return (
    <ul className="grid gap-[0.5em]">
      {items.map((e) => (
        <li key={e.id} className="flex items-start gap-[0.7em] rounded-[0.9em] bg-[#f6f9fb] p-[0.7em] text-[0.85em] text-[#14365a]">
          <CalendarDays className="mt-[0.15em] h-[1.1em] w-[1.1em] shrink-0 text-[#1f9e95]" />
          <span className="min-w-0">
            <span dir="auto" className="block font-semibold">{e.title}</span>
            <span className="block text-[0.85em] text-[#5b7089]">
              {formatDate(e.startUtc, true)} • {t("Class {name}", { name: e.className })}
              {e.location ? ` • ${e.location}` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

type Data = { classes: StudentClass[]; assignments: StudentAssignment[]; questions: ClassQuestion[]; calendar: StudentCalendarItem[] };

/** AI Curriculum > My classes: the student's school classes, their teachers' assignments, questions, channel and schedule. */
export default function MyClassesPage() {
  const t = useT();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [classes, assignments, questions, calendar] = await Promise.all([
        getStudentClasses(),
        getStudentAssignments(),
        getMyQuestions(),
        getStudentCalendar(),
      ]);
      setData({ classes, assignments, questions, calendar });
    } catch (e) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the classes on open
    void load();
  }, [load]);

  const active = useMemo(() => data?.classes.filter((c) => c.status === "Active") ?? [], [data]);
  const classId = selected && active.some((c) => c.id === selected) ? selected : (active[0]?.id ?? null);
  const assignments = useMemo(
    () =>
      [...(data?.assignments ?? [])]
        .filter((a) => !classId || active.length < 2 || a.classId === classId)
        .sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.dueUtc.localeCompare(b.dueUtc)),
    [data, classId, active.length],
  );
  const toDo = data?.assignments.filter((a) => a.status === "NotStarted" || a.status === "Missing").length ?? 0;

  function joined(c: StudentClass) {
    setData((d) => (d ? { ...d, classes: [...d.classes.filter((x) => x.id !== c.id), c] } : d));
    if (c.status === "Active") void load();
  }

  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-gradient-to-b from-[#eaf5ff] to-[#f6fbff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        <nav className="flex items-center gap-[0.5em] text-[0.85em] text-[#14365a]">
          <Link href="/learner/ai-curriculum" className="hover:underline">
            {t("AI Curriculum")}
          </Link>
          <ChevronRight className="h-[1em] w-[1em] rtl:rotate-180" />
          <span>{t("My classes")}</span>
        </nav>

        <section className="relative mt-[0.6em] overflow-hidden rounded-[1.6em] bg-gradient-to-br from-[#123a63] via-[#155e7a] to-[#1f9e95] p-[1.3em] text-white shadow-[0_0.8em_2.4em_rgba(20,54,90,0.25)]">
          <span aria-hidden className="pointer-events-none absolute -end-[3em] -top-[4em] h-[12em] w-[12em] rounded-full bg-white/10" />
          <h1 className="relative text-[1.9em] font-extrabold leading-tight">{t("My classes")}</h1>
          <p className="relative mt-[0.2em] max-w-[40em] text-[0.9em] text-white/85">
            {t("Your school classes and what your teachers share with you: assignments, questions, class messages and the schedule.")}
          </p>
          {data && (
            <p className="relative mt-[0.5em] flex flex-wrap gap-[0.5em] text-[0.8em] font-semibold">
              <span className="rounded-full bg-white/15 px-[0.9em] py-[0.3em]">{t("Classes: {count}", { count: active.length })}</span>
              <span className="rounded-full bg-white/15 px-[0.9em] py-[0.3em]">{t("Assignments to do: {count}", { count: toDo })}</span>
            </p>
          )}
          <JoinByCode onJoined={joined} />
        </section>

        {error != null ? (
          <div className="mt-[1em]">
            <ErrorBox error={error} onRetry={load} />
          </div>
        ) : !data ? (
          <Spinner label={t("Loading...")} />
        ) : data.classes.length === 0 ? (
          <p className={`${CARD} mt-[1em] p-[2em] text-center text-[0.9em] text-[#5b7089]`}>
            {t("You are not in a class yet. Enter the code your teacher gave you, or open their invite link.")}
          </p>
        ) : (
          <>
            <ul className="mt-[1em] grid gap-[0.8em] md:grid-cols-2 xl:grid-cols-3">
              {data.classes.map((c) => (
                <ClassCard key={c.id} c={c} selected={c.id === classId && active.length > 1} onSelect={() => setSelected(c.id)} />
              ))}
            </ul>

            <div className="mt-[1.2em] grid items-start gap-[1em] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <section className="grid gap-[0.7em]">
                <SectionTitle icon={ClipboardList}>{t("Assignments")}</SectionTitle>
                {assignments.length === 0 ? (
                  <p className={`${CARD} p-[1.5em] text-center text-[0.88em] text-[#5b7089]`}>{t("No assignments from your teachers yet.")}</p>
                ) : (
                  <ul className="grid gap-[0.6em]">
                    {assignments.map((a) => (
                      <AssignmentCard
                        key={a.id}
                        a={a}
                        onSubmitted={(next) =>
                          setData((d) => (d ? { ...d, assignments: d.assignments.map((x) => (x.id === next.id ? next : x)) } : d))
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>

              <div className="grid gap-[1em]">
                {classId && (
                  <section className={`${CARD} grid gap-[0.7em] p-[1em]`}>
                    <SectionTitle icon={MessagesSquare}>{t("Class messages")}</SectionTitle>
                    <ClassChannel key={classId} classId={classId} />
                  </section>
                )}
                {active.length > 0 && (
                  <section className={`${CARD} grid gap-[0.7em] p-[1em]`}>
                    <SectionTitle icon={MessageCircleQuestion}>{t("Ask your teacher")}</SectionTitle>
                    <AskTeacher
                      classes={active}
                      questions={data.questions}
                      onAsked={(q) => setData((d) => (d ? { ...d, questions: [q, ...d.questions] } : d))}
                    />
                  </section>
                )}
                <section className={`${CARD} grid gap-[0.7em] p-[1em]`}>
                  <SectionTitle icon={CalendarDays}>{t("This week")}</SectionTitle>
                  <Schedule items={data.calendar} />
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
