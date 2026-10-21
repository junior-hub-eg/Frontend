"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { getLesson, lessonPath, submitLessonQuiz } from "@/lib/learning-api";
import { NAMES, offlineLessons, toCode } from "./TrackDetailPage";

type Q = { id: string; prompt: string; options: string[] };

type View = {
  title: string;
  trackName: string;
  questions: Q[];
  /** Demo only: correct option index per question, so the quiz can be graded without the API. */
  answerKey: number[] | null;
};

type Result = { id: string; correct: boolean; help: string | null };

type State = { kind: "loading" } | { kind: "ready"; view: View };

const DEMO_QUESTIONS: Q[] = [
  { id: "q1", prompt: "Which HTML element represents the main heading?", options: ["<p>", "<h1>", "<button>", "<img>"] },
  { id: "q2", prompt: "What does a wireframe show?", options: ["Final colors", "The basic layout", "Server code", "Marketing copy"] },
  { id: "q3", prompt: "Who is the product designed for?", options: ["The developer", "The user", "The manager", "The competitor"] },
];
const DEMO_KEY = [1, 1, 1];

function offlineView(code: string, lessonId: string): View {
  const name = NAMES[toCode(code)] ?? code;
  const cur = offlineLessons(name).find((l) => l.id === lessonId) ?? offlineLessons(name)[0];
  return { title: cur.title, trackName: name, questions: DEMO_QUESTIONS, answerKey: DEMO_KEY };
}

