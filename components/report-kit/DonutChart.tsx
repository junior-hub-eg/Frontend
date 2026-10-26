"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import { KitEmpty, SERIES_COLORS, formatNumber } from "./ui";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color?: string;
}

/** A donut with the total (or `center`) in the middle and a legend with values and shares. */
export function DonutChart({ segments, center, centerLabel, empty, size = 9 }: {
  segments: DonutSegment[];
  center?: ReactNode;
  centerLabel?: ReactNode;
  empty?: ReactNode;
  /** Diameter in em. */
  size?: number;
}) {
  const { intl } = useI18n();
  const [hover, setHover] = useState<string | null>(null);
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  if (total === 0) return <KitEmpty>{empty}</KitEmpty>;

  const r = 40;
  const c = 2 * Math.PI * r;
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 1.2 : 0;
  const lengths = segments.map((s) => (Math.max(0, s.value) / total) * c);
  const arcs = segments.map((s, i) => ({
    ...s,
    color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length],
    dash: Math.max(0, lengths[i] - gap),
    offset: lengths.slice(0, i).reduce((a, b) => a + b, 0),
  }));
  const active = arcs.find((a) => a.key === hover);

  return (
    <div className="flex flex-wrap items-center gap-[1.2em]">
      <div className="relative shrink-0" style={{ width: `${size}em`, height: `${size}em` }}>
        <svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={segments.map((s) => `${s.label}: ${s.value}`).join(", ")}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="#eef2f6" strokeWidth="14" />
          {arcs.map((a) => a.value > 0 && (
            <circle
              key={a.key}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={hover === a.key ? 16 : 14}
              strokeDasharray={`${a.dash} ${c - a.dash}`}
              strokeDashoffset={-a.offset}
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover(null)}
              className="transition-[stroke-width]"
            />
          ))}
        </svg>
        <span className="absolute inset-0 grid place-items-center text-center leading-tight">
          <span>
            <span className="block text-[1.3em] font-extrabold text-[#1b2d54]">
              {active ? `${formatNumber((active.value / total) * 100, intl, 0)}%` : (center ?? formatNumber(total, intl))}
            </span>
            <span className="block max-w-[6em] truncate text-[0.68em] text-[#64748b]">{active ? active.label : centerLabel}</span>
          </span>
        </span>
      </div>
      <ul className="min-w-[10em] flex-1 space-y-[0.5em] text-[0.8em]">
        {arcs.map((a) => (
          <li key={a.key} className="flex items-center gap-[0.5em]" onMouseEnter={() => setHover(a.key)} onMouseLeave={() => setHover(null)}>
            <span aria-hidden className="size-[0.75em] shrink-0 rounded-[0.2em]" style={{ backgroundColor: a.color }} />
            <span className="min-w-0 flex-1 truncate text-[#1b2d54]">{a.label}</span>
            <span className="font-semibold text-[#1b2d54]">{formatNumber(a.value, intl)}</span>
            <span className="w-[3.2em] text-end text-[#64748b]">{formatNumber((a.value / total) * 100, intl, 0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
