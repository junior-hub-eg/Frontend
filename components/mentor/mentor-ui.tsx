import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Colors taken from the Figma mentor workspace. */
export const M = {
  navy: "#14305a",
  teal: "#0f8f8c",
  mint: "#e9f7f4",
  line: "#dbe8e6",
};

export function Avatar({ initials, size = "md", className }: { initials: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const box = size === "lg" ? "size-14 text-lg" : size === "sm" ? "size-8 text-[0.65rem]" : "size-10 text-xs";
  return (
    <span aria-hidden className={cn("grid shrink-0 place-items-center rounded-xl bg-[#0f8f8c] font-bold text-white", box, className)}>
      {initials}
    </span>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("rounded-2xl border border-white bg-white p-5 shadow-[0_4px_18px_rgba(20,48,90,0.06)]", className)}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#0f8f8c]">{children}</p>;
}

export function PageHeading({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-1 text-3xl font-bold text-[#14305a]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-xl text-sm text-[#14305a]/65">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

const PILL: Record<string, string> = {
  teal: "bg-[#d5f0eb] text-[#0b7a77]",
  navy: "bg-[#14305a] text-white",
  amber: "bg-[#fff1d6] text-[#a86a00]",
  gray: "bg-[#e8eef0] text-[#14305a]/70",
};

export function Pill({ tone = "teal", children }: { tone?: keyof typeof PILL; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold", PILL[tone])}>{children}</span>;
}

export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#14305a] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0e2444] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f8f8c]";
export const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#cfe0dd] bg-white px-4 py-2.5 text-sm font-semibold text-[#14305a] transition-colors hover:bg-[#f1faf8] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f8f8c]";
export const fieldCls =
  "w-full rounded-xl border border-[#cfe0dd] bg-white px-3.5 py-2.5 text-sm text-[#14305a] outline-none placeholder:text-[#14305a]/40 focus:border-[#0f8f8c] focus:ring-2 focus:ring-[#0f8f8c]/20";

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("size-3.5", value >= i - 0.25 ? "fill-[#f5b301] text-[#f5b301]" : "text-[#cfd9dd]")} />
      ))}
    </span>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint: string }) {
  return (
    <div className="grid place-items-center gap-2 px-6 py-16 text-center">
      <span className="grid size-10 place-items-center rounded-full bg-[#e3f4f1] text-[#0f8f8c]">{icon}</span>
      <p className="text-sm font-bold text-[#14305a]">{title}</p>
      <p className="max-w-xs text-xs text-[#14305a]/60">{hint}</p>
    </div>
  );
}
