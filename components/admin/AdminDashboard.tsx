"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BarChart3 } from "lucide-react";
import { getAdminOverview, type AdminOverview } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { StatCards } from "./StatCards";
import { LoadState, useAdminData } from "./admin-data";

const LESSONS_COLOR = "#12676b";
const TASKS_COLOR = "#7fddc9";

/** Active student tracks by level; the colours of the legend. */
const LEVELS = [
  { key: "beginner", name: tk("Beginner"), color: "#f5b72b" },
  { key: "intermediate", name: tk("Intermediate"), color: "#1a2b57" },
  { key: "advanced", name: tk("Advanced"), color: "#2fb5b5" },
] as const;

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

/** A rounded top for the y axis: 4, 8, 20, 40, 100... */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

/** Lessons passed and squad tasks done on each of the last 7 days. */
function ActivityChart({ w, h, days, label }: { w: number; h: number; days: AdminOverview["activity"]; label: string }) {
  if (w < 40 || h < 40) return null;
  const DARK = days.map((d) => d.lessonsPassed);
  const LIGHT = days.map((d) => d.tasksDone);
  const max = niceMax(Math.max(...DARK, ...LIGHT, 1));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * max));
  const names = days.map((d) => new Date(`${d.date}T00:00:00`).toLocaleDateString(dateLocale(), { weekday: "short" }));
  const L = 34;
  const R = 10;
  const T = 10;
  const B = 22;
  const x = (i: number) => L + (i / 6) * (w - L - R);
  const y = (v: number) => T + (h - T - B) - (v / max) * (h - T - B);
  const poly = (vals: number[]) =>
    `${x(0)},${y(0)} ${vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")} ${x(6)},${y(0)}`;

  return (
    <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
      {ticks.map((t) => (
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
            {names[i]}
          </text>
        </g>
      ))}
      <polygon points={poly(DARK)} fill={LESSONS_COLOR} />
      <polygon points={poly(LIGHT)} fill={TASKS_COLOR} fillOpacity={0.85} />
    </svg>
  );
}

function SkillDonut({ size, levels, label }: { size: number; levels: AdminOverview["levels"]; label: string }) {
  if (size < 40) return null;
  const r = 38;
  const c = 2 * Math.PI * r;
  const SKILLS = LEVELS.map((l) => ({ value: levels[l.key], color: l.color }));
  const total = SKILLS.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
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

export default function AdminDashboard() {
  const { t } = useI18n();
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();
  const { data: overview, error, reload } = useAdminData(getAdminOverview, tk("We couldn't load the dashboard. Please try again."));

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
              {t("Dashboard Overview")}
            </h1>
            {error && <LoadState error={error} onRetry={reload} className="mt-[1em]" />}
            <StatCards overview={overview} className="mt-auto pt-[1.2em]" />
          </div>
        </section>

        {/* ---------- Charts ---------- */}
        <section className="mt-[1.3em] grid shrink-0 gap-[1.2em] px-0 lg:grid-cols-[minmax(0,1.67fr)_minmax(0,1fr)] lg:px-[4%] xl:min-h-0 xl:flex-[9] xl:shrink xl:px-[8%]">
          <article className={`${card} flex min-h-[15em] min-w-0 flex-col p-[1.2em] lg:min-h-[18em] xl:min-h-0`}>
            <header className="flex shrink-0 items-center gap-[0.7em]">
              <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#14365a]">
                <BarChart3 className="size-[1.1em] text-white" />
              </span>
              <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Activity in the last 7 days")}</h2>
            </header>
            <ul className="mt-[0.5em] flex shrink-0 flex-wrap gap-x-[1.2em] gap-y-[0.3em] text-[0.75em] text-[#14365a]">
              <li className="flex items-center gap-[0.4em]">
                <span className="size-[0.7em] rounded-full" style={{ backgroundColor: LESSONS_COLOR }} /> {t("Lessons passed")}
              </li>
              <li className="flex items-center gap-[0.4em]">
                <span className="size-[0.7em] rounded-full" style={{ backgroundColor: TASKS_COLOR }} /> {t("Squad tasks done")}
              </li>
            </ul>
            <div ref={chartRef} className="relative mt-[0.5em] min-h-0 flex-1">
              {overview ? (
                <ActivityChart w={chartBox.w} h={chartBox.h} days={overview.activity} label={t("Activity in the last 7 days")} />
              ) : (
                !error && <LoadState error={null} onRetry={reload} />
              )}
            </div>
          </article>

          <article className={`${card} flex min-h-[19em] min-w-0 flex-col p-[1.2em] lg:min-h-[18em] xl:min-h-0`}>
            <header className="flex shrink-0 items-center gap-[0.7em]">
              <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#eef2f6]">
                <BarChart3 className="size-[1.1em] text-[#14365a]" />
              </span>
              <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Skill Distribution")}</h2>
            </header>

            <div ref={donutRef} className="relative mt-[0.5em] min-h-[9em] flex-1 xl:min-h-0">
              {overview ? (
                <SkillDonut size={Math.min(donutBox.w, donutBox.h) * 0.92} levels={overview.levels} label={t("Skill Distribution")} />
              ) : (
                !error && <LoadState error={null} onRetry={reload} />
              )}
            </div>

            <ul className="mx-auto mt-[0.5em] shrink-0 space-y-[0.35em] text-[0.8em] text-[#14365a]">
              {LEVELS.map((s) => (
                <li key={s.key} className="flex items-center gap-[0.9em]">
                  <span className="w-[7.5em] text-end">{t(s.name)}</span>
                  <span className="size-[0.65em] rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="w-[2em] font-semibold">{overview ? overview.levels[s.key] : ""}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}