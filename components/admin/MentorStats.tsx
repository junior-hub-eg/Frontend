"use client";

import { CalendarClock, CircleCheck, Star, UsersRound } from "lucide-react";
import type { AdminMentorsPage } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export function MentorStats({ stats, className = "" }: { stats: AdminMentorsPage["stats"] | null; className?: string }) {
  const t = useT();
  const items = [
    { label: tk("Total Mentors"), value: stats?.totalMentors, icon: UsersRound, bg: "bg-white/10" },
    { label: tk("Active Mentors"), value: stats?.activeMentors, icon: CircleCheck, bg: "bg-[#cfe9dc]/70" },
    { label: tk("Upcoming Sessions"), value: stats?.upcomingSessions, icon: CalendarClock, bg: "bg-[#f3b9be]/60" },
    { label: tk("Avg Rating"), value: stats?.averageRating, icon: Star, bg: "bg-[#f0e8a6]/75" },
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
            <span className="block text-[1.15em] font-bold leading-tight text-[#0b1b2b]">{s.value ?? "—"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
