"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, Award, Check, RotateCcw, Trophy, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  getLesson,
  getTrack,
  getTrackLessons,
  lessonPath,
  lessonAfter,
  submitLessonQuiz,
  submitTrackQuiz,
  getPlacementTest,
  submitPlacementTest,
  getLevelExam,
  submitLevelExam,
  coursePath,
  LEVEL_NUMBER,
  trackPath,
  type Badge,
  type QuizQuestion,
} from "@/lib/learning-api";
import { cn } from "@/lib/utils";
import { LoadState } from "./course-ui";

const LETTERS = ["A", "B", "C", "D", "E"];

/** One graded question: the track quiz also says which option was right. */
type Graded = { correct: boolean; correctIndex?: number; note: string | null };
/** level and message: the placement test's result. */
type Outcome = { passed: boolean; graded: Graded[]; xpAwarded: number; badge: Badge | null; level?: string; message?: string };

interface Quiz {
  eyebrow: string;
  title: string;
  rule: string;
  questions: QuizQuestion[];
  backHref: string;
  backLabel: string;
  continueHref: string;
  continueLabel: string;
  passedText: string;
  failedText: string;
  /** The result's small heading when passed (default "Quiz passed"). */
  doneLabel?: string;
  submit: (answers: number[]) => Promise<Outcome>;
}

async function lessonQuiz(code: string, lessonId: string): Promise<Quiz> {
  const [lesson, track] = await Promise.all([getLesson(lessonId), getTrackLessons(code).catch(() => null)]);
  const after = lessonAfter(track, lesson.trackCode, lesson.id);
  const lessonHref = lessonPath(lesson.trackCode, lesson.id);
  return {
    eyebrow: `${track?.trackName ?? lesson.trackCode} / Lesson quiz`,
    title: lesson.title,
    rule: "Answer every question correctly to finish the lesson.",
    questions: lesson.questions,
    backHref: lessonHref,
    backLabel: "Back to Lesson",
    continueHref: after.href,
    continueLabel: after.label,
    passedText: "You finished this lesson.",
    failedText: "Read the help under each wrong answer, then try again.",
    submit: async (answers) => {
      const r = await submitLessonQuiz(lesson.id, answers);
      return {
        passed: r.results.every((x) => x.correct),
        graded: r.results.map((x) => ({ correct: x.correct, note: x.helpIfWrong })),
        xpAwarded: r.xpAwarded,
        badge: r.badge,
      };
    },
  };
}

async function trackQuiz(code: string): Promise<Quiz> {
  const track = await getTrack(code);
  const href = trackPath(track.code);
  return {
    eyebrow: `${track.name} / Track quiz`,
    title: `How well do you know ${track.name}?`,
    rule: track.quiz.unlocked ? "Answer 2 of 3 correctly to pass." : "Watch one of the track videos first to unlock this quiz.",
    questions: track.quiz.unlocked ? track.quiz.questions : [],
    backHref: href,
    backLabel: "Back to Track",
    continueHref: href,
    continueLabel: "Back to Track",
    passedText: `You passed the ${track.name} quiz.`,
    failedText: "Look at the right answers below, then try again.",
    submit: async (answers) => {
      const r = await submitTrackQuiz(track.code, answers);
      return {
        passed: r.passed,
        graded: r.results.map((x) => ({ correct: x.correct, correctIndex: x.correctOptionIndex, note: x.explanation })),
        xpAwarded: r.xpAwarded,
        badge: null,
      };
    },
  };
}

/** "I know my track": the technical questions find the level, and the track starts at it. */
async function placementQuiz(code: string): Promise<Quiz> {
  const test = await getPlacementTest(code);
  return {
    eyebrow: `${test.trackName} / Find your level`,
    title: `Let's find your level in ${test.trackName}`,
    rule: "6 quick technical questions, from easy to hard. Answer what you know.",
    questions: test.questions,
    backHref: "/learner/courses",
    backLabel: "Choose another track",
    continueHref: trackPath(test.trackCode),
    continueLabel: `Start learning ${test.trackName}`,
    passedText: "",
    failedText: "",
    doneLabel: "Your level",
    submit: async (answers) => {
      const r = await submitPlacementTest(test.trackCode, answers);
      return {
        passed: true,
        graded: r.results.map((x) => ({ correct: x.correct, correctIndex: x.correctOptionIndex, note: x.explanation })),
        xpAwarded: 0,
        badge: null,
        level: r.level,
        message: `You start ${test.trackName} at ${r.level} level. You can take this test again to change it.`,
      };
    },
  };
}

