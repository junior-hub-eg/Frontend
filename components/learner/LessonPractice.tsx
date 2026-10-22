"use client";

/* Saved code is browser storage, read once after mount. */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Code2, Eye, LoaderCircle, Play, RotateCcw, Terminal, XCircle } from "lucide-react";

import { errorMessage } from "@/lib/api-client";
import { completeLessonStep } from "@/lib/learning-api";
import { runCode, sameOutput, type Run } from "@/lib/run-js";
import { useT } from "@/lib/i18n/client";
import { checkWeb, previewDoc, type WebPractice } from "./web-practice";

export type Practice =
  | { kind: "js"; starterCode: string; expectedOutput: string }
  | { kind: "web"; web: WebPractice };

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStore = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
};

/** A code editor with line numbers; Tab indents and Ctrl/Cmd + Enter runs. */
function Editor({ value, onChange, onRun, label }: { value: string; onChange: (v: string) => void; onRun: () => void; label: string }) {
  const gutter = useRef<HTMLDivElement>(null);
  const lines = value.split("\n").length;

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onRun();
      return;
    }
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const el = e.currentTarget;
      const { selectionStart: s, selectionEnd: end } = el;
      onChange(value.slice(0, s) + "  " + value.slice(end));
      requestAnimationFrame(() => el.setSelectionRange(s + 2, s + 2));
    }
  }

  return (
    <div dir="ltr" className="flex min-h-0 flex-1 overflow-hidden bg-[#0d2233] font-mono text-[0.78em] leading-[1.7]">
      <div
        ref={gutter}
        aria-hidden
        className="w-[3em] shrink-0 select-none overflow-hidden border-e border-white/5 bg-[#0a1c2a] py-[0.9em] pe-[0.7em] text-end text-white/25"
      >
        {Array.from({ length: lines }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(e) => {
          if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop;
        }}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label={label}
        wrap="off"
        className="min-h-[14em] min-w-0 flex-1 resize-none bg-transparent px-[1em] py-[0.9em] text-[#d6f5ef] caret-[#5fe0d0] outline-none selection:bg-[#12939b]/40"
      />
    </div>
  );
}

