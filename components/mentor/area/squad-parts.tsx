"use client";

import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Code2, HeartPulse, PenTool, Puzzle, Rocket, Sparkles, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import type { SquadRow } from "@/lib/monitor-api";
import { cn } from "@/lib/utils";
import { LevelBadge, ProgressBar, SquadStatePill, WarningCount } from "../mentor-area-ui";

const ICONS = [HeartPulse, Code2, BarChart3, PenTool, Rocket, Puzzle, Sparkles, Users];
const TILES = [
  "from-[#ff9f1c] to-[#ff6b00]",
  "from-[#14365a] to-[#0f6b70]",
  "from-[#8b5cf6] to-[#6d28d9]",
  "from-[#3b82f6] to-[#1e3a8a]",
  "from-[#14b8a6] to-[#0f766e]",
  "from-[#ec4899] to-[#be185d]",
];

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/** The squad's round icon, the same colour and picture every time. */
export function SquadIcon({ id, className }: { id: string; className?: string }) {
  const h = hash(id);
  const Icon = ICONS[h % ICONS.length];
  return (
    <span className={cn("grid size-[2.6em] shrink-0 place-items-center rounded-full bg-gradient-to-br text-white shadow-sm", TILES[h % TILES.length], className)}>
      <Icon className="size-[1.2em]" strokeWidth={2} />
    </span>
  );
}

export function useSquadText() {
  const { t, intl } = useI18n();
  const day = (iso: string) => new Date(iso).toLocaleDateString(intl, { month: "short", day: "numeric" });
  return {
    /** "Submitted Oct 18", "12 days left" or "Completed Oct 2". */
    sprintNote(row: SquadRow) {
      if (row.completedUtc) return t("Completed {date}", { date: day(row.completedUtc) });
      if (row.submittedUtc) return t("Submitted {date}", { date: day(row.submittedUtc) });
      if (row.daysLeft != null) return row.daysLeft === 0 ? t("Ends today") : t("{n} days left", { n: row.daysLeft });
      return "";
    },
    day,
  };
}

/** A squad card of the Overview (M1) and the cards view of My squads (M2). */
export function SquadCard({ row, compact = false }: { row: SquadRow; compact?: boolean }) {
  const { t } = useI18n();
  const text = useSquadText();
  return (
    <Link
      href={`/mentor/squads/${row.id}` as Route}
      className="block rounded-[1.3em] bg-white p-[1.3em] shadow-[0_10px_40px_rgba(20,54,90,0.08)] ring-1 ring-transparent transition hover:ring-[#bfe4e1]"
    >
      <div className="flex items-start gap-[0.8em]">
        <SquadIcon id={row.id} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[1.05em] font-bold text-[#1b2d54]">{row.name}</h3>
          <p className="truncate text-[0.82em] text-[#64748b]">{row.projectTitle}</p>
        </div>
        {compact ? <WarningCount n={row.warnings} /> : <LevelBadge level={row.level} />}
      </div>
      <div className="mt-[0.9em] flex flex-wrap items-center gap-[0.5em]">
        {compact && <LevelBadge level={row.level} />}
        <SquadStatePill state={row.state} />
      </div>
      <div className="mt-[1em] flex items-center justify-between gap-2 text-[0.82em]">
        <span className="font-semibold text-[#1b2d54]">
          {row.sprintName ?? t("No sprint")}
          {!compact && ` · ${row.progress}%`}
          {compact && <span className="ms-[0.6em] font-normal text-[#64748b]">{text.sprintNote(row)}</span>}
        </span>
        <span className={compact ? "font-semibold text-[#1b2d54]" : "text-[#64748b]"}>{compact ? `${row.progress}%` : text.sprintNote(row)}</span>
      </div>
      <ProgressBar value={row.progress} className="mt-[0.6em]" />
      <div className={cn("mt-[0.9em] flex items-center justify-between text-[0.8em] text-[#475467]", compact && "border-t border-[#eef2f6] pt-[0.9em]")}>
        {compact ? (
          <>
            <Faces row={row} />
            <span>
              {t("Submitted")} <b className="text-[#1b2d54]">{t("{a} of {b}", { a: row.submittedCount, b: row.memberCount })}</b>
            </span>
          </>
        ) : (
          <span className="flex items-center gap-[1.2em]">
            <span className="flex items-center gap-[0.4em]">
              <Users className="size-[1.1em]" /> {t("{n} students", { n: row.memberCount })}
            </span>
            <span className="flex items-center gap-[0.4em]">
              <span className="grid size-[1.1em] place-items-center rounded-full border border-[#0f7378] text-[0.7em] text-[#0f7378]">✓</span>
              {t("{a} of {b} submitted", { a: row.submittedCount, b: row.memberCount })}
            </span>
          </span>
        )}
      </div>
    </Link>
  );
}

function Faces({ row }: { row: SquadRow }) {
  return (
    <span className="inline-flex items-center">
      {row.members.slice(0, 3).map((m) => (
        <span key={m.id} className="-me-[0.45em] inline-block size-[1.9em] overflow-hidden rounded-full bg-[#ffd38a] ring-2 ring-white">
          {m.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photoUrl} alt="" className="size-full object-cover" />
          ) : null}
        </span>
      ))}
      {row.members.length > 3 && <span className="ms-[0.9em] text-[#64748b]">+{row.members.length - 3}</span>}
    </span>
  );
}

export { Faces as SquadFaces };
