"use client";

import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getMonitorFeedback } from "@/lib/monitor-api";
import { Avatar, Card, Eyebrow, PageHeading, Pill, Stars } from "./mentor-ui";
import { LoadState, useMentorData } from "./mentor-data";
import { cn } from "@/lib/utils";

const FILTERS = ["All", "5 stars", "4 stars"] as const;

export default function MentorFeedback() {
  const t = useT();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const { data, error, reload } = useMentorData(getMonitorFeedback, tk("Could not load your feedback."));
  if (!data) return <LoadState error={error} onRetry={reload} />;
  const list = data.items.filter((f) => filter === "All" || Math.floor(f.rating) === (filter === "5 stars" ? 5 : 4));

  return (
    <>
      <PageHeading eyebrow={t("Feedback")} title={t("Student feedback")} subtitle={t("See what students have said about your sessions and understand how you are doing.")} />

      <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
        <Card className="flex flex-col items-center justify-center text-center">
          <Eyebrow>{t("Overall rating")}</Eyebrow>
          <p className="mt-1 text-5xl font-bold">{data.overallRating.toFixed(1)}</p>
          <Stars value={data.overallRating} />
          <p className="mt-2 text-xs text-[#14305a]/60">{t("Based on {n} student ratings", { n: data.totalReviews })}</p>
        </Card>
        <div className="flex items-center gap-4 rounded-2xl bg-[#14305a] p-6 text-white">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#3cc4bd] text-[#14305a]"><Lock className="size-5" /></span>
          <div>
            <h2 className="text-lg font-bold">{t("Private and respectful")}</h2>
            <p className="mt-1 text-xs text-white/70">{t("Feedback is shared to help you improve. Students are not shown your notes, and you cannot see private details.")}</p>
          </div>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Eyebrow>{t("Recent feedback")}</Eyebrow>
            <h2 className="text-lg font-bold">{t("What students shared")}</h2>
          </div>
          <div role="group" aria-label={t("Filter feedback")} className="flex gap-1">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", filter === f ? "border-[#0f8f8c] bg-[#0f8f8c] text-white" : "border-[#cfe0dd] bg-white hover:bg-[#f1faf8]")}>
                {t(f)}
              </button>
            ))}
          </div>
        </div>
        {list.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#14305a]/60">{t("No feedback matches this filter.")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-[#e6efed]">
            {list.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar initials={f.initials} size="sm" />
                <div className="min-w-[10rem] flex-1">
                  <p className="text-sm font-semibold">{f.student} <span className="text-xs font-normal text-[#14305a]/55">· {t(f.track)}</span></p>
                  {f.comment && <p className="text-xs text-[#14305a]/70">{f.comment}</p>}
                </div>
                <div className="flex items-center gap-2"><Stars value={f.rating} /><span className="text-xs font-semibold">{f.rating.toFixed(1)}</span></div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="flex items-center gap-2 text-xs text-[#14305a]/55"><ShieldCheck className="size-3.5" /> <Pill tone="gray">{t("Safe mentorship")}</Pill></p>
    </>
  );
}
