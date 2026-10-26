"use client";

import type { ReactNode } from "react";
import { CalendarRange } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { RANGE_PRESETS, formatRange, isoDay, presetRange, type DateRange, type RangePreset } from "./range";
import { FilterSelect } from "./ui";

/**
 * The bar above a report: title, the date range (presets or custom), the page's own filters
 * (`filters`, e.g. squad or class) and its actions (`actions`, e.g. the export menu).
 */
export function ReportHeader({ title, subtitle, range, onRangeChange, filters, actions, className }: {
  title?: ReactNode;
  subtitle?: ReactNode;
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
  filters?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const { t, intl } = useI18n();
  const today = isoDay(new Date());
  const pick = (preset: RangePreset) => onRangeChange(preset === "custom" ? { ...range, preset } : presetRange(preset));
  const setDay = (key: "from" | "to", value: string) => {
    if (!value) return;
    const next = { ...range, preset: "custom" as const, [key]: value };
    if (next.from > next.to) {
      if (key === "from") next.to = value;
      else next.from = value;
    }
    onRangeChange(next);
  };

  return (
    <section className={cn("rk-no-print rounded-[1.2em] border border-[#e6ebf1] bg-white p-[1.2em] shadow-[0_10px_34px_rgba(20,54,90,0.07)]", className)}>
      {(title || subtitle) && (
        <div className="mb-[0.9em]">
          {title && <h2 className="text-[1.05em] font-bold text-[#1b2d54]">{title}</h2>}
          {subtitle && <p className="mt-[0.15em] text-[0.8em] text-[#64748b]">{subtitle}</p>}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-[0.7em]">
        <div className="flex min-w-0 flex-wrap items-center gap-[0.6em]">
          {filters}
          <FilterSelect label={t("Period")} value={range.preset} onChange={pick} options={RANGE_PRESETS.map((p) => ({ value: p.value, label: t(p.label) }))} />
          {range.preset === "custom" ? (
            <span className="flex flex-wrap items-center gap-[0.4em] text-[0.82em] text-[#1b2d54]">
              <input
                type="date"
                aria-label={t("From")}
                value={range.from}
                max={today}
                onChange={(e) => setDay("from", e.target.value)}
                className="h-[2.6em] rounded-[0.7em] border border-[#d6dde6] bg-white px-[0.6em] outline-none focus:ring-2 focus:ring-[#0f7378]/30"
              />
              <span aria-hidden>–</span>
              <input
                type="date"
                aria-label={t("To")}
                value={range.to}
                max={today}
                onChange={(e) => setDay("to", e.target.value)}
                className="h-[2.6em] rounded-[0.7em] border border-[#d6dde6] bg-white px-[0.6em] outline-none focus:ring-2 focus:ring-[#0f7378]/30"
              />
            </span>
          ) : (
            <span className="flex items-center gap-[0.4em] text-[0.8em] text-[#64748b]">
              <CalendarRange aria-hidden className="size-[1.1em]" />
              {formatRange(range.from, range.to, intl)}
            </span>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-[0.6em]">{actions}</div>}
      </div>
    </section>
  );
}