/** A course level's exam: a pass (2 of 3) finishes the level and opens the next one. */
async function levelExamQuiz(code: string, courseId: string, level: string): Promise<Quiz> {
  const exam = await getLevelExam(code, courseId, level);
  const back = coursePath(exam.trackCode, exam.courseId);
  const number = LEVEL_NUMBER[exam.level];
  return {
    eyebrow: `${exam.courseTitle} / Level ${number} exam`,
    title: `${exam.courseTitle} · Level ${number}`,
    rule: "Answer 2 of 3 correctly to pass and open the next level.",
    questions: exam.questions,
    backHref: back,
    backLabel: "Back to the course",
    continueHref: back,
    continueLabel: "Back to the course",
    passedText: `You passed Level ${number} of ${exam.courseTitle}.`,
    failedText: "Look at the right answers below, then try again.",
    doneLabel: "Level passed",
    submit: async (answers) => {
      const r = await submitLevelExam(exam.trackCode, exam.courseId, exam.level, answers);
      return {
        passed: r.passed,
        graded: r.results.map((x) => ({ correct: x.correct, correctIndex: x.correctOptionIndex, note: x.explanation })),
        xpAwarded: r.xpAwarded,
        badge: null,
      };
    },
  };
}

/**
 * The lesson quiz (lessonId given), the track quiz, the placement test, or a level exam (exam given): all questions
 * are graded together.
 */
export function QuizView({
  code,
  lessonId,
  placement = false,
  exam,
}: {
  code: string;
  lessonId?: string;
  placement?: boolean;
  exam?: { courseId: string; level: string };
}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [attempt, setAttempt] = useState(0);

  const examCourse = exam?.courseId;
  const examLevel = exam?.level;

  useEffect(() => {
    let active = true;
    (examCourse && examLevel
      ? levelExamQuiz(code, examCourse, examLevel)
      : placement
        ? placementQuiz(code)
        : lessonId
          ? lessonQuiz(code, lessonId)
          : trackQuiz(code)
    ).then(
      (q) => active && setQuiz(q),
      (e) => active && setLoadError(e)
    );
    return () => {
      active = false;
    };
  }, [code, lessonId, placement, examCourse, examLevel]);

  if (!quiz) return <LoadState error={loadError} backHref={trackPath(code)} />;
  return <QuizRun key={attempt} quiz={quiz} onRetry={() => setAttempt((a) => a + 1)} />;
}

