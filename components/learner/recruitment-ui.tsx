import type { ReactNode } from "react";
import { CheckCircle2, FlaskConical, RotateCcw, Send } from "lucide-react";
import type { MyApplication } from "@/lib/recruitment-api";

/** Next to the sidebar and under the top bar, like the AI Curriculum pages, and scrolls on its own. */
export function RecruitmentFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative -ml-[4rem] min-h-[calc(100svh-5rem)] min-w-0 flex-1 bg-[#fbfdff] lg:absolute lg:inset-0 lg:ml-0 lg:min-h-0">
      <div
        className="relative min-w-0 pb-8 pl-[4.75rem] pr-3 pt-2 sm:pr-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:pl-[var(--hl)] lg:pr-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*6.5)]"
        style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
      >
        {children}
      </div>
    </div>
  );
}

/** BR-12: every Recruitment screen says it is a simulation. */
export function SimulationBadge() {
  return (
    <span className="inline-flex items-center gap-[0.35em] self-start rounded-full bg-[#fff1d6] px-[0.8em] py-[0.25em] text-[0.75em] font-bold uppercase tracking-wide text-[#a86a00]">
      <FlaskConical className="h-[1.1em] w-[1.1em]" aria-hidden /> Simulation
    </span>
  );
}

/** The company's first letter on a coloured square (the companies are fictional, so there are no logos). */
export function CompanyMark({ name, className = "" }: { name: string; className?: string }) {
  const colors = ["#e6f0fd", "#ddf5f7", "#e6f6ee", "#fdeee6", "#efe8fb", "#fff4d6"];
  const color = colors[[...name].reduce((sum, c) => sum + c.charCodeAt(0), 0) % colors.length];
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-[0.9em] text-[1.4em] font-extrabold text-[#14365a] ${className}`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </span>
  );
}

export function ApplicationBadge({ application }: { application: MyApplication | null }) {
  if (!application) return null;
  if (application.status === "InterviewPassed")
    return (
      <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#d8f0df] px-[0.7em] py-[0.2em] text-[0.75em] font-bold text-[#1f7a43]">
        <CheckCircle2 className="h-[1.1em] w-[1.1em]" /> Passed · {application.bestScorePercent}%
      </span>
    );
  if (application.status === "InterviewNotPassed")
    return (
      <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#fff1d6] px-[0.7em] py-[0.2em] text-[0.75em] font-bold text-[#a86a00]">
        <RotateCcw className="h-[1em] w-[1em]" /> Try again · best {application.bestScorePercent}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-[0.3em] rounded-full bg-[#e3eefd] px-[0.7em] py-[0.2em] text-[0.75em] font-bold text-[#2f6fc4]">
      <Send className="h-[1em] w-[1em]" /> Applied
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return <span className="rounded-[0.5em] bg-[#eaf3fb] px-[0.6em] py-[0.3em] text-[0.75em] font-semibold text-[#14365a]">{children}</span>;
}
