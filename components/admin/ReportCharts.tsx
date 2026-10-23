"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Presentation } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

const DARK = [500, 970, 600, 750, 600, 1000, 500];
const LIGHT = [1000, 560, 50, 250, 800, 800, 330];

const SKILLS = [
  { name: "Beginner", value: 15, color: "#f5b72b" },
  { name: "Intermediate", value: 8, color: "#12676b" },
  { name: "Advanced", value: 32, color: "#1a2b57" },
  { name: "", value: 20, color: "#d9f3ee" },
  { name: "", value: 25, color: "#2fb5b5" },
];

const LEGEND = [
  { name: tk("Beginner"), color: "#f5b72b" },
  { name: tk("Intermediate"), color: "#1a2b57" },
  { name: tk("Advanced"), color: "#2fb5b5" },
];

const card = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.1)]";

/** Measures an element so the charts can draw at its real pixel size. */
function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

function PerformanceChart({ w, h, label }: { w: number; h: number; label: string }) {
  if (w < 40 || h < 40) return null;
  const L = 34;
  const R = 10;
  const T = 10;
  const B = 22;
  const x = (i: number) => L + (i / 6) * (w - L - R);
  const y = (v: number) => T + (h - T - B) - (v / 1000) * (h - T - B);
  const poly = (vals: number[]) =>
    `${x(0)},${y(0)} ${vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")} ${x(6)},${y(0)}`;

  return (
    <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
      {[0, 250, 500, 750, 1000].map((tick) => (
        <g key={tick}>
          <line x1={L} x2={w - R} y1={y(tick)} y2={y(tick)} stroke="#e6edf3" />
          <text x={L - 8} y={y(tick) + 3.5} textAnchor="end" fontSize="10" fill="#8a97a6">
            {tick}
          </text>
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>
          <line x1={x(i)} x2={x(i)} y1={y(0)} y2={y(0) + 4} stroke="#cfd8e1" />
          <text x={x(i)} y={h - 5} textAnchor="middle" fontSize="10" fill="#8a97a6">
            {i}
          </text>
        </g>
      ))}
      <polygon points={poly(DARK)} fill="#12676b" />
      <polygon points={poly(LIGHT)} fill="#7fddc9" fillOpacity={0.92} />
    </svg>
  );
}

function Donut({ size, label }: { size: number; label: string }) {
  if (size < 40) return null;
  const r = 38;
  const c = 2 * Math.PI * r;
  const total = SKILLS.reduce((a, s) => a + s.value, 0);
  let offset = 0;

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <g transform="rotate(-90 60 60)">
        {SKILLS.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="22"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </g>
    </svg>
  );
}

export function ReportCharts({ className = "" }: { className?: string }) {
  const t = useT();
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();

  return (
    <div className={`grid gap-[1.4em] lg:grid-cols-[minmax(0,1.67fr)_minmax(0,1fr)] ${className}`}>
      {/* Overall performance */}
      <article className={`${card} flex h-[21em] min-w-0 flex-col p-[1.2em] lg:h-[23em]`}>
        <header className="flex shrink-0 items-center gap-[0.7em]">
          <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef2f6]">
            <BarChart3 className="size-[1.1em] text-[#14365a]" />
          </span>
          <h2 className="max-w-[16em] text-[1.05em] font-bold leading-tight text-[#14365a]">
            {t("Overall Student Performance Over Time")}
          </h2>
        </header>
        <div ref={chartRef} className="relative mt-[0.7em] min-h-0 flex-1">
          <PerformanceChart w={chartBox.w} h={chartBox.h} label={t("Overall Student Performance Over Time")} />
        </div>
      </article>

      {/* Track completion ratio */}
      <article className={`${card} flex h-[21em] min-w-0 flex-col p-[1.2em] lg:h-[23em]`}>
        <header className="flex shrink-0 items-center gap-[0.7em]">
          <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef2f6]">
            <Presentation className="size-[1.1em] text-[#14365a]" />
          </span>
          <h2 className="text-[1.05em] font-bold leading-tight text-[#14365a]">{t("Track Completion Ratio")}</h2>
        </header>

        <div ref={donutRef} className="relative mt-[0.5em] min-h-0 flex-1">
          <Donut size={Math.min(donutBox.w, donutBox.h) * 0.8} label={t("Track Completion Ratio")} />
        </div>

        <ul className="mx-auto mt-[0.5em] shrink-0 space-y-[0.35em] text-[0.8em] text-[#14365a]">
          {LEGEND.map((s) => (
            <li key={s.name} className="flex items-center gap-[0.9em]">
              <span className="w-[7.5em] text-end">{t(s.name)}</span>
              <span className="size-[0.65em] rounded-full" style={{ backgroundColor: s.color }} />
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}