"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpenCheck, ChevronRight, MessageCircleQuestion, PenLine, PlayCircle, ScanText, Sparkles } from "lucide-react";
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
import LessonPanel, { TopicVideo } from "./LessonPanel";
import PassagesDialog from "./PassagesDialog";
import PracticeCard from "./PracticeCard";
import TopicList from "./TopicList";
import { CARD, ErrorBox, Spinner } from "./shared";
import { cn } from "@/lib/utils";

/** The parts of a lesson, one tab each, so each one has the whole width. */
const TABS = [
  { id: "video", label: tk("Lesson video"), icon: PlayCircle },
  { id: "summary", label: tk("Lesson summary"), icon: BookOpenCheck },
  { id: "practice", label: tk("Practise with the AI coach"), icon: Sparkles },
  { id: "ask", label: tk("Ask the AI assistant"), icon: MessageCircleQuestion },
] as const;
type Tab = (typeof TABS)[number]["id"];

/** The banner's skills (and the lesson's "start practice") open these tabs. */
const SECTION_TAB: Record<number, Tab> = { 1: "practice", 2: "ask", 3: "summary" };

/** What the AI coach does, shown in the banner (each one jumps to its place on the page). */
const AI_SKILLS = [
  { label: tk("Writes new sentences for you"), icon: PenLine, section: 1 },
  { label: tk("Corrects you step by step"), icon: Sparkles, section: 1 },
  { label: tk("Answers your questions"), icon: MessageCircleQuestion, section: 2 },
  { label: tk("Reads a photo of your book"), icon: ScanText, section: -1 },
] as const;

/** The banner at the top: the AI coach is the main feature of the page. */
function AiHero({ topicTitle, ready, onSkill }: { topicTitle: string | null; ready: boolean; onSkill: (section: number) => void }) {
  const t = useT();
  return (
    <section className="relative mt-[0.6em] overflow-hidden rounded-[1.6em] bg-gradient-to-br from-[#123a63] via-[#155e7a] to-[#1f9e95] p-[1.3em] text-white shadow-[0_0.8em_2.4em_rgba(20,54,90,0.25)]">
      <span aria-hidden className="pointer-events-none absolute -end-[3em] -top-[4em] h-[12em] w-[12em] rounded-full bg-white/10" />
      <span aria-hidden className="pointer-events-none absolute -bottom-[5em] start-[30%] h-[10em] w-[10em] rounded-full bg-[#5ee0d0]/20" />
      <div className="relative flex flex-col gap-[1em] md:flex-row md:items-center">
        <span aria-hidden className="relative grid h-[4.6em] w-[4.6em] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#7cc4ff] to-[#2f6fd6] shadow-lg ring-4 ring-white/25">
          <span className="text-[2.2em] leading-none">⭐</span>
          <span className="absolute -end-[0.2em] -top-[0.2em] grid h-[1.9em] w-[1.9em] place-items-center rounded-full bg-[#ffd166] text-[0.75em] font-black text-[#123a63] shadow">AI</span>
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-[0.4em] text-[0.75em] font-bold uppercase tracking-wide text-[#bdf3ec] rtl:normal-case rtl:tracking-normal">
            <span className={`h-[0.6em] w-[0.6em] rounded-full ${ready ? "bg-[#5ef0a0] shadow-[0_0_0.6em_#5ef0a0]" : "animate-pulse bg-[#ffd166]"}`} />
            {ready ? t("Your AI grammar coach is ready") : t("Your AI grammar coach is preparing the lesson...")}
          </p>
          <h1 className="mt-[0.2em] text-[1.9em] font-extrabold leading-tight">{t("AI Grammar Coach")}</h1>
          <p className="mt-[0.2em] max-w-[40em] text-[0.9em] text-white/85">
            {topicTitle
              ? t("Practise {topic} with an AI coach that writes sentences at your level and guides you to the right answer.", { topic: topicTitle })
              : t("Practise Arabic grammar with an AI coach that writes sentences at your level and guides you to the right answer.")}
          </p>
          <ul className="mt-[0.8em] flex flex-wrap gap-[0.5em]">
            {AI_SKILLS.map((s) => (
              <li key={s.label}>
                <button
                  type="button"
                  onClick={() => onSkill(s.section)}
                  className="inline-flex items-center gap-[0.4em] rounded-full bg-white/15 px-[0.9em] py-[0.35em] text-[0.78em] font-semibold ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
                >
                  <s.icon className="h-[1.1em] w-[1.1em]" />
                  {t(s.label)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

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
  const [passagesOpen, setPassagesOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("video");
  const tabs = useRef<HTMLDivElement>(null);
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
    if (i < 0) return setPassagesOpen(true);
    if (SECTION_TAB[i]) setTab(SECTION_TAB[i]);
    tabs.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectTopic = (key: string) => {
    if (key !== selected) {
      setSelected(key);
      setLessonError(null);
      setLessonLoading(false);
      setSentence("");
    }
    tabs.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <AiHero topicTitle={topic?.titleAr ?? null} ready={!!lesson} onSkill={goTo} />

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
          <div className="mt-[1em] grid items-start gap-[1em] lg:grid-cols-[minmax(13em,0.32fr)_minmax(0,1fr)]">
            <TopicList topics={topics} selected={selected} onSelect={selectTopic} />

            <div className="flex min-w-0 flex-col gap-[1em]">
              <div ref={tabs} role="tablist" aria-label={t("Lesson parts")} className={`${CARD} flex scroll-mt-[1em] gap-[0.4em] overflow-x-auto p-[0.4em]`}>
                {TABS.map((tb) => (
                  <button
                    key={tb.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === tb.id}
                    onClick={() => setTab(tb.id)}
                    className={cn(
                      "flex shrink-0 flex-1 items-center justify-center gap-[0.45em] whitespace-nowrap rounded-[0.8em] px-[1em] py-[0.7em] text-[0.85em] font-semibold transition",
                      tab === tb.id ? "bg-[#14365a] text-white shadow-sm" : "text-[#14365a] hover:bg-[#eef6fb]"
                    )}
                  >
                    <tb.icon className="h-[1.15em] w-[1.15em] shrink-0" />
                    {t(tb.label)}
                  </button>
                ))}
              </div>

              {tab === "video" && (
                <section className={`${CARD} p-[1em]`}>
                  <TopicVideo key={topic.key} topic={topic} />
                </section>
              )}

              {tab === "summary" && (
                <LessonPanel
                  topic={topic}
                  lesson={lesson}
                  loading={lessonLoading && !lesson}
                  error={lesson ? null : lessonError}
                  onRetry={() => {
                    requested.current = null;
                    void loadLesson(topic.key);
                  }}
                  onStartPractice={() => setTab("practice")}
                />
              )}

              {/* Kept mounted (hidden), so the sentence and the chat survive a tab change. */}
              <div hidden={tab !== "practice"}>
                <PracticeCard
                  topicKey={topic.key}
                  first={lesson?.practice ?? null}
                  loading={lessonLoading && !lesson}
                  error={lesson ? null : lessonError}
                  onRetry={() => {
                    requested.current = null;
                    void loadLesson(topic.key);
                  }}
                  onStatus={setStatus}
                  onSentence={setSentence}
                  onOpenPassages={() => setPassagesOpen(true)}
                />
              </div>
              <div hidden={tab !== "ask"}>
                <CoachChat topicKey={topic.key} topicTitle={topic.titleAr} context={sentence} />
              </div>
            </div>
          </div>
        )}
      </div>

      {passagesOpen && <PassagesDialog onClose={() => setPassagesOpen(false)} />}
    </div>
  );
}
