"use client";

import { useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  Bug,
  Code2,
  Gamepad2,
  LoaderCircle,
  Monitor,
  PenTool,
  Play,
  Server,
  Smartphone,
} from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import { mediaUrl } from "@/lib/learning-api";

const TRACK_ICONS: Record<string, ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  smartphone: Smartphone,
  monitor: Monitor,
  server: Server,
  "pen-tool": PenTool,
  brain: Brain,
  bug: Bug,
  "bar-chart": BarChart3,
  gamepad: Gamepad2,
};

export function TrackIcon({ iconKey, size = 40 }: { iconKey: string; size?: number }) {
  const Icon = TRACK_ICONS[iconKey] ?? Code2;
  return <Icon size={size} strokeWidth={1.6} />;
}

export const minutes = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} min`;

/** Loading, not found and error states for the course pages. */
export function LoadState({ error, onRetry, backHref = "/learner/courses" }: { error?: unknown; onRetry?: () => void; backHref?: string }) {
  if (!error) {
    return (
      <div className="grid flex-1 place-items-center py-20" role="status" aria-label="Loading">
        <LoaderCircle className="size-8 animate-spin text-[#12939b]" />
      </div>
    );
  }
  const notFound = error instanceof ApiError && error.status === 404;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-20 text-center">
      <p className="text-lg font-bold text-[#1b2a5c]">{notFound ? "We couldn't find this page" : "Something went wrong"}</p>
      <p className="text-sm text-[#1b2a5c]/65">{errorMessage(error, "We couldn't load this page. Please try again.")}</p>
      <div className="mt-2 flex gap-3">
        <Link href={backHref as Route} className="inline-flex items-center gap-1.5 rounded-lg border border-[#12939b] px-4 py-2 text-xs font-semibold text-[#12939b]">
          <ArrowLeft aria-hidden size={14} /> Back to courses
        </Link>
        {!notFound && onRetry && (
          <button type="button" onClick={onRetry} className="rounded-lg bg-[#12939b] px-4 py-2 text-xs font-semibold text-white">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A video that reports how much was watched (in steps of 10%, only when it goes up). When the file cannot be
 * played, the student can still mark it as watched so the next step unlocks.
 */
export function VideoPlayer({
  src,
  poster,
  title,
  watchedPercent = 0,
  onProgress,
}: {
  src: string;
  poster?: string | null;
  title: string;
  watchedPercent?: number;
  onProgress: (percent: number) => Promise<unknown> | void;
}) {
  const reported = useRef(watchedPercent);
  const [failed, setFailed] = useState(false);
  const [marking, setMarking] = useState(false);
  const [watched, setWatched] = useState(watchedPercent >= 100);

  function report(percent: number) {
    const step = percent >= 90 ? 100 : Math.floor(percent / 10) * 10;
    if (step <= reported.current) return;
    reported.current = step;
    void onProgress(step);
  }

  if (failed) {
    return (
      <div className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-linear-to-br from-[#1b2a5c] to-[#14757d] p-6 text-center text-white">
        <span className="grid size-14 place-items-center rounded-full bg-white/20">
          <Play size={24} className="fill-white" />
        </span>
        <p className="text-sm font-semibold">{title}</p>
        <p className="max-w-xs text-[11px] text-white/70">This video isn&apos;t available to play yet.</p>
        {!watched && (
          <button
            type="button"
            disabled={marking}
            onClick={async () => {
              setMarking(true);
              reported.current = 100;
              try {
                await onProgress(100);
                setWatched(true);
              } catch {
                reported.current = watchedPercent;
              } finally {
                setMarking(false);
              }
            }}
            className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-[#1b2a5c] disabled:opacity-60"
          >
            {marking ? "Saving…" : "Mark as watched"}
          </button>
        )}
      </div>
    );
  }

  return (
    <video
      controls
      preload="metadata"
      src={mediaUrl(src)}
      poster={poster ? mediaUrl(poster) : undefined}
      aria-label={title}
      onError={() => setFailed(true)}
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (v.duration > 0) report((v.currentTime / v.duration) * 100);
      }}
      onEnded={() => report(100)}
      className="aspect-video w-full rounded-2xl bg-[#1b2a5c]"
    />
  );
}

type GraphSpec = { equation: string; xRange: [number, number]; yRange: [number, number]; xLabel?: string; yLabel?: string; point?: [number, number] };

/** Reads "a*x+b" (the only kind of graph the lessons have) without evaluating any code. */
function linear(equation: string): ((x: number) => number) | null {
  const m = /^\s*(-?\d*\.?\d+)?\s*\*?\s*x\s*(?:([+-])\s*(\d*\.?\d+))?\s*$/.exec(equation);
  if (!m) return null;
  const a = m[1] === undefined ? 1 : Number(m[1]);
  const b = m[3] === undefined ? 0 : Number(m[3]) * (m[2] === "-" ? -1 : 1);
  return (x) => a * x + b;
}

/** The school link's graph (SchoolLink.graphSpec), drawn as a small SVG. */
export function LinearGraph({ spec }: { spec: string }) {
  let g: GraphSpec;
  try {
    g = JSON.parse(spec) as GraphSpec;
  } catch {
    return null;
  }
  const f = g?.equation ? linear(g.equation) : null;
  if (!f || !g.xRange || !g.yRange) return null;

  const W = 280, H = 180, P = 24;
  const [x0, x1] = g.xRange, [y0, y1] = g.yRange;
  const sx = (x: number) => P + ((x - x0) / (x1 - x0)) * (W - 2 * P);
  const sy = (y: number) => H - P - ((y - y0) / (y1 - y0)) * (H - 2 * P);
  const axisX = Math.min(Math.max(0, y0), y1), axisY = Math.min(Math.max(0, x0), x1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Graph of y = ${g.equation}`} className="w-full max-w-[320px]">
      <rect x="0" y="0" width={W} height={H} rx="12" fill="#ffffff" />
      <line x1={P} x2={W - P} y1={sy(axisX)} y2={sy(axisX)} stroke="#1b2a5c" strokeOpacity="0.3" />
      <line x1={sx(axisY)} x2={sx(axisY)} y1={P} y2={H - P} stroke="#1b2a5c" strokeOpacity="0.3" />
      <line x1={sx(x0)} y1={sy(f(x0))} x2={sx(x1)} y2={sy(f(x1))} stroke="#12939b" strokeWidth="2.5" />
      {g.point && (
        <>
          <circle cx={sx(g.point[0])} cy={sy(g.point[1])} r="4.5" fill="#1b2a5c" />
          <text x={sx(g.point[0]) + 7} y={sy(g.point[1]) + 14} fontSize="10" fill="#1b2a5c">
            ({g.point[0]}, {g.point[1]})
          </text>
        </>
      )}
      <text x={W - P} y={sy(axisX) - 5} fontSize="10" textAnchor="end" fill="#1b2a5c" fillOpacity="0.6">
        {g.xLabel ?? "x"}
      </text>
      <text x={sx(axisY) + 5} y={P + 4} fontSize="10" fill="#1b2a5c" fillOpacity="0.6">
        {g.yLabel ?? "y"}
      </text>
    </svg>
  );
}
