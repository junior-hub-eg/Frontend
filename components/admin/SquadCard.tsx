import Image from "next/image";

const AVATAR = "/images/Intern/char-boy-glasses.png"; // replace with the real mentor pictures

export type SquadStatus = "Active" | "Pending" | "Completed";

export type Squad = {
  id: number;
  name: string;
  status: SquadStatus;
  track: string;
  mentor: string;
  progress: number; // 0-100
  students: number;
  capacity: number;
};

const STATUS_STYLE: Record<SquadStatus, string> = {
  Active: "bg-[#c9f1dd] text-[#1a7f55]",
  Pending: "bg-[#ffb21f] text-white",
  Completed: "bg-[#2f9cf4] text-white",
};

export function SquadCard({ squad }: { squad: Squad }) {
  return (
    <article className="min-w-0 rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)]">
      <header className="flex items-start justify-between gap-[0.6em]">
        <h3 className="truncate text-[1.2em] font-bold text-[#0b1b2b]">{squad.name}</h3>
        <span className={`shrink-0 rounded-full px-[0.9em] py-[0.2em] text-[0.75em] font-semibold ${STATUS_STYLE[squad.status]}`}>
          {squad.status}
        </span>
      </header>

      <p className="mt-[0.2em] text-[0.8em] text-[#8a97a6]">{squad.track}</p>

      <p className="mt-[0.9em] flex items-center gap-[0.6em] text-[1.05em] font-medium text-[#14365a]">
        <span className="relative size-[1.8em] shrink-0 overflow-hidden rounded-full bg-[#ffc531]">
          <Image src={AVATAR} alt="" fill sizes="32px" className="origin-top scale-[2.1] object-cover object-top" />
        </span>
        <span className="truncate">Mentor: {squad.mentor}</span>
      </p>

      <div className="mt-[0.8em] flex items-center justify-between text-[0.75em] text-[#8a97a6]">
        <span>{squad.progress}%</span>
        <span>
          {squad.students}/{squad.capacity} Students
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={squad.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-[0.4em] h-[0.45em] overflow-hidden rounded-full bg-[#e6edf3]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#12a86b] to-[#7fddc9]"
          style={{ width: `${squad.progress}%` }}
        />
      </div>
    </article>
  );
}