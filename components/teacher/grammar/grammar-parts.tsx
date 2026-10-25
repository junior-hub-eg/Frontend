"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { WORD_COLOR, type ParsedWord, type WordColor } from "@/lib/grammar-api";
import { cn } from "@/lib/utils";
import { FieldLabel, inputClass } from "@/components/teacher/teacher-ui";
import { TeacherDialog } from "@/components/teacher/teacher-dialogs";

/** The five case colors a teacher can pick (US-03: the same colors on every screen). */
export const CASE_COLORS: { color: WordColor; label: string }[] = [
  { color: "blue", label: tk("Nominative (مرفوع)") },
  { color: "green", label: tk("Accusative (منصوب)") },
  { color: "orange", label: tk("Genitive (مجرور)") },
  { color: "purple", label: tk("Jussive (مجزوم)") },
  { color: "gray", label: tk("Indeclinable / particles (مبني / حروف)") },
];

export function ColorLegend({ className }: { className?: string }) {
  const t = useT();
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label={t("Color legend")}>
      {CASE_COLORS.map((c) => (
        <li key={c.color} className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1", WORD_COLOR[c.color])}>
          {t(c.label)}
        </li>
      ))}
    </ul>
  );
}

/** One parsed word: the word and its role under it, in its case color. */
export function WordChip({ word, changed, onClick }: { word: ParsedWord; changed?: boolean; onClick: () => void }) {
  const t = useT();
  return (
    <button
      type="button"
      onClick={onClick}
      title={[word.role, word.case, word.sign].filter(Boolean).join(" • ")}
      className={cn(
        "relative flex min-w-12 flex-col items-center rounded-xl px-2.5 py-1.5 ring-1 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-[#14757d]",
        WORD_COLOR[word.color] ?? WORD_COLOR.gray,
      )}
    >
      <span className="text-sm font-bold leading-tight">{word.word}</span>
      <span className="mt-0.5 max-w-32 truncate text-[9px] leading-tight opacity-80">{word.role || "—"}</span>
      {changed && (
        <span className="absolute -top-1 -end-1 size-2.5 rounded-full bg-[#14757d] ring-2 ring-white" aria-label={t("Corrected")} />
      )}
    </button>
  );
}

/** Edit one word's parsing (role, case, sign, explanation, color); applied locally until the teacher saves. */
export function WordEditorDialog({
  word,
  original,
  onApply,
  onClose,
}: {
  word: ParsedWord;
  original: ParsedWord | null;
  onApply: (w: ParsedWord) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [form, setForm] = useState<ParsedWord>(word);
  const colorKnown = CASE_COLORS.some((c) => c.color === form.color);

  function submit(e: FormEvent) {
    e.preventDefault();
    onApply({
      ...form,
      role: form.role.trim(),
      case: form.case.trim(),
      sign: form.sign.trim(),
      explanation: form.explanation.trim(),
    });
  }

  return (
    <TeacherDialog title={t("Correct the parsing")} subtitle={t("Your change stays on this page until you save the corrections.")} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3">
        <p dir="rtl" className={cn("w-fit justify-self-center rounded-xl px-4 py-2 text-lg font-bold ring-1", WORD_COLOR[form.color] ?? WORD_COLOR.gray)}>
          {form.word}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <FieldLabel label={t("Role")}>
            <input className={inputClass} dir="rtl" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} maxLength={100} required />
          </FieldLabel>
          <FieldLabel label={t("Case")}>
            <input className={inputClass} dir="rtl" value={form.case} onChange={(e) => setForm({ ...form, case: e.target.value })} maxLength={100} />
          </FieldLabel>
          <FieldLabel label={t("Sign")}>
            <input className={inputClass} dir="rtl" value={form.sign} onChange={(e) => setForm({ ...form, sign: e.target.value })} maxLength={100} />
          </FieldLabel>
          <FieldLabel label={t("Color")}>
            <select className={inputClass} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value as WordColor })}>
              {!colorKnown && <option value={form.color}>{form.color}</option>}
              {CASE_COLORS.map((c) => (
                <option key={c.color} value={c.color}>
                  {t(c.label)}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
        <FieldLabel label={t("Explanation")}>
          <textarea
            className={cn(inputClass, "h-20 py-2")}
            dir="rtl"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            maxLength={1000}
          />
        </FieldLabel>
        {original && original.role !== form.role && (
          <p className="text-[10px] text-[#1B2D54]/60">
            {t("The AI said:")} <span dir="rtl" className="font-semibold">{original.role}</span>
          </p>
        )}
        <div className="mt-1 flex flex-wrap justify-end gap-2">
          {original && (
            <button type="button" onClick={() => setForm(original)} className="me-auto rounded-full bg-[#eef2f1] px-4 py-2 text-[11px] font-semibold">
              {t("Undo my changes")}
            </button>
          )}
          <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
            {t("Cancel")}
          </button>
          <button type="submit" className="rounded-full bg-[#14757d] px-5 py-2 text-[11px] font-semibold text-white hover:bg-[#0f6169]">
            {t("Apply")}
          </button>
        </div>
      </form>
    </TeacherDialog>
  );
}

/** "Are you sure?" with one action button. */
export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  danger,
  busy,
  error,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <TeacherDialog title={title} onClose={onClose}>
      <div className="text-[12px] leading-relaxed">{children}</div>
      {error && (
        <p role="alert" className="mt-3 text-[11px] text-[#c81e1e]">
          {error}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-full bg-[#eef2f1] px-5 py-2 text-[11px] font-semibold">
          {t("Cancel")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-semibold text-white disabled:opacity-60",
            danger ? "bg-[#c81e1e] hover:bg-[#a51818]" : "bg-[#14757d] hover:bg-[#0f6169]",
          )}
        >
          {busy && <LoaderCircle className="size-3.5 animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </TeacherDialog>
  );
}
