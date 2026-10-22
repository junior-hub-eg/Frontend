"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * MOCK availability, like the Figma: school days from today on, except a deterministic handful.
 * Replace with the mentor's real calendar.
 */
export function isDayAvailable(date: Date, today: Date) {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  return date >= today && !weekend && (date.getDate() * 3 + date.getMonth()) % 11 !== 0;
}

export function isSameDay(a: Date | null, b: Date) {
  return !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface BookingCalendarProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

/** Month grid. Client-only (uses the current date) — render it after mount to avoid hydration mismatches. */
export function BookingCalendar({ selected, onSelect }: BookingCalendarProps) {
  const { t, intl } = useI18n();
  const [today] = useState(() => startOfDay(new Date()));
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const prevDays = new Date(cursor.year, cursor.month, 0).getDate();
  const lead = first.getDay();
  const trail = (7 - ((lead + daysInMonth) % 7)) % 7;
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.year, cursor.month, i + 1));
  const open = days.filter((d) => isDayAvailable(d, today)).length;
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  return (
    <div className="rounded-2xl bg-[#F6F9FB] p-4">
      <div className="mb-3 flex items-center gap-2">
        <p className="text-base font-semibold text-[#1b2a5c]">{first.toLocaleDateString(intl, { month: "long", year: "numeric" })}</p>
        <span className="rounded-full bg-[#DDF3E7] px-2 py-0.5 text-[9px] font-semibold text-[#1E9D5B]">{t("{n} youth slots open", { n: open })}</span>
        <div className="ms-auto flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={isCurrentMonth}
            aria-label={t("Previous month")}
            className="grid size-7 place-items-center rounded-full bg-white text-[#1b2a5c] shadow-sm hover:bg-[#E9F7F4] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label={t("Next month")}
            className="grid size-7 place-items-center rounded-full bg-white text-[#1b2a5c] shadow-sm hover:bg-[#E9F7F4]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-[#1b2a5c]/60">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1.5">
            {t(d)}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: lead }, (_, i) => (
          <span key={`p${i}`} className="grid h-10 place-items-center text-[11px] text-[#1b2a5c]/25">
            {prevDays - lead + i + 1}
          </span>
        ))}
        {days.map((date) => {
          const available = isDayAvailable(date, today);
          const isSelected = isSameDay(selected, date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!available}
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={date.toLocaleDateString(intl, { weekday: "long", month: "long", day: "numeric" })}
              className={cn(
                "relative mx-auto grid h-10 w-10 place-items-center rounded-xl text-[11px] font-semibold transition-colors",
                isSelected
                  ? "bg-[#0f6b60] text-white shadow-md"
                  : available
                    ? "text-[#1b2a5c] hover:bg-[#E9F7F4]"
                    : "font-normal text-[#1b2a5c]/30",
              )}
            >
              {date.getDate()}
              {available && (
                <span className={cn("absolute bottom-1.5 size-1 rounded-full", isSelected ? "bg-white" : "bg-[#0f6b60]")} aria-hidden />
              )}
            </button>
          );
        })}
        {Array.from({ length: trail }, (_, i) => (
          <span key={`n${i}`} className="grid h-10 place-items-center text-[11px] text-[#1b2a5c]/25">
            {i + 1}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-[#1b2a5c]/60">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#0f6b60]" /> {t("Available")}</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#12939b]" /> {t("Selected Day")}</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-[#1b2a5c]/20" /> {t("Unavailable")}</span>
      </div>
    </div>
  );
}
