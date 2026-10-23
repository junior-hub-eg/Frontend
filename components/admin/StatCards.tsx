import { AlertTriangle, BarChart3, Users } from "lucide-react";

const STATS = {
  activeStudents: { change: "+30%" },
  pendingReviews: { count: 420 },
  unmonitored: { count: 2 },
};

export function StatCards({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      {/* Active students */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#cfe9dc]/70 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">Active Students</h2>
        <div className="my-[0.4em] flex flex-1 items-center justify-center gap-[1.2em]">
          <BarChart3 className="size-[3.2em] text-[#0f7378]" strokeWidth={2.6} />
          <span className="text-[1.4em] font-medium text-[#0b1b2b]">{STATS.activeStudents.change}</span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">Change VS last week</p>
      </li>

      {/* Pending reviews */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#c4e8dc]/70 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">Pending Reviews</h2>
        <span className="mt-[0.5em] inline-flex w-fit items-center gap-[0.4em] rounded-full bg-[#0b1b2b] px-[0.8em] py-[0.15em] text-[0.7em] font-semibold text-[#f5b72b]">
          <span className="size-[0.6em] rounded-full bg-[#f5b72b]" /> Pending
        </span>
        <span className="mt-[0.4em] inline-block w-fit rounded-full bg-[#0b1b2b] px-[0.9em] py-[0.1em] text-[1.1em] font-bold text-[#f5b72b]">
          {STATS.pendingReviews.count}
        </span>
        <p className="mt-auto pt-[0.4em] text-center text-[0.75em] text-[#0b1b2b]/85">Change VS last week</p>
      </li>

      {/* Avg squads */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#f3b9be]/75 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">Avg Squads</h2>
        <div className="my-[0.4em] grid flex-1 place-items-center">
          <span className="grid size-[4em] place-items-center rounded-full bg-[#a6d6d0]/85">
            <Users className="size-[2.1em] text-[#0f7378]" strokeWidth={1.8} />
          </span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">Change VS last week</p>
      </li>

      {/* Squads without monitor */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#f0e8a6]/80 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">Squads without monitor</h2>
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.9em] py-[0.15em] text-[0.7em] font-semibold text-[#c0392b]">
            <AlertTriangle className="size-[1em]" /> Waiting
          </span>
          <span className="text-[2.6em] font-medium leading-none text-[#0b1b2b]">{STATS.unmonitored.count}</span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">Change VS last week</p>
      </li>
    </ul>
  );
}