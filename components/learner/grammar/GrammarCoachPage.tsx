"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Check, ChevronRight, Dumbbell, PlayCircle } from "lucide-react";
import {
  getGrammarTopics,
  startGrammarLesson,
  type GrammarLesson,
  type GrammarStatus,
  type GrammarTopic,
} from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import CoachChat from "./CoachChat";
import LessonPanel from "./LessonPanel";
import PassagesDialog from "./PassagesDialog";
import PracticeCard from "./PracticeCard";
import TopicList from "./TopicList";
import { CARD, ErrorBox, Spinner } from "./shared";

const STEPS = [
  { label: tk("Lessons"), icon: null },
  { label: tk("Video and summary"), icon: PlayCircle },
  { label: tk("Grammar practice"), icon: Dumbbell },
  { label: tk("Ask the AI"), icon: Bot },
] as const;

/** The first topic the student is learning, else the first not started, else the first. */
function firstTopic(topics: GrammarTopic[]): string | null {
  return (
    topics.find((t) => t.status === "Practicing")?.key ??
    topics.find((t) => t.status === "New")?.key ??
    topics[0]?.key ??
    null
  );
}

/** The grammar coach "مدرّب النحو" (AI Curriculum > Arabic Language), inside the learner shell. */
export default function GrammarCoachPage() {
  const t = useT();
  const [topics, setTopics] = useState<GrammarTopic[] | null>(null);
  const [topicsError, setTopicsError] = useState<unknown>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Record<string, GrammarLesson>>({});
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<unknown>(null);
  const [sentence, setSentence] = useState("");
  const [step, setStep] = useState(0);
  const [passagesOpen, setPassagesOpen] = useState(false);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const requested = useRef<string | null>(null);

  const loadTopics = useCallback(async () => {
    setTopicsError(null);
    try {
      const list = [...(await getGrammarTopics())].sort((a, b) => a.order - b.order);
      setTopics(list);
      setSelected((s) => s ?? firstTopic(list));
    } catch (e) {
      setTopicsError(e);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the topics on open
    void loadTopics();
  }, [loadTopics]);

  const loadLesson = useCallback(async (key: string) => {
    requested.current = key;
    setLessonLoading(true);
    setLessonError(null);
    try {
      const lesson = await startGrammarLesson(key);
      setLessons((all) => ({ ...all, [key]: lesson }));
    } catch (e) {
      if (requested.current === key) setLessonError(e);
    } finally {
      if (requested.current === key) setLessonLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected && !lessons[selected] && requested.current !== selected) {
      void loadLesson(selected);
    }
  }, [selected, lessons, loadLesson]);

  const goTo = (i: number) => {
    setStep(i);
    sections.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectTopic = (key: string) => {
    if (key !== selected) {
      setSelected(key);
      setLessonError(null);
      setLessonLoading(false);
      setSentence("");
    }
    goTo(1);
  };

  const setStatus = useCallback(
    (status: GrammarStatus) => {
      setTopics((list) => list?.map((tp) => (tp.key === selected ? { ...tp, status } : tp)) ?? list);
    },
    [selected]
  );

  const topic = topics?.find((tp) => tp.key === selected) ?? null;
  const lesson = selected ? (lessons[selected] ?? null) : null;

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
          <span>{t("Arabic Language")}</span>
        </nav>
        <h1 className="sr-only">{t("Grammar coach")}</h1>

        {/* Stepper */}
        <div role="tablist" aria-label={t("Lesson steps")} className={`${CARD} mt-[0.6em] flex gap-[0.4em] overflow-x-auto p-[0.5em]`}>
          {STEPS.map((s, i) => {
            const active = i === step;
            const done = i === 0 ? !!topic : i < step;
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => goTo(i)}
                className={`flex min-w-max flex-1 items-center justify-center gap-[0.5em] rounded-full px-[1em] py-[0.5em] text-[0.88em] font-bold transition ${
                  active ? "bg-[#1f9e95] text-white shadow" : "text-[#14365a] hover:bg-[#f1f8fb]"
                }`}
              >
                <span
                  className={`grid h-[1.8em] w-[1.8em] place-items-center rounded-full text-[0.85em] ${
                    active ? "bg-white/25" : done ? "bg-[#1f9e95] text-white" : "bg-[#e6edf3]"
                  }`}
                >
                  {done && !active ? <Check className="h-[1em] w-[1em]" /> : i + 1}
                </span>
                {Icon && <Icon className="h-[1.1em] w-[1.1em]" />}
                {t(s.label)}
              </button>
            );
          })}
        </div>

        {topicsError != null ? (
          <div className="mt-[1em]">
            <ErrorBox error={topicsError} onRetry={loadTopics} />
          </div>
        ) : topics == null ? (
          <Spinner label={t("Loading lessons...")} />
        ) : topics.length === 0 || !topic ? (
          <p className={`${CARD} mt-[1em] p-[2em] text-center text-[0.9em] text-[#5b7089]`}>
            {t("No grammar lessons are available yet.")}
          </p>
        ) : (
          <div className="mt-[1em] grid items-start gap-[1em] lg:grid-cols-[minmax(15em,0.8fr)_minmax(0,1.35fr)_minmax(17em,1fr)]">
            <div ref={(el) => { sections.current[0] = el; }} className="scroll-mt-[1em]">
              <TopicList topics={topics} selected={selected} onSelect={selectTopic} />
            </div>

            <div ref={(el) => { sections.current[1] = el; }} className="min-w-0 scroll-mt-[1em]">
              <LessonPanel
                topic={topic}
                lesson={lesson}
                loading={lessonLoading && !lesson}
                error={lesson ? null : lessonError}
                onRetry={() => {
                  requested.current = null;
                  void loadLesson(topic.key);
                }}
                onStartPractice={() => goTo(2)}
              />
            </div>

            <div className="flex min-w-0 flex-col gap-[1em]">
              <div ref={(el) => { sections.current[2] = el; }} className="scroll-mt-[1em]">
                <PracticeCard
                  topicKey={topic.key}
                  first={lesson?.practice ?? null}
                  onStatus={setStatus}
                  onSentence={setSentence}
                  onOpenPassages={() => setPassagesOpen(true)}
                />
              </div>
              <div ref={(el) => { sections.current[3] = el; }} className="scroll-mt-[1em]">
                <CoachChat topicKey={topic.key} context={sentence} />
              </div>
            </div>
          </div>
        )}
      </div>

      {passagesOpen && <PassagesDialog onClose={() => setPassagesOpen(false)} />}
    </div>
  );
}