const noScrollbar = "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export default function LessonQuizPage({ code, lessonId }: { code: string; lessonId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [results, setResults] = useState<Result[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Local no-login mode: skip the API so a 401 can't send you to /login.
    if (process.env.NEXT_PUBLIC_SKIP_AUTH === "true") {
      setState({ kind: "ready", view: offlineView(code, lessonId) });
      return;
    }

    getLesson(lessonId)
      .then((lesson) => {
        if (!active) return;
        setState({
          kind: "ready",
          view: {
            title: lesson.title,
            trackName: NAMES[toCode(lesson.trackCode)] ?? lesson.trackCode,
            questions: lesson.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: q.options })),
            answerKey: null,
          },
        });
      })
      .catch(() => active && setState({ kind: "ready", view: offlineView(code, lessonId) }));
    return () => {
      active = false;
    };
  }, [code, lessonId]);

  /* Desktop: one screen, no page scroll. */
  const wrapper = (children: React.ReactNode) => (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fdfcff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className={`relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*1.6)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)] ${noScrollbar}`}
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );

  if (state.kind === "loading") {
    return wrapper(
      <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>,
    );
  }

  const { view } = state;
  const total = view.questions.length;
  const q = view.questions[index];
  const backHref = lessonPath(code, lessonId) as Route;

  const back = (
    <Link href={backHref} className="inline-flex items-center gap-[0.5em] text-[0.8em] font-semibold text-[#12606b] hover:underline">
      <ArrowLeft className="size-[1.1em]" /> Back to Lesson
    </Link>
  );

  function restart() {
    setIndex(0);
    setPicked(null);
    setAnswers([]);
    setResults(null);
    setError(null);
  }

  async function submit() {
    if (picked === null || !q) return;
    const next = [...answers, picked];

    if (index < total - 1) {
      setAnswers(next);
      setPicked(null);
      setIndex(index + 1);
      return;
    }

    setAnswers(next);
    setError(null);

    // Demo grading (no API)
    if (view.answerKey) {
      const key = view.answerKey;
      setResults(view.questions.map((qq, i) => ({ id: qq.id, correct: next[i] === key[i], help: next[i] === key[i] ? null : "Review the lesson and try again." })));
      return;
    }

    setBusy(true);
    try {
      const r = await submitLessonQuiz(lessonId, next);
      setResults(r.results.map((x) => ({ id: x.questionId, correct: x.correct, help: x.helpIfWrong })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit your answers.");
    } finally {
      setBusy(false);
    }
  }

  /* ---------- Results ---------- */
  if (results) {
    const score = results.filter((r) => r.correct).length;
    return wrapper(
      <>
        {back}
        <div className="mx-auto mt-[0.6em] max-w-[44em] text-center">
          <p className="text-[0.65em] font-bold uppercase tracking-wide text-[#12939b]">{view.trackName} / Lesson quiz</p>
          <h1 className="mt-[0.4em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">Quiz complete</h1>
          <p className="mt-[0.5em] text-[0.85em] text-[#14365a]/65">
            You answered {score} of {total} correctly.
          </p>

          <ul className="mt-[1.4em] space-y-[0.6em] text-left">
            {view.questions.map((qq, i) => {
              const r = results[i];
              return (
                <li key={qq.id} className="rounded-[1em] border border-[#e3ebf3] bg-white p-[1em]">
                  <div className="flex items-start gap-[0.7em]">
                    {r?.correct ? (
                      <CheckCircle2 className="mt-[0.1em] size-[1.4em] shrink-0 text-[#2a9a5f]" />
                    ) : (
                      <XCircle className="mt-[0.1em] size-[1.4em] shrink-0 text-[#c0392b]" />
                    )}
                    <div>
                      <p className="text-[0.9em] font-bold text-[#14365a]">{qq.prompt}</p>
                      {!r?.correct && r?.help && <p className="mt-[0.3em] text-[0.75em] text-[#14365a]/65">{r.help}</p>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-[1.4em] flex justify-center gap-[0.8em]">
            <button
              type="button"
              onClick={restart}
              className="rounded-[0.6em] border border-[#12939b]/60 bg-white px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
            >
              Try again
            </button>
            <Link href={backHref} className="rounded-[0.6em] bg-[#12606b] px-[1.4em] py-[0.7em] text-[0.8em] font-semibold text-white hover:bg-[#0f505a]">
              Back to Lesson
            </Link>
          </div>
        </div>
      </>,
    );
  }

  /* ---------- Question ---------- */
  return wrapper(
    <>
      {back}

      <div className="mx-auto mt-[0.2em] max-w-[44em] text-center">
        <p className="text-[0.62em] font-bold uppercase tracking-wide text-[#12939b]">{view.trackName} / Lesson quiz</p>
        <h1 className="mt-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">{view.title}</h1>
        <p className="mt-[0.7em] text-[0.8em] text-[#14365a]/60">Choose the best answer. This illustrative quiz has no required passing threshold.</p>
      </div>

      {/* Progress */}
      <div className="mx-auto mt-[1.4em] flex max-w-[44em] items-center gap-[1.2em]">
        <span className="shrink-0 text-[0.7em] text-[#14365a]/65">
          Question {index + 1} of {total}
        </span>
        <span className="h-[0.4em] flex-1 overflow-hidden rounded-full bg-[#dbe7e8]">
          <span className="block h-full rounded-full bg-[#12858f] transition-[width]" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </span>
      </div>

      {/* Question card */}
      <section className="mx-auto mt-[1em] max-w-[44em] rounded-[1.4em] border border-[#e8eef5] bg-white p-[1.6em] shadow-[0_10px_34px_rgba(20,54,90,0.08)]">
        <h2 className="text-[1.2em] font-extrabold text-[#14365a]">{q?.prompt}</h2>

        <div role="radiogroup" aria-label="Answers" className="mt-[1em] space-y-[0.6em]">
          {q?.options.map((opt, i) => {
            const on = picked === i;
            return (
              <button
                key={`${q.id}-${i}`}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPicked(i)}
                className={`flex w-full items-center gap-[0.9em] rounded-[0.8em] border px-[1em] py-[0.8em] text-left transition-colors ${
                  on ? "border-[#12939b] bg-[#eef8f7]" : "border-[#e3ebf3] bg-white hover:bg-[#f6fafd]"
                }`}
              >
                <span
                  className={`grid size-[2em] shrink-0 place-items-center rounded-full text-[0.75em] font-bold ${
                    on ? "bg-[#12606b] text-white" : "bg-[#eef2f6] text-[#14365a]"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-[0.8em] text-[#14365a]">{opt}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={picked === null || busy}
          className="mt-[1.2em] inline-flex items-center gap-[0.6em] rounded-[0.6em] bg-gradient-to-r from-[#12858f] to-[#14365a] px-[1.3em] py-[0.7em] text-[0.75em] font-semibold text-white shadow-[0_8px_18px_rgba(20,54,90,0.25)] disabled:opacity-50"
        >
          {busy ? "Submitting..." : index < total - 1 ? "Submit Answer" : "Finish Quiz"} <ArrowRight className="size-[1.1em]" />
        </button>

        {error && (
          <p role="alert" className="mt-[0.7em] text-[0.75em] font-medium text-[#c0392b]">
            {error}
          </p>
        )}
      </section>
    </>,
  );
}