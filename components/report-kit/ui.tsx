"use client";

import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Report design kit (shared look with the admin Analytics page): white cards with soft shadows,
 * navy ink and teal accents. Sizes are in em so the kit follows each area's base font size.
 */

/** Categorical series colours, in fixed order (checked for colour-blind separation and contrast on white). */
export const SERIES_COLORS = ["#00949a", "#eb6834", "#2a78d6", "#c2417a", "#6250d6", "#008300"] as const;

export const INK = "#1b2d54";
export const MUTED = "#64748b";
export const ACCENT = "#0f7378";

export function ReportCard({ children, className, title, hint, action }: { children: ReactNode; className?: string; title?: ReactNode; hint?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("rk-avoid min-w-0 rounded-[1.2em] border border-[#e6ebf1] bg-white p-[1.3em] shadow-[0_10px_34px_rgba(20,54,90,0.07)]", className)}>
      {(title || action) && (
        <div className="mb-[1em] flex flex-wrap items-start justify-between gap-[0.6em]">
          <div className="min-w-0">
            {title && <h2 className="text-[1.05em] font-bold text-[#1b2d54]">{title}</h2>}
            {hint && <p className="mt-[0.15em] text-[0.8em] text-[#64748b]">{hint}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** A labelled native select that looks like the filter pills ("Squad: All squads ⌄"). */
export function FilterSelect<T extends string>({ label, value, options, onChange, className }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; className?: string;
}) {
  return (
    <label className={cn("relative flex h-[2.6em] items-center gap-[0.4em] rounded-[0.7em] border border-[#d6dde6] bg-white ps-[0.9em] pe-[2.2em] text-[0.82em] text-[#1b2d54] focus-within:ring-2 focus-within:ring-[#0f7378]/30", className)}>
      <span className="shrink-0 text-[#64748b]">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="absolute inset-0 cursor-pointer appearance-none bg-transparent opacity-0"
        aria-label={label}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="truncate font-semibold">{options.find((o) => o.value === value)?.label ?? value}</span>
      <ChevronDown aria-hidden className="pointer-events-none absolute end-[0.7em] size-[1em] text-[#64748b]" />
    </label>
  );
}

export function KitSkeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-[0.6em] bg-[#e9eef4]", className)} />;
}

/** A soft inline error with a retry button, used inside kit cards. */
export function KitError({ text, onRetry, retryLabel }: { text: string; onRetry?: () => void; retryLabel: string }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.9em] bg-[#fdf1f1] px-[1em] py-[0.8em] text-[0.82em] text-[#b42318]">
      <span>{text}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="rounded-full bg-white px-[0.9em] py-[0.3em] font-semibold text-[#1b2d54] shadow-sm hover:bg-[#f7f9fc]">
          {retryLabel}
        </button>
      )}
    </div>
  );
}

export function KitEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-[0.9em] bg-[#f6f9fb] px-[1em] py-[2em] text-center text-[0.82em] text-[#64748b]">{children}</p>;
}

/** Formats a number for the page language (Latin digits in both). */
export function formatNumber(n: number | null | undefined, intl: string, digits = 1): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(intl, { maximumFractionDigits: digits });
}
