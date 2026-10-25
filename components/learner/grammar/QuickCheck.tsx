"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import {
  answerQuickCheck,
  startQuickCheck,
  type GrammarQuiz,
  type GrammarQuizResult,
  type GrammarStatus,
} from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import { ErrorBox, PRIMARY_BTN, SOFT_BTN, Spinner, StatusChip } from "./shared";

/** Quick Check: 5 multiple-choice questions on the topic, then the score and explanations. */
export default function QuickCheck({
  topicKey,
  onStatus,
  onClose,
}: {
  topicKey: string;
  onStatus: (status: GrammarStatus) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [quiz, setQuiz] = useState<GrammarQuiz | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<GrammarQuizResult | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setResult(null);
    setAnswers([]);
    try {
      setQuiz(await startQuickCheck(topicKey));
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }, [topicKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the quiz when it opens
    void start();
  }, [start]);

  const submit = async () => {
    if (!quiz) return;
    setBusy(true);
    setError(null);
    try {
      const res = await answerQuickCheck(quiz.exerciseId, quiz.questions.map((_, i) => answers[i] ?? -1));
      setResult(res);
      onStatus(res.status);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  if (busy && !quiz) return <Spinner label={t("Preparing your Quick Check...")} />;
  if (error && !quiz) {
    return (
      <div className="mt-[0.8em] space-y-[0.6em]">
        <ErrorBox error={error} onRetry={start} />
        <button type="button" className={SOFT_BTN} onClick={onClose}>{t("Back to practice")}</button>
      </div>
    );
  }
  if (!quiz) return null;

  const allAnswered = quiz.questions.every((_, i) => answers[i] != null);
  const passed = result ? result.correct >= 4 : false;

  return (
    <div className="mt-[0.8em]">
      {result && (
        <div className={`mb-[0.8em] rounded-[1em] p-[0.9em] ${passed ? "bg-[#e3f6ec] text-[#11704a]" : "bg-[#fff8ef] text-[#8a4b12]"}`}>
          <p className="text-[1.1em] font-extrabold">
            {t("Your score: {correct} / {total}", { correct: result.correct, total: result.total })}
          </p>
          <p className="mt-[0.3em] flex flex-wrap items-center gap-[0.4em] text-[0.8em]">
            {t("Lesson status:")} <StatusChip status={result.status} />
            {result.xpAwarded > 0 && <span className="font-bold">{t("+{xp} XP", { xp: result.xpAwarded })}</span>}
          </p>
          {!passed && <p className="mt-[0.4em] text-[0.82em]">{t("Practise a few more sentences, then try the Quick Check again.")}</p>}
        </div>
      )}

      <ol className="space-y-[0.8em]">
        {quiz.questions.map((q, qi) => (
          <li key={qi} className="rounded-[0.9em] bg-[#f8fbfd] p-[0.7em] ring-1 ring-[#e3eef5]">
            <p dir="rtl" className="text-[0.88em] font-bold text-[#14365a]">
              {qi + 1}. {q.question}
            </p>
            <div dir="rtl" className="mt-[0.4em] grid gap-[0.3em] sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const chosen = answers[qi] === oi;
                const right = result?.rightAnswers[qi] === oi;
                const cls = result
                  ? right
                    ? "bg-[#e3f6ec] ring-[#93dcb6] text-[#11704a] font-bold"
                    : chosen
                      ? "bg-[#fff1f1] ring-[#f3b4b4] text-[#b42323]"
                      : "bg-white ring-[#e3eef5] text-[#14365a]"
                  : chosen
                    ? "bg-[#e4f7f4] ring-[#2bb8a6] text-[#0f6f6b] font-bold"
                    : "bg-white ring-[#e3eef5] text-[#14365a] hover:bg-[#f1f8fb]";
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={!!result}
                    aria-pressed={chosen}
                    onClick={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                    className={`flex items-center gap-[0.4em] rounded-[0.6em] px-[0.7em] py-[0.45em] text-start text-[0.82em] ring-1 transition ${cls}`}
                  >
                    {result && right && <CheckCircle2 className="h-[1em] w-[1em] shrink-0" />}
                    {result && chosen && !right && <XCircle className="h-[1em] w-[1em] shrink-0" />}
                    {o}
                  </button>
                );
              })}
            </div>
            {result?.explanations[qi] && (
              <p dir="rtl" className="mt-[0.4em] text-[0.78em] text-[#5b7089]">{result.explanations[qi]}</p>
            )}
          </li>
        ))}
      </ol>

      {error != null && (
        <div className="mt-[0.8em]">
          <ErrorBox error={error} onRetry={submit} />
        </div>
      )}

      <div className="mt-[0.9em] flex flex-wrap justify-end gap-[0.5em]">
        <button type="button" className={SOFT_BTN} onClick={onClose}>{t("Back to practice")}</button>
        {result ? (
          <button type="button" className={PRIMARY_BTN} onClick={start}>{t("New Quick Check")}</button>
        ) : (
          <button type="button" className={PRIMARY_BTN} disabled={!allAnswered || busy} onClick={submit}>
            {busy ? t("Checking...") : t("Submit answers")}
          </button>
        )}
      </div>
    </div>
  );
}
