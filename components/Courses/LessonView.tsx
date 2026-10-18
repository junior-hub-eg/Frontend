"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, HelpCircle, Link2, Presentation } from "lucide-react";
import { TUTOR, type Track } from "@/lib/data/courses";
import { getCompletedLessons, getServerCompletedLessons, markLessonComplete, subscribeProgress } from "@/lib/data/progress";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { VideoPlaceholder } from "./VideoPlaceholder";

const TABS = ["Overview", "Steps", "Resources", "Notes", "Q&A"] as const;
type Tab = (typeof TABS)[number];

export function LessonView({ track, lessonIndex }: { track: Track; lessonIndex: number }) {
  const { user } = useAuth();
  const lesson = track.lessons[lessonIndex];
  const prev = track.lessons[lessonIndex - 1];
  const next = track.lessons[lessonIndex + 1];
  const base = `/learner/courses/${track.slug}`;

  const completed = useSyncExternalStore(subscribeProgress, () => getCompletedLessons(track.slug), getServerCompletedLessons);
  const isDone = completed.includes(lesson.id);
  const percent = Math.round((completed.length / track.lessons.length) * 100);

  const [tab, setTab] = useState<Tab>("Overview");
  const [notes, setNotes] = useState("");
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);

  const resources = [
    { icon: Presentation, title: "Lesson slides", meta: "PDF · 12 slides" },
    { icon: FileText, title: `${track.title} starter kit`, meta: "Starter files" },
    { icon: Link2, title: "Further reading list", meta: "3 articles" },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5">
      {/* Greeting banner */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#E9F7F4] to-[#bfece5] px-6 py-5">
        <h1 className="text-lg font-bold text-[#1b2a5c]">
          {lessonIndex === 0 ? "Great start" : "Keep it up"}, {user?.firstName ?? "there"}!
        </h1>
        <p className="mt-0.5 text-xs text-[#1b2a5c]/70">
          Lesson {lessonIndex + 1} of {track.lessons.length} · {track.title} track
        </p>
        <span aria-hidden className="absolute -right-4 -top-6 size-24 rounded-full bg-white/40" />
      </section>

      <Link href={base as Route} className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
        <ArrowLeft aria-hidden size={14} /> Track Details
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#12939b]">
              Lesson {lessonIndex + 1} of {track.lessons.length}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#1b2a5c]">{lesson.title}</h2>
            <p className="mt-1 text-sm text-[#1b2a5c]/65">{lesson.summary}</p>
          </div>

          <VideoPlaceholder title={lesson.title} />

          {/* Tabs */}
          <div>
            <div role="tablist" aria-label="Lesson sections" className="flex gap-1 overflow-x-auto border-b border-[#dfe7e5]">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors",
                    tab === t ? "border-[#12939b] text-[#12939b]" : "border-transparent text-[#1b2a5c]/60 hover:text-[#1b2a5c]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="pt-5">
              {tab === "Overview" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                    <h3 className="text-sm font-bold text-[#1b2a5c]">What you&apos;ll learn</h3>
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {track.objectives.map((o) => (
                        <li key={o} className="flex items-center gap-2 text-xs text-[#1b2a5c]">
                          <CheckCircle2 aria-hidden size={15} className="shrink-0 text-[#12939b]" /> {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                    <h3 className="text-sm font-bold text-[#1b2a5c]">Lesson summary</h3>
                    <dl className="mt-3 flex flex-col gap-2 text-xs">
                      {[
                        ["Estimated time", "15 minutes"],
                        ["Level", "Beginner"],
                        ["Format", "Video + quiz"],
                        ["Lesson", `${lessonIndex + 1} of ${track.lessons.length}`],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-[#1b2a5c]/60">{k}</dt>
                          <dd className="font-medium text-[#1b2a5c]">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="rounded-2xl bg-[#E9F7F4] p-4 md:col-span-2">
                    <h3 className="text-sm font-bold text-[#1b2a5c]">Key concept</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#1b2a5c]/75">
                      A useful project begins with a goal, a clear audience, and a few achievable steps. Think about it: what would you
                      like to make in the first version?
                    </p>
                  </div>
                </div>
              )}

              {tab === "Steps" && (
                <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                  <ol className="flex flex-col gap-3">
                    {["Watch the lesson video", "Review the key concept", "Try the practice challenge", "Take the quick quiz"].map((step, i) => (
                      <li key={step} className="flex items-center gap-3 text-xs text-[#1b2a5c]">
                        <span className="grid size-6 place-items-center rounded-full bg-[#E9F7F4] text-[10px] font-semibold text-[#12939b]">{i + 1}</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                  <Link
                    href={`${base}/lessons/${lesson.id}/challenge` as Route}
                    className="mt-4 inline-flex rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Open practice challenge
                  </Link>
                </div>
              )}

              {tab === "Resources" && (
                <ul className="flex flex-col gap-2">
                  {resources.map(({ icon: Icon, title, meta }) => (
                    <li key={title} className="flex items-center gap-3 rounded-xl border border-[#dfe7e5] bg-white px-4 py-3">
                      <span className="grid size-8 place-items-center rounded-lg bg-[#E9F7F4] text-[#12939b]">
                        <Icon aria-hidden size={15} />
                      </span>
                      <span className="text-xs font-semibold text-[#1b2a5c]">{title}</span>
                      <span className="ml-auto text-[11px] text-[#1b2a5c]/55">{meta}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tab === "Notes" && (
                <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                  <label htmlFor="lesson-notes" className="text-xs font-semibold text-[#1b2a5c]">
                    Your notes
                  </label>
                  <textarea
                    id="lesson-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                    placeholder="Write what you want to remember…"
                    className="mt-2 w-full resize-none rounded-xl border border-[#dfe7e5] p-3 text-xs text-[#1b2a5c] outline-none focus:border-[#12939b]"
                  />
                  <p className="mt-1 text-[10px] text-[#1b2a5c]/50">Notes aren&apos;t saved yet — they stay on this page until the Notes API is ready.</p>
                </div>
              )}

              {tab === "Q&A" && (
                <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
                  {questions.length === 0 ? (
                    <p className="text-xs text-[#1b2a5c]/60">No questions yet. Ask {TUTOR.name} anything about this lesson.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {questions.map((q, i) => (
                        <li key={i} className="rounded-lg bg-[#E9F7F4] px-3 py-2 text-xs text-[#1b2a5c]">
                          {q}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-3 flex gap-2">
                    <input
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      aria-label="Your question"
                      placeholder="Type your question…"
                      className="min-w-0 flex-1 rounded-lg border border-[#dfe7e5] px-3 py-2 text-xs text-[#1b2a5c] outline-none focus:border-[#12939b]"
                    />
                    <button
                      type="button"
                      disabled={!question.trim()}
                      onClick={() => {
                        setQuestions((qs) => [...qs, question.trim()]);
                        setQuestion("");
                      }}
                      className="rounded-lg bg-[#12939b] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prev / next */}
          <div className="flex items-center justify-between border-t border-[#dfe7e5] pt-4 text-xs font-semibold text-[#12939b]">
            {prev ? (
              <Link href={`${base}/lessons/${prev.id}` as Route} className="inline-flex items-center gap-1.5 hover:underline">
                <ArrowLeft aria-hidden size={14} /> Previous Lesson
              </Link>
            ) : (
              <span />
            )}
            <Link href={(next ? `${base}/lessons/${next.id}` : base) as Route} className="inline-flex items-center gap-1.5 hover:underline">
              {next ? "Next Lesson" : "Finish Track"} <ArrowRight aria-hidden size={14} />
            </Link>
          </div>
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Your progress</p>
            <div className="mt-2 flex items-center gap-3">
              <span
                role="img"
                aria-label={`${percent}% complete`}
                className="grid size-14 place-items-center rounded-full text-xs font-bold text-[#1b2a5c]"
                style={{ background: `conic-gradient(#12939b ${percent * 3.6}deg, #E9F7F4 0deg)` }}
              >
                <span className="grid size-10 place-items-center rounded-full bg-white">{percent}%</span>
              </span>
              <p className="text-xs text-[#1b2a5c]/70">
                Lesson {lessonIndex + 1} of {track.lessons.length}
                <span className="block font-semibold text-[#12939b]">{isDone ? "Completed" : "In progress"}</span>
              </p>
            </div>
            <button
              type="button"
              disabled={isDone}
              onClick={() => markLessonComplete(track.slug, lesson.id)}
              className="mt-3 w-full rounded-lg border border-[#12939b] px-3 py-2 text-xs font-semibold text-[#12939b] transition-colors hover:bg-[#E9F7F4] disabled:cursor-default disabled:bg-[#E9F7F4]"
            >
              {isDone ? "Completed ✓" : "Mark as Complete"}
            </button>
          </div>

          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Track content</p>
            <h3 className="text-sm font-bold text-[#1b2a5c]">Lessons</h3>
            <ol className="mt-3 flex flex-col gap-1">
              {track.lessons.map((l, i) => {
                const done = completed.includes(l.id);
                return (
                  <li key={l.id}>
                    <Link
                      href={`${base}/lessons/${l.id}` as Route}
                      aria-current={i === lessonIndex ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-medium text-[#1b2a5c] hover:bg-[#F7FBFA]",
                        i === lessonIndex && "bg-[#E9F7F4]"
                      )}
                    >
                      {done ? (
                        <CheckCircle2 aria-label="Completed" size={15} className="shrink-0 text-[#12939b]" />
                      ) : (
                        <Circle aria-hidden size={15} className="shrink-0 text-[#1b2a5c]/30" />
                      )}
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-2xl bg-linear-to-br from-[#14757d] to-[#1b2a5c] p-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Lesson quiz</p>
            <h3 className="mt-1 text-sm font-bold">Check your understanding</h3>
            <p className="mt-1 text-[11px] text-white/75">A quick quiz about this lesson. No pass mark required.</p>
            <Link
              href={`${base}/lessons/${lesson.id}/quiz` as Route}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#1b2a5c] hover:bg-white/90"
            >
              <HelpCircle aria-hidden size={13} /> Start quiz
            </Link>
          </div>

          <div className="rounded-2xl border border-[#dfe7e5] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#1b2a5c]/55">Your tutor</p>
            <div className="mt-2 flex items-center gap-3">
              <span aria-hidden className="grid size-9 place-items-center rounded-full bg-[#DBF4F1] text-xs font-semibold text-[#12939b]">
                {TUTOR.initials}
              </span>
              <p className="text-xs font-semibold text-[#1b2a5c]">{TUTOR.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setTab("Q&A")}
              className="mt-3 w-full rounded-lg bg-[#12939b] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0f7a81]"
            >
              Ask a question
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
