"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { KitSkeleton, formatNumber } from "./ui";

/** The change from `previous` to `current` in percent; null when it cannot be computed. */
export function changePercent(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current == null || previous == null) return null;
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/**
 * One headline number with the previous period's value and the change in percent.
 * `value` may be preformatted text (e.g. "12 / 20"); then pass `previous` as null.
 */
export function KpiCard({ label, value, previous, suffix, icon, tint = "bg-[#e0f4f2] text-[#0f7378]", lowerIsBetter, loading, hint }: {
  label: string;
  value: number | string | null | undefined;
  previous?: number | null;
  suffix?: string;
  icon?: ReactNode;
  tint?: string;
  lowerIsBetter?: boolean;
  loading?: boolean;
  hint?: ReactNode;
}) {
  const { t, intl } = useI18n();
  const numeric = typeof value === "number" || value == null ? (value ?? null) : null;
  const shown = typeof value === "string" ? value : formatNumber(numeric, intl);
  const change = previous === undefined ? undefined : changePercent(numeric, previous);
  const up = change != null && change > 0.05;
  const down = change != null && change < -0.05;
  const good = lowerIsBetter ? down : up;
  const bad = lowerIsBetter ? up : down;
  const Arrow = up ? ArrowUp : down ? ArrowDown : Minus;

  return (
    <section className="rk-avoid min-w-0 rounded-[1.2em] border border-[#e6ebf1] bg-white p-[1.1em] shadow-[0_10px_34px_rgba(20,54,90,0.07)]">
      <div className="flex items-start justify-between gap-[0.5em]">
        <p className="min-w-0 text-[0.78em] font-semibold text-[#475467]">{label}</p>
        {icon && <span className={cn("grid size-[2.2em] shrink-0 place-items-center rounded-[0.7em]", tint)}>{icon}</span>}
      </div>
      {loading ? (
        <KitSkeleton className="mt-[0.6em] h-[1.8em] w-[60%]" />
      ) : (
        <p className="mt-[0.35em] text-[1.75em] font-extrabold leading-tight text-[#1b2d54]">
          {shown}
          {suffix && shown !== "—" && <span className="ms-[0.15em] text-[0.55em] font-semibold text-[#64748b]">{suffix}</span>}
        </p>
      )}
      {!loading && change !== undefined && (
        <p className="mt-[0.4em] flex flex-wrap items-center gap-[0.4em] text-[0.74em] text-[#64748b]">
          {change == null ? (
            <span className="rounded-full bg-[#f1f4f8] px-[0.6em] py-[0.15em] font-semibold text-[#475467]">{numeric ? t("New") : "—"}</span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-[0.2em] rounded-full px-[0.6em] py-[0.15em] font-semibold",
                good ? "bg-[#e3f6ea] text-[#167a3e]" : bad ? "bg-[#fde8e8] text-[#c81e1e]" : "bg-[#f1f4f8] text-[#475467]",
              )}
            >
              <Arrow aria-hidden className="size-[1em]" />
              <span dir="ltr">{`${change > 0 ? "+" : ""}${formatNumber(change, intl, 1)}%`}</span>
            </span>
          )}
          <span>{t("vs {value} before", { value: formatNumber(previous ?? null, intl) })}</span>
        </p>
      )}
      {hint && <p className="mt-[0.4em] text-[0.74em] text-[#64748b]">{hint}</p>}
    </section>
  );
}

/** A responsive row of KPI cards. */
export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rk-kpis grid grid-cols-2 gap-[0.9em] md:grid-cols-3 xl:grid-cols-6", className)}>{children}</div>;
}
