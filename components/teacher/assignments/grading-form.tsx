"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowRight, Bold, Bookmark, Italic, Lightbulb, List, ListChecks, LoaderCircle, RotateCcw, Send } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { gradeSubmission, type AssignmentDetail } from "@/lib/teacher-api";
import { formatDate } from "@/components/teacher/teacher-ui";
import { cn } from "@/lib/utils";

type Draft = { score: string; feedback: string; savedUtc: string };

const draftKey = (assignmentId: string, studentId: string) => `jh.teacher.grade-draft.${assignmentId}.${studentId}`;

function readDraft(assignmentId: string, studentId: string): Draft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(assignmentId, studentId));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function writeDraft(assignmentId: string, studentId: string, draft: Draft | null) {
  try {
    if (draft) window.localStorage.setItem(draftKey(assignmentId, studentId), JSON.stringify(draft));
    else window.localStorage.removeItem(draftKey(assignmentId, studentId));
  } catch {
    // Storage is blocked (private window): the form still works, only without drafts.
  }
}

/** The label for a score in percent. */
export function scoreLabel(percent: number) {
  if (percent >= 85) return tk("Excellent");
  if (percent >= 70) return tk("Proficient");
  if (percent >= 50) return tk("Developing");
  return tk("Needs support");
}

const PHRASES = [
  tk("Great work, well done!"),
  tk("Please show all your steps next time."),
  tk("Review the lesson notes and try this part again."),
  tk("Check your spelling and punctuation."),
];

function Btn({ tone, children, onClick, disabled }: { tone: "teal" | "gray"; children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40 disabled:opacity-60",
        tone === "teal" && "bg-[#0b6b70] text-white hover:bg-[#095a5e]",
        tone === "gray" && "bg-[#eef0f2] text-[#14243f] hover:bg-[#e1e5e8]",
      )}
    >
      {children}
    </button>
  );
}

/**
 * The score and feedback for one student's submission. Mount it with a key per
 * assignment + student so its state starts fresh from the saved draft or the saved grade.
 */
