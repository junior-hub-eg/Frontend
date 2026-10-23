"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import { LoaderCircle, RotateCcw } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { avatarOrDefault } from "@/lib/avatars";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import type { Gender, SchoolSubject } from "@/lib/teacher-api";
import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-2xl border border-[#e3ece9] bg-white p-4 shadow-sm", className)}>{children}</section>;
}

/** Loads one API call on mount; `reload` fetches again and `setData` takes what a save returned. */
export function useTeacherData<T>(load: () => Promise<T>, failMessage: string) {
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
export function LoadBlock({ error, onRetry, className }: { error: string | null; onRetry: () => void; className?: string }) {
  const t = useT();
  if (!error) {
    return (
      <div role="status" aria-label={t("Loading")} className={cn("grid place-items-center py-10", className)}>
        <LoaderCircle className="size-6 animate-spin text-[#14757d]" />
      </div>
    );
  }
  return (
    <div role="alert" className={cn("flex flex-wrap items-center justify-center gap-3 rounded-xl bg-[#fdecec] px-4 py-3 text-[11px] font-semibold text-[#c81e1e]", className)}>
      <span>{error}</span>
      <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[#1B2D54] shadow-sm">
        <RotateCcw className="size-3" /> {t("Try again")}
      </button>
    </div>
  );
}

export function StudentAvatar({
  name,
  photoUrl,
  gender,
  size = 36,
}: {
  name: string;
  photoUrl: string | null;
  gender: Gender | null;
  size?: number;
}) {
  const avatar = avatarOrDefault(photoUrl, name.length, gender);
  return (
    <span className="relative shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size, backgroundColor: avatar.bg }}>
      <Image src={avatar.src} alt="" fill sizes={`${size}px`} className="object-cover" />
    </span>
  );
}

export const SUBJECT_LABEL: Record<SchoolSubject, string> = {
  Math: tk("Mathematics"),
  Science: tk("Science"),
  Physics: tk("Physics"),
  Language: tk("Language"),
};

export const formatDate = (iso: string, withTime = false) =>
  new Date(iso).toLocaleString(dateLocale("en-GB"), {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });

/** For an <input type="datetime-local">: the local time, without seconds. */
export function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Monday of the week of a date, as yyyy-MM-dd. */
export function weekStartOf(date: Date) {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export const inputClass =
  "h-9 w-full rounded-lg border border-[#e3ece9] bg-[#f6f9f8] px-3 text-[11px] outline-none focus:ring-2 focus:ring-[#12939b]/40";

export function FieldLabel({ label, children, error }: { label: string; children: ReactNode; error?: string | null }) {
  const t = useT();
  return (
    <label className="grid gap-1 text-[10px] font-semibold text-[#1B2D54]/80">
      {label}
      {children}
      {error && <span className="font-normal text-[#c81e1e]">{t(error)}</span>}
    </label>
  );
}
