"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BarChart3 } from "lucide-react";
import { StatCards } from "./StatCards";

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
  { name: "Beginner", color: "#f5b72b" },
  { name: "Intermediate", color: "#1a2b57" },
  { name: "Advanced", color: "#2fb5b5" },
];

const card = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

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

function SprintChart({ w, h }: { w: number; h: number }) {
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
    <svg width={w} height={h} role="img" aria-label="Sprint progress over time" className="absolute inset-0">
      {[0, 250, 500, 750, 1000].map((t) => (
        <g key={t}>
          <line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke="#e6edf3" />
          <text x={L - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#8a97a6">
            {t}
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

function SkillDonut({ size }: { size: number }) {
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
      aria-label="Skill distribution"
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

export default function AdminDashboard() {
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();

  return (
    <div className="relative min-w-0 flex-1 bg-[#eef3fa] xl:absolute xl:inset-0">
      {/*
        < xl : normal flow, the shell scrolls (Quick Management comes after this page)
        xl+  : fills the height left by the pinned Quick Management; hero and charts share it
      */}
      <div
        className="relative flex min-w-0 flex-col px-3 pb-2 sm:px-4 lg:p-0 xl:absolute xl:inset-0 xl:overflow-hidden"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {/* ---------- Hero ---------- */}
        <section className="relative shrink-0 overflow-hidden rounded-[1.2em] lg:rounded-none xl:min-h-0 xl:flex-[11] xl:shrink">
          <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className="object-cover" />

          <div className="relative z-10 flex h-full min-h-[18em] flex-col px-[1.2em] pb-[1.3em] pt-[calc(var(--u)*5.4)] sm:px-[1.6em] sm:pb-[1.5em] xl:min-h-0">
            <h1 className="shrink-0 text-[1.9em] font-extrabold leading-none text-[#0f7378] sm:text-[2.2em] xl:text-[2.5em]">
              Dashboard Overview
            </h1>
            <StatCards className="mt-auto pt-[1.2em]" />
          </div>
        </section>

        {/* ---------- Charts ---------- */}
        <section className="mt-[1.3em] grid shrink-0 gap-[1.2em] px-0 lg:grid-cols-[minmax(0,1.67fr)_minmax(0,1fr)] lg:px-[4%] xl:min-h-0 xl:flex-[9] xl:shrink xl:px-[8%]">
          <article className={`${card} flex min-h-[15em] min-w-0 flex-col p-[1.2em] lg:min-h-[18em] xl:min-h-0`}>
            <header className="flex shrink-0 items-center gap-[0.7em]">
              <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#14365a]">
                <BarChart3 className="size-[1.1em] text-white" />
              </span>
              <h2 className="text-[1.05em] font-bold text-[#14365a]">Sprint Progress Over Time</h2>
            </header>
            <div ref={chartRef} className="relative mt-[0.7em] min-h-0 flex-1">
              <SprintChart w={chartBox.w} h={chartBox.h} />
            </div>
          </article>

          <article className={`${card} flex min-h-[19em] min-w-0 flex-col p-[1.2em] lg:min-h-[18em] xl:min-h-0`}>
            <header className="flex shrink-0 items-center gap-[0.7em]">
              <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#eef2f6]">
                <BarChart3 className="size-[1.1em] text-[#14365a]" />
              </span>
              <h2 className="text-[1.05em] font-bold text-[#14365a]">Skill Distribution</h2>
            </header>

            <div ref={donutRef} className="relative mt-[0.5em] min-h-[9em] flex-1 xl:min-h-0">
              <SkillDonut size={Math.min(donutBox.w, donutBox.h) * 0.92} />
            </div>

            <ul className="mx-auto mt-[0.5em] shrink-0 space-y-[0.35em] text-[0.8em] text-[#14365a]">
              {LEGEND.map((s) => (
                <li key={s.name} className="flex items-center gap-[0.9em]">
                  <span className="w-[7.5em] text-right">{s.name}</span>
                  <span className="size-[0.65em] rounded-full" style={{ backgroundColor: s.color }} />
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}