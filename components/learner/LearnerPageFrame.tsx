import type { ReactNode } from "react";

/**
 * The learner shell fills the whole frame on desktop, so a page places itself next to the
 * sidebar and under the top bar (like the Internship page) and scrolls on its own.
 */
export function LearnerPageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col pb-6 pe-3 sm:pe-4 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pb-[calc(var(--u)*2)] lg:ps-[var(--hl)] lg:pe-[calc(var(--u)*1.6)] lg:pt-[calc(var(--u)*7.5)] lg:transition-[padding] lg:duration-300">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] shadow-[0_10px_40px_rgba(20,54,90,0.08)]">{children}</div>
    </div>
  );
}
