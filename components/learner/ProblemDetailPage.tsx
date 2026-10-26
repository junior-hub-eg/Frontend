"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import {
  MATH_SHORTS,
  MATH_VIDEOS,
  relatedMathProblems,
  type MathProblem,
} from "@/lib/math-problems";
import { MATH_SIMS, type MathSim } from "@/lib/math-sims";
import { youTubeEmbed } from "@/lib/youtube";
import EquationSimulation from "./EquationSimulation";
import ShortEmbed from "@/components/shared/ShortEmbed";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  HelpCircle,
  Play,
  RotateCcw,
} from "lucide-react";

/* ---------------- Data (replace with API data later) ---------------- */

const TABS = [
  tk("AI Explanation"),
  tk("Try it Yourself"),
  tk("Steps"),
  tk("Related Problems"),
] as const;
type Tab = (typeof TABS)[number];

/** ?tab= of the Mathematics page buttons: AI Video, Simulation and Code. */
const TAB_OF: Record<string, Tab> = {
  video: "AI Explanation",
  simulation: "Try it Yourself",
  code: "Try it Yourself",
};

/* ---------------- Video player ---------------- */

/** The problem's explanation video (YouTube); the player loads only when the student presses play. */
function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const t = useT();
  const [playing, setPlaying] = useState(false);

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-[1.4em] bg-black">
        {playing ? (
          <iframe
            src={youTubeEmbed(videoId).replace("loop=1", "loop=0")}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={t("Play video")}
            className="group absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover opacity-80"
            />
            <span className="absolute left-1/2 top-1/2 grid h-[4.6em] w-[4.6em] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#2bb8a6]/90 text-white ring-[0.35em] ring-white/40 transition group-hover:scale-105">
              <Play className="ms-[0.2em] h-[1.9em] w-[1.9em] fill-white" />
            </span>
          </button>
        )}
      </div>
      {/* For when the player cannot load (a blocker, a school network) */}
      <a
        href={`https://www.youtube.com/watch?v=${videoId}`}
        target="_blank"
        rel="noreferrer"
        className="mt-[0.5em] inline-block text-[0.8em] font-semibold text-[#0f7a81] hover:underline"
      >
        {t("Watch on YouTube")}
      </a>
    </div>
  );
}

/* ---------------- Try it Yourself ---------------- */

