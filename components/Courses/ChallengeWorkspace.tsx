"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CheckCircle2, Circle, Lightbulb, LoaderCircle, Play, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { completeLessonStep, getLesson, lessonPath, trackPath, type Lesson } from "@/lib/learning-api";
import { cn } from "@/lib/utils";
import { LoadState } from "./course-ui";

type Run = { output: string[]; error: string | null };

/** Prints of console.log, posted back by the worker; anything the code does stays inside it. */
const WORKER = `
const show = (v) => typeof v === "string" ? v : (() => { try { return JSON.stringify(v); } catch { return String(v); } })();
onmessage = (e) => {
  const output = [];
  const print = (...args) => output.push(args.map(show).join(" "));
  console.log = print; console.info = print; console.warn = print; console.error = print;
  try { new Function(e.data)(); postMessage({ output, error: null }); }
  catch (err) { postMessage({ output, error: String(err) }); }
};`;

const TIME_LIMIT_MS = 2000;

/** Runs the student's JavaScript in a Web Worker in the browser (FR-LRN-05): nothing runs on the server. */
function runCode(code: string): Promise<Run> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER], { type: "text/javascript" }));
    const worker = new Worker(url);
    const done = (run: Run) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(run);
    };
    const timer = setTimeout(() => done({ output: [], error: "Your code took too long to finish. Check for a loop that never ends." }), TIME_LIMIT_MS);
    worker.onmessage = (e: MessageEvent<Run>) => done(e.data);
    worker.onerror = (e) => {
      e.preventDefault();
      done({ output: [], error: e.message || "Your code has an error." });
    };
    worker.postMessage(code);
  });
}

const same = (output: string[], expected: string) => output.join("\n").trim() === expected.trim();

/** Try it: edit the lesson's starter code and run it until it prints the expected output. */
export function ChallengeWorkspace({ code, lessonId }: { code: string; lessonId: string }) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);

  useEffect(() => {
    let active = true;
    getLesson(lessonId).then(
      (l) => active && setLesson(l),
      (e) => active && setLoadError(e)
    );
    return () => {
      active = false;
    };
  }, [lessonId]);

  if (!lesson) return <LoadState error={loadError} backHref={trackPath(code)} />;
  if (!lesson.tryIt) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
        <p className="text-lg font-bold text-[#1b2a5c]">This lesson has no Try it</p>
        <p className="text-sm text-[#1b2a5c]/65">There is no code to run here. Watch the video, then take the lesson quiz.</p>
        <Link href={lessonPath(lesson.trackCode, lesson.id) as Route} className="rounded-lg bg-[#12939b] px-4 py-2 text-xs font-semibold text-white">
          Back to Lesson
        </Link>
      </div>
    );
  }
  return <Workspace lesson={lesson} tryIt={lesson.tryIt} />;
}

