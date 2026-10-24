"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

/** Loads one API call on mount; `reload` fetches again and `setData` takes what a save returned. */
export function useMentorData<T>(load: () => Promise<T>, failMessage: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setData(await load());
    } catch (e) {
      setError(errorMessage(e, failMessage));
    }
  }, [load, failMessage]);

  useEffect(() => {
    let active = true;
    load().then(
      (value) => active && setData(value),
      (e) => active && setError(errorMessage(e, failMessage)),
    );
    return () => {
      active = false;
    };
  }, [load, failMessage]);

  return { data, error, reload, setData };
}

/** The spinner while loading, or the error with a retry button. */
export function LoadState({ error, onRetry, className }: { error: string | null; onRetry: () => void; className?: string }) {
  const t = useT();
  if (!error) {
    return (
      <div role="status" aria-label={t("Loading")} className={cn("grid place-items-center py-12", className)}>
        <LoaderCircle className="size-6 animate-spin text-[#0f8f8c]" />
      </div>
    );
  }
  return (
    <div role="alert" className={cn("flex flex-wrap items-center justify-center gap-3 rounded-xl bg-[#fdecec] px-4 py-3 text-xs font-semibold text-[#b83232]", className)}>
      <span>{error}</span>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#14305a] shadow-sm hover:bg-[#f1faf8]">
        <RotateCcw className="size-3" /> {t("Try again")}
      </button>
    </div>
  );
}

/** "SH" for "Sara Hassan". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** "Tue, March 18" in the page's language. */
export function sessionDate(startsUtc: string): string {
  return new Date(startsUtc).toLocaleDateString(dateLocale(), { weekday: "short", month: "long", day: "numeric" });
}

/** "4:00 – 4:45 PM" in the page's language. */
export function sessionTime(startsUtc: string, durationMinutes: number): string {
  const start = new Date(startsUtc);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const f = (d: Date) => d.toLocaleTimeString(dateLocale(), { hour: "numeric", minute: "2-digit" });
  return `${f(start)} – ${f(end)}`;
}

/** "14:05" for today, otherwise "24 Oct". */
export function shortTime(utc: string): string {
  const d = new Date(utc);
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" });
}
