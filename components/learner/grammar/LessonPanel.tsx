"use client";

import { useState } from "react";
import { ArrowLeft, Dumbbell, GraduationCap, Lightbulb, PlayCircle, RotateCcw } from "lucide-react";
import { WORD_COLOR, type GrammarLesson, type GrammarTopic, type ParsedSentence } from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import { CARD, ErrorBox, ParsedLine, PRIMARY_BTN, SOFT_BTN, Spinner, StatusChip } from "./shared";

/** The video, or a placeholder card with the topic title when the admin has not added one. */
function TopicVideo({ topic }: { topic: GrammarTopic }) {
  const t = useT();
  if (topic.videoUrl) {
    return (
      <video controls preload="metadata" src={topic.videoUrl} className="aspect-video w-full rounded-[1.1em] bg-black">
        {t("Your browser can't play this video.")}
      </video>
    );
  }
  return (
    <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-[1.1em] bg-gradient-to-br from-[#d9eefc] via-[#eaf6ff] to-[#dff5ef]">
      <span aria-hidden className="absolute -start-[1em] -top-[1em] h-[6em] w-[6em] rounded-full bg-white/50" />
      <span aria-hidden className="absolute -bottom-[2em] -end-[1em] h-[8em] w-[8em] rounded-full bg-[#c6ebe4]/60" />
      <div className="relative flex flex-col items-center gap-[0.6em] rounded-[1em] bg-white/85 px-[2em] py-[1.2em] text-center shadow-sm">
        <p dir="rtl" className="text-[1.9em] font-extrabold text-[#1d5fb8]">{topic.titleAr}</p>
        <p className="flex items-center gap-[0.4em] text-[0.8em] text-[#5b7089]">
          <PlayCircle className="h-[1.2em] w-[1.2em]" />
          {t("The video for this lesson is coming soon")}
        </p>
      </div>
    </div>
  );
}

/** "زتونة الدرس": the lesson points as a mind map around the topic. */
function MindMap({ title, points }: { title: string; points: GrammarLesson["points"] }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center">
      <h3 className="flex items-center gap-[0.4em] rounded-full bg-[#1f9e95] px-[1.2em] py-[0.35em] text-[1em] font-extrabold text-white">
        <span aria-hidden>⭐</span>
        {t("Lesson in a nutshell")}
      </h3>
      <span aria-hidden className="h-[1em] w-[0.15em] bg-[#bfe3df]" />
      <p dir="rtl" className="rounded-full bg-[#14687f] px-[1.4em] py-[0.5em] text-[1.15em] font-extrabold text-white shadow">
        {title}
      </p>
      {points.length > 0 && (
        <>
          <span aria-hidden className="h-[1em] w-[0.15em] bg-[#bfe3df]" />
          <ul dir="rtl" className="relative flex w-full flex-wrap justify-center gap-[0.7em] border-t-[0.15em] border-dashed border-[#bfe3df] pt-[0.9em]">
            {points.map((p, i) => (
              <li
                key={i}
                className={`relative w-[10.5em] max-w-full rounded-[1em] px-[0.8em] py-[0.6em] text-center ring-1 ${WORD_COLOR[p.color] ?? WORD_COLOR.gray}`}
              >
                <span aria-hidden className="absolute -top-[0.95em] start-1/2 h-[0.8em] w-[0.15em] bg-[#bfe3df]" />
                <p className="text-[0.85em] font-extrabold">{p.title}</p>
                <p className="mt-[0.2em] text-[0.75em] leading-snug">{p.text}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** Two solved examples, walked through word by word with "Next" (US-04). */
function SolvedExamples({ examples }: { examples: ParsedSentence[] }) {
  const t = useT();
  const [ex, setEx] = useState(0);
  const [step, setStep] = useState(0);
  const sentence = examples[ex];
  if (!sentence) return null;
  const word = sentence.words[step];
  const lastWord = step >= sentence.words.length - 1;
  const lastExample = ex >= examples.length - 1;

  const next = () => {
    if (!lastWord) setStep(step + 1);
    else if (!lastExample) {
      setEx(ex + 1);
      setStep(0);
    }
  };

  return (
    <section className="rounded-[1.1em] border border-[#e3eef5] bg-[#f8fbfd] p-[1em]">
      <div className="flex items-center justify-between gap-[0.5em]">
        <h3 className="text-[0.95em] font-extrabold text-[#14365a]">
          {t("Solved example {n} of {total}", { n: ex + 1, total: examples.length })}
        </h3>
        <span className="text-[0.75em] text-[#5b7089]">
          {t("Word {n} of {total}", { n: step + 1, total: sentence.words.length })}
        </span>
      </div>
      <div className="mt-[0.6em]">
        <ParsedLine words={sentence.words.slice(0, step + 1)} activeIndex={step} />
      </div>
      {word && (
        <div dir="rtl" className="mt-[0.7em] rounded-[0.9em] bg-white p-[0.8em] text-[0.85em] text-[#14365a] ring-1 ring-[#e3eef5]">
          <p className="font-extrabold">
            {word.word}: <span className="font-semibold">{word.role}</span>
          </p>
          <p className="mt-[0.2em] text-[#5b7089]">
            {word.case}
            {word.sign ? ` - ${word.sign}` : ""}
          </p>
          {word.explanation && <p className="mt-[0.3em] leading-relaxed">{word.explanation}</p>}
        </div>
      )}
      <div className="mt-[0.8em] flex justify-end gap-[0.5em]">
        {lastWord && lastExample ? (
          <button type="button" className={SOFT_BTN} onClick={() => { setEx(0); setStep(0); }}>
            <RotateCcw className="h-[1em] w-[1em]" />
            {t("Start again")}
          </button>
        ) : (
          <button type="button" className={SOFT_BTN} onClick={next}>
            {t("Next")}
            <ArrowLeft className="h-[1em] w-[1em] ltr:rotate-180" />
          </button>
        )}
      </div>
    </section>
  );
}

/** Middle column: the topic, its video and the AI lesson summary. */
export default function LessonPanel({
  topic,
  lesson,
  loading,
  error,
  onRetry,
  onStartPractice,
}: {
  topic: GrammarTopic;
  lesson: GrammarLesson | null;
  loading: boolean;
  error: unknown;
  onRetry: () => void;
  onStartPractice: () => void;
}) {
  const t = useT();
  return (
    <section className={`${CARD} flex min-w-0 flex-col gap-[1em] p-[1em]`}>
      <header>
        <div className="flex items-start justify-between gap-[0.6em]">
          <h2 dir="rtl" className="flex items-center gap-[0.5em] text-[1.5em] font-extrabold text-[#14365a]">
            <GraduationCap className="h-[1.2em] w-[1.2em] shrink-0" />
            {topic.titleAr}
          </h2>
          <StatusChip status={topic.status} />
        </div>
        {topic.descriptionAr && (
          <p dir="rtl" className="mt-[0.3em] text-[0.85em] text-[#5b7089]">{topic.descriptionAr}</p>
        )}
      </header>

      <TopicVideo topic={topic} />

      <div className="rounded-[1.1em] border border-[#e3eef5] p-[1em]">
        {loading ? (
          <Spinner label={t("The AI is preparing your lesson...")} />
        ) : error ? (
          <ErrorBox error={error} onRetry={onRetry} />
        ) : lesson ? (
          <MindMap title={lesson.topicTitle || topic.titleAr} points={lesson.points} />
        ) : null}

        {topic.notes.length > 0 && (
          <div className="mt-[1em] rounded-[1em] bg-[#fff8e1] p-[0.9em] ring-1 ring-[#f8e3a6]">
            <h3 className="flex items-center gap-[0.4em] text-[0.9em] font-extrabold text-[#14365a]">
              <Lightbulb className="h-[1.2em] w-[1.2em] text-[#f0b429]" />
              {t("Important notes")}
            </h3>
            <ul dir="rtl" className="mt-[0.4em] list-disc space-y-[0.2em] ps-[1.4em] text-[0.8em] text-[#14365a]">
              {topic.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {lesson && lesson.examples.length > 0 && <SolvedExamples key={lesson.topicKey} examples={lesson.examples} />}

      <button type="button" onClick={onStartPractice} disabled={!lesson} className={`${PRIMARY_BTN} self-center`}>
        <Dumbbell className="h-[1.2em] w-[1.2em]" />
        {t("Start grammar practice")}
      </button>
    </section>
  );
}
