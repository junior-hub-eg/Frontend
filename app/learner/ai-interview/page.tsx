"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ClipboardList,
  Code2,
  Lightbulb,
  Mic,
  MicOff,
  MonitorUp,
  MoreVertical,
  Play,
  Plus,
  Timer,
  Video,
  VideoOff,
  Wifi,
} from "lucide-react";
import { cn } from "@/lib/utils";
const TOTAL_QUESTIONS = 10;
const CURRENT_QUESTION = 3;
const START_SECONDS = 12 * 60 + 45; // 12:45

const STEPS = [
  { title: "Application", note: "Submit your information" },
  { title: "Application", note: "Submit your information" },
  { title: "Application", note: "Submit your information" },
  { title: "Application", note: "Submit your information" },
  { title: "Application", note: "Submit your information" },
];
const CURRENT_STEP = 3; 

const GUIDELINES = Array.from({ length: 6 }, () => "Submit your information");
const TIPS = Array.from({ length: 3 }, () => "Submit your information");

const QUESTION = {
  type: "Technical Question",
  level: "Medium",
  title: "Implement a calculator that calculates even numbers and odd numbers",
  description:
    "Implement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbersImplement a calculator that calculates even numbers and odd numbers",
  example: {
    input: "nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]",
    output: "evens = [2, 4, 6, 8], odds = [1, 3, 5, 7, 9]",
    explanation: "Even numbers are divisible by 2, odd numbers are not.",
  },
};

const LANGUAGE = {
  label: "Dart",
  file: "main.dart",
  starter: `void main() {
  final nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  final evens = nums.where((n) => n.isEven).toList();
  final odds = nums.where((n) => n.isOdd).toList();
  print('evens: $evens, odds: $odds');
}`,
};

const DART_KEYWORDS = new Set([
  "void", "final", "var", "const", "if", "else", "for", "while", "in", "return", "class", "new",
  "true", "false", "null", "import", "async", "await", "int", "String", "double", "bool", "List",
]);
const DART_BUILTINS = new Set(["print", "main"]);

function highlight(code: string): ReactNode[] {
  const re = new RegExp(
    [
      /\/\/.*/.source, // comment
      /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/.source, // string
      /\b\d+(?:\.\d+)?\b/.source, // number
      /[A-Za-z_$][\w$]*/.source, // word
    ]
      .map((part) => `(${part})`)
      .join("|"),
    "g"
  );

  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    const start = m.index ?? 0;
    const text = m[0];
    if (start > last) out.push(code.slice(last, start));

    let color: string | undefined;
    if (m[1]) color = "text-[#6a9955]"; 
    else if (m[2]) color = "text-[#ce9178]"; 
    else if (m[3]) color = "text-[#b5cea8]"; 
    else if (DART_KEYWORDS.has(text)) color = "text-[#c586c0]"; 
    else if (DART_BUILTINS.has(text) || code[start + text.length] === "(") color = "text-[#dcdcaa]";

    out.push(
      color ? (
        <span key={start} className={color}>
          {text}
        </span>
      ) : (
        text
      )
    );
    last = start + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

function DartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 2 22 12 12 22 2 12Z" fill="#0175C2" />
      <path d="M12 7 17 12 12 17 7 12Z" fill="#40C4FF" />
    </svg>
  );
}


function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>
  );
}

