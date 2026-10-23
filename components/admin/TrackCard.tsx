import Link from "next/link";
import type { Route } from "next";
import { Eye } from "lucide-react";

export type Track = {
  id: number;
  name: string;
  students: number;
  squads: number;
  progress: number; // 0-100
};

export function TrackCard({ track }: { track: Track }) {
  return (
    <article className="flex min-w-0 flex-col rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.12)]">
      <header className="flex items-start justify-between gap-[0.8em]">
        <div className="min-w-0">
          <h3 className="text-[1.25em] font-bold leading-tight text-[#0b1b2b]">{track.name}</h3>
          <p className="mt-[0.5em] text-[0.95em] leading-snug text-[#8a97a6]">{track.students} Students</p>
          <p className="text-[0.95em] leading-snug text-[#8a97a6]">{track.squads} Squads</p>
        </div>

        <Link
          href={`/admin/tracks/${track.id}` as Route}
          className="inline-flex shrink-0 items-center gap-[0.5em] rounded-[0.6em] bg-[#00c9b1] px-[1.3em] py-[0.7em] text-[0.95em] font-semibold text-white shadow-sm hover:bg-[#00b39d]"
        >
          <Eye className="size-[1em] text-[#1d4ed8]" /> View
        </Link>
      </header>

      <p className="mt-[1.1em] text-[0.9em] text-[#8a97a6]">{track.progress}%</p>

      <div
        role="progressbar"
        aria-valuenow={track.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${track.name} progress`}
        className="mt-[0.3em] h-[0.5em] overflow-hidden rounded-full bg-[#e6edf3]"
      >
        <div className="h-full rounded-full bg-[#8cc63f]" style={{ width: `${track.progress}%` }} />
      </div>

      <p className="mt-[0.3em] text-right text-[0.65em] font-medium text-[#f5a623]">Updating</p>
    </article>
  );
}