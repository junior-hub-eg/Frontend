"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, ClipboardCheck, FileText, Sparkles, XCircle } from "lucide-react";
import {
  answerSentence,
  WORD_COLOR,
  type GrammarStatus,
  type Practice,
  type SentenceResult,
} from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import QuickCheck from "./QuickCheck";
import { ColorLegend, ErrorBox, PRIMARY_BTN, SOFT_BTN, Spinner } from "./shared";

/** A word of the practice sentence: click it, then pick its role. */
function PracticeWord({
  word,
  options,
  value,
  result,
  open,
  onOpen,
  onPick,
}: {
  word: string;
  options: string[];
  value: string;
  result?: SentenceResult["words"][number];
  open: boolean;
  onOpen: (open: boolean) => void;
  onPick: (role: string) => void;
}) {
  const t = useT();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, onOpen]);

  if (options.length === 0) {
    return <span className="px-[0.2em] text-[#14365a]">{word}</span>;
  }

  const colored = result
    ? `${WORD_COLOR[result.color] ?? WORD_COLOR.gray} ${result.right ? "" : "!ring-2 !ring-[#e5484d]"}`
    : value
      ? "bg-[#e4f7f4] text-[#0f6f6b] ring-[#98dcd6]"
      : "bg-white text-[#14365a] ring-[#cfe3ec] border-b-2 border-dashed border-[#1f9e95]";

  return (
    <span ref={ref} className="relative inline-flex flex-col items-center">
      <button
        type="button"
        disabled={!!result}
        onClick={() => onOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={value || t("Choose this word's role")}
        className={`rounded-[0.5em] px-[0.4em] py-[0.05em] ring-1 transition hover:shadow ${colored}`}
      >
        {word}
      </button>
      {value && <span className="mt-[0.1em] max-w-[8em] truncate text-[0.55em] leading-tight text-[#5b7089]">{value}</span>}
      {open && (
        <ul
          role="listbox"
          className="absolute top-full z-20 mt-[0.3em] min-w-[9em] rounded-[0.8em] border border-[#e3eef5] bg-white p-[0.3em] text-[0.7em] shadow-lg"
        >
          {options.map((o) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                onClick={() => {
                  onPick(o);
                  onOpen(false);
                }}
                className={`w-full rounded-[0.5em] px-[0.7em] py-[0.4em] text-start text-[#14365a] hover:bg-[#f1f8fb] ${
                  o === value ? "bg-[#e4f7f4] font-bold" : ""
                }`}
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

/** Guiding questions, their answers revealed one at a time (US-08). */
function GuidingQuestions({ items }: { items: { question: string; answer: string }[] }) {
  const t = useT();
  const [shown, setShown] = useState(0);
  if (items.length === 0) return null;
  return (
    <div className="mt-[0.5em]">
      <p className="text-[0.75em] font-bold text-[#14365a]">{t("Think about it:")}</p>
      <ol dir="rtl" className="mt-[0.3em] space-y-[0.35em] text-[0.8em]">
        {items.map((q, i) => (
          <li key={i} className="rounded-[0.7em] bg-white p-[0.5em] ring-1 ring-[#e3eef5]">
            <p className="font-semibold">{q.question}</p>
            {i < shown ? (
              <p className="mt-[0.2em] text-[#11704a]">{q.answer}</p>
            ) : i === shown ? (
              <button type="button" onClick={() => setShown(shown + 1)} className="mt-[0.2em] text-[0.9em] font-bold text-[#1f9e95] hover:underline">
                {t("Show the answer")}
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** "الخطوة التالية": sentence practice and the Quick Check. */
export default function PracticeCard({
  topicKey,
  first,
  loading,
  error: lessonError,
  onRetry,
  onStatus,
  onSentence,
  onOpenPassages,
}: {
  topicKey: string;
  first: Practice | null;
  /** The AI is writing the lesson's first sentence. */
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onStatus: (status: GrammarStatus) => void;
  onSentence: (text: string) => void;
  onOpenPassages: () => void;
}) {
  const t = useT();
  const [practice, setPractice] = useState<Practice | null>(first);
  const [answers, setAnswers] = useState<string[]>([]);
  const [openWord, setOpenWord] = useState<number | null>(null);
  const [result, setResult] = useState<SentenceResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [toast, setToast] = useState<number | null>(null);
  const [quiz, setQuiz] = useState(false);

  // A new lesson (topic) brings a new first sentence.
  const [shownFirst, setShownFirst] = useState(first);
  if (first !== shownFirst) {
    setShownFirst(first);
    setPractice(first);
    setAnswers([]);
    setResult(null);
    setError(null);
    setQuiz(false);
  }

  useEffect(() => {
    if (practice) onSentence(practice.text);
  }, [practice, onSentence]);

  useEffect(() => {
    if (toast == null) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const loadSentence = (p: Practice | null) => {
    setPractice(p);
    setAnswers([]);
    setResult(null);
    setError(null);
  };

  const ready = practice ? practice.words.every((w, i) => w.options.length === 0 || !!answers[i]) : false;

  const check = async () => {
    if (!practice) return;
    setChecking(true);
    setError(null);
    try {
      const res = await answerSentence(
        practice.exerciseId,
        practice.words.map((_, i) => answers[i] ?? "")
      );
      setResult(res);
      onStatus(res.status);
      if (res.correct && res.xpAwarded > 0) setToast(res.xpAwarded);
    } catch (e) {
      setError(e);
    } finally {
      setChecking(false);
    }
  };

  return (
    <section className="relative rounded-[1.4em] bg-gradient-to-br from-[#2bb8a6] via-[#3a8ee6] to-[#7b5cf0] p-[0.15em] shadow-[0_0.6em_2em_rgba(43,120,200,0.18)]">
      <div className="relative rounded-[1.3em] bg-white p-[1.1em]">
      <header className="flex items-start gap-[0.7em]">
        <span className="grid h-[2.8em] w-[2.8em] shrink-0 place-items-center rounded-[0.9em] bg-gradient-to-br from-[#2bb8a6] to-[#3a8ee6] text-white shadow">
          <Sparkles className="h-[1.5em] w-[1.5em]" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex flex-wrap items-center gap-[0.4em] text-[1.25em] font-extrabold text-[#14365a]">
            {t("Practise with the AI coach")}
            <span className="rounded-full bg-gradient-to-r from-[#2bb8a6] to-[#7b5cf0] px-[0.6em] py-[0.1em] text-[0.6em] font-black tracking-wide text-white">AI</span>
          </h2>
          <p className="text-[0.78em] text-[#5b7089]">
            {t("The AI writes a sentence at your level, checks every word, and explains your mistakes without giving the answer away.")}
          </p>
        </div>
      </header>

      {toast != null && (
        <div role="status" className="absolute end-[1em] top-[1em] z-30 rounded-full bg-[#14365a] px-[1em] py-[0.4em] text-[0.8em] font-bold text-white shadow-lg">
          {t("+{xp} XP. Well done!", { xp: toast })}
        </div>
      )}

      <div className="mt-[0.9em] rounded-[1.1em] border border-[#e3eef5] p-[0.9em]">
        <div className="flex flex-wrap items-center justify-between gap-[0.5em]">
          <h3 className="flex items-center gap-[0.4em] text-[0.95em] font-extrabold text-[#14365a]">
            <FileText className="h-[1.2em] w-[1.2em]" />
            {quiz ? t("Quick Check") : t("Grammar practice")}
          </h3>
          <div className="flex flex-wrap gap-[0.4em]">
            {!quiz && (
              <button type="button" className={SOFT_BTN} onClick={() => setQuiz(true)}>
                <ClipboardCheck className="h-[1.1em] w-[1.1em]" />
                {t("Quick Check")}
              </button>
            )}
            <button type="button" className={SOFT_BTN} onClick={onOpenPassages}>
              <span aria-hidden>📷</span>
              {t("Photograph a grammar passage")}
            </button>
          </div>
        </div>

        {quiz ? (
          <QuickCheck topicKey={topicKey} onStatus={onStatus} onClose={() => setQuiz(false)} />
        ) : !practice && loading ? (
          <Spinner label={t("The AI is writing a sentence for you...")} />
        ) : !practice && lessonError != null ? (
          <div className="mt-[0.8em]">
            <ErrorBox error={lessonError} onRetry={onRetry} />
          </div>
        ) : !practice ? (
          <p className="mt-[0.8em] text-[0.85em] text-[#5b7089]">{t("Open a lesson to get your first sentence.")}</p>
        ) : (
          <>
            <p className="mt-[0.4em] flex items-center gap-[0.35em] text-[0.75em] text-[#5b7089]">
              <Sparkles className="h-[1.1em] w-[1.1em] text-[#3a8ee6]" />
              {t("A new sentence written by the AI for you. Click each word, then choose its grammatical role.")}
            </p>
            <div dir="rtl" className="mt-[0.8em] flex min-h-[4.5em] flex-wrap items-center justify-center gap-x-[0.5em] gap-y-[0.9em] rounded-[1em] bg-gradient-to-br from-[#f1f8ff] to-[#f3fbf9] p-[1.1em] text-[1.6em] leading-[1.9] ring-1 ring-[#e3eef5]">
              {practice.words.map((w, i) => (
                <PracticeWord
                  key={`${practice.exerciseId}-${w.index}`}
                  word={w.word}
                  options={w.options}
                  value={answers[i] ?? ""}
                  result={result?.words[i]}
                  open={openWord === i}
                  onOpen={(o) => setOpenWord(o ? i : null)}
                  onPick={(role) => {
                    const next = [...answers];
                    next[i] = role;
                    setAnswers(next);
                  }}
                />
              ))}
            </div>
            <div className="mt-[0.6em]">
              <ColorLegend />
            </div>

            {error != null && (
              <div className="mt-[0.8em]">
                <ErrorBox error={error} onRetry={check} />
              </div>
            )}

            {!result ? (
              <div className="mt-[0.9em] flex justify-end">
                <button type="button" onClick={check} disabled={!ready || checking} className={PRIMARY_BTN}>
                  <CheckCircle2 className="h-[1.1em] w-[1.1em]" />
                  {checking ? t("Checking...") : t("Check")}
                </button>
              </div>
            ) : result.correct ? (
              <div className="mt-[0.9em] rounded-[1em] bg-[#e3f6ec] p-[0.9em] text-[#11704a]">
                <p className="flex items-center gap-[0.4em] font-extrabold">
                  <CheckCircle2 className="h-[1.2em] w-[1.2em]" />
                  {t("Correct! Every word is right.")}
                </p>
                <div className="mt-[0.7em] flex flex-wrap justify-end gap-[0.5em]">
                  {result.next ? (
                    <button type="button" className={PRIMARY_BTN} onClick={() => loadSentence(result.next)}>
                      {t("Next sentence (a bit harder)")}
                    </button>
                  ) : (
                    <button type="button" className={PRIMARY_BTN} onClick={() => setQuiz(true)}>
                      {t("Take the Quick Check")}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-[0.9em] rounded-[1em] bg-[#fff1f1] p-[0.9em] text-[#14365a]">
                <p className="flex items-center gap-[0.4em] font-extrabold text-[#b42323]">
                  <XCircle className="h-[1.2em] w-[1.2em]" />
                  {t("Not quite. Let's look at the words you missed.")}
                </p>
                <ul className="mt-[0.6em] space-y-[0.6em]">
                  {(result.feedback ?? []).map((f, i) => (
                    <li key={i} className="rounded-[0.9em] bg-[#fbfdff] p-[0.7em] ring-1 ring-[#f3d4d4]">
                      <p dir="rtl" className="flex items-center gap-[0.4em] font-extrabold">
                        <BookOpen className="h-[1.1em] w-[1.1em] text-[#1f9e95]" />
                        {f.word}
                      </p>
                      <p dir="rtl" className="mt-[0.2em] text-[0.82em]"><b>{t("What:")}</b> {f.what}</p>
                      <p dir="rtl" className="text-[0.82em]"><b>{t("Why:")}</b> {f.why}</p>
                      <GuidingQuestions items={f.guidingQuestions} />
                    </li>
                  ))}
                  {(!result.feedback || result.feedback.length === 0) &&
                    result.words
                      .filter((w) => !w.right)
                      .map((w, i) => (
                        <li key={i} dir="rtl" className="rounded-[0.9em] bg-[#fbfdff] p-[0.7em] text-[0.82em] ring-1 ring-[#f3d4d4]">
                          <b>{w.word}</b>: {w.expected} - {w.explanation}
                        </li>
                      ))}
                </ul>
                <div className="mt-[0.7em] flex flex-wrap justify-end gap-[0.5em]">
                  {result.next ? (
                    <button type="button" className={PRIMARY_BTN} onClick={() => loadSentence(result.next)}>
                      {t("Try a similar sentence")}
                    </button>
                  ) : (
                    <button type="button" className={SOFT_BTN} onClick={() => loadSentence(practice)}>
                      {t("Try this sentence again")}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      </div>
    </section>
  );
}
