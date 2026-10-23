"use client";

import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";

/** Same white card the dashboard uses. */
export const CARD = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

export type HeroStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  valueClass?: string;
};

/** Title + stat chips on the park picture, then the page content below (built on page-parts). */
export function AdminPageHero({
  title,
  stats,
  children,
}: {
  title: string;
  stats: HeroStat[];
  children: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <AdminPage>
      <AdminHero>
        <div className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[0.8em]">
          <h1 className="text-[1.9em] font-extrabold leading-none text-[#0f7378] sm:text-[2.2em] xl:text-[2.5em]">
            {t(title)}
          </h1>

          <ul className="flex flex-wrap gap-[0.6em]">
            {stats.map((s) => (
              <li
                key={s.label}
                className="flex items-center gap-[0.6em] rounded-[0.9em] border border-white/70 bg-white/55 px-[0.9em] py-[0.45em] shadow-sm backdrop-blur"
              >
                <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-white/80 text-[#14365a]">
                  <s.icon className="size-[1.1em]" />
                </span>

                <span className="leading-tight">
                  <span className="block text-[0.7em] text-[#14365a]/60">{t(s.label)}</span>
                  <span className={`block text-[1em] font-bold ${s.valueClass ?? "text-[#14365a]"}`}>
                    {s.value}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </AdminHero>

      <AdminBody>{children}</AdminBody>
    </AdminPage>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${CARD} p-[1.2em] ${className}`}>{children}</div>;
}

export function AdminDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button
        type="button"
        aria-label={t("Close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#14365a]/40 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(title)}
        className="relative w-full max-w-md rounded-2xl bg-white p-5 text-[#14365a] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{t(title)}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="grid size-8 place-items-center rounded-full hover:bg-[#eef4fa]"
          >
            <X className="size-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "green" | "amber"; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${
        tone === "green" ? "bg-[#c9f0d2] text-[#1b7a3a]" : "bg-[#fde7b0] text-[#9a6200]"
      }`}
    >
      {children}
    </span>
  );
}

export const FIELD =
  "h-9 w-full rounded-xl border border-[#cfe0ee] bg-white px-3 text-[0.8rem] text-[#14365a] outline-none focus:ring-2 focus:ring-[#12939b]/40";