/** Sliders for the problem's numbers with the answer worked out live, then the same calculation in Python. */
function Playground({ sim, showCode }: { sim: MathSim; showCode: boolean }) {
  const t = useT();
  const start = () =>
    Object.fromEntries(sim.inputs.map((i) => [i.key, i.value]));
  const [values, setValues] = useState<Record<string, number>>(start);
  const [copied, setCopied] = useState(false);
  const code = useRef<HTMLElement>(null);

  useEffect(() => {
    if (showCode)
      code.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showCode]);

  return (
    <div className="space-y-[1em]">
      <section className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[1em] font-bold text-[#14365a]">
            {t("Change the numbers")}
          </h2>
          <button
            type="button"
            onClick={() => setValues(start())}
            className="flex items-center gap-[0.4em] text-[0.8em] font-semibold text-[#0f7a81] hover:underline"
          >
            <RotateCcw className="h-[1em] w-[1em]" /> {t("Reset")}
          </button>
        </div>
        <div className="mt-[1em] grid gap-[1em] md:grid-cols-2">
          {sim.inputs.map((i) => (
            <label key={i.key} className="block text-[0.85em] text-[#14365a]">
              <span className="flex justify-between font-semibold">
                <span>{t(i.label)}</span>
                <span dir="ltr" className="tabular-nums text-[#0f7a81]">
                  {values[i.key]}
                </span>
              </span>
              <input
                type="range"
                min={i.min}
                max={i.max}
                step={i.step}
                value={values[i.key]}
                onChange={(e) =>
                  setValues({ ...values, [i.key]: Number(e.target.value) })
                }
                className="mt-[0.4em] w-full cursor-pointer accent-[#12939b]"
              />
            </label>
          ))}
        </div>
        <dl className="mt-[1.2em] grid gap-[0.6em] sm:grid-cols-2 lg:grid-cols-3">
          {sim.outputs(values).map((o) => (
            <div
              key={o.label}
              className="rounded-[0.9em] bg-[#e4f7f4] px-[1em] py-[0.7em]"
            >
              <dt className="text-[0.75em] text-[#14365a]/70">{t(o.label)}</dt>
              <dd
                dir="ltr"
                className="font-serif text-[1.15em] font-bold text-[#14365a] rtl:text-end"
              >
                {t(o.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section
        ref={code}
        className="scroll-mt-[1em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#14365a]">
            <Code2 className="h-[1.2em] w-[1.2em]" /> {t("Python code")}
          </h2>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard?.writeText(sim.code).then(
                () => setCopied(true),
                () => undefined,
              )
            }
            className="flex items-center gap-[0.4em] rounded-[0.6em] border border-[#c9d3df] px-[0.8em] py-[0.35em] text-[0.8em] font-semibold text-[#14365a] hover:bg-[#f3f6f9]"
          >
            {copied ? (
              <Check className="h-[1em] w-[1em]" />
            ) : (
              <Copy className="h-[1em] w-[1em]" />
            )}{" "}
            {copied ? t("Copied") : t("Copy")}
          </button>
        </div>
        <pre
          dir="ltr"
          className="mt-[0.8em] overflow-x-auto rounded-[0.9em] bg-[#0f1f33] p-[1em] text-start text-[0.8em] leading-relaxed text-[#d7f5ef]"
        >
          <code>{sim.code}</code>
        </pre>
      </section>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function ProblemDetailPage({
  problem,
}: {
  problem: MathProblem;
}) {
  const t = useT();
  const asked = useSearchParams().get("tab") ?? "";
  const [tab, setTab] = useState<Tab>(TAB_OF[asked] ?? "AI Explanation");
  const sim = MATH_SIMS[problem.id];
  const related = relatedMathProblems(problem);
  const summary = [
    {
      icon: Clock,
      text: t("Estimated time {n} minutes", { n: problem.minutes }),
    },
    { icon: HelpCircle, text: `${t(problem.topic)} · ${problem.algorithm}` },
  ];

  const crumb = "hover:underline";

  return (
    <div className="relative -ms-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ms-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 ps-[4.75rem] pe-3 pt-2 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* Breadcrumb */}
        <nav
          aria-label={t("Breadcrumb")}
          className="flex flex-wrap items-center gap-[0.5em] text-[0.8em] text-[#14365a]"
        >
          <Link
            href={"/learner/ai-curriculum" as Route}
            className={`font-semibold ${crumb}`}
          >
            {t("AI Curriculum")}
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <Link
            href={"/learner/ai-curriculum/mathematics" as Route}
            className={crumb}
          >
            {t("Mathematics")}
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <Link
            href={"/learner/ai-curriculum/mathematics" as Route}
            className={crumb}
          >
            {problem.algorithm}
          </Link>
          <ChevronRight className="h-[1em] w-[1em]" />
          <span>{t(problem.title)}</span>
        </nav>

        {/* Title */}
        <h1 className="mt-[0.5em] text-[2.1em] font-extrabold leading-tight text-[#14365a]">
          {t(problem.title)}
        </h1>
        <div className="mt-[0.2em] flex items-center gap-[0.8em]">
          <p dir="ltr" className="font-serif text-[1.05em] text-[#14365a]">
            {problem.formula}
          </p>
          <span className="rounded-[0.4em] bg-[#d5f2de] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a45]">
            {t(problem.level)}
          </span>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label={t("Problem sections")}
          className="mt-[1.2em] inline-flex max-w-full overflow-x-auto rounded-[0.9em] border border-[#e3e9f0] bg-white"
        >
          {TABS.map((tb) => {
            const active = tb === tab;
            return (
              <button
                key={tb}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(tb)}
                className={`relative shrink-0 px-[1.6em] py-[1.1em] text-[0.8em] font-medium text-[#14365a] transition ${
                  active
                    ? "bg-[#e4f7f4] font-semibold text-[#0f7a81] after:absolute after:inset-x-0 after:bottom-0 after:h-[0.2em] after:bg-[#2bb8a6]"
                    : "hover:bg-[#f3f6f9]"
                }`}
              >
                {t(tb)}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="mt-[1em]">
          {tab === "AI Explanation" &&
            (MATH_VIDEOS[problem.id] ? (
              <div className={`grid items-start gap-[1em] ${MATH_SHORTS[problem.id] ? "md:grid-cols-[minmax(0,1fr)_15em]" : ""}`}>
                <VideoPlayer
                  videoId={MATH_VIDEOS[problem.id]}
                  title={t(problem.title)}
                />
                {MATH_SHORTS[problem.id] && (
                  <ShortEmbed url={`https://www.youtube.com/shorts/${MATH_SHORTS[problem.id]}`} title={t(problem.title)} />
                )}
              </div>
            ) : (
              <p className="rounded-[1.2em] border border-dashed border-[#c9d3df] p-[2.5em] text-center text-[0.9em] text-[#5b7089]">
                {t("Video coming soon")}
              </p>
            ))}

          {tab === "Try it Yourself" && (
            <div className="space-y-[1em]">
              {problem.equation && <EquationSimulation {...problem.equation} />}
              {sim ? (
                <Playground sim={sim} showCode={asked === "code"} />
              ) : (
                !problem.equation && (
                  <div className="rounded-[1.2em] border border-dashed border-[#c9d3df] p-[2.5em] text-center text-[0.9em] text-[#5b7089]">
                    {t(
                      "The interactive simulation for this problem is coming soon.",
                    )}
                  </div>
                )
              )}
            </div>
          )}

          {tab === "Steps" && (
            <ol className="space-y-[0.8em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
              {problem.steps.map((s, i) => (
                <li
                  key={s}
                  className="flex items-start gap-[0.9em] text-[0.9em] text-[#14365a]"
                >
                  <span className="grid h-[1.9em] w-[1.9em] shrink-0 place-items-center rounded-full bg-[#e4f7f4] text-[0.85em] font-bold text-[#0f7a81]">
                    {i + 1}
                  </span>
                  <span className="pt-[0.2em]">{t(s)}</span>
                </li>
              ))}
            </ol>
          )}

          {tab === "Related Problems" && (
            <ul className="space-y-[0.8em]">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/learner/ai-curriculum/mathematics/${r.id}` as Route}
                    className="flex items-center justify-between rounded-[1em] border border-[#e3e9f0] bg-white px-[1.2em] py-[1em] text-[0.9em] font-semibold text-[#14365a] transition hover:bg-[#f3f6f9]"
                  >
                    <span>
                      {t(r.title)}
                      <span
                        dir="ltr"
                        className="ms-[0.8em] inline-block font-serif font-normal text-[#5b7089]"
                      >
                        {r.formula}
                      </span>
                    </span>
                    <ChevronRight className="h-[1.2em] w-[1.2em]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info cards */}
        <div className="mt-[1em] grid gap-[1em] md:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
            <h2 className="text-[1em] font-bold text-[#14365a]">
              {t("What you will learn")}
            </h2>
            <ul className="mt-[1em] space-y-[0.9em]">
              {problem.learn.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-[0.8em] text-[0.8em] text-[#14365a]"
                >
                  <span className="grid h-[1.8em] w-[1.8em] shrink-0 place-items-center rounded-full bg-[#12939b] text-white">
                    <Check className="h-[1.1em] w-[1.1em]" strokeWidth={3} />
                  </span>
                  {t(item)}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1.4em]">
            <h2 className="text-[1em] font-bold text-[#14365a]">
              {t("Problem summary")}
            </h2>
            <p
              dir="ltr"
              className="mt-[0.8em] font-serif text-[1.05em] text-[#14365a] rtl:text-end"
            >
              {problem.formula}
            </p>
            <ul className="mt-[0.8em] space-y-[0.8em]">
              {summary.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-[0.8em] text-[0.75em] text-[#14365a]"
                >
                  <span className="grid h-[2em] w-[2em] shrink-0 place-items-center rounded-full bg-[#d9f2f1] text-[#12939b]">
                    <Icon className="h-[1.2em] w-[1.2em]" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
