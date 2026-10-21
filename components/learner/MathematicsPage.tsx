"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Code2,
  FunctionSquare,
  PlayCircle,
  Search,
} from "lucide-react";

import {
  MATH_ALGORITHMS as ALGORITHMS,
  MATH_LEVELS as LEVELS,
  MATH_PROBLEMS as PROBLEMS,
  MATH_TOPICS as TOPICS,
  type MathAlgorithm,
  type MathProblem as Problem,
} from "@/lib/math-problems";

const IMG = "/images/Intern/AI%20Curriculum";

type Topic = (typeof TOPICS)[number];
type Level = (typeof LEVELS)[number];

/* ---------------- Pieces ---------------- */

function ProblemCard({ problem }: { problem: Problem }) {
  const detail = `/learner/ai-curriculum/mathematics/${problem.id}` as Route;
  const pill =
    "inline-flex items-center gap-[0.5em] rounded-[0.7em] px-[1.2em] py-[0.7em] text-[0.8em] font-semibold text-[#14365a] transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2bb8a6]";

  return (
    <article className="flex flex-col gap-[1em] rounded-[1.2em] border border-[#e3e9f0] bg-white p-[1em] md:flex-row md:items-center">
      {/* Thumbnail */}
      <div className="grid h-[5.6em] w-[6.4em] shrink-0 place-items-center rounded-[0.9em] bg-[#fbc9c9] text-[#a52a2a]">
        <FunctionSquare className="h-[2.6em] w-[2.6em]" />
      </div>

      {/* Title / formula / level */}
      <div className="min-w-0 flex-1">
        <h3 className="text-[1em] font-bold text-[#14365a]">{problem.title}</h3>
        <p className="mt-[0.3em] font-serif text-[0.85em] text-[#14365a]">{problem.formula}</p>
        <span className="mt-[0.5em] inline-block rounded-[0.4em] bg-[#d5f2de] px-[0.6em] py-[0.15em] text-[0.7em] font-semibold text-[#1f7a45]">
          {problem.level}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-[0.8em]">
        <Link href={detail} className={pill} style={{ backgroundColor: "#e6f0fd" }}>
          <PlayCircle className="h-[1.3em] w-[1.3em]" style={{ color: "#1d6fe0" }} />
          AI Video
        </Link>

        {/* Simulation and Code pages are not built yet */}
        <button type="button" title="Coming soon" className={pill} style={{ backgroundColor: "#e3f6e8" }}>
          <Box className="h-[1.3em] w-[1.3em]" style={{ color: "#1f9d55" }} />
          Simulation
        </button>
        <button type="button" title="Coming soon" className={pill} style={{ backgroundColor: "#e4dcf5" }}>
          <Code2 className="h-[1.3em] w-[1.3em]" style={{ color: "#14365a" }} />
          Code
        </button>

        <Link
          href={detail}
          aria-label={`Open ${problem.title}`}
          className="grid h-[2.6em] w-[2.6em] place-items-center rounded-full border border-[#c9d3df] text-[#14365a] transition hover:bg-[#f3f6f9]"
        >
          <ChevronRight className="h-[1.2em] w-[1.2em]" />
        </Link>
      </div>
    </article>
  );
}

/* ---------------- Page ---------------- */

