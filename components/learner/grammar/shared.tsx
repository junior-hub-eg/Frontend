"use client";

import { CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { WORD_COLOR, type GrammarStatus, type ParsedWord, type WordColor } from "@/lib/grammar-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export const CARD = "rounded-[1.4em] border border-[#e3eef5] bg-white/95 shadow-[0_0.4em_1.6em_rgba(20,54,90,0.06)]";
export const PRIMARY_BTN =
  "inline-flex items-center justify-center gap-[0.5em] rounded-full bg-[#1f9e95] px-[1.4em] py-[0.65em] text-[0.9em] font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2bb8a6]";
export const SOFT_BTN =
  "inline-flex items-center justify-center gap-[0.45em] rounded-full border border-[#cfe3ec] bg-white px-[1.1em] py-[0.5em] text-[0.82em] font-semibold text-[#14365a] transition hover:bg-[#f1f8fb] disabled:cursor-not-allowed disabled:opacity-50";

const STATUS: Record<GrammarStatus, { label: string; cls: string; check: boolean }> = {
  Practicing: { label: tk("Learning in progress"), cls: "bg-[#dff6ea] text-[#1b7a4f]", check: false },
  Mastered: { label: tk("Completed"), cls: "bg-[#e3f6ec] text-[#11704a]", check: true },
  New: { label: tk("Not started"), cls: "bg-[#eef1f4] text-[#5b6675]", check: false },
};

export function StatusChip({ status }: { status: GrammarStatus }) {
  const t = useT();
  const s = STATUS[status] ?? STATUS.New;
  return (
    <span className={`inline-flex shrink-0 items-center gap-[0.3em] rounded-full px-[0.7em] py-[0.2em] text-[0.72em] font-semibold ${s.cls}`}>
      {s.check && <CheckCircle2 className="h-[1.1em] w-[1.1em]" />}
      {t(s.label)}
    </span>
  );
}

/** One Arabic word as a colored chip (the case colors of US-03). */
export function WordChip({
  word,
  color,
  active,
  title,
}: {
  word: string;
  color?: WordColor | null;
  active?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={`inline-block rounded-[0.5em] px-[0.35em] py-[0.05em] ring-1 transition ${
        color ? WORD_COLOR[color] : "bg-transparent text-[#14365a] ring-transparent"
      } ${active ? "scale-110 shadow-md ring-2 ring-[#14365a]" : ""}`}
    >
      {word}
    </span>
  );
}

/** A parsed sentence, each word colored by its case; hover shows its role. */
export function ParsedLine({ words, activeIndex }: { words: ParsedWord[]; activeIndex?: number }) {
  return (
    <p dir="rtl" className="flex flex-wrap gap-x-[0.35em] gap-y-[0.5em] text-[1.15em] leading-[2]">
      {words.map((w, i) => (
        <WordChip key={i} word={w.word} color={w.color} active={i === activeIndex} title={`${w.role} - ${w.case}`} />
      ))}
    </p>
  );
}

/** The case-color legend, so the colors explain themselves. */
const LEGEND: { color: WordColor; label: string }[] = [
  { color: "blue", label: tk("Nominative (marfoo')") },
  { color: "green", label: tk("Accusative (mansoob)") },
  { color: "orange", label: tk("Genitive (majroor)") },
  { color: "purple", label: tk("Jussive (majzoom)") },
  { color: "gray", label: tk("Indeclinable / particle") },
];

export function ColorLegend() {
  const t = useT();
  return (
    <ul className="flex flex-wrap gap-[0.4em] text-[0.7em]">
      {LEGEND.map((l) => (
        <li key={l.color} className={`rounded-full px-[0.7em] py-[0.15em] ring-1 ${WORD_COLOR[l.color]}`}>
          {t(l.label)}
        </li>
      ))}
    </ul>
  );
}

export function isAiUnavailable(error: unknown): boolean {
  return error instanceof ApiError && (error.code === "AI_UNAVAILABLE" || error.status === 503);
}

/** A friendly error with a retry button; the AI being busy (503 AI_UNAVAILABLE) gets its own wording. */
export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useT();
  const busy = isAiUnavailable(error);
  return (
    <div role="alert" className="flex flex-col items-center gap-[0.7em] rounded-[1em] border border-[#f6d6b4] bg-[#fff8ef] p-[1.2em] text-center text-[0.88em] text-[#8a4b12]">
      <Sparkles className="h-[1.8em] w-[1.8em] text-[#f0a040]" />
      <p>
        {busy
          ? t("The AI coach is taking a short break. Please try again in a moment.")
          : errorMessage(error)}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className={SOFT_BTN}>
          <RotateCcw className="h-[1.1em] w-[1.1em]" />
          {t("Try again")}
        </button>
      )}
    </div>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-[0.6em] py-[1.6em] text-[0.85em] text-[#5b7089]">
      <span className="h-[2em] w-[2em] animate-spin rounded-full border-[0.25em] border-[#cfe9e6] border-t-[#1f9e95]" />
      {label}
    </div>
  );
}