function QuizRun({ quiz, onRetry }: { quiz: Quiz; onRetry: () => void }) {
  const total = quiz.questions.length;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [missing, setMissing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const question = quiz.questions[index];
  const selected = answers[index];
  const last = index + 1 >= total;

  async function nextOrSubmit() {
    if (selected === null) {
      setMissing(true);
      return;
    }
    if (!last) {
      setIndex(index + 1);
      return;
    }
    setSending(true);
    setError(null);
    try {
      setOutcome(await quiz.submit(answers as number[]));
    } catch (e) {
      setError(errorMessage(e, "We couldn't check your answers. Please try again."));
    } finally {
      setSending(false);
    }
  }

  if (total === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <p className="text-lg font-bold text-[#1b2a5c]">{quiz.title}</p>
        <p className="text-sm text-[#1b2a5c]/65">{quiz.rule}</p>
        <Link href={quiz.backHref as Route} className="mt-2 rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b]">
          {quiz.backLabel}
        </Link>
      </div>
    );
  }

  if (outcome) {
    const score = outcome.graded.filter((g) => g.correct).length;
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
        <section className="flex flex-col items-center gap-4 rounded-2xl border border-[#dfe7e5] bg-white px-6 py-8 text-center shadow-sm">
          <span aria-hidden className={cn("grid size-14 place-items-center rounded-full", outcome.passed ? "bg-[#E9F7F4] text-[#12939b]" : "bg-[#fff4e5] text-[#c2571a]")}>
            {outcome.passed ? <Trophy size={26} /> : <RotateCcw size={24} />}
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">{outcome.passed ? (quiz.doneLabel ?? "Quiz passed") : "Almost there"}</p>
            <h1 className="mt-1 text-2xl font-bold text-[#1b2a5c]">
              {outcome.level ? `${outcome.level}` : `You answered ${score} of ${total} correctly.`}
            </h1>
            <p className="mt-1 text-sm text-[#1b2a5c]/65">
              {outcome.level && `You answered ${score} of ${total} correctly. `}
              {outcome.message ?? (outcome.passed ? quiz.passedText : quiz.failedText)}
            </p>
          </div>
          {(outcome.xpAwarded > 0 || outcome.badge) && (
            <div className="flex flex-wrap justify-center gap-2">
              {outcome.xpAwarded > 0 && (
                <span className="rounded-full bg-[#E9F7F4] px-3 py-1 text-xs font-bold text-[#12939b]">+{outcome.xpAwarded} XP</span>
              )}
              {outcome.badge && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-bold text-[#a86b00]">
                  <Award aria-hidden size={14} /> {outcome.badge.name}
                </span>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={quiz.backHref as Route} className="rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]">
              {quiz.backLabel === quiz.continueLabel ? "Review" : quiz.backLabel}
            </Link>
            <button type="button" onClick={onRetry} className="rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]">
              Try Again
            </button>
            {outcome.passed && (
              <Link href={quiz.continueHref as Route} className="rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2 text-xs font-semibold text-white hover:opacity-90">
                {quiz.continueLabel}
              </Link>
            )}
          </div>
        </section>

        <ol className="flex flex-col gap-3" aria-label="Your answers">
          {quiz.questions.map((q, i) => {
            const g = outcome.graded[i];
            return (
              <li key={q.id} className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                <p className="flex items-start gap-2 text-sm font-semibold text-[#1b2a5c]">
                  {g.correct ? (
                    <Check aria-label="Correct" size={18} className="mt-0.5 shrink-0 text-[#1E9D5B]" />
                  ) : (
                    <X aria-label="Wrong" size={18} className="mt-0.5 shrink-0 text-[#D1365A]" />
                  )}
                  {q.prompt}
                </p>
                <p className="ml-6 mt-1 text-xs text-[#1b2a5c]/70">
                  Your answer: {q.options[answers[i]!]}
                  {!g.correct && g.correctIndex !== undefined && <span className="block text-[#1E9D5B]">Right answer: {q.options[g.correctIndex]}</span>}
                </p>
                {g.note && (!g.correct || g.correctIndex !== undefined) && (
                  <p className={cn("ml-6 mt-2 rounded-lg px-3 py-2 text-xs", g.correct ? "bg-[#E6F6EC] text-[#1b2a5c]" : "bg-[#E9F7F4] text-[#0f7a81]")}>{g.note}</p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <Link href={quiz.backHref as Route} className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
        <ArrowLeft aria-hidden size={14} /> {quiz.backLabel}
      </Link>

      <header className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#12939b]">{quiz.eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-[#1b2a5c]">{quiz.title}</h1>
        <p className="mt-1 text-xs text-[#1b2a5c]/60">Choose the best answer. {quiz.rule}</p>
      </header>

      <div className="flex items-center gap-3 text-[11px] text-[#1b2a5c]/60">
        <span>
          Question {index + 1} of {total}
        </span>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={index} className="h-1.5 flex-1 rounded-full bg-[#e8eeed]">
          <div className="h-full rounded-full bg-[#12939b] transition-all" style={{ width: `${(index / total) * 100}%` }} />
        </div>
      </div>

      <section className="rounded-2xl border border-[#dfe7e5] bg-white p-6 shadow-sm" aria-labelledby="question-prompt">
        <h2 id="question-prompt" className="text-lg font-bold text-[#1b2a5c]">
          {question.prompt}
        </h2>

        <div role="radiogroup" aria-labelledby="question-prompt" className="mt-4 flex flex-col gap-2.5">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => {
                  setAnswers((a) => a.map((v, j) => (j === index ? i : v)));
                  setMissing(false);
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-xs text-[#1b2a5c] transition-colors",
                  isSelected ? "border-[#12939b] bg-[#E9F7F4]" : "border-[#dfe7e5] hover:border-[#12939b]/60"
                )}
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#E9F7F4] text-[10px] font-bold">{LETTERS[i]}</span>
                <span className="flex-1 font-medium">{option}</span>
                {isSelected && <Check aria-hidden size={15} className="text-[#12939b]" />}
              </button>
            );
          })}
        </div>

        {missing && (
          <p role="alert" className="mt-4 text-xs font-medium text-danger">
            Choose an answer before continuing.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-[#fdecec] px-3 py-2 text-xs font-semibold text-[#b83232]">
            {error}
          </p>
        )}

        <div className="mt-5 flex items-center gap-3">
          {index > 0 && (
            <button
              type="button"
              onClick={() => setIndex(index - 1)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#12939b] px-4 py-2.5 text-xs font-semibold text-[#12939b] hover:bg-[#E9F7F4]"
            >
              <ArrowLeft aria-hidden size={13} /> Previous
            </button>
          )}
          <button
            type="button"
            disabled={sending}
            onClick={nextOrSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {last ? (sending ? "Checking…" : "Submit Quiz") : "Next Question"} <ArrowRight aria-hidden size={13} />
          </button>
        </div>
      </section>
    </div>
  );
}