export default function MathematicsPage() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level>("All Levels");
  const [topic, setTopic] = useState<Topic>("All Topics");
  const [algorithm, setAlgorithm] = useState<MathAlgorithm>("Linear Regression");

  const problems = useMemo(
    () =>
      PROBLEMS.filter(
        (p) =>
          (topic === "All Topics" || p.topic === topic) &&
          (level === "All Levels" || p.level === level) &&
          p.algorithm === algorithm &&
          `${p.title} ${p.formula}`.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [query, level, topic, algorithm]
  );

  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* Breadcrumb + title + banner */}
        <section className="flex flex-col gap-[0.8em] lg:flex-row lg:items-center">
          <div className="shrink-0">
            <nav className="flex items-center gap-[0.5em] text-[0.85em] text-[#14365a]">
              <Link href="/learner/ai-curriculum" className="hover:underline">
                AI Curriculum
              </Link>
              <ChevronRight className="h-[1em] w-[1em]" />
              <span>Mathematics</span>
            </nav>
            <h1 className="mt-[0.3em] text-[2.3em] font-extrabold leading-tight text-[#14365a]">Mathematics</h1>
            <p className="max-w-[20em] text-[0.95em] leading-snug text-[#14365a]">
              Choose a topic, then pick a problem to explore
            </p>
          </div>
          <div className="relative aspect-[751/121] w-full min-w-0 lg:ml-auto lg:w-[54%]">
            <Image src={`${IMG}/Group%20189.png`} alt="" fill priority sizes="(max-width: 1024px) 90vw, 50vw" className="object-cover object-right" />
          </div>
        </section>

        {/* Search + level */}
        <div className="mt-[1.4em] flex flex-wrap items-center gap-[0.8em]">
          <label className="flex w-full max-w-[26em] items-center gap-[0.6em] rounded-[0.9em] border border-[#e3e9f0] bg-white px-[1em] py-[0.7em] focus-within:border-[#2bb8a6]">
            <Search className="h-[1.2em] w-[1.2em] text-[#8a9bb0]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything...."
              className="w-full bg-transparent text-[0.9em] text-[#14365a] outline-none placeholder:text-[#8a9bb0]"
            />
          </label>

          <div className="relative">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              aria-label="Filter by level"
              className="appearance-none rounded-[0.9em] border border-[#e3e9f0] bg-white py-[0.7em] pl-[1em] pr-[2.4em] text-[0.9em] text-[#14365a] outline-none focus:border-[#2bb8a6]"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[0.8em] top-1/2 h-[1.1em] w-[1.1em] -translate-y-1/2 text-[#14365a]" />
          </div>
        </div>

        {/* Topic tabs */}
        <div
          role="tablist"
          aria-label="Mathematics topics"
          className="mt-[1.2em] flex overflow-x-auto rounded-[0.9em] border border-[#e3e9f0] bg-white"
        >
          {TOPICS.map((t) => {
            const active = t === topic;
            return (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTopic(t)}
                className={`relative shrink-0 px-[1.6em] py-[1.2em] text-[0.8em] font-medium text-[#14365a] transition ${
                  active
                    ? "bg-[#e4f7f4] font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-[0.2em] after:bg-[#2bb8a6]"
                    : "hover:bg-[#f3f6f9]"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Algorithms sidebar + problems */}
        <div className="mt-[1em] grid items-start gap-[1em] lg:grid-cols-[15em_1fr]">
          <aside className="rounded-[1.2em] border border-[#e3e9f0] bg-white p-[0.6em]">
            <ul>
              {ALGORITHMS.map((a) => {
                const active = a === algorithm;
                return (
                  <li key={a}>
                    <button
                      type="button"
                      onClick={() => setAlgorithm(a)}
                      aria-current={active}
                      className={`flex w-full items-start gap-[0.7em] rounded-[0.7em] px-[0.8em] py-[0.65em] text-left text-[0.8em] text-[#14365a] transition ${
                        active ? "bg-[#e4f7f4] font-semibold" : "hover:bg-[#f3f6f9]"
                      }`}
                    >
                      <FunctionSquare className="mt-[0.1em] h-[1.4em] w-[1.4em] shrink-0" />
                      <span>{a}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex min-w-0 flex-col gap-[1em]">
            {problems.length === 0 ? (
              <div className="rounded-[1.2em] border border-dashed border-[#c9d3df] p-[2.5em] text-center text-[0.9em] text-[#5b7089]">
                No problems match your filters. Try a different topic or level.
              </div>
            ) : (
              problems.map((p) => <ProblemCard key={p.id} problem={p} />)
            )}
          </section>
        </div>
      </div>
    </div>
  );
}