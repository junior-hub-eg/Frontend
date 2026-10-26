import { tk } from "@/lib/i18n/translate";

/** A report date range: a preset or a custom from/to, both as yyyy-MM-dd (local dates, inclusive). */
export type RangePreset = "7d" | "30d" | "12w" | "month" | "custom";
export interface DateRange {
  preset: RangePreset;
  from: string;
  to: string;
}

export const RANGE_PRESETS: { value: RangePreset; label: string }[] = [
  { value: "7d", label: tk("Last 7 days") },
  { value: "30d", label: tk("Last 30 days") },
  { value: "12w", label: tk("Last 12 weeks") },
  { value: "month", label: tk("This month") },
  { value: "custom", label: tk("Custom") },
];

const pad = (n: number) => String(n).padStart(2, "0");
export const isoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** yyyy-MM-dd as a local date (new Date("yyyy-MM-dd") would be UTC midnight). */
export function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function presetRange(preset: Exclude<RangePreset, "custom">, today = new Date()): DateRange {
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const from = new Date(to);
  if (preset === "7d") from.setDate(from.getDate() - 6);
  else if (preset === "30d") from.setDate(from.getDate() - 29);
  else if (preset === "12w") from.setDate(from.getDate() - 83);
  else from.setDate(1);
  return { preset, from: isoDay(from), to: isoDay(to) };
}

export const defaultRange = (): DateRange => presetRange("12w");

/** "3 Oct – 26 Oct 2026" in the given locale. */
export function formatRange(from: string, to: string, intl: string): string {
  const a = parseDay(from);
  const b = parseDay(to);
  const sameYear = a.getFullYear() === b.getFullYear();
  const left = a.toLocaleDateString(intl, { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
  const right = b.toLocaleDateString(intl, { day: "numeric", month: "short", year: "numeric" });
  return `${left} – ${right}`;
}

export const formatDay = (iso: string, intl: string) => parseDay(iso).toLocaleDateString(intl, { day: "numeric", month: "short" });
