"use client";

import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { MOCK_NOTIF_TABS } from "../dashboardMock";

export type NotifTab = "all" | "sent" | "scheduled" | "drafts";

/** Search and tabs are live. The three dropdowns are visual for now (TODO(api)). */
export function NotificationFilters({ tab, onTab, query, onQuery, onReset }: { tab: NotifTab; onTab: (v: NotifTab) => void; query: string; onQuery: (v: string) => void; onReset: () => void }) {
  const t = useT();
  const tabs: { key: NotifTab; label: string }[] = [
    { key: "all", label: t("All") },
    { key: "sent", label: t("Sent") },
    { key: "scheduled", label: t("Scheduled") },
    { key: "drafts", label: t("Drafts") },
  ];
  const selects = [
    [t("Audience"), t("All Audiences")],
    [t("Channel"), t("All Channels")],
    [t("Cohort"), t("All Tracks")],
  ];

  return (
    <div className={`${PANEL} grid gap-[0.8em] p-[1em]`}>
      <div className="flex flex-wrap items-center gap-[0.8em]">
        <label className="relative min-w-[14em] flex-1">
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("Search broadcasts, topics, tags...")}
            className="h-[2.6em] w-full rounded-[0.7em] bg-[#f1f5fd] ps-[2.6em] pe-[1em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
          />
        </label>
        <div role="tablist" className="flex gap-[0.3em] rounded-[0.7em] bg-[#eef3fa] p-[0.25em] text-[0.75em]">
          {tabs.map((x) => (
            <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} onClick={() => onTab(x.key)} className={`rounded-[0.5em] px-[0.9em] py-[0.5em] font-semibold ${tab === x.key ? "bg-white text-[#0b6f86] shadow-sm" : "text-[#14365a]"}`}>
              {x.label} ({MOCK_NOTIF_TABS[x.key].toLocaleString()})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[0.6em]">
        {selects.map(([label, value]) => (
          <label key={label} className="relative">
            <select aria-label={label} className="h-[2.4em] appearance-none rounded-[0.6em] bg-[#eef3fa] ps-[0.9em] pe-[2em] text-[0.75em] font-semibold text-[#14365a] outline-none">
              <option>{`${label}: ${value}`}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-[0.6em] top-1/2 size-[1em] -translate-y-1/2" />
          </label>
        ))}
        <button type="button" onClick={onReset} className="ms-auto inline-flex items-center gap-[0.4em] text-[0.75em] font-semibold text-[#0b6f86]">
          <RotateCcw className="size-[1em]" /> {t("Reset Filters")}
        </button>
      </div>
    </div>
  );
}