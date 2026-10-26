"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal, flushSync } from "react-dom";
import { LocaleOverride, useI18n } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { formatRange } from "./range";

/**
 * PDF export = the browser's "Save as PDF" of a print-only copy of the report (see `.rk-print-root` in
 * app/globals.css): A4, report header, no navigation or buttons, in the chosen language and direction.
 * `print(lang)` opens the print dialog for that language; Ctrl+P on the page prints it in the page's language.
 */
export function usePrintReport(onPrint?: (lang: Locale) => void) {
  const { locale } = useI18n();
  const [printing, setPrinting] = useState<Locale | null>(null);
  const active = useRef(false);
  const onPrintRef = useRef(onPrint);
  useEffect(() => {
    onPrintRef.current = onPrint;
  });

  useEffect(() => {
    const before = () => {
      if (active.current) return;
      active.current = true;
      // Render the print copy synchronously so the dialog sees it.
      flushSync(() => setPrinting(locale));
    };
    const after = () => {
      active.current = false;
      setPrinting(null);
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, [locale]);

  const print = useCallback((lang: Locale) => {
    active.current = true;
    setPrinting(lang);
    onPrintRef.current?.(lang);
    // Give the copy (and its images and fonts) a moment to render before the dialog opens.
    setTimeout(() => window.print(), 350);
  }, []);

  return { printing, print };
}

/** The print-only copy of a report, rendered at the end of <body> in `lang`. */
export function PrintReport({ lang, title, subtitle, from, to, children }: {
  lang: Locale;
  title: string;
  subtitle?: string;
  from?: string;
  to?: string;
  children: ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <LocaleOverride locale={lang}>
      <div className="rk-print-root" dir={lang === "ar" ? "rtl" : "ltr"} lang={lang}>
        <PrintHeader title={title} subtitle={subtitle} from={from} to={to} />
        <div className="space-y-[1.1em]">{children}</div>
      </div>
    </LocaleOverride>,
    document.body,
  );
}

function PrintHeader({ title, subtitle, from, to }: { title: string; subtitle?: string; from?: string; to?: string }) {
  const { t, intl } = useI18n();
  return (
    <header className="mb-[1.4em] flex items-center justify-between gap-[1em] border-b-2 border-[#0f7378] pb-[0.9em]">
      <div className="min-w-0">
        <p className="text-[0.8em] font-semibold uppercase tracking-wide text-[#0f7378]">Junior Hub</p>
        <h1 className="text-[1.7em] font-extrabold leading-tight text-[#1b2d54]">{title}</h1>
        {subtitle && <p className="text-[0.95em] font-semibold text-[#1b2d54]">{subtitle}</p>}
        <p className="mt-[0.3em] text-[0.82em] text-[#475467]">
          {from && to && <span>{t("Period")}: {formatRange(from, to, intl)} · </span>}
          {t("Generated {date}", { date: new Date().toLocaleString(intl, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) })}
        </p>
      </div>
      {/* A plain <img>: it has to be loaded when the print dialog opens. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/Auth/logo.png" alt="Junior Hub" className="h-[3.4em] w-auto shrink-0 object-contain" />
    </header>
  );
}

/** A titled block of the printed report; `breakBefore` starts it on a new page. */
export function PrintSection({ title, children, breakBefore, className }: { title?: string; children: ReactNode; breakBefore?: boolean; className?: string }) {
  return (
    <section className={cn(breakBefore && "rk-break", className)}>
      {title && <h2 className="mb-[0.6em] text-[1.15em] font-bold text-[#1b2d54]">{title}</h2>}
      {children}
    </section>
  );
}
