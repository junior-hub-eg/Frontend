"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** MOCK availability: every future day is open except a deterministic handful. Replace with the mentor's real calendar. */
export function isDayAvailable(date: Date, today: Date) {
  return date >= today && (date.getDate() * 3 + date.getMonth()) % 7 !== 0;
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
  const [today] = useState(() => startOfDay(new Date()));
  const [cursor, setCursor] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));

  const first = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(cursor.year, cursor.month, i + 1)),
  ];
  const isCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();

  function shift(delta: number) {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1b2a5c]">
          {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={isCurrentMonth}
            aria-label="Previous month"
            className="grid size-7 place-items-center rounded-md border border-[#dfe7e5] text-[#1b2a5c] hover:bg-[#E9F7F4] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            aria-label="Next month"
            className="grid size-7 place-items-center rounded-md border border-[#dfe7e5] text-[#1b2a5c] hover:bg-[#E9F7F4]"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-[#1b2a5c]/50">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={`blank-${i}`} />;
          const available = isDayAvailable(date, today);
          const isSelected = isSameDay(selected, date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={!available}
              onClick={() => onSelect(date)}
              aria-pressed={isSelected}
              aria-label={date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              className={cn(
                "aspect-square rounded-lg text-xs font-medium transition-colors",
                isSelected
                  ? "bg-[#12939b] text-white"
                  : available
                    ? "bg-[#E9F7F4] text-[#1b2a5c] hover:bg-[#cdeee8]"
                    : "text-[#1b2a5c]/30"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-[10px] text-[#1b2a5c]/60">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#E9F7F4]" /> Available</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#1b2a5c]/20" /> Unavailable</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-[#12939b]" /> Selected</span>
      </div>
    </div>
  );
}