export default function LessonPractice({
  lessonId,
  practice,
  offline,
  initiallySolved,
}: {
  lessonId: string;
  practice: Practice;
  offline: boolean;
  initiallySolved: boolean;
}) {
  const t = useT();
  const starter = practice.kind === "js" ? practice.starterCode : practice.web.starter;
  const codeKey = `jh:lesson:${lessonId}:practice`;
  const solvedKey = `jh:lesson:${lessonId}:practice-solved`;

  const [source, setSource] = useState(starter);
  const [solved, setSolved] = useState(initiallySolved);
  const [running, setRunning] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [checks, setChecks] = useState<{ label: string; pass: boolean }[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [preview, setPreview] = useState(starter);

  // The saved code of this lesson, read once in the browser.
  useEffect(() => {
    const saved = readStore(codeKey, starter);
    setSource(saved);
    setPreview(saved);
    if (readStore(solvedKey, false)) setSolved(true);
  }, [codeKey, solvedKey, starter]);

  // Live preview of web practice, a moment after typing stops.
  useEffect(() => {
    if (practice.kind !== "web") return;
    const id = setTimeout(() => setPreview(source), 350);
    return () => clearTimeout(id);
  }, [practice.kind, source]);

  async function markSolved() {
    setSolved(true);
    writeStore(solvedKey, true);
    if (practice.kind !== "js" || offline || initiallySolved) return;
    try {
      await completeLessonStep(lessonId, "TryIt");
    } catch (e) {
      setSaveError(errorMessage(e, "Your code is right, but we couldn't save it. Run it again."));
    }
  }

  async function onRun() {
    writeStore(codeKey, source);
    setSaveError(null);
    if (practice.kind === "web") {
      setPreview(source);
      const results = checkWeb(practice.web, source);
      setChecks(results);
      if (results.every((r) => r.pass)) await markSolved();
      return;
    }
    setRunning(true);
    const result = await runCode(source);
    setRun(result);
    setRunning(false);
    if (!result.error && sameOutput(result.output, practice.expectedOutput)) await markSolved();
  }

  function onReset() {
    setSource(starter);
    setPreview(starter);
    setRun(null);
    setChecks(null);
    writeStore(codeKey, starter);
  }

  const right =
    practice.kind === "js"
      ? !!run && !run.error && sameOutput(run.output, practice.expectedOutput)
      : !!checks && checks.every((c) => c.pass);
  const tried = practice.kind === "js" ? !!run : !!checks;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Task */}
      <div className="flex items-start justify-between gap-[1em] px-[1.1em] pb-[0.8em] pt-[0.9em]">
        <div className="min-w-0">
          <p className="text-[0.6em] font-bold uppercase tracking-wide text-[#12939b]">{t("Practice")}</p>
          <h2 className="text-[1.05em] font-extrabold text-[#14365a]">{t("Try it yourself")}</h2>
          <p dir="auto" className="mt-[0.25em] text-[0.75em] leading-relaxed text-[#14365a]/80">
            {practice.kind === "js"
              ? t("Read the code, guess what it prints, then run it. It should print {output}.", { output: practice.expectedOutput })
              : t(practice.web.task)}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-[0.4em]">
          {solved && (
            <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#dff5e8] px-[0.8em] py-[0.2em] text-[0.62em] font-semibold text-[#2a9a5f]">
              <CheckCircle2 className="size-[1.2em]" />
              {t("Solved")}
            </span>
          )}
          <span className="rounded-full bg-[#14365a] px-[0.8em] py-[0.2em] text-[0.62em] font-semibold text-white">
            {practice.kind === "js" ? "JavaScript" : practice.web.kit === "bootstrap" ? "HTML · Bootstrap" : practice.web.kit === "tailwind" ? "HTML · Tailwind" : "HTML · CSS"}
          </span>
        </span>
      </div>

      {/* Editor window */}
      <div className="mx-[1.1em] flex min-h-0 flex-1 flex-col overflow-hidden rounded-[0.8em] border border-[#0d2233] shadow-[0_12px_30px_rgba(13,34,51,0.25)]">
        <div dir="ltr" className="flex shrink-0 items-center gap-[0.5em] bg-[#0a1c2a] px-[0.9em] py-[0.5em]">
          <span className="size-[0.6em] rounded-full bg-[#ff5f57]" />
          <span className="size-[0.6em] rounded-full bg-[#febc2e]" />
          <span className="size-[0.6em] rounded-full bg-[#28c840]" />
          <span className="ms-[0.6em] inline-flex items-center gap-[0.4em] text-[0.62em] font-semibold text-white/60">
            <Code2 className="size-[1.2em]" />
            {practice.kind === "js" ? "main.js" : "index.html"}
          </span>
          <span className="ms-auto hidden text-[0.58em] text-white/35 sm:inline">⌘/Ctrl + Enter</span>
        </div>

        <Editor value={source} onChange={setSource} onRun={onRun} label={t("Your code")} />

        {/* Output */}
        <div className="shrink-0 border-t border-white/10 bg-[#071521]">
          <div className="flex items-center gap-[0.4em] px-[0.9em] pt-[0.5em] text-[0.6em] font-semibold uppercase tracking-wide text-white/45">
            {practice.kind === "js" ? <Terminal className="size-[1.2em]" /> : <Eye className="size-[1.2em]" />}
            {practice.kind === "js" ? t("Output") : t("Live preview")}
          </div>
          {practice.kind === "js" ? (
            <pre
              dir="ltr"
              role="status"
              className="max-h-[8em] min-h-[3.2em] overflow-auto whitespace-pre-wrap px-[0.9em] pb-[0.7em] pt-[0.3em] font-mono text-[0.74em] leading-relaxed"
            >
              {!run ? (
                <span className="text-white/35">{t("Press Run to see what your code prints.")}</span>
              ) : (
                <>
                  {run.output.map((line, i) => (
                    <span key={i} className="block text-[#d6f5ef]">
                      {line}
                    </span>
                  ))}
                  {run.error && <span className="block text-[#ff8a80]">{run.error}</span>}
                  {!run.error && run.output.length === 0 && <span className="text-white/35">{t("(nothing was printed)")}</span>}
                </>
              )}
            </pre>
          ) : (
            <div className="px-[0.9em] pb-[0.8em] pt-[0.4em]">
              <iframe
                title={t("Live preview")}
                sandbox="allow-scripts"
                srcDoc={previewDoc(practice.web, preview)}
                className="h-[11em] w-full rounded-[0.5em] bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions + result */}
      <div className="shrink-0 px-[1.1em] pb-[1em] pt-[0.8em]">
        <div className="flex gap-[0.6em]">
          <button
            type="button"
            onClick={onRun}
            disabled={running}
            className="inline-flex flex-1 items-center justify-center gap-[0.5em] rounded-[0.6em] bg-[#12939b] py-[0.7em] text-[0.8em] font-bold text-white shadow-[0_6px_16px_rgba(18,147,155,0.35)] transition-colors hover:bg-[#0f7f86] disabled:opacity-60"
          >
            {running ? <LoaderCircle className="size-[1.1em] animate-spin" /> : <Play className="size-[1.1em] fill-white" />}
            {practice.kind === "js" ? t("Run & Check") : t("Check my page")}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#12939b]/50 bg-white px-[1.1em] text-[0.78em] font-semibold text-[#12606b] hover:bg-[#eef8f7]"
          >
            <RotateCcw className="size-[1em]" />
            {t("Reset")}
          </button>
        </div>

        {tried && (
          <div role="status" className="mt-[0.6em] space-y-[0.3em]">
            <p className={`text-[0.76em] font-bold ${right ? "text-[#2a9a5f]" : "text-[#c0392b]"}`}>
              {right
                ? t("Correct! Nice work.")
                : practice.kind === "js"
                  ? t("Not yet: it should print {output}.", { output: practice.expectedOutput })
                  : t("Not quite yet. Check the details and try again.")}
            </p>
            {checks?.map((c) => (
              <p key={c.label} className="flex items-start gap-[0.4em] text-[0.7em] text-[#14365a]/85">
                {c.pass ? (
                  <CheckCircle2 className="mt-[0.1em] size-[1.2em] shrink-0 text-[#2a9a5f]" />
                ) : (
                  <XCircle className="mt-[0.1em] size-[1.2em] shrink-0 text-[#c0392b]" />
                )}
                <span dir="auto">{t(c.label)}</span>
              </p>
            ))}
          </div>
        )}
        {saveError && (
          <p role="alert" className="mt-[0.4em] text-[0.68em] font-medium text-[#c0392b]">
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}
