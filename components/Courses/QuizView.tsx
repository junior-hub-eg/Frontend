"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Check, Trophy } from "lucide-react";
import { QUIZ_QUESTIONS, QUIZ_TAKEAWAYS, type Track } from "@/lib/data/courses";
import { cn } from "@/lib/utils";

type Phase = "answering" | "error" | "feedback";
const LETTERS = ["A", "B", "C", "D"];

export function QuizView({ track, lessonIndex }: { track: Track; lessonIndex: number }) {
  const lesson = track.lessons[lessonIndex];
  const nextLesson = track.lessons[lessonIndex + 1];
  const base = `/learner/courses/${track.slug}`;
  const lessonHref = `${base}/lessons/${lesson.id}` as Route;
  const continueHref = (nextLesson ? `${base}/lessons/${nextLesson.id}` : base) as Route;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("answering");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[index];
  const isCorrect = selected === question.correct;

  function submit() {
    if (selected === null) {
      setPhase("error");
      return;
    }
    if (isCorrect) setScore((s) => s + 1);
    setPhase("feedback");
  }

  function next() {
    if (index + 1 >= total) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setPhase("answering");
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setPhase("answering");
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-5 rounded-2xl border border-[#dfe7e5] bg-white px-6 py-10 text-center shadow-sm">
        <span aria-hidden className="grid size-14 place-items-center rounded-full bg-[#E9F7F4] text-[#12939b]">
          <Trophy size={26} />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">Quiz complete</p>
          <h1 className="mt-1 text-2xl font-bold text-[#1b2a5c]">Well done for checking your understanding.</h1>
          <p className="mt-1 text-sm text-[#1b2a5c]/65">
            You answered {score} of {total} questions correctly.
          </p>
        </div>
        <div className="w-full max-w-sm rounded-xl bg-[#E9F7F4] p-4 text-left">
          <p className="text-xs font-bold text-[#1b2a5c]">Keep these ideas in mind</p>
          <ul className="mt-2 flex flex-col gap-2">
            {QUIZ_TAKEAWAYS.map((t) => (
              <li key={t} className="flex items-center gap-2 text-xs text-[#1b2a5c]">
                <Check aria-hidden size={14} className="shrink-0 text-[#12939b]" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={lessonHref} className="rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]">
            Review Lesson
          </Link>
          <button type="button" onClick={restart} className="rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]">
            Try Again
          </button>
          <Link href={continueHref} className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
            Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <Link href={lessonHref} className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
        <ArrowLeft aria-hidden size={14} /> Back to Lesson
      </Link>

      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#12939b]">
          {track.title} / Lesson quiz
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#1b2a5c]">{lesson.title}</h1>
        <p className="mt-1 text-xs text-[#1b2a5c]/60">Choose the best answer. This illustrative quiz has no required passing threshold.</p>
      </header>

      <div className="flex items-center gap-3 text-[11px] text-[#1b2a5c]/60">
        <span>
          Question {index + 1} of {total}
        </span>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={index + (phase === "feedback" ? 1 : 0)}
          className="h-1.5 flex-1 rounded-full bg-[#e8eeed]"
        >
          <div className="h-full rounded-full bg-[#12939b] transition-all" style={{ width: `${((index + (phase === "feedback" ? 1 : 0)) / total) * 100}%` }} />
        </div>
      </div>

      <section className="rounded-2xl border border-[#dfe7e5] bg-white p-6 shadow-sm" aria-labelledby="question-prompt">
        <h2 id="question-prompt" className="text-lg font-bold text-[#1b2a5c]">
          {question.prompt}
        </h2>

        <div role="radiogroup" aria-labelledby="question-prompt" className="mt-4 flex flex-col gap-2.5">
          {question.options.map((option, i) => {
            const locked = phase === "feedback";
            const isSelected = selected === i;
            const showCorrect = locked && i === question.correct;
            const showWrong = locked && isSelected && i !== question.correct;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={locked}
                onClick={() => {
                  setSelected(i);
                  setPhase("answering");
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs text-[#1b2a5c] transition-colors",
                  showCorrect && "border-[#1E9D5B] bg-[#E6F6EC]",
                  showWrong && "border-[#D1365A] bg-[#FDECEF]",
                  !locked && isSelected && "border-[#12939b] bg-[#E9F7F4]",
                  !locked && !isSelected && "border-[#dfe7e5] hover:border-[#12939b]/60",
                  locked && !showCorrect && !showWrong && "border-[#e8eeed] opacity-70"
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#E9F7F4] text-[10px] font-bold">{LETTERS[i]}</span>
                <span className="flex-1 font-medium">{option}</span>
                {(showCorrect || (!locked && isSelected)) && <Check aria-hidden size={15} className="text-[#12939b]" />}
              </button>
            );
          })}
        </div>

        {phase === "error" && (
          <p role="alert" className="mt-4 text-xs font-medium text-danger">
            Choose an answer before continuing.
          </p>
        )}
        {phase === "feedback" && (
          <p role="status" className={cn("mt-4 rounded-lg px-3 py-2 text-xs font-semibold", isCorrect ? "bg-[#E6F6EC] text-[#1E9D5B]" : "bg-[#E9F7F4] text-[#0f7a81]")}>
            {isCorrect ? "Nice work! That's the right answer." : "Not quite. Review the highlighted answer."}
          </p>
        )}

        <div className="mt-5">
          {phase === "feedback" ? (
            <button type="button" onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90">
              {index + 1 >= total ? "See Results" : "Next Question"} <ArrowRight aria-hidden size={13} />
            </button>
          ) : (
            <button type="button" onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90">
              Submit Answer <ArrowRight aria-hidden size={13} />
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
