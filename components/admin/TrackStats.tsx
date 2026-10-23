"use client";

import { CircleCheck, Clock, ListChecks, Star } from "lucide-react";
import type { AdminTracksPage } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export function TrackStats({ stats, className = "" }: { stats: AdminTracksPage["stats"] | null; className?: string }) {
  const t = useT();
  const items = [
    { label: tk("Total Tracks"), value: stats?.totalTracks, icon: ListChecks, bg: "bg-white/10" },
    { label: tk("Active Sprints"), value: stats?.activeSprints, icon: CircleCheck, bg: "bg-[#cfe9dc]/70" },
    { label: tk("Avg Completion"), value: stats ? `${stats.averageCompletion}%` : undefined, icon: Clock, bg: "bg-[#f3b9be]/60" },
    { label: tk("Top Track"), value: stats ? (stats.topTrack ?? "—") : undefined, icon: Star, bg: "bg-[#f0e8a6]/75" },
  ];

  return (
    <ul className={`grid grid-cols-2 gap-[1em] lg:grid-cols-4 ${className}`} aria-busy={!stats}>
      {items.map((s) => (
        <li
          key={s.label}
          className={`flex items-center gap-[0.8em] rounded-[0.9em] border border-white/45 px-[1em] py-[0.7em] backdrop-blur-[3px] ${s.bg}`}
        >
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-white/90 text-[#14365a]">
            <s.icon className="size-[1.15em]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.7em] text-[#14365a]/80">{t(s.label)}</span>
            <span className="block truncate text-[1.05em] font-bold leading-tight text-[#0b1b2b]">{s.value ?? "—"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
