import { CircleCheck, Clock, ListChecks, Star } from "lucide-react";

const STATS = [
  { label: "Completion Rate", value: "80", icon: ListChecks, bg: "bg-white/10" },
  { label: "Active Engagement", value: "94%", icon: CircleCheck, bg: "bg-[#cfe9dc]/70" },
  { label: "Avg. Student Score", value: "91/100", icon: Clock, bg: "bg-[#f3b9be]/60" },
  { label: "Total Certificates Issued", value: "340", icon: Star, bg: "bg-[#f0e8a6]/75" },
];

export function ReportStats({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-[1em] lg:grid-cols-4 ${className}`}>
      {STATS.map((s) => (
        <li
          key={s.label}
          className={`flex items-center gap-[0.8em] rounded-[0.9em] border border-white/45 px-[1em] py-[0.7em] backdrop-blur-[3px] ${s.bg}`}
        >
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-white/90 text-[#14365a]">
            <s.icon className="size-[1.15em]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.7em] text-[#14365a]/80">{s.label}</span>
            <span className="block truncate text-[1.1em] font-bold leading-tight text-[#0b1b2b]">{s.value}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}