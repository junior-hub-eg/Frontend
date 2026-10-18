"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CheckCircle2, Circle, Lightbulb, Play, RotateCcw } from "lucide-react";
import type { Track } from "@/lib/data/courses";
import { cn } from "@/lib/utils";

const STARTER = {
  "index.html": `<main class="welcome-card">
  <h1>Welcome to Junior Hub</h1>
</main>`,
  "styles.css": `.welcome-card {
  max-width: 360px;
  padding: 24px;
  background: #ffffff;
}`,
} as const;

type FileName = keyof typeof STARTER;
type Files = Record<FileName, string>;

const REQUIREMENTS: { id: string; title: string; outcome: string; hint: string; check: (f: Files) => boolean }[] = [
  {
    id: "heading",
    title: "Add one main heading",
    outcome: "The card shows a large <h1> heading.",
    hint: "Use an <h1> element inside the <main> tag.",
    check: (f) => /<h1[\s>][\s\S]*?<\/h1>/i.test(f["index.html"]),
  },
  {
    id: "paragraph",
    title: "Explain your project in a paragraph",
    outcome: "A <p> element describes your project.",
    hint: "Add <p>Your text here</p> below the heading.",
    check: (f) => /<p[\s>][\s\S]*?<\/p>/i.test(f["index.html"]),
  },
  {
    id: "card",
    title: "Style it like a card",
    outcome: "The .welcome-card has rounded corners.",
    hint: "Add border-radius: 16px; to the .welcome-card rule.",
    check: (f) => /\.welcome-card\s*\{[^}]*border-radius/i.test(f["styles.css"]),
  },
];

function buildDocument(f: Files) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f7fbfa}${f["styles.css"]}</style></head><body>${f["index.html"]}</body></html>`;
}

export function ChallengeWorkspace({ track, lessonIndex }: { track: Track; lessonIndex: number }) {
  const lesson = track.lessons[lessonIndex];
  const lessonHref = `/learner/courses/${track.slug}/lessons/${lesson.id}` as Route;

  const [files, setFiles] = useState<Files>({ ...STARTER });
  const [active, setActive] = useState<FileName>("index.html");
  const [ran, setRan] = useState<Files | null>(null);
  const [openHint, setOpenHint] = useState<string | null>(null);

  const results = REQUIREMENTS.map((r) => ({ ...r, done: ran ? r.check(ran) : false }));
  const doneCount = results.filter((r) => r.done).length;
  const lineCount = files[active].split("\n").length;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#1b2a5c]">{track.title}</p>
          <p className="text-[11px] text-[#1b2a5c]/60">Build your first webpage</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1b2a5c]">
            Challenge progress
            <span className="h-1.5 w-24 rounded-full bg-[#e8eeed]">
              <span className="block h-full rounded-full bg-[#12939b] transition-all" style={{ width: `${(doneCount / REQUIREMENTS.length) * 100}%` }} />
            </span>
            {doneCount}/{REQUIREMENTS.length}
          </div>
          <Link href={lessonHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12939b] hover:underline">
            <ArrowLeft aria-hidden size={14} /> Back to Lesson
          </Link>
        </div>
      </div>

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[300px_1fr_1fr]">
        {/* Requirements */}
        <section className="flex flex-col rounded-2xl border border-[#dfe7e5] bg-white p-4" aria-labelledby="challenge-title">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#12939b]">Practice challenge</p>
          <h1 id="challenge-title" className="mt-1 text-xl font-bold leading-tight text-[#1b2a5c]">
            Create a polished welcome card
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#1b2a5c]/65">
            Combine semantic HTML and simple CSS to create a clean welcome card for a Junior Hub learner.
          </p>
          <p className="mt-3 rounded-lg bg-[#E9F7F4] px-3 py-1.5 text-[11px] font-semibold text-[#12939b]">
            {doneCount}/{REQUIREMENTS.length} requirements completed
          </p>

          <h2 className="mt-4 text-sm font-bold text-[#1b2a5c]">Challenge requirements</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {results.map((r, i) => (
              <li key={r.id} className="rounded-xl border border-[#dfe7e5] p-3">
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
                    <button
                      type="button"
                      onClick={() => setOpenHint(openHint === r.id ? null : r.id)}
                      aria-expanded={openHint === r.id}
                      className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[#12939b] hover:underline"
                    >
                      <Lightbulb aria-hidden size={11} /> Need a hint?
                    </button>
                    {openHint === r.id && <p className="mt-1 rounded-md bg-[#E9F7F4] px-2 py-1 text-[11px] text-[#1b2a5c]/80">{r.hint}</p>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Editor */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#14213f] text-white" aria-label="Code editor">
          <div className="flex items-center justify-between border-b border-white/10 px-3 pt-2">
            <div role="tablist" aria-label="Files" className="flex gap-1">
              {(Object.keys(STARTER) as FileName[]).map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={active === name}
                  onClick={() => setActive(name)}
                  className={cn(
                    "rounded-t-lg px-3 py-2 text-[11px] font-medium transition-colors",
                    active === name ? "bg-[#1b2a5c] text-white" : "text-white/60 hover:text-white"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setFiles({ ...STARTER });
                setRan(null);
              }}
              className="mb-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-white/70 hover:bg-white/10"
            >
              <RotateCcw aria-hidden size={11} /> Reset
            </button>
          </div>

          <div className="flex min-h-[320px] flex-1 overflow-auto bg-[#1b2a5c] font-mono text-xs leading-6">
            <div aria-hidden className="select-none px-3 py-3 text-right text-white/30">
              {Array.from({ length: Math.max(lineCount, 14) }, (_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={files[active]}
              onChange={(e) => setFiles({ ...files, [active]: e.target.value })}
              spellCheck={false}
              aria-label={`Edit ${active}`}
              rows={Math.max(lineCount, 14)}
              className="min-w-0 flex-1 resize-none overflow-hidden bg-transparent py-3 pr-3 text-[#cfe9ff] outline-none"
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
            <p className="text-[11px] text-white/60">Edit the code, then run it to check the requirements.</p>
            <button
              type="button"
              onClick={() => setRan({ ...files })}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#12939b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f7a81]"
            >
              <Play aria-hidden size={12} className="fill-white" /> Run Code
            </button>
          </div>
        </section>

        {/* Preview */}
        <section className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#dfe7e5] bg-white" aria-label="Preview">
          <div className="flex items-center gap-1.5 border-b border-[#e8eeed] px-3 py-2">
            <span className="size-2 rounded-full bg-[#ff6b6b]" />
            <span className="size-2 rounded-full bg-[#ffd166]" />
            <span className="size-2 rounded-full bg-[#06d6a0]" />
            <span className="ml-2 text-[11px] font-semibold text-[#1b2a5c]/60">Preview</span>
          </div>
          <div className="flex-1">
            {ran ? (
              <iframe title="Challenge preview" sandbox="" srcDoc={buildDocument(ran)} className="h-full min-h-[320px] w-full" />
            ) : (
              <div className="grid h-full min-h-[320px] place-items-center p-6 text-center text-xs text-[#1b2a5c]/55">
                Your preview will appear here after you run your code.
              </div>
            )}
          </div>
          <p className="flex items-center gap-1.5 border-t border-[#e8eeed] bg-[#E9F7F4] px-4 py-2.5 text-[11px] text-[#1b2a5c]/80">
            <Lightbulb aria-hidden size={12} className="text-[#12939b]" />
            {ran ? `${doneCount} of ${REQUIREMENTS.length} requirements met.` : "Preview ready — run your code to check the challenge."}
          </p>
        </section>
      </div>
    </div>
  );
}