function Workspace({ lesson, tryIt }: { lesson: Lesson; tryIt: { starterCode: string; expectedOutput: string } }) {
  const lessonHref = lessonPath(lesson.trackCode, lesson.id) as Route;
  const { starterCode, expectedOutput } = tryIt;

  const [source, setSource] = useState(starterCode);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [saved, setSaved] = useState(lesson.progress.tryItDone);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hint, setHint] = useState(false);

  const ranOk = !!run && !run.error;
  const printedRight = !!run && !run.error && same(run.output, expectedOutput);
  const requirements = [
    { title: "Run the code", outcome: "Press Run Code. Your code runs here in the browser.", done: ranOk || saved },
    { title: `Print ${expectedOutput}`, outcome: `The output should be exactly: ${expectedOutput}`, done: printedRight || saved },
  ];
  const doneCount = requirements.filter((r) => r.done).length;
  const lineCount = source.split("\n").length;

  async function onRun() {
    setRunning(true);
    setSaveError(null);
    const result = await runCode(source);
    setRun(result);
    setRunning(false);
    if (!result.error && same(result.output, expectedOutput) && !saved) {
      try {
        await completeLessonStep(lesson.id, "TryIt");
        setSaved(true);
      } catch (e) {
        setSaveError(errorMessage(e, "Your code is right, but we couldn't save it. Run it again."));
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1b2a5c]">{lesson.title}</p>
          <p className="text-[11px] text-[#1b2a5c]/60">{lesson.moduleTitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1b2a5c]">
            Challenge progress
            <span className="h-1.5 w-24 rounded-full bg-[#e8eeed]">
              <span className="block h-full rounded-full bg-[#12939b] transition-all" style={{ width: `${(doneCount / requirements.length) * 100}%` }} />
            </span>
            {doneCount}/{requirements.length}
          </div>
          <Link href={lessonHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
            <ArrowLeft aria-hidden size={14} /> Back to Lesson
          </Link>
        </div>
      </div>

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[300px_1fr_1fr]">
        {/* Requirements */}
        <section className="flex flex-col rounded-2xl border border-[#dfe7e5] bg-white p-4" aria-labelledby="challenge-title">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#12939b]">Try it</p>
          <h1 id="challenge-title" className="mt-1 text-xl font-bold leading-tight text-[#1b2a5c]">
            Run the {lesson.title.toLowerCase()} code
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#1b2a5c]/65">
            Read the code, guess what it prints, then run it. Change it and run it again to see what happens.
          </p>
          <p className="mt-3 rounded-lg bg-[#E9F7F4] px-3 py-1.5 text-[11px] font-semibold text-[#12939b]">
            {saved ? "Try it completed ✓" : `${doneCount}/${requirements.length} requirements completed`}
          </p>

          <h2 className="mt-4 text-sm font-bold text-[#1b2a5c]">Challenge requirements</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {requirements.map((r, i) => (
              <li key={r.title} className="rounded-xl border border-[#dfe7e5] p-3">
                <div className="flex items-start gap-2">
                  {r.done ? (
                    <CheckCircle2 aria-label="Done" size={16} className="mt-0.5 shrink-0 text-[#12939b]" />
                  ) : (
                    <Circle aria-label="Not done yet" size={16} className="mt-0.5 shrink-0 text-[#1b2a5c]/30" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase text-[#1b2a5c]/50">Step {i + 1}</p>
                    <p className="text-xs font-semibold text-[#1b2a5c]">{r.title}</p>
                    <p className="mt-1 text-[11px] text-[#1b2a5c]/60">{r.outcome}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setHint(!hint)}
            aria-expanded={hint}
            className="mt-3 inline-flex w-fit items-center gap-1 text-[11px] font-semibold text-[#12939b] hover:underline"
          >
            <Lightbulb aria-hidden size={11} /> Need a hint?
          </button>
          {hint && (
            <p className="mt-1 rounded-md bg-[#E9F7F4] px-2 py-1 text-[11px] text-[#1b2a5c]/80">
              The starter code already prints the right answer. If you changed it, press Reset to start again.
            </p>
          )}
          {saved && (
            <Link
              href={`${lessonHref}/quiz` as Route}
              className="mt-auto inline-flex justify-center rounded-lg bg-linear-to-r from-[#14757d] to-[#1b2a5c] px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
              style={{ marginTop: "1.25rem" }}
            >
              Next: the lesson quiz
            </Link>
          )}
        </section>

        {/* Editor */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#14213f] text-white" aria-label="Code editor">
          <div className="flex items-center justify-between border-b border-white/10 px-3 pt-2">
            <span className="rounded-t-lg bg-[#1b2a5c] px-3 py-2 text-[11px] font-medium text-white">main.js</span>
            <button
              type="button"
              onClick={() => {
                setSource(starterCode);
                setRun(null);
              }}
              className="mb-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
            >
              <RotateCcw aria-hidden size={11} /> Reset
            </button>
          </div>

          <div className="flex min-h-[320px] flex-1 overflow-auto bg-[#1b2a5c] font-mono text-xs leading-6">
            <div aria-hidden className="select-none px-3 py-3 text-end text-white/30">
              {Array.from({ length: Math.max(lineCount, 14) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              spellCheck={false}
              aria-label="Edit main.js"
              rows={Math.max(lineCount, 14)}
              className="min-w-0 flex-1 resize-none overflow-hidden whitespace-pre bg-transparent py-3 pe-3 text-[#cfe9ff] outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
            <p className="text-[11px] text-white/60">Edit the code, then run it to check the requirements.</p>
            <button
              type="button"
              disabled={running}
              onClick={onRun}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12939b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f7a81] disabled:opacity-60"
            >
              {running ? <LoaderCircle aria-hidden size={12} className="animate-spin" /> : <Play aria-hidden size={12} className="fill-white" />} Run Code
            </button>
          </div>
        </section>

        {/* Output */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white" aria-label="Output">
          <div className="flex items-center gap-1.5 border-b border-[#e8eeed] px-3 py-2">
            <span className="size-2 rounded-full bg-[#ff6b6b]" />
            <span className="size-2 rounded-full bg-[#ffd166]" />
            <span className="size-2 rounded-full bg-[#06d6a0]" />
            <span className="ms-2 text-[11px] font-semibold text-[#1b2a5c]/60">Console</span>
          </div>
          <div className="flex-1 overflow-auto p-4" aria-live="polite">
            {run ? (
              <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-[#1b2a5c]">
                {run.output.length ? run.output.join("\n") : !run.error && <span className="text-[#1b2a5c]/50">Your code printed nothing.</span>}
                {run.error && <span className="block text-[#D1365A]">{run.error}</span>}
              </pre>
            ) : (
              <div className="grid h-full min-h-[320px] place-items-center p-6 text-center text-xs text-[#1b2a5c]/55">
                What your code prints will appear here after you run it.
              </div>
            )}
          </div>
          <p
            className={cn(
              "flex items-center gap-1.5 border-t border-[#e8eeed] px-4 py-2.5 text-[11px]",
              saveError ? "bg-[#fdecec] text-[#b83232]" : "bg-[#E9F7F4] text-[#1b2a5c]/80"
            )}
          >
            <Lightbulb aria-hidden size={12} className="text-[#12939b]" />
            {saveError ??
              (!run
                ? `Expected output: ${expectedOutput}`
                : printedRight
                  ? "Correct! Your code printed the right answer."
                  : run.error
                    ? "Fix the error, then run your code again."
                    : `Not yet: it should print ${expectedOutput}.`)}
          </p>
        </section>
      </div>
    </div>
  );
}
