"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import type { ReportLang } from "@/lib/reports-api";
import { cn } from "@/lib/utils";

export interface ExportItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  run: () => void | Promise<void>;
}

/** "Export ⌄": Excel and PDF, each in English or Arabic, plus any `extra` items (e.g. CSV). */
export function ExportMenu({ onExcel, onPdf, extra = [], disabled }: {
  onExcel?: (lang: ReportLang) => Promise<void>;
  onPdf?: (lang: ReportLang) => void;
  extra?: ExportItem[];
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const sheet = <FileSpreadsheet aria-hidden className="size-[1.1em] text-[#167a3e]" />;
  const pdf = <FileText aria-hidden className="size-[1.1em] text-[#c81e1e]" />;
  const items: ExportItem[] = [
    ...(onExcel
      ? (["en", "ar"] as const).map((lang) => ({ key: `xlsx-${lang}`, label: t(lang === "en" ? tk("Excel · English") : tk("Excel · Arabic")), icon: sheet, run: () => onExcel(lang) }))
      : []),
    ...(onPdf
      ? (["en", "ar"] as const).map((lang) => ({ key: `pdf-${lang}`, label: t(lang === "en" ? tk("PDF · English") : tk("PDF · Arabic")), icon: pdf, run: () => onPdf(lang) }))
      : []),
    ...extra,
  ];

  const run = async (item: ExportItem) => {
    setOpen(false);
    setError(null);
    setBusy(item.key);
    try {
      await item.run();
    } catch (e) {
      setError(errorMessage(e, t("The file could not be downloaded. Try again.")));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className="rk-no-print relative">
      <button
        type="button"
        disabled={disabled || busy !== null}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setError(null);
          setOpen((v) => !v);
        }}
        className="inline-flex h-[2.6em] items-center gap-[0.5em] rounded-[0.7em] bg-gradient-to-r from-[#0f6b70] to-[#1b2d54] px-[1em] text-[0.82em] font-semibold text-white shadow-[0_6px_16px_rgba(15,107,112,0.25)] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 rtl:bg-gradient-to-l"
      >
        {busy ? <LoaderCircle aria-hidden className="size-[1.1em] animate-spin" /> : <Download aria-hidden className="size-[1.1em]" />}
        {busy ? t("Preparing…") : t("Export")}
        <ChevronDown aria-hidden className="size-[1em]" />
      </button>
      {open && (
        <ul role="menu" className="absolute end-0 top-full z-30 mt-[0.4em] min-w-[13em] overflow-hidden rounded-[0.9em] border border-[#e1e8f0] bg-white py-[0.3em] text-[0.82em] shadow-xl">
          {items.map((item) => (
            <li key={item.key} role="none">
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => run(item)}
                className={cn("flex w-full items-center gap-[0.6em] whitespace-nowrap px-[1em] py-[0.6em] text-start text-[#1b2d54] hover:bg-[#f5f8fc] disabled:opacity-45")}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p role="alert" className="absolute end-0 top-full z-20 mt-[0.4em] w-max max-w-[18em] rounded-[0.7em] bg-[#fdf1f1] px-[0.8em] py-[0.5em] text-[0.75em] text-[#b42318] shadow">
          {error}
        </p>
      )}
    </div>
  );
}
