"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { KitEmpty } from "./ui";

export interface Column<R> {
  key: string;
  header: ReactNode;
  render: (row: R) => ReactNode;
  /** The value to sort by; the column is not sortable without it. */
  sortValue?: (row: R) => string | number | null;
  align?: "start" | "end" | "center";
  className?: string;
}

/** A table with sortable headers (click to sort, again to reverse) and an empty state. */
export function DataTable<R>({ columns, rows, rowKey, empty, initialSort, minWidth = "32em", rowClassName }: {
  columns: Column<R>[];
  rows: R[];
  rowKey: (row: R, index: number) => string;
  empty?: ReactNode;
  initialSort?: { key: string; desc?: boolean };
  minWidth?: string;
  rowClassName?: (row: R) => string | undefined;
}) {
  const { t, intl } = useI18n();
  const [sort, setSort] = useState<{ key: string; desc: boolean } | null>(initialSort ? { key: initialSort.key, desc: !!initialSort.desc } : null);

  const sorted = useMemo(() => {
    const col = sort && columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const get = col.sortValue;
    const collator = new Intl.Collator(intl, { numeric: true, sensitivity: "base" });
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va == null && vb == null) return 0;
      if (va == null) return 1; // empty values last either way
      if (vb == null) return -1;
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : collator.compare(String(va), String(vb));
      return sort!.desc ? -cmp : cmp;
    });
  }, [rows, columns, sort, intl]);

  if (rows.length === 0) return <KitEmpty>{empty ?? t("Nothing to show for this period.")}</KitEmpty>;

  const align = (a?: "start" | "end" | "center") => (a === "end" ? "text-end" : a === "center" ? "text-center" : "text-start");

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[0.82em]" style={{ minWidth }}>
        <thead>
          <tr className="bg-[#f6f9fb] text-[0.86em] font-semibold text-[#475467]">
            {columns.map((c, i) => {
              const active = sort?.key === c.key;
              const Icon = !active ? ArrowUpDown : sort!.desc ? ArrowDown : ArrowUp;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort!.desc ? "descending" : "ascending") : undefined}
                  className={cn("px-[0.9em] py-[0.75em]", align(c.align), i === 0 && "rounded-s-[0.7em]", i === columns.length - 1 && "rounded-e-[0.7em]")}
                >
                  {c.sortValue ? (
                    <button
                      type="button"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, desc: !s.desc } : { key: c.key, desc: false }))}
                      className="inline-flex items-center gap-[0.35em] hover:text-[#1b2d54]"
                    >
                      {c.header}
                      <Icon aria-hidden className={cn("rk-no-print size-[1em]", active ? "text-[#0f7378]" : "text-[#94a3b8]")} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={rowKey(r, i)} className={cn("rk-avoid border-b border-[#eef2f6] last:border-0", rowClassName?.(r))}>
              {columns.map((c) => (
                <td key={c.key} className={cn("px-[0.9em] py-[0.75em] text-[#1b2d54]", align(c.align), c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