export function GradingForm({
  assignment,
  student,
  onGraded,
  onNext,
}: {
  assignment: AssignmentDetail;
  student: AssignmentDetail["students"][number];
  onGraded: (detail: AssignmentDetail) => void;
  onNext: () => void;
}) {
  const t = useT();
  const max = assignment.maxPoints;
  const [initialDraft] = useState(() => readDraft(assignment.id, student.studentId));
  const [score, setScore] = useState(initialDraft?.score ?? (student.score != null ? String(student.score) : ""));
  const [feedback, setFeedback] = useState(initialDraft?.feedback ?? student.feedback ?? "");
  const [savedUtc, setSavedUtc] = useState<string | null>(initialDraft?.savedUtc ?? null);
  const [phrasesOpen, setPhrasesOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const area = useRef<HTMLTextAreaElement>(null);

  const value = score.trim() === "" ? null : Number(score);
  const valid = value != null && Number.isFinite(value) && value >= 0 && value <= max;
  const percent = valid ? Math.round((value / max) * 100) : null;

  function save(next: { score?: string; feedback?: string }) {
    const draft = { score: next.score ?? score, feedback: next.feedback ?? feedback, savedUtc: new Date().toISOString() };
    writeDraft(assignment.id, student.studentId, draft);
    setSavedUtc(draft.savedUtc);
  }

  function changeScore(s: string) {
    setScore(s);
    setError(null);
    save({ score: s });
  }

  function changeFeedback(f: string) {
    setFeedback(f);
    save({ feedback: f });
  }

  /** Wraps the selected text (or inserts at the cursor) for the toolbar buttons. */
  function insert(before: string, after = "") {
    const el = area.current;
    const start = el?.selectionStart ?? feedback.length;
    const end = el?.selectionEnd ?? feedback.length;
    const next = feedback.slice(0, start) + before + feedback.slice(start, end) + after + feedback.slice(end);
    changeFeedback(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + before.length, end + before.length);
    });
  }

  function reset() {
    writeDraft(assignment.id, student.studentId, null);
    setSavedUtc(null);
    setScore(student.score != null ? String(student.score) : "");
    setFeedback(student.feedback ?? "");
    setError(null);
  }

  async function submit() {
    if (!valid) {
      setError(t("Enter a score from 0 to {max}.", { max }));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const detail = await gradeSubmission(assignment.id, student.studentId, value, feedback.trim());
      writeDraft(assignment.id, student.studentId, null);
      setSavedUtc(null);
      onGraded(detail);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save this grade. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  const quick = [
    { label: tk("Full"), factor: 1 },
    { label: "¾", factor: 0.75 },
    { label: "½", factor: 0.5 },
    { label: "0", factor: 0 },
  ];

  return (
    <>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <ListChecks aria-hidden className="size-5 text-[#0b6b70]" />
            {t("Score")}
          </h3>
          <span className="text-[10px] text-[#1B2D54]/60">{t("Out of {max} points", { max })}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[11px] font-semibold">
            <span className="sr-only">{t("Score")}</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={max}
              step="any"
              dir="ltr"
              value={score}
              onChange={(e) => changeScore(e.target.value)}
              aria-invalid={score !== "" && !valid}
              className="h-10 w-24 rounded-lg border border-[#e3ece9] bg-[#f6f9f8] px-3 text-center text-base font-bold outline-none focus:ring-2 focus:ring-[#12939b]/40"
            />
            <bdi className="text-[#1B2D54]/60">/ {max}</bdi>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quick.map((q) => (
              <button
                key={q.label}
                type="button"
                onClick={() => changeScore(String(Math.round(max * q.factor * 10) / 10))}
                className="rounded-full bg-[#eef0f2] px-3 py-1.5 text-[10px] font-semibold text-[#14243f] hover:bg-[#e1e5e8]"
              >
                {t(q.label)}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-2 text-[11px] font-semibold text-[#c81e1e]">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0b6b70] px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-white text-center leading-none text-[#0b6b70]">
            <bdi className="text-xl font-bold">{valid ? value : "–"}</bdi>
            <bdi className="text-[8px]">/ {max}</bdi>
          </div>
          <div className="leading-tight">
            <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
              {t("Calculated Score")}
              {percent != null && <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-semibold">{t(scoreLabel(percent))}</span>}
            </p>
            <p className="mt-1 text-[11px] text-white/80">
              {percent != null ? t("{pct}% of the full mark", { pct: percent }) : t("Enter a score to see the result.")}
              {student.score != null && ` • ${t("Saved grade: {score}", { score: student.score })}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-[11px] font-semibold ring-1 ring-white/40 hover:bg-white/25"
        >
          <RotateCcw aria-hidden className="size-3.5" />
          {t("Discard changes")}
        </button>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <Lightbulb aria-hidden className="size-5 text-[#0b6b70]" />
            {t("Feedback to the Student")}
          </h3>
          {savedUtc && <span className="text-[10px] text-[#1B2D54]/60">{t("Auto-saved {time}", { time: formatDate(savedUtc, true) })}</span>}
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#e3ece9]">
          <div className="flex flex-wrap items-center gap-1 bg-[#f1f4f4] px-3 py-2">
            <button type="button" aria-label={t("Bold")} onClick={() => insert("**", "**")} className="grid size-7 place-items-center rounded hover:bg-white">
              <Bold aria-hidden className="size-3.5" />
            </button>
            <button type="button" aria-label={t("Italic")} onClick={() => insert("_", "_")} className="grid size-7 place-items-center rounded hover:bg-white">
              <Italic aria-hidden className="size-3.5" />
            </button>
            <button type="button" aria-label={t("List")} onClick={() => insert("\n- ")} className="grid size-7 place-items-center rounded hover:bg-white">
              <List aria-hidden className="size-3.5" />
            </button>
            <span aria-hidden className="mx-1 h-4 w-px bg-[#1B2D54]/15" />
            <button
              type="button"
              aria-expanded={phrasesOpen}
              onClick={() => setPhrasesOpen((o) => !o)}
              className="flex items-center gap-1 rounded bg-[#e6ebec] px-2.5 py-1.5 text-[10px] font-semibold text-[#14243f]"
            >
              <Bookmark aria-hidden className="size-3" />
              {t("Quick phrases")}
            </button>
          </div>
          {phrasesOpen && (
            <div className="flex flex-wrap gap-1.5 border-t border-[#e3ece9] bg-[#f6f9f8] px-3 py-2">
              {PHRASES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    insert((feedback && !feedback.endsWith(" ") && !feedback.endsWith("\n") ? " " : "") + t(p));
                    setPhrasesOpen(false);
                  }}
                  className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-[#0b6b70] ring-1 ring-[#e3ece9] hover:bg-[#eef0f2]"
                >
                  {t(p)}
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={area}
            value={feedback}
            onChange={(e) => changeFeedback(e.target.value)}
            rows={5}
            dir="auto"
            aria-label={t("Feedback to the Student")}
            placeholder={t("Write what went well and what to improve…")}
            className="w-full resize-y bg-white p-4 text-xs leading-relaxed text-[#1B2D54] outline-none focus:ring-2 focus:ring-inset focus:ring-[#12939b]/40"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#e3ece9] pt-4">
          <Btn tone="gray" onClick={() => save({})}>
            {t("Save as Draft")}
          </Btn>
          <div className="flex items-center gap-2">
            <Btn tone="teal" onClick={submit} disabled={busy}>
              {busy ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : <Send aria-hidden className="size-3.5 rtl:-scale-x-100" />}
              {t("Submit Feedback & Notify Student")}
            </Btn>
            <button
              type="button"
              aria-label={t("Next student")}
              onClick={onNext}
              className="grid size-8 place-items-center rounded-lg bg-[#eef0f2] hover:bg-[#e1e5e8]"
            >
              <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