function formatTime(total: number) {
  const m = Math.floor(total / 60).toString().padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-2 text-xs text-[#1B2D54]">
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#1B2D54] text-white">
            <Check aria-hidden className="size-2.5" strokeWidth={3.5} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function StatusButton({
  icon,
  label,
  on,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-xl border bg-white px-3 py-2 text-[11px] font-medium shadow-sm transition-colors",
        "hover:border-[#14757d] hover:bg-[#14757d]/5 active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40",
        on ? "border-[#e3ece9] text-[#1B2D54]" : "border-[#e3ece9] text-[#1B2D54]/55"
      )}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", on ? "bg-[#22a559]" : "bg-[#cfd5d4]")} />
    </button>
  );
}


export default function AiInterviewPage() {
  const router = useRouter();

  const [secondsLeft, setSecondsLeft] = useState(START_SECONDS);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [sharing, setSharing] = useState(true);

  const [code, setCode] = useState(LANGUAGE.starter);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const lineCount = code.split("\n").length;
  const progress = (CURRENT_QUESTION / TOTAL_QUESTIONS) * 100;

  function handleSubmit() {
    console.log({ language: "dart", code });
  }

  return (
    <div dir="ltr" className="flex flex-1 flex-col gap-4 bg-[#f6f9f8] p-4 font-[family-name:var(--font-poppins)] text-[#1B2D54] lg:flex-row lg:p-6">
      <aside className="w-full shrink-0 lg:w-48">
        <Card className="p-5">
          <ol className="flex flex-col">
            {STEPS.map((step, i) => {
              const n = i + 1;
              const state = n < CURRENT_STEP ? "done" : n === CURRENT_STEP ? "current" : "todo";
              return (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center text-[11px] font-semibold",
                        state === "done" && "rounded-full bg-[#1B2D54] text-white",
                        state === "current" && "rounded-md bg-[#1B2D54] text-white",
                        state === "todo" && "rounded-md bg-[#c9efe9] text-[#14757d]"
                      )}
                    >
                      {state === "done" ? <Check aria-hidden className="size-3.5" strokeWidth={3} /> : n}
                    </span>
                    {n < STEPS.length && <span aria-hidden className="my-1 h-6 w-px bg-[#e3ece9]" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-xs font-semibold leading-6">{step.title}</p>
                    <p className="text-[11px] text-[#1B2D54]/70">{step.note}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#14757d] bg-white text-[#14757d] transition-colors hover:bg-[#14757d]/10"
          >
            <ArrowLeft aria-hidden className="size-4" strokeWidth={2.2} />
          </button>

          <div
            className="ml-auto mr-25 w-full max-w-[190px]"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_QUESTIONS}
            aria-valuenow={CURRENT_QUESTION}
          >
            <p className="mb-1 text-[12px] font-semibold text-[#14757d]">
              Question {CURRENT_QUESTION} of {TOTAL_QUESTIONS}
            </p>
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#c9efe9]">
              <div className="h-full rounded-full bg-[#14757d]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-full bg-white py-1.5 pl-1.5 pr-6 shadow-sm ring-1 ring-[#e3ece9]">
            <span className="flex size-11 items-center justify-center rounded-full bg-[#1B2D54] text-white">
              <Timer aria-hidden className="size-5" />
            </span>
            <div className="leading-tight">
              <p className="text-lg font-semibold tabular-nums">{formatTime(secondsLeft)}</p>
              <p className="text-[11px] text-[#1B2D54]/70">Time left</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[1fr_16rem]">
          <div className="flex flex-col gap-3">
          
            <div className="overflow-hidden rounded-2xl">
              <Image
                src="/images/Auth/ai-interview/Framee.png"
                alt="Interview video call with the AI interviewer"
                width={749}
                height={476}
                priority
                className="h-auto w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatusButton
                icon={cameraOn ? <Video aria-hidden className="size-4 shrink-0" strokeWidth={1.8} /> : <VideoOff aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />}
                label={cameraOn ? "Camera on" : "Camera off"}
                on={cameraOn}
                onClick={() => setCameraOn((v) => !v)}
              />
              <StatusButton
                icon={micOn ? <Mic aria-hidden className="size-4 shrink-0" strokeWidth={1.8} /> : <MicOff aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />}
                label={micOn ? "Mic on" : "Mic off"}
                on={micOn}
                onClick={() => setMicOn((v) => !v)}
              />
              <StatusButton
                icon={<MonitorUp aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />}
                label="Share Screen"
                on={sharing}
                onClick={() => setSharing((v) => !v)}
              />

              <button
                type="button"
                onClick={() => {
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-xl border border-[#e3ece9] bg-white px-3 py-2 text-[11px] font-medium text-[#1B2D54] shadow-sm transition-colors",
                  "hover:border-[#14757d] hover:bg-[#14757d]/5 active:scale-[0.98]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
                )}
              >
                <Wifi aria-hidden className="size-4 shrink-0" strokeWidth={1.8} />
                <span className="whitespace-nowrap">Good Connection</span>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#22a559]" />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <div className="flex items-center gap-2">
                <ClipboardList aria-hidden className="size-4 text-[#14757d]" />
                <h2 className="text-sm font-semibold">Interview Guidelines</h2>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-[#1B2D54]/70">
                This an AI-Powered technical interview Make sure To
              </p>
              <CheckList items={GUIDELINES} />
            </Card>

            <Card>
              <div className="flex items-center gap-2">
                <Lightbulb aria-hidden className="size-4 text-[#f5a524]" />
                <h2 className="text-sm font-semibold">Tips for success</h2>
              </div>
              <CheckList items={TIPS} />
            </Card>
          </div>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_16rem]">
          <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 rounded-lg border border-[#e3ece9] px-2.5 py-1 text-[11px] font-medium">
                <Code2 aria-hidden className="size-3.5" />
                {QUESTION.type}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-[#fdeedb] px-2.5 py-1 text-[11px] font-medium text-[#c76a0a]">
                <BarChart3 aria-hidden className="size-3.5" />
                {QUESTION.level}
              </span>
            </div>

            <h2 className="text-sm font-semibold leading-snug">{QUESTION.title}</h2>
            <p className="text-xs leading-relaxed text-[#1B2D54]/75">{QUESTION.description}</p>

            <div>
              <p className="text-xs font-semibold">Example:</p>
              <dl className="mt-2 space-y-1 rounded-lg border border-[#e3ece9] p-3 text-[11px] leading-snug">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold">Input:</dt>
                  <dd className="font-mono text-[#1B2D54]/80">{QUESTION.example.input}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold">Output:</dt>
                  <dd className="font-mono text-[#1B2D54]/80">{QUESTION.example.output}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 font-semibold">Explanation:</dt>
                  <dd className="text-[#1B2D54]/80">{QUESTION.example.explanation}</dd>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-lg bg-[#1e1e1e]">
              <div className="flex items-center justify-between bg-[#252526] px-3 py-1.5 text-[11px] text-white/85">
                <span className="flex items-center gap-1.5 rounded bg-[#1e1e1e] px-2 py-0.5">
                  <DartIcon className="size-3.5" />
                  {LANGUAGE.file}
                </span>
                <div className="flex items-center gap-0.5">
                  <button type="button" aria-label="New file" className="rounded p-1 transition-colors hover:bg-white/10">
                    <Plus aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" aria-label="Run code" className="rounded p-1 transition-colors hover:bg-white/10">
                    <Play aria-hidden className="size-3.5" />
                  </button>
                  <button type="button" aria-label="More options" className="rounded p-1 transition-colors hover:bg-white/10">
                    <MoreVertical aria-hidden className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex max-h-64 overflow-auto font-mono text-xs leading-5">
                <div aria-hidden className="select-none py-3 pl-3 pr-3 text-right text-white/35">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <div className="relative min-w-max flex-1">
                  <pre aria-hidden className="m-0 whitespace-pre py-3 pr-3 font-mono text-xs leading-5 text-[#d4d4d4]">
                    {highlight(code)}
                    {"\n"}
                  </pre>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                    wrap="off"
                    aria-label="Code editor, Dart"
                    className="absolute inset-0 h-full w-full resize-none overflow-hidden whitespace-pre bg-transparent py-3 pr-3 font-mono text-xs leading-5 text-transparent caret-white outline-none selection:bg-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center gap-2 rounded-full bg-[#14757d] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#0f6169] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12939b]/40"
              >
                Submit Answer
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          </Card>

          <Card className="self-start">
            <h3 className="text-xs font-semibold">Language to solve with</h3>
            <div className="mt-4 flex items-center gap-2.5 px-1 text-xs font-medium">
              <DartIcon className="size-5 shrink-0" />
              {LANGUAGE.label}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
