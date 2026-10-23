import Link from "next/link";
import type { Route } from "next";
import { CirclePlus } from "lucide-react";
import { AdminPage, PageHero } from "./AdminPage";
import { TrackStats } from "./TrackStats";
import { TrackCard, type Track } from "./TrackCard";

const TRACKS: Track[] = [
  { id: 1, name: "UI\\UX Design Track", students: 120, squads: 12, progress: 95 },
  { id: 2, name: "Marketing", students: 120, squads: 12, progress: 95 },
  { id: 3, name: "Python Data Science", students: 120, squads: 12, progress: 95 },
  { id: 4, name: "Cyber Security", students: 120, squads: 12, progress: 95 },
  { id: 5, name: "AI", students: 120, squads: 12, progress: 95 },
  { id: 6, name: "Machine Learning", students: 120, squads: 12, progress: 95 },
];

export default function AdminTracks() {
  const firstRow = TRACKS.slice(0, 3); // sit on the hero
  const secondRow = TRACKS.slice(3); // narrower, below

  return (
    <AdminPage>
      <PageHero title="Track Management" contentClassName="pb-0">
        <TrackStats className="mt-[1.6em] lg:w-[85%]" />

        <div className="mt-[1.2em] flex justify-end">
          <Link
            href={"/admin/tracks/new" as Route}
            className="inline-flex items-center gap-[0.6em] rounded-[0.6em] bg-[#00c9b1] px-[1.2em] py-[0.6em] text-[0.9em] font-semibold text-white shadow-sm hover:bg-[#00b39d]"
          >
            <CirclePlus className="size-[1.05em] text-[#1d4ed8]" /> Add new track
          </Link>
        </div>

        <div className="relative -mb-[3.2em] mt-[0.8em] grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3">
          {firstRow.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      </PageHero>

      <div className="mx-auto mt-[5em] w-full lg:w-[76%]">
        <div className="grid gap-[1.4em] sm:grid-cols-2 lg:grid-cols-3">
          {secondRow.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      </div>
    </AdminPage>
  );
}