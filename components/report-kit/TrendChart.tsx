"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { formatDay } from "./range";
import { KitEmpty, SERIES_COLORS, formatNumber } from "./ui";

export interface TrendSeries {
  key: string;
  label: string;
  color?: string;
}

export interface TrendPoint {
  key: string;
  /** The x-axis label (e.g. "6 Oct"). */
  label: string;
  /** Longer label for the tooltip (e.g. "Week of 6 Oct"). */
  title?: string;
  values: Record<string, number | null | undefined>;
}

const H = 240;
const PAD = { start: 44, end: 14, top: 14, bottom: 30 };

/** A rounded-up axis maximum and its tick step (1, 2 or 5 × 10ⁿ). */
function niceScale(max: number, ticks = 4) {
  if (max <= 0) return { top: ticks, step: 1 };
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  return { top: Math.ceil(max / step) * step, step };
}

/**
 * Multi-series line chart (one shared y-axis) with a hover/keyboard tooltip and legend toggles.
 * Responsive (measures its width), and in right-to-left pages time runs from right to left.
 */
export function TrendChart({ points, series, empty, defaultHidden = [], height = H, ariaLabel }: {
  points: TrendPoint[];
  series: TrendSeries[];
  empty?: ReactNode;
  defaultHidden?: string[];
  height?: number;
  ariaLabel?: string;
}) {
  const { t, intl, dir } = useI18n();
  const rtl = dir === "rtl";
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set(defaultHidden));
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const colored = useMemo(() => series.map((s, i) => ({ ...s, color: s.color ?? SERIES_COLORS[i % SERIES_COLORS.length] })), [series]);
  const visible = colored.filter((s) => !hidden.has(s.key));
  const hasData = points.some((p) => series.some((s) => p.values[s.key] != null));

  // Hidden (e.g. while printing) has no width: draw at a fixed size, the SVG scales to its box.
  const W = Math.max(280, width || 720);
  const plotW = W - PAD.start - PAD.end;
  const plotH = height - PAD.top - PAD.bottom;
  const max = Math.max(0, ...points.flatMap((p) => visible.map((s) => p.values[s.key] ?? 0)));
  const { top, step } = niceScale(max);
  const n = points.length;
  const xl = (i: number) => PAD.start + (n <= 1 ? plotW / 2 : (i * plotW) / (n - 1));
  const x = (i: number) => (rtl ? W - xl(i) : xl(i));
  const y = (v: number) => PAD.top + plotH - (v / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 64))));
  const fmt = (v: number | null | undefined) => formatNumber(v ?? null, intl);

  const toggle = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else if (series.length - next.size > 1) next.add(key);
      return next;
    });

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * W) / rect.width;
    let best = 0;
    for (let i = 1; i < n; i++) if (Math.abs(x(i) - px) < Math.abs(x(best) - px)) best = i;
    setActive(n ? best : null);
  };

  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    const later = rtl ? "ArrowLeft" : "ArrowRight";
    const earlier = rtl ? "ArrowRight" : "ArrowLeft";
    if (e.key === later) setActive((a) => Math.min(n - 1, a == null ? 0 : a + 1));
    else if (e.key === earlier) setActive((a) => Math.max(0, a == null ? n - 1 : a - 1));
    else if (e.key === "Escape") setActive(null);
    else return;
    e.preventDefault();
  };

  if (!hasData) return <KitEmpty>{empty}</KitEmpty>;

  const path = (key: string) => {
    let d = "";
    let pen = false;
    points.forEach((p, i) => {
      const v = p.values[key];
      if (v == null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  const tip = active != null ? points[active] : null;
  const tipLeft = active != null ? (x(active) / W) * 100 : 0;

  return (
    <div className="min-w-0">
      {series.length > 1 && (
        <ul className="rk-no-print mb-[0.8em] flex flex-wrap gap-[0.5em]" aria-label={t("Show or hide a line")}>
          {colored.map((s) => {
            const on = !hidden.has(s.key);
            return (
              <li key={s.key}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.key)}
                  className={cn(
                    "inline-flex items-center gap-[0.45em] rounded-full border px-[0.8em] py-[0.3em] text-[0.76em] font-medium transition-colors",
                    on ? "border-[#d6dde6] bg-white text-[#1b2d54]" : "border-dashed border-[#d6dde6] bg-[#f6f9fb] text-[#94a3b8]",
                  )}
                >
                  <span aria-hidden className="size-[0.7em] rounded-full" style={{ backgroundColor: on ? s.color : "#cbd5e1" }} />
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {/* The legend while printing: only the lines that are shown. */}
      {series.length > 1 && (
        <p className="rk-print-only mb-[0.6em] hidden flex-wrap gap-[1em] text-[0.76em] text-[#1b2d54]">
          {visible.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-[0.4em]">
              <span aria-hidden className="size-[0.7em] rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </p>
      )}
      <div ref={wrap} className="relative w-full">
        <svg
          viewBox={`0 0 ${W} ${height}`}
          className="block h-auto w-full touch-pan-y overflow-visible outline-none focus-visible:ring-2 focus-visible:ring-[#0f7378]/30"
          role="img"
          aria-label={ariaLabel}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          {Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step).map((v) => (
            <g key={v}>
              <line x1={PAD.start} x2={W - PAD.end} y1={y(v)} y2={y(v)} stroke={v === 0 ? "#cbd5e1" : "#eef2f6"} strokeWidth={1} transform={rtl ? `translate(${PAD.end - PAD.start} 0)` : undefined} />
              <text x={rtl ? W - PAD.start + 8 : PAD.start - 8} y={y(v)} dy="0.32em" textAnchor={rtl ? "start" : "end"} fontSize="11" fill="#64748b">
                {fmt(v)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={p.key} x={x(i)} y={height - 8} textAnchor="middle" fontSize="11" fill="#64748b">
                {p.label}
              </text>
            ) : null,
          )}
          {active != null && <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + plotH} stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1} />}
          {visible.map((s) => (
            <g key={s.key}>
              <path d={path(s.key)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {points.map((p, i) => {
                const v = p.values[s.key];
                if (v == null || (n > 16 && i !== active)) return null;
                return <circle key={p.key} cx={x(i)} cy={y(v)} r={i === active ? 4.5 : 3} fill={s.color} stroke="#fff" strokeWidth={2} />;
              })}
            </g>
          ))}
        </svg>
        {tip && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 min-w-[10em] rounded-[0.8em] border border-[#e6ebf1] bg-white px-[0.8em] py-[0.6em] text-[0.76em] shadow-lg"
            style={{ left: `${tipLeft}%`, transform: `translateX(${tipLeft < 25 ? "8px" : tipLeft > 75 ? "calc(-100% - 8px)" : "-50%"})` }}
          >
            <p className="mb-[0.3em] font-semibold text-[#1b2d54]">{tip.title ?? tip.label}</p>
            <ul className="space-y-[0.2em]">
              {visible.map((s) => (
                <li key={s.key} className="flex items-center gap-[0.5em]">
                  <span aria-hidden className="size-[0.65em] rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="flex-1 text-[#475467]">{s.label}</span>
                  <b className="text-[#1b2d54]">{fmt(tip.values[s.key])}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <table className="sr-only">
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th scope="col">{t("Period")}</th>
            {colored.map((s) => <th key={s.key} scope="col">{s.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.key}>
              <th scope="row">{p.title ?? p.label}</th>
              {colored.map((s) => <td key={s.key}>{fmt(p.values[s.key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Chart points from weekly trend buckets ({ start, values }). */
export function weeklyPoints(
  series: { start: string; values: Record<string, number | null | undefined> }[],
  intl: string,
  t: (text: string, vars?: Record<string, string>) => string,
): TrendPoint[] {
  return series.map((b) => {
    const label = formatDay(b.start, intl);
    return { key: b.start, label, title: t("Week of {date}", { date: label }), values: b.values };
  });
}
