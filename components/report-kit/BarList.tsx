"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import { KitEmpty, SERIES_COLORS, formatNumber } from "./ui";

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  /** Text after the bar instead of the value (e.g. "4 tasks · 12 pts"). */
  display?: string;
  leading?: ReactNode;
  color?: string;
}

/** Horizontal bars, one per row, scaled to `max` (default: the largest value). Bars grow from the start side. */
export function BarList({ items, max, suffix = "", empty, valueWidth = "7em" }: { items: BarItem[]; max?: number; suffix?: string; empty?: ReactNode; valueWidth?: string }) {
  const { intl } = useI18n();
  if (items.length === 0) return <KitEmpty>{empty}</KitEmpty>;
  const top = Math.max(1, max ?? Math.max(...items.map((i) => i.value)));
  return (
    <ul className="space-y-[0.75em]">
      {items.map((item) => {
        const width = Math.min(100, Math.max(0, (item.value / top) * 100));
        return (
          <li key={item.key} className="flex items-center gap-[0.7em] text-[0.82em]" title={`${formatNumber(item.value, intl)}${suffix}`}>
            {item.leading}
            <span className="w-[9em] shrink-0 truncate text-[#1b2d54]" dir="auto">{item.label}</span>
            <span className="relative h-[0.6em] min-w-[3em] flex-1 overflow-hidden rounded-full bg-[#eef2f6]">
              <span
                className="absolute inset-y-0 start-0 rounded-full"
                style={{ width: `${Math.max(width, item.value > 0 ? 2 : 0)}%`, backgroundColor: item.color ?? SERIES_COLORS[0] }}
              />
            </span>
            <span className="shrink-0 text-end text-[0.92em] font-medium text-[#475467]" style={{ width: valueWidth }}>
              {item.display ?? `${formatNumber(item.value, intl)}${suffix}`}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